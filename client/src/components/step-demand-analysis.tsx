import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Save } from "lucide-react";
import { useState, useEffect } from "react";

interface DemandAnalysisData {
  growthRate: number;
  productDemand: number[];
}

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

interface ProjectData {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  oneTimeCosts: OneTimeCostItem[];
}

interface StepDemandAnalysisProps {
  data: DemandAnalysisData;
  projectData: ProjectData;
  onChange: (data: DemandAnalysisData) => void;
  onPrevious: () => void;
  onSave: () => void;
  onExport: () => void;
}

export default function StepDemandAnalysis({ data, projectData, onChange, onPrevious, onSave, onExport }: StepDemandAnalysisProps) {
  const [tempGrowthRate, setTempGrowthRate] = useState(data.growthRate);
  const [fixedPrice, setFixedPrice] = useState<number>(0);

  const handleGrowthRateChange = (value: number) => {
    setTempGrowthRate(value);
  };

  const applyGrowthRate = () => {
    const baseYear1 = data.productDemand[0] || 0;
    if (baseYear1 === 0 || tempGrowthRate === 0) return;

    const newDemand = [baseYear1];
    for (let i = 1; i < 5; i++) {
      const previousYear = newDemand[i - 1];
      newDemand.push(Math.round(previousYear * (1 + tempGrowthRate / 100)));
    }

    onChange({
      ...data,
      growthRate: tempGrowthRate,
      productDemand: newDemand
    });
  };

  const handleDemandChange = (yearIndex: number, value: number) => {
    const updatedDemand = [...data.productDemand];
    updatedDemand[yearIndex] = value;
    onChange({
      ...data,
      productDemand: updatedDemand
    });
  };

  // Calculate total costs over 5 years
  const calculateTotalCosts = () => {
    const fixedCostPerYear = projectData.fixedCosts.reduce((sum, cost) => 
      sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
    const variableCostPerYear = projectData.variableCosts.reduce((sum, cost) => 
      sum + cost.monthlyAmounts.reduce((monthSum, amount) => monthSum + amount, 0), 0);
    const oneTimeCosts = projectData.oneTimeCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    const annualCosts = fixedCostPerYear + variableCostPerYear;
    const totalFiveYearCosts = (annualCosts * 5) + oneTimeCosts;
    
    return totalFiveYearCosts;
  };

  // Calculate total demand over 5 years
  const calculateTotalDemand = () => {
    return data.productDemand.reduce((sum, demand) => sum + demand, 0);
  };

  // Calculate pricing recommendations
  const calculatePricingRecommendations = () => {
    const totalCosts = calculateTotalCosts();
    const totalDemand = calculateTotalDemand();
    
    if (totalDemand === 0) return { breakeven: 0, ebit90: 0, ebit110: 0 };
    
    const breakevenPrice = totalCosts / totalDemand;
    const ebit90Price = breakevenPrice / 0.9; // 90% cost ratio means 10% profit margin
    const ebit110Price = breakevenPrice / 1.1; // 110% cost ratio means -10% loss (conservative pricing)
    
    return {
      breakeven: Math.round(breakevenPrice * 100) / 100,
      ebit90: Math.round(ebit90Price * 100) / 100,
      ebit110: Math.round(ebit110Price * 100) / 100
    };
  };

  const pricingRecommendations = calculatePricingRecommendations();

  // Calculate breakeven analysis for fixed price
  const calculateBreakevenAnalysis = () => {
    const totalCosts = calculateTotalCosts();
    
    if (fixedPrice === 0) return { breakeven: 0, tcrr110: 0, tcrr90: 0 };
    
    const breakevenUnits = Math.ceil(totalCosts / fixedPrice);
    const tcrr110Units = Math.ceil((totalCosts / 1.1) / fixedPrice); // For 110% TCRR, need revenue = cost/1.1
    const tcrr90Units = Math.ceil((totalCosts / 0.9) / fixedPrice); // For 90% TCRR, need revenue = cost/0.9
    
    return {
      breakeven: breakevenUnits,
      tcrr110: tcrr110Units,
      tcrr90: tcrr90Units
    };
  };

  const breakevenAnalysis = calculateBreakevenAnalysis();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Demand</h2>
        <p className="text-muted-foreground">
          Define your product demand projections across multiple years.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Product Demand Projections</CardTitle>
          <CardDescription>
            Enter demand projections for Product 1 across a 5-year period.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Growth Rate Input */}
          <div className="flex items-center gap-2">
            <Label htmlFor="demand-growth-rate" className="text-sm font-medium">Growth Rate:</Label>
            <Input
              id="demand-growth-rate"
              type="number"
              value={tempGrowthRate || ''}
              onChange={(e) => setTempGrowthRate(Number(e.target.value) || 0)}
              className="w-20 h-8 text-center"
              min="0"
              max="100"
              step="0.1"
              data-testid="input-demand-growth-rate"
              placeholder="0"
            />
            <span className="text-sm text-gray-600">%</span>
            <Button
              onClick={applyGrowthRate}
              size="sm"
              variant="outline"
              data-testid="button-apply-growth-rate"
              disabled={data.productDemand[0] === 0 || tempGrowthRate === 0}
            >
              Apply
            </Button>
            <span className="text-xs text-muted-foreground">
              (Enter Year 1 demand first, then apply growth rate to calculate Years 2-5)
            </span>
          </div>

          {/* Product Demand Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Product</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 1</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 2</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 3</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 4</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2 text-center">Year 5</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-700 p-2 font-medium">
                    Product 1
                  </td>
                  {[0, 1, 2, 3, 4].map((yearIndex) => (
                    <td key={yearIndex} className="border border-gray-200 dark:border-gray-700 p-1">
                      <Input
                        type="number"
                        value={data.productDemand[yearIndex] || ''}
                        onChange={(e) => handleDemandChange(yearIndex, Number(e.target.value) || 0)}
                        className="text-center h-8"
                        placeholder="0"
                        data-testid={`input-demand-year-${yearIndex + 1}`}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Recommendations */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-green-900">Pricing Recommendations</CardTitle>
          <CardDescription>
            Based on total costs and demand projections across 5 years.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Breakeven Price</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${pricingRecommendations.breakeven.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">per unit</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-600">Target Price (110% TCRR)</div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                ${pricingRecommendations.ebit90.toLocaleString()}
              </div>
              <div className="text-xs text-orange-500 mt-1">per unit</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-600">Conservative Price (90% TCRR)</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                ${pricingRecommendations.ebit110.toLocaleString()}
              </div>
              <div className="text-xs text-green-500 mt-1">per unit</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <div><strong>Total 5-Year Costs:</strong> ${calculateTotalCosts().toLocaleString()} thousand</div>
            <div><strong>Total 5-Year Demand:</strong> {calculateTotalDemand().toLocaleString()} units</div>
            <div><strong>Note:</strong> TCRR = Total Cost Recovery Ratio</div>
          </div>
        </CardContent>
      </Card>

      {/* Breakeven Analysis for Set Price */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-blue-900">Breakeven Analysis for Set Price</CardTitle>
          <CardDescription>
            Enter a fixed price per unit to see how many units are needed for different TCRR targets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="fixed-price" className="text-sm font-medium">Fixed Price per Unit:</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  id="fixed-price"
                  type="number"
                  value={fixedPrice || ''}
                  onChange={(e) => setFixedPrice(Number(e.target.value) || 0)}
                  className="w-32 text-center"
                  min="0"
                  step="0.01"
                  data-testid="input-fixed-price"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {fixedPrice > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Units to Breakeven</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {breakevenAnalysis.breakeven.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">units</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-orange-600">Units for 110% TCRR</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                    {breakevenAnalysis.tcrr110.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-500 mt-1">units</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm font-medium text-green-600">Units for 90% TCRR</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                    {breakevenAnalysis.tcrr90.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-500 mt-1">units</div>
                </div>
              </div>
            )}
            
            {fixedPrice > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <div><strong>At ${fixedPrice}/unit:</strong> Revenue scenarios based on total 5-year costs of ${calculateTotalCosts().toLocaleString()} thousand</div>
              </div>
            )}
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
