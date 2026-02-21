import { db } from "./db";
import {
  cargos,
  type CreateCargoRequest,
  type UpdateCargoRequest,
  type CargoResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCargos(): Promise<CargoResponse[]>;
  getCargo(id: number): Promise<CargoResponse | undefined>;
  getCargoByTracking(trackingNumber: string): Promise<CargoResponse | undefined>;
  createCargo(cargo: CreateCargoRequest): Promise<CargoResponse>;
  updateCargo(id: number, updates: UpdateCargoRequest): Promise<CargoResponse>;
  deleteCargo(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCargos(): Promise<CargoResponse[]> {
    return await db.select().from(cargos);
  }

  async getCargo(id: number): Promise<CargoResponse | undefined> {
    const [cargo] = await db.select().from(cargos).where(eq(cargos.id, id));
    return cargo;
  }

  async getCargoByTracking(trackingNumber: string): Promise<CargoResponse | undefined> {
    const [cargo] = await db.select().from(cargos).where(eq(cargos.trackingNumber, trackingNumber));
    return cargo;
  }

  async createCargo(cargo: CreateCargoRequest): Promise<CargoResponse> {
    const [newCargo] = await db.insert(cargos).values(cargo).returning();
    return newCargo;
  }

  async updateCargo(id: number, updates: UpdateCargoRequest): Promise<CargoResponse> {
    const [updated] = await db.update(cargos)
      .set(updates)
      .where(eq(cargos.id, id))
      .returning();
    return updated;
  }

  async deleteCargo(id: number): Promise<void> {
    await db.delete(cargos).where(eq(cargos.id, id));
  }
}

export const storage = new DatabaseStorage();
