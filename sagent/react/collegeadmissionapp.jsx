// App.js — Improved College Admission (Bootstrap)
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "college_app_v2";
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const nowISO = () => new Date().toISOString();

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(LS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      students: [], // {id, name, email, phone}
      applications: [], // {id, studentId, program, status, date, notes}
    };
  });

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  // form state
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [program, setProgram] = useState("B.Tech IT");
  const [status, setStatus] = useState("SUBMITTED");
  const [notes, setNotes] = useState("");

  const [searchStudents, setSearchStudents] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

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
  const isEmail = (s) =>
    !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim().toLowerCase());

  const studentById = useMemo(() => {
    const m = new Map();
    data.students.forEach((s) => m.set(s.id, s));
    return m;
  }, [data.students]);

  const stats = useMemo(() => {
    const students = data.students.length;
    const apps = data.applications.length;
    const accepted = data.applications.filter((a) => a.status === "ACCEPTED").length;
    const rejected = data.applications.filter((a) => a.status === "REJECTED").length;
    return { students, apps, accepted, rejected };
  }, [data]);

  const filteredStudents = useMemo(() => {
    const q = searchStudents.trim().toLowerCase();
    if (!q) return data.students;
    return data.students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q)
    );
  }, [data.students, searchStudents]);

  const filteredApplications = useMemo(() => {
    const list =
      filterStatus === "ALL"
        ? data.applications
        : data.applications.filter((a) => a.status === filterStatus);

    // newest first
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.applications, filterStatus]);

  // actions
  const addStudent = () => {
    const name = normalize(studentName);
    const email = normalize(studentEmail).toLowerCase();
    const phone = normalize(studentPhone);

    if (!name) return showToast("Student name is required.", "danger");
    if (!isEmail(email)) return showToast("Enter a valid email.", "danger");

    const duplicate = data.students.some(
      (s) =>
        s.name.toLowerCase() === name.toLowerCase() ||
        (!!email && (s.email || "").toLowerCase() === email)
    );
    if (duplicate) return showToast("Student already exists.", "warning");

    const id = uid();
    setData((d) => ({
      ...d,
      students: [{ id, name, email, phone }, ...d.students],
    }));

    setStudentName("");
    setStudentEmail("");
    setStudentPhone("");
    showToast("Student added ✅");
  };

  const deleteStudent = (id) => {
    const hasApps = data.applications.some((a) => a.studentId === id);
    if (hasApps) return showToast("Can’t delete: student has applications.", "warning");

    setData((d) => ({ ...d, students: d.students.filter((s) => s.id !== id) }));
    if (selectedStudent === id) setSelectedStudent("");
    showToast("Student deleted.", "info");
  };

  const submitApplication = () => {
    if (!selectedStudent) return showToast("Select a student first.", "danger");
    const prog = normalize(program);
    if (!prog) return showToast("Program is required.", "danger");

    setData((d) => ({
      ...d,
      applications: [
        {
          id: uid(),
          studentId: selectedStudent,
          program: prog,
          status,
          notes: normalize(notes),
          date: nowISO(),
        },
        ...d.applications,
      ],
    }));

    setNotes("");
    showToast("Application submitted ✅");
  };

  const updateStatus = (appId, nextStatus) => {
    setData((d) => ({
      ...d,
      applications: d.applications.map((a) =>
        a.id === appId ? { ...a, status: nextStatus } : a
      ),
    }));
    showToast("Status updated.", "info");
  };

  const deleteApplication = (appId) => {
    setData((d) => ({
      ...d,
      applications: d.applications.filter((a) => a.id !== appId),
    }));
    showToast("Application deleted.", "info");
  };

  const resetAll = () => {
    if (!window.confirm("Reset everything? This will clear all data.")) return;
    setData({ students: [], applications: [] });
    setStudentName("");
    setStudentEmail("");
    setStudentPhone("");
    setSelectedStudent("");
    setProgram("B.Tech IT");
    setStatus("SUBMITTED");
    setNotes("");
    setSearchStudents("");
    setFilterStatus("ALL");
    showToast("Reset done.", "info");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "college_admission_data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        !parsed ||
        !Array.isArray(parsed.students) ||
        !Array.isArray(parsed.applications)
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
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-semibold">College Admission</span>
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
          <StatCard title="Students" value={stats.students} />
          <StatCard title="Applications" value={stats.apps} />
          <StatCard title="Accepted" value={stats.accepted} />
          <StatCard title="Rejected" value={stats.rejected} />
        </div>

        <div className="row g-3">
          {/* Students */}
          <div className="col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Students</h5>
                  <span className="badge text-bg-secondary">{data.students.length}</span>
                </div>

                <div className="row g-2">
                  <div className="col-md-12">
                    <input
                      className="form-control"
                      placeholder="Student name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addStudent()}
                    />
                  </div>
                  <div className="col-md-7">
                    <input
                      className="form-control"
                      placeholder="Email (optional)"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <input
                      className="form-control"
                      placeholder="Phone (optional)"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary w-100" onClick={addStudent}>
                      Add Student
                    </button>
                  </div>
                </div>

                <input
                  className="form-control form-control-sm mt-3"
                  placeholder="Search students..."
                  value={searchStudents}
                  onChange={(e) => setSearchStudents(e.target.value)}
                />

                <div className="mt-3" style={{ maxHeight: 340, overflow: "auto" }}>
                  {filteredStudents.length === 0 ? (
                    <div className="text-muted small py-2">No students.</div>
                  ) : (
                    <div className="list-group">
                      {filteredStudents.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className={
                            "list-group-item list-group-item-action d-flex justify-content-between align-items-center " +
                            (selectedStudent === s.id ? "active" : "")
                          }
                          onClick={() => setSelectedStudent(s.id)}
                        >
                          <div className="me-2 text-truncate">
                            <div className="fw-semibold text-truncate">{s.name}</div>
                            <div className="small text-truncate">
                              <span className={selectedStudent === s.id ? "" : "text-muted"}>
                                {s.email || "—"}{" "}
                                {s.phone ? `• ${s.phone}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="d-flex gap-2 align-items-center">
                            <span className={"badge " + (selectedStudent === s.id ? "text-bg-light" : "text-bg-secondary")}>
                              Select
                            </span>
                            <span
                              role="button"
                              className={"badge " + (selectedStudent === s.id ? "text-bg-light" : "text-bg-danger")}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStudent(s.id);
                              }}
                              title="Delete student"
                            >
                              ✕
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Application */}
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Applications</h5>
                  <div className="d-flex gap-2">
                    <select
                      className="form-select form-select-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="ALL">All</option>
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">Student</label>
                    <select
                      className="form-select"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                      <option value="">Select student</option>
                      {data.students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">Program</label>
                    <select
                      className="form-select"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                    >
                      <option>B.Tech IT</option>
                      <option>B.Tech CSE</option>
                      <option>BCA</option>
                      <option>MCA</option>
                      <option>MBA</option>
                      <option>B.Com</option>
                      <option>B.Sc</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1">Status</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-muted mb-1">Notes (optional)</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Any remarks..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <button
                      className="btn btn-primary w-100"
                      onClick={submitApplication}
                      disabled={!selectedStudent}
                    >
                      Submit Application
                    </button>
                  </div>
                </div>

                <hr />

                <div style={{ maxHeight: 360, overflow: "auto" }}>
                  {filteredApplications.length === 0 ? (
                    <div className="text-muted small py-2">No applications.</div>
                  ) : (
                    <ul className="list-group">
                      {filteredApplications.map((a) => {
                        const s = studentById.get(a.studentId);
                        const dt = new Date(a.date);
                        const when = Number.isNaN(dt.getTime())
                          ? a.date
                          : dt.toLocaleString();

                        const badge =
                          a.status === "ACCEPTED"
                            ? "text-bg-success"
                            : a.status === "REJECTED"
                            ? "text-bg-danger"
                            : a.status === "UNDER_REVIEW"
                            ? "text-bg-warning"
                            : "text-bg-secondary";

                        return (
                          <li key={a.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="me-2">
                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                  <span className={"badge " + badge}>{a.status}</span>
                                  <span className="fw-semibold">{s?.name ?? "Unknown"}</span>
                                  <span className="text-muted">• {a.program}</span>
                                </div>
                                <div className="small text-muted mt-1">{when}</div>
                                {a.notes ? (
                                  <div className="small mt-2">{a.notes}</div>
                                ) : null}
                              </div>

                              <div className="d-flex flex-column gap-2">
                                <select
                                  className="form-select form-select-sm"
                                  value={a.status}
                                  onChange={(e) => updateStatus(a.id, e.target.value)}
                                >
                                  <option value="SUBMITTED">Submitted</option>
                                  <option value="UNDER_REVIEW">Under Review</option>
                                  <option value="ACCEPTED">Accepted</option>
                                  <option value="REJECTED">Rejected</option>
                                </select>

                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => deleteApplication(a.id)}
                                >
                                  Delete
                                </button>
                              </div>
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
          <div className="fs-5 fw-semibold text-truncate">{value}</div>
        </div>
      </div>
    </div>
  );
}
