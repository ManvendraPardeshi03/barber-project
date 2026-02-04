// src/pages/ManageServices.jsx
import React, { useEffect, useState, useRef } from "react";
import API from "../utils/api";
import "./manageServices.css";
import { getImageUrl } from "../utils/imageUrl";
export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [view, setView] = useState("active"); // active | inactive
  const [newService, setNewService] = useState({
    name: "",
    duration: "",
    price: "",
    image: "",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  /* ================= FETCH ================= */
  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data || []);
    } catch {
      setErrorMsg("Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    setErrorMsg("");

    try {
      if (editingId) {
        await API.put(`/services/${editingId}`, newService);

        // update local state
        setServices((prev) =>
          prev.map((s) => (s._id === editingId ? { ...s, ...newService } : s))
        );

        setStatusMsg("Service updated successfully ✔");
      } else {
        const res = await API.post("/services", newService);

        // add new service to local state
        setServices((prev) => [...prev, res.data]);

        setStatusMsg("Service added successfully ✔");
      }

      setNewService({
        name: "",
        duration: "",
        price: "",
        image: "",
        active: true,
      });
      setEditingId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setErrorMsg("Failed to save service");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (service) => {
    setNewService({
      name: service.name,
      duration: service.duration,
      price: service.price,
      image: service.image || "",
      active: service.active !== false,
    });
    setEditingId(service._id);
    setStatusMsg("");
    setErrorMsg("");
  };

  /* ================= TOGGLE ACTIVE ================= */
const toggleActive = async (service) => {
  try {
    // Optimistic UI: update state immediately
    setServices((prevServices) =>
      prevServices.map((s) =>
        s._id === service._id ? { ...s, active: !s.active } : s
      )
    );

    setStatusMsg(!service.active ? "Service activated ✔" : "Service deactivated ✔");

    // Send update to backend
    await API.put(`/services/${service._id}`, {
      ...service,
      active: !service.active,  // include active field
    });

  } catch (err) {
    setErrorMsg("Failed to update service");

    // Revert UI if API fails
    setServices((prevServices) =>
      prevServices.map((s) =>
        s._id === service._id ? { ...s, active: service.active } : s
      )
    );
  }
};


  /* ================= IMAGE UPLOAD ================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await API.post("/services/upload", formData);

      setNewService((prev) => ({
        ...prev,
        image: res.data.url,
      }));

      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatusMsg("Image uploaded successfully ✔");
    } catch {
      setErrorMsg("Image upload failed");
    }
  };

  /* ================= FILTER & SORT ================= */
  let filteredServices = services
  .filter((s) => (view === "active" ? s.active === true : s.active === false))
  .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));


  filteredServices.sort((a, b) => {
    if (sortBy === "price") return b.price - a.price;
    if (sortBy === "duration") return b.duration - a.duration;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="page-container">
      <h2>Manage Services</h2>

      {/* STATUS */}
      {statusMsg && <div className="alert success">{statusMsg}</div>}
      {errorMsg && <div className="alert error">{errorMsg}</div>}

      {/* VIEW TABS */}
      <div className="tabs">
        <button
          className={view === "active" ? "active" : ""}
          onClick={() => setView("active")}
        >
          Active Services
        </button>
        <button
          className={view === "inactive" ? "active" : ""}
          onClick={() => setView("inactive")}
        >
          Deactivated Services
        </button>
      </div>

      {/* SEARCH & SORT */}
      <div className="service-controls">
        <input
          type="text"
          placeholder="Search service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>

      {/* FORM */}
      <form className="service-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Service Name"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={newService.duration}
          onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={newService.price}
          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
          required
        />

        <div className="image-upload">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} />
          {newService.image && (
            <img
              src={newService.image ? getImageUrl(newService.image) : ""}
              alt="preview"
              className="preview-img"
            />
          )}
        </div>

        <button type="submit">{editingId ? "Update Service" : "Add Service"}</button>
      </form>

      {/* SERVICES */}
      <div className="grid-container">
        {filteredServices.map((s) => (
          <div key={s._id} className={`card1 ${s.active === false ? "inactive" : ""}`}>
            <img
              src={s.image ? getImageUrl(s.image) : "/placeholder.jpg"}
              alt={s.name}
            />
            <h3>{s.name}</h3>
            <p>Duration: {s.duration} mins</p>
            <p>Price: ₹{s.price}</p>

            <div className="card-actions">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={s.active !== false}
                  onChange={() => toggleActive(s)}
                />
                <span className="slider"></span>
              </label>

              <button onClick={() => handleEdit(s)}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
