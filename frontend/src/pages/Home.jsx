import React, { useState, useEffect } from 'react';
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
  
  const [modal, setModal] = useState({ show: false, campaignId: null });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, [location.key]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const accessToken = tokenStorage.getAccessToken();
      const currentUser = tokenStorage.getUser();
      const isAdmin = currentUser?.is_admin === true || currentUser?.role === 'admin';
      
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

  const triggerDelete = (id) => {
    setModal({ show: true, campaignId: id });
  };

  const handleFinalDelete = async () => {
    const accessToken = tokenStorage.getAccessToken();
    const campaignId = modal.campaignId;
    if (!accessToken || !campaignId) return;

    try {
      setDeletingId(campaignId);
      await campaignAPI.deleteCampaign(accessToken, campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      setModal({ show: false, campaignId: null });
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
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const currentUser = tokenStorage.getUser();
  const isAdminUser = currentUser?.is_admin === true || currentUser?.role === 'admin';
  
  const businessCampaigns = campaigns.filter((c) => c.category === 'Business');
  const socialCampaigns = campaigns.filter((c) => c.category !== 'Business');

  const renderCampaignGrid = (campaignList, emptyMessage) => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="loading-spinner"></div>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>Loading campaigns...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444', background: '#fef2f2', borderRadius: '12px' }}>
          {error}
        </div>
      );
    }

    if (campaignList.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '20px' }}>
          {emptyMessage}
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {campaignList.map((campaign) => {
          const isOwner = currentUser?.id && campaign.user_id === currentUser.id;
          return (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              showDelete={!!(isOwner || isAdminUser)}
              deleteDisabled={deletingId === campaign.id}
              onDelete={() => triggerDelete(campaign.id)}
              isAdmin={isAdminUser}
              onAdminStatus={handleAdminStatus}
            />
          );
        })}
      </div>
    );
  };

  return (
    <> 
      <main style={{ backgroundColor: '#fff' }}>
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

        {/* 2. Business Campaigns Section */}
        <section style={{ padding: '80px 20px', backgroundColor: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', margin: 0 }}>🚀 Business Campaigns</h2>
                <p style={{ color: '#64748b', marginTop: '8px' }}>Support local entrepreneurs and innovative startups.</p>
              </div>
              {!loading && businessCampaigns.length > 0 && (
                <span className="count-badge">{businessCampaigns.length} Projects</span>
              )}
            </div>
            {renderCampaignGrid(businessCampaigns, 'No business campaigns available right now.')}
          </div>
        </section>

        {/* 3. Social Cause Campaigns Section */}
        <section className="campaigns-section" style={{ padding: '80px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', margin: 0 }}>🌍 Social Cause Campaigns</h2>
                <p style={{ color: '#64748b', marginTop: '8px' }}>Join us in making a real difference in the community.</p>
              </div>
              {!loading && socialCampaigns.length > 0 && (
                <span className="count-badge">{socialCampaigns.length} Projects</span>
              )}
            </div>
            {renderCampaignGrid(socialCampaigns, 'No social cause campaigns available right now.')}
          </div>
        </section>
      </main>

      {modal.show && (
        <div style={overlayStyle} onClick={() => setModal({ show: false, campaignId: null })}>
          <div style={modalStyle} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Confirm Delete</h2>
            <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.5' }}>
              Are you sure you want to delete this campaign? <br/>This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setModal({ show: false, campaignId: null })}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalDelete}
                disabled={!!deletingId}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .count-badge {
          background: #eff6ff;
          color: #3b82f6;
          padding: '6px 16px';
          borderRadius: '20px';
          fontWeight: '700';
          fontSize: '14px';
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)',
  backdropFilter: 'blur(8px)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
};

const modalStyle = {
  backgroundColor: '#fff', padding: '40px', borderRadius: '28px',
  width: '100%', maxWidth: '400px', textAlign: 'center',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  animation: 'popIn 0.3s ease-out'
};