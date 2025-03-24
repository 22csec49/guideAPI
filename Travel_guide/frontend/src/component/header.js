import React from "react";
import "./../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">🌍 TravelGo</div>
      <nav className="navigation">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Destinations</a></li>
          <li><a href="#">Bookings</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
      <button className="login-btn">Sign In</button>
    </header>
  );
};

export default Header;
