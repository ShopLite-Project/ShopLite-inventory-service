# ShopLite Inventory Service

Inventory control microservice for the ShopLite demo platform.

It manages stock visibility, reservation, release, and restock flows for the demo shopping workflow.

## Endpoints

- `GET /health`
- `GET /inventory`
- `GET /inventory/:productId`
- `POST /inventory/reservations`
- `POST /inventory/release`
- `POST /inventory/restock`

## Local development

```bash
npm ci
npm run dev
```
