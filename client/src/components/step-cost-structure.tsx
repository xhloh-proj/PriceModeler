import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Anchor, TrendingUp, Calendar, Server, Key, Shield, Briefcase, Users, CreditCard, Megaphone, Cloud, Building, Clipboard, Cog, Zap, Wifi, Globe, LifeBuoy, Layers, Code, UserPlus, Database, Package, GitBranch, Palette, Smartphone, Bell, BarChart, ShieldCheck, Rocket, Book, Link, Headphones, FileText } from "lucide-react";
import { getCostSuggestions, type CostSuggestions } from "@/lib/cost-suggestions";
import { useEffect, useState } from "react";

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

interface CostStructureData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  oneTimeCosts: OneTimeCostItem[];
  costIncreaseAssumptions: { year: number; fixedIncrease: number; variableIncrease: number }[];
  productCategory: string;
}

interface StepCostStructureProps {
  data: CostStructureData;
  onChange: (data: CostStructureData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

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
    building: Building,
    clipboard: Clipboard,
    cog: Cog,
    zap: Zap,
    wifi: Wifi,
    globe: Globe,
    "life-buoy": LifeBuoy,
    layers: Layers,
    code: Code,
    "user-plus": UserPlus,
    database: Database,
    package: Package,
    "git-branch": GitBranch,
    palette: Palette,
    smartphone: Smartphone,
    bell: Bell,
    "bar-chart": BarChart,
    blueprint: FileText,
    "shield-check": ShieldCheck,
    rocket: Rocket,
    book: Book,
    link: Link,
    headphones: Headphones,
    accessibility: FileText,
  };
  return icons[iconName as keyof typeof icons] || Server;
};

