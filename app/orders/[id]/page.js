import { OrderTracker } from "@/components/order-tracker";

export const instant = false;

export default async function OrderPage({ params }) {
  const { id } = await params;
  return <OrderTracker orderId={id}/>;
}
