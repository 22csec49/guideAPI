import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./../styles/output.css";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const place = queryParams.get("place");
  const members = queryParams.get("members");
  const budget = queryParams.get("budget");
  const foodIncluded = queryParams.get("foodIncluded") === "true";

  const [hotels, setHotels] = useState([]);
  const [weather, setWeather] = useState(null);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTravelGuide = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/travel-guide", {
          place,
          members: parseInt(members, 10),
          budget: parseInt(budget, 10),
          foodIncluded,
        });

        setHotels(response.data.hotels);
        setWeather(response.data.weather);
        setTouristPlaces(response.data.topTouristPlaces || []);
      } catch (err) {
        setError("❌ Error fetching data. Try again.");
      }
      setLoading(false);
    };

    fetchTravelGuide();
  }, [place, members, budget, foodIncluded]);

  return (
    <div className="container" style={{position:"relative",top:"50px"}}>
      <button className="back-button"  onClick={() => navigate("/")}>⬅️ Back</button>

      {loading ? (
        <h2>🔍 Fetching results...</h2>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {touristPlaces.length > 0 && (
            <div className="image-container">
              <h3>🏞️ Tourist Attractions in {place}</h3>
              <div className="image-grid">
                {touristPlaces.map((place, index) => (
                  <div key={index} className="image-card">
                    <img src={place.image} alt={place.name} className="tourist-image" />
                    <p>{place.name}</p>
                  </div>
                ))}
              </div>
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
                    <p className="price-item" style={{ marginLeft: "40px" }}>
                      With Food: ₹{hotel.price?.withFood ?? "N/A"}
                    </p>
                    <p className="price-item" style={{ marginLeft: "40px" }}>
                      Without Food: ₹{hotel.price?.withoutFood ?? "N/A"}
                    </p>
                    <p>
                      📞 Contact: <a href={`tel:${hotel.phone}`}>{hotel.phone}</a>
                    </p>
                    <a href={hotel.mapLink} target="_blank" rel="noopener noreferrer">
                      🌍 View on Google Maps
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ResultPage;
