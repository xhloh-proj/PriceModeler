import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import HeaderNavigation from "@/components/header-navigation";
import StepSidebar from "@/components/step-sidebar";
import StepProductSetup from "@/components/step-product-setup";
import StepCostStructure from "@/components/step-cost-structure";
import StepDemandAnalysis from "@/components/step-demand-analysis";
import type { InsertPricingProject } from "@shared/schema";

export default function PricingStudio() {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<InsertPricingProject>({
    name: "",
    category: "",
    description: "",
    targetMarket: "",
    fixedCosts: [],
    variableCosts: [],
    oneTimeCosts: [],
    costIncreaseAssumptions: [],
    initialUsers: 100,
    growthRate: 15,
    churnRate: 5,
    marketSize: 50000,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveProjectMutation = useMutation({
    mutationFn: async (data: InsertPricingProject) => {
      return await apiRequest("POST", "/api/pricing-projects", data);
    },
    onSuccess: () => {
      toast({
        title: "Project Saved",
        description: "Your pricing model has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pricing-projects"] });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "There was an error saving your project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProductDataChange = (data: { name: string; category: string; description: string; targetMarket: string }) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  const handleCostStructureChange = (data: { 
    fixedCosts: any[]; 
    variableCosts: any[]; 
    oneTimeCosts: any[]; 
    costIncreaseAssumptions: any[];
    productCategory: string;
  }) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  const handleDemandDataChange = (data: { growthRate: number; productDemand: number[] }) => {
    setProjectData(prev => ({
      ...prev,
      growthRate: data.growthRate,
      productDemand: data.productDemand,
    }));
  };

  const handleSave = () => {
    saveProjectMutation.mutate(projectData);
  };

  const handleExport = () => {
    // Create a simple CSV export
    const csvData = [
      ["Metric", "Value"],
      ["Product Name", projectData.name],
      ["Category", projectData.category],
      ["Target Market", projectData.targetMarket],
      ["Initial Users", projectData.initialUsers.toString()],
      ["Growth Rate", `${projectData.growthRate}%`],
      ["Churn Rate", `${projectData.churnRate}%`],
      ["Market Size", projectData.marketSize.toString()],
    ];

    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${projectData.name || "pricing-model"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Your pricing model has been exported successfully.",
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepProductSetup
            data={{
              name: projectData.name,
              category: projectData.category,
              description: projectData.description || "",
              targetMarket: projectData.targetMarket,
            }}
            onChange={handleProductDataChange}
            onNext={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <StepCostStructure
            data={{
              fixedCosts: projectData.fixedCosts || [],
              variableCosts: projectData.variableCosts || [],
              oneTimeCosts: projectData.oneTimeCosts || [],
              costIncreaseAssumptions: projectData.costIncreaseAssumptions || [],
              productCategory: projectData.category,
            }}
            onChange={handleCostStructureChange}
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <StepDemandAnalysis
            data={{
              growthRate: projectData.growthRate || 0,
              productDemand: projectData.productDemand || [0, 0, 0, 0, 0],
            }}
            onChange={handleDemandDataChange}
            onPrevious={() => setCurrentStep(2)}
            onSave={handleSave}
            onExport={handleExport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNavigation onSave={handleSave} onExport={handleExport} />
      <div className="flex h-screen">
        <StepSidebar currentStep={currentStep} projectName={projectData.name} />
        <main className="flex-1 overflow-auto">
          {renderCurrentStep()}
        </main>
      </div>
    </div>
  );
}
