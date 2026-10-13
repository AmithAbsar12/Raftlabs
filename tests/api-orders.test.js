import { beforeEach, describe, expect, it } from "vitest";
import { GET as listOrders, POST as createOrder } from "@/app/api/orders/route";
import {
  DELETE as cancelOrder,
  GET as getOrder,
  PATCH as updateOrder,
} from "@/app/api/orders/[id]/route";
import { clearOrders } from "@/lib/orders";

const payload = {
  customer: {
    name: "Alex Morgan",
    phone: "+1 555 123 4567",
    address: "24 Market Street, Springfield",
    instructions: "",
  },
  items: [{ menuItemId: "margherita", quantity: 1 }],
};
const request = (body, method = "POST") =>
  new Request("http://localhost/api/orders", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("orders REST API", () => {
  beforeEach(clearOrders);

  it("creates and lists orders", async () => {
    const createdResponse = await createOrder(request(payload));
    const created = await createdResponse.json();
    expect(createdResponse.status).toBe(201);
    const listResponse = await listOrders();
    const list = await listResponse.json();
    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe(created.data.id);
  });

  it("retrieves and updates an order", async () => {
    const created = await (await createOrder(request(payload))).json();
    const context = { params: Promise.resolve({ id: created.data.id }) };
    expect((await getOrder(null, context)).status).toBe(200);
    const patched = await updateOrder(
      request({ customer: { name: "Jordan Lee" } }, "PATCH"),
      context,
    );
    expect((await patched.json()).data.customer.name).toBe("Jordan Lee");
  });

  it("cancels an eligible order", async () => {
    const created = await (await createOrder(request(payload))).json();
    const response = await cancelOrder(null, {
      params: Promise.resolve({ id: created.data.id }),
    });
    expect(response.status).toBe(204);
  });

  it("returns 400 for invalid input and 404 for a missing order", async () => {
    expect(
      (await createOrder(request({ customer: {}, items: [] }))).status,
    ).toBe(400);
    expect(
      (await getOrder(null, { params: Promise.resolve({ id: "missing" }) }))
        .status,
    ).toBe(404);
  });
});
