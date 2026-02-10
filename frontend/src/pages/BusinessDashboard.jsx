import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { campaignAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = tokenStorage.getUser();

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignAPI.getUserCampaigns();
      console.log('Fetched Campaigns:', data);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignAPI.deleteCampaign(null, id);
        setCampaigns(campaigns.filter(c => c.id !== id));
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const styles = {
    container: { padding: '120px 20px 60px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
    statCard: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    listGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    campaignCard: { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
    content: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' },
    badge: { alignSelf: 'flex-start', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', backgroundColor: '#eff6ff', color: '#3b82f6' },
    progressBar: { height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' },
    progressFill: (percent) => ({ width: `${Math.min(percent, 100)}%`, height: '100%', backgroundColor: '#3b82f6' }),
    actionBtn: { padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#1e293b' }}>Campaign Management</h1>
            <p style={{ color: '#64748b' }}>Edit, update, or remove your active fundraising projects.</p>
          </div>
          <Link to="/create-campaign" style={{ ...styles.actionBtn, backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none' }}>
            + Create New Campaign
          </Link>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Total Projects</p>
            <h3 style={{ fontSize: '28px', color: '#1e293b' }}>{campaigns.length}</h3>
          </div>
          <div style={styles.statCard}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Target Goal</p>
            <h3 style={{ fontSize: '28px', color: '#1e293b' }}>
              ${campaigns.reduce((acc, curr) => acc + (Number(curr.goal_amount || curr.goalAmount) || 0), 0).toLocaleString()}
            </h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : campaigns.length > 0 ? (
          <div style={styles.listGrid}>
            {campaigns.map((item) => (
              <div key={item.id} style={styles.campaignCard}>
                <div style={styles.content}>
                  <span style={styles.badge}>{item.category}</span>
                  <h3 style={{ marginTop: '12px', fontSize: '18px', color: '#1e293b', fontWeight: '700' }}>{item.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '10px 0', flex: 1 }}>
                    {item.description?.substring(0, 100)}{item.description?.length > 100 ? '...' : ''}
                  </p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      <span>Goal: ${item.goal_amount || item.goalAmount}</span>
                      <span>0%</span>
                    </div>
                    <div style={styles.progressBar}><div style={styles.progressFill(0)}></div></div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => navigate(`/edit-campaign/${item.id}`)}
                      style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#475569', flex: 1 }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ ...styles.actionBtn, backgroundColor: '#fef2f2', color: '#ef4444', flex: 1 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '18px' }}>No campaigns found.</p>
            <Link to="/create-campaign" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>Create your first one now →</Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BusinessDashboard;
