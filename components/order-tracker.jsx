"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bike,
  Check,
  ChefHat,
  CircleCheck,
  Clock3,
  History,
  Home,
  MapPin,
  PackageCheck,
  RotateCw,
  UtensilsCrossed,
} from "lucide-react";

const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );
const steps = [
  {
    id: "ORDER_RECEIVED",
    label: "Order received",
    detail: "The kitchen has your order",
    icon: PackageCheck,
  },
  {
    id: "PREPARING",
    label: "Preparing",
    detail: "Your food is being made fresh",
    icon: ChefHat,
  },
  {
    id: "OUT_FOR_DELIVERY",
    label: "Out for delivery",
    detail: "Your courier is on the way",
    icon: Bike,
  },
  {
    id: "DELIVERED",
    label: "Delivered",
    detail: "Time to enjoy",
    icon: CircleCheck,
  },
];
const stageContent = {
  ORDER_RECEIVED: {
    kicker: "Order confirmed",
    title: "The kitchen has your order",
    copy: "We’ve sent your order to the kitchen and the team is getting everything ready.",
    progress: 8,
  },
  PREPARING: {
    kicker: "Cooking now",
    title: "Made fresh, just for you",
    copy: "Your meal is being prepared and carefully packed for the journey.",
    progress: 42,
  },
  OUT_FOR_DELIVERY: {
    kicker: "On the move",
    title: "Your order is on its way",
    copy: "Your courier has picked it up and is heading to your delivery address.",
    progress: 76,
  },
  DELIVERED: {
    kicker: "Delivered",
    title: "Your food has arrived",
    copy: "Your order made it safely. We hope you enjoy every bite.",
    progress: 100,
  },
  CANCELLED: {
    kicker: "Cancelled",
    title: "This order was cancelled",
    copy: "No further updates will be made to this order.",
    progress: 0,
  },
};

