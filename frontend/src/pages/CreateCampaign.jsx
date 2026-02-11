import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '../api/auth';
import Footer from '../components/Footer';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    category: 'Social Cause'
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await campaignAPI.createCampaign(null, formData);
      setShowModal(true); 
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stayOnPage = () => {
    setShowModal(false);
    setFormData({ title: '', description: '', goalAmount: '', category: 'Social Cause' }); 
  };

  const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' },
    section: { flex: '1', padding: '100px 20px', display: 'flex', justifyContent: 'center' },
    container: { maxWidth: '1100px', width: '100%' },
    header: { marginBottom: '32px', textAlign: 'left' },
    mainContent: { display: 'flex', gap: '40px', alignItems: 'flex-start' },
    card: { flex: '1.5', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    preview: { flex: '1', position: 'sticky', top: '120px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' },
    inputWrapper: (fieldName) => ({
      borderRadius: '12px',
      border: `2px solid ${focusedField === fieldName ? '#3b82f6' : '#e2e8f0'}`,
      backgroundColor: focusedField === fieldName ? '#fff' : '#f8fafc',
      transition: 'all 0.2s ease',
      marginBottom: '20px'
    }),
    input: { width: '100%', padding: '14px 16px', border: 'none', backgroundColor: 'transparent', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
    button: { width: '100%', padding: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '16px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modalContent: { backgroundColor: '#fff', padding: '40px', borderRadius: '32px', textAlign: 'center', maxWidth: '400px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', animation: 'slideUp 0.4s ease' }
  };

  return (
    <div style={styles.wrapper}>
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={{fontSize: '36px', color: '#1e293b', margin: '0 0 10px 0'}}>Launch Campaign</h2>
            <p style={{color: '#64748b', fontSize: '18px'}}>Spread your message and gather support.</p>
          </div>

          <div style={styles.mainContent}>
            <div style={styles.card}>
              <form onSubmit={handleSubmit}>
                <label style={styles.label}>Campaign Title</label>
                <div style={styles.inputWrapper('title')}>
                  <input style={styles.input} name="title" value={formData.title} onChange={handleChange} onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)} placeholder="Enter title" required />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Goal ($)</label>
                    <div style={styles.inputWrapper('goalAmount')}>
                      <input style={styles.input} type="number" name="goalAmount" value={formData.goalAmount} onChange={handleChange} required />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Category</label>
                    <div style={styles.inputWrapper('category')}>
                      <select style={styles.input} name="category" value={formData.category} onChange={handleChange}>
                        <option value="Business">Business</option>
                        <option value="Social Cause">Social Cause</option>
                      </select>
                    </div>
                  </div>
                </div>
                <label style={styles.label}>Description</label>
                <div style={styles.inputWrapper('description')}>
                  <textarea style={{...styles.input, minHeight: '150px', resize: 'none'}} name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <button type="submit" disabled={isSubmitting} style={styles.button}>
                  {isSubmitting ? 'Publishing...' : '🚀 Publish Campaign'}
                </button>
              </form>
            </div>

            <aside style={styles.preview}>
              <h4 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>LIVE PREVIEW</h4>
              <div style={{ backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
                <div style={{ height: '160px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                   {formData.category === 'Business' ? '🏢' : '🌱'}
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>{formData.title || 'Untitled'}</h3>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>{formData.description || 'Waiting for description...'}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>Campaign Published!</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your campaign is now live and visible to the community.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={stayOnPage} style={{ ...styles.button, backgroundColor: '#334155', flex: 1 }}>Create Another</button>
              <button 
                onClick={() => navigate('/business-dashboard')} 
                style={{ ...styles.button, flex: 1 }}
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default CreateCampaign;