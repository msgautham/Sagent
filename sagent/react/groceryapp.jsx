// App.js — Grocery Store
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "grocery_app";
const uid = () => crypto.randomUUID();

export default function App() {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem(LS)) || {
      items: [],
      cart: [],
    }
  );

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { id: uid(), name: itemName, price }],
    });
    setItemName("");
    setPrice("");
  };

  return (
    <div className="container py-4">
      <h3>Grocery Store</h3>
      <input
        className="form-control"
        placeholder="Item Name"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <input
        className="form-control mt-2"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button className="btn btn-success mt-2" onClick={addItem}>
        Add Item
      </button>
    </div>
  );
}
