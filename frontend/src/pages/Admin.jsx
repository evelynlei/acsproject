import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

export default function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const user = tokenStorage.getUser();
    const accessToken = tokenStorage.getAccessToken();
    
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    // Note: In a real app, you'd fetch user count from the backend
    // For now, just show 1 (the current user)
    setUserCount(1);
  }, [navigate]);

  return (
    <>
      <main style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', padding: '40px 8%' }}>
        <div className="welcome-section ready">
          <h1 id="welcome-msg">Admin Dashboard</h1>
          <p>Welcome to the secure management interface.</p>
        </div>

        <div style={{ marginTop: '40px' }}>
          <div className="admin-stat-card">
            <h3>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '10px' }}>
              {userCount}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
