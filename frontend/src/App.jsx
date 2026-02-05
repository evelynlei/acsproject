import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BusinessDashboard from './pages/BusinessOwner';
import Admin from './pages/Admin';
import { tokenStorage } from './api/auth'; 

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = tokenStorage.getUser();
  
  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user.role);
    const isAdmin = user.is_admin && allowedRoles.includes('admin');
    
    if (!hasRole && !isAdmin) {
      return <Navigate replace to="/" />;
    }
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
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/business-dashboard" element={
          <ProtectedRoute>
            <BusinessDashboard />
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