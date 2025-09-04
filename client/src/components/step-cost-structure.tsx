import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Users, UserPlus, Cog, Building, Cloud, Database, Shield, Plus, Minus, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getCostSuggestions } from "@/lib/cost-suggestions";

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

interface CostStructureData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  oneTimeCosts: OneTimeCostItem[];
  costIncreaseAssumptions: { year: number; fixedIncrease: number; variableIncrease: number }[];
  productCategory: string;
}

interface EmployeeInputs {
  teamMembers: number;
  augmentedResources: number;
}

interface StepCostStructureProps {
  data: CostStructureData;
  onChange: (data: CostStructureData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const months = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12"];

export default function StepCostStructure({ data, onChange, onNext, onPrevious }: StepCostStructureProps) {
  const [employeeInputs, setEmployeeInputs] = useState<EmployeeInputs>({
    teamMembers: 5,
    augmentedResources: 2,
  });
  
  const [currentTab, setCurrentTab] = useState("fixed");
  const isInitialized = useRef(false);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    fixed: false,
    variable: false,
    capex: false
  });
  const [inflationRate, setInflationRate] = useState(3);
  const [yearlyData, setYearlyData] = useState<number[]>([]);

  // Calculate employee costs in thousands (240k per person annually)
  const calculateEmployeeCosts = (count: number) => {
    const totalAnnual = count * 240; // Total annual cost in thousands
    const monthlyTotal = totalAnnual / 12; // Monthly total in thousands
    return Array(12).fill(Number(monthlyTotal.toFixed(1)));
  };



  // Update corporate overheads when costs change
  const updateCorporateOverheads = (newData: any) => {
    // Calculate 4% of all other costs (excluding corporate overheads)
    const totalFixed = newData.fixedCosts
      .filter((cost: any) => cost.id !== 'corporate-overheads')
      .reduce((sum: number, cost: any) => sum + cost.monthlyAmounts.reduce((monthSum: number, amount: number) => monthSum + amount, 0), 0);
    const totalVariable = newData.variableCosts.reduce((sum: number, cost: any) => 
      sum + cost.monthlyAmounts.reduce((monthSum: number, amount: number) => monthSum + amount, 0), 0);
    const totalOneTime = newData.oneTimeCosts.reduce((sum: number, cost: any) => sum + cost.amount, 0);
    
    const totalOtherCosts = totalFixed + totalVariable + totalOneTime;
    const monthlyOverhead = (totalOtherCosts * 0.04) / 12; // 4% of total costs divided by 12 months
    
    // Update corporate overheads in fixed costs
    const updatedFixedCosts = newData.fixedCosts.map((cost: any) => {
      if (cost.id === 'corporate-overheads') {
        return {
          ...cost,
          monthlyAmounts: Array(12).fill(Number(monthlyOverhead.toFixed(1))),
          unit: `4% of total costs (includes software licenses, office rental, legal compliance)`
        };
      }
      return cost;
    });

    return {
      ...newData,
      fixedCosts: updatedFixedCosts
    };
  };

