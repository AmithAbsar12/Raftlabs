"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

const money = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    amount,
  );

export function MenuExperience({ items }) {
  const router = useRouter();
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    instructions: "",
  });
  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const cartItems = items
    .filter((item) => cart[item.id])
    .map((item) => ({ ...item, quantity: cart[item.id] }));
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const delivery = subtotal >= 35 ? 0 : 4;
  const total = subtotal + delivery + Math.round(subtotal * 8) / 100;
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          `${item.name} ${item.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [items, query, category],
  );

  const changeQuantity = (id, delta) =>
    setCart((current) => {
      const quantity = Math.max(0, Math.min(20, (current[id] || 0) + delta));
      const next = { ...current };
      quantity ? (next[id] = quantity) : delete next[id];
      return next;
    });
  function openCart() {
    setCartOpen(true);
  }

  async function placeOrder(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: cartItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error === "Validation failed"
            ? "Please check your delivery details."
            : result.error,
        );
      setCart({});
      setCartOpen(false);
      setCheckout(false);
      router.push(`/orders/${result.data.id}`);
    } catch (reason) {
      setError(
        reason.message || "We couldn't place your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <a className="brand" href="#top">
          <span className="brand-mark">S</span>
          <span>Savory</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#menu">Menu</a>
          <Link href="/orders">Order history</Link>
          <a href="#story">Our story</a>
          <a href="#footer">Contact</a>
        </nav>
        <button
          className="cart-button"
          onClick={openCart}
          aria-label={`Open cart with ${count} items`}
        >
          <ShoppingBag size={19} />
          <span>Cart</span>
          {count > 0 && <b>{count}</b>}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={14} /> Made fresh, delivered warm
            </span>
            <h1>
              Good food.
              <br />
              <em>Better moments.</em>
            </h1>
            <p>
              Chef-crafted comfort food, made with honest ingredients and
              delivered to your door.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#menu">
                Explore the menu <ArrowRight size={18} />
              </a>
              <span className="delivery-note">
                <Clock3 size={18} />
                <span>
                  <b>25–35 min</b> average delivery
                </span>
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Fresh margherita pizza">
            <div className="hero-photo"></div>
            <div className="rating-card">
              <span className="avatar-stack">👩🏽‍🍳</span>
              <div>
                <b>Loved by locals</b>
                <span>
                  <Star size={13} fill="currentColor" /> 4.9 · 2k+ ratings
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="promise-bar" id="story">
          <div>
            <span>01</span>
            <p>
              <b>Thoughtful ingredients</b>
              <small>Fresh, local and responsibly sourced.</small>
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <b>Made to order</b>
              <small>Cooked when you order, never before.</small>
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <b>At your door, warm</b>
              <small>Fast delivery with live updates.</small>
            </p>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE SAVORY MENU</span>
              <h2>What are you craving?</h2>
            </div>
            <label className="search">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes..."
                aria-label="Search dishes"
              />
            </label>
          </div>
          <div className="category-list" aria-label="Menu categories">
            {categories.map((name) => (
              <button
                key={name}
                className={name === category ? "active" : ""}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          {filtered.length ? (
            <div className="menu-grid">
              {filtered.map((item) => (
                <article className="food-card" key={item.id}>
                  <div
                    className="food-photo"
                    role="img"
                    aria-label={item.name}
                    style={{ backgroundPosition: item.imagePosition }}
                  >
                    <span>{item.category}</span>
                  </div>
                  <div className="food-body">
                    <div className="food-title">
                      <h3>{item.name}</h3>
                      <b>{money(item.price)}</b>
                    </div>
                    <p>{item.description}</p>
                    <div className="food-footer">
                      <span>
                        <Star size={14} fill="currentColor" /> {item.rating}
                      </span>
                      {cart[item.id] ? (
                        <div className="stepper">
                          <button
                            onClick={() => changeQuantity(item.id, -1)}
                            aria-label={`Remove one ${item.name}`}
                          >
                            <Minus size={15} />
                          </button>
                          <b>{cart[item.id]}</b>
                          <button
                            onClick={() => changeQuantity(item.id, 1)}
                            aria-label={`Add one ${item.name}`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="add-button"
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          Add <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-search">
              No dishes found. Try another search.
            </div>
          )}
        </section>
      </main>

      <footer id="footer">
        <a className="brand" href="#top">
          <span className="brand-mark">S</span>
          <span>Savory</span>
        </a>
        <p>Food worth slowing down for.</p>
        <span>© 2026 Savory Kitchen</span>
      </footer>

      {cartOpen && (
        <div
          className="overlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setCartOpen(false)
          }
        >
          <aside className="cart-panel" aria-label="Your cart">
            <div className="panel-head">
              <div>
                <span className="eyebrow">YOUR ORDER</span>
                <h2>{checkout ? "Delivery details" : "Cart"}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() =>
                  checkout ? setCheckout(false) : setCartOpen(false)
                }
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>
            {!checkout ? (
              <>
                <div className="cart-content">
                  {cartItems.length ? (
                    cartItems.map((item) => (
                      <div className="cart-item" key={item.id}>
                        <div
                          className="mini-photo"
                          style={{ backgroundPosition: item.imagePosition }}
                        />
                        <div>
                          <b>{item.name}</b>
                          <span>{money(item.price)}</span>
                          <div className="stepper">
                            <button onClick={() => changeQuantity(item.id, -1)}>
                              <Minus size={14} />
                            </button>
                            <b>{item.quantity}</b>
                            <button onClick={() => changeQuantity(item.id, 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          className="remove"
                          onClick={() =>
                            setCart((old) => {
                              const next = { ...old };
                              delete next[item.id];
                              return next;
                            })
                          }
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-cart">
                      <ShoppingBag size={36} />
                      <h3>Your cart is hungry</h3>
                      <p>Add something delicious from the menu.</p>
                      <button
                        className="primary-button"
                        onClick={() => setCartOpen(false)}
                      >
                        Browse menu
                      </button>
                    </div>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="cart-summary">
                    <div>
                      <span>Subtotal</span>
                      <b>{money(subtotal)}</b>
                    </div>
                    <div>
                      <span>Delivery</span>
                      <b>{delivery ? money(delivery) : "On us"}</b>
                    </div>
                    <div>
                      <span>Estimated tax</span>
                      <b>{money(Math.round(subtotal * 8) / 100)}</b>
                    </div>
                    <div className="total-line">
                      <span>Total</span>
                      <b>{money(total)}</b>
                    </div>
                    {subtotal < 35 && (
                      <small>
                        Add {money(35 - subtotal)} more for free delivery
                      </small>
                    )}
                    <button
                      className="primary-button full"
                      onClick={() => setCheckout(true)}
                    >
                      Continue to checkout <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <form className="checkout-form" onSubmit={placeOrder}>
                <p className="secure-note">
                  <Check size={16} /> Your details are only used for this
                  delivery.
                </p>
                <label>
                  Full name
                  <input
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Alex Morgan"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+1 555 012 3456"
                  />
                </label>
                <label>
                  Delivery address
                  <textarea
                    required
                    minLength={8}
                    rows={3}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder="Apartment, street, city"
                  />
                </label>
                <label>
                  Delivery notes <small>Optional</small>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={form.instructions}
                    onChange={(e) =>
                      setForm({ ...form, instructions: e.target.value })
                    }
                    placeholder="Gate code, landmark, allergies..."
                  />
                </label>
                <div className="address-hint">
                  <MapPin size={18} />
                  <span>
                    We’ll confirm the delivery ETA after placing your order.
                  </span>
                </div>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="checkout-total">
                  <span>Total due</span>
                  <b>{money(total)}</b>
                </div>
                <button className="primary-button full" disabled={submitting}>
                  {submitting ? "Placing your order…" : "Place order"}
                  <ArrowRight size={18} />
                </button>
              </form>
            )}
          </aside>
        </div>
      )}
      {count > 0 && !cartOpen && (
        <button className="mobile-cart" onClick={openCart}>
          <span>
            <ShoppingBag size={18} /> {count} {count === 1 ? "item" : "items"}
          </span>
          <b>View cart · {money(total)}</b>
        </button>
      )}
    </div>
  );
}
