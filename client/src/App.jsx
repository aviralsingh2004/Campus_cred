import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AdminHome from './pages/AdminHome'
import Points from './pages/Points'
import Rewards from './pages/Rewards'
import AdminCredit from './pages/AdminCredit'
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
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <Layout><AdminHome /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/credit" element={
              <ProtectedRoute requireAuth={true} allowedRoles={['admin']}>
                <Layout><AdminCredit /></Layout>
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
