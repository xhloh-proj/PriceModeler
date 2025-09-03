import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, ChevronRight, TrendingUp, DollarSign, Target, Users, BarChart3, PieChart } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

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
  const [pnlExpanded, setPnlExpanded] = useState(false);
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

  // Generate P&L data for 5 years
  const generatePnLData = () => {
    const { fixedCostPerYear, variableCostPerYear, oneTimeCosts } = calculateTotalCosts();
    const pricing = calculatePricingRecommendations();
    const priceToUse = selectedPrice > 0 ? selectedPrice : pricing.target;
    
    return Array.from({ length: 5 }, (_, index) => {
      const year = index + 1;
      const demandThisYear = data.productDemand[index] || 0;
      const revenue = demandThisYear * priceToUse;
      const fixedCosts = fixedCostPerYear;
      const variableCosts = variableCostPerYear;
      const depreciation = year === 1 ? oneTimeCosts : 0; // Depreciate capex in year 1
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
      'Total Costs': item.fixedCosts + item.variableCosts + item.depreciation,
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
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                  <Bar dataKey="Revenue" fill="#3b82f6" />
                  <Bar dataKey="Total Costs" fill="#ef4444" />
                  <Bar dataKey="Profit" fill="#10b981" />
                </BarChart>
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

        {/* Expandable P&L Statement */}
        <Card className="mb-6">
          <Collapsible open={pnlExpanded} onOpenChange={setPnlExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Profit & Loss Statement (5-Year)
                    </CardTitle>
                    <CardDescription>
                      Detailed P&L analysis using target pricing of ${pricing.target}/unit
                    </CardDescription>
                  </div>
                  {pnlExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
                        <td className="border border-gray-200 dark:border-gray-700 p-3 pl-6 text-blue-600">Less: Fixed Costs</td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-blue-600">
                            (${yearData.fixedCosts.toLocaleString()})
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-medium text-blue-600">
                          (${pnlData.reduce((sum, year) => sum + year.fixedCosts, 0).toLocaleString()})
                        </td>
                      </tr>
                      
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 p-3 pl-6 text-orange-600">Less: Variable Costs</td>
                        {pnlData.map((yearData, index) => (
                          <td key={index} className="border border-gray-200 dark:border-gray-700 p-3 text-center text-orange-600">
                            (${yearData.variableCosts.toLocaleString()})
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-center font-medium text-orange-600">
                          (${pnlData.reduce((sum, year) => sum + year.variableCosts, 0).toLocaleString()})
                        </td>
                      </tr>
                      
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
                        <td className="border border-gray-200 dark:border-gray-700 p-3 text-gray-900 dark:text-gray-100">Gross Profit</td>
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
                  <p><strong>Notes:</strong> All amounts in thousands. Capex depreciated in Year 1. TCRR = Total Cost Recovery Ratio.</p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
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