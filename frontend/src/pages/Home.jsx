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

  const featuredCampaigns = [
    {
      id: 'feat-1',
      title: "Clean Environment Initiative",
      description: "A campaign to promote a clean and healthy environment through community action.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
      btnText: "View Campaign"
    },
    {
      id: 'feat-2',
      title: "Mental Health Awareness",
      description: "This campaign supports mental health awareness and encourages open conversations.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
      btnText: "Participate"
    },
    {
      id: 'feat-3',
      title: "Support Local Communities",
      description: "Join us in building stronger communities by supporting local businesses and initiatives.",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
      btnText: "Learn More"
    }
  ];

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
        {/* 1. Hero Section */}
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

        {/* 2. NEW: Featured Initiatives (Based on your Image) */}
        <section style={{ padding: '60px 20px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ 
              textAlign: 'center', 
              fontSize: '32px', 
              color: '#2c3e50', 
              marginBottom: '40px',
              fontWeight: '700'
            }}>
              Featured Initiatives
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '30px' 
            }}>
              {featuredCampaigns.map(item => (
                <div key={item.id} style={{
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease'
                }}>
                  {/* Card Image */}
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Card Content */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#1e293b' }}>
                      {item.title}
                    </h3>
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '0.95rem', 
                      lineHeight: '1.6', 
                      marginBottom: '20px',
                      flex: 1 
                    }}>
                      {item.description}
                    </p>
                    <button 
                      className="btn-filled" 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
                    >
                      {item.btnText}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Active Campaigns Section */}
        <section className="campaigns-section" style={{ backgroundColor: '#f8fafc' }}>
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