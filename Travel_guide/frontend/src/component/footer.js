import React from "react";
import "./../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© 2024 TravelGo. All rights reserved.</p>
      <div className="social-icons">
        <a href="#"><i className="fab fa-facebook"></i></a>
        <a href="#"><i className="fab fa-instagram"></i></a>
        <a href="#"><i className="fab fa-twitter"></i></a>
      </div>
    </footer>
  );
};

export default Footer;
