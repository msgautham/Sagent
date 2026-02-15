// App.js — Library Management System
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "library_app";

const uid = () => crypto.randomUUID();

export default function App() {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem(LS)) || {
      members: [],
      books: [],
      transactions: [],
    }
  );

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  const [memberName, setMemberName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedBook, setSelectedBook] = useState("");

  const addMember = () => {
    if (!memberName) return;
    setData({
      ...data,
      members: [...data.members, { id: uid(), name: memberName }],
    });
    setMemberName("");
  };

  const addBook = () => {
    if (!bookTitle) return;
    setData({
      ...data,
      books: [...data.books, { id: uid(), title: bookTitle, available: true }],
    });
    setBookTitle("");
  };

  const borrowBook = () => {
    if (!selectedBook || !selectedMember) return;
    setData({
      ...data,
      books: data.books.map((b) =>
        b.id === selectedBook ? { ...b, available: false } : b
      ),
      transactions: [
        ...data.transactions,
        {
          id: uid(),
          member: selectedMember,
          book: selectedBook,
          date: new Date().toISOString(),
        },
      ],
    });
  };

  return (
    <div className="container py-4">
      <h3>Library Management</h3>

      <div className="row g-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Member Name"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />
          <button className="btn btn-primary mt-2 w-100" onClick={addMember}>
            Add Member
          </button>
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Book Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
          />
          <button className="btn btn-success mt-2 w-100" onClick={addBook}>
            Add Book
          </button>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option>Select Member</option>
            {data.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            className="form-select mt-2"
            onChange={(e) => setSelectedBook(e.target.value)}
          >
            <option>Select Book</option>
            {data.books
              .filter((b) => b.available)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
          </select>

          <button className="btn btn-danger mt-2 w-100" onClick={borrowBook}>
            Borrow
          </button>
        </div>
      </div>
    </div>
  );
}
