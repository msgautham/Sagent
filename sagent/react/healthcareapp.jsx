// App.js — Healthcare Management
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LS = "healthcare_app";
const uid = () => crypto.randomUUID();

export default function App() {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem(LS)) || {
      patients: [],
      doctors: [],
      appointments: [],
    }
  );

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(data));
  }, [data]);

  const [patientName, setPatientName] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const addPatient = () => {
    setData({
      ...data,
      patients: [...data.patients, { id: uid(), name: patientName }],
    });
    setPatientName("");
  };

  const addDoctor = () => {
    setData({
      ...data,
      doctors: [...data.doctors, { id: uid(), name: doctorName }],
    });
    setDoctorName("");
  };

  const bookAppointment = () => {
    setData({
      ...data,
      appointments: [
        ...data.appointments,
        {
          id: uid(),
          patient: selectedPatient,
          doctor: selectedDoctor,
          date: new Date().toISOString(),
        },
      ],
    });
  };

  return (
    <div className="container py-4">
      <h3>Healthcare System</h3>
      <input
        className="form-control"
        placeholder="Patient Name"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
      />
      <button className="btn btn-primary mt-2" onClick={addPatient}>
        Add Patient
      </button>

      <input
        className="form-control mt-3"
        placeholder="Doctor Name"
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
      />
      <button className="btn btn-success mt-2" onClick={addDoctor}>
        Add Doctor
      </button>
    </div>
  );
}
