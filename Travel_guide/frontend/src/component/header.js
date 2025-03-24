import React from "react";
import "./../styles/Header.css";

const Header = () => {
  const handleSelection = (event) => {
    const urlMap = {
      flight: "https://www.airindia.com/en-in/book-flights/",
      train: "https://www.irctc.co.in/",
      bus: "https://www.tnstc.in/home.html",
      hotel: "https://www.makemytrip.com/hotels/",
      car: "https://www.zoomcar.com/",
    };

    const selectedOption = event.target.value;
    if (selectedOption && urlMap[selectedOption]) {
      window.location.href = urlMap[selectedOption]; // Redirects to the selected booking site
    }
  };

  return (
    <header className="header">
      <div className="logo">🌍 TravelGo</div>
      <nav className="navigation">
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Destinations</a></li>
          <li><a href="#">Contact</a></li>
          <li>
            <a>
            <select id="booking" name="booking" onChange={handleSelection}>
              <option value="">Travel partners</option>
              <option value="flight">AIR INDIA</option>
              <option value="train">IRCTC</option>
              <option value="bus">TNSTC</option>
              <option value="hotel">MAKE MY TRIP</option>
              <option value="car">ZOOM CARS</option>
            </select>
            </a>
          </li>
        </ul>
      </nav>
      <button className="login-btn">Sign Up</button>
    </header>
  );
};

export default Header;
