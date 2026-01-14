import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      'reg-username': 'name',
      'reg-email': 'email',
      'reg-pass': 'password'
    };
    setFormData(prev => ({
      ...prev,
      [fieldMap[id]]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authAPI.register(formData.name, formData.email, formData.password);
      
      if (result.error) {
        setMessage({ text: `Error: ${result.error}`, color: 'var(--error-color)' });
      } else {
        // Save tokens and user info
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
        tokenStorage.setUser({ id: result.userId, name: result.name, email: result.email, is_admin: result.isAdmin === 1 });
        
        setMessage({ text: 'Success! Redirecting to dashboard...', color: 'var(--success-color)' });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setMessage({ text: 'Error: Unable to connect to server', color: 'var(--error-color)' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main>
        <section className="auth-container">
          <h2>Create Account</h2>
          <div className="message-box" style={{ color: message.color }}>
            {message.text}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="reg-username">Username</label>
              <input
                type="text"
                id="reg-username"
                placeholder="Choose a username"
                required
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                type="email"
                id="reg-email"
                placeholder="example@mail.com"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="reg-pass">Password</label>
              <div className="password-field-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-pass"
                  placeholder="Enter your password"
                  required
                  value={formData.pass}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ opacity: formData.password.length > 0 ? 1 : 0, pointerEvents: formData.password.length > 0 ? 'auto' : 'none' }}
                >
                  <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-filled w-100" disabled={isLoading}>
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="toggle-text">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          <Link to="/" className="btn-text">← Back to Home</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
