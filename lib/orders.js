import { randomUUID } from "node:crypto";
import { getMenuItem } from "./menu";

const STATUS_TIMINGS = [
  [0, "ORDER_RECEIVED"],
  [15000, "PREPARING"],
  [35000, "OUT_FOR_DELIVERY"],
  [60000, "DELIVERED"],
];
const ALLOWED = {
  ORDER_RECEIVED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
export function canTransition(from, to) {
  return from === to || Boolean(ALLOWED[from]?.includes(to));
}
const state = globalThis.__savoryOrders || { orders: new Map() };
globalThis.__savoryOrders = state;

export function calculateTotals(items) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const deliveryFee = subtotal >= 35 ? 0 : 4;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return { subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax };
}
export function createOrder(input) {
  const items = input.items.map(({ menuItemId, quantity }) => {
    const menuItem = getMenuItem(menuItemId);
    if (!menuItem || !menuItem.isAvailable)
      throw new Error(`Menu item '${menuItemId}' is unavailable`);
    return {
      menuItemId,
      name: menuItem.name,
      unitPrice: menuItem.price,
      quantity,
    };
  });
  const createdAt = new Date().toISOString();
  const order = {
    id: randomUUID(),
    orderNumber: `SV-${Date.now().toString().slice(-6)}`,
    customer: input.customer,
    items,
    ...calculateTotals(items),
    status: "ORDER_RECEIVED",
    createdAt,
    updatedAt: createdAt,
  };
  state.orders.set(order.id, order);
  return order;
}
export function advanceOrderStatus(order) {
  if (!order || order.status === "CANCELLED" || order.status === "DELIVERED")
    return order;
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  const simulatedStatus = [...STATUS_TIMINGS]
    .reverse()
    .find(([time]) => elapsed >= time)?.[1];
  const currentIndex = STATUS_TIMINGS.findIndex(
    ([, status]) => status === order.status,
  );
  const simulatedIndex = STATUS_TIMINGS.findIndex(
    ([, status]) => status === simulatedStatus,
  );
  if (simulatedIndex > currentIndex) {
    order.status = simulatedStatus;
    order.updatedAt = new Date().toISOString();
  }
  return order;
}
export function getOrder(id) {
  return advanceOrderStatus(state.orders.get(id));
}
export function listOrders() {
  return [...state.orders.keys()]
    .map(getOrder)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function updateOrder(id, input) {
  const order = getOrder(id);
  if (!order) return null;
  if (
    input.status &&
    input.status !== order.status &&
    !canTransition(order.status, input.status)
  ) {
    const error = new Error(
      `Cannot move an order from ${order.status} to ${input.status}`,
    );
    error.code = "INVALID_TRANSITION";
    throw error;
  }
  if (input.status) order.status = input.status;
  if (input.customer) order.customer = { ...order.customer, ...input.customer };
  order.updatedAt = new Date().toISOString();
  return order;
}
export function deleteOrder(id) {
  const order = getOrder(id);
  if (!order) return false;
  if (!["ORDER_RECEIVED", "PREPARING"].includes(order.status)) {
    const error = new Error("This order can no longer be cancelled");
    error.code = "NOT_CANCELLABLE";
    throw error;
  }
  order.status = "CANCELLED";
  order.updatedAt = new Date().toISOString();
  return true;
}
export function clearOrders() {
  state.orders.clear();
}
