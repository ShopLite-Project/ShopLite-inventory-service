import { InventoryAdjustment, InventoryItem } from "../types/inventory";

export const inventoryItems: InventoryItem[] = [
  {
    productId: "prd-001",
    sku: "PRF-ROSE-001",
    productName: "Rose Oud Perfume Oil",
    category: "perfumes",
    inventoryTracked: true,
    availableQuantity: 24,
    reservedQuantity: 2,
    reorderThreshold: 5,
    warehouseLocation: "LAG-WH-A1",
    stockStatus: "in_stock",
    lastRestockedAt: "2026-05-15T08:00:00.000Z",
    updatedAt: "2026-05-15T08:00:00.000Z"
  },
  {
    productId: "prd-002",
    sku: "CRY-CITR-002",
    productName: "Citrine Abundance Crystal Set",
    category: "crystals",
    inventoryTracked: true,
    availableQuantity: 5,
    reservedQuantity: 1,
    reorderThreshold: 4,
    warehouseLocation: "LAG-WH-B3",
    stockStatus: "low_stock",
    lastRestockedAt: "2026-05-14T10:30:00.000Z",
    updatedAt: "2026-05-16T09:30:00.000Z"
  },
  {
    productId: "prd-003",
    sku: "HER-CLEAN-003",
    productName: "Daily Balance Herbal Mix",
    category: "herbal_mixes",
    inventoryTracked: true,
    availableQuantity: 8,
    reservedQuantity: 0,
    reorderThreshold: 3,
    warehouseLocation: "LAG-WH-C2",
    stockStatus: "in_stock",
    lastRestockedAt: "2026-05-13T11:00:00.000Z",
    updatedAt: "2026-05-13T11:00:00.000Z"
  },
  {
    productId: "prd-004",
    sku: "HAIR-HYDR-004",
    productName: "Scalp Revival Hair Butter",
    category: "hair_care",
    inventoryTracked: true,
    availableQuantity: 3,
    reservedQuantity: 1,
    reorderThreshold: 4,
    warehouseLocation: "LAG-WH-D4",
    stockStatus: "low_stock",
    lastRestockedAt: "2026-05-12T07:45:00.000Z",
    updatedAt: "2026-05-16T12:00:00.000Z"
  },
  {
    productId: "prd-005",
    sku: "CONS-INTAKE-005",
    productName: "Personal Wellness Consultation",
    category: "consultation",
    inventoryTracked: false,
    availableQuantity: 0,
    reservedQuantity: 0,
    reorderThreshold: 0,
    warehouseLocation: "virtual",
    stockStatus: "untracked",
    lastRestockedAt: null,
    updatedAt: "2026-05-15T09:20:00.000Z"
  }
];

export const inventoryAdjustments: InventoryAdjustment[] = [
  {
    id: "adj-1001",
    orderId: "ord-1001",
    productId: "prd-001",
    quantity: 2,
    type: "reservation",
    reason: "Seed reservation for demo order.",
    createdAt: "2026-05-15T08:05:00.000Z"
  }
];
