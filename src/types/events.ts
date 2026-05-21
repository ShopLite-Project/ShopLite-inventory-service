import { InventoryItem } from "./inventory";

export interface OrderEventItem {
  productId: string;
  quantity: number;
  name: string;
  unitPrice: number;
}

export interface OrderEventCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  loyaltyTier: "new" | "silver" | "gold";
}

export interface OrderEventPayload {
  id: string;
  customer: OrderEventCustomer;
  items: OrderEventItem[];
}

export type OrderEventType =
  | "order_created"
  | "inventory_reservation_requested"
  | "order_confirmed"
  | "order_paid"
  | "order_fulfilled"
  | "order_cancelled";

export interface OrderEvent {
  eventId: string;
  eventType: OrderEventType;
  orderId: string;
  sourceService: "order-service";
  occurredAt: string;
  order: OrderEventPayload;
}

export type InventoryEventType =
  | "inventory_reserved"
  | "inventory_reservation_failed"
  | "inventory_released";

export interface InventoryEvent {
  eventId: string;
  eventType: InventoryEventType;
  orderId: string;
  sourceService: "inventory-service";
  occurredAt: string;
  reservationReference: string | null;
  message: string;
  items?: InventoryItem[];
}
