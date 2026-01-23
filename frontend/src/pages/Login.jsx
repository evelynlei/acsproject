import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'login-id' ? 'email' : 'password']: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authAPI.login(formData.email, formData.password);
      
      if (result.error) {
        setMessage({ text: result.error, color: 'var(--error-color)' });
      } else {
        // Save tokens and user info
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
        tokenStorage.setUser({ id: result.userId, name: result.name, email: result.email, is_admin: result.isAdmin === 1 });
        
        setMessage({ text: 'Success! Redirecting...', color: 'var(--success-color)' });
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      setMessage({ text: 'Error: Unable to connect to server', color: 'var(--error-color)' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = prompt('Please enter your registered email address:');
    if (email) {
      alert('If this email is in our system, a password reset link will be sent to ' + email);
    }
  };

  return (
    <>
      <main>
        <section className="auth-container">
          <h2>Login to ACS</h2>
          <div className="message-box" style={{ color: message.color }}>
            {message.text}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-id">Email</label>
              <input
                type="text"
                id="login-id"
                placeholder="Enter email"
                required
                value={formData.id}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <div className="label-wrapper">
                <label htmlFor="login-pass">Password</label>
                <a href="#" className="forgot-link" onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}>
                  Forgot Password?
                </a>
              </div>
              <div className="password-field-container" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-pass"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--primary-color)',
                    opacity: formData.password.length > 0 ? 1 : 0,
                    pointerEvents: formData.password.length > 0 ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-filled w-100" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          <p className="toggle-text">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
          <Link to="/" className="btn-text">← Back to Home</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
