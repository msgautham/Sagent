// App.js — College Admission
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "college_app";
const uid = () => crypto.randomUUID();

export default function App() {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem(LS)) || {
      students: [],
      applications: [],
    }
  );

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  const [studentName, setStudentName] = useState("");

  const addStudent = () => {
    setData({
      ...data,
      students: [...data.students, { id: uid(), name: studentName }],
    });
    setStudentName("");
  };

  return (
    <div className="container py-4">
      <h3>College Admission</h3>
      <input
        className="form-control"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={addStudent}>
        Add Student
      </button>
    </div>
  );
}
