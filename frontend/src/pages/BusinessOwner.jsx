import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI, tokenStorage } from '../api/auth';
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
      const user = tokenStorage.getUser();
      await campaignAPI.createCampaign(null, formData);
      alert('Campaign published successfully!');
      navigate('/business-dashboard');
    } catch (err) {
      alert('Failed to publish campaign: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9',
    },
    section: {
      flex: '1', 
      padding: '100px 20px 60px 20px', 
      display: 'flex',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    container: {
      maxWidth: '800px',
      width: '100%',
    },
    header: {
      marginBottom: '36px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '800',
      color: '#1e293b',
      marginBottom: '12px'
    },
    subtitle: {
      color: '#64748b',
      fontSize: '16px'
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '24px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569',
      marginBottom: '8px',
      marginLeft: '4px'
    },
    inputWrapper: (fieldName) => ({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '12px',
      border: `2px solid ${focusedField === fieldName ? '#3b82f6' : '#e2e8f0'}`,
      backgroundColor: focusedField === fieldName ? '#fff' : '#f8fafc',
      transition: 'all 0.2s ease',
      boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none'
    }),
    input: {
      width: '100%',
      padding: '14px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '16px',
      color: '#0f172a',
      outline: 'none',
      borderRadius: '12px'
    },
    button: {
      width: '100%',
      padding: '16px',
      marginTop: '10px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: isSubmitting ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: isSubmitting ? 0.7 : 1
    },
    previewImage: {
      width: '100%',
      height: '220px',
      objectFit: 'cover',
      borderRadius: '12px',
      marginTop: '16px',
      border: '1px solid #e2e8f0'
    }
  };

  return (
    <div style={styles.wrapper}>
      <section style={styles.section}>
        <div style={styles.container}>
          
          <div style={styles.header}>
            <h2 style={styles.title}>Launch a New Campaign</h2>
            <p style={styles.subtitle}>Fill in the details below to start your journey.</p>
          </div>

          <div style={styles.card}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>
                
                {/* Title */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={styles.label}>Campaign Title</label>
                  <div style={styles.inputWrapper('title')}>
                    <input 
                      style={styles.input}
                      name="title"
                      placeholder="Give your cause a name"
                      value={formData.title}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('title')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Amount */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={styles.label}>Fundraising Goal ($)</label>
                  <div style={styles.inputWrapper('goalAmount')}>
                    <input 
                      style={styles.input}
                      type="number"
                      name="goalAmount"
                      placeholder="5000"
                      value={formData.goalAmount}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('goalAmount')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div style={{ gridColumn: 'span 6' }}>
                  <label style={styles.label}>Category</label>
                  <div style={styles.inputWrapper('category')}>
                    <select 
                      style={{...styles.input, cursor: 'pointer'}}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('category')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <option value="Social Cause">Social Cause</option>
                      <option value="Environment">Environment</option>
                      <option value="Education">Education</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>
                </div>

                {/* Image */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={styles.label}>Campaign Image URL</label>
                  <div style={styles.inputWrapper('imageUrl')}>
                    <input 
                      style={styles.input}
                      name="imageUrl"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.imageUrl}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('imageUrl')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" style={styles.previewImage} />
                  )}
                </div>

                {/* Description */}
                <div style={{ gridColumn: 'span 12' }}>
                  <label style={styles.label}>Description</label>
                  <div style={styles.inputWrapper('description')}>
                    <textarea 
                      style={{...styles.input, minHeight: '120px', resize: 'vertical'}}
                      name="description"
                      placeholder="Tell your story..."
                      value={formData.description}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      required
                    />
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