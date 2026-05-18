import { Router } from "express";
import { z } from "zod";

import { inventoryItems } from "../data/inventory";

const reservationSchema = z.object({
  productId: z.string().min(3),
  quantity: z.number().int().positive(),
  orderId: z.string().min(3)
});

const releaseSchema = reservationSchema;

const restockSchema = z.object({
  productId: z.string().min(3),
  quantity: z.number().int().positive(),
  reason: z.string().min(3)
});

export const inventoryRouter = Router();

inventoryRouter.get("/", (_request, response) => {
  response.status(200).json({
    count: inventoryItems.length,
    items: inventoryItems
  });
});

inventoryRouter.get("/:productId", (request, response) => {
  const item = inventoryItems.find((entry) => entry.productId === request.params.productId);

  if (!item) {
    response.status(404).json({ message: "Inventory item not found" });
    return;
  }

  response.status(200).json(item);
});

inventoryRouter.post("/reservations", async (request, response) => {
  const parsedPayload = reservationSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      message: "Invalid reservation payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const payload = parsedPayload.data;
  const item = inventoryItems.find((entry) => entry.productId === payload.productId);

  if (!item) {
    response.status(404).json({ message: "Inventory item not found" });
    return;
  }

  if (item.availableQuantity < payload.quantity) {
    response.status(409).json({ message: "Insufficient stock" });
    return;
  }

  item.availableQuantity -= payload.quantity;
  item.reservedQuantity += payload.quantity;

  response.status(200).json(item);
});

inventoryRouter.post("/release", async (request, response) => {
  const parsedPayload = releaseSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      message: "Invalid release payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const payload = parsedPayload.data;
  const item = inventoryItems.find((entry) => entry.productId === payload.productId);

  if (!item) {
    response.status(404).json({ message: "Inventory item not found" });
    return;
  }

  item.reservedQuantity = Math.max(item.reservedQuantity - payload.quantity, 0);
  item.availableQuantity += payload.quantity;

  response.status(200).json(item);
});

inventoryRouter.post("/restock", async (request, response) => {
  const parsedPayload = restockSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      message: "Invalid restock payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const payload = parsedPayload.data;
  const item = inventoryItems.find((entry) => entry.productId === payload.productId);

  if (!item) {
    response.status(404).json({ message: "Inventory item not found" });
    return;
  }

  item.availableQuantity += payload.quantity;

  response.status(200).json(item);
});
