// App.js — Improved Library Management System (Bootstrap)
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "library_app_v2";

// Safer uid (works even if crypto.randomUUID isn't available)
const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const todayISO = () => new Date().toISOString();

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { members: [], books: [], transactions: [] };
  });

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  // UI state
  const [memberName, setMemberName] = useState("");
  const [bookTitle, setBookTitle] = useState("");

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  const [searchMembers, setSearchMembers] = useState("");
  const [searchBooks, setSearchBooks] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      2200
    );
  };

  // Derived
  const memberById = useMemo(() => {
    const map = new Map();
    data.members.forEach((m) => map.set(m.id, m));
    return map;
  }, [data.members]);

  const bookById = useMemo(() => {
    const map = new Map();
    data.books.forEach((b) => map.set(b.id, b));
    return map;
  }, [data.books]);

  const stats = useMemo(() => {
    const totalMembers = data.members.length;
    const totalBooks = data.books.length;
    const borrowed = data.books.filter((b) => !b.available).length;
    const available = totalBooks - borrowed;
    return { totalMembers, totalBooks, available, borrowed };
  }, [data]);

  const filteredMembers = useMemo(() => {
    const q = searchMembers.trim().toLowerCase();
    if (!q) return data.members;
    return data.members.filter((m) => m.name.toLowerCase().includes(q));
  }, [data.members, searchMembers]);

  const filteredBooks = useMemo(() => {
    const q = searchBooks.trim().toLowerCase();
    if (!q) return data.books;
    return data.books.filter((b) => b.title.toLowerCase().includes(q));
  }, [data.books, searchBooks]);

  const availableBooks = useMemo(
    () => data.books.filter((b) => b.available),
    [data.books]
  );

  // Helpers
  const normalize = (s) => s.trim().replace(/\s+/g, " ");

  // Actions
  const addMember = () => {
    const name = normalize(memberName);
    if (!name) return showToast("Member name is required.", "danger");
    const exists = data.members.some(
      (m) => m.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return showToast("Member already exists.", "warning");

    setData((d) => ({
      ...d,
      members: [{ id: uid(), name }, ...d.members],
    }));
    setMemberName("");
    showToast("Member added ✅");
  };

  const addBook = () => {
    const title = normalize(bookTitle);
    if (!title) return showToast("Book title is required.", "danger");
    const exists = data.books.some(
      (b) => b.title.toLowerCase() === title.toLowerCase()
    );
    if (exists) return showToast("Book already exists.", "warning");

    setData((d) => ({
      ...d,
      books: [{ id: uid(), title, available: true }, ...d.books],
    }));
    setBookTitle("");
    showToast("Book added ✅");
  };

  const borrowBook = () => {
    if (!selectedMember || !selectedBook)
      return showToast("Pick member + book.", "danger");

    const b = bookById.get(selectedBook);
    if (!b) return showToast("Book not found.", "danger");
    if (!b.available) return showToast("Book already borrowed.", "warning");

    setData((d) => ({
      ...d,
      books: d.books.map((x) =>
        x.id === selectedBook ? { ...x, available: false } : x
      ),
      transactions: [
        {
          id: uid(),
          type: "BORROW",
          memberId: selectedMember,
          bookId: selectedBook,
          date: todayISO(),
        },
        ...d.transactions,
      ],
    }));
    setSelectedBook("");
    showToast("Borrowed ✅");
  };

  const returnBook = (bookId, memberId = "") => {
    const b = bookById.get(bookId);
    if (!b) return showToast("Book not found.", "danger");
    if (b.available) return showToast("That book is already available.", "info");

    setData((d) => ({
      ...d,
      books: d.books.map((x) => (x.id === bookId ? { ...x, available: true } : x)),
      transactions: [
        {
          id: uid(),
          type: "RETURN",
          memberId: memberId || "",
          bookId,
          date: todayISO(),
        },
        ...d.transactions,
      ],
    }));
    showToast("Returned ✅", "success");
  };

  const deleteMember = (id) => {
    const isBorrowing = data.transactions.some((t) => {
      if (t.memberId !== id) return false;
      // member currently has any active borrowed book?
      // compute from history: last transaction per book for this member
      return false;
    });

    // simple safe rule: don't allow delete if any borrowed books exist by this member
    const borrowedBookIds = new Set(
      data.transactions
        .filter((t) => t.type === "BORROW" && t.memberId === id)
        .map((t) => t.bookId)
    );
    const returnedBookIds = new Set(
      data.transactions
        .filter((t) => t.type === "RETURN" && t.memberId === id)
        .map((t) => t.bookId)
    );
    let active = false;
    for (const bid of borrowedBookIds) {
      if (!returnedBookIds.has(bid)) {
        const book = bookById.get(bid);
        // if book exists and is currently not available, assume active borrow
        if (book && !book.available) {
          active = true;
          break;
        }
      }
    }

    if (active) return showToast("Can’t delete: member has borrowed books.", "warning");

    setData((d) => ({
      ...d,
      members: d.members.filter((m) => m.id !== id),
    }));
    if (selectedMember === id) setSelectedMember("");
    showToast("Member deleted.");
  };

  const deleteBook = (id) => {
    const book = bookById.get(id);
    if (!book) return;
    if (!book.available) return showToast("Can’t delete: book is borrowed.", "warning");

    setData((d) => ({
      ...d,
      books: d.books.filter((b) => b.id !== id),
      transactions: d.transactions.filter((t) => t.bookId !== id),
    }));
    if (selectedBook === id) setSelectedBook("");
    showToast("Book deleted.");
  };

  const resetAll = () => {
    if (!window.confirm("Reset everything? This will clear all data.")) return;
    setData({ members: [], books: [], transactions: [] });
    setSelectedBook("");
    setSelectedMember("");
    setMemberName("");
    setBookTitle("");
    setSearchBooks("");
    setSearchMembers("");
    showToast("Reset done.", "info");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "library_data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        !parsed ||
        !Array.isArray(parsed.members) ||
        !Array.isArray(parsed.books) ||
        !Array.isArray(parsed.transactions)
      ) {
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
      {/* Top bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-semibold">Library Management</span>
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
        {/* Stats */}
        <div className="row g-3 mb-3">
          <StatCard title="Members" value={stats.totalMembers} />
          <StatCard title="Books" value={stats.totalBooks} />
          <StatCard title="Available" value={stats.available} />
          <StatCard title="Borrowed" value={stats.borrowed} />
        </div>

        <div className="row g-3">
          {/* Add member */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Members</h5>
                  <span className="badge text-bg-secondary">
                    {data.members.length}
                  </span>
                </div>

                <div className="input-group mb-2">
                  <input
                    className="form-control"
                    placeholder="Add member name"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMember()}
                  />
                  <button className="btn btn-primary" onClick={addMember}>
                    Add
                  </button>
                </div>

                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="Search members..."
                  value={searchMembers}
                  onChange={(e) => setSearchMembers(e.target.value)}
                />

                <div className="list-group small" style={{ maxHeight: 260, overflow: "auto" }}>
                  {filteredMembers.length === 0 ? (
                    <div className="text-muted px-2 py-3">No members.</div>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={
                          "list-group-item list-group-item-action d-flex justify-content-between align-items-center " +
                          (selectedMember === m.id ? "active" : "")
                        }
                        onClick={() => setSelectedMember(m.id)}
                      >
                        <span className="text-truncate">{m.name}</span>
                        <span className="d-flex gap-2 align-items-center">
                          <span className={"badge " + (selectedMember === m.id ? "text-bg-light" : "text-bg-secondary")}>
                            Select
                          </span>
                          <span
                            role="button"
                            className={"badge " + (selectedMember === m.id ? "text-bg-light" : "text-bg-danger")}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMember(m.id);
                            }}
                            title="Delete member"
                          >
                            ✕
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Add book */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Books</h5>
                  <span className="badge text-bg-secondary">{data.books.length}</span>
                </div>

                <div className="input-group mb-2">
                  <input
                    className="form-control"
                    placeholder="Add book title"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addBook()}
                  />
                  <button className="btn btn-success" onClick={addBook}>
                    Add
                  </button>
                </div>

                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="Search books..."
                  value={searchBooks}
                  onChange={(e) => setSearchBooks(e.target.value)}
                />

                <div className="list-group small" style={{ maxHeight: 260, overflow: "auto" }}>
                  {filteredBooks.length === 0 ? (
                    <div className="text-muted px-2 py-3">No books.</div>
                  ) : (
                    filteredBooks.map((b) => (
                      <div
                        key={b.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div className="me-2 text-truncate">
                          <div className="fw-semibold text-truncate">{b.title}</div>
                          <div className="text-muted">
                            {b.available ? "Available" : "Borrowed"}
                          </div>
                        </div>

                        <div className="d-flex gap-2 align-items-center">
                          {b.available ? (
                            <span className="badge text-bg-success">✔</span>
                          ) : (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => returnBook(b.id)}
                            >
                              Return
                            </button>
                          )}
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => deleteBook(b.id)}
                            title="Delete book"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Borrow panel */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Borrow / Transactions</h5>

                <label className="form-label small text-muted mt-2">Member</label>
                <select
                  className="form-select"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Select member</option>
                  {data.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <label className="form-label small text-muted mt-2">Book (available only)</label>
                <select
                  className="form-select"
                  value={selectedBook}
                  onChange={(e) => setSelectedBook(e.target.value)}
                >
                  <option value="">Select book</option>
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-danger w-100 mt-3"
                  onClick={borrowBook}
                  disabled={!selectedMember || !selectedBook}
                >
                  Borrow
                </button>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-semibold">Recent activity</div>
                  <span className="badge text-bg-secondary">
                    {data.transactions.length}
                  </span>
                </div>

                <div className="mt-2" style={{ maxHeight: 260, overflow: "auto" }}>
                  {data.transactions.length === 0 ? (
                    <div className="text-muted small py-2">No transactions yet.</div>
                  ) : (
                    <ul className="list-group small">
                      {data.transactions.slice(0, 10).map((t) => {
                        const m = memberById.get(t.memberId);
                        const b = bookById.get(t.bookId);
                        const dt = new Date(t.date);
                        const when = Number.isNaN(dt.getTime())
                          ? t.date
                          : dt.toLocaleString();
                        return (
                          <li key={t.id} className="list-group-item">
                            <div className="d-flex justify-content-between">
                              <span className={"badge " + (t.type === "BORROW" ? "text-bg-danger" : "text-bg-primary")}>
                                {t.type}
                              </span>
                              <span className="text-muted">{when}</span>
                            </div>
                            <div className="mt-1">
                              <span className="fw-semibold">{m?.name ?? "Unknown"}</span>{" "}
                              {t.type === "BORROW" ? "borrowed" : "returned"}{" "}
                              <span className="fw-semibold">{b?.title ?? "Unknown"}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
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
          <div className="fs-4 fw-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}
