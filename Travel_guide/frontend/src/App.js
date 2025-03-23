import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [place, setPlace] = useState("");
  const [members, setMembers] = useState("");
  const [budget, setBudget] = useState("");
  const [foodPreference, setFoodPreference] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [weather, setWeather] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHotels = async () => {
    if (!place || !members || !budget) {
      setError("⚠️ Please fill in all fields!");
      return;
    }

    setLoading(true);
    setError("");
    setHotels([]);
    setWeather(null);
    setImageUrl("");

    try {
      const response = await axios.post("http://localhost:5000/api/travel-guide", {
        place,
        members: parseInt(members, 10),
        budget: parseInt(budget, 10),
        foodIncluded: foodPreference,
      });

      setHotels(response.data.hotels);
      setWeather(response.data.weather);
      setImageUrl(response.data.imageUrl || ""); // Ensure correct mapping of image URL
    } catch (err) {
      setError("❌ Error fetching data. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
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
          <label>
            <input
              type="checkbox"
              checked={foodPreference}
              onChange={() => setFoodPreference(!foodPreference)}
            />
            Food Included?
          </label>
          <button onClick={fetchHotels} disabled={loading}>
            {loading ? "🔍 Searching..." : "Find Hotels"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
      </div>

      {imageUrl && (
        <div className="image-container">
          <h3>🏞️ Tourist Destination</h3>
          <img src={imageUrl} alt="Tourist Place" className="tourist-image" />
        </div>
      )}
    
      {weather && (
        <div className="weather-container">
          <h3>☀️ Weather in {place}</h3>
          <p>🌡️ Temperature: {weather.temp}°C</p>
          <p>🌤️ Condition: {weather.description}</p>
          <p>💧 Humidity: {weather.humidity}%</p>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="hotels-container">
          <h3>🏨 Recommended Hotels:</h3>
          <div className="hotels-grid">
            {hotels.map((hotel, index) => (
              <div key={index} className="hotel-card">
                <h4>{hotel.name}</h4>
                <p>📍 {hotel.location}</p>
                <p>💰 Price:</p>
                <p className="price-item" style={{marginLeft:"40px"}}>With Food: ₹{hotel.price?.withFood ?? "N/A"}</p>
                <p className="price-item" style={{marginLeft:"40px"}}>Without Food: ₹{hotel.price?.withoutFood ?? "N/A"}</p>
                <p>📞 Contact: <a href={`tel:${hotel.phone}`}>{hotel.phone}</a></p>
                <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer">🌍 View on Google Maps</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
