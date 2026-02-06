import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BusinessOwner from './pages/BusinessOwner'; 
import BusinessDashboard from './pages/BusinessDashboard'; 
//CreateCampaign
import CreateCampaign from './pages/CreateCampaign'; 
import Admin from './pages/Admin';
import { tokenStorage } from './api/auth'; 

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = tokenStorage.getUser();
  if (!user) return <Navigate replace to="/login" />;

  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    const isAdmin = user.is_admin && allowedRoles.includes('admin');
    if (!hasRole && !isAdmin) return <Navigate replace to="/" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/business-owner" element={
          <ProtectedRoute allowedRoles={['business']}>
            <BusinessOwner />
          </ProtectedRoute>
        } />

        <Route path="/business-dashboard" element={
          <ProtectedRoute allowedRoles={['business']}>
            <BusinessDashboard />
          </ProtectedRoute>
        } />

        <Route path="/create-campaign" element={
          <ProtectedRoute allowedRoles={['business']}>
            <CreateCampaign />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Admin />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;