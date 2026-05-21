import { inventoryAdjustments, inventoryItems } from "../data/inventory";
import { InventoryAdjustmentType, InventoryItem } from "../types/inventory";

export function recalculateStockStatus(item: InventoryItem) {
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

export function addAdjustment(
  type: InventoryAdjustmentType,
  productId: string,
  quantity: number,
  orderId: string | null,
  reason: string
) {
  const now = new Date().toISOString();
  const adjustment = {
    id: `adj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

export function reserveInventory(productId: string, quantity: number, orderId: string, reason: string) {
  const item = inventoryItems.find((entry) => entry.productId === productId);

  if (!item) {
    throw new Error("Inventory item not found");
  }

  if (!item.inventoryTracked) {
    throw new Error("Inventory is not tracked for this product");
  }

  if (item.availableQuantity < quantity) {
    throw new Error("Insufficient stock");
  }

  item.availableQuantity -= quantity;
  item.reservedQuantity += quantity;
  item.updatedAt = new Date().toISOString();
  recalculateStockStatus(item);

  const adjustment = addAdjustment(
    "reservation",
    productId,
    quantity,
    orderId,
    reason
  );

  return {
    item,
    adjustment
  };
}

export function releaseInventory(productId: string, quantity: number, orderId: string, reason: string) {
  const item = inventoryItems.find((entry) => entry.productId === productId);

  if (!item) {
    throw new Error("Inventory item not found");
  }

  if (!item.inventoryTracked) {
    throw new Error("Inventory is not tracked for this product");
  }

  if (item.reservedQuantity < quantity) {
    throw new Error("Cannot release more stock than is reserved");
  }

  item.reservedQuantity -= quantity;
  item.availableQuantity += quantity;
  item.updatedAt = new Date().toISOString();
  recalculateStockStatus(item);

  const adjustment = addAdjustment(
    "release",
    productId,
    quantity,
    orderId,
    reason
  );

  return {
    item,
    adjustment
  };
}
