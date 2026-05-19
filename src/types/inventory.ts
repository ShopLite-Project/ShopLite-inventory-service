export type InventoryCategory =
  | "perfumes"
  | "crystals"
  | "herbal_mixes"
  | "hair_care"
  | "consultation";

export type InventoryStockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "untracked";

export type InventoryAdjustmentType = "reservation" | "release" | "restock";

export interface InventoryItem {
  productId: string;
  sku: string;
  productName: string;
  category: InventoryCategory;
  inventoryTracked: boolean;
  availableQuantity: number;
  reservedQuantity: number;
  reorderThreshold: number;
  warehouseLocation: string;
  stockStatus: InventoryStockStatus;
  lastRestockedAt: string | null;
  updatedAt: string;
}

export interface InventoryAdjustment {
  id: string;
  orderId: string | null;
  productId: string;
  quantity: number;
  type: InventoryAdjustmentType;
  reason: string;
  createdAt: string;
}
