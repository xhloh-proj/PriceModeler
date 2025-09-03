import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

interface ProductData {
  name: string;
  category: string;
  description: string;
  targetMarket: string;
}

interface StepProductSetupProps {
  data: ProductData;
  onChange: (data: ProductData) => void;
  onNext: () => void;
}

export default function StepProductSetup({ data, onChange, onNext }: StepProductSetupProps) {
  const handleInputChange = (field: keyof ProductData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const canProceed = data.name && data.category;

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">Let's start with your product</h2>
          <p className="text-muted-foreground">
            Tell us about your product so we can suggest the right cost structure for your pricing model.
          </p>
        </div>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="product-name" className="text-sm font-medium text-card-foreground">
                  Product Name
                </Label>
                <Input
                  id="product-name"
                  type="text"
                  placeholder="Enter your product name"
                  value={data.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  data-testid="input-product-name"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="product-category" className="text-sm font-medium text-card-foreground">
                  Product Category
                </Label>
                <Select value={data.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-2" data-testid="select-product-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure Products</SelectItem>
                    <SelectItem value="platform">Platform Products</SelectItem>
                    <SelectItem value="applications">Applications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="product-description" className="text-sm font-medium text-card-foreground">
                  Product Description
                </Label>
                <Textarea
                  id="product-description"
                  placeholder="Briefly describe your product's main features and value proposition"
                  value={data.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  data-testid="textarea-product-description"
                  className="mt-2 h-24 resize-none"
                />
              </div>
              
              <div>
                <Label htmlFor="target-market" className="text-sm font-medium text-card-foreground">
                  Target Market <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  This helps tailor cost suggestions and pricing benchmarks to your audience size and complexity
                </p>
                <Select value={data.targetMarket} onValueChange={(value) => handleInputChange('targetMarket', value)}>
                  <SelectTrigger className="mt-2" data-testid="select-target-market">
                    <SelectValue placeholder="Select target market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                    <SelectItem value="smb">Small & Medium Business (10-999 employees)</SelectItem>
                    <SelectItem value="startup">Startups (1-10 employees)</SelectItem>
                    <SelectItem value="consumer">Individual Consumers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button
                onClick={onNext}
                disabled={!canProceed}
                data-testid="button-continue-cost-structure"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue to Cost Structure
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