  // Initialize costs when component loads (only once)
  useEffect(() => {
    if (!isInitialized.current && data.productCategory && data.fixedCosts.length === 0) {
      const suggestions = getCostSuggestions(data.productCategory);
      const currentTeamMembers = 5;
      const currentAugmentedResources = 2;

      const systemFixedCosts: CostItem[] = [
        {
          id: 'team-members',
          name: 'Expenditure on Manpower',
          monthlyAmounts: calculateEmployeeCosts(currentTeamMembers),
          icon: 'users',
          isCommon: true,
          unit: `${currentTeamMembers} employees @ 240k/year = ${(currentTeamMembers * 240).toFixed(0)}k annually`
        },
        {
          id: 'augmented-resources',
          name: 'Augmented Resources',
          monthlyAmounts: calculateEmployeeCosts(currentAugmentedResources),
          icon: 'user-plus',
          isCommon: true,
          unit: `${currentAugmentedResources} resources @ 240k/year = ${(currentAugmentedResources * 240).toFixed(0)}k annually`
        },
        {
          id: 'corporate-overheads',
          name: 'Corporate Overheads',
          monthlyAmounts: Array(12).fill(0), // Will be calculated
          icon: 'building',
          isCommon: true,
          unit: `4% of total costs (includes software licenses, office rental, legal compliance)`
        }
      ];

      const initialData = {
        ...data,
        fixedCosts: [
          ...systemFixedCosts,
          ...suggestions.fixedCosts.map(cost => ({ 
            ...cost, 
            monthlyAmounts: cost.monthlyAmounts.map(amount => amount / 1000),
            isCommon: true
          }))
        ],
        variableCosts: suggestions.variableCosts.map(cost => ({ 
          ...cost, 
          monthlyAmounts: cost.monthlyAmounts.map(amount => amount / 1000),
          isCommon: true
        })),
        oneTimeCosts: suggestions.oneTimeCosts.map(cost => ({ 
          ...cost, 
          amount: cost.amount / 1000,
          isCommon: true
        }))
      };

      // Calculate and set corporate overheads
      const finalData = updateCorporateOverheads(initialData);
      onChange(finalData);
      isInitialized.current = true;
    }
  }, [data.productCategory, data.fixedCosts.length]);

  const handleEmployeeInputChange = (field: keyof EmployeeInputs, value: number) => {
    const newInputs = { ...employeeInputs, [field]: value };
    setEmployeeInputs(newInputs);
    
    // Update the corresponding cost items
    const updatedFixedCosts = data.fixedCosts.map(cost => {
      if (cost.id === 'team-members' && field === 'teamMembers') {
        return {
          ...cost,
          monthlyAmounts: calculateEmployeeCosts(value),
          unit: `${value} employees @ 240k/year = ${(value * 240).toFixed(0)}k annually`
        };
      }
      if (cost.id === 'augmented-resources' && field === 'augmentedResources') {
        return {
          ...cost,
          monthlyAmounts: calculateEmployeeCosts(value),
          unit: `${value} resources @ 240k/year = ${(value * 240).toFixed(0)}k annually`
        };
      }
      return cost;
    });
    
    const newData = { ...data, fixedCosts: updatedFixedCosts };
    onChange(updateCorporateOverheads(newData));
  };

  // Handle Previous button with internal tab navigation
  const handlePrevious = () => {
    if (currentTab === 'capex') {
      setCurrentTab('variable');
    } else if (currentTab === 'variable') {
      setCurrentTab('fixed');
    } else {
      // On fixed tab, go to previous main step
      onPrevious();
    }
  };

  const handleCostItemChange = (costType: 'fixed' | 'variable', costId: string, monthIndex: number, value: number) => {
    const costs = costType === 'fixed' ? data.fixedCosts : data.variableCosts;
    const updatedCosts = costs.map(cost => {
      if (cost.id === costId) {
        const newAmounts = [...cost.monthlyAmounts];
        newAmounts[monthIndex] = value;
        return { ...cost, monthlyAmounts: newAmounts };
      }
      return cost;
    });

    let newData;
    if (costType === 'fixed') {
      newData = { ...data, fixedCosts: updatedCosts };
    } else {
      newData = { ...data, variableCosts: updatedCosts };
    }
    
    // Update corporate overheads based on new costs
    onChange(updateCorporateOverheads(newData));
  };

  const handleCostNameChange = (costType: 'fixed' | 'variable', costId: string, newName: string) => {
    const costs = costType === 'fixed' ? data.fixedCosts : data.variableCosts;
    const updatedCosts = costs.map(cost => {
      if (cost.id === costId) {
        return { ...cost, name: newName };
      }
      return cost;
    });

    if (costType === 'fixed') {
      onChange({ ...data, fixedCosts: updatedCosts });
    } else {
      onChange({ ...data, variableCosts: updatedCosts });
    }
  };

