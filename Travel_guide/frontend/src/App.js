import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [place, setPlace] = useState("");
  const [members, setMembers] = useState("");
  const [budget, setBudget] = useState("");
  const [foodPreference, setFoodPreference] = useState("No");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHotels = async () => {
    if (!place || !members || !budget) {
      setError("Please fill all fields!");
      return;
    }

    setLoading(true);
    setError("");
    setHotels([]);

    try {
      const response = await axios.post("http://localhost:5000/api/travel-guide", {
        place,
        members,
        budget,
        foodIncluded: foodPreference === "Yes",
      });

      setHotels(response.data.hotels);
    } catch (err) {
      setError("Error fetching data. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      {/* Form Section */}
      <div className="form-container">
        <h1>🌍 Travel Guide AI</h1>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />
          <input
            type="number"
            placeholder="Number of Members"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
          />
          <input
            type="number"
            placeholder="Budget (₹)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <select
            value={foodPreference}
            onChange={(e) => setFoodPreference(e.target.value)}
          >
            <option value="No">No Food</option>
            <option value="Yes">Food Required</option>
          </select>
          <button onClick={fetchHotels}>
            {loading ? "Searching..." : "Find Hotels"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      {/* Hotel Listing Section */}
      {hotels.length > 0 && (
        <div className="hotels-container">
          <h3>🏨 Recommended Hotels:</h3>
          <div className="hotels-grid">
            {hotels.map((hotel, index) => (
              <div key={index} className="hotel-card">
                <h4 style={{display:"block", textAlign:"center"}}>{hotel.name}</h4>
                <p>📍 {hotel.location}</p>
                <p>💰 Price:</p>
                <p className="price-item" style={{ marginLeft: "30px" }}>With Food: ₹{hotel.price?.withFood ?? "N/A"}</p>
                <p className="price-item" style={{ marginLeft: "30px" }}>Without Food: ₹{hotel.price?.withoutFood ?? "N/A"}</p>
                <p>
                  📞 Contact:
                  <a href={`tel:${hotel.phone}`} className="phone-link">
                    {hotel.phone}
                  </a>
                </p>
                <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block", textAlign: "center" }}>
                  🌍 View on Google Maps
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
