export interface InventoryItem {
  productId: string;
  sku: string;
  availableQuantity: number;
  reservedQuantity: number;
  reorderThreshold: number;
  warehouseLocation: string;
}
