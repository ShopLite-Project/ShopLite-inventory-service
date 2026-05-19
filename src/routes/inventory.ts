import { Router } from "express";
import { z } from "zod";

import { inventoryAdjustments, inventoryItems } from "../data/inventory";
import { InventoryAdjustmentType, InventoryItem } from "../types/inventory";

const reservationSchema = z.object({
  productId: z.string().min(3),
  quantity: z.number().int().positive().max(50),
  orderId: z.string().min(3),
  reason: z.string().min(3).max(200).optional()
});

const releaseSchema = z.object({
  productId: z.string().min(3),
  quantity: z.number().int().positive().max(50),
  orderId: z.string().min(3),
  reason: z.string().min(3).max(200).optional()
});

const restockSchema = z.object({
  productId: z.string().min(3),
  quantity: z.number().int().positive().max(200),
  reason: z.string().min(3).max(200)
});

function recalculateStockStatus(item: InventoryItem) {
  if (!item.inventoryTracked) {
    item.stockStatus = "untracked";
    return;
  }

  if (item.availableQuantity <= 0) {
    item.stockStatus = "out_of_stock";
    return;
  }

  if (item.availableQuantity <= item.reorderThreshold) {
    item.stockStatus = "low_stock";
    return;
  }

  item.stockStatus = "in_stock";
}

function addAdjustment(
  type: InventoryAdjustmentType,
  productId: string,
  quantity: number,
  orderId: string | null,
  reason: string
) {
  const now = new Date().toISOString();
  const adjustment = {
    id: `adj-${Date.now()}`,
    orderId,
    productId,
    quantity,
    type,
    reason,
    createdAt: now
  };

  inventoryAdjustments.push(adjustment);
  return adjustment;
}

export const inventoryRouter = Router();

inventoryRouter.get("/", (request, response) => {
  const stockStatus = request.query.stockStatus;
  const category = request.query.category;

  const filteredItems = inventoryItems.filter((item) => {
    const matchesStatus =
      typeof stockStatus !== "string" || item.stockStatus === stockStatus;
    const matchesCategory =
      typeof category !== "string" || item.category === category;

    return matchesStatus && matchesCategory;
  });

  response.status(200).json({
    data: filteredItems,
    meta: {
      count: filteredItems.length
    }
  });
});

inventoryRouter.get("/:productId", (request, response) => {
  const item = inventoryItems.find((entry) => entry.productId === request.params.productId);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found" });
    return;
  }

  response.status(200).json({ data: item });
});

inventoryRouter.get("/:productId/adjustments", (request, response) => {
  const item = inventoryItems.find((entry) => entry.productId === request.params.productId);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found" });
    return;
  }

  const adjustments = inventoryAdjustments.filter(
    (entry) => entry.productId === request.params.productId
  );

  response.status(200).json({
    data: adjustments,
    meta: {
      count: adjustments.length
    }
  });
});

inventoryRouter.post("/reservations", (request, response) => {
  const parsedPayload = reservationSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      error: "Invalid reservation payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const payload = parsedPayload.data;
  const item = inventoryItems.find((entry) => entry.productId === payload.productId);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found" });
    return;
  }

  if (!item.inventoryTracked) {
    response.status(409).json({ error: "Inventory is not tracked for this product" });
    return;
  }

  if (item.availableQuantity < payload.quantity) {
    response.status(409).json({ error: "Insufficient stock" });
    return;
  }

  item.availableQuantity -= payload.quantity;
  item.reservedQuantity += payload.quantity;
  item.updatedAt = new Date().toISOString();
  recalculateStockStatus(item);

  const adjustment = addAdjustment(
    "reservation",
    payload.productId,
    payload.quantity,
    payload.orderId,
    payload.reason ?? "Inventory reserved for order."
  );

  response.status(200).json({
    data: item,
    meta: {
      adjustment
    }
  });
});

inventoryRouter.post("/release", (request, response) => {
  const parsedPayload = releaseSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      error: "Invalid release payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const payload = parsedPayload.data;
  const item = inventoryItems.find((entry) => entry.productId === payload.productId);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found" });
    return;
  }

  if (!item.inventoryTracked) {
    response.status(409).json({ error: "Inventory is not tracked for this product" });
    return;
  }

  if (item.reservedQuantity < payload.quantity) {
    response.status(409).json({ error: "Cannot release more stock than is reserved" });
    return;
  }

  item.reservedQuantity -= payload.quantity;
  item.availableQuantity += payload.quantity;
  item.updatedAt = new Date().toISOString();
  recalculateStockStatus(item);

  const adjustment = addAdjustment(
    "release",
    payload.productId,
    payload.quantity,
    payload.orderId,
    payload.reason ?? "Inventory released from order reservation."
  );

  response.status(200).json({
    data: item,
    meta: {
      adjustment
    }
  });
});

inventoryRouter.post("/restock", (request, response) => {
  const parsedPayload = restockSchema.safeParse(request.body);

  if (!parsedPayload.success) {
    response.status(400).json({
      error: "Invalid restock payload",
      issues: parsedPayload.error.flatten()
    });
    return;
  }

  const payload = parsedPayload.data;
  const item = inventoryItems.find((entry) => entry.productId === payload.productId);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found" });
    return;
  }

  if (!item.inventoryTracked) {
    response.status(409).json({ error: "Inventory is not tracked for this product" });
    return;
  }

  item.availableQuantity += payload.quantity;
  item.lastRestockedAt = new Date().toISOString();
  item.updatedAt = item.lastRestockedAt;
  recalculateStockStatus(item);

  const adjustment = addAdjustment(
    "restock",
    payload.productId,
    payload.quantity,
    null,
    payload.reason
  );

  response.status(200).json({
    data: item,
    meta: {
      adjustment
    }
  });
});
