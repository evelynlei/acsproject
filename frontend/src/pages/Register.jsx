import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'user' 
  });
  const [message, setMessage] = useState({ text: '', color: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, name, value } = e.target;
    
    if (name === 'role') {
      setFormData(prev => ({ ...prev, role: value }));
    } else {
      const fieldMap = {
        'reg-username': 'name',
        'reg-email': 'email',
        'reg-pass': 'password'
      };
      setFormData(prev => ({ ...prev, [fieldMap[id]]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await authAPI.register(
        formData.name, 
        formData.email, 
        formData.password, 
        formData.role 
      );

      if (result.error) {
        setMessage({ text: `Error: ${result.error}`, color: 'var(--error-color)' });
      } else {
        tokenStorage.setTokens(result.accessToken, result.refreshToken);
  
        const finalRole = result.role || formData.role; 

        tokenStorage.setUser({ 
          id: result.userId, 
          name: result.name, 
          email: result.email, 
          role: finalRole, 
          is_admin: result.isAdmin === 1 
        });

        setMessage({ text: 'Success! Creating your profile...', color: 'var(--success-color)' });
        
        setTimeout(() => {
          if (finalRole === 'business') {
            navigate('/business-dashboard', { state: { isNewUser: true } }); 
          } else {
            navigate('/dashboard', { state: { isNewUser: true } });           
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setMessage({ text: 'Error: Unable to connect to server', color: 'var(--error-color)' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="page-transition">
        <section className="auth-container">
          <h2>Create an Account</h2>
          <div className="message-box" style={{ color: message.color, minHeight: '20px', marginBottom: '10px', textAlign: 'center', fontWeight: '500' }}>
            {message.text}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#475569' }}>
                I want to join as:
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* User Role */}
                <label 
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    cursor: 'pointer',
                    border: formData.role === 'user' ? '2px solid #3b82f6' : '2px solid #e2e8f0', 
                    borderRadius: '12px',
                    backgroundColor: formData.role === 'user' ? '#eff6ff' : '#ffffff', 
                    transition: 'all 0.2s ease',
                    boxShadow: formData.role === 'user' ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="user" 
                    checked={formData.role === 'user'} 
                    onChange={handleInputChange}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} 
                  />
                  <div style={{ 
                    fontSize: '24px', 
                    marginBottom: '8px', 
                    color: formData.role === 'user' ? '#3b82f6' : '#94a3b8' 
                  }}>
                    <i className="fas fa-heart"></i> 
                  </div>
                  <span style={{ 
                    fontWeight: '600', 
                    color: formData.role === 'user' ? '#1e293b' : '#64748b' 
                  }}>
                    User
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Social Cause
                  </span>
                </label>

                {/* Business Owner Role */}
                <label 
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    border: formData.role === 'business' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '12px',
                    backgroundColor: formData.role === 'business' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.role === 'business' ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                >
                  <input 
                    type="radio" 
                    name="role" 
                    value="business" 
                    checked={formData.role === 'business'} 
                    onChange={handleInputChange}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  <div style={{ 
                    fontSize: '24px', 
                    marginBottom: '8px', 
                    color: formData.role === 'business' ? '#3b82f6' : '#94a3b8' 
                  }}>
                    <i className="fas fa-store"></i> 
                  </div>
                  <span style={{ 
                    fontWeight: '600', 
                    color: formData.role === 'business' ? '#1e293b' : '#64748b' 
                  }}>
                    Business Owner
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Corporate
                  </span>
                </label>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="reg-username">Username</label>
              <input type="text" id="reg-username" placeholder="Enter your username" required value={formData.name} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label htmlFor="reg-email">Email Address</label>
              <input type="email" id="reg-email" placeholder="example@email.com" required value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="input-group">
              <label htmlFor="reg-pass">Password</label>
              <div className="password-field-container" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-pass"
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
                    style={{ 
                      position: 'absolute', 
                      right: '10px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      zIndex: 2
                    }} 
                  >
                    <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="btn-filled w-100" disabled={isLoading} style={{ marginTop: '10px' }}>
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <p className="toggle-text">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/" className="btn-text" style={{ textDecoration: 'none', color: '#64748b' }}>
              ← Back to Home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}