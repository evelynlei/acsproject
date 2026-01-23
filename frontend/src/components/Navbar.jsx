import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI, tokenStorage } from '../api/auth';
import logo from '../assets/logo.png';
import Swal from 'sweetalert2'; 

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const user = tokenStorage.getUser();
    const accessToken = tokenStorage.getAccessToken();
    
    if (user && accessToken) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      document.body.classList.add('logged-in');
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      document.body.classList.remove('logged-in');
    }
  }, [location]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Ready to leave?',
      text: "You will need to login again to access your dashboard.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)', 
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '16px'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const accessToken = tokenStorage.getAccessToken();
        const refreshToken = tokenStorage.getRefreshToken();
        
        if (accessToken && refreshToken) {
          await authAPI.logout(accessToken, refreshToken);
        }
        
        tokenStorage.clear();
        setIsLoggedIn(false);
        setCurrentUser(null);
        document.body.classList.remove('logged-in');

        await Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been safely logged out.',
          timer: 1500,
          showConfirmButton: false
        });

        navigate('/');
      } catch (err) {
        console.error('Logout error:', err);
        tokenStorage.clear();
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <header>
      <nav className="navbar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="ACS Logo" style={{ height: '50px', width: 'auto' }} />
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
            ACS Consulting
          </Link>
        </div>
        <ul className="nav-links ready">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          {!isLoggedIn && (
            <>
              <li><Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>Register</Link></li>
              <li><Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link></li>
            </>
          )}
          {isLoggedIn && (
            <>
              <li>
                <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                Dashboard
                </Link>
              </li>
              <li className="user-profile-section">
                <div className="user-info-badge">
                  <span className="user-name">
                    {currentUser?.name || 'User'}
                  </span>
                  {currentUser?.is_admin === true && (
                    <span className="admin-tag">
                      Admin
                    </span>
                  )}
                </div>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-outline" style={{ padding: '5px 15px' }} disabled={isLoading}>
                  {isLoading ? 'Logging Out...' : 'Log Out'}
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}