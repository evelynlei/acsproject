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
    category: 'Social Cause',
    imageUrl: ''
  });
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await campaignAPI.createCampaign(null, formData);
      alert('Campaign published successfully!');
      navigate('/business-dashboard');
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    wrapper: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' },
    section: { flex: '1', padding: '120px 20px 80px 20px', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' },
    container: { maxWidth: '800px', width: '100%' },
    header: { marginBottom: '36px', textAlign: 'center' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' },
    inputWrapper: (fieldName) => ({
      borderRadius: '12px',
      border: `2px solid ${focusedField === fieldName ? '#3b82f6' : '#e2e8f0'}`,
      backgroundColor: focusedField === fieldName ? '#fff' : '#f8fafc',
      transition: 'all 0.2s ease'
    }),
    input: { width: '100%', padding: '14px 16px', border: 'none', backgroundColor: 'transparent', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
    previewContainer: {
      marginTop: '16px', width: '100%', height: '250px', borderRadius: '12px',
      border: '2px dashed #e2e8f0', backgroundColor: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#94a3b8'
    },
    button: { width: '100%', padding: '16px', marginTop: '24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }
  };

  return (
    <div style={styles.wrapper}>
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={{fontSize: '32px', color: '#1e293b'}}>Launch a New Campaign</h2>
            <p style={{color: '#64748b'}}>Tell your story and start raising funds.</p>
          </div>

          <div style={styles.card}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                
                {/* Title */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={styles.label}>Campaign Title</label>
                  <div style={styles.inputWrapper('title')}>
                    <input style={styles.input} name="title" placeholder="Give your cause a name" value={formData.title} onChange={handleChange} onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)} required />
                  </div>
                </div>

                {/* Image URL & Preview */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={styles.label}>Campaign Image URL</label>
                  <div style={styles.inputWrapper('imageUrl')}>
                    <input style={styles.input} name="imageUrl" placeholder="https://..." value={formData.imageUrl} onChange={handleChange} onFocus={() => setFocusedField('imageUrl')} onBlur={() => setFocusedField(null)} />
                  </div>
                  <div style={styles.previewContainer}>
                    {formData.imageUrl ? (
                      <img 
                        key={formData.imageUrl} 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span style="color: #ef4444;">Invalid Image URL</span>'; }}
                      />
                    ) : (
                      <span>Image preview will appear here</span>
                    )}
                  </div>
                </div>

                {/* Goal Amount */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={styles.label}>Fundraising Goal ($)</label>
                  <div style={styles.inputWrapper('goalAmount')}>
                    <input style={styles.input} type="number" name="goalAmount" placeholder="5000" value={formData.goalAmount} onChange={handleChange} required />
                  </div>
                </div>

                {/* Category */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={styles.label}>Category</label>
                  <div style={styles.inputWrapper('category')}>
                    <select style={styles.input} name="category" value={formData.category} onChange={handleChange}>
                      <option value="Social Cause">Social Cause</option>
                      <option value="Environment">Environment</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={styles.label}>Description</label>
                  <div style={styles.inputWrapper('description')}>
                    <textarea style={{...styles.input, minHeight: '120px'}} name="description" placeholder="Describe your mission..." value={formData.description} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} style={styles.button}>
                {isSubmitting ? 'Publishing...' : 'Publish Campaign'}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CreateCampaign;