import PropTypes from 'prop-types';
import './CampaignCard.css';

export default function CampaignCard({ campaign, showDelete = false, onDelete, deleteDisabled = false }) {
  const formatDate = (dateString) => {
    // SQLite returns datetime in format: "YYYY-MM-DD HH:MM:SS"
    // We need to treat it as UTC time
    let date;
    if (dateString.includes('T')) {
      // Already in ISO format with timezone
      date = new Date(dateString);
    } else {
      // SQLite format without timezone - treat as UTC
      date = new Date(dateString + ' UTC');
    }
    
    const now = new Date();
    const diffTime = now - date; // Don't use Math.abs - we want actual time difference
    
    // If negative, the date is in the future (shouldn't happen, but handle it)
    if (diffTime < 0) {
      return 'Just now';
    }
    
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const normalized = String(status || '').toLowerCase();
    const colors = {
      pending: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336'
    };
    return colors[normalized] || '#666';
  };

  return (
    <div className="campaign-card">
      <div className="campaign-card-header">
        <div className="campaign-poster-info">
          <div className="poster-avatar">
            {campaign.user_name ? campaign.user_name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="poster-details">
            <p className="poster-name">{campaign.user_name || 'Anonymous'}</p>
            <p className="post-time">{formatDate(campaign.created_at)}</p>
          </div>
        </div>
        <div className="campaign-card-header-actions">
          {showDelete && (
            <button
              type="button"
              className="campaign-delete-btn"
              onClick={onDelete}
              disabled={deleteDisabled}
              aria-label="Delete campaign"
              title="Delete"
            >
              Delete
            </button>
          )}
          <span 
            className="campaign-status-badge"
            style={{ backgroundColor: getStatusColor(campaign.status) }}
          >
            {campaign.status}
          </span>
        </div>
      </div>

      <div className="campaign-card-body">
        <h3 className="campaign-title">{campaign.title}</h3>
        <p className="campaign-description">{campaign.description}</p>
      </div>
    </div>
  );
}

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    id: PropTypes.number.isRequired,
    user_id: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
    user_name: PropTypes.string
  }).isRequired,
  showDelete: PropTypes.bool,
  onDelete: PropTypes.func,
  deleteDisabled: PropTypes.bool
};
