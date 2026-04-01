import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import rankingService from '../../services/rankingService';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import {
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  Clock,
  Star,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
  GraduationCap,
  Target,
  Lightbulb,
  ChartBar,
  Trophy,
  ChevronRight,
  Search,
  Bell,
  MoreVertical,
  ArrowRight,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [currentFYPs, setCurrentFYPs] = useState([]);
  const [completedFYPs, setCompletedFYPs] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [researchInsights, setResearchInsights] = useState([]);
  const [categories, setCategories] = useState([
    'Machine Learning',
    'Web Development',
    'Mobile Development',
    'IoT',
    'Blockchain',
    'Data Science',
    'Cybersecurity',
    'Cloud Computing',
    'Artificial Intelligence',
    'Game Development',
    'AR/VR',
    'Natural Language Processing',
    'DevOps'
  ]);
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Computer Science' },
    { id: 2, name: 'Software Engineering' },
    { id: 3, name: 'Information Technology' },
    { id: 4, name: 'Data Science' },
    { id: 5, name: 'Cybersecurity' }
  ]);
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Machine Learning',
    departmentId: 1,
    year: new Date().getFullYear(),
    semester: 'Fall 2024',
    description: '',
    objective: '',
    expectedOutcomes: '',
    studentLimit: 3,
    documentUrl: '',
    sourceCodeUrl: ''
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProjectForAssign, setSelectedProjectForAssign] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Manage FYP Modal (status update + student details + progress)
  const [showManageModal, setShowManageModal] = useState(false);
  const [managedProject, setManagedProject] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageForm, setManageForm] = useState({
    status: 'In Progress',
    progressNote: '',
    progressPercent: 0,
    studentDetails: [{ name: '', course: '' }]
  });

  const toggleStudent = (studentId) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    try {
      await projectService.updateProject(selectedProjectForAssign.id, {
        studentIds: selectedStudentIds
      });
      toast.success('Students assigned successfully! Project is now In Progress.');
      setShowAssignModal(false);
      setSelectedStudentIds([]);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('Failed to assign students');
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const projects = await rankingService.getTeacherProjects(user.id || user._id);
      
      const current = projects.filter(p => p.status === 'In Progress' || p.status === 'Active' || p.status === 'Review Required' || p.status === 'Proposed');
      const completed = projects.filter(p => p.status === 'Completed');
      
      setCurrentFYPs(current);
      setCompletedFYPs(completed);

      const currentYear = new Date().getFullYear();
      let sFYPs = projects.length;
      let aStudents = projects.reduce((acc, p) => acc + (p.students?.length || 0), 0);
      let cFYPs = completed.length;
      let sRate = projects.length > 0 ? Math.round((completed.length / projects.length) * 100) : 0;

      setStatsData([
        { name: 'Supervised FYPs', value: sFYPs.toString(), icon: BookOpen, color: 'bg-blue-500', change: `+${current.length} active`, trend: 'up' },
        { name: 'Active Students', value: aStudents.toString(), icon: Users, color: 'bg-green-500', change: `${current.length} teams`, trend: 'up' },
        { name: 'Completed FYPs', value: cFYPs.toString(), icon: CheckCircle, color: 'bg-purple-500', change: 'Lifetime', trend: 'up' },
        { name: 'Success Rate', value: `${sRate}%`, icon: TrendingUp, color: 'bg-orange-500', change: 'Graduated', trend: 'up' },
      ]);

      setUpcomingMeetings([
        { id: 1, title: 'Weekly Progress Review', time: '10:00 AM', date: 'Today', students: ['Team Alpha'], type: 'progress', duration: '1 hour', agenda: ['Updates'] },
        { id: 2, title: 'Technical Discussion', time: '2:00 PM', date: 'Tomorrow', students: ['Team Beta'], type: 'technical', duration: '45 mins', agenda: ['Review'] }
      ]);

      setResearchInsights([
        { category: 'Machine Learning', projects: 12, avgGrade: 'A', successRate: '92%', trendingTopics: ['NLP', 'CV'], challenges: ['Data quality'] },
        { category: 'Web Development', projects: 8, avgGrade: 'A-', successRate: '88%', trendingTopics: ['React', 'Node'], challenges: ['Security'] }
      ]);

    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error);
      toast.error('Could not connect to backend. Please check your server status.');
      setCurrentFYPs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [cats, depts, students] = await Promise.all([
        projectService.getProjectCategories(),
        projectService.getDepartments(),
        projectService.getStudents()
      ]);
      
      if (cats && cats.length > 0) {
        const apiCatNames = cats.map(c => c.name);
        setCategories(apiCatNames);
        setNewProject(prev => ({ ...prev, category: apiCatNames[0] }));
      }
      
      if (depts && depts.length > 0) {
        setDepartments(depts);
        const userDeptId = user.departmentId || depts[0].id;
        setNewProject(prev => ({ ...prev, departmentId: userDeptId }));
      }

      if (students && students.length > 0) {
        setAllStudents(students);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchOptions();
    }
  }, [user]);

  const handleProposeFYP = async (e) => {
    e?.preventDefault();
    if (!newProject.title || !newProject.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const projectData = {
        ...newProject,
        supervisorId: user.id || user._id,
        year: parseInt(newProject.year)
      };

      await projectService.createProject(projectData);
      toast.success('FYP Proposal submitted successfully!');
      setShowCreateModal(false);
      
      // Reset form
      setNewProject({
        title: '',
        description: '',
        category: categories[0] || '',
        departmentId: user?.departmentId || (departments[0]?.id || ''),
        year: new Date().getFullYear(),
        semester: 'Fall',
        difficultyLevel: 'Medium',
        studentIds: [],
        documentUrl: '',
        sourceCodeUrl: ''
      });

      // Refresh project list
      // fetchDashboardData is inside useEffect, we should probably extract it or just reload
      window.location.reload(); 
    } catch (error) {
      console.error('Error proposing FYP:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Review Required': return 'bg-orange-100 text-orange-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Proposed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Open manage modal for a project
  const openManageModal = (project) => {
    setManagedProject(project);
    setManageForm({
      status: project.status === 'Proposed' ? 'In Progress' : project.status,
      progressNote: '',
      progressPercent: project.progress || 0,
      studentDetails: (project.students && project.students.length > 0)
        ? project.students.map(s => ({ name: typeof s === 'string' ? s : (s.name || ''), course: s.course || '' }))
        : [{ name: '', course: '' }]
    });
    setShowManageModal(true);
  };

  const addStudentRow = () => {
    setManageForm(prev => ({
      ...prev,
      studentDetails: [...prev.studentDetails, { name: '', course: '' }]
    }));
  };

  const removeStudentRow = (index) => {
    setManageForm(prev => ({
      ...prev,
      studentDetails: prev.studentDetails.filter((_, i) => i !== index)
    }));
  };

  const updateStudentDetail = (index, field, value) => {
    setManageForm(prev => {
      const updated = [...prev.studentDetails];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, studentDetails: updated };
    });
  };

  const handleManageFYP = async () => {
    if (!managedProject) return;
    const validStudents = manageForm.studentDetails.filter(s => s.name.trim());
    if (validStudents.length === 0) {
      toast.error('Please add at least one student name');
      return;
    }
    try {
      setManageLoading(true);
      const payload = {
        status: manageForm.status,
        progress: parseInt(manageForm.progressPercent) || 0,
        progressNote: manageForm.progressNote,
        students: validStudents.map(s => s.name),
        studentDetails: validStudents
      };
      await projectService.updateProject(managedProject.id, payload);
      toast.success(
        manageForm.status === 'In Progress'
          ? '🚀 FYP moved to In Progress with student details saved!'
          : 'FYP details updated successfully!'
      );
      setShowManageModal(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('Failed to update FYP. Please try again.');
    } finally {
      setManageLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                  Welcome, Prof. {user?.lastName}! 👨‍🏫
                </h1>
                <p className="text-xl text-gray-600">
                  Supervise and track FYP progress with comprehensive analytics and insights.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center group"
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Propose New FYP
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
            {statsData.map((item) => (
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
                  { id: 'overview', name: 'Overview', icon: Activity },
                  { id: 'current', name: 'Current FYPs', icon: BookOpen },
                  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
                  { id: 'history', name: 'Completed FYPs', icon: CheckCircle },
                  { id: 'meetings', name: 'Meetings', icon: Calendar }
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
                  {/* Current FYPs Overview */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Current FYPs</h2>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          View All →
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {currentFYPs.slice(0, 3).map((project) => (
                        <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 
                                className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => navigate(`/project/${project.id}`)}
                              >
                                {project.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{project.students?.join(', ') || 'No students assigned'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(project.riskLevel)}`}>
                                {project.riskLevel} risk
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Next meeting: {project.nextMeeting}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(project.grade)}`}>
                                Current: {project.grade}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(project.expectedGrade)}`}>
                                Expected: {project.expectedGrade}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Research Insights */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Research Domain Insights</h3>
                    <div className="space-y-6">
                      {researchInsights.map((domain, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{domain.category}</h4>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">{domain.projects} projects</span>
                              <span className="text-green-600 font-medium">{domain.successRate}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Trending Topics</p>
                              <div className="flex flex-wrap gap-1">
                                {domain.trendingTopics.map((topic, i) => (
                                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Common Challenges</p>
                              <div className="text-xs text-gray-500">
                                {domain.challenges.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Upcoming Meetings */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Upcoming Meetings</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {upcomingMeetings.map((meeting) => (
                          <div key={meeting.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm">{meeting.title}</h4>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {meeting.date} at {meeting.time}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Duration: {meeting.duration}
                              </div>
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {meeting.students?.join(', ') || 'No students'}
                              </div>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">Agenda: {meeting.agenda.slice(0, 2).join(', ')}</p>
                            </div>
                          </div>
                        ))}
                        <button className="w-full text-center py-3 text-blue-600 hover:text-blue-800 text-sm font-semibold hover:bg-blue-50 rounded-lg transition-colors">
                          Schedule New Meeting →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <button
                          onClick={() => navigate('/teacher/ranking-management')}
                          className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:border-blue-300 group hover:shadow-md"
                        >
                          <Trophy className="h-5 w-5 text-blue-500 mr-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
                          <div className="text-left">
                            <span className="text-sm font-semibold text-gray-900 block">Manage Rankings</span>
                            <span className="text-xs text-gray-600">Evaluate & rank projects</span>
                          </div>
                        </button>
                        <button
                          onClick={() => navigate('/rankings')}
                          className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 hover:border-purple-300 group hover:shadow-md"
                        >
                          <BarChart3 className="h-5 w-5 text-purple-500 mr-3 group-hover:scale-110 transition-all duration-300" />
                          <div className="text-left">
                            <span className="text-sm font-semibold text-gray-900 block">View Department Rankings</span>
                            <span className="text-xs text-gray-600">Compare across departments</span>
                          </div>
                        </button>
                        <button className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:border-green-300 group hover:shadow-md">
                          <FileText className="h-5 w-5 text-green-500 mr-3 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <span className="text-sm font-semibold text-gray-900 block">Review Submissions</span>
                            <span className="text-xs text-gray-600">Check pending reviews</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => setShowCreateModal(true)}
                          className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200 hover:border-orange-300 group hover:shadow-md"
                        >
                          <Lightbulb className="h-5 w-5 text-orange-500 mr-3 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <span className="text-sm font-semibold text-gray-900 block">Suggest FYP Ideas</span>
                            <span className="text-xs text-gray-600">Create project proposals</span>
                          </div>
                        </button>
                        <button className="w-full flex items-center p-4 border border-gray-300 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 hover:border-indigo-300 group hover:shadow-md">
                          <Download className="h-5 w-5 text-indigo-500 mr-3 group-hover:scale-110 transition-transform" />
                          <div className="text-left">
                            <span className="text-sm font-semibold text-gray-900 block">Generate Reports</span>
                            <span className="text-xs text-gray-600">Export performance data</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'current' && (
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Current FYPs ({currentFYPs.length})</h2>
                    <div className="flex gap-3">
                      <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </button>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New FYP
                      </button>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {currentFYPs.map((project) => (
                    <div key={project.id} className="p-8 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 
                              className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                              onClick={() => navigate(`/project/${project.id}`)}
                            >
                              {project.title}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(project.riskLevel)}`}>
                              {project.riskLevel} risk
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-4">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="font-medium">Team:</span>
                            <span className="ml-1">{project.students?.join(', ') || 'No students assigned'}</span>
                            <span className="mx-3">•</span>
                            <GraduationCap className="h-4 w-4 mr-1" />
                            <span>{project.semester}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openManageModal(project)}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm ${
                              project.status === 'Proposed'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            }`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {project.status === 'Proposed' ? 'Set Up FYP' : 'Manage'}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" onClick={() => navigate(`/project/${project.id}`)}>
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-500 transition-colors">
                            <MessageSquare className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Progress</div>
                          <div className="flex items-center">
                            <div className="flex-1 mr-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{project.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Current Grade</div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(project.grade)}`}>
                              {project.grade}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(project.expectedGrade)}`}>
                              {project.expectedGrade}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Next Meeting</div>
                          <div className="text-sm font-medium text-gray-900">
                            {project.nextMeeting}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Recent Submissions</div>
                          <div className="space-y-1">
                            {project.recentSubmissions?.map((submission, i) => (
                              <div key={i} className="flex items-center text-sm text-gray-700">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                {submission}
                              </div>
                            )) || <p className="text-xs text-gray-500">No recent submissions</p>}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Current Challenges</div>
                          <div className="space-y-1">
                            {project.challenges?.map((challenge, i) => (
                              <div key={i} className="flex items-center text-sm text-gray-700">
                                <AlertCircle className="h-3 w-3 text-orange-500 mr-2" />
                                {challenge}
                              </div>
                            )) || <p className="text-xs text-gray-500">No active challenges</p>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <span>Last updated: {project.lastUpdate}</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {project.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Success Rate Analytics */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Success Rate by Category</h3>
                    <div className="space-y-4">
                      {[
                        { category: 'Machine Learning', rate: 95, projects: 18, avgGrade: 'A-' },
                        { category: 'Web Development', rate: 92, projects: 24, avgGrade: 'A' },
                        { category: 'IoT & Embedded', rate: 90, projects: 15, avgGrade: 'A-' },
                        { category: 'Mobile Development', rate: 88, projects: 12, avgGrade: 'B+' }
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{item.category}</span>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">{item.projects} projects</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(item.avgGrade)}`}>
                                Avg: {item.avgGrade}
                              </span>
                              <span className="text-green-600 font-medium">{item.rate}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700"
                              style={{ width: `${item.rate}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Performance */}
                  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Student Performance Distribution</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <div className="text-2xl font-bold text-green-600">A+ & A</div>
                          <div className="text-sm text-gray-600">68% of students</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600">A- & B+</div>
                          <div className="text-sm text-gray-600">26% of students</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { grade: 'A+', count: 28, percentage: 39 },
                          { grade: 'A', count: 21, percentage: 29 },
                          { grade: 'A-', count: 12, percentage: 17 },
                          { grade: 'B+', count: 7, percentage: 10 },
                          { grade: 'B', count: 4, percentage: 5 }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className={`px-3 py-1 rounded font-medium text-sm ${getGradeColor(item.grade)}`}>
                                {item.grade}
                              </span>
                              <span className="ml-3 text-sm text-gray-600">{item.count} students</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yearly Trends */}
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Supervision Trends Over Years</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {[
                      { year: '2020', projects: 8, success: 85 },
                      { year: '2021', projects: 12, success: 88 },
                      { year: '2022', projects: 15, success: 91 },
                      { year: '2023', projects: 18, success: 93 },
                      { year: '2024', projects: 22, success: 95 }
                    ].map((item, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-blue-500 rounded-t transition-all duration-700 hover:bg-blue-600"
                            style={{ height: `${(item.projects / 25) * 200}px` }}
                          ></div>
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                            {item.projects}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">{item.year}</div>
                        <div className="text-xs text-green-600 font-medium">{item.success}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Projects supervised per year with success rates
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Completed FYPs ({completedFYPs.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {completedFYPs.map((project) => (
                    <div key={project.id} className="p-8 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 
                            className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={() => navigate(`/project/${project.id}`)}
                          >
                            {project.title}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-3">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="font-medium">Students:</span>
                            <span className="ml-1">{project.students.join(', ')}</span>
                            <span className="mx-3">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{project.semester} {project.year}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(project.finalGrade)}`}>
                            {project.finalGrade}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            project.impact === 'High' ? 'bg-green-100 text-green-800' :
                            project.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.impact} Impact
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-gray-600 mb-2">Outcome & Impact</div>
                          <p className="text-sm text-gray-700">{project.outcome}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Citations</div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{project.citations}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">Category</div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {project.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Meeting Schedule</h2>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="p-8 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {meeting.title}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{meeting.date} at {meeting.time}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Duration: {meeting.duration}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>Attendees: {meeting.students.join(', ')}</span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="text-sm text-gray-600 mb-1">Agenda:</div>
                              <ul className="text-sm text-gray-700 space-y-1">
                                {meeting.agenda.map((item, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              meeting.type === 'progress' ? 'bg-blue-100 text-blue-800' :
                              meeting.type === 'technical' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {meeting.type}
                            </span>
                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                              <Edit className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create FYP Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Propose New FYP</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FYP Title *</label>
                <input 
                  type="text" 
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select 
                    value={newProject.category}
                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select 
                    value={newProject.departmentId}
                    onChange={(e) => setNewProject({...newProject, departmentId: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <input 
                    type="number" 
                    value={newProject.year}
                    onChange={(e) => setNewProject({...newProject, year: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Semester *</label>
                  <select 
                    value={newProject.semester}
                    onChange={(e) => setNewProject({...newProject, semester: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select 
                  value={newProject.difficultyLevel}
                  onChange={(e) => setNewProject({...newProject, difficultyLevel: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea 
                  rows="3" 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the project goal and scope"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document URL (Optional)</label>
                  <input 
                    type="url" 
                    value={newProject.documentUrl}
                    onChange={(e) => setNewProject({...newProject, documentUrl: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Link to project proposal/doc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source Code URL (Optional)</label>
                  <input 
                    type="url" 
                    value={newProject.sourceCodeUrl}
                    onChange={(e) => setNewProject({...newProject, sourceCodeUrl: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Link to repository"
                  />
                </div>
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
                onClick={handleProposeFYP}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Propose FYP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage FYP Modal — Status Update, Student Details, Progress */}
      {showManageModal && managedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto animate-slide-up shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className={`px-8 py-6 ${
              managedProject.status === 'Proposed'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}>
              <h3 className="text-2xl font-bold text-white mb-1">
                {managedProject.status === 'Proposed' ? '🚀 Set Up FYP Project' : '⚙️ Manage FYP'}
              </h3>
              <p className="text-white/80 text-sm">{managedProject.title}</p>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Update */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
                  Update Status
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {['Proposed', 'In Progress', 'Review Required'].map(s => (
                    <button
                      key={s}
                      onClick={() => setManageForm(prev => ({ ...prev, status: s }))}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                        manageForm.status === s
                          ? s === 'In Progress' ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : s === 'Review Required' ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {managedProject.status === 'Proposed' && manageForm.status === 'In Progress' && (
                  <p className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    ✅ This will move the FYP from <strong>Proposed</strong> to <strong>In Progress</strong>.
                  </p>
                )}
              </div>

              {/* Student Details */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-gray-900 flex items-center">
                    <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
                    Student Details
                  </h4>
                  <button
                    onClick={addStudentRow}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Student
                  </button>
                </div>
                <div className="space-y-3">
                  {manageForm.studentDetails.map((student, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        placeholder="Student full name *"
                        value={student.name}
                        onChange={(e) => updateStudentDetail(index, 'name', e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Course / Program (e.g. BSCS)"
                        value={student.course}
                        onChange={(e) => updateStudentDetail(index, 'course', e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {manageForm.studentDetails.length > 1 && (
                        <button
                          onClick={() => removeStudentRow(index)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">* At least one student name is required to proceed.</p>
              </div>

              {/* Progress */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
                  Progress Update
                </h4>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Completion %</label>
                    <span className="text-lg font-bold text-blue-600">{manageForm.progressPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={manageForm.progressPercent}
                    onChange={(e) => setManageForm(prev => ({ ...prev, progressPercent: e.target.value }))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${manageForm.progressPercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Progress Note (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Describe what has been accomplished, milestones reached, or next steps..."
                    value={manageForm.progressNote}
                    onChange={(e) => setManageForm(prev => ({ ...prev, progressNote: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button
                onClick={() => setShowManageModal(false)}
                className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                disabled={manageLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleManageFYP}
                disabled={manageLoading}
                className={`flex-2 px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg disabled:opacity-50 ${
                  managedProject.status === 'Proposed'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {manageLoading ? (
                  <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>Saving...</span>
                ) : managedProject.status === 'Proposed' ? '🚀 Start FYP & Save Details' : '💾 Save Changes'}
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

export default TeacherDashboard;