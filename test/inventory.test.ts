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
    expect(response.body.count).toBeGreaterThanOrEqual(3);
  });

  it("reserves inventory for an order", async () => {
    const response = await request(app).post("/inventory/reservations").send({
      productId: "prd-001",
      quantity: 2,
      orderId: "ord-2001"
    });

    expect(response.status).toBe(200);
    expect(response.body.productId).toBe("prd-001");
    expect(response.body.reservedQuantity).toBeGreaterThan(2);
  });
});
