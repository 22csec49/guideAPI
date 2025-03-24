import React from "react";
import "./../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="content">
        <h1>Explore the World with Ease</h1>
        <p>Find your next adventure with our hassle-free booking system.</p>
        <button onClick={() => navigate("/form")} className="explore-btn">Explore Now</button>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>✈️ Easy Booking</h3>
          <p>Find and book flights with ease using our smart search.</p>
        </div>
        <div className="feature-card">
          <h3>🏡 Best Destinations</h3>
          <p>Discover top-rated travel destinations and hidden gems.</p>
        </div>
        <div className="feature-card">
          <h3>🌟 Customer Reviews</h3>
          <p>See what travelers have to say about their experiences.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