export default function StepCostStructure({ data, onChange, onNext, onPrevious }: StepCostStructureProps) {
  const [suggestions, setSuggestions] = useState<CostSuggestions | null>(null);
  
  // Initialize suggestions based on product category
  useEffect(() => {
    if (data.productCategory) {
      const costSuggestions = getCostSuggestions(data.productCategory);
      setSuggestions(costSuggestions);
      
      // Initialize with suggestions if data is empty
      if (data.fixedCosts.length === 0 && data.variableCosts.length === 0 && data.oneTimeCosts.length === 0) {
        onChange({
          ...data,
          fixedCosts: costSuggestions.fixedCosts,
          variableCosts: costSuggestions.variableCosts,
          oneTimeCosts: costSuggestions.oneTimeCosts,
          costIncreaseAssumptions: [
            { year: 2, fixedIncrease: 5, variableIncrease: 3 },
            { year: 3, fixedIncrease: 5, variableIncrease: 3 },
            { year: 4, fixedIncrease: 5, variableIncrease: 3 },
            { year: 5, fixedIncrease: 5, variableIncrease: 3 },
          ]
        });
      }
    }
  }, [data.productCategory]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const updateFixedCostMonth = (costIndex: number, monthIndex: number, amount: number) => {
    const newFixedCosts = [...data.fixedCosts];
    const newMonthlyAmounts = [...newFixedCosts[costIndex].monthlyAmounts];
    newMonthlyAmounts[monthIndex] = amount;
    newFixedCosts[costIndex] = { ...newFixedCosts[costIndex], monthlyAmounts: newMonthlyAmounts };
    onChange({ ...data, fixedCosts: newFixedCosts });
  };

  const updateVariableCostMonth = (costIndex: number, monthIndex: number, amount: number) => {
    const newVariableCosts = [...data.variableCosts];
    const newMonthlyAmounts = [...newVariableCosts[costIndex].monthlyAmounts];
    newMonthlyAmounts[monthIndex] = amount;
    newVariableCosts[costIndex] = { ...newVariableCosts[costIndex], monthlyAmounts: newMonthlyAmounts };
    onChange({ ...data, variableCosts: newVariableCosts });
  };

  const updateOneTimeCost = (index: number, amount: number) => {
    const newOneTimeCosts = [...data.oneTimeCosts];
    newOneTimeCosts[index] = { ...newOneTimeCosts[index], amount };
    onChange({ ...data, oneTimeCosts: newOneTimeCosts });
  };

  const updateCostIncreaseAssumption = (index: number, field: 'fixedIncrease' | 'variableIncrease', value: number) => {
    const newAssumptions = [...data.costIncreaseAssumptions];
    newAssumptions[index] = { ...newAssumptions[index], [field]: value };
    onChange({ ...data, costIncreaseAssumptions: newAssumptions });
  };

  const getTotalFixedCosts = () => {
    return data.fixedCosts.reduce((sum, cost) => 
      sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0
    );
  };

  const getTotalVariableCosts = () => {
    return data.variableCosts.reduce((sum, cost) => 
      sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0
    );
  };

  const getTotalOneTimeCosts = () => {
    return data.oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Build your cost structure</h2>
        <p className="text-muted-foreground">
          Based on your {data.productCategory} product, we've suggested typical cost elements. Customize month-by-month for Year 1.
        </p>
      </div>
      
      <Tabs defaultValue="fixed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fixed" className="flex items-center gap-2">
            <Anchor className="w-4 h-4" />
            Fixed Costs
          </TabsTrigger>
          <TabsTrigger value="variable" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Variable Costs
          </TabsTrigger>
          <TabsTrigger value="onetime" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            One-time Costs
          </TabsTrigger>
        </TabsList>

        {/* Fixed Costs Tab */}
        <TabsContent value="fixed" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center">
                <Anchor className="text-primary w-5 h-5 mr-2" />
                Fixed Costs - Year 1 Monthly Breakdown
              </h3>
              <p className="text-sm text-muted-foreground">Costs that remain relatively constant regardless of usage</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {data.fixedCosts.map((cost, costIndex) => {
                  const IconComponent = getIcon(cost.icon);
                  return (
                    <div key={cost.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <IconComponent className="text-primary w-5 h-5" />
                        <span className="font-medium text-lg">{cost.name}</span>
                        {cost.isCommon ? (
                          <Badge variant="secondary">Common</Badge>
                        ) : (
                          <Badge variant="outline">Product-specific</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-6 gap-3">
                        {monthNames.map((month, monthIndex) => (
                          <div key={month} className="text-center">
                            <div className="text-xs font-medium text-muted-foreground mb-1">{month}</div>
                            <Input
                              type="number"
                              placeholder="0"
                              value={cost.monthlyAmounts[monthIndex] || 0}
                              onChange={(e) => updateFixedCostMonth(costIndex, monthIndex, parseFloat(e.target.value) || 0)}
                              className="text-center text-sm"
                              data-testid={`input-fixed-${costIndex}-${monthIndex}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-secondary rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-secondary-foreground">Total Fixed Costs (Year 1)</span>
                  <span className="text-xl font-bold text-primary" data-testid="text-total-fixed-costs">
                    ${getTotalFixedCosts().toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variable Costs Tab */}
        <TabsContent value="variable" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center">
                <TrendingUp className="text-chart-2 w-5 h-5 mr-2" />
                Variable Costs - Year 1 Monthly Breakdown
              </h3>
              <p className="text-sm text-muted-foreground">Costs that scale with usage, users, or revenue</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {data.variableCosts.map((cost, costIndex) => {
                  const IconComponent = getIcon(cost.icon);
                  return (
                    <div key={cost.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <IconComponent className="text-chart-2 w-5 h-5" />
                        <span className="font-medium text-lg">{cost.name}</span>
                        {cost.isCommon ? (
                          <Badge variant="secondary">Common</Badge>
                        ) : (
                          <Badge variant="outline">Product-specific</Badge>
                        )}
                        {cost.unit && (
                          <Badge variant="outline" className="text-xs">
                            {cost.unit}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-6 gap-3">
                        {monthNames.map((month, monthIndex) => (
                          <div key={month} className="text-center">
                            <div className="text-xs font-medium text-muted-foreground mb-1">{month}</div>
                            <Input
                              type="number"
                              placeholder="0"
                              value={cost.monthlyAmounts[monthIndex] || 0}
                              onChange={(e) => updateVariableCostMonth(costIndex, monthIndex, parseFloat(e.target.value) || 0)}
                              className="text-center text-sm"
                              data-testid={`input-variable-${costIndex}-${monthIndex}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-secondary rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-secondary-foreground">Total Variable Costs (Year 1)</span>
                  <span className="text-xl font-bold text-chart-2" data-testid="text-total-variable-costs">
                    ${getTotalVariableCosts().toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* One-time Costs Tab */}
        <TabsContent value="onetime" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center">
                <Calendar className="text-chart-3 w-5 h-5 mr-2" />
                One-time Costs
              </h3>
              <p className="text-sm text-muted-foreground">Upfront costs incurred once during project initiation</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {data.oneTimeCosts.map((cost, index) => {
                  const IconComponent = getIcon(cost.icon);
                  return (
                    <div key={cost.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="text-chart-3 w-4 h-4" />
                        <span className="font-medium">{cost.name}</span>
                        {cost.isCommon ? (
                          <Badge variant="secondary">Common</Badge>
                        ) : (
                          <Badge variant="outline">Product-specific</Badge>
                        )}
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        value={cost.amount}
                        onChange={(e) => updateOneTimeCost(index, parseFloat(e.target.value) || 0)}
                        className="w-32 text-right"
                        data-testid={`input-onetime-cost-${index}`}
                      />
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-secondary rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-secondary-foreground">Total One-time Costs</span>
                  <span className="text-xl font-bold text-chart-3" data-testid="text-total-onetime-costs">
                    ${getTotalOneTimeCosts().toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cost Increase Assumptions for Years 2-5 */}
      <Card className="mt-8 shadow-sm">
        <CardHeader className="border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center">
            <TrendingUp className="text-primary w-5 h-5 mr-2" />
            Cost Increase Assumptions (Years 2-5)
          </h3>
          <p className="text-sm text-muted-foreground">Define percentage increases for fixed and variable costs</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.costIncreaseAssumptions.map((assumption, index) => (
              <div key={assumption.year} className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-center mb-4">Year {assumption.year}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Fixed Costs Increase</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="5"
                        value={assumption.fixedIncrease}
                        onChange={(e) => updateCostIncreaseAssumption(index, 'fixedIncrease', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        data-testid={`input-year-${assumption.year}-fixed-increase`}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Variable Costs Increase</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="3"
                        value={assumption.variableIncrease}
                        onChange={(e) => updateCostIncreaseAssumption(index, 'variableIncrease', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        data-testid={`input-year-${assumption.year}-variable-increase`}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
