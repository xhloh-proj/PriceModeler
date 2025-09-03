import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Plus, Anchor, TrendingUp, Calendar, Server, Key, Shield, Briefcase, Users, CreditCard, Megaphone, Cloud } from "lucide-react";
import { CostElement } from "@/types/pricing";

interface CostStructureData {
  fixedCosts: CostElement[];
  variableCosts: CostElement[];
  yearMultipliers: { year: number; multiplier: number }[];
}

interface StepCostStructureProps {
  data: CostStructureData;
  onChange: (data: CostStructureData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const defaultFixedCosts: CostElement[] = [
  { id: "1", name: "Infrastructure & Hosting", amount: 500, icon: "server" },
  { id: "2", name: "Software Licenses", amount: 200, icon: "key" },
  { id: "3", name: "Security & Compliance", amount: 150, icon: "shield" },
  { id: "4", name: "Legal & Professional", amount: 100, icon: "briefcase" },
];

const defaultVariableCosts: CostElement[] = [
  { id: "1", name: "Customer Support", amount: 5, icon: "users", unit: "per user" },
  { id: "2", name: "Payment Processing", amount: 2.9, icon: "credit-card", unit: "% of revenue" },
  { id: "3", name: "Marketing & Acquisition", amount: 15, icon: "megaphone", unit: "% of revenue" },
  { id: "4", name: "Cloud Services", amount: 0.5, icon: "cloud", unit: "per user" },
];

const getIcon = (iconName: string) => {
  const icons = {
    server: Server,
    key: Key,
    shield: Shield,
    briefcase: Briefcase,
    users: Users,
    "credit-card": CreditCard,
    megaphone: Megaphone,
    cloud: Cloud,
  };
  return icons[iconName as keyof typeof icons] || Server;
};

export default function StepCostStructure({ data, onChange, onNext, onPrevious }: StepCostStructureProps) {
  // Initialize with default costs if empty
  const fixedCosts = data.fixedCosts.length > 0 ? data.fixedCosts : defaultFixedCosts;
  const variableCosts = data.variableCosts.length > 0 ? data.variableCosts : defaultVariableCosts;
  const yearMultipliers = data.yearMultipliers.length > 0 ? data.yearMultipliers : [
    { year: 2, multiplier: 1.5 },
    { year: 3, multiplier: 2.2 },
    { year: 4, multiplier: 3.1 },
    { year: 5, multiplier: 4.0 },
  ];

  const updateFixedCost = (index: number, amount: number) => {
    const newFixedCosts = [...fixedCosts];
    newFixedCosts[index] = { ...newFixedCosts[index], amount };
    onChange({ ...data, fixedCosts: newFixedCosts, variableCosts, yearMultipliers });
  };

  const updateVariableCost = (index: number, amount: number) => {
    const newVariableCosts = [...variableCosts];
    newVariableCosts[index] = { ...newVariableCosts[index], amount };
    onChange({ ...data, fixedCosts, variableCosts: newVariableCosts, yearMultipliers });
  };

  const updateYearMultiplier = (index: number, multiplier: number) => {
    const newYearMultipliers = [...yearMultipliers];
    newYearMultipliers[index] = { ...newYearMultipliers[index], multiplier };
    onChange({ ...data, fixedCosts, variableCosts, yearMultipliers: newYearMultipliers });
  };

  const addYear = () => {
    const newYear = Math.max(...yearMultipliers.map(y => y.year)) + 1;
    const newYearMultipliers = [...yearMultipliers, { year: newYear, multiplier: 1.0 }];
    onChange({ ...data, fixedCosts, variableCosts, yearMultipliers: newYearMultipliers });
  };

  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Build your cost structure</h2>
        <p className="text-muted-foreground">
          Based on your product, we've suggested typical cost elements. Customize as needed.
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Fixed Costs */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center">
              <Anchor className="text-primary w-5 h-5 mr-2" />
              Fixed Costs
            </h3>
            <p className="text-sm text-muted-foreground">Costs that remain constant regardless of usage</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {fixedCosts.map((cost, index) => {
                const IconComponent = getIcon(cost.icon);
                return (
                  <div key={cost.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="text-primary w-4 h-4" />
                      <span className="font-medium">{cost.name}</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cost.amount}
                      onChange={(e) => updateFixedCost(index, parseFloat(e.target.value) || 0)}
                      className="w-24 text-right"
                      data-testid={`input-fixed-cost-${index}`}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-secondary rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-secondary-foreground">Total Fixed Costs</span>
                <span className="text-xl font-bold text-primary" data-testid="text-total-fixed-costs">
                  ${totalFixedCosts.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">Per month</div>
            </div>
          </CardContent>
        </Card>

        {/* Variable Costs */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center">
              <TrendingUp className="text-chart-2 w-5 h-5 mr-2" />
              Variable Costs
            </h3>
            <p className="text-sm text-muted-foreground">Costs that scale with usage or revenue</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {variableCosts.map((cost, index) => {
                const IconComponent = getIcon(cost.icon);
                return (
                  <div key={cost.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="text-chart-2 w-4 h-4" />
                      <span className="font-medium">{cost.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={cost.amount}
                        onChange={(e) => updateVariableCost(index, parseFloat(e.target.value) || 0)}
                        className="w-20 text-right"
                        data-testid={`input-variable-cost-${index}`}
                      />
                      <span className="text-sm text-muted-foreground">{cost.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Period Selector */}
      <Card className="mt-8 shadow-sm">
        <CardHeader className="border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center">
            <Calendar className="text-primary w-5 h-5 mr-2" />
            Planning Timeline
          </h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Year 1 Monthly */}
            <div>
              <h4 className="font-medium text-card-foreground mb-4">Year 1 (Monthly breakdown)</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                  <div key={month} className="p-2 bg-muted/30 rounded text-center">
                    <div className="font-medium">{month}</div>
                    <div className="text-muted-foreground text-xs">{(1.0 + index * 0.2).toFixed(1)}x</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Years 2-5 */}
            <div>
              <h4 className="font-medium text-card-foreground mb-4">Annual Planning (Years 2-5)</h4>
              <div className="space-y-3">
                {yearMultipliers.map((year, index) => (
                  <div key={year.year} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <span className="font-medium">Year {year.year}</span>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Growth multiplier"
                      value={year.multiplier}
                      onChange={(e) => updateYearMultiplier(index, parseFloat(e.target.value) || 0)}
                      className="w-32 text-right"
                      data-testid={`input-year-${year.year}-multiplier`}
                    />
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addYear}
                  className="w-full border-2 border-dashed hover:border-primary hover:text-primary"
                  data-testid="button-add-year"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Year
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          data-testid="button-back-to-product"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          data-testid="button-continue-demand-analysis"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Continue to Demand Analysis
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
