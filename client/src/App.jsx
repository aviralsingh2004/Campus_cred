import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Points from './pages/Points'
import Rewards from './pages/Rewards'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Student Routes */}
            <Route path="/Home" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
                <Layout><Home /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/points" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
                <Layout><Points /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/rewards" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['student']}>
                <Layout><Rewards /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes - Placeholder for future implementation */}
            <Route path="/admin" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <Layout><div className="p-6"><h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1><p className="mt-2 text-gray-600">Admin features coming soon!</p></div></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <Layout><div className="p-6"><h1 className="text-2xl font-bold text-gray-900">Manage Students</h1><p className="mt-2 text-gray-600">Student management features coming soon!</p></div></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/transactions" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <Layout><div className="p-6"><h1 className="text-2xl font-bold text-gray-900">Transaction History</h1><p className="mt-2 text-gray-600">Transaction management features coming soon!</p></div></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/rewards" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <Layout><div className="p-6"><h1 className="text-2xl font-bold text-gray-900">Manage Rewards</h1><p className="mt-2 text-gray-600">Reward management features coming soon!</p></div></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