  const addFixedCost = () => {
    const newCost: CostItem = {
      id: `fixed-${Date.now()}`,
      name: 'New Fixed Cost',
      monthlyAmounts: Array(12).fill(0),
      icon: 'building',
      isCommon: false,
    };
    const newData = { 
      ...data, 
      fixedCosts: [...data.fixedCosts, newCost]
    };
    onChange(updateCorporateOverheads(newData));
  };

  const addVariableCost = () => {
    const newCost: CostItem = {
      id: `variable-${Date.now()}`,
      name: 'New Variable Cost',
      monthlyAmounts: Array(12).fill(0),
      icon: 'cloud',
      isCommon: false,
    };
    const newData = { 
      ...data, 
      variableCosts: [...data.variableCosts, newCost]
    };
    onChange(updateCorporateOverheads(newData));
  };

  const getIcon = (iconName: string) => {
    const icons = {
      users: Users,
      'user-plus': UserPlus,
      cog: Cog,
      building: Building,
      cloud: Cloud,
      database: Database,
      shield: Shield,
    };
    return icons[iconName as keyof typeof icons] || Cloud;
  };

  const addOneTimeCost = () => {
    const newCost: OneTimeCostItem = {
      id: `onetime-${Date.now()}`,
      name: 'New One-time Cost',
      amount: 0,
      icon: 'shield',
      isCommon: false,
      month: 1,
    };
    const newData = { 
      ...data, 
      oneTimeCosts: [...data.oneTimeCosts, newCost]
    };
    onChange(updateCorporateOverheads(newData));
  };

  const copyAcrossAllMonths = (costType: 'fixed' | 'variable') => {
    const costs = costType === 'fixed' ? data.fixedCosts : data.variableCosts;
    
    // Apply to all costs including common ones (the user should be able to copy any cost)
    const updatedCosts = costs.map(cost => {
      const firstMonthValue = cost.monthlyAmounts[0] || 0;
      return { ...cost, monthlyAmounts: Array(12).fill(firstMonthValue) };
    });

    if (costType === 'fixed') {
      onChange({ 
        ...data, 
        fixedCosts: updatedCosts 
      });
    } else {
      onChange({ 
        ...data, 
        variableCosts: updatedCosts 
      });
    }
  };

  // Remove cost functions
  const removeFixedCost = (costId: string) => {
    // Don't allow removal of system-generated costs
    if (['team-members', 'augmented-resources', 'corporate-overheads'].includes(costId)) return;
    
    const updatedCosts = data.fixedCosts.filter(cost => cost.id !== costId);
    const newData = { ...data, fixedCosts: updatedCosts };
    onChange(updateCorporateOverheads(newData));
  };

  const removeVariableCost = (costId: string) => {
    const updatedCosts = data.variableCosts.filter(cost => cost.id !== costId);
    const newData = { ...data, variableCosts: updatedCosts };
    onChange(updateCorporateOverheads(newData));
  };

  const removeOneTimeCost = (costId: string) => {
    const updatedCosts = data.oneTimeCosts.filter(cost => cost.id !== costId);
    const newData = { ...data, oneTimeCosts: updatedCosts };
    onChange(updateCorporateOverheads(newData));
  };

  const handleTabNavigation = () => {
    if (currentTab === 'fixed') {
      setCurrentTab('variable');
    } else if (currentTab === 'variable') {
      setCurrentTab('onetime');
    } else if (currentTab === 'onetime') {
      setCurrentTab('total');
    } else {
      onNext(); // Go to demand analysis
    }
  };

