import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, DollarSign, Calculator, Download, Save } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useMemo } from "react";
import { DemandProjection, PricingCalculation, RevenueProjection, FinancialMetrics } from "@/types/pricing";

interface DemandAnalysisData {
  demand: DemandProjection;
  fixedCosts: Array<{ name: string; amount: number }>;
  variableCosts: Array<{ name: string; amount: number; unit: string }>;
}

interface StepDemandAnalysisProps {
  data: DemandAnalysisData;
  onChange: (data: DemandAnalysisData) => void;
  onPrevious: () => void;
  onSave: () => void;
  onExport: () => void;
}

export default function StepDemandAnalysis({ data, onChange, onPrevious, onSave, onExport }: StepDemandAnalysisProps) {
  const handleDemandChange = (field: keyof DemandProjection, value: number) => {
    onChange({
      ...data,
      demand: { ...data.demand, [field]: value }
    });
  };

  const calculations = useMemo((): PricingCalculation & { revenueProjections: RevenueProjection[]; metrics: FinancialMetrics } => {
    const { demand, fixedCosts, variableCosts } = data;
    
    // Calculate total fixed costs per month
    const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    // Calculate variable cost per user (simplified)
    const variableCostPerUser = variableCosts
      .filter(cost => cost.unit === "per user")
      .reduce((sum, cost) => sum + cost.amount, 0);
    
    // Calculate percentage-based variable costs (as a percentage of revenue)
    const revenuePercentageCosts = variableCosts
      .filter(cost => cost.unit === "% of revenue")
      .reduce((sum, cost) => sum + cost.amount, 0) / 100;

    // Generate monthly projections
    const revenueProjections: RevenueProjection[] = [];
    let currentUsers = demand.initialUsers;
    
    for (let month = 0; month < 12; month++) {
      // Apply growth and churn
      if (month > 0) {
        const growth = currentUsers * (demand.growthRate / 100);
        const churn = currentUsers * (demand.churnRate / 100);
        currentUsers = Math.min(currentUsers + growth - churn, demand.marketSize);
      }
      
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Simple revenue calculation (will be adjusted based on pricing)
      const estimatedRevenue = currentUsers * 25; // Placeholder price
      const totalCosts = totalFixedCosts + (currentUsers * variableCostPerUser) + (estimatedRevenue * revenuePercentageCosts);
      
      revenueProjections.push({
        month: monthNames[month],
        revenue: estimatedRevenue,
        costs: totalCosts,
        users: Math.round(currentUsers)
      });
    }

    // Calculate average users for pricing
    const avgUsers = revenueProjections.reduce((sum, p) => sum + p.users, 0) / 12;
    
    // Calculate cost per user
    const annualFixedCosts = totalFixedCosts * 12;
    const costPerUser = (annualFixedCosts / avgUsers / 12) + variableCostPerUser + (25 * revenuePercentageCosts); // Simplified

    // Pricing calculations
    const breakeven = costPerUser;
    const profit90 = costPerUser * 1.9; // 90% margin
    const profit110 = costPerUser * 2.1; // 110% margin

    // Financial metrics (simplified calculations)
    const marketingCost = variableCosts.find(cost => cost.name.includes("Marketing"))?.amount || 15;
    const cac = (breakeven * (marketingCost / 100)) * 5; // Simplified CAC
    const ltv = profit90 * 12 * 2; // Simplified LTV (2 years)
    const paybackPeriod = cac / (profit90 - breakeven);
    const breakEvenUsers = annualFixedCosts / (breakeven * 12);

    return {
      breakeven,
      profit90,
      profit110,
      totalFixedCosts: annualFixedCosts,
      totalVariableCosts: variableCostPerUser,
      costPerUser,
      revenueProjections,
      metrics: {
        cac,
        ltv,
        paybackPeriod,
        breakEvenUsers: Math.round(breakEvenUsers)
      }
    };
  }, [data]);

  const costBreakdownData = [
    { name: "Infrastructure", value: 30, color: "hsl(221 83% 53%)" },
    { name: "Support", value: 25, color: "hsl(45 93% 50%)" },
    { name: "Marketing", value: 20, color: "hsl(142 71% 45%)" },
    { name: "Payment Processing", value: 15, color: "hsl(0 85% 60%)" },
    { name: "Other", value: 10, color: "hsl(262 83% 58%)" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Demand projections & pricing analysis</h2>
        <p className="text-muted-foreground">
          Project your user growth and see pricing recommendations based on your cost structure.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Demand Inputs */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center">
              <Users className="text-primary w-5 h-5 mr-2" />
              User Projections
            </h3>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label htmlFor="initial-users" className="text-sm font-medium text-card-foreground">
                Initial Users (Month 1)
              </Label>
              <Input
                id="initial-users"
                type="number"
                placeholder="Starting user count"
                value={data.demand.initialUsers}
                onChange={(e) => handleDemandChange('initialUsers', parseInt(e.target.value) || 0)}
                data-testid="input-initial-users"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="growth-rate" className="text-sm font-medium text-card-foreground">
                Monthly Growth Rate (%)
              </Label>
              <Input
                id="growth-rate"
                type="number"
                placeholder="Growth percentage"
                value={data.demand.growthRate}
                onChange={(e) => handleDemandChange('growthRate', parseFloat(e.target.value) || 0)}
                data-testid="input-growth-rate"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="churn-rate" className="text-sm font-medium text-card-foreground">
                Churn Rate (%)
              </Label>
              <Input
                id="churn-rate"
                type="number"
                placeholder="Monthly churn"
                value={data.demand.churnRate}
                onChange={(e) => handleDemandChange('churnRate', parseFloat(e.target.value) || 0)}
                data-testid="input-churn-rate"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="market-size" className="text-sm font-medium text-card-foreground">
                Target Market Size
              </Label>
              <Input
                id="market-size"
                type="number"
                placeholder="Total addressable users"
                value={data.demand.marketSize}
                onChange={(e) => handleDemandChange('marketSize', parseInt(e.target.value) || 0)}
                data-testid="input-market-size"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing Recommendations */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center">
                <DollarSign className="text-primary w-5 h-5 mr-2" />
                Pricing Recommendations
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive" data-testid="text-breakeven-price">
                    ${calculations.breakeven.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Breakeven Price</div>
                  <div className="text-xs text-destructive mt-1">Minimum viable price</div>
                </div>
                <div className="text-center p-4 bg-chart-2/10 rounded-lg border border-chart-2/20">
                  <div className="text-2xl font-bold text-chart-2" data-testid="text-profit-90">
                    ${calculations.profit90.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">90% Margin</div>
                  <div className="text-xs text-muted-foreground mt-1">Conservative pricing</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary" data-testid="text-profit-110">
                    ${calculations.profit110.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">110% Margin</div>
                  <div className="text-xs text-primary mt-1">Aggressive pricing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Projections Chart */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Revenue vs Cost Projections</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calculations.revenueProjections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(221 83% 53%)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="costs"
                      stroke="hsl(0 85% 60%)"
                      strokeWidth={2}
                      name="Total Costs"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown Chart */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">Cost Structure Breakdown</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={costBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">Fixed Costs</span>
                    </div>
                    <span className="text-sm font-semibold" data-testid="text-annual-fixed-costs">
                      ${calculations.totalFixedCosts.toLocaleString()}/year
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                      <span className="text-sm font-medium">Variable Costs</span>
                    </div>
                    <span className="text-sm font-semibold" data-testid="text-variable-cost-per-user">
                      ${calculations.totalVariableCosts.toFixed(2)}/user
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-md border border-primary/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-destructive rounded-full"></div>
                      <span className="text-sm font-medium">Total Cost/User</span>
                    </div>
                    <span className="text-sm font-bold text-primary" data-testid="text-cost-per-user">
                      ${calculations.costPerUser.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <Card className="mt-8 shadow-sm">
        <CardHeader className="border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center">
            <Calculator className="text-primary w-5 h-5 mr-2" />
            Key Financial Metrics
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-cac">
                ${calculations.metrics.cac.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Customer Acquisition Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-ltv">
                ${calculations.metrics.ltv.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Customer Lifetime Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-payback-period">
                {calculations.metrics.paybackPeriod.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Payback Period (months)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-breakeven-users">
                {calculations.metrics.breakEvenUsers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Break-even Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          data-testid="button-back-to-costs"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Costs
        </Button>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={onSave}
            data-testid="button-save-project-final"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
          <Button
            onClick={onExport}
            data-testid="button-export-complete-model"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Complete Model
          </Button>
        </div>
      </div>
    </div>
  );
}
