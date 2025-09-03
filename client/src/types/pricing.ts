export interface CostElement {
  id: string;
  name: string;
  amount: number;
  icon: string;
  unit?: string;
}

export interface DemandProjection {
  initialUsers: number;
  growthRate: number;
  churnRate: number;
  marketSize: number;
}

export interface PricingCalculation {
  breakeven: number;
  profit90: number;
  profit110: number;
  totalFixedCosts: number;
  totalVariableCosts: number;
  costPerUser: number;
}

export interface RevenueProjection {
  month: string;
  revenue: number;
  costs: number;
  users: number;
}

export interface FinancialMetrics {
  cac: number;
  ltv: number;
  paybackPeriod: number;
  breakEvenUsers: number;
}
