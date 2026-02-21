import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function seedDatabase() {
  const existing = await storage.getTickets();
  if (existing.length === 0) {
    const t1 = await storage.createTicket({
      trackingNumber: "CR-2025-001",
      clientName: "Importaciones ABC",
      origin: "Miami, USA",
      destination: "San José, Costa Rica",
      status: "En Proceso",
      cargoType: "Contenedor",
      notes: "Mercancía frágil - manejar con cuidado",
      assignedTo: null,
    });
    await storage.createComment({
      ticketId: t1.id,
      userId: "system",
      userName: "Sistema",
      content: "Ticket creado. Carga recibida en puerto de origen.",
    });

    const t2 = await storage.createTicket({
      trackingNumber: "CR-2025-002",
      clientName: "Exportadora Tropical",
      origin: "Limón, Costa Rica",
      destination: "Rotterdam, Países Bajos",
      status: "Aduana",
      cargoType: "Pallet",
      notes: "Productos agrícolas - requiere refrigeración",
      assignedTo: null,
    });
    await storage.createComment({
      ticketId: t2.id,
      userId: "system",
      userName: "Sistema",
      content: "Documentación de exportación en revisión aduanera.",
    });

    await storage.createTicket({
      trackingNumber: "CR-2025-003",
      clientName: "TechParts CR",
      origin: "Shanghai, China",
      destination: "Alajuela, Costa Rica",
      status: "En Tránsito",
      cargoType: "Caja",
      notes: "Componentes electrónicos",
      assignedTo: null,
    });

    await storage.createTicket({
      trackingNumber: "CR-2025-004",
      clientName: "Mueblería Central",
      origin: "Ciudad de Guatemala, Guatemala",
      destination: "Heredia, Costa Rica",
      status: "Nuevo",
      cargoType: "Contenedor",
      notes: "Muebles de oficina",
      assignedTo: null,
    });

    await storage.createTicket({
      trackingNumber: "CR-2025-005",
      clientName: "Farmacéutica Nacional",
      origin: "Madrid, España",
      destination: "Cartago, Costa Rica",
      status: "Entregado",
      cargoType: "Caja",
      notes: "Equipo médico - entrega completada",
      assignedTo: null,
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/uploads", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=86400");
    next();
  });
  const express = await import("express");
  app.use("/uploads", express.default.static(uploadsDir));

  // --- TICKETS ---
  app.get(api.tickets.list.path, isAuthenticated, async (_req, res) => {
    const results = await storage.getTickets();
    res.json(results);
  });

  app.get(api.tickets.get.path, isAuthenticated, async (req, res) => {
    const ticket = await storage.getTicket(Number(req.params.id));
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    res.json(ticket);
  });

  app.post(api.tickets.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tickets.create.input.parse(req.body);
      const ticket = await storage.createTicket(input);
      res.status(201).json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.tickets.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.tickets.update.input.parse(req.body);
      const updated = await storage.updateTicket(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Ticket no encontrado" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.tickets.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteTicket(Number(req.params.id));
    res.status(204).end();
  });

  // --- COMMENTS ---
  app.get(api.comments.list.path, isAuthenticated, async (req, res) => {
    const result = await storage.getComments(Number(req.params.ticketId));
    res.json(result);
  });

  app.post(api.comments.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const { content } = api.comments.create.input.parse(req.body);
      const userId = req.user?.claims?.sub || "unknown";
      const userName = [req.user?.claims?.first_name, req.user?.claims?.last_name].filter(Boolean).join(" ") || "Empleado";
      const comment = await storage.createComment({
        ticketId: Number(req.params.ticketId),
        userId,
        userName,
        content,
      });
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // --- ATTACHMENTS ---
  app.get(api.attachments.list.path, isAuthenticated, async (req, res) => {
    const result = await storage.getAttachments(Number(req.params.ticketId));
    res.json(result);
  });

  app.post(api.attachments.list.path, isAuthenticated, upload.single("file"), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }
    const userId = req.user?.claims?.sub || "unknown";
    const attachment = await storage.createAttachment({
      ticketId: Number(req.params.ticketId),
      userId,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
    });
    res.status(201).json(attachment);
  });

  app.delete(api.attachments.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteAttachment(Number(req.params.id));
    res.status(204).end();
  });

  await seedDatabase();

  return httpServer;
}
