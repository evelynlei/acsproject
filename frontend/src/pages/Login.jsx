import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', color: '' });
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
        tokenStorage.setTokens(result.accessToken, result.refreshToken);

        const role = result.role || result.userRole || 'user'; 
        const isAdmin = result.isAdmin === 1 || result.is_admin === true;

        tokenStorage.setUser({ 
          id: result.userId, 
          name: result.name, 
          email: result.email, 
          role: role.toLowerCase(),             
          is_admin: isAdmin
        });

        setMessage({ text: 'Success! Redirecting...', color: 'var(--success-color)' });

        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin');
          } else if (role.toLowerCase() === 'business') {
            console.log("Redirecting to business dashboard...");
            navigate('/business-dashboard'); 
          } else {
            console.log("Redirecting to standard dashboard...");
            navigate('/dashboard');           
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setMessage({ text: 'Error: Unable to connect to server', color: 'var(--error-color)' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const email = prompt('Please enter your registered email address:');
    if (email) alert('If this email is in our system, a reset link will be sent to ' + email);
  };

  return (
    <>
      <main className="page-transition">
        <section className="auth-container">
          <h2>Login to Your Account</h2>
          <div className="message-box" style={{ color: message.color, minHeight: '20px', marginBottom: '10px' }}>
            {message.text}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-id">Email Address</label>
              <input type="text" id="login-id" placeholder="example@email.com" required value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <div className="label-wrapper" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label htmlFor="login-pass">Password</label>
                <button type="button" className="btn-text" onClick={handleForgotPassword} style={{ fontSize: '0.8rem', padding: 0 }}>Forgot Password?</button>
              </div>
              <div className="password-field-container" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-pass"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{ paddingRight: '45px' }}
                />
                {formData.password.length > 0 && (
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ opacity: 1, pointerEvents: 'auto' }}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                )}
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