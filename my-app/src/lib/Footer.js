import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <hr className="footer-line" />

      <div className="footer-div">
        <p className="footer-made-by-bruin-ai">Made by students of UCLA Bruin AI</p>
        <div className="footer-links">
          <Link to="/about" className="footer-about">About</Link>
          <Link to="/privacy" className="footer-page">Privacy</Link>
          <a href="https://www.bruinai.org/" className="footer-bruin-ai-link" target="_blank" rel="noopener noreferrer">Bruin AI</a>
        </div>
      </div>
    </footer>
  );
}
