// App.js — Improved Healthcare Management (Bootstrap)
import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "healthcare_app_v2";
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
    return { patients: [], doctors: [], appointments: [] };
  });

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  // form state
  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const [apptDate, setApptDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  });

  const [searchPatient, setSearchPatient] = useState("");
  const [searchDoctor, setSearchDoctor] = useState("");
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

  const patientById = useMemo(() => {
    const m = new Map();
    data.patients.forEach((p) => m.set(p.id, p));
    return m;
  }, [data.patients]);

  const doctorById = useMemo(() => {
    const m = new Map();
    data.doctors.forEach((d) => m.set(d.id, d));
    return m;
  }, [data.doctors]);

  const stats = useMemo(() => {
    const patients = data.patients.length;
    const doctors = data.doctors.length;
    const appts = data.appointments.length;

    const now = Date.now();
    const upcoming = data.appointments.filter((a) => {
      const t = new Date(a.date).getTime();
      return !Number.isNaN(t) && t >= now;
    }).length;

    return { patients, doctors, appts, upcoming };
  }, [data]);

  const filteredPatients = useMemo(() => {
    const q = searchPatient.trim().toLowerCase();
    if (!q) return data.patients;
    return data.patients.filter((p) => p.name.toLowerCase().includes(q));
  }, [data.patients, searchPatient]);

  const filteredDoctors = useMemo(() => {
    const q = searchDoctor.trim().toLowerCase();
    if (!q) return data.doctors;
    return data.doctors.filter((d) => d.name.toLowerCase().includes(q));
  }, [data.doctors, searchDoctor]);

  // actions
  const addPatient = () => {
    const name = normalize(patientName);
    if (!name) return showToast("Patient name is required.", "danger");
    const exists = data.patients.some(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return showToast("Patient already exists.", "warning");

    const id = uid();
    setData((d) => ({ ...d, patients: [{ id, name }, ...d.patients] }));
    setPatientName("");
    showToast("Patient added ✅");
  };

  const addDoctor = () => {
    const name = normalize(doctorName);
    if (!name) return showToast("Doctor name is required.", "danger");
    const exists = data.doctors.some(
      (x) => x.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) return showToast("Doctor already exists.", "warning");

    const id = uid();
    setData((d) => ({ ...d, doctors: [{ id, name }, ...d.doctors] }));
    setDoctorName("");
    showToast("Doctor added ✅");
  };

  const deletePatient = (id) => {
    const hasAppointments = data.appointments.some((a) => a.patientId === id);
    if (hasAppointments)
      return showToast("Can’t delete: patient has appointments.", "warning");

    setData((d) => ({ ...d, patients: d.patients.filter((p) => p.id !== id) }));
    if (selectedPatient === id) setSelectedPatient("");
    showToast("Patient deleted.", "info");
  };

  const deleteDoctor = (id) => {
    const hasAppointments = data.appointments.some((a) => a.doctorId === id);
    if (hasAppointments)
      return showToast("Can’t delete: doctor has appointments.", "warning");

    setData((d) => ({ ...d, doctors: d.doctors.filter((x) => x.id !== id) }));
    if (selectedDoctor === id) setSelectedDoctor("");
    showToast("Doctor deleted.", "info");
  };

  const bookAppointment = () => {
    if (!selectedPatient || !selectedDoctor)
      return showToast("Pick patient + doctor.", "danger");

    const dt = new Date(apptDate);
    if (Number.isNaN(dt.getTime())) return showToast("Invalid date/time.", "danger");

    // simple conflict rule: same doctor within same 30 mins
    const conflict = data.appointments.some((a) => {
      if (a.doctorId !== selectedDoctor) return false;
      const t = new Date(a.date).getTime();
      if (Number.isNaN(t)) return false;
      return Math.abs(t - dt.getTime()) < 30 * 60 * 1000;
    });
    if (conflict) return showToast("Doctor has a nearby appointment (±30 min).", "warning");

    setData((d) => ({
      ...d,
      appointments: [
        {
          id: uid(),
          patientId: selectedPatient,
          doctorId: selectedDoctor,
          date: dt.toISOString(),
          status: "BOOKED",
        },
        ...d.appointments,
      ],
    }));
    showToast("Appointment booked ✅");
  };

  const cancelAppointment = (id) => {
    setData((d) => ({
      ...d,
      appointments: d.appointments.map((a) =>
        a.id === id ? { ...a, status: "CANCELLED" } : a
      ),
    }));
    showToast("Appointment cancelled.", "info");
  };

  const resetAll = () => {
    if (!window.confirm("Reset everything? This will clear all data.")) return;
    setData({ patients: [], doctors: [], appointments: [] });
    setPatientName("");
    setDoctorName("");
    setSelectedPatient("");
    setSelectedDoctor("");
    setSearchPatient("");
    setSearchDoctor("");
    showToast("Reset done.", "info");
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "healthcare_data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (
        !parsed ||
        !Array.isArray(parsed.patients) ||
        !Array.isArray(parsed.doctors) ||
        !Array.isArray(parsed.appointments)
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
          <span className="navbar-brand fw-semibold">Healthcare Management</span>
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
          <StatCard title="Patients" value={stats.patients} />
          <StatCard title="Doctors" value={stats.doctors} />
          <StatCard title="Appointments" value={stats.appts} />
          <StatCard title="Upcoming" value={stats.upcoming} />
        </div>

        <div className="row g-3">
          {/* Patients */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Patients</h5>
                  <span className="badge text-bg-secondary">{data.patients.length}</span>
                </div>

                <div className="input-group mb-2">
                  <input
                    className="form-control"
                    placeholder="Add patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPatient()}
                  />
                  <button className="btn btn-primary" onClick={addPatient}>
                    Add
                  </button>
                </div>

                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="Search patients..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                />

                <div className="list-group small" style={{ maxHeight: 260, overflow: "auto" }}>
                  {filteredPatients.length === 0 ? (
                    <div className="text-muted px-2 py-3">No patients.</div>
                  ) : (
                    filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={
                          "list-group-item list-group-item-action d-flex justify-content-between align-items-center " +
                          (selectedPatient === p.id ? "active" : "")
                        }
                        onClick={() => setSelectedPatient(p.id)}
                      >
                        <span className="text-truncate">{p.name}</span>
                        <span className="d-flex gap-2 align-items-center">
                          <span className={"badge " + (selectedPatient === p.id ? "text-bg-light" : "text-bg-secondary")}>
                            Select
                          </span>
                          <span
                            role="button"
                            className={"badge " + (selectedPatient === p.id ? "text-bg-light" : "text-bg-danger")}
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePatient(p.id);
                            }}
                            title="Delete patient"
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

          {/* Doctors */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Doctors</h5>
                  <span className="badge text-bg-secondary">{data.doctors.length}</span>
                </div>

                <div className="input-group mb-2">
                  <input
                    className="form-control"
                    placeholder="Add doctor name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addDoctor()}
                  />
                  <button className="btn btn-success" onClick={addDoctor}>
                    Add
                  </button>
                </div>

                <input
                  className="form-control form-control-sm mb-2"
                  placeholder="Search doctors..."
                  value={searchDoctor}
                  onChange={(e) => setSearchDoctor(e.target.value)}
                />

                <div className="list-group small" style={{ maxHeight: 260, overflow: "auto" }}>
                  {filteredDoctors.length === 0 ? (
                    <div className="text-muted px-2 py-3">No doctors.</div>
                  ) : (
                    filteredDoctors.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={
                          "list-group-item list-group-item-action d-flex justify-content-between align-items-center " +
                          (selectedDoctor === d.id ? "active" : "")
                        }
                        onClick={() => setSelectedDoctor(d.id)}
                      >
                        <span className="text-truncate">{d.name}</span>
                        <span className="d-flex gap-2 align-items-center">
                          <span className={"badge " + (selectedDoctor === d.id ? "text-bg-light" : "text-bg-secondary")}>
                            Select
                          </span>
                          <span
                            role="button"
                            className={"badge " + (selectedDoctor === d.id ? "text-bg-light" : "text-bg-danger")}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDoctor(d.id);
                            }}
                            title="Delete doctor"
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

          {/* Appointments */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Book Appointment</h5>

                <label className="form-label small text-muted mt-2">Patient</label>
                <select
                  className="form-select"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">Select patient</option>
                  {data.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <label className="form-label small text-muted mt-2">Doctor</label>
                <select
                  className="form-select"
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                >
                  <option value="">Select doctor</option>
                  {data.doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <label className="form-label small text-muted mt-2">Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                />

                <button
                  className="btn btn-danger w-100 mt-3"
                  onClick={bookAppointment}
                  disabled={!selectedPatient || !selectedDoctor}
                >
                  Book
                </button>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-semibold">Recent appointments</div>
                  <span className="badge text-bg-secondary">{data.appointments.length}</span>
                </div>

                <div className="mt-2" style={{ maxHeight: 260, overflow: "auto" }}>
                  {data.appointments.length === 0 ? (
                    <div className="text-muted small py-2">No appointments yet.</div>
                  ) : (
                    <ul className="list-group small">
                      {data.appointments.slice(0, 10).map((a) => {
                        const p = patientById.get(a.patientId);
                        const d = doctorById.get(a.doctorId);
                        const dt = new Date(a.date);
                        const when = Number.isNaN(dt.getTime())
                          ? a.date
                          : dt.toLocaleString();

                        return (
                          <li key={a.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <span
                                className={
                                  "badge " +
                                  (a.status === "CANCELLED"
                                    ? "text-bg-secondary"
                                    : "text-bg-danger")
                                }
                              >
                                {a.status}
                              </span>
                              <span className="text-muted">{when}</span>
                            </div>

                            <div className="mt-1">
                              <span className="fw-semibold">{p?.name ?? "Unknown"}</span>{" "}
                              with <span className="fw-semibold">{d?.name ?? "Unknown"}</span>
                            </div>

                            {a.status !== "CANCELLED" && (
                              <button
                                className="btn btn-outline-secondary btn-sm mt-2"
                                onClick={() => cancelAppointment(a.id)}
                              >
                                Cancel
                              </button>
                            )}
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
