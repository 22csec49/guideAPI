import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./component/header";
import Footer from "./component/footer";
import Dashboard from "./pages/dashboard";
import FormPage from "./pages/form";
import ResultPage from "./pages/output";
import "./App.css"
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/results" element={<ResultPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
