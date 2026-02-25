import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { tokenStorage, campaignAPI } from '../api/auth';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [currentUser, setCurrentUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ show: false, campaignId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const isNewUser = location.state?.isNewUser === true;

  useEffect(() => {
    const user = tokenStorage.getUser();
    const accessToken = tokenStorage.getAccessToken();
    
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    loadCampaigns();
  }, [navigate]);

  const loadCampaigns = async () => {
    try {
      const accessToken = tokenStorage.getAccessToken();
      const data = await campaignAPI.getUserCampaigns(accessToken);
      setCampaigns(data);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const accessToken = tokenStorage.getAccessToken();
      const campaignData = { title: formData.title, description: formData.description };
      
      if (editingId) {
        const updatedCampaign = await campaignAPI.updateCampaign(accessToken, editingId, campaignData);
        setCampaigns(prev => prev.map(c => c.id === editingId ? updatedCampaign : c));
        setEditingId(null);
      } else {
        const newCampaign = await campaignAPI.createCampaign(accessToken, campaignData);
        setCampaigns(prev => [newCampaign, ...prev]);
      }
      setFormData({ title: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    setEditingId(campaign.id);
    setFormData({ title: campaign.title, description: campaign.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '' });
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ show: true, campaignId: id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, campaignId: null });
  };

  const confirmDelete = async () => {
    const campaignId = deleteModal.campaignId;
    if (!campaignId) return;

    setIsDeleting(true);
    try {
      const accessToken = tokenStorage.getAccessToken();
      await campaignAPI.deleteCampaign(accessToken, campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      closeDeleteModal();
    } catch (err) {
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <main className="dashboard-main">
        <section className="welcome-section ready">
          <h1 id="welcome-msg" className="show">
            {isNewUser ? `Welcome, ${currentUser?.name}!` : `Welcome back, ${currentUser?.name}!`}
          </h1>
          <p>
            {isNewUser 
              ? "We're excited to have you here. Start by creating your first campaign!" 
              : "Manage your campaigns and social impact here."}
          </p>
        </section>

        <div className="dashboard-grid">
          <section className="post-campaign-card">
            <h3>{editingId ? 'Edit Campaign' : 'Post a New Campaign'}</h3>
            {error && <div className="error-box" style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Campaign Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Save the Forest"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="6"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={{ width: '100%', borderRadius: '10px', padding: '12px', border: '1.5px solid #ddd' }}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-filled" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Processing...' : (editingId ? 'Update Campaign' : 'Publish Campaign')}
                </button>
                {editingId && (
                  <button type="button" className="btn-outline" onClick={handleCancelEdit}>Cancel</button>
                )}
              </div>
            </form>
          </section>

          <section className="my-campaigns">
            <h3>My Active Campaigns</h3>
            <div id="campaign-list">
              {campaigns.length === 0 ? (
                <p className="empty-msg">You haven't posted any campaigns yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {campaigns.map(campaign => (
                    <div key={campaign.id} className="campaign-item-container" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '15px', background: '#fff' }}>
                      <CampaignCard campaign={campaign} />
                      <div className="action-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button className="btn-outline" onClick={() => handleEdit(campaign)} style={{ padding: '8px 16px', fontSize: '14px' }}>Edit</button>
                        <button 
                          className="btn-danger" 
                          onClick={() => openDeleteModal(campaign.id)}
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {deleteModal.show && (
        <div style={overlayStyle} onClick={closeDeleteModal}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗑️</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Confirm Deletion</h2>
            <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.5' }}>
              Are you sure you want to remove this campaign? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={closeDeleteModal}
                style={cancelBtnStyle}
              >
                Go Back
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                style={deleteBtnStyle}
              >
                {isDeleting ? 'Removing...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes modalPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(4px)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
};

const modalStyle = {
  backgroundColor: '#fff', padding: '30px', borderRadius: '20px',
  width: '100%', maxWidth: '380px', textAlign: 'center',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  animation: 'modalPop 0.2s ease-out'
};

const cancelBtnStyle = {
  flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0',
  background: '#fff', color: '#64748b', fontWeight: '600', cursor: 'pointer'
};

const deleteBtnStyle = {
  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
  background: '#ef4444', color: '#fff', fontWeight: '600', cursor: 'pointer'
};