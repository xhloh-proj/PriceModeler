import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPricingProjectSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all pricing projects
  app.get("/api/pricing-projects", async (req, res) => {
    try {
      const projects = await storage.getAllPricingProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a specific pricing project
  app.get("/api/pricing-projects/:id", async (req, res) => {
    try {
      const project = await storage.getPricingProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create a new pricing project
  app.post("/api/pricing-projects", async (req, res) => {
    try {
      const validatedData = insertPricingProjectSchema.parse(req.body);
      const project = await storage.createPricingProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update a pricing project
  app.patch("/api/pricing-projects/:id", async (req, res) => {
    try {
      const validatedData = insertPricingProjectSchema.partial().parse(req.body);
      const project = await storage.updatePricingProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete a pricing project
  app.delete("/api/pricing-projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePricingProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
