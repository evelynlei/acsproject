// const API_BASE = 'http://localhost:3000/api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';


async function safeJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function authFetch(path, options = {}, { retryOn401 = true } = {}) {
  const accessToken = tokenStorage.getAccessToken();
  const headers = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If access token expired, try refresh once then retry original request.
  if (res.status === 401 && retryOn401) {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clear();
      window.location.assign('/login');
      throw new Error('Session expired. Please log in again.');
    }

    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const refreshData = await safeJson(refreshRes);
    if (!refreshRes.ok || !refreshData?.accessToken) {
      tokenStorage.clear();
      window.location.assign('/login');
      throw new Error(refreshData?.error || 'Session expired. Please log in again.');
    }

    tokenStorage.setTokens(refreshData.accessToken, refreshToken);
    return authFetch(path, options, { retryOn401: false });
  }

  const data = await safeJson(res);
  if (!res.ok) {
    const msg = data?.error || data?.message || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export const authAPI = {
  register: async (name, email, password, role = 'user') => { 
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }) 
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  refresh: async (refreshToken) => {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  },

  // Backwards-compatible: logout(accessToken, refreshToken) OR logout(refreshToken)
  logout: async (accessTokenOrRefreshToken, maybeRefreshToken) => {
    const refreshToken = maybeRefreshToken || accessTokenOrRefreshToken;
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    return response.json();
  }
};

// Token storage helpers
export const tokenStorage = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Campaign API
export const campaignAPI = {
  // Get all campaigns for the authenticated user
  getUserCampaigns: async (_accessToken) => authFetch('/campaigns'),

  // Get all campaigns (admin/public view)
  getAllCampaigns: async (_accessToken) => authFetch('/campaigns/all'),

  // Public: get approved campaigns (no auth)
  getPublicCampaigns: async () => {
    const response = await fetch(`${API_BASE}/campaigns/public`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch campaigns');
    }
    return response.json();
  },

  // Get a single campaign by ID
  getCampaign: async (_accessToken, campaignId) => authFetch(`/campaigns/${campaignId}`),

  // Create a new campaign
  createCampaign: async (_accessToken, campaignData) =>
    authFetch('/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    }),

  // Update a campaign
  updateCampaign: async (_accessToken, campaignId, campaignData) =>
    authFetch(`/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    }),

  // Admin: update campaign status
  updateCampaignStatus: async (_accessToken, campaignId, status) =>
    authFetch(`/campaigns/${campaignId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }),

  // Delete a campaign
  deleteCampaign: async (_accessToken, campaignId) =>
    authFetch(`/campaigns/${campaignId}`, {
      method: 'DELETE'
    })
};
