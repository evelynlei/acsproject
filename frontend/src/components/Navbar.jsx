import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI, tokenStorage } from '../api/auth';
import logo from '../assets/logo.png';
import Swal from 'sweetalert2'; // 1. 引入 SweetAlert2

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

  // 2. 优化后的登出逻辑
  const handleLogout = async () => {
    // 使用 SweetAlert2 展示美观的确认框
    const result = await Swal.fire({
      title: 'Ready to leave?',
      text: "You will need to login again to access your dashboard.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary-color)', // 使用你 CSS 中的变量色
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      borderRadius: '16px'
    });

    // 如果用户点击了确认
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

        // 登出成功后的提示
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
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>{currentUser?.name || 'User'}</span>
                {currentUser?.is_admin === true && (
                  <span style={{ background: '#111827', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px' }}>
                    Admin
                  </span>
                )}
              </li>
              <li><Link to="/dashboard">Dashboard</Link></li>
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