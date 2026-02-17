// App.js — Improved Grocery Store (Bootstrap)
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "grocery_app_v2";
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const money = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "₹0.00";
  return `₹${x.toFixed(2)}`;
};

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { items: [], cart: [] };
  });

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  // form state
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      2200
    );
  };

  const normalize = (s) => s.trim().replace(/\s+/g, " ");

  const itemsById = useMemo(() => {
    const m = new Map();
    data.items.forEach((i) => m.set(i.id, i));
    return m;
  }, [data.items]);

  const cartLines = useMemo(() => {
    // cart = [{id, qty}]
    return data.cart
      .map((c) => {
        const item = itemsById.get(c.id);
        if (!item) return null;
        const p = Number(item.price);
        const qty = Number(c.qty);
        if (!Number.isFinite(p) || !Number.isFinite(qty)) return null;
        return {
          id: c.id,
          name: item.name,
          price: p,
          qty,
          lineTotal: p * qty,
        };
      })
      .filter(Boolean);
  }, [data.cart, itemsById]);

  const totals = useMemo(() => {
    const subtotal = cartLines.reduce((s, x) => s + x.lineTotal, 0);
    const itemsCount = cartLines.reduce((s, x) => s + x.qty, 0);
    // You can tweak these
    const taxRate = 0.05; // 5%
    const tax = subtotal * taxRate;
    const grand = subtotal + tax;
    return { subtotal, tax, grand, itemsCount, taxRate };
  }, [cartLines]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter((i) => i.name.toLowerCase().includes(q));
  }, [data.items, search]);

  // actions
  const addItem = () => {
    const name = normalize(itemName);
    if (!name) return showToast("Item name is required.", "danger");

    const p = Number(price);
    if (!Number.isFinite(p) || p < 0)
      return showToast("Enter a valid price.", "danger");

    const exists = data.items.some((i) => i.name.toLowerCase() === name.toLowerCase());
    if (exists) return showToast("Item already exists.", "warning");

    setData((d) => ({
      ...d,
      items: [{ id: uid(), name, price: p }, ...d.items],
    }));
    setItemName("");
    setPrice("");
    showToast("Item added ✅");
  };

  const deleteItem = (id) => {
    const inCart = data.cart.some((c) => c.id === id);
    if (inCart) return showToast("Remove from cart before deleting.", "warning");

    setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));
    showToast("Item deleted.", "info");
  };

  const addToCart = (id) => {
    setData((d) => {
      const existing = d.cart.find((c) => c.id === id);
      if (existing) {
        return {
          ...d,
          cart: d.cart.map((c) =>
            c.id === id ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }
      return { ...d, cart: [{ id, qty: 1 }, ...d.cart] };
    });
    showToast("Added to cart ✅");
  };

  const setQty = (id, qty) => {
    const q = Number(qty);
    if (!Number.isFinite(q)) return;
    setData((d) => {
      if (q <= 0) return { ...d, cart: d.cart.filter((c) => c.id !== id) };
      return { ...d, cart: d.cart.map((c) => (c.id === id ? { ...c, qty: q } : c)) };
    });
  };

  const removeFromCart = (id) => {
    setData((d) => ({ ...d, cart: d.cart.filter((c) => c.id !== id) }));
    showToast("Removed.", "info");
  };

  const clearCart = () => {
    if (!window.confirm("Clear cart?")) return;
    setData((d) => ({ ...d, cart: [] }));
    showToast("Cart cleared.", "info");
  };

  const resetAll = () => {
    if (!window.confirm("Reset everything? This will clear all data.")) return;
    setData({ items: [], cart: [] });
    setItemName("");
    setPrice("");
    setSearch("");
    showToast("Reset done.", "info");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "grocery_data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !Array.isArray(parsed.items) || !Array.isArray(parsed.cart)) {
        return showToast("Invalid JSON format.", "danger");
      }
      setData(parsed);
      showToast("Imported ✅", "success");
    } catch {
      showToast("Import failed.", "danger");
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-semibold">Grocery Store</span>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-outline-light btn-sm" onClick={exportJSON}>
              Export
            </button>
            <label className="btn btn-outline-light btn-sm mb-0">
              Import
              <input
                type="file"
                accept="application/json"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importJSON(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button className="btn btn-danger btn-sm" onClick={resetAll}>
              Reset
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Header stats */}
        <div className="row g-3 mb-3">
          <StatCard title="Items" value={data.items.length} />
          <StatCard title="Cart Qty" value={totals.itemsCount} />
          <StatCard title="Subtotal" value={money(totals.subtotal)} />
          <StatCard title="Total" value={money(totals.grand)} />
        </div>

        <div className="row g-3">
          {/* Inventory */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Inventory</h5>
                  <span className="badge text-bg-secondary">{data.items.length}</span>
                </div>

                {/* Add item */}
                <div className="row g-2">
                  <div className="col-md-6">
                    <input
                      className="form-control"
                      placeholder="Item name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addItem()}
                    />
                  </div>
                  <div className="col-md-3">
                    <input
                      className="form-control"
                      placeholder="Price"
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addItem()}
                    />
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-success w-100" onClick={addItem}>
                      Add Item
                    </button>
                  </div>
                </div>

                {/* Search */}
                <input
                  className="form-control form-control-sm mt-3"
                  placeholder="Search inventory..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {/* List */}
                <div className="mt-3" style={{ maxHeight: 360, overflow: "auto" }}>
                  {filteredItems.length === 0 ? (
                    <div className="text-muted small py-2">No items.</div>
                  ) : (
                    <ul className="list-group">
                      {filteredItems.map((i) => (
                        <li
                          key={i.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="me-3 text-truncate">
                            <div className="fw-semibold text-truncate">{i.name}</div>
                            <div className="text-muted small">{money(i.price)}</div>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => addToCart(i.id)}
                            >
                              Add
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => deleteItem(i.id)}
                              title="Delete item"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Cart</h5>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={clearCart}
                    disabled={data.cart.length === 0}
                  >
                    Clear
                  </button>
                </div>

                <div className="mt-3" style={{ maxHeight: 320, overflow: "auto" }}>
                  {cartLines.length === 0 ? (
                    <div className="text-muted small py-2">Cart is empty.</div>
                  ) : (
                    <ul className="list-group">
                      {cartLines.map((c) => (
                        <li key={c.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="me-2 text-truncate">
                              <div className="fw-semibold text-truncate">{c.name}</div>
                              <div className="text-muted small">
                                {money(c.price)} × {c.qty} = {money(c.lineTotal)}
                              </div>
                            </div>

                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeFromCart(c.id)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="d-flex gap-2 align-items-center mt-2">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setQty(c.id, c.qty - 1)}
                            >
                              −
                            </button>
                            <input
                              className="form-control form-control-sm"
                              style={{ width: 70 }}
                              value={c.qty}
                              inputMode="numeric"
                              onChange={(e) => setQty(c.id, e.target.value)}
                            />
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setQty(c.id, c.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <hr />

                <div className="d-flex justify-content-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold">{money(totals.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tax ({Math.round(totals.taxRate * 100)}%)</span>
                  <span className="fw-semibold">{money(totals.tax)}</span>
                </div>
                <div className="d-flex justify-content-between fs-5 mt-1">
                  <span className="fw-semibold">Total</span>
                  <span className="fw-semibold">{money(totals.grand)}</span>
                </div>

                <button
                  className="btn btn-success w-100 mt-3"
                  disabled={cartLines.length === 0}
                  onClick={() => showToast("Checkout simulated ✅", "success")}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div
          className={
            "toast align-items-center text-bg-" +
            toast.type +
            " border-0 position-fixed bottom-0 end-0 m-3 " +
            (toast.show ? "show" : "hide")
          }
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{toast.msg}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() => setToast((t) => ({ ...t, show: false }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card shadow-sm">
        <div className="card-body py-3">
          <div className="text-muted small">{title}</div>
          <div className="fs-5 fw-semibold text-truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}
