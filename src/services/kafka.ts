import { Consumer, Kafka, Producer } from "kafkajs";

import { env } from "../config/env";
import { releaseInventory, reserveInventory } from "./inventory-domain";
import { InventoryEvent, OrderEvent } from "../types/events";

let kafka: Kafka | null = null;
let producer: Producer | null = null;
let orderConsumer: Consumer | null = null;

function kafkaEnabled() {
  return env.ENABLE_KAFKA && env.NODE_ENV !== "test";
}

function getKafka() {
  if (!kafka) {
    kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS
    });
  }

  return kafka;
}

async function publishInventoryEvent(event: InventoryEvent) {
  if (!producer) {
    producer = getKafka().producer();
    await producer.connect();
  }

  await producer.send({
    topic: env.KAFKA_INVENTORY_EVENTS_TOPIC,
    messages: [
      {
        key: event.orderId,
        value: JSON.stringify(event)
      }
    ]
  });
}

export async function startOrderEventsConsumer() {
  if (!kafkaEnabled()) {
    return;
  }

  if (orderConsumer) {
    return;
  }

  orderConsumer = getKafka().consumer({
    groupId: env.KAFKA_ORDER_CONSUMER_GROUP
  });

  await orderConsumer.connect();
  await orderConsumer.subscribe({
    topic: env.KAFKA_ORDER_EVENTS_TOPIC,
    fromBeginning: false
  });

  await orderConsumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const event = JSON.parse(message.value.toString()) as OrderEvent;

      if (event.eventType === "inventory_reservation_requested") {
        try {
          for (const item of event.order.items) {
            reserveInventory(
              item.productId,
              item.quantity,
              event.orderId,
              `Reserved from Kafka event ${event.eventId}`
            );
          }

          await publishInventoryEvent({
            eventId: `inventory_reserved-${event.orderId}-${Date.now()}`,
            eventType: "inventory_reserved",
            orderId: event.orderId,
            sourceService: "inventory-service",
            occurredAt: new Date().toISOString(),
            reservationReference: `res-${event.orderId}`,
            message: "Inventory reserved successfully"
          });
        } catch (error) {
          await publishInventoryEvent({
            eventId: `inventory_reservation_failed-${event.orderId}-${Date.now()}`,
            eventType: "inventory_reservation_failed",
            orderId: event.orderId,
            sourceService: "inventory-service",
            occurredAt: new Date().toISOString(),
            reservationReference: null,
            message: error instanceof Error ? error.message : "Inventory reservation failed"
          });
        }
      }

      if (event.eventType === "order_cancelled") {
        for (const item of event.order.items) {
          try {
            releaseInventory(
              item.productId,
              item.quantity,
              event.orderId,
              `Released from Kafka cancellation event ${event.eventId}`
            );
          } catch {
            continue;
          }
        }

        await publishInventoryEvent({
          eventId: `inventory_released-${event.orderId}-${Date.now()}`,
          eventType: "inventory_released",
          orderId: event.orderId,
          sourceService: "inventory-service",
          occurredAt: new Date().toISOString(),
          reservationReference: `res-${event.orderId}`,
          message: "Inventory released for cancelled order"
        });
      }
    }
  });
}

export async function stopKafka() {
  await orderConsumer?.disconnect().catch(() => undefined);
  await producer?.disconnect().catch(() => undefined);
  orderConsumer = null;
  producer = null;
  kafka = null;
}
