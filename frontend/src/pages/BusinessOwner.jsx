import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

const BusinessOwner = () => {
  const navigate = useNavigate();
  const user = tokenStorage.getUser();
  const [stats, setStats] = useState({ total: 0, active: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await campaignAPI.getUserCampaigns();
        setStats({
          total: data.length,
          active: data.length 
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' },
    section: { flex: '1', padding: '120px 20px 80px 20px', display: 'flex', justifyContent: 'center' },
    container: { maxWidth: '1000px', width: '100%' },
    welcomeCard: { 
      backgroundColor: 'white', padding: '40px', borderRadius: '24px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '30px',
      background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
      border: '1px solid #e2e8f0'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
    actionCard: {
      backgroundColor: 'white', padding: '30px', borderRadius: '20px',
      textAlign: 'center', border: '1px solid #e2e8f0', transition: 'transform 0.2s',
      cursor: 'pointer', textDecoration: 'none', color: 'inherit'
    }
  };

  return (
    <div style={styles.wrapper}>
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.welcomeCard}>
            <h1 style={{ fontSize: '32px', color: '#1e293b', marginBottom: '10px' }}>
              Hello, {user?.name || 'Partner'}! 👋
            </h1>
            <p style={{ color: '#64748b', fontSize: '18px' }}>
              Welcome to your business portal. Here you can track your impact and manage your funding goals.
            </p>
          </div>

          <div style={styles.grid}>
            <Link to="/business-dashboard" style={styles.actionCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>📊</div>
              <h3 style={{ color: '#1e293b' }}>Manage Campaigns</h3>
              <p style={{ color: '#64748b' }}>You have {stats.total} active projects</p>
            </Link>

            <Link to="/create-campaign" style={styles.actionCard} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🚀</div>
              <h3 style={{ color: '#1e293b' }}>Start New Project</h3>
              <p style={{ color: '#64748b' }}>Reach out to new supporters</p>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BusinessOwner;