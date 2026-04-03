import React, { useEffect, useState } from "react";
import axios from "axios";
import { parseISO, isWithinInterval } from "date-fns";

const AllShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    pincode: "",
  });
  const [sortField, setSortField] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [groupBy, setGroupBy] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/shipments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log('Shipments response:', res.data);
        setShipments(Array.isArray(res.data) ? res.data : res.data.shipments || []);
      })
      .catch((err) => {
        console.error('Shipments fetch error:', err);
        console.error('Error response:', err.response?.data);
      });
  }, []);

  const filtered = shipments.filter(s => {
    const date = parseISO(s.created_at);
    if (filters.from && filters.to) {
      const fromD = parseISO(filters.from);
      const toD = parseISO(filters.to);
      if (!isWithinInterval(date, { start: fromD, end: toD })) return false;
    } else if (filters.from && date < parseISO(filters.from)) return false;
    else if (filters.to && date > parseISO(filters.to)) return false;

    if (filters.pincode && ![s.pickup_pincode, s.delivery_pincode]
      .some(pin => pin.includes(filters.pincode))) return false;

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === "string") {
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const requestSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const groupShipments = (list) => {
    const map = {};

    list.forEach((s) => {
      let key = "";
      if (groupBy === "date") {
        key = s.created_at.slice(0, 10);
      } else if (groupBy === "month") {
        key = s.created_at.slice(0, 7); // "YYYY-MM"
      } else if (groupBy === "pickup_pincode") {
        key = s.pickup_pincode;
      } else if (groupBy === "delivery_pincode") {
        key = s.delivery_pincode;
      } else {
        key = "All Shipments";
      }

      if (!map[key]) map[key] = [];
      map[key].push(s);
    });

    return map;
  };

  const grouped = groupShipments(sorted);


  return (
    <div>
      <h2>📋 All Shipments</h2>

      <div style={{ marginBottom: 20 }}>
        <label>From: <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></label>
        <label>To: <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></label>
        <label>Pincode: <input placeholder="Any PIN" value={filters.pincode} onChange={e => setFilters({ ...filters, pincode: e.target.value.trim() })} /></label>
      </div>
      <div>
        <label>Group by: </label>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="">None</option>
          <option value="date">Date</option>
          <option value="month">Month</option>
          <option value="pickup_pincode">Pickup PIN</option>
          <option value="delivery_pincode">Delivery PIN</option>
        </select>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            {["local_awb", "courier_owner", "pickup_pincode", "delivery_pincode", "weight", "price", "status", "created_at"].map(key => (
              <th key={key} onClick={() => requestSort(key)} style={{ cursor: "pointer" }}>
                {key.replace(/_/g, " ").toUpperCase()}
                {sortField === key ? (sortDir === "asc" ? " 🔼" : " 🔽") : ""}
              </th>
            ))}
            <th>Sender</th>
            <th>Receiver</th>
            <th>INVOICE</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(grouped).map(([group, items]) => (
            <React.Fragment key={group}>
              <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                <td colSpan="8">
                  {group} — {items.length} shipments — ₹
                  {items.reduce((sum, s) => sum + parseFloat(s.price || 0), 0).toFixed(2)}
                </td>
              </tr>

              {items.map((s) => (
                <tr key={s.local_awb}>
                  <td>{s.local_awb}</td>
                  <td>{s.courier_owner}</td>
                  <td>{s.pickup_pincode}</td>
                  <td>{s.delivery_pincode}</td>
                  <td>{s.weight}</td>
                  <td>₹{s.price}</td>
                  <td>{s.status}</td>
                  <td>{s.created_at.slice(0, 10)}</td>
                  <td>
                    <div>{s.sender_name}</div>
                    <div className="text-sm text-gray-500">{s.sender_phone}</div>
                  </td>
                  <td>
                    <div>{s.receiver_name}</div>
                    <div className="text-sm text-gray-500">{s.receiver_phone}</div>
                  </td>
                  <td>
                    <a href={`/invoice/${s.local_awb}`} target="_blank" rel="noopener noreferrer">
                      <button className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                        View Invoice
                      </button>
                    </a>
                  </td>

                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default AllShipments;
