import request from "supertest";

import { app } from "../src/app";

describe("ShopLite inventory service", () => {
  it("returns service health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("returns seeded inventory", async () => {
    const response = await request(app).get("/inventory");

    expect(response.status).toBe(200);
    expect(response.body.meta.count).toBeGreaterThanOrEqual(5);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("reserves inventory for an order", async () => {
    const response = await request(app).post("/inventory/reservations").send({
      productId: "prd-001",
      quantity: 2,
      orderId: "ord-2001",
      reason: "Reserve inventory for checkout confirmation."
    });

    expect(response.status).toBe(200);
    expect(response.body.data.productId).toBe("prd-001");
    expect(response.body.data.reservedQuantity).toBeGreaterThan(2);
    expect(response.body.meta.adjustment.type).toBe("reservation");
  });

  it("rejects release above reserved quantity", async () => {
    const response = await request(app).post("/inventory/release").send({
      productId: "prd-003",
      quantity: 5,
      orderId: "ord-2002"
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain("reserved");
  });

  it("filters by category", async () => {
    const response = await request(app).get("/inventory?category=consultation");

    expect(response.status).toBe(200);
    expect(response.body.meta.count).toBe(1);
    expect(response.body.data[0].inventoryTracked).toBe(false);
  });

  it("returns adjustment history for a product", async () => {
    const response = await request(app).get("/inventory/prd-001/adjustments");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta.count).toBeGreaterThanOrEqual(1);
  });
});
