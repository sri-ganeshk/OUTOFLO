import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/protected/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CampaignsList from './pages/CampaignsList';
import CampaignForm from './pages/CampaignForm';
import CampaignDetail from './pages/CampaignDetail';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <CampaignsList />
                </ProtectedRoute>
              } />
              
              <Route path="/campaigns/new" element={
                <ProtectedRoute>
                  <CampaignForm />
                </ProtectedRoute>
              } />
              
              <Route path="/campaigns/:id" element={
                <ProtectedRoute>
                  <CampaignDetail />
                </ProtectedRoute>
              } />
              
              
              
              {/* Redirect all unknown routes to dashboard or login */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;