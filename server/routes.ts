import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

async function seedDatabase() {
  const existingCargos = await storage.getCargos();
  if (existingCargos.length === 0) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await storage.createCargo({
      trackingNumber: "CR-123456789",
      clientName: "Acme Corp",
      origin: "Miami, USA",
      destination: "San Jose, Costa Rica",
      status: "In Transit",
      cargoType: "Container",
      estimatedDelivery: tomorrow,
      notes: "Fragile goods"
    });
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await storage.createCargo({
      trackingNumber: "CR-987654321",
      clientName: "Global Imports",
      origin: "Shanghai, China",
      destination: "Limon, Costa Rica",
      status: "Customs",
      cargoType: "Loose",
      estimatedDelivery: nextWeek,
      notes: "Delayed at customs"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get(api.cargos.list.path, isAuthenticated, async (req, res) => {
    const results = await storage.getCargos();
    res.json(results);
  });

  app.get(api.cargos.get.path, isAuthenticated, async (req, res) => {
    const cargo = await storage.getCargo(Number(req.params.id));
    if (!cargo) {
      return res.status(404).json({ message: 'Cargo not found' });
    }
    res.json(cargo);
  });

  // Public tracking route
  app.get(api.cargos.track.path, async (req, res) => {
    const cargo = await storage.getCargoByTracking(req.params.trackingNumber);
    if (!cargo) {
      return res.status(404).json({ message: 'Tracking number not found' });
    }
    res.json(cargo);
  });

  app.post(api.cargos.create.path, isAuthenticated, async (req, res) => {
    try {
      // Create schema with coercion for dates if necessary
      const bodySchema = api.cargos.create.input.extend({
        estimatedDelivery: z.coerce.date().optional()
      });
      const input = bodySchema.parse(req.body);
      const cargo = await storage.createCargo(input);
      res.status(201).json(cargo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.cargos.update.path, isAuthenticated, async (req, res) => {
    try {
      const bodySchema = api.cargos.update.input.extend({
        estimatedDelivery: z.coerce.date().optional()
      });
      const input = bodySchema.parse(req.body);
      const updated = await storage.updateCargo(Number(req.params.id), input);
      if (!updated) {
         return res.status(404).json({ message: 'Cargo not found' });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.cargos.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteCargo(Number(req.params.id));
    res.status(204).end();
  });
  
  // Call seed database
  await seedDatabase();

  return httpServer;
}
