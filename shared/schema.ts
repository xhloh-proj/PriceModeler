import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pricingProjects = pgTable("pricing_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  targetMarket: text("target_market"),
  fixedCosts: jsonb("fixed_costs").default([]).$type<Array<{id: string; name: string; amount: number; icon: string}>>(),
  variableCosts: jsonb("variable_costs").default([]).$type<Array<{id: string; name: string; amount: number; unit: string; icon: string}>>(),
  yearMultipliers: jsonb("year_multipliers").default([]).$type<Array<{year: number; multiplier: number}>>(),
  monthlyMultipliers: jsonb("monthly_multipliers").default([]).$type<Array<{month: number; multiplier: number}>>(),
  initialUsers: integer("initial_users").default(0),
  growthRate: real("growth_rate").default(0),
  churnRate: real("churn_rate").default(0),
  marketSize: integer("market_size").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPricingProjectSchema = createInsertSchema(pricingProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPricingProject = z.infer<typeof insertPricingProjectSchema>;
export type PricingProject = typeof pricingProjects.$inferSelect;
