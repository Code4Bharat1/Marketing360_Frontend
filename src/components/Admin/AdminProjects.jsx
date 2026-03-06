'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from './Admimsidebar';
import {
  IoAddCircleOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoEllipsisVertical,
  IoCalendarOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTrendingUp,
} from 'react-icons/io5';
import { BiDownload, BiRefresh } from 'react-icons/bi';
import projectService from '@/services/projectService';
import ProjectModal from './ProjectModal';
import ProjectDetailsModal from './ProjectDetails';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    onHold: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, [filterStatus, filterPriority]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterPriority) filters.priority = filterPriority;
      if (searchQuery) filters.search = searchQuery;

      const response = await projectService.getProjects(filters);
      setProjects(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const active = response.data.filter(p => p.status === 'In Progress').length;
      const completed = response.data.filter(p => p.status === 'Completed').length;
      const onHold = response.data.filter(p => p.status === 'On Hold').length;
      
      setStats({ total, active, completed, onHold });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProjects();
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
    setShowMenu(null);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
    setShowMenu(null);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
    setShowMenu(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-green-100 text-green-700',
      'On Hold': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-teal-100 text-teal-700',
      'Cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'text-slate-600',
      'Medium': 'text-blue-600',
      'High': 'text-orange-600',
      'Critical': 'text-red-600',
    };
    return colors[priority] || 'text-slate-600';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-black">
      <AdminSidebar />

      <div className="flex-1 ">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Projects
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Manage and track all projects
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchProjects()}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <BiRefresh className="w-5 h-5 text-slate-600" />
                </button>
                {/* <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <BiDownload className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline">Export</span>
                </button> */}
                <button
                  onClick={handleCreateProject}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <IoAddCircleOutline className="w-5 h-5" />
                  <span className="text-sm font-medium">New Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IoBriefcaseOutline className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</h3>
              <p className="text-sm text-slate-600">Total Projects</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <IoTrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.active}</h3>
              <p className="text-sm text-slate-600">Active Projects</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <IoCheckmarkCircle className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.completed}</h3>
              <p className="text-sm text-slate-600">Completed</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <IoAlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.onHold}</h3>
              <p className="text-sm text-slate-600">On Hold</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <IoBriefcaseOutline className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Found</h3>
              <p className="text-slate-600 mb-6">Get started by creating your first project.</p>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center gap-2"
              >
                <IoAddCircleOutline className="w-5 h-5" />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(project)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black mb-1 line-clamp-1">
                        {project.name}
                      </h3>
                      {project.client && (
                        <p className="text-sm text-slate-600 mb-2">
                          Client: {project.client}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === project._id ? null : project._id);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <IoEllipsisVertical className="w-5 h-5 text-slate-600" />
                      </button>

                      {showMenu === project._id && (
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(project);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Edit Project
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project._id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority} Priority
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <IoCalendarOutline className="w-4 h-4" />
                      <span>
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <IoPeopleOutline className="w-4 h-4" />
                      <span>{project.assignedEmployees?.length || 0} Team Members</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <IoTimeOutline className="w-4 h-4" />
                      <span>{project.estimatedHours || 0} Hours Estimated</span>
                    </div>
                  </div>

                  {/* Project Manager */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {project.projectManager?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Project Manager</p>
                        <p className="text-sm font-medium text-slate-900">
                          {project.projectManager?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProjectModal && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => {
            setShowProjectModal(false);
            fetchProjects();
          }}
        />
      )}

      {showDetailsModal && selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setShowDetailsModal(false);
            handleEditProject(selectedProject);
          }}
        />
      )}
    </div>
  );
}