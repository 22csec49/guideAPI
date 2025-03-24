import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/form.css";

function FormPage() {
  const [place, setPlace] = useState("");
  const [members, setMembers] = useState("");
  const [budget, setBudget] = useState("");
  const [foodPreference, setFoodPreference] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSearch = () => {
    if (!place || !members || !budget) {
      setError("⚠️ Please fill in all fields!");
      return;
    }
    setError("");

    // Redirect to results page with query parameters
    navigate(`/results?place=${place}&members=${members}&budget=${budget}&foodIncluded=${foodPreference}`);
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
          <button onClick={handleSearch}>Find Hotels</button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default FormPage;