export function OrderTracker({ orderId }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [showDelivered, setShowDelivered] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(6);
  const [journeyProgress, setJourneyProgress] = useState(0);
  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setOrder(result.data);
    } catch (reason) {
      setError(reason.message || "Could not load this order");
    }
  }, [orderId]);
  useEffect(() => {
    const initial = setTimeout(load, 0);
    const timer = setInterval(load, 3000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [load]);
  useEffect(() => {
    if (order?.status !== "DELIVERED") return;
    const openModal = setTimeout(() => setShowDelivered(true), 0);
    const countdown = setInterval(
      () => setSecondsLeft((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    const redirect = setTimeout(() => router.push("/"), 6000);
    return () => {
      clearTimeout(openModal);
      clearTimeout(redirect);
      clearInterval(countdown);
    };
  }, [order?.status, router]);
  useEffect(() => {
    if (!order?.createdAt) return;
    const updateJourney = () => {
      if (order.status === "CANCELLED") return setJourneyProgress(0);
      if (order.status === "DELIVERED") return setJourneyProgress(100);
      const elapsed = Date.now() - new Date(order.createdAt).getTime();
      setJourneyProgress(Math.max(2, Math.min(98, (elapsed / 60000) * 100)));
    };
    const initial = setTimeout(updateJourney, 0);
    const animation = setInterval(updateJourney, 500);
    return () => {
      clearTimeout(initial);
      clearInterval(animation);
    };
  }, [order?.createdAt, order?.status]);
  if (error)
    return (
      <main className="status-page">
        <div className="status-error">
          <UtensilsCrossed size={34} />
          <h1>Order not found</h1>
          <p>{error}</p>
          <Link className="primary-button" href="/">
            Back to menu
          </Link>
        </div>
      </main>
    );
  if (!order)
    return (
      <main className="status-page">
        <div className="loading-ring" />
        <p>Finding your order…</p>
      </main>
    );
  const index = steps.findIndex((step) => step.id === order.status);
  const isCancelled = order.status === "CANCELLED";
  const stage = stageContent[order.status];
  return (
    <main className="tracking-shell">
      <header className="tracking-nav">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Savory</span>
        </Link>
        <div className="tracking-actions">
          <Link href="/orders">
            <History size={16} /> Order history
          </Link>
          <span className="live-pill">
            <i /> Live order
          </span>
        </div>
      </header>
      <section className="tracking-hero tracking-hero-new">
        <span className="eyebrow">LIVE DELIVERY · {order.orderNumber}</span>
        <h1>{isCancelled ? "Order cancelled" : stage.title}</h1>
        <p>
          {isCancelled
            ? "This order has been cancelled."
            : "Follow your order from our kitchen to your door."}
        </p>
      </section>
      <div className="tracking-grid">
        <section className="tracking-card tracking-card-new">
          <div className={`current-status stage-${order.status.toLowerCase()}`}>
            <div className="status-symbol">
              {order.status === "OUT_FOR_DELIVERY" ? (
                <Bike size={34} />
              ) : order.status === "PREPARING" ? (
                <ChefHat size={34} />
              ) : order.status === "DELIVERED" ? (
                <CircleCheck size={34} />
              ) : (
                <PackageCheck size={34} />
              )}
            </div>
            <div>
              <span>{stage.kicker}</span>
              <h2>{stage.title}</h2>
              <p>{stage.copy}</p>
            </div>
            <button onClick={load} aria-label="Refresh status">
              <RotateCw size={17} />
            </button>
          </div>
          <div className="eta eta-new">
            <div>
              <Clock3 size={20} />
              <span>
                <small>
                  {order.status === "OUT_FOR_DELIVERY"
                    ? "COURIER ETA"
                    : "ESTIMATED ARRIVAL"}
                </small>
                <b>
                  {order.status === "DELIVERED"
                    ? "Delivered"
                    : order.status === "OUT_FOR_DELIVERY"
                      ? "5–10 minutes"
                      : "25–35 minutes"}
                </b>
              </span>
            </div>
            <span className="auto-update">
              <i /> Updates automatically
            </span>
          </div>
          <div
            className="progress-track"
            aria-label={`Current order status: ${stage.kicker}`}
          >
            <div className="progress-line">
              <i style={{ width: `${stage.progress}%` }} />
            </div>
            {steps.map((step, position) => {
              const Icon = step.icon;
              const complete = position <= index;
              const current = position === index;
              return (
                <div
                  className={`progress-step ${complete ? "complete" : ""} ${current ? "current" : ""}`}
                  key={step.id}
                >
                  <div>
                    {position < index ? (
                      <Check size={18} />
                    ) : (
                      <Icon size={19} />
                    )}
                  </div>
                  <b>{step.label}</b>
                  <span>
                    {current
                      ? "Current status"
                      : position < index
                        ? "Completed"
                        : "Up next"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="journey-card">
            <div className="journey-heading">
              <div>
                <span>DELIVERY JOURNEY</span>
                <b>
                  {order.status === "OUT_FOR_DELIVERY"
                    ? "Courier is heading your way"
                    : order.status === "DELIVERED"
                      ? "Delivered to your door"
                      : "Your order is moving through the kitchen"}
                </b>
              </div>
              {!isCancelled && order.status !== "DELIVERED" && (
                <span className="courier-live">
                  <i /> LIVE
                </span>
              )}
            </div>
            <div
              className="journey-route"
              style={{ "--delivery-progress": `${journeyProgress}%` }}
            >
              <span className="journey-point">
                <ChefHat size={18} />
                <small>Savory</small>
              </span>
              <div className="journey-road">
                <i />
              </div>
              <span className="journey-bike">
                <Bike size={21} />
              </span>
              <span className="journey-point">
                <Home size={18} />
                <small>Your door</small>
              </span>
            </div>
          </div>
        </section>
        <aside className="receipt-card">
          <h2>Your order</h2>
          <div className="receipt-items">
            {order.items.map((item) => (
              <div key={item.menuItemId}>
                <span>
                  <b>{item.quantity}×</b> {item.name}
                </span>
                <b>{money(item.unitPrice * item.quantity)}</b>
              </div>
            ))}
          </div>
          <div className="receipt-totals">
            <div>
              <span>Subtotal</span>
              <b>{money(order.subtotal)}</b>
            </div>
            <div>
              <span>Delivery</span>
              <b>{order.deliveryFee ? money(order.deliveryFee) : "On us"}</b>
            </div>
            <div>
              <span>Tax</span>
              <b>{money(order.tax)}</b>
            </div>
            <div>
              <span>Total</span>
              <b>{money(order.total)}</b>
            </div>
          </div>
          <div className="delivery-address">
            <MapPin size={20} />
            <div>
              <small>DELIVERING TO</small>
              <b>{order.customer.name}</b>
              <span>{order.customer.address}</span>
            </div>
          </div>
        </aside>
      </div>
      <p className="tracking-help">
        Need help? Call us at <a href="tel:+15550192468">+1 555 019 2468</a>
      </p>
      {showDelivered && (
        <div
          className="completion-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delivered-title"
        >
          <div className="completion-modal">
            <div className="completion-icon">
              <Check size={34} />
            </div>
            <span className="eyebrow">DELIVERY COMPLETE</span>
            <h2 id="delivered-title">Your order has arrived!</h2>
            <p>
              We hope every bite is worth the wait. Thank you for ordering with
              Savory.
            </p>
            <div className="completion-order">
              <span>Order {order.orderNumber}</span>
              <b>{money(order.total)}</b>
            </div>
            <button
              className="primary-button full"
              onClick={() => router.push("/")}
            >
              <Home size={18} /> Back to home <ArrowRight size={17} />
            </button>
            <button
              className="history-button"
              onClick={() => router.push("/orders")}
            >
              <History size={17} /> View order history
            </button>
            <small>Returning home automatically in {secondsLeft} seconds</small>
          </div>
        </div>
      )}
    </main>
  );
}