  const calculateAmortizedCapex = () => {
    const monthlyAmounts = Array(12).fill(0);
    
    data.oneTimeCosts.forEach(cost => {
      const month = (cost.month || 1) - 1; // Convert to 0-based index
      
      // Add the full cost to the selected month
      if (month >= 0 && month < 12) {
        monthlyAmounts[month] += cost.amount;
      }
    });
    
    return monthlyAmounts.map(amount => Number(amount.toFixed(1)));
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const calculateYear1Total = () => {
    const fixedAnnual = data.fixedCosts.reduce((sum, cost) => sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
    const variableAnnual = data.variableCosts.reduce((sum, cost) => sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
    const capexAnnual = calculateAmortizedCapex().reduce((sum, amount) => sum + amount, 0);
    return fixedAnnual + variableAnnual + capexAnnual;
  };

  const copyYearlyValuesWithInflation = () => {
    const year1Total = calculateYear1Total();
    const inflationMultiplier = 1 + (inflationRate / 100);
    
    const newYearlyData = [
      year1Total, // Year 1
      year1Total * inflationMultiplier, // Year 2
      year1Total * Math.pow(inflationMultiplier, 2), // Year 3
      year1Total * Math.pow(inflationMultiplier, 3), // Year 4
      year1Total * Math.pow(inflationMultiplier, 4), // Year 5
    ];
    
    setYearlyData(newYearlyData);
  };

  const handlePasteData = (costType: 'fixed' | 'variable', costId: string, cellIndex: number, event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text');
    
    // Parse Excel/CSV data - handle both tab-separated (Excel) and comma-separated values
    const rows = pasteData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length === 1) {
      // Single row paste - paste across columns for the current cost item
      const values = rows[0].split(/\t|,/).map(val => {
        const num = parseFloat(val.trim());
        return isNaN(num) ? 0 : num;
      });

      if (values.length > 0) {
        const costs = costType === 'fixed' ? data.fixedCosts : data.variableCosts;
        const updatedCosts = costs.map(cost => {
          if (cost.id === costId) {
            const newAmounts = [...cost.monthlyAmounts];
            
            // Apply pasted values starting from the cell where paste occurred
            values.forEach((value, index) => {
              const targetIndex = cellIndex + index;
              if (targetIndex < 12) {
                newAmounts[targetIndex] = value;
              }
            });
            
            return { ...cost, monthlyAmounts: newAmounts };
          }
          return cost;
        });

        if (costType === 'fixed') {
          onChange({ ...data, fixedCosts: updatedCosts });
        } else {
          onChange({ ...data, variableCosts: updatedCosts });
        }
      }
    } else {
      // Multi-row paste - paste across multiple cost items
      const costs = costType === 'fixed' ? data.fixedCosts : data.variableCosts;
      const currentCostIndex = costs.findIndex(cost => cost.id === costId);
      
      if (currentCostIndex !== -1) {
        const updatedCosts = [...costs];
        
        rows.forEach((row, rowIndex) => {
          const targetCostIndex = currentCostIndex + rowIndex;
          if (targetCostIndex < costs.length) {
            const values = row.split(/\t|,/).map(val => {
              const num = parseFloat(val.trim());
              return isNaN(num) ? 0 : num;
            });
            
            const newAmounts = [...updatedCosts[targetCostIndex].monthlyAmounts];
            values.forEach((value, colIndex) => {
              const targetIndex = cellIndex + colIndex;
              if (targetIndex < 12) {
                newAmounts[targetIndex] = value;
              }
            });
            
            updatedCosts[targetCostIndex] = { 
              ...updatedCosts[targetCostIndex], 
              monthlyAmounts: newAmounts 
            };
          }
        });

        if (costType === 'fixed') {
          onChange({ ...data, fixedCosts: updatedCosts });
        } else {
          onChange({ ...data, variableCosts: updatedCosts });
        }
      }
    }
  };

  // Table-level paste handler for large Excel ranges
  const handleTablePaste = (costType: 'fixed' | 'variable', event: React.ClipboardEvent) => {
    const target = event.target as HTMLElement;
    
    // Only handle paste if it's not already handled by an input field
    if (target.tagName === 'INPUT') return;
    
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text');
    const rows = pasteData.split('\n').filter(row => row.trim() !== '');
    
    if (rows.length > 1) {
      const costs = costType === 'fixed' ? data.fixedCosts : data.variableCosts;
      const updatedCosts = [...costs];
      
      // Try to apply each row to available cost items
      rows.forEach((row, rowIndex) => {
        if (rowIndex < costs.length) {
          const values = row.split(/\t|,/).map(val => {
            const num = parseFloat(val.trim());
            return isNaN(num) ? 0 : num;
          });
          
          if (values.length > 0) {
            const newAmounts = [...updatedCosts[rowIndex].monthlyAmounts];
            values.forEach((value, colIndex) => {
              if (colIndex < 12) {
                newAmounts[colIndex] = value;
              }
            });
            
            updatedCosts[rowIndex] = { 
              ...updatedCosts[rowIndex], 
              monthlyAmounts: newAmounts 
            };
          }
        }
      });

      if (costType === 'fixed') {
        onChange({ ...data, fixedCosts: updatedCosts });
      } else {
        onChange({ ...data, variableCosts: updatedCosts });
      }
    }
  };

  const renderCostTable = (costs: CostItem[], costType: 'fixed' | 'variable') => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2 space-y-1">
        <div>All values in $'000s</div>
        <div>📋 <strong>Excel Paste Support:</strong> Select cells in Excel → Copy (Ctrl+C) → Paste into any cell (Ctrl+V) to auto-fill multiple months</div>
        <div>• Single row: Paste into any cell to fill across months for that cost item</div>
        <div>• Multiple rows: Paste multiple Excel rows to fill multiple cost items at once</div>
      </div>
      <div className="overflow-x-auto" onPaste={(e) => handleTablePaste(costType, e)}>
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700" style={{fontSize: '12px'}}>
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Cost Item</th>
              {months.map(month => (
                <th key={month} className="border border-gray-200 dark:border-gray-700 p-2 text-center min-w-20">
                  {month}
                </th>
              ))}
              <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Total $'000s</th>
              <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((cost, costIndex) => {
              const Icon = getIcon(cost.icon);
              const total = cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0);
              
              return (
                <tr key={cost.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-200 dark:border-gray-700 p-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        {cost.isCommon ? (
                          <div>
                            <div className="font-medium">{cost.name}</div>
                            {cost.unit && (
                              <div className="text-xs text-muted-foreground">{cost.unit}</div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Input
                              value={cost.name}
                              onChange={(e) => handleCostNameChange(costType, cost.id, e.target.value)}
                              className="border-0 font-medium bg-transparent p-0 h-auto focus-visible:ring-0"
                              data-testid={`input-cost-name-${cost.id}`}
                              placeholder="Enter cost name"
                            />
                            {cost.unit && (
                              <div className="text-xs text-muted-foreground">{cost.unit}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {cost.monthlyAmounts.map((amount, monthIndex) => (
                    <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-1">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => handleCostItemChange(costType, cost.id, monthIndex, Number(e.target.value))}
                        onPaste={(e) => handlePasteData(costType, cost.id, monthIndex, e)}
                        className="text-center h-8 text-sm"
                        data-testid={`input-cost-${cost.id}-${monthIndex}`}
                        disabled={cost.id === 'team-members' || cost.id === 'augmented-resources' || cost.id === 'corporate-overheads'}
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-medium">
                    {total.toFixed(1)}
                  </td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                    {/* Don't show remove button for system-generated costs */}
                    {!['team-members', 'augmented-resources', 'corporate-overheads'].includes(cost.id) && (
                      <Button
                        onClick={() => costType === 'fixed' ? removeFixedCost(cost.id) : removeVariableCost(cost.id)}
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-300"
                        data-testid={`button-remove-${costType}-${cost.id}`}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex gap-2">
        {costType === 'fixed' && (
          <>
            <Button onClick={addFixedCost} variant="outline" data-testid="button-add-fixed-cost">
              Add Fixed Cost
            </Button>
            <Button onClick={() => copyAcrossAllMonths('fixed')} variant="outline" data-testid="button-copy-fixed-costs">
              Copy P1 Values Across All Months
            </Button>
          </>
        )}
        {costType === 'variable' && (
          <>
            <Button onClick={addVariableCost} variant="outline" data-testid="button-add-variable-cost">
              Add Variable Cost
            </Button>
            <Button onClick={() => copyAcrossAllMonths('variable')} variant="outline" data-testid="button-copy-variable-costs">
              Copy P1 Values Across All Months
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cost Structure</h2>
        <p className="text-muted-foreground">
          Define your cost structure with simplified inputs. All values are expressed in $'000s.
        </p>
      </div>


      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fixed" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
            Fixed Costs
          </TabsTrigger>
          <TabsTrigger value="variable" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900">
            Variable Costs
          </TabsTrigger>
          <TabsTrigger value="onetime" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900">
            Capex
          </TabsTrigger>
          <TabsTrigger value="total" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
            Total Costs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-4">
          {/* Team Configuration - Only for Fixed Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Team Configuration</CardTitle>
              <CardDescription>
                Simplified employee inputs - costs are auto-calculated at $240k/year per person
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team-members">Number of Team Members</Label>
                  <Input
                    id="team-members"
                    type="number"
                    value={employeeInputs.teamMembers}
                    onChange={(e) => handleEmployeeInputChange('teamMembers', Number(e.target.value))}
                    data-testid="input-team-members"
                  />
                </div>
                <div>
                  <Label htmlFor="augmented-resources">Number of Augmented Resources</Label>
                  <Input
                    id="augmented-resources"
                    type="number"
                    value={employeeInputs.augmentedResources}
                    onChange={(e) => handleEmployeeInputChange('augmentedResources', Number(e.target.value))}
                    data-testid="input-augmented-resources"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-900">Fixed Costs $'000s</CardTitle>
              <CardDescription>
                Costs that remain constant regardless of usage or scale. Employee costs are auto-calculated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCostTable(data.fixedCosts, 'fixed')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variable" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-900">Variable Costs $'000s</CardTitle>
              <CardDescription>
                Costs that change based on usage, scale, or customer volume. Enter total monthly amounts (not per-unit rates).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCostTable(data.variableCosts, 'variable')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onetime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-900">Capex $'000s</CardTitle>
              <CardDescription>
                Capital expenditures, initial setup costs, and one-off investments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Cost Item</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Amount $'000s</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Month Incurred</th>
                      <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.oneTimeCosts.map((cost) => {
                      const Icon = getIcon(cost.icon);
                      return (
                        <tr key={cost.id}>
                          <td className="border border-gray-200 dark:border-gray-700 p-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <Input
                                value={cost.name}
                                onChange={(e) => {
                                  const updatedCosts = data.oneTimeCosts.map(c => 
                                    c.id === cost.id ? { ...c, name: e.target.value } : c
                                  );
                                  onChange({ ...data, oneTimeCosts: updatedCosts });
                                }}
                                className="border-0 font-medium"
                                data-testid={`input-onetime-name-${cost.id}`}
                              />
                            </div>
                          </td>
                          <td className="border border-gray-200 dark:border-gray-700 p-1">
                            <Input
                              type="number"
                              value={cost.amount}
                              onChange={(e) => {
                                const updatedCosts = data.oneTimeCosts.map(c => 
                                  c.id === cost.id ? { ...c, amount: Number(e.target.value) } : c
                                );
                                onChange({ ...data, oneTimeCosts: updatedCosts });
                              }}
                              className="text-center h-8"
                              data-testid={`input-onetime-amount-${cost.id}`}
                            />
                          </td>
                          <td className="border border-gray-200 dark:border-gray-700 p-1">
                            <Select
                              value={cost.month?.toString() || "1"}
                              onValueChange={(value) => {
                                const updatedCosts = data.oneTimeCosts.map(c => 
                                  c.id === cost.id ? { ...c, month: Number(value) } : c
                                );
                                onChange({ ...data, oneTimeCosts: updatedCosts });
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="P1" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    P{i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                            <Button
                              onClick={() => removeOneTimeCost(cost.id)}
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:border-red-300"
                              data-testid={`button-remove-onetime-${cost.id}`}
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button onClick={addOneTimeCost} variant="outline" data-testid="button-add-onetime-cost">
                Add One-time Cost
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="total" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-900">Cash Flow Projection ($'000s)</CardTitle>
              <CardDescription>
                Complete overview of all costs with Capex amortized over 36 months.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Year 1 Financial Projection ($'000s)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Cost Category</th>
                      {months.map(month => (
                        <th key={month} className="border border-gray-200 dark:border-gray-700 p-2 text-center min-w-20">
                          {month}
                        </th>
                      ))}
                      <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Total Year 1 ($'000s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fixed Costs Category */}
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 p-2 font-medium text-blue-900">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCategoryExpansion('fixed')}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                            data-testid="button-toggle-fixed"
                          >
                            {expandedCategories.fixed ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </button>
                          Fixed Costs
                        </div>
                      </td>
                      {months.map((_, monthIndex) => {
                        const monthlyTotal = data.fixedCosts.reduce((sum, cost) => sum + cost.monthlyAmounts[monthIndex], 0);
                        return (
                          <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                            {monthlyTotal.toFixed(1)}
                          </td>
                        );
                      })}
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-medium">
                        {data.fixedCosts.reduce((sum, cost) => sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0).toFixed(1)}
                      </td>
                    </tr>
                    {expandedCategories.fixed && data.fixedCosts.map((cost) => (
                      <tr key={cost.id} className="bg-blue-50 dark:bg-blue-950/20">
                        <td className="border border-gray-200 dark:border-gray-700 p-2 pl-8 text-sm text-gray-600 dark:text-gray-400">
                          {cost.name}
                        </td>
                        {cost.monthlyAmounts.map((amount, monthIndex) => (
                          <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center text-sm">
                            {amount.toFixed(1)}
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center text-sm">
                          {cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(1)}
                        </td>
                      </tr>
                    ))}

                    {/* Variable Costs Category */}
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 p-2 font-medium text-orange-900">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCategoryExpansion('variable')}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                            data-testid="button-toggle-variable"
                          >
                            {expandedCategories.variable ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </button>
                          Variable Costs
                        </div>
                      </td>
                      {months.map((_, monthIndex) => {
                        const monthlyTotal = data.variableCosts.reduce((sum, cost) => sum + cost.monthlyAmounts[monthIndex], 0);
                        return (
                          <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                            {monthlyTotal.toFixed(1)}
                          </td>
                        );
                      })}
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-medium">
                        {data.variableCosts.reduce((sum, cost) => sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0).toFixed(1)}
                      </td>
                    </tr>
                    {expandedCategories.variable && data.variableCosts.map((cost) => (
                      <tr key={cost.id} className="bg-orange-50 dark:bg-orange-950/20">
                        <td className="border border-gray-200 dark:border-gray-700 p-2 pl-8 text-sm text-gray-600 dark:text-gray-400">
                          {cost.name}
                        </td>
                        {cost.monthlyAmounts.map((amount, monthIndex) => (
                          <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center text-sm">
                            {amount.toFixed(1)}
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center text-sm">
                          {cost.monthlyAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(1)}
                        </td>
                      </tr>
                    ))}

                    {/* Capex Category */}
                    <tr>
                      <td className="border border-gray-200 dark:border-gray-700 p-2 font-medium text-green-900">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCategoryExpansion('capex')}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                            data-testid="button-toggle-capex"
                          >
                            {expandedCategories.capex ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </button>
                          Capex (Cash Flow)
                        </div>
                      </td>
                      {calculateAmortizedCapex().map((amount, monthIndex) => (
                        <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                          {amount}
                        </td>
                      ))}
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-medium">
                        {(data.oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0)).toFixed(1)}
                      </td>
                    </tr>
                    {expandedCategories.capex && data.oneTimeCosts.map((cost) => (
                      <tr key={cost.id} className="bg-green-50 dark:bg-green-950/20">
                        <td className="border border-gray-200 dark:border-gray-700 p-2 pl-8 text-sm text-gray-600 dark:text-gray-400">
                          {cost.name} (P{cost.month || 1})
                        </td>
                        {Array.from({ length: 12 }, (_, monthIndex) => {
                          const selectedMonth = (cost.month || 1) - 1;
                          const amount = monthIndex === selectedMonth ? cost.amount : 0;
                          return (
                            <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center text-sm">
                              {amount.toFixed(1)}
                            </td>
                          );
                        })}
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center text-sm">
                          {cost.amount.toFixed(1)}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <td className="border border-gray-200 dark:border-gray-700 p-2 font-bold">Total Monthly Cost</td>
                      {months.map((_, monthIndex) => {
                        const fixedTotal = data.fixedCosts.reduce((sum, cost) => sum + cost.monthlyAmounts[monthIndex], 0);
                        const variableTotal = data.variableCosts.reduce((sum, cost) => sum + cost.monthlyAmounts[monthIndex], 0);
                        const capexAmortized = calculateAmortizedCapex()[monthIndex];
                        const totalMonthly = fixedTotal + variableTotal + capexAmortized;
                        return (
                          <td key={monthIndex} className="border border-gray-200 dark:border-gray-700 p-2 text-center font-bold">
                            {totalMonthly.toFixed(1)}
                          </td>
                        );
                      })}
                      <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-bold">
                        {(() => {
                          const fixedAnnual = data.fixedCosts.reduce((sum, cost) => sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
                          const variableAnnual = data.variableCosts.reduce((sum, cost) => sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
                          const capexAnnual = data.oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0);
                          return (fixedAnnual + variableAnnual + capexAnnual).toFixed(1);
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Multi-Year Projection Table */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">5-Year Financial Projection ($'000s)</h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="inflation-rate" className="text-sm font-medium">Inflation Rate:</Label>
                    <Input
                      id="inflation-rate"
                      type="number"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(Number(e.target.value))}
                      className="w-20 h-8 text-center"
                      min="0"
                      max="20"
                      step="0.1"
                      data-testid="input-inflation-rate"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                  <Button 
                    onClick={copyYearlyValuesWithInflation} 
                    variant="outline" 
                    size="sm"
                    data-testid="button-copy-yearly-values"
                  >
                    Copy Year 1 values across Years 2-5 with inflation
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 1</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 2</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 3</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 4</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 5</th>
                        <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Total 5-Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-medium">
                          {calculateYear1Total().toFixed(1)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                          <Input
                            type="number"
                            value={yearlyData[1] || ''}
                            onChange={(e) => {
                              const newData = [...yearlyData];
                              newData[1] = Number(e.target.value) || 0;
                              setYearlyData(newData);
                            }}
                            className="w-full text-center h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                          <Input
                            type="number"
                            value={yearlyData[2] || ''}
                            onChange={(e) => {
                              const newData = [...yearlyData];
                              newData[2] = Number(e.target.value) || 0;
                              setYearlyData(newData);
                            }}
                            className="w-full text-center h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                          <Input
                            type="number"
                            value={yearlyData[3] || ''}
                            onChange={(e) => {
                              const newData = [...yearlyData];
                              newData[3] = Number(e.target.value) || 0;
                              setYearlyData(newData);
                            }}
                            className="w-full text-center h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center">
                          <Input
                            type="number"
                            value={yearlyData[4] || ''}
                            onChange={(e) => {
                              const newData = [...yearlyData];
                              newData[4] = Number(e.target.value) || 0;
                              setYearlyData(newData);
                            }}
                            className="w-full text-center h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 p-2 text-center font-bold">
                          {(() => {
                            const total = yearlyData.reduce((sum, value) => sum + (value || 0), 0) + calculateYear1Total();
                            return total > 0 ? total.toFixed(1) : '-';
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button onClick={handlePrevious} variant="outline" data-testid="button-previous">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button onClick={handleTabNavigation} data-testid="button-next">
          {currentTab === 'total' ? 'Next: Demand Analysis' : `Next: ${currentTab === 'fixed' ? 'Variable Costs' : currentTab === 'variable' ? 'Capex' : 'Total Costs'}`}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}