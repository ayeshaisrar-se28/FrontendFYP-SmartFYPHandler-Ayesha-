import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import projectService from '../../services/projectService';
import rankingService from '../../services/rankingService';
import api from '../../services/api';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  Database,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Globe,
  Mail,
  Bell,
  Calendar,
  Clock,
  Star,
  Award,
  ChevronRight,
  UserPlus,
  FileText,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [dbDepartments, setDbDepartments] = useState([]);
  
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 1, // Default student
    departmentId: null,
    department: '',
    password: 'DefaultPassword123!',
    studentId: `STD${Math.floor(Math.random() * 10000)}` 
  });
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Fetch global dashboard stats
        const stats = await projectService.getDashboardStats();
        
        setSystemStats([
          { name: 'Total Projects', value: stats.totalProjects.toString(), icon: BookOpen, color: 'bg-blue-500', change: 'Total archived', trend: 'neutral', percentage: 0 },
          { name: 'Active Students', value: stats.studentCount.toString(), icon: GraduationCap, color: 'bg-green-500', change: 'Enrolled', trend: 'up', percentage: 0 },
          { name: 'Faculty Members', value: stats.facultyCount.toString(), icon: Users, color: 'bg-purple-500', change: 'Supervisors', trend: 'neutral', percentage: 0 },
          { name: 'System Alerts', value: stats.pendingProjectsCount.toString(), icon: AlertTriangle, color: 'bg-orange-500', change: 'Pending review', trend: 'up', percentage: 0 },
        ]);

        // Fetch department rankings/stats
        const currentYear = new Date().getFullYear();
        const deptRankings = await rankingService.getAllDepartmentRankings(currentYear);
        
        if (deptRankings) {
          setDepartmentStats(deptRankings.map(d => ({
            name: d.department.name,
            projects: d.total_projects,
            students: d.projects.reduce((acc, p) => acc + (p.students?.length || 0), 0),
            faculty: Math.ceil(d.total_projects / 3), // Mock mapping if not available
            completion: Math.round((d.projects.filter(p => p.status === 'Completed').length / d.total_projects) * 100) || 0,
            performance: d.avg_performance > 80 ? 'excellent' : 'good',
            growth: 10
          })));
        }

        // Fetch real pending projects
        try {
          const pending = await projectService.searchProjects({ status: 'Proposed', pageSize: 10 });
          if (pending && pending.data && pending.data.items) {
            setPendingApprovals(pending.data.items.map(p => ({
              id: p.id,
              type: 'Project Proposal',
              title: p.title,
              submittedBy: p.supervisorName || 'Unknown',
              department: p.departmentName || 'N/A',
              submittedDate: new Date(p.createdAt).toLocaleDateString(),
              priority: p.difficultyLevel === 'Hard' ? 'high' : 'medium'
            })));
          }
        } catch (err) {
          console.error("Failed to fetch pending projects", err);
        }

        // Fetch real recent activities (latest projects)
        try {
          const recent = await projectService.searchProjects({ pageSize: 5 });
          if (recent && recent.data && recent.data.items) {
            setRecentActivities(recent.data.items.map(p => ({
              id: p.id,
              action: 'New project posted',
              user: p.supervisorName || 'Teacher',
              details: p.title,
              time: 'Recently',
              type: 'project',
              status: 'success'
            })));
          }
        } catch (err) {
          console.error("Failed to fetch recent activities", err);
        }

        setSystemMetrics([
          { label: 'Projects Completed', value: stats.completedProjectsCount, total: stats.totalProjects || 1, color: 'bg-green-500' },
          { label: 'System Uptime', value: 99.9, total: 100, color: 'bg-emerald-500' },
          { label: 'Avg Project Grade', value: 3.8, total: 4.0, color: 'bg-blue-500' }
        ]);

        // Fetch departments for the add user dropdown
        try {
          const depts = await projectService.getDepartments();
          if (depts && depts.length > 0) {
            setDbDepartments(depts);
            setNewUser(prev => ({ 
              ...prev, 
              department: depts[0].name, 
              departmentId: depts[0].id 
            }));
          }
        } catch (e) {
          console.error('Failed to load departments', e);
        }

      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        toast.error('Could not connect to backend. System metrics unavailable.');
        
        // Reset states to empty or zero to avoid showing stale demo data
        setSystemStats([]);
        setDepartmentStats([]);
        setRecentActivities([]);
        setSystemMetrics([]);
        setPendingApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleCreateProject = (e) => {
    e?.preventDefault();
    toast.success('Project created successfully!');
    setShowCreateModal(false);
  };

  const handleAddUser = async (e) => {
    e?.preventDefault();
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast.error('First name, last name, and email are required');
      return;
    }

    try {
      setIsSubmittingUser(true);
      // We call the register API directly, avoiding the authService which would mistakenly log the admin out!
      await api.post('/auth/register', newUser);
      
      toast.success('User added successfully!');
      setShowUserModal(false);
      
      // Clear form
      setNewUser(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        studentId: `STD${Math.floor(Math.random() * 10000)}`
      }));
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to add user. Email may exist.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  const quickActions = [
    { 
      name: 'Create New Project', 
      icon: Plus, 
      color: 'bg-blue-500', 
      action: () => setShowCreateModal(true) 
    },
    { 
      name: 'Add User', 
      icon: UserPlus, 
      color: 'bg-green-500', 
      action: () => setShowUserModal(true) 
    },
    { 
      name: 'System Settings', 
      icon: Settings, 
      color: 'bg-purple-500', 
      action: () => setShowSettingsModal(true) 
    },
    { 
      name: 'Generate Report', 
      icon: FileText, 
      color: 'bg-orange-500', 
      action: () => {} 
    },
    { 
      name: 'Database Backup', 
      icon: Database, 
      color: 'bg-indigo-500', 
      action: () => {} 
    },
    { 
      name: 'Send Notification', 
      icon: Bell, 
      color: 'bg-pink-500', 
      action: () => {} 
    }
  ];

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'average': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  System Dashboard 🛡️
                </h1>
                <p className="text-xl text-gray-600">
                  Welcome {user?.firstName}, manage and oversee the entire FYP ecosystem.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button 
                  onClick={() => setShowUserModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add User
                </button>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Project
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  title="Account Settings"
                  className="flex items-center justify-center px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md font-semibold group flex-shrink-0"
                >
                  <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* System Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
            {systemStats.map((item) => (
              <div key={item.name} className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`${item.color} p-4 rounded-xl shadow-lg`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-3xl font-bold text-gray-900">
                            {item.value}
                          </div>
                          <div className={`ml-2 text-sm ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                            {item.percentage > 0 ? `+${item.percentage}%` : item.percentage < 0 ? `${item.percentage}%` : ''}
                          </div>
                        </dd>
                        <dd className="text-sm text-gray-600 mt-1">
                          {item.change}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8 animate-slide-up-delay">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'System Overview', icon: Activity },
                  { id: 'departments', name: 'Departments', icon: Building },
                  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                  { id: 'users', name: 'User Management', icon: Users },
                  { id: 'settings', name: 'System Settings', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in-up">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* System Performance Metrics */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">System Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {systemMetrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                            <span className="text-lg font-bold text-gray-900">
                              {metric.total === 100 ? `${metric.value}%` : 
                               metric.total === 5.0 ? `${metric.value}/5.0` : 
                               `${metric.value}/${metric.total}`}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`${metric.color} h-3 rounded-full transition-all duration-700`}
                              style={{ width: `${(metric.value / metric.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project Distribution Chart */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Project Distribution by Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        {[
                          { status: 'Active', count: 142, color: 'bg-blue-500', percentage: 57 },
                          { status: 'Completed', count: 89, color: 'bg-green-500', percentage: 36 },
                          { status: 'On Hold', count: 12, color: 'bg-yellow-500', percentage: 5 },
                          { status: 'Cancelled', count: 5, color: 'bg-red-500', percentage: 2 }
                        ].map((item, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div className={`w-4 h-4 ${item.color} rounded-full mr-3`}></div>
                                <span className="text-sm font-medium text-gray-700">{item.status}</span>
                              </div>
                              <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${item.color} h-2 rounded-full transition-all duration-700`}
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle 
                              cx="96" cy="96" r="80" 
                              stroke="#e5e7eb" 
                              strokeWidth="16" 
                              fill="none"
                            />
                            <circle 
                              cx="96" cy="96" r="80" 
                              stroke="#3b82f6" 
                              strokeWidth="16" 
                              fill="none"
                              strokeDasharray={`${57 * 5.02} 502`}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">248</div>
                              <div className="text-sm text-gray-500">Total Projects</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Growth Chart */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Growth Trends</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {[
                        { month: 'Jul', projects: 18, students: 45, height: 72 },
                        { month: 'Aug', projects: 24, students: 67, height: 96 },
                        { month: 'Sep', projects: 19, students: 52, height: 76 },
                        { month: 'Oct', projects: 31, students: 89, height: 124 },
                        { month: 'Nov', projects: 28, students: 78, height: 112 },
                        { month: 'Dec', projects: 35, students: 98, height: 140 },
                        { month: 'Jan', projects: 42, students: 112, height: 168 }
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div className="flex flex-col items-center w-full space-y-1">
                            <div 
                              className="w-full bg-blue-500 rounded-t transition-all duration-700 hover:bg-blue-600 relative group"
                              style={{ height: `${item.height}px` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded">
                                {item.projects} projects
                              </div>
                            </div>
                            <div 
                              className="w-full bg-green-500 rounded-t transition-all duration-700 hover:bg-green-600 relative group"
                              style={{ height: `${item.height * 0.6}px` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded">
                                {item.students} students
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">{item.month}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-4 space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Projects</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">Students</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Recent Activities */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                              activity.type === 'project' ? 'bg-blue-500' :
                              activity.type === 'user' ? 'bg-green-500' :
                              activity.type === 'completion' ? 'bg-purple-500' :
                              activity.type === 'system' ? 'bg-gray-500' : 'bg-orange-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{activity.user}</span> {activity.action}
                              </p>
                              <p className="text-xs text-gray-500">{activity.details}</p>
                              <p className="text-xs text-gray-400">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Pending Approvals</h3>
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {pendingApprovals.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {pendingApprovals.map((approval) => (
                          <div key={approval.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{approval.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                                {approval.priority}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              <span className="font-medium">Type:</span> {approval.type}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              <span className="font-medium">By:</span> {approval.submittedBy}
                            </p>
                            <p className="text-xs text-gray-500">
                              {approval.submittedDate}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <button className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className="flex flex-col items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:border-blue-300 group"
                          >
                            <div className={`${action.color} p-3 rounded-xl mb-2 group-hover:scale-110 transition-transform`}>
                              <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-gray-900 text-center">{action.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Department Overview</h2>
                      <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Department
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Projects
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Faculty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Growth
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {departmentStats.map((dept, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Building className="h-5 w-5 text-gray-400 mr-3" />
                                <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dept.projects}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dept.students}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {dept.faculty}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 mr-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${dept.completion}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-sm text-gray-900">{dept.completion}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(dept.performance)}`}>
                                {dept.performance}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              +{dept.growth}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-2">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Analytics Header */}
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
                    <div className="flex gap-3">
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                        <option>Last 6 months</option>
                        <option>Last year</option>
                      </select>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </button>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-2xl">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-600">94.2%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-2xl">
                      <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-600">4.7</div>
                      <div className="text-sm text-gray-600">Avg Rating</div>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-2xl">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-purple-600">+18%</div>
                      <div className="text-sm text-gray-600">Growth Rate</div>
                    </div>
                    <div className="text-center p-6 bg-orange-50 rounded-2xl">
                      <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-orange-600">89%</div>
                      <div className="text-sm text-gray-600">On-Time Delivery</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* User Activity Chart */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">User Activity Trends</h3>
                    <div className="h-64 flex items-end justify-between space-x-1">
                      {Array.from({ length: 12 }, (_, i) => {
                        const height = Math.floor(Math.random() * 200) + 50;
                        return (
                          <div key={i} className="flex flex-col items-center flex-1">
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-700 hover:from-blue-600 hover:to-blue-400"
                              style={{ height: `${height}px` }}
                            ></div>
                            <div className="mt-2 text-xs text-gray-600">{i + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Project Categories */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Project Categories</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Web Development', value: 35, color: 'bg-blue-500' },
                        { name: 'Mobile Apps', value: 28, color: 'bg-green-500' },
                        { name: 'Machine Learning', value: 22, color: 'bg-purple-500' },
                        { name: 'Data Science', value: 15, color: 'bg-orange-500' }
                      ].map((category, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{category.name}</span>
                            <span className="text-sm text-gray-500">{category.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`${category.color} h-3 rounded-full transition-all duration-700`}
                              style={{ width: `${category.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                        />
                      </div>
                      <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </button>
                      <button 
                        onClick={() => setShowUserModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">User Management Interface</h3>
                    <p className="text-gray-500 mb-6">Comprehensive user management system with role-based access control.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">1,247</div>
                        <div className="text-sm text-gray-600">Students</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">89</div>
                        <div className="text-sm text-gray-600">Faculty</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">12</div>
                        <div className="text-sm text-gray-600">Admins</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">System Maintenance Mode</span>
                            <button className="bg-gray-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                              <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Auto Backup</span>
                            <button className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Email Notifications</span>
                            <button className="bg-blue-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                        <div className="space-y-4">
                          <button className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                            <Shield className="h-5 w-5 text-blue-500 mr-3" />
                            <span className="text-sm font-medium text-gray-900">Configure Security Policies</span>
                            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                          </button>
                          <button className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                            <Database className="h-5 w-5 text-green-500 mr-3" />
                            <span className="text-sm font-medium text-gray-900">Database Management</span>
                            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                          </button>
                          <button className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                            <Globe className="h-5 w-5 text-purple-500 mr-3" />
                            <span className="text-sm font-medium text-gray-900">API Configuration</span>
                            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Computer Science</option>
                    <option>Software Engineering</option>
                    <option>Information Technology</option>
                    <option>Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Web Development</option>
                    <option>Mobile Development</option>
                    <option>Machine Learning</option>
                    <option>Data Science</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Dr. Sarah Johnson</option>
                  <option>Prof. Ahmed Khan</option>
                  <option>Dr. Maria Garcia</option>
                  <option>Dr. John Smith</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add New User</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Student</option>
                    <option value={2}>Teacher</option>
                    <option value={3}>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select 
                    value={newUser.departmentId || ''}
                    onChange={(e) => {
                      const deptId = e.target.value ? Number(e.target.value) : null;
                      const dept = dbDepartments.find(d => d.id === deptId);
                      setNewUser(prev => ({
                        ...prev,
                        department: dept ? dept.name : '',
                        departmentId: deptId
                      }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {dbDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                    {dbDepartments.length === 0 && <option value="">Loading...</option>}
                  </select>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3 mt-4">
                <AlertTriangle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  New users are created with a default password of <span className="font-mono font-bold">DefaultPassword123!</span>. Please instruct them to change it upon first login.
                </p>
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmittingUser}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUser}
                disabled={isSubmittingUser}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmittingUser ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <ChangePasswordModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;