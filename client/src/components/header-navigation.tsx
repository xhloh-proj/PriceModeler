import { Button } from "@/components/ui/button";
import { ChartLine, Save, Download } from "lucide-react";

interface HeaderNavigationProps {
  onSave?: () => void;
  onExport?: () => void;
}

export default function HeaderNavigation({ onSave, onExport }: HeaderNavigationProps) {
  return (
    <header className="bg-white border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <ChartLine className="text-primary-foreground w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Price Modeller (Single Product)</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onSave}
            data-testid="button-save-project"
            className="text-muted-foreground hover:text-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Project
          </Button>
          <Button
            onClick={onExport}
            data-testid="button-export-model"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Model
          </Button>
        </div>
      </div>
    </header>
  );
}
