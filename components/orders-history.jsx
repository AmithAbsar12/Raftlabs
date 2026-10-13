"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  History,
  PackageOpen,
  RotateCw,
} from "lucide-react";

const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );
const labels = {
  ORDER_RECEIVED: "Order received",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setOrders(result.data);
      setError("");
    } catch (reason) {
      setError(reason.message || "Could not load your orders");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const initial = setTimeout(load, 0);
    return () => clearTimeout(initial);
  }, [load]);

  return (
    <main className="history-shell">
      <header className="tracking-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Savory</span>
        </Link>
        <Link className="back-link" href="/">
          <ArrowLeft size={16} /> Back to menu
        </Link>
      </header>
      <section className="history-heading">
        <span className="eyebrow">
          <History size={14} /> YOUR ORDERS
        </span>
        <h1>Order history</h1>
        <p>
          Review your previous orders and continue tracking active deliveries.
        </p>
      </section>
      <section className="history-list" aria-live="polite">
        {loading && (
          <div className="history-state">
            <div className="loading-ring" />
            <p>Loading your orders…</p>
          </div>
        )}
        {error && (
          <div className="history-state">
            <PackageOpen size={34} />
            <h2>We couldn’t load your orders</h2>
            <p>{error}</p>
            <button className="primary-button" onClick={load}>
              <RotateCw size={17} /> Try again
            </button>
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="history-state">
            <PackageOpen size={38} />
            <h2>No orders yet</h2>
            <p>Your delicious order history will appear here.</p>
            <Link className="primary-button" href="/">
              Explore the menu
            </Link>
          </div>
        )}
        {!loading &&
          !error &&
          orders.map((order) => (
            <Link
              className="history-order"
              href={`/orders/${order.id}`}
              key={order.id}
            >
              <div className="history-order-top">
                <div>
                  <span>ORDER {order.orderNumber}</span>
                  <h2>
                    {order.items
                      .map((item) => `${item.quantity}× ${item.name}`)
                      .join(", ")}
                  </h2>
                </div>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {labels[order.status]}
                </span>
              </div>
              <div className="history-order-bottom">
                <span>
                  <Clock3 size={15} />
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(order.createdAt))}
                </span>
                <b>{money(order.total)}</b>
                <span className="view-order">
                  View order <ChevronRight size={16} />
                </span>
              </div>
            </Link>
          ))}
      </section>
    </main>
  );
}
