import { InventoryItem } from "../types/inventory";

export const inventoryItems: InventoryItem[] = [
  {
    productId: "prd-001",
    sku: "MOUSE-WL-001",
    availableQuantity: 24,
    reservedQuantity: 2,
    reorderThreshold: 5,
    warehouseLocation: "LAG-WH-A1"
  },
  {
    productId: "prd-002",
    sku: "KEYBOARD-MK-002",
    availableQuantity: 10,
    reservedQuantity: 1,
    reorderThreshold: 4,
    warehouseLocation: "LAG-WH-B3"
  },
  {
    productId: "prd-003",
    sku: "HEADSET-NC-003",
    availableQuantity: 6,
    reservedQuantity: 0,
    reorderThreshold: 3,
    warehouseLocation: "LAG-WH-C2"
  }
];
