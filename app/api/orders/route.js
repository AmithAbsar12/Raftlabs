import { createStoredOrder, listStoredOrders } from "@/lib/order-store";
import { orderSchema } from "@/lib/order-validation";

export async function GET() {
  try {
    return Response.json({ data: await listStoredOrders() });
  } catch {
    return Response.json({ error: "Unable to retrieve orders" }, { status: 500 });
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success)
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    return Response.json({ data: await createStoredOrder(parsed.data) }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    if (error.message.includes("unavailable"))
      return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Unable to create order" }, { status: 500 });
  }
}
