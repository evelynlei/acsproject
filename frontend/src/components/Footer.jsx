import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6"; 

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-info">
          <div className="logo">ACS Consulting</div>
          <p>Empowering social causes and small businesses since 2025. Your partner in professional consulting.</p>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Email: contact@acsconsulting.com</p>
          <p>Phone: +61 (02) 123-4567</p>
          
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook size={24} />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer">
              <FaXTwitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 ACS Consulting Service. All rights reserved.</p>
      </div>
    </footer>
  );
}