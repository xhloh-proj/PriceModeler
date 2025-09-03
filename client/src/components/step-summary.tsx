import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, ChevronRight, TrendingUp, DollarSign, Target, Users, BarChart3, PieChart } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, ComposedChart, Line, Legend } from "recharts";

interface CostItem {
  id: string;
  name: string;
  monthlyAmounts: number[];
  icon: string;
  isCommon: boolean;
  unit?: string;
}

interface OneTimeCostItem {
  id: string;
  name: string;
  amount: number;
  icon: string;
  isCommon: boolean;
  month?: number;
}

interface SummaryData {
  // Product info
  productName: string;
  productCategory: string;
  description: string;
  
  // Cost data
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  oneTimeCosts: OneTimeCostItem[];
  
  // Demand data
  productDemand: number[];
  growthRate: number;
  
  // Pricing data
  recommendedPrice?: number;
}

interface StepSummaryProps {
  data: SummaryData;
  onPrevious: () => void;
  onSave: () => void;
  onExport: () => void;
}

export default function StepSummary({ data, onPrevious, onSave, onExport }: StepSummaryProps) {
  const [fixedCostExpanded, setFixedCostExpanded] = useState(false);
  const [variableCostExpanded, setVariableCostExpanded] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  // Calculate total costs over 5 years
  const calculateTotalCosts = () => {
    const fixedCostPerYear = data.fixedCosts.reduce((sum, cost) => 
      sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
    const variableCostPerYear = data.variableCosts.reduce((sum, cost) => 
      sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
    const oneTimeCosts = data.oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    const annualCosts = fixedCostPerYear + variableCostPerYear;
    const totalFiveYearCosts = (annualCosts * 5) + oneTimeCosts;
    
    return { annualCosts, totalFiveYearCosts, fixedCostPerYear, variableCostPerYear, oneTimeCosts };
  };

  // Calculate demand totals
  const calculateDemandTotals = () => {
    const totalDemand = data.productDemand.reduce((sum, demand) => sum + demand, 0);
    const avgAnnualDemand = totalDemand / 5;
    return { totalDemand, avgAnnualDemand };
  };

  // Calculate pricing recommendations
  const calculatePricingRecommendations = () => {
    const { totalFiveYearCosts } = calculateTotalCosts();
    const { totalDemand } = calculateDemandTotals();
    
    if (totalDemand === 0) return { breakeven: 0, target: 0, conservative: 0 };
    
    const breakevenPrice = totalFiveYearCosts / totalDemand;
    const targetPrice = breakevenPrice / 0.9; // 110% TCRR
    const conservativePrice = breakevenPrice / 1.1; // 90% TCRR
    
    return {
      breakeven: Math.round(breakevenPrice * 100) / 100,
      target: Math.round(targetPrice * 100) / 100,
      conservative: Math.round(conservativePrice * 100) / 100
    };
  };

  // Calculate depreciation for a specific year based on when capex was incurred
  const calculateDepreciationForYear = (year: number) => {
    let totalDepreciation = 0;
    
    data.oneTimeCosts.forEach(cost => {
      const incurredMonth = cost.month || 1; // Month when capex was incurred (1-12)
      const incurredYear = 1; // All capex in year 1 for now
      const monthlyDepreciation = cost.amount / 36; // Depreciate over 36 months
      
      // Calculate which months of this year should have depreciation
      const startYear = incurredYear;
      const startMonth = incurredMonth;
      
      // Calculate the absolute month when depreciation starts (1-based)
      const depreciationStartMonth = (startYear - 1) * 12 + startMonth;
      
      // Calculate the absolute month range for this year
      const yearStartMonth = (year - 1) * 12 + 1;
      const yearEndMonth = year * 12;
      
      // Calculate the absolute month when depreciation ends (36 months after start)
      const depreciationEndMonth = depreciationStartMonth + 35; // 36 months total
      
      // Find overlap between this year and the depreciation period
      const overlapStart = Math.max(yearStartMonth, depreciationStartMonth);
      const overlapEnd = Math.min(yearEndMonth, depreciationEndMonth);
      
      if (overlapStart <= overlapEnd) {
        const monthsInThisYear = overlapEnd - overlapStart + 1;
        totalDepreciation += monthlyDepreciation * monthsInThisYear;
      }
    });
    
    return totalDepreciation;
  };

  // Generate P&L data for 5 years
  const generatePnLData = () => {
    const { fixedCostPerYear, variableCostPerYear } = calculateTotalCosts();
    const pricing = calculatePricingRecommendations();
    const priceToUse = selectedPrice > 0 ? selectedPrice : pricing.target;
    
    return Array.from({ length: 5 }, (_, index) => {
      const year = index + 1;
      const demandThisYear = data.productDemand[index] || 0;
      const revenue = demandThisYear * priceToUse;
      const fixedCosts = fixedCostPerYear;
      const variableCosts = variableCostPerYear;
      const depreciation = calculateDepreciationForYear(year);
      const grossProfit = revenue - fixedCosts - variableCosts - depreciation;
      const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      
      return {
        year: `Year ${year}`,
        revenue: Math.round(revenue),
        fixedCosts: Math.round(fixedCosts),
        variableCosts: Math.round(variableCosts),
        depreciation: Math.round(depreciation),
        grossProfit: Math.round(grossProfit),
        profitMargin: Math.round(profitMargin * 100) / 100
      };
    });
  };

  // Generate chart data
  const generateChartData = () => {
    const pnlData = generatePnLData();
    
    const revenueData = pnlData.map(item => ({
      year: item.year,
      Revenue: item.revenue,
      'Fixed Costs': -(item.fixedCosts),
      'Variable Costs': -(item.variableCosts),
      'Depreciation': -(item.depreciation),
      Profit: item.grossProfit
    }));

    const costBreakdownData = [
      { name: 'Fixed Costs', value: calculateTotalCosts().fixedCostPerYear * 5, color: '#3b82f6' },
      { name: 'Variable Costs', value: calculateTotalCosts().variableCostPerYear * 5, color: '#f59e0b' },
      { name: 'One-time Costs', value: calculateTotalCosts().oneTimeCosts, color: '#10b981' }
    ];

    return { revenueData, costBreakdownData };
  };

  const costs = calculateTotalCosts();
  const demand = calculateDemandTotals();
  const pricing = calculatePricingRecommendations();
  const pnlData = generatePnLData();
  const { revenueData, costBreakdownData } = generateChartData();

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Executive Summary</h2>
          <p className="text-muted-foreground text-lg">
            Complete financial analysis and recommendations for {data.productName || 'your product'}
          </p>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">5-Year Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round((demand.totalDemand * pricing.target) / 1000).toLocaleString()}M</div>
              <p className="text-xs text-muted-foreground">at target pricing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(costs.totalFiveYearCosts / 1000).toLocaleString()}M</div>
              <p className="text-xs text-muted-foreground">5-year total costs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Unit Price</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pricing.target.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">110% TCRR recommended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Market Volume</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(demand.totalDemand / 1000).toLocaleString()}K</div>
              <p className="text-xs text-muted-foreground">5-year demand projection</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Cost Projection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                5-Year Financial Projection
              </CardTitle>
              <CardDescription>Revenue, costs, and profit projections</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${Math.abs(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="Revenue" fill="#3b82f6" name="Revenue" />
                  <Bar dataKey="Fixed Costs" fill="#ef4444" name="Fixed Costs" />
                  <Bar dataKey="Variable Costs" fill="#f59e0b" name="Variable Costs" />
                  <Bar dataKey="Depreciation" fill="#8b5cf6" name="Depreciation" />
                  <Line type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={3} name="Profit" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                5-Year Cost Breakdown
              </CardTitle>
              <CardDescription>Distribution of total costs by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    dataKey="value"
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Strategy Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recommended Pricing Strategy</CardTitle>
            <CardDescription>
              Financial modeling based on {data.productCategory} cost structure and {data.growthRate}% annual growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Breakeven Price</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${pricing.breakeven.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">minimum viable pricing</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-orange-600">Target Price (110% TCRR)</div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                  ${pricing.target.toLocaleString()}
                </div>
                <div className="text-xs text-orange-500 mt-1">recommended pricing</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-600">Conservative Price (90% TCRR)</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                  ${pricing.conservative.toLocaleString()}
                </div>
                <div className="text-xs text-green-500 mt-1">market penetration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* P&L Statement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profit & Loss Statement (5-Year)
            </CardTitle>
            <CardDescription>
              Detailed P&L analysis using target pricing of ${pricing.target}/unit
            </CardDescription>
          </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-left">P&L Items</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Year 1</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Year 2</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Year 3</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Year 4</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">Year 5</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-3 text-center">5-Year Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 font-medium text-green-700">Revenue</td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className="border border-gray-200 dark:border-gray-700 p-3 text-center font-bold text-green-700">
                            ${yearData.revenue.toLocaleString()}
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-bold text-green-700">
                          ${pnlData.reduce((sum, year) => sum + year.revenue, 0).toLocaleString()}
                        </td>
                      </tr>
                      
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 pl-6 text-blue-600 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => setFixedCostExpanded(!fixedCostExpanded)}>
                          <div className="flex items-center gap-2">
                            Less: Fixed Costs
                            {fixedCostExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-blue-600">
                            (${yearData.fixedCosts.toLocaleString()})
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-medium text-blue-600">
                          (${pnlData.reduce((sum, year) => sum + year.fixedCosts, 0).toLocaleString()})
                        </td>
                      </tr>
                      {fixedCostExpanded && (
                        <>
                          {data.fixedCosts.map((cost) => (
                            <tr key={cost.id} className="bg-blue-50 dark:bg-blue-900/10">
                              <td className="border border-gray-200 dark:border-gray-700 p-3 pl-12 text-sm text-blue-500">
                                • {cost.name}
                              </td>
                              {Array.from({ length: 5 }, (_, year) => (
                                <td key={year} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-blue-500">
                                  (${Math.round(cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0)).toLocaleString()})
                                </td>
                              ))}
                              <td className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-blue-500">
                                (${Math.round(cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0) * 5).toLocaleString()})
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                      
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 pl-6 text-orange-600 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={() => setVariableCostExpanded(!variableCostExpanded)}>
                          <div className="flex items-center gap-2">
                            Less: Variable Costs
                            {variableCostExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        </td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-orange-600">
                            (${yearData.variableCosts.toLocaleString()})
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-medium text-orange-600">
                          (${pnlData.reduce((sum, year) => sum + year.variableCosts, 0).toLocaleString()})
                        </td>
                      </tr>
                      {variableCostExpanded && (
                        <>
                          {data.variableCosts.map((cost) => (
                            <tr key={cost.id} className="bg-orange-50 dark:bg-orange-900/10">
                              <td className="border border-gray-200 dark:border-gray-700 p-3 pl-12 text-sm text-orange-500">
                                • {cost.name}
                              </td>
                              {Array.from({ length: 5 }, (_, year) => (
                                <td key={year} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-orange-500">
                                  (${Math.round(cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0)).toLocaleString()})
                                </td>
                              ))}
                              <td className="border border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-orange-500">
                                (${Math.round(cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0) * 5).toLocaleString()})
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                      
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 pl-6 text-purple-600">Less: Depreciation</td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-purple-600">
                            {yearData.depreciation > 0 ? `(${yearData.depreciation.toLocaleString()})` : '-'}
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-medium text-purple-600">
                          (${pnlData.reduce((sum, year) => sum + year.depreciation, 0).toLocaleString()})
                        </td>
                      </tr>
                      
                      <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-gray-900 dark:text-gray-100">EBIT</td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className={`border border-gray-200 dark:border-gray-700 p-3 text-center ${yearData.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${yearData.grossProfit.toLocaleString()}
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-bold text-green-600">
                          ${pnlData.reduce((sum, year) => sum + year.grossProfit, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p><strong>Notes:</strong> All amounts in thousands. Capex depreciated over 3 years. TCRR = Total Cost Recovery Ratio. EBIT = Earnings Before Interest & Tax.</p>
                </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious} data-testid="button-previous">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onExport} data-testid="button-export">
              Export Analysis
            </Button>
            <Button onClick={onSave} data-testid="button-save">
              Save Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}