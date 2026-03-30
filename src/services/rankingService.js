import api from './api';

class RankingService {
  // Get department-wise rankings for a specific year
  async getDepartmentRankings(departmentId, year, semester = null) {
    try {
      const params = { year, semester };
      const response = await api.get(`/rankings/department/${departmentId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department rankings:', error);
      throw error;
    }
  }

  // Get all departments with their top projects for a year
  async getAllDepartmentRankings(year, semester = null) {
    try {
      const params = { year, semester };
      const response = await api.get('/rankings/all-departments', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all department rankings:', error);
      throw error;
    }
  }

  // Get yearly rankings across all departments
  async getYearlyRankings(year, semester = null, limit = 50) {
    try {
      const params = { year, semester, limit };
      const response = await api.get('/rankings/yearly', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching yearly rankings:', error);
      throw error;
    }
  }

  // Search projects with various filters
  async searchProjects(filters) {
    try {
      const response = await api.get('/projects/search', { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  }

  // Get available years for filtering
  async getAvailableYears() {
    try {
      const response = await api.get('/projects/years');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available years:', error);
      // Fallback years if API fails
      return [2024, 2023, 2022, 2021, 2020];
    }
  }

  // Get departments list
  async getDepartments() {
    try {
      const response = await api.get('/department');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      return [];
    }
  }

  // Get project categories
  async getProjectCategories() {
    try {
      const response = await api.get('/projects/categories');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project categories:', error);
      return [];
    }
  }

  // Teacher-specific methods
  async getTeacherProjects(teacherId, filters = {}) {
    try {
      const response = await api.get(`/projects/teacher/${teacherId}`, { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching teacher projects:', error);
      throw error;
    }
  }

  async submitProjectEvaluation(projectId, evaluation) {
    try {
      const response = await api.post(`/projects/${projectId}/evaluate`, evaluation);
      return response.data;
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      throw error;
    }
  }

  async updateProjectRanking(projectId, rankingData) {
    try {
      const response = await api.post(`/projects/${projectId}/ranking`, rankingData);
      return response.data;
    } catch (error) {
      console.error('Error updating project ranking:', error);
      throw error;
    }
  }

  // Get ranking statistics
  async getRankingStats(year, semester = null) {
    try {
      const params = { year, semester };
      const response = await api.get('/projects/rankings/stats', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching ranking stats:', error);
      throw error;
    }
  }

  // Calculate performance score client-side (for preview)
  calculatePerformanceScore(project) {
    const weights = {
      grade_points: 0.30,
      innovation_score: 0.20,
      implementation_quality: 0.20,
      documentation_quality: 0.10,
      presentation_score: 0.10,
      citations: 0.05,
      industry_adoption: 0.05
    };

    const {
      grade_points = 0,
      innovation_score = 0,
      implementation_quality = 0,
      documentation_quality = 0,
      presentation_score = 0,
      citations = 0,
      industry_adoption = false
    } = project;

    const normalizedCitations = Math.min(citations / 10, 1);
    const adoptionBonus = industry_adoption ? 1 : 0;

    return Math.round((
      (grade_points / 4.0) * weights.grade_points +
      (innovation_score / 10) * weights.innovation_score +
      (implementation_quality / 10) * weights.implementation_quality +
      (documentation_quality / 10) * weights.documentation_quality +
      (presentation_score / 10) * weights.presentation_score +
      normalizedCitations * weights.citations +
      adoptionBonus * weights.industry_adoption
    ) * 100);
  }
}

export default new RankingService();