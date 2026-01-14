import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import CampaignCard from '../components/CampaignCard';
import { campaignAPI, tokenStorage } from '../api/auth';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, [location.key]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = tokenStorage.getAccessToken();
      const user = tokenStorage.getUser();
      const isAdmin = user?.is_admin === true;
      
      // Admin: see everything. Everyone else (including logged-out): see Approved only.
      if (accessToken && isAdmin) {
        const data = await campaignAPI.getAllCampaigns(accessToken);
        setCampaigns(data);
      } else {
        const data = await campaignAPI.getPublicCampaigns();
        setCampaigns(data);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId) => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) return;

    const ok = confirm('Delete this campaign?');
    if (!ok) return;

    try {
      setDeletingId(campaignId);
      await campaignAPI.deleteCampaign(accessToken, campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdminStatus = async (campaignId, status) => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) return;

    try {
      const updated = await campaignAPI.updateCampaignStatus(accessToken, campaignId, status);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update campaign status');
    }
  };

  const handleLearnMore = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <main>
      <section className="hero">
        <h1>Be the Change You Wish to See</h1>
        <p>Advanced Consulting Services empowers social causes and small businesses to thrive.</p>
        <div className="hero-btns">
          <button className="btn-filled" onClick={() => navigate('/login')}>
            Start Now
          </button>
          <button className="btn-outline" onClick={handleLearnMore}>
            Learn More →
          </button>
        </div>
      </section>

      <section className="campaigns-section">
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 20px',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              color: '#2c3e50',
              margin: 0
            }}>
              Active Campaigns
            </h2>
            {campaigns.length > 0 && (
              <span style={{
                fontSize: '16px',
                color: '#95a5a6',
                fontWeight: '500'
              }}>
                {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
              </span>
            )}
          </div>

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#95a5a6'
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #ecf0f1',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '16px', fontSize: '16px' }}>Loading campaigns...</p>
            </div>
          )}

          {error && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '12px',
              border: '1px solid #c33'
            }}>
              <p style={{ margin: 0, fontSize: '16px' }}>
                {error}
              </p>
              <button
                onClick={loadCampaigns}
                style={{
                  marginTop: '16px',
                  padding: '10px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '16px'
              }}>📢</div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#2c3e50',
                marginBottom: '12px'
              }}>
                No campaigns yet
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#95a5a6',
                marginBottom: '24px'
              }}>
                Be the first to create a campaign and make a difference!
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-filled"
              >
                Create Campaign
              </button>
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {campaigns.map(campaign => {
                const user = tokenStorage.getUser();
                const isOwner = user?.id && campaign.user_id === user.id;
                const isAdmin = user?.is_admin === true;

                return (
                  <div key={campaign.id} style={{ position: 'relative' }}>
                    <CampaignCard
                      campaign={campaign}
                      showDelete={!!(isOwner || isAdmin)}
                      deleteDisabled={deletingId === campaign.id}
                      onDelete={() => handleDelete(campaign.id)}
                    />

                    {isAdmin && (
                      <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        right: '16px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        {(campaign.status === 'Pending' || campaign.status === 'Rejected') && (
                          <button
                            type="button"
                            className="btn-outline"
                            style={{ padding: '8px 12px' }}
                            onClick={() => handleAdminStatus(campaign.id, 'Approved')}
                          >
                            Approve
                          </button>
                        )}
                        {(campaign.status === 'Pending' || campaign.status === 'Approved') && (
                          <button
                            type="button"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#f44336',
                              color: '#fff',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            onClick={() => handleAdminStatus(campaign.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
