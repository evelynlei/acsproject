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
      setError(err.message || 'Failed to update campaign status');
    }
  };

  const handleLearnMore = () => {
    const section = document.querySelector('.campaigns-section');
    if (section) {
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = section.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <> 
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
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '30px' 
            }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#2c3e50', margin: 0 }}>
                Active Campaigns
              </h2>
              {campaigns.length > 0 && (
                <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: '500' }}>
                  {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'}
                </span>
              )}
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div className="loading-spinner"></div>
                <p style={{ color: '#94a3b8', marginTop: '10px' }}>Loading campaigns...</p>
              </div>
            )}

            {error && !loading && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#ef4444', 
                background: '#fef2f2', 
                borderRadius: '12px' 
              }}>
                {error}
              </div>
            )}

            {!loading && !error && (
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
                          bottom: '15px',
                          right: '15px',
                          display: 'flex',
                          gap: '8px',
                          zIndex: 2
                        }}>
                          {(campaign.status !== 'Approved') && (
                            <button
                              className="btn-filled"
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#22c55e' }}
                              onClick={() => handleAdminStatus(campaign.id, 'Approved')}
                            >
                              Approve
                            </button>
                          )}
                          {(campaign.status !== 'Rejected') && (
                            <button
                              className="btn-filled"
                              style={{ padding: '6px 12px', fontSize: '12px', background: '#ef4444' }}
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
      </main>
      <Footer />
    </>
  );
}