import { beforeEach, describe, expect, it } from "vitest";
import {
  calculateTotals,
  clearOrders,
  createOrder,
  deleteOrder,
  getOrder,
  updateOrder,
} from "@/lib/orders";
import { orderSchema } from "@/lib/order-validation";

const validOrder = {
  customer: {
    name: "Alex Morgan",
    phone: "+1 555 123 4567",
    address: "24 Market Street, Springfield",
    instructions: "",
  },
  items: [{ menuItemId: "margherita", quantity: 2 }],
};

describe("order domain", () => {
  beforeEach(clearOrders);
  it("calculates tax, delivery and total on the server", () =>
    expect(calculateTotals([{ unitPrice: 10, quantity: 2 }])).toEqual({
      subtotal: 20,
      deliveryFee: 4,
      tax: 1.6,
      total: 25.6,
    }));
  it("creates and retrieves an order with snapshot prices", () => {
    const order = createOrder(validOrder);
    expect(getOrder(order.id)).toMatchObject({
      status: "ORDER_RECEIVED",
      subtotal: 32,
      total: 38.56,
    });
    expect(order.items[0].unitPrice).toBe(16);
  });
  it("updates delivery details", () => {
    const order = createOrder(validOrder);
    updateOrder(order.id, { customer: { name: "Jordan Lee" } });
    expect(getOrder(order.id).customer.name).toBe("Jordan Lee");
  });
  it("supports cancellation through delete semantics", () => {
    const order = createOrder(validOrder);
    expect(deleteOrder(order.id)).toBe(true);
    expect(getOrder(order.id).status).toBe("CANCELLED");
  });
  it("rejects unknown menu items", () =>
    expect(() =>
      createOrder({
        ...validOrder,
        items: [{ menuItemId: "fake", quantity: 1 }],
      }),
    ).toThrow("unavailable"));
  it("rejects invalid status transitions", () => {
    const order = createOrder(validOrder);
    expect(() => updateOrder(order.id, { status: "DELIVERED" })).toThrow(
      "Cannot move",
    );
  });
});

describe("order input validation", () => {
  it("accepts complete checkout data", () =>
    expect(orderSchema.safeParse(validOrder).success).toBe(true));
  it("rejects empty orders and malformed customer data", () =>
    expect(
      orderSchema.safeParse({
        customer: { name: "", phone: "abc", address: "x" },
        items: [],
      }).success,
    ).toBe(false));
  it("rejects invalid quantities", () =>
    expect(
      orderSchema.safeParse({
        ...validOrder,
        items: [{ menuItemId: "margherita", quantity: 0 }],
      }).success,
    ).toBe(false));
});
