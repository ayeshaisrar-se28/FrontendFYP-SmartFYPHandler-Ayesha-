import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/dashboard/StudentDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ProjectDetails from './components/ProjectDetails';
import FYPRankings from './components/rankings/FYPRankings';
import FYPSearch from './components/search/FYPSearch';
import FYPRankingManagement from './components/teacher/FYPRankingManagement';
import AIDashboard from './components/ai/AIDashboard';
import ProjectRecommendations from './components/ai/ProjectRecommendations';
import DataTest from './components/test/DataTest';
import { USER_ROLES } from './utils/constants';

// Enhanced Home component with professional styling and animations
const EnhancedHome = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
    {/* Navigation Header */}
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Smart FYP Handler</span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-4xl mx-auto">
        {/* Animated Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8 animate-bounce-slow">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          New Features Available
        </div>

        {/* Main Heading with Animation */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
          Smart FYP
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Handler</span>
        </h1>

        {/* Subtitle with Animation */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up-delay">
          Streamline your Final Year Project management with our comprehensive platform. 
          Connect students, supervisors, and administrators in one unified system.
        </p>

        {/* CTA Buttons with Animation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up-delay-2">
          <button className="group bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl shadow-lg">
            <span className="flex items-center justify-center">
              Start Your Journey
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
          <button className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
            <span className="flex items-center justify-center">
              Watch Demo
              <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up">
          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Management</h3>
            <p className="text-gray-600">Organize and track all Final Year Projects in one centralized platform with advanced tools.</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Connect students with supervisors and facilitate seamless collaboration across teams.</p>
          </div>

          <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors duration-300">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Monitor project progress with advanced analytics and comprehensive reporting tools.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case USER_ROLES.STUDENT:
      return <Navigate to="/dashboard/student" replace />;
    case USER_ROLES.TEACHER:
      return <Navigate to="/dashboard/teacher" replace />;
    case USER_ROLES.ADMIN:
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

// Unauthorized Page Component
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full text-center">
      <div className="mb-8">
        <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
          <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<EnhancedHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/student" 
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
                    <Layout><StudentDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/teacher" 
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]}>
                    <Layout><TeacherDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/dashboard/admin" 
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Project Details Route - accessible to all authenticated users */}
              <Route
                path="/project/:projectId"
                element={
                  <ProtectedRoute>
                    <Layout><ProjectDetails /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* FYP Rankings and Search Routes - accessible to all authenticated users */}
              <Route
                path="/rankings"
                element={
                  <ProtectedRoute>
                    <Layout><FYPRankings /></Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Layout><FYPSearch /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* Teacher FYP Management Route */}
              <Route
                path="/teacher/ranking-management"
                element={
                  <ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]}>
                    <Layout><FYPRankingManagement /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* AI Dashboard and Recommendations Routes */}
              <Route
                path="/ai"
                element={
                  <ProtectedRoute>
                    <Layout><AIDashboard /></Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/ai/recommendations"
                element={
                  <ProtectedRoute>
                    <Layout><ProjectRecommendations numRecommendations={10} /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* Test Route for debugging */}
              <Route
                path="/test-data"
                element={
                  <Layout><DataTest /></Layout>
                }
              />

              {/* Fallback Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;