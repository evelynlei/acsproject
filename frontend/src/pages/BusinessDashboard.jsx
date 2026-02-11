import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { campaignAPI, tokenStorage } from '../api/auth';
import Footer from '../components/Footer';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modal, setModal] = useState({ show: false, type: null, data: null });
  const [editForm, setEditForm] = useState({ id: '', title: '', description: '', goal_amount: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignAPI.getUserCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditForm({
      id: item.id,
      title: item.title,
      description: item.description,
      goal_amount: item.goal_amount || item.goalAmount
    });
    setModal({ show: true, type: 'EDIT', data: item });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await campaignAPI.updateCampaign(null, editForm.id, editForm);
      setCampaigns(campaigns.map(c => c.id === editForm.id ? { ...c, ...editForm } : c));
      setModal({ show: false, type: null, data: null });
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      await campaignAPI.deleteCampaign(null, modal.data.id);
      setCampaigns(campaigns.filter(c => c.id !== modal.data.id));
      setModal({ show: false, type: null, data: null });
    } catch (err) {
      alert('Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: { padding: '120px 20px 60px', maxWidth: '1200px', margin: '0 auto' },
    listGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' },
    campaignCard: { backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px' },
    actionBtn: { padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modal: { backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'popIn 0.3s ease-out' },
    input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', marginBottom: '16px', fontSize: '16px', boxSizing: 'border-box' }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>Campaign Management</h1>
          <Link to="/create-campaign" style={{ ...styles.actionBtn, backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none' }}>+ New Campaign</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center' }}>Loading...</div>
        ) : (
          <div style={styles.listGrid}>
            {campaigns.map((item) => (
              <div key={item.id} style={styles.campaignCard}>
                <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '700' }}>{item.category}</span>
                <h3 style={{ margin: '10px 0' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', flex: 1 }}>{item.description}</p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => openEditModal(item)} style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', color: '#475569', flex: 1 }}>Edit</button>
                  <button onClick={() => setModal({ show: true, type: 'DELETE', data: item })} style={{ ...styles.actionBtn, backgroundColor: '#fef2f2', color: '#ef4444', flex: 1 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal.show && (
        <div style={styles.overlay} onClick={() => !submitting && setModal({ show: false, type: null, data: null })}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            
            {modal.type === 'EDIT' && (
              <form onSubmit={handleUpdate}>
                <h2 style={{ marginBottom: '20px' }}>Edit Campaign</h2>
                <label style={{ display: 'block', textAlign: 'left', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Title</label>
                <input 
                  style={styles.input} 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})} 
                  required 
                />
                
                <label style={{ display: 'block', textAlign: 'left', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Description</label>
                <textarea 
                  style={{ ...styles.input, minHeight: '100px', resize: 'none' }} 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  required 
                />

                <label style={{ display: 'block', textAlign: 'left', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Goal Amount ($)</label>
                <input 
                  type="number"
                  style={styles.input} 
                  value={editForm.goal_amount} 
                  onChange={e => setEditForm({...editForm, goal_amount: e.target.value})} 
                  required 
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setModal({ show: false })} style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', flex: 1 }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ ...styles.actionBtn, backgroundColor: '#3b82f6', color: 'white', flex: 1 }}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {modal.type === 'DELETE' && (
              <>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <h2 style={{ marginBottom: '12px' }}>Confirm Delete</h2>
                <p style={{ color: '#64748b', marginBottom: '28px' }}>Are you sure you want to delete <strong>"{modal.data?.title}"</strong>?</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setModal({ show: false })} style={{ ...styles.actionBtn, backgroundColor: '#f1f5f9', flex: 1 }}>Cancel</button>
                  <button onClick={confirmDelete} disabled={submitting} style={{ ...styles.actionBtn, backgroundColor: '#ef4444', color: 'white', flex: 1 }}>
                    {submitting ? 'Deleting...' : 'Delete Now'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
      <style>{`
        @keyframes popIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        button:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
};

export default BusinessDashboard;