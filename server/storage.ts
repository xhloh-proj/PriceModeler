import { type PricingProject, type InsertPricingProject } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPricingProject(id: string): Promise<PricingProject | undefined>;
  getAllPricingProjects(): Promise<PricingProject[]>;
  createPricingProject(project: InsertPricingProject): Promise<PricingProject>;
  updatePricingProject(id: string, project: Partial<InsertPricingProject>): Promise<PricingProject | undefined>;
  deletePricingProject(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, PricingProject>;

  constructor() {
    this.projects = new Map();
  }

  async getPricingProject(id: string): Promise<PricingProject | undefined> {
    return this.projects.get(id);
  }

  async getAllPricingProjects(): Promise<PricingProject[]> {
    return Array.from(this.projects.values());
  }

  async createPricingProject(insertProject: InsertPricingProject): Promise<PricingProject> {
    const id = randomUUID();
    const now = new Date();
    const project: PricingProject = { 
      ...insertProject, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async updatePricingProject(id: string, updateData: Partial<InsertPricingProject>): Promise<PricingProject | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated: PricingProject = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.projects.set(id, updated);
    return updated;
  }

  async deletePricingProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
