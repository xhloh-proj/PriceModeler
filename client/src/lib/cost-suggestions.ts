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

export interface CostSuggestions {
  fixedCosts: CostItem[];
  variableCosts: CostItem[];
  oneTimeCosts: OneTimeCostItem[];
}

// Fixed costs are now minimal - software licenses, office rental, legal compliance moved to Corporate Overheads
const commonFixedCosts: CostItem[] = [
  {
    id: "monthly-maintenance",
    name: "Monthly Maintenance",
    monthlyAmounts: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    icon: "wrench",
    isCommon: true,
    unit: "monthly"
  }
];

// Variable costs that are common to all product categories
const commonVariableCosts: CostItem[] = [
  {
    id: "cloud-hosting",
    name: "Cloud hosting",
    monthlyAmounts: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
    icon: "cloud",
    unit: "total monthly cost",
    isCommon: true
  }
];

const commonOneTimeCosts: OneTimeCostItem[] = [
  {
    id: "system-design",
    name: "Initial system design and architecture",
    amount: 25000,
    icon: "blueprint",
    isCommon: true
  },
  {
    id: "security-assessment",
    name: "Security assessments and penetration testing",
    amount: 15000,
    icon: "shield-check",
    isCommon: true
  },
  {
    id: "deployment-costs",
    name: "Go-live deployment costs",
    amount: 8000,
    icon: "rocket",
    isCommon: true
  },
  {
    id: "training-docs",
    name: "Initial training and documentation",
    amount: 12000,
    icon: "book",
    isCommon: true
  }
];

// Infrastructure Products - unique costs for data centers and hardware
const infrastructureUniqueFixedCosts: CostItem[] = [
  {
    id: "plant-equipment-maintenance",
    name: "Plant & Equipment Maintenance",
    monthlyAmounts: [15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000, 15000],
    icon: "cog",
    isCommon: false,
    unit: "monthly"
  },
  {
    id: "utilities-power-cooling",
    name: "Utilities (power/cooling)",
    monthlyAmounts: [5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500, 5500],
    icon: "zap",
    isCommon: false,
    unit: "monthly"
  }
];

const infrastructureUniqueVariableCosts: CostItem[] = [
  {
    id: "bandwidth-charges",
    name: "Bandwidth charges",
    monthlyAmounts: [3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000],
    icon: "wifi",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "cross-region-replication",
    name: "Cross-region replication",
    monthlyAmounts: [2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400],
    icon: "globe",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "hardware-scaling",
    name: "Hardware scaling costs",
    monthlyAmounts: [3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600],
    icon: "server",
    unit: "total monthly cost",
    isCommon: false
  }
];

const infrastructureUniqueOneTimeCosts: OneTimeCostItem[] = [
  {
    id: "datacenter-setup",
    name: "Data centre setup",
    amount: 50000,
    icon: "server",
    isCommon: false
  },
  {
    id: "disaster-recovery",
    name: "Disaster recovery establishment",
    amount: 30000,
    icon: "life-buoy",
    isCommon: false
  },
  {
    id: "onprem-servers",
    name: "On-prem servers and networking",
    amount: 75000,
    icon: "server",
    isCommon: false
  },
  {
    id: "vendor-setup",
    name: "Vendor set up costs",
    amount: 20000,
    icon: "building",
    isCommon: false
  }
];

// Platform Products - unique costs for API platforms and developer tools
const platformUniqueFixedCosts: CostItem[] = [
  {
    id: "dev-portal-maintenance",
    name: "Developer portal maintenance",
    monthlyAmounts: [2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200, 2200],
    icon: "code",
    isCommon: false,
    unit: "monthly"
  }
];

const platformUniqueVariableCosts: CostItem[] = [
  {
    id: "dev-onboarding",
    name: "Developer onboarding",
    monthlyAmounts: [1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1500],
    icon: "user-plus",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "multitenant-resources",
    name: "Multi-tenant resources",
    monthlyAmounts: [3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600, 3600],
    icon: "database",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "api-gateway",
    name: "API gateway",
    monthlyAmounts: [2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400],
    icon: "layers",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "portal-maintenance",
    name: "Portal maintenance",
    monthlyAmounts: [1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800, 1800],
    icon: "globe",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "penetration-testing",
    name: "Penetration testing",
    monthlyAmounts: [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200],
    icon: "shield",
    unit: "total monthly cost",
    isCommon: false
  }
];

const platformUniqueOneTimeCosts: OneTimeCostItem[] = [
  {
    id: "sdk-development",
    name: "SDK development",
    amount: 40000,
    icon: "package",
    isCommon: false
  },
  {
    id: "partner-integration",
    name: "Partner integration frameworks",
    amount: 25000,
    icon: "git-branch",
    isCommon: false
  }
];

// Application Products - unique costs for mobile/web app development
const applicationUniqueFixedCosts: CostItem[] = [
  {
    id: "ui-ux-teams",
    name: "UI/UX design teams",
    monthlyAmounts: [8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500, 8500],
    icon: "palette",
    isCommon: false,
    unit: "monthly"
  },
  {
    id: "app-store-registration",
    name: "App store registrations",
    monthlyAmounts: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    icon: "smartphone",
    isCommon: false,
    unit: "monthly"
  }
];

const applicationUniqueVariableCosts: CostItem[] = [
  {
    id: "push-notifications-postman",
    name: "Push notifications/Postman",
    monthlyAmounts: [450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450, 450],
    icon: "mail",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "app-store-fees",
    name: "App store transaction fees",
    monthlyAmounts: [900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900],
    icon: "credit-card",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "user-analytics",
    name: "User analytics",
    monthlyAmounts: [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200],
    icon: "bar-chart",
    unit: "total monthly cost",
    isCommon: false
  },
  {
    id: "app-security-testing",
    name: "App security testing",
    monthlyAmounts: [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200],
    icon: "shield",
    unit: "total monthly cost",
    isCommon: false
  }
];

const applicationUniqueOneTimeCosts: OneTimeCostItem[] = [
  {
    id: "mobile-app-dev",
    name: "Mobile app development",
    amount: 35000,
    icon: "smartphone",
    isCommon: false
  },
  {
    id: "accessibility-audits",
    name: "Accessibility audits",
    amount: 8000,
    icon: "accessibility",
    isCommon: false
  }
];

export function getCostSuggestions(productCategory: string): CostSuggestions {
  let uniqueFixed: CostItem[] = [];
  let uniqueVariable: CostItem[] = [];
  let uniqueOneTime: OneTimeCostItem[] = [];

  switch (productCategory) {
    case "infrastructure":
      uniqueFixed = infrastructureUniqueFixedCosts;
      uniqueVariable = infrastructureUniqueVariableCosts;
      uniqueOneTime = infrastructureUniqueOneTimeCosts;
      break;
    case "platform":
      uniqueFixed = platformUniqueFixedCosts;
      uniqueVariable = platformUniqueVariableCosts;
      uniqueOneTime = platformUniqueOneTimeCosts;
      break;
    case "applications":
      uniqueFixed = applicationUniqueFixedCosts;
      uniqueVariable = applicationUniqueVariableCosts;
      uniqueOneTime = applicationUniqueOneTimeCosts;
      break;
  }

  return {
    fixedCosts: [...commonFixedCosts, ...uniqueFixed],
    variableCosts: [...commonVariableCosts, ...uniqueVariable],
    oneTimeCosts: [...commonOneTimeCosts, ...uniqueOneTime]
  };
}