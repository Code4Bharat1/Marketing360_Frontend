'use client';

import { useState, useEffect } from 'react';
import {
  IoClose,
  IoCalendarOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoCashOutline,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoPencilOutline,
} from 'react-icons/io5';
import projectService from '@/services/projectService';

export default function ProjectDetailsModal({ project, onClose, onEdit }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (project?._id) {
      fetchProjectDetails();
    }
  }, [project]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(project._id);
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-blue-100 text-blue-700 border-blue-200',
      'In Progress': 'bg-green-100 text-green-700 border-green-200',
      'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Completed': 'bg-teal-100 text-teal-700 border-teal-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-black mb-2">{project.name}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                  {project.priority} Priority
                </span>
                {project.client && (
                  <span className="text-sm text-slate-600">
                    Client: <span className="font-medium text-slate-900">{project.client}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IoPencilOutline className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <IoClose className="w-6 h-6 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('team')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'team'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Team ({project.assignedEmployees?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'statistics'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Statistics
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed">{project.description}</p>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IoCalendarOutline className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Start Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(project.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <IoCalendarOutline className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">End Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(project.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {project.completedDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Completed Date</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(project.completedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget & Resources */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Resources</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <IoCashOutline className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Budget</p>
                        <p className="text-sm font-medium text-slate-900">
                          ${project.budget?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <IoTimeOutline className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Estimated Hours</p>
                        <p className="text-sm font-medium text-slate-900">
                          {project.estimatedHours || 0} hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <IoPeopleOutline className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Team Size</p>
                        <p className="text-sm font-medium text-slate-900">
                          {project.assignedEmployees?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Manager */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Project Manager</h3>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                    {project.projectManager?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{project.projectManager?.name}</p>
                    <p className="text-sm text-slate-600">{project.projectManager?.email}</p>
                    {project.projectManager?.department && (
                      <p className="text-xs text-slate-500 mt-0.5">{project.projectManager.department}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {project.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Additional Notes</h3>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {project.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-3">
              {project.assignedEmployees && project.assignedEmployees.length > 0 ? (
                project.assignedEmployees.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {assignment.employee?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{assignment.employee?.name}</p>
                        <p className="text-sm text-slate-600">{assignment.employee?.email}</p>
                        {assignment.employee?.department && (
                          <p className="text-xs text-slate-500 mt-0.5">{assignment.employee.department}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-teal-600">{assignment.role}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {assignment.allocatedHours || 0} hours allocated
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Since {new Date(assignment.assignedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <IoPeopleOutline className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No team members assigned yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : statistics ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-900">Total Hours</p>
                        <IoTimeOutline className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {statistics.totalHoursSpent || 0}h
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        of {statistics.estimatedHours || 0}h estimated
                      </p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-green-900">Completion</p>
                        <IoTrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {statistics.completionPercentage || 0}%
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {statistics.hoursRemaining || 0}h remaining
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-900">Time Logs</p>
                        <IoCheckmarkCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {statistics.totalApprovedLogs || 0}
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        {statistics.pendingLogsCount || 0} pending
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                      <span className="text-sm font-semibold text-teal-600">
                        {statistics.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
                        style={{ width: `${Math.min(statistics.completionPercentage || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <IoAlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No statistics available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
          >
            <IoPencilOutline className="w-4 h-4" />
            Edit Project
          </button>
        </div>
      </div>
    </div>
  );
}