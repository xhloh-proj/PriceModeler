import { Card } from "@/components/ui/card";

interface StepSidebarProps {
  currentStep: number;
  projectName: string;
  onStepChange?: (step: number) => void;
}

export default function StepSidebar({ currentStep, projectName, onStepChange }: StepSidebarProps) {
  const steps = [
    { number: 1, title: "Product Setup", subtitle: "Name & nature" },
    { number: 2, title: "Cost Structure", subtitle: "Fixed & variable costs" },
    { number: 3, title: "Demand & Pricing", subtitle: "Projections & analysis" },
    { number: 4, title: "Executive Summary", subtitle: "KPIs & P&L analysis" },
  ];

  return (
    <aside className="w-48 bg-card border-r border-border">
      <div className="p-4">
        <h2 className="text-base font-semibold text-card-foreground mb-4">Project Steps</h2>
        
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                step.number <= currentStep
                  ? "bg-primary/10 border-l-4 border-primary"
                  : ""
              }`}
              data-testid={`step-indicator-${step.number}`}
              onClick={() => onStepChange && onStepChange(step.number)}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.number <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <div>
                <div
                  className={`font-medium ${
                    step.number <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium text-card-foreground mb-2">Current Project</h3>
          <p className="text-sm text-muted-foreground" data-testid="text-project-name">
            {projectName || "New Pricing Model"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Created today</p>
        </div>
      </div>
    </aside>
  );
}
