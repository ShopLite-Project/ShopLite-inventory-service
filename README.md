# ShopLite Inventory Service

Inventory control microservice for the ShopLite demo platform.

It manages stock-tracked products, reservation/release flows, restocks, and a simple adjustment history for operational visibility.

Its place in the platform is narrow on purpose:
- `product-service` describes what a product is
- `inventory-service` decides how much stock is available
- `order-service` asks for reservations and releases

Before Kafka is introduced, the intended integration is direct HTTP from `order-service` into the reservation and release endpoints.

## Endpoints

- `GET /health`
- `GET /inventory`
- `GET /inventory/:productId`
- `GET /inventory/:productId/adjustments`
- `POST /inventory/reservations`
- `POST /inventory/release`
- `POST /inventory/restock`

## Current rules

- inventory can be filtered by category or stock status
- reservation fails when available stock is insufficient
- release fails when requested quantity exceeds reserved stock
- consultation products are present for catalog alignment but are marked as `inventoryTracked: false`

## Local development

```bash
npm ci
npm run dev
```

## Kafka Notes

Kafka will later replace some direct service-to-service HTTP calls with events.

- local `docker-compose` is used to run Kafka itself during development
- Kafka-related code inside this service is only the client logic that talks to the broker
- `inventory-service` can consume order events and publish inventory outcome events

Simple mental model:

- Docker Compose starts the broker
- this service listens for relevant events
- this service reacts by applying inventory logic

For Kubernetes later:

- Kafka brokers run as pods
- application services also run as pods
- a Kafka operator can manage the Kafka cluster lifecycle inside Kubernetes
