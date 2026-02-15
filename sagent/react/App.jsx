// App.js (React + Bootstrap, full working Personal Budget Tracker using localStorage)
// 1) Install bootstrap:  npm i bootstrap
// 2) In src/index.js add: import "bootstrap/dist/css/bootstrap.min.css";
// 3) Run: npm start

import React, { useEffect, useMemo, useState } from "react";

const LS_KEY = "pbt_v1";

const uid = () =>
  (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).toString();

const money = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const yyyyMm = (dateStr) => (dateStr ? dateStr.slice(0, 7) : "");

const todayISO = () => new Date().toISOString().slice(0, 10);

const monthKeyNow = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    money(n)
  );

function seed() {
  const userId = uid();
  const catFood = uid();
  const catTransport = uid();
  const catBills = uid();
  const catSalary = uid();

  const m = monthKeyNow();
  const [year, month] = m.split("-").map((x) => Number(x));

  return {
    user: {
      user_id: userId,
      name: "Me",
      email: "me@example.com",
      password_hash: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    categories: [
      {
        category_id: catSalary,
        user_id: userId,
        name: "Salary",
        type: "income",
        color: "#0d6efd",
        created_at: new Date().toISOString(),
      },
      {
        category_id: catFood,
        user_id: userId,
        name: "Food",
        type: "expense",
        color: "#dc3545",
        created_at: new Date().toISOString(),
      },
      {
        category_id: catTransport,
        user_id: userId,
        name: "Transport",
        type: "expense",
        color: "#198754",
        created_at: new Date().toISOString(),
      },
      {
        category_id: catBills,
        user_id: userId,
        name: "Bills",
        type: "expense",
        color: "#6f42c1",
        created_at: new Date().toISOString(),
      },
    ],
    income: [
      {
        income_id: uid(),
        user_id: userId,
        source: "Monthly Salary",
        amount: 60000,
        income_date: todayISO(),
        description: "Seed income",
        created_at: new Date().toISOString(),
      },
    ],
    expenses: [
      {
        expense_id: uid(),
        user_id: userId,
        category_id: catFood,
        amount: 250,
        expense_date: todayISO(),
        description: "Breakfast",
        payment_method: "UPI",
        created_at: new Date().toISOString(),
      },
    ],
    budgets: [
      {
        budget_id: uid(),
        user_id: userId,
        category_id: catFood,
        month,
        year,
        limit_amount: 6000,
        created_at: new Date().toISOString(),
      },
      {
        budget_id: uid(),
        user_id: userId,
        category_id: catTransport,
        month,
        year,
        limit_amount: 3000,
        created_at: new Date().toISOString(),
      },
    ],
    savingGoals: [
      {
        goal_id: uid(),
        user_id: userId,
        name: "Emergency Fund",
        target_amount: 100000,
        current_amount: 10000,
        target_date: `${new Date().getFullYear()}-12-31`,
        status: "active",
        created_at: new Date().toISOString(),
      },
    ],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    // basic shape check
    if (!parsed?.user?.user_id) return seed();
    return parsed;
  } catch {
    return seed();
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

const ProgressBar = ({ value, max }) => {
  const v = money(value);
  const m = Math.max(0.000001, money(max));
  const pct = Math.min(999, (v / m) * 100);
  const variant = pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-warning" : "bg-success";
  return (
    <div className="progress" style={{ height: 10 }}>
      <div
        className={`progress-bar ${variant}`}
        role="progressbar"
        style={{ width: `${Math.min(100, pct)}%` }}
        aria-valuenow={pct}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  );
};

export default function App() {
  const [db, setDb] = useState(loadState());
  const [tab, setTab] = useState("dashboard");

  // global filter month
  const [monthKey, setMonthKey] = useState(monthKeyNow()); // YYYY-MM
  const [year, month] = useMemo(() => monthKey.split("-").map(Number), [monthKey]);

  useEffect(() => {
    saveState(db);
  }, [db]);

  const catsIncome = useMemo(
    () => db.categories.filter((c) => c.type === "income"),
    [db.categories]
  );
  const catsExpense = useMemo(
    () => db.categories.filter((c) => c.type === "expense"),
    [db.categories]
  );

  const catById = useMemo(() => {
    const m = new Map();
    for (const c of db.categories) m.set(c.category_id, c);
    return m;
  }, [db.categories]);

  const incomeInMonth = useMemo(
    () => db.income.filter((i) => i.user_id === db.user.user_id && yyyyMm(i.income_date) === monthKey),
    [db.income, db.user.user_id, monthKey]
  );

  const expensesInMonth = useMemo(
    () =>
      db.expenses.filter(
        (e) => e.user_id === db.user.user_id && yyyyMm(e.expense_date) === monthKey
      ),
    [db.expenses, db.user.user_id, monthKey]
  );

  const totalIncome = useMemo(
    () => incomeInMonth.reduce((s, i) => s + money(i.amount), 0),
    [incomeInMonth]
  );
  const totalExpense = useMemo(
    () => expensesInMonth.reduce((s, e) => s + money(e.amount), 0),
    [expensesInMonth]
  );
  const net = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    for (const e of expensesInMonth) {
      map.set(e.category_id, (map.get(e.category_id) || 0) + money(e.amount));
    }
    return map;
  }, [expensesInMonth]);

  const budgetsForMonth = useMemo(
    () => db.budgets.filter((b) => b.user_id === db.user.user_id && b.year === year && b.month === month),
    [db.budgets, db.user.user_id, year, month]
  );

  const budgetByCategory = useMemo(() => {
    const map = new Map();
    for (const b of budgetsForMonth) map.set(b.category_id, b);
    return map;
  }, [budgetsForMonth]);

  // ---------- CRUD helpers ----------
  const upsertCategory = (payload) => {
    setDb((prev) => {
      const exists = prev.categories.some((c) => c.category_id === payload.category_id);
      const categories = exists
        ? prev.categories.map((c) => (c.category_id === payload.category_id ? payload : c))
        : [payload, ...prev.categories];
      return { ...prev, categories };
    });
  };

  const deleteCategory = (category_id) => {
    setDb((prev) => {
      const categories = prev.categories.filter((c) => c.category_id !== category_id);
      // Also remove budgets for that category; keep transactions but mark category missing in UI
      const budgets = prev.budgets.filter((b) => b.category_id !== category_id);
      return { ...prev, categories, budgets };
    });
  };

  const addIncome = (payload) => {
    setDb((prev) => ({ ...prev, income: [payload, ...prev.income] }));
  };

  const deleteIncome = (income_id) => {
    setDb((prev) => ({ ...prev, income: prev.income.filter((i) => i.income_id !== income_id) }));
  };

  const addExpense = (payload) => {
    setDb((prev) => ({ ...prev, expenses: [payload, ...prev.expenses] }));
  };

  const deleteExpense = (expense_id) => {
    setDb((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.expense_id !== expense_id) }));
  };

  const upsertBudget = (payload) => {
    setDb((prev) => {
      const idx = prev.budgets.findIndex((b) => b.budget_id === payload.budget_id);
      const budgets =
        idx >= 0
          ? prev.budgets.map((b) => (b.budget_id === payload.budget_id ? payload : b))
          : [payload, ...prev.budgets];
      return { ...prev, budgets };
    });
  };

  const deleteBudget = (budget_id) => {
    setDb((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b.budget_id !== budget_id) }));
  };

  const upsertGoal = (payload) => {
    setDb((prev) => {
      const exists = prev.savingGoals.some((g) => g.goal_id === payload.goal_id);
      const savingGoals = exists
        ? prev.savingGoals.map((g) => (g.goal_id === payload.goal_id ? payload : g))
        : [payload, ...prev.savingGoals];
      return { ...prev, savingGoals };
    });
  };

  const deleteGoal = (goal_id) => {
    setDb((prev) => ({
      ...prev,
      savingGoals: prev.savingGoals.filter((g) => g.goal_id !== goal_id),
    }));
  };

  const resetAll = () => {
    if (!window.confirm("Reset everything? This will wipe local data.")) return;
    const s = seed();
    setDb(s);
    setMonthKey(monthKeyNow());
    setTab("dashboard");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personal-budget-tracker.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed?.user?.user_id || !Array.isArray(parsed.categories)) {
        alert("Invalid file.");
        return;
      }
      setDb(parsed);
      alert("Imported!");
    } catch {
      alert("Failed to import.");
    }
  };

  // ---------- Forms state ----------
  const [incomeForm, setIncomeForm] = useState({
    source: "",
    amount: "",
    income_date: todayISO(),
    description: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    category_id: "",
    amount: "",
    expense_date: todayISO(),
    description: "",
    payment_method: "UPI",
  });

  const [catForm, setCatForm] = useState({
    category_id: "",
    name: "",
    type: "expense",
    color: "#0d6efd",
  });

  const [budgetForm, setBudgetForm] = useState({
    budget_id: "",
    category_id: "",
    limit_amount: "",
  });

  const [goalForm, setGoalForm] = useState({
    goal_id: "",
    name: "",
    target_amount: "",
    current_amount: "",
    target_date: "",
    status: "active",
  });

  useEffect(() => {
    // default selections when categories exist
    if (!expenseForm.category_id && catsExpense[0]?.category_id) {
      setExpenseForm((p) => ({ ...p, category_id: catsExpense[0].category_id }));
    }
  }, [catsExpense, expenseForm.category_id]);

  // ---------- Derived (top categories) ----------
  const topExpenseCats = useMemo(() => {
    const rows = [...expenseByCategory.entries()].map(([cid, amt]) => ({
      category_id: cid,
      amount: amt,
      name: catById.get(cid)?.name || "Unknown",
      color: catById.get(cid)?.color || "#6c757d",
    }));
    rows.sort((a, b) => b.amount - a.amount);
    return rows.slice(0, 8);
  }, [expenseByCategory, catById]);

  // ---------- UI ----------
  const NavTab = ({ id, label }) => (
    <button
      className={`nav-link ${tab === id ? "active" : ""}`}
      onClick={() => setTab(id)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h3 className="mb-0">Personal Budget Tracker</h3>
            <div className="text-muted small">
              Local only (saves in your browser) • User: <strong>{db.user.name}</strong>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group" style={{ maxWidth: 220 }}>
              <span className="input-group-text">Month</span>
              <input
                className="form-control"
                type="month"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
              />
            </div>

            <div className="btn-group">
              <button className="btn btn-outline-secondary btn-sm" onClick={exportJSON}>
                Export
              </button>
              <label className="btn btn-outline-secondary btn-sm mb-0">
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
              <button className="btn btn-outline-danger btn-sm" onClick={resetAll}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <NavTab id="dashboard" label="Dashboard" />
          </li>
          <li className="nav-item">
            <NavTab id="income" label="Income" />
          </li>
          <li className="nav-item">
            <NavTab id="expenses" label="Expenses" />
          </li>
          <li className="nav-item">
            <NavTab id="budgets" label="Budgets" />
          </li>
          <li className="nav-item">
            <NavTab id="goals" label="Saving Goals" />
          </li>
          <li className="nav-item">
            <NavTab id="categories" label="Categories" />
          </li>
        </ul>

        {tab === "dashboard" && (
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">This Month Summary</h5>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-muted">Income</div>
                    <div className="fw-semibold">{fmtINR(totalIncome)}</div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-muted">Expense</div>
                    <div className="fw-semibold">{fmtINR(totalExpense)}</div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">Net</div>
                    <div className={`fw-bold ${net >= 0 ? "text-success" : "text-danger"}`}>
                      {fmtINR(net)}
                    </div>
                  </div>

                  <div className="mt-3 small text-muted">
                    Tip: Set budgets per category to keep spending under control.
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title mb-0">Top Spending Categories</h5>
                    <span className="badge text-bg-secondary">
                      {expensesInMonth.length} expenses
                    </span>
                  </div>

                  {topExpenseCats.length === 0 ? (
                    <div className="text-muted">No expenses for this month.</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {topExpenseCats.map((r) => {
                        const b = budgetByCategory.get(r.category_id);
                        const spent = r.amount;
                        const limit = b?.limit_amount ?? 0;
                        const hasBudget = !!b;

                        return (
                          <div
                            key={r.category_id}
                            className="list-group-item px-0"
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="rounded-circle d-inline-block"
                                  style={{
                                    width: 10,
                                    height: 10,
                                    background: r.color,
                                  }}
                                />
                                <div className="fw-semibold">{r.name}</div>
                                {hasBudget && (
                                  <span className="badge text-bg-light border">
                                    Budget: {fmtINR(limit)}
                                  </span>
                                )}
                              </div>
                              <div className="fw-semibold">{fmtINR(spent)}</div>
                            </div>

                            {hasBudget && (
                              <div className="mt-2">
                                <ProgressBar value={spent} max={limit} />
                                <div className="small text-muted mt-1">
                                  {spent >= limit
                                    ? "Budget exceeded"
                                    : `${fmtINR(limit - spent)} remaining`}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-body">
                  <h5 className="card-title">Quick Add</h5>
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className="border rounded p-3 bg-white">
                        <div className="fw-semibold mb-2">Add Income</div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const amt = money(incomeForm.amount);
                            if (!incomeForm.source.trim() || amt <= 0) return;

                            addIncome({
                              income_id: uid(),
                              user_id: db.user.user_id,
                              source: incomeForm.source.trim(),
                              amount: amt,
                              income_date: incomeForm.income_date || todayISO(),
                              description: incomeForm.description.trim(),
                              created_at: new Date().toISOString(),
                            });

                            setIncomeForm({
                              source: "",
                              amount: "",
                              income_date: todayISO(),
                              description: "",
                            });
                          }}
                          className="d-grid gap-2"
                        >
                          <input
                            className="form-control"
                            placeholder="Source (e.g., Salary)"
                            value={incomeForm.source}
                            onChange={(e) =>
                              setIncomeForm((p) => ({ ...p, source: e.target.value }))
                            }
                          />
                          <div className="d-flex gap-2">
                            <input
                              className="form-control"
                              type="number"
                              placeholder="Amount"
                              value={incomeForm.amount}
                              onChange={(e) =>
                                setIncomeForm((p) => ({ ...p, amount: e.target.value }))
                              }
                            />
                            <input
                              className="form-control"
                              type="date"
                              value={incomeForm.income_date}
                              onChange={(e) =>
                                setIncomeForm((p) => ({
                                  ...p,
                                  income_date: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <input
                            className="form-control"
                            placeholder="Description (optional)"
                            value={incomeForm.description}
                            onChange={(e) =>
                              setIncomeForm((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                          />
                          <button className="btn btn-primary" type="submit">
                            Add Income
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="border rounded p-3 bg-white">
                        <div className="fw-semibold mb-2">Add Expense</div>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const amt = money(expenseForm.amount);
                            if (!expenseForm.category_id || amt <= 0) return;

                            addExpense({
                              expense_id: uid(),
                              user_id: db.user.user_id,
                              category_id: expenseForm.category_id,
                              amount: amt,
                              expense_date: expenseForm.expense_date || todayISO(),
                              description: expenseForm.description.trim(),
                              payment_method: expenseForm.payment_method || "UPI",
                              created_at: new Date().toISOString(),
                            });

                            setExpenseForm((p) => ({
                              ...p,
                              amount: "",
                              description: "",
                              expense_date: todayISO(),
                            }));
                          }}
                          className="d-grid gap-2"
                        >
                          <select
                            className="form-select"
                            value={expenseForm.category_id}
                            onChange={(e) =>
                              setExpenseForm((p) => ({ ...p, category_id: e.target.value }))
                            }
                          >
                            {catsExpense.length === 0 ? (
                              <option value="">No expense categories</option>
                            ) : (
                              catsExpense.map((c) => (
                                <option key={c.category_id} value={c.category_id}>
                                  {c.name}
                                </option>
                              ))
                            )}
                          </select>

                          <div className="d-flex gap-2">
                            <input
                              className="form-control"
                              type="number"
                              placeholder="Amount"
                              value={expenseForm.amount}
                              onChange={(e) =>
                                setExpenseForm((p) => ({ ...p, amount: e.target.value }))
                              }
                            />
                            <input
                              className="form-control"
                              type="date"
                              value={expenseForm.expense_date}
                              onChange={(e) =>
                                setExpenseForm((p) => ({
                                  ...p,
                                  expense_date: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="d-flex gap-2">
                            <input
                              className="form-control"
                              placeholder="Description (optional)"
                              value={expenseForm.description}
                              onChange={(e) =>
                                setExpenseForm((p) => ({
                                  ...p,
                                  description: e.target.value,
                                }))
                              }
                            />
                            <select
                              className="form-select"
                              value={expenseForm.payment_method}
                              onChange={(e) =>
                                setExpenseForm((p) => ({
                                  ...p,
                                  payment_method: e.target.value,
                                }))
                              }
                            >
                              <option>UPI</option>
                              <option>Cash</option>
                              <option>Card</option>
                              <option>NetBanking</option>
                            </select>
                          </div>

                          <button
                            className={`btn btn-danger ${catsExpense.length === 0 ? "disabled" : ""}`}
                            type="submit"
                            disabled={catsExpense.length === 0}
                          >
                            Add Expense
                          </button>

                          {catsExpense.length === 0 && (
                            <div className="small text-muted">
                              Create an expense category first (Categories tab).
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "income" && (
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Add Income</h5>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amt = money(incomeForm.amount);
                      if (!incomeForm.source.trim() || amt <= 0) return;

                      addIncome({
                        income_id: uid(),
                        user_id: db.user.user_id,
                        source: incomeForm.source.trim(),
                        amount: amt,
                        income_date: incomeForm.income_date || todayISO(),
                        description: incomeForm.description.trim(),
                        created_at: new Date().toISOString(),
                      });

                      setIncomeForm({
                        source: "",
                        amount: "",
                        income_date: todayISO(),
                        description: "",
                      });
                    }}
                    className="d-grid gap-2"
                  >
                    <input
                      className="form-control"
                      placeholder="Source"
                      value={incomeForm.source}
                      onChange={(e) =>
                        setIncomeForm((p) => ({ ...p, source: e.target.value }))
                      }
                    />
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Amount"
                      value={incomeForm.amount}
                      onChange={(e) =>
                        setIncomeForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />
                    <input
                      className="form-control"
                      type="date"
                      value={incomeForm.income_date}
                      onChange={(e) =>
                        setIncomeForm((p) => ({ ...p, income_date: e.target.value }))
                      }
                    />
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Description (optional)"
                      value={incomeForm.description}
                      onChange={(e) =>
                        setIncomeForm((p) => ({ ...p, description: e.target.value }))
                      }
                    />
                    <button className="btn btn-primary" type="submit">
                      Add
                    </button>
                  </form>
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">Total Income ({monthKey})</div>
                    <div className="fw-bold">{fmtINR(totalIncome)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Income List</h5>
                  {incomeInMonth.length === 0 ? (
                    <div className="text-muted">No income entries for this month.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Source</th>
                            <th className="text-end">Amount</th>
                            <th>Description</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {incomeInMonth
                            .slice()
                            .sort((a, b) => (b.income_date || "").localeCompare(a.income_date || ""))
                            .map((i) => (
                              <tr key={i.income_id}>
                                <td>{i.income_date}</td>
                                <td>{i.source}</td>
                                <td className="text-end">{fmtINR(i.amount)}</td>
                                <td className="text-muted">{i.description || "-"}</td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => deleteIncome(i.income_id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "expenses" && (
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Add Expense</h5>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amt = money(expenseForm.amount);
                      if (!expenseForm.category_id || amt <= 0) return;

                      addExpense({
                        expense_id: uid(),
                        user_id: db.user.user_id,
                        category_id: expenseForm.category_id,
                        amount: amt,
                        expense_date: expenseForm.expense_date || todayISO(),
                        description: expenseForm.description.trim(),
                        payment_method: expenseForm.payment_method || "UPI",
                        created_at: new Date().toISOString(),
                      });

                      setExpenseForm((p) => ({
                        ...p,
                        amount: "",
                        description: "",
                        expense_date: todayISO(),
                      }));
                    }}
                    className="d-grid gap-2"
                  >
                    <select
                      className="form-select"
                      value={expenseForm.category_id}
                      onChange={(e) =>
                        setExpenseForm((p) => ({ ...p, category_id: e.target.value }))
                      }
                    >
                      {catsExpense.length === 0 ? (
                        <option value="">No expense categories</option>
                      ) : (
                        catsExpense.map((c) => (
                          <option key={c.category_id} value={c.category_id}>
                            {c.name}
                          </option>
                        ))
                      )}
                    </select>

                    <input
                      className="form-control"
                      type="number"
                      placeholder="Amount"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm((p) => ({ ...p, amount: e.target.value }))
                      }
                    />

                    <input
                      className="form-control"
                      type="date"
                      value={expenseForm.expense_date}
                      onChange={(e) =>
                        setExpenseForm((p) => ({ ...p, expense_date: e.target.value }))
                      }
                    />

                    <input
                      className="form-control"
                      placeholder="Description (optional)"
                      value={expenseForm.description}
                      onChange={(e) =>
                        setExpenseForm((p) => ({ ...p, description: e.target.value }))
                      }
                    />

                    <select
                      className="form-select"
                      value={expenseForm.payment_method}
                      onChange={(e) =>
                        setExpenseForm((p) => ({ ...p, payment_method: e.target.value }))
                      }
                    >
                      <option>UPI</option>
                      <option>Cash</option>
                      <option>Card</option>
                      <option>NetBanking</option>
                    </select>

                    <button
                      className={`btn btn-danger ${catsExpense.length === 0 ? "disabled" : ""}`}
                      type="submit"
                      disabled={catsExpense.length === 0}
                    >
                      Add
                    </button>

                    {catsExpense.length === 0 && (
                      <div className="small text-muted">
                        Create an expense category first (Categories tab).
                      </div>
                    )}
                  </form>
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted">Total Expense ({monthKey})</div>
                    <div className="fw-bold">{fmtINR(totalExpense)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Expense List</h5>
                  {expensesInMonth.length === 0 ? (
                    <div className="text-muted">No expenses for this month.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th className="text-end">Amount</th>
                            <th>Payment</th>
                            <th>Description</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expensesInMonth
                            .slice()
                            .sort((a, b) =>
                              (b.expense_date || "").localeCompare(a.expense_date || "")
                            )
                            .map((e) => {
                              const c = catById.get(e.category_id);
                              return (
                                <tr key={e.expense_id}>
                                  <td>{e.expense_date}</td>
                                  <td>
                                    <span
                                      className="badge rounded-pill"
                                      style={{
                                        background: c?.color || "#6c757d",
                                      }}
                                    >
                                      {c?.name || "Unknown"}
                                    </span>
                                  </td>
                                  <td className="text-end">{fmtINR(e.amount)}</td>
                                  <td className="text-muted">{e.payment_method}</td>
                                  <td className="text-muted">{e.description || "-"}</td>
                                  <td className="text-end">
                                    <button
                                      className="btn btn-outline-danger btn-sm"
                                      onClick={() => deleteExpense(e.expense_id)}
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-body">
                  <h5 className="card-title">Budget Check (This Month)</h5>
                  {budgetsForMonth.length === 0 ? (
                    <div className="text-muted">No budgets set for this month.</div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {budgetsForMonth.map((b) => {
                        const c = catById.get(b.category_id);
                        const spent = expenseByCategory.get(b.category_id) || 0;
                        return (
                          <div key={b.budget_id} className="list-group-item px-0">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="rounded-circle d-inline-block"
                                  style={{
                                    width: 10,
                                    height: 10,
                                    background: c?.color || "#6c757d",
                                  }}
                                />
                                <div className="fw-semibold">{c?.name || "Unknown"}</div>
                              </div>
                              <div className="small text-muted">
                                {fmtINR(spent)} / {fmtINR(b.limit_amount)}
                              </div>
                            </div>
                            <div className="mt-2">
                              <ProgressBar value={spent} max={b.limit_amount} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "budgets" && (
          <div className="row g-3">
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Set Budget (per category)</h5>
                  <div className="text-muted small mb-2">
                    Budgets are per month: <strong>{monthKey}</strong>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const lim = money(budgetForm.limit_amount);
                      if (!budgetForm.category_id || lim <= 0) return;

                      // If budget exists for this category+month, update it
                      const existing = db.budgets.find(
                        (b) =>
                          b.user_id === db.user.user_id &&
                          b.year === year &&
                          b.month === month &&
                          b.category_id === budgetForm.category_id
                      );

                      upsertBudget({
                        budget_id: existing?.budget_id || uid(),
                        user_id: db.user.user_id,
                        category_id: budgetForm.category_id,
                        year,
                        month,
                        limit_amount: lim,
                        created_at: existing?.created_at || new Date().toISOString(),
                      });

                      setBudgetForm({ budget_id: "", category_id: "", limit_amount: "" });
                    }}
                    className="d-grid gap-2"
                  >
                    <select
                      className="form-select"
                      value={budgetForm.category_id}
                      onChange={(e) =>
                        setBudgetForm((p) => ({ ...p, category_id: e.target.value }))
                      }
                    >
                      <option value="">Select expense category</option>
                      {catsExpense.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <input
                      className="form-control"
                      type="number"
                      placeholder="Limit amount"
                      value={budgetForm.limit_amount}
                      onChange={(e) =>
                        setBudgetForm((p) => ({ ...p, limit_amount: e.target.value }))
                      }
                    />

                    <button
                      className="btn btn-success"
                      type="submit"
                      disabled={catsExpense.length === 0}
                    >
                      Save Budget
                    </button>

                    {catsExpense.length === 0 && (
                      <div className="small text-muted">
                        Create expense categories first.
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Budgets for {monthKey}</h5>

                  {budgetsForMonth.length === 0 ? (
                    <div className="text-muted">No budgets for this month.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th className="text-end">Limit</th>
                            <th className="text-end">Spent</th>
                            <th>Progress</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {budgetsForMonth.map((b) => {
                            const c = catById.get(b.category_id);
                            const spent = expenseByCategory.get(b.category_id) || 0;
                            return (
                              <tr key={b.budget_id}>
                                <td>
                                  <span
                                    className="badge rounded-pill"
                                    style={{ background: c?.color || "#6c757d" }}
                                  >
                                    {c?.name || "Unknown"}
                                  </span>
                                </td>
                                <td className="text-end">{fmtINR(b.limit_amount)}</td>
                                <td className="text-end">{fmtINR(spent)}</td>
                                <td style={{ minWidth: 180 }}>
                                  <ProgressBar value={spent} max={b.limit_amount} />
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => deleteBudget(b.budget_id)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-body">
                  <h5 className="card-title">Total Budgeted vs Spent</h5>
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className="border rounded p-3 bg-white">
                        <div className="text-muted">Total Budget</div>
                        <div className="fs-5 fw-bold">
                          {fmtINR(budgetsForMonth.reduce((s, b) => s + money(b.limit_amount), 0))}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="border rounded p-3 bg-white">
                        <div className="text-muted">Total Spent (budgeted cats)</div>
                        <div className="fs-5 fw-bold">
                          {fmtINR(
                            budgetsForMonth.reduce(
                              (s, b) => s + (expenseByCategory.get(b.category_id) || 0),
                              0
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="small text-muted mt-2">
                    Note: This compares only categories that have a budget set.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "goals" && (
          <div className="row g-3">
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    {goalForm.goal_id ? "Edit Goal" : "Add Goal"}
                  </h5>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = goalForm.name.trim();
                      const target = money(goalForm.target_amount);
                      const current = money(goalForm.current_amount);
                      if (!name || target <= 0 || current < 0) return;

                      upsertGoal({
                        goal_id: goalForm.goal_id || uid(),
                        user_id: db.user.user_id,
                        name,
                        target_amount: target,
                        current_amount: Math.min(current, target),
                        target_date: goalForm.target_date || "",
                        status: goalForm.status || "active",
                        created_at: goalForm.goal_id ? db.savingGoals.find(g=>g.goal_id===goalForm.goal_id)?.created_at || nowTs() : nowTs(),
                      });

                      setGoalForm({
                        goal_id: "",
                        name: "",
                        target_amount: "",
                        current_amount: "",
                        target_date: "",
                        status: "active",
                      });
                    }}
                    className="d-grid gap-2"
                  >
                    <input
                      className="form-control"
                      placeholder="Goal name"
                      value={goalForm.name}
                      onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    <div className="row g-2">
                      <div className="col-6">
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Target"
                          value={goalForm.target_amount}
                          onChange={(e) =>
                            setGoalForm((p) => ({ ...p, target_amount: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-6">
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Current"
                          value={goalForm.current_amount}
                          onChange={(e) =>
                            setGoalForm((p) => ({ ...p, current_amount: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <input
                      className="form-control"
                      type="date"
                      value={goalForm.target_date}
                      onChange={(e) =>
                        setGoalForm((p) => ({ ...p, target_date: e.target.value }))
                      }
                    />

                    <select
                      className="form-select"
                      value={goalForm.status}
                      onChange={(e) =>
                        setGoalForm((p) => ({ ...p, status: e.target.value }))
                      }
                    >
                      <option value="active">active</option>
                      <option value="paused">paused</option>
                      <option value="completed">completed</option>
                    </select>

                    <button className="btn btn-primary" type="submit">
                      {goalForm.goal_id ? "Save Changes" : "Add Goal"}
                    </button>

                    {goalForm.goal_id && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() =>
                          setGoalForm({
                            goal_id: "",
                            name: "",
                            target_amount: "",
                            current_amount: "",
                            target_date: "",
                            status: "active",
                          })
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">My Saving Goals</h5>

                  {db.savingGoals.length === 0 ? (
                    <div className="text-muted">No saving goals yet.</div>
                  ) : (
                    <div className="list-group">
                      {db.savingGoals.map((g) => {
                        const pct = g.target_amount
                          ? Math.min(100, (money(g.current_amount) / money(g.target_amount)) * 100)
                          : 0;
                        const variant =
                          g.status === "completed"
                            ? "bg-success"
                            : pct >= 80
                            ? "bg-info"
                            : "bg-primary";

                        return (
                          <div key={g.goal_id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <div className="fw-bold">{g.name}</div>
                                  <span className="badge text-bg-light border">
                                    {g.status}
                                  </span>
                                  {g.target_date && (
                                    <span className="badge text-bg-secondary">
                                      Target: {g.target_date}
                                    </span>
                                  )}
                                </div>

                                <div className="small text-muted mt-1">
                                  {fmtINR(g.current_amount)} / {fmtINR(g.target_amount)}
                                </div>

                                <div className="progress mt-2" style={{ height: 10 }}>
                                  <div
                                    className={`progress-bar ${variant}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>

                                <div className="small text-muted mt-1">
                                  {Math.round(pct)}% complete •{" "}
                                  {fmtINR(money(g.target_amount) - money(g.current_amount))} remaining
                                </div>
                              </div>

                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() =>
                                    setGoalForm({
                                      goal_id: g.goal_id,
                                      name: g.name,
                                      target_amount: String(g.target_amount),
                                      current_amount: String(g.current_amount),
                                      target_date: g.target_date || "",
                                      status: g.status || "active",
                                    })
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => deleteGoal(g.goal_id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div className="row g-3">
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    {catForm.category_id ? "Edit Category" : "Add Category"}
                  </h5>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = catForm.name.trim();
                      if (!name) return;

                      // enforce type
                      const type = catForm.type === "income" ? "income" : "expense";

                      upsertCategory({
                        category_id: catForm.category_id || uid(),
                        user_id: db.user.user_id,
                        name,
                        type,
                        color: catForm.color || "#0d6efd",
                        created_at:
                          catForm.category_id
                            ? db.categories.find((c) => c.category_id === catForm.category_id)
                                ?.created_at || new Date().toISOString()
                            : new Date().toISOString(),
                      });

                      setCatForm({
                        category_id: "",
                        name: "",
                        type: "expense",
                        color: "#0d6efd",
                      });
                    }}
                    className="d-grid gap-2"
                  >
                    <input
                      className="form-control"
                      placeholder="Category name"
                      value={catForm.name}
                      onChange={(e) =>
                        setCatForm((p) => ({ ...p, name: e.target.value }))
                      }
                    />

                    <select
                      className="form-select"
                      value={catForm.type}
                      onChange={(e) =>
                        setCatForm((p) => ({ ...p, type: e.target.value }))
                      }
                    >
                      <option value="expense">expense</option>
                      <option value="income">income</option>
                    </select>

                    <div className="d-flex gap-2 align-items-center">
                      <input
                        className="form-control form-control-color"
                        type="color"
                        value={catForm.color}
                        title="Choose color"
                        onChange={(e) =>
                          setCatForm((p) => ({ ...p, color: e.target.value }))
                        }
                      />
                      <div className="small text-muted">
                        This color is used in badges & charts.
                      </div>
                    </div>

                    <button className="btn btn-primary" type="submit">
                      {catForm.category_id ? "Save Changes" : "Add Category"}
                    </button>

                    {catForm.category_id && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() =>
                          setCatForm({
                            category_id: "",
                            name: "",
                            type: "expense",
                            color: "#0d6efd",
                          })
                        }
                      >
                        Cancel
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Categories</h5>

                  {db.categories.length === 0 ? (
                    <div className="text-muted">No categories.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Color</th>
                            <th className="text-end">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {db.categories
                            .slice()
                            .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
                            .map((c) => (
                              <tr key={c.category_id}>
                                <td>
                                  <span
                                    className="badge rounded-pill me-2"
                                    style={{ background: c.color || "#6c757d" }}
                                  >
                                    &nbsp;
                                  </span>
                                  {c.name}
                                </td>
                                <td>
                                  <span className={`badge ${c.type === "income" ? "text-bg-primary" : "text-bg-danger"}`}>
                                    {c.type}
                                  </span>
                                </td>
                                <td>
                                  <code>{c.color}</code>
                                </td>
                                <td className="text-end">
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-outline-primary"
                                      onClick={() =>
                                        setCatForm({
                                          category_id: c.category_id,
                                          name: c.name,
                                          type: c.type,
                                          color: c.color || "#0d6efd",
                                        })
                                      }
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => deleteCategory(c.category_id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <div className="small text-muted">
                        Note: Deleting a category won’t delete old transactions; it will show as “Unknown”.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card shadow-sm mt-3">
                <div className="card-body">
                  <h5 className="card-title">Spending Breakdown (This Month)</h5>
                  {topExpenseCats.length === 0 ? (
                    <div className="text-muted">No spending data.</div>
                  ) : (
                    <div className="d-grid gap-2">
                      {topExpenseCats.map((r) => {
                        const pct = totalExpense ? (r.amount / totalExpense) * 100 : 0;
                        return (
                          <div key={r.category_id} className="border rounded p-2 bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-2">
                                <span
                                  className="rounded-circle d-inline-block"
                                  style={{
                                    width: 10,
                                    height: 10,
                                    background: r.color,
                                  }}
                                />
                                <div className="fw-semibold">{r.name}</div>
                              </div>
                              <div className="small text-muted">
                                {fmtINR(r.amount)} • {Math.round(pct)}%
                              </div>
                            </div>
                            <div className="progress mt-2" style={{ height: 10 }}>
                              <div
                                className="progress-bar"
                                style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-4 text-center text-muted small">
          Works offline • Data stored in localStorage • Month filter affects dashboard/lists
        </footer>
      </div>
    </div>
  );
}
