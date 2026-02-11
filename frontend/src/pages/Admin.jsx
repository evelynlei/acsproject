import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenStorage, authAPI } from '../api/auth'; 
import Footer from '../components/Footer';

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('user'); 

  useEffect(() => {
    const user = tokenStorage.getUser();
    if (!user || (!user.is_admin && user.role !== 'admin')) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/users', {
        headers: { 'Authorization': `Bearer ${tokenStorage.getAccessToken()}` }
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => u.role === activeTab);

  const styles = {
    container: { paddingTop: '120px', maxWidth: '1100px', margin: '0 auto', minHeight: '80vh', paddingBottom: '60px' },
    tabBar: { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0' },
    tab: (active) => ({
      padding: '12px 24px', cursor: 'pointer', fontWeight: '600',
      borderBottom: active ? '3px solid #3b82f6' : '3px solid transparent',
      color: active ? '#3b82f6' : '#64748b', transition: 'all 0.2s'
    }),
    userCard: {
      backgroundColor: 'white', padding: '20px', borderRadius: '16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    roleBadge: {
      fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px',
      backgroundColor: activeTab === 'business' ? '#eff6ff' : '#f1f5f9',
      color: activeTab === 'business' ? '#3b82f6' : '#475569'
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc' }}>
      <main style={styles.container}>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div style={{ flex: 1, padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Total Members</p>
            <h2 style={{ fontSize: '30px', margin: '5px 0' }}>{users.length}</h2>
          </div>
        </div>

        <div style={styles.tabBar}>
          <div onClick={() => setActiveTab('user')} style={styles.tab(activeTab === 'user')}>General Users</div>
          <div onClick={() => setActiveTab('business')} style={styles.tab(activeTab === 'business')}>Business Owners</div>
        </div>

        {loading ? (
          <p>Loading user directory...</p>
        ) : (
          <div>
            {filteredUsers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No {activeTab} accounts found.</p>
            ) : (
              filteredUsers.map(u => (
                <div key={u.id} style={styles.userCard}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>{u.name}</h4>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{u.email}</p>
                  </div>
                  <div style={styles.roleBadge}>{u.role.toUpperCase()}</div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}