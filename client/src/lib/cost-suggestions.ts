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

const commonFixedCosts: CostItem[] = [
  {
    id: "staff-dev",
    name: "Staff costs (development team salaries)",
    monthlyAmounts: [50000, 50000, 50000, 55000, 55000, 55000, 60000, 60000, 60000, 65000, 65000, 65000],
    icon: "users",
    isCommon: true
  },
  {
    id: "software-licenses",
    name: "Software licences (basic development tools)",
    monthlyAmounts: [2000, 2000, 2000, 2000, 2000, 2000, 2500, 2500, 2500, 2500, 2500, 2500],
    icon: "key",
    isCommon: true
  },
  {
    id: "office-rental",
    name: "Office rental and utilities",
    monthlyAmounts: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000],
    icon: "building",
    isCommon: true
  },
  {
    id: "legal-compliance",
    name: "Legal and compliance baseline",
    monthlyAmounts: [3000, 3000, 3000, 3000, 3000, 3000, 3500, 3500, 3500, 3500, 3500, 3500],
    icon: "briefcase",
    isCommon: true
  },
  {
    id: "project-management",
    name: "Project management overhead",
    monthlyAmounts: [5000, 5000, 5000, 5500, 5500, 5500, 6000, 6000, 6000, 6500, 6500, 6500],
    icon: "clipboard",
    isCommon: true
  }
];

const commonVariableCosts: CostItem[] = [
  {
    id: "cloud-hosting",
    name: "Cloud hosting (compute/storage scaling)",
    monthlyAmounts: [500, 600, 700, 800, 1000, 1200, 1500, 1800, 2200, 2600, 3100, 3600],
    icon: "cloud",
    unit: "scaling with usage",
    isCommon: true
  },
  {
    id: "api-usage",
    name: "Third-party API usage fees",
    monthlyAmounts: [200, 250, 300, 350, 450, 550, 700, 850, 1050, 1250, 1500, 1750],
    icon: "link",
    unit: "per API call",
    isCommon: true
  },
  {
    id: "customer-support",
    name: "Customer support scaling",
    monthlyAmounts: [1000, 1200, 1400, 1600, 2000, 2400, 3000, 3600, 4400, 5200, 6200, 7200],
    icon: "headphones",
    unit: "per user tier",
    isCommon: true
  },
  {
    id: "security-monitoring",
    name: "Security monitoring per user/transaction",
    monthlyAmounts: [300, 360, 420, 480, 600, 720, 900, 1080, 1320, 1560, 1860, 2160],
    icon: "shield",
    unit: "per user/transaction",
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

// Infrastructure Products
const infrastructureUniqueFixedCosts: CostItem[] = [
  {
    id: "plant-equipment",
    name: "Maintenance of Plant & Equipment",
    monthlyAmounts: [15000, 15000, 15000, 15000, 15000, 15000, 16000, 16000, 16000, 16000, 16000, 16000],
    icon: "cog",
    isCommon: false
  },
  {
    id: "utilities-power",
    name: "Utilities (power/cooling)",
    monthlyAmounts: [5000, 5000, 5000, 5500, 5500, 5500, 6000, 6000, 6000, 6500, 6500, 6500],
    icon: "zap",
    isCommon: false
  }
];

const infrastructureUniqueVariableCosts: CostItem[] = [
  {
    id: "bandwidth-charges",
    name: "Bandwidth charges",
    monthlyAmounts: [1000, 1200, 1400, 1600, 2000, 2400, 3000, 3600, 4400, 5200, 6200, 7200],
    icon: "wifi",
    unit: "per GB transferred",
    isCommon: false
  },
  {
    id: "cross-region-replication",
    name: "Cross-region replication",
    monthlyAmounts: [800, 960, 1120, 1280, 1600, 1920, 2400, 2880, 3520, 4160, 4960, 5760],
    icon: "globe",
    unit: "per replication",
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
  }
];

// Platform Products
const platformUniqueFixedCosts: CostItem[] = [
  {
    id: "api-gateway",
    name: "API gateway tools",
    monthlyAmounts: [3000, 3000, 3000, 3000, 3000, 3000, 3500, 3500, 3500, 3500, 3500, 3500],
    icon: "layers",
    isCommon: false
  },
  {
    id: "dev-portal",
    name: "Developer portal maintenance",
    monthlyAmounts: [2000, 2000, 2000, 2200, 2200, 2200, 2500, 2500, 2500, 2800, 2800, 2800],
    icon: "code",
    isCommon: false
  }
];

const platformUniqueVariableCosts: CostItem[] = [
  {
    id: "dev-onboarding",
    name: "Developer onboarding costs",
    monthlyAmounts: [500, 600, 700, 800, 1000, 1200, 1500, 1800, 2200, 2600, 3100, 3600],
    icon: "user-plus",
    unit: "per developer",
    isCommon: false
  },
  {
    id: "multitenant-resources",
    name: "Multi-tenant resource allocation",
    monthlyAmounts: [1200, 1440, 1680, 1920, 2400, 2880, 3600, 4320, 5280, 6240, 7440, 8640],
    icon: "database",
    unit: "per tenant",
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

// Application Products
const applicationUniqueFixedCosts: CostItem[] = [
  {
    id: "ui-ux-teams",
    name: "UI/UX design teams",
    monthlyAmounts: [8000, 8000, 8000, 8500, 8500, 8500, 9000, 9000, 9000, 9500, 9500, 9500],
    icon: "palette",
    isCommon: false
  },
  {
    id: "app-store-registration",
    name: "App store registrations",
    monthlyAmounts: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    icon: "smartphone",
    isCommon: false
  }
];

const applicationUniqueVariableCosts: CostItem[] = [
  {
    id: "push-notifications",
    name: "Push notifications",
    monthlyAmounts: [200, 240, 280, 320, 400, 480, 600, 720, 880, 1040, 1240, 1440],
    icon: "bell",
    unit: "per notification sent",
    isCommon: false
  },
  {
    id: "app-store-fees",
    name: "App store transaction fees",
    monthlyAmounts: [300, 360, 420, 480, 600, 720, 900, 1080, 1320, 1560, 1860, 2160],
    icon: "credit-card",
    unit: "% of revenue",
    isCommon: false
  },
  {
    id: "user-analytics",
    name: "User analytics",
    monthlyAmounts: [400, 480, 560, 640, 800, 960, 1200, 1440, 1760, 2080, 2480, 2880],
    icon: "bar-chart",
    unit: "per active user",
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