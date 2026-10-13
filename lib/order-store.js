import "server-only";
import { advanceOrderStatus, canTransition, createOrder, deleteOrder, getOrder, listOrders, updateOrder } from "./orders";
import { getSupabase } from "./supabase";

function toRow(order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    tax: order.tax,
    total: order.total,
    status: order.status,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    items: row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    tax: Number(row.tax),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function persistAdvancedStatus(supabase, order, previousStatus) {
  if (order.status !== previousStatus) {
    const { error } = await supabase.from("orders").update({ status: order.status, updated_at: order.updatedAt }).eq("id", order.id);
    if (error) throw new Error("Unable to update order status");
  }
  return order;
}

export async function createStoredOrder(input) {
  const order = createOrder(input);
  const supabase = getSupabase();
  if (!supabase) return order;
  const { error } = await supabase.from("orders").insert(toRow(order));
  if (error) throw new Error("Unable to save order");
  return order;
}

export async function getStoredOrder(id) {
  const supabase = getSupabase();
  if (!supabase) return getOrder(id);
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to retrieve order");
  if (!data) return null;
  const order = fromRow(data); const previousStatus = order.status;
  advanceOrderStatus(order);
  return persistAdvancedStatus(supabase, order, previousStatus);
}

export async function listStoredOrders() {
  const supabase = getSupabase();
  if (!supabase) return listOrders();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error("Unable to retrieve orders");
  return Promise.all((data || []).map(async (row) => {
    const order = fromRow(row); const previousStatus = order.status;
    advanceOrderStatus(order);
    return persistAdvancedStatus(supabase, order, previousStatus);
  }));
}

export async function updateStoredOrder(id, input) {
  const supabase = getSupabase();
  if (!supabase) return updateOrder(id, input);
  const order = await getStoredOrder(id); if (!order) return null;
  if (input.status && !canTransition(order.status, input.status)) {
    const error = new Error(`Cannot move an order from ${order.status} to ${input.status}`); error.code = "INVALID_TRANSITION"; throw error;
  }
  if (input.status) order.status = input.status;
  if (input.customer) order.customer = { ...order.customer, ...input.customer };
  order.updatedAt = new Date().toISOString();
  const { error } = await supabase.from("orders").update({ customer: order.customer, status: order.status, updated_at: order.updatedAt }).eq("id", id);
  if (error) throw new Error("Unable to update order");
  return order;
}

export async function deleteStoredOrder(id) {
  const supabase = getSupabase();
  if (!supabase) return deleteOrder(id);
  const order = await getStoredOrder(id); if (!order) return false;
  if (!["ORDER_RECEIVED", "PREPARING"].includes(order.status)) { const error = new Error("This order can no longer be cancelled"); error.code = "NOT_CANCELLABLE"; throw error; }
  const { error } = await supabase.from("orders").update({ status: "CANCELLED", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("Unable to cancel order");
  return true;
}
