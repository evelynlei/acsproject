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

  const getDashboardLink = () => {
    if (!currentUser) return '/dashboard';
    if (currentUser.is_admin === true || currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'business') return '/business-owner';
    return '/dashboard';
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Ready to leave?',
      text: "You will need to login again to access your dashboard.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6', 
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
          <Link to="/" style={{ textDecoration: 'none', color: '#1e293b', fontWeight: 'bold', fontSize: '1.2rem' }}>
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
                <Link 
                  to={getDashboardLink()} 
                  className={
                    location.pathname === '/admin' || 
                    location.pathname === '/business-owner' || 
                    location.pathname === '/dashboard' ? 'active' : ''
                  }
                >
                  {currentUser?.is_admin || currentUser?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
              </li>

              {currentUser?.role === 'business' && (
                <li>
                  <Link 
                    to="/business-dashboard" 
                    className={location.pathname === '/business-dashboard' ? 'active' : ''}
                  >
                    Campaigns
                  </Link>
                </li>
              )}

              <li className="user-profile-section">
                <div className="user-info-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: '#f1f5f9', borderRadius: '20px' }}>
                  <span className="user-name" style={{ fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                    {currentUser?.name || 'User'}
                    {currentUser?.role === 'business' && (
                      <span style={{ fontSize: '10px', marginLeft: '5px', color: '#3b82f6', fontWeight: 'bold' }}>
                        (Business)
                      </span>
                    )}
                  </span>
                  {(currentUser?.is_admin === true || currentUser?.role === 'admin') && (
                    <span className="admin-tag" style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      Admin
                    </span>
                  )}
                </div>
              </li>

              <li>
                <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 18px', borderRadius: '10px', fontSize: '14px' }} disabled={isLoading}>
                  {isLoading ? 'Wait...' : 'Log Out'}
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}