import { deleteStoredOrder, getStoredOrder, updateStoredOrder } from "@/lib/order-store";
import { updateOrderSchema } from "@/lib/order-validation";

export async function GET(_request, { params }) {
  const { id } = await params;
  const order = await getStoredOrder(id);
  return order
    ? Response.json({ data: order })
    : Response.json({ error: "Order not found" }, { status: 404 });
}
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const parsed = updateOrderSchema.safeParse(await request.json());
    if (!parsed.success)
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    const order = await updateStoredOrder(id, parsed.data);
    return order
      ? Response.json({ data: order })
      : Response.json({ error: "Order not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json(
        { error: "Request body must be valid JSON" },
        { status: 400 },
      );
    return Response.json(
      { error: error.message },
      { status: error.code === "INVALID_TRANSITION" ? 409 : 500 },
    );
  }
}
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const deleted = await deleteStoredOrder(id);
    return deleted
      ? new Response(null, { status: 204 })
      : Response.json({ error: "Order not found" }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }
}
