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

interface StepDemandAnalysisProps {
  data: DemandAnalysisData;
  onChange: (data: DemandAnalysisData) => void;
  onPrevious: () => void;
  onSave: () => void;
  onExport: () => void;
}

export default function StepDemandAnalysis({ data, onChange, onPrevious, onSave, onExport }: StepDemandAnalysisProps) {
  const handleGrowthRateChange = (value: number) => {
    onChange({
      ...data,
      growthRate: value
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
            <Label htmlFor="demand-growth-rate" className="text-sm font-medium">Growth Rate (optional):</Label>
            <Input
              id="demand-growth-rate"
              type="number"
              value={data.growthRate || ''}
              onChange={(e) => handleGrowthRateChange(Number(e.target.value) || 0)}
              className="w-20 h-8 text-center"
              min="0"
              max="100"
              step="0.1"
              data-testid="input-demand-growth-rate"
              placeholder="0"
            />
            <span className="text-sm text-gray-600">%</span>
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
