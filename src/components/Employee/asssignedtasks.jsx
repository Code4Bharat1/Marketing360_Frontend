'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
  User,
  FileText,
  Tag,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Sidebar from './sidebar';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Read JWT from localStorage and return header object
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
});

export default function EmployeeTasksView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Tasks state ─────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // ── Mark-done state (tracks which _id is in-flight) ─────────
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  // ── GET /tasks/my-tasks ─────────────────────────────────────
  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);

      const res = await axios.get(`${API_URL}/tasks/my-tasks`, {
        headers: authHeader(),
      });
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      setTasksError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ── PATCH /tasks/:id/status  →  mark as completed ───────────
  const markAsComplete = async (taskId, e) => {
    if (e) e.stopPropagation(); // don't open the modal when clicking the button
    try {
      setUpdatingId(taskId);
      setUpdateError(null);
      const res = await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: 'Completed' },
        { headers: authHeader() }
      );
      if (res.data.success) {
        // Update local state instantly — no full refetch needed
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, status: 'Completed' } : t
          )
        );
        // Sync the open modal if it's showing this task
        if (selectedTask?._id === taskId) {
          setSelectedTask((prev) => ({ ...prev, status: 'Completed' }));
        }
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived lists ───────────────────────────────────────────
  const todoTasks = tasks.filter(
    (t) => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'On Hold'
  );

  const completedTasks = tasks.filter(
    (t) => t.status === 'Completed'
  );

  // ── Helpers ─────────────────────────────────────────────────
  const getPriorityBadgeColor = (priority) => {
    const map = {
      urgent: 'bg-purple-50 text-purple-700 border-purple-200',
      high: 'bg-red-50 text-red-700 border-red-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      low: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return map[priority?.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const formatPriority = (p) =>
    p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '—';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setUpdateError(null);
  };

  const displayedTasks = activeTab === 'todo' ? todoTasks : completedTasks;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage="tasks"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                My Tasks
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Manage your assigned tasks
              </p>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchTasks}
              disabled={tasksLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
              title="Refresh tasks"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${tasksLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">

            {/* Global update error banner */}
            {updateError && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {updateError}
                <button
                  onClick={() => setUpdateError(null)}
                  className="ml-auto p-1 hover:bg-red-100 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  My Assigned Tasks
                </h2>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex min-w-max sm:min-w-0">
                  <button
                    onClick={() => setActiveTab('todo')}
                    className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'todo'
                        ? 'text-white bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    To Do ({tasksLoading ? '…' : todoTasks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'completed'
                        ? 'text-white bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Completed ({tasksLoading ? '…' : completedTasks.length})
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">

                {/* Loading state */}
                {tasksLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    <p className="text-sm">Loading tasks…</p>
                  </div>
                )}

                {/* Error state */}
                {!tasksLoading && tasksError && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <p className="text-sm text-red-600">{tasksError}</p>
                    <button
                      onClick={fetchTasks}
                      className="text-sm text-teal-600 font-medium hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {!tasksLoading && !tasksError && displayedTasks.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">No tasks to display</p>
                  </div>
                )}

                {/* Task rows */}
                {!tasksLoading && !tasksError && displayedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3 sm:p-4 lg:p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                    onClick={() => openTaskModal(task)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex-1 leading-tight">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold border ${getPriorityBadgeColor(task.priority)} whitespace-nowrap flex-shrink-0`}
                      >
                        {formatPriority(task.priority)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {task.status === 'Completed'
                            ? `Completed: ${formatDate(task.completedAt || task.updatedAt)}`
                            : `Due: ${formatDate(task.dueDate)}`}
                        </span>
                      </div>

                      {task.status !== 'Completed' && (
                        <button
                          disabled={updatingId === task._id}
                          onClick={(e) => markAsComplete(task._id, e)}
                          className="flex items-center gap-1 text-xs sm:text-sm text-teal-600 font-medium hover:text-teal-700 disabled:opacity-50 whitespace-nowrap"
                        >
                          {updatingId === task._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Task Detail Modal ─────────────────────────────────── */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">

              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                  Task Details
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="p-6 space-y-6">

                  {/* Title + Priority */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {selectedTask.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityBadgeColor(selectedTask.priority)}`}
                    >
                      {formatPriority(selectedTask.priority)}
                    </span>
                  </div>

                  {/* Description */}
                  {selectedTask.description && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedTask.description}
                      </p>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Due Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(selectedTask.dueDate)}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {selectedTask.status}
                      </p>
                    </div>

                    {selectedTask.assignedBy?.name && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Assigned By</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.assignedBy.name}
                        </p>
                      </div>
                    )}

                    {selectedTask.category && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.category}
                        </p>
                      </div>
                    )}

                    {selectedTask.estimatedTime && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-teal-600" />
                          <span className="text-xs font-semibold text-gray-500 uppercase">Estimated Time</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedTask.estimatedTime}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Completed banner */}
                  {selectedTask.status === 'Completed' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">Task Completed</p>
                          <p className="text-xs text-green-700">
                            {formatDate(selectedTask.completedAt || selectedTask.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline update error */}
                  {updateError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {updateError}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
                {selectedTask.status !== 'Completed' && (
                  <button
                    disabled={updatingId === selectedTask._id}
                    onClick={(e) => markAsComplete(selectedTask._id, e)}
                    className="flex-1 bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updatingId === selectedTask._id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Mark as Complete
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="flex-1 sm:flex-initial bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}