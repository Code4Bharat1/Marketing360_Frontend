'use client';

import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
  User,
  FileText,
  Tag
} from 'lucide-react';
import Sidebar from './sidebar';

export default function EmployeeTasksView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tasks = [
    {
      id: 1,
      title: 'Update Product Inventory for Q3',
      description: 'Verify stock counts for Electronics category and update system accordingly. Check all SKUs and reconcile with physical inventory.',
      priority: 'HIGH',
      priorityColor: 'red',
      dueDate: 'Due Today',
      status: 'todo',
      assignedBy: 'Mark Stone',
      category: 'Inventory Management',
      estimatedTime: '2-3 hours',
      notes: 'Make sure to cross-check with last month\'s report'
    },
    {
      id: 2,
      title: 'Client Meeting Prep - Alpha Corp',
      description: 'Prepare presentation slides and gathering monthly reports. Include Q3 performance metrics and future projections.',
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      dueDate: 'Tomorrow, 10:00 AM',
      status: 'todo',
      assignedBy: 'Sarah Johnson',
      category: 'Client Relations',
      estimatedTime: '1-2 hours',
      notes: 'Focus on cost savings achieved'
    },
    {
      id: 3,
      title: 'Submit Expense Reports',
      description: 'Upload travel receipts from last week\'s site visit. Include hotel, transportation, and meal expenses.',
      priority: 'NORMAL',
      priorityColor: 'blue',
      dueDate: 'Oct 24',
      status: 'todo',
      assignedBy: 'HR Department',
      category: 'Administration',
      estimatedTime: '30 minutes',
      notes: 'Deadline is end of week'
    },
    {
      id: 4,
      title: 'Complete Safety Training Module',
      description: 'Finish online safety certification course and submit completion certificate.',
      priority: 'HIGH',
      priorityColor: 'red',
      dueDate: 'Oct 22',
      status: 'completed',
      assignedBy: 'Safety Team',
      category: 'Training',
      estimatedTime: '1 hour',
      completedDate: 'Oct 20, 2024'
    },
    {
      id: 5,
      title: 'Monthly Sales Report Review',
      description: 'Review and approve monthly sales figures for regional team.',
      priority: 'MEDIUM',
      priorityColor: 'yellow',
      dueDate: 'Oct 18',
      status: 'completed',
      assignedBy: 'Regional Manager',
      category: 'Sales',
      estimatedTime: '45 minutes',
      completedDate: 'Oct 17, 2024'
    }
  ];

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const getPriorityBadgeColor = (color) => {
    const colors = {
      red: 'bg-red-50 text-red-700 border-red-200',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[color] || colors.blue;
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

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
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                My Tasks
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Manage your assigned tasks
              </p>
            </div>

            {/* User Avatar */}
            {/* <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold flex-shrink-0">
              AP
            </div> */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Tasks Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    My Assigned Tasks
                  </h2>
                  {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    VS
                  </div> */}
                </div>
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
                    To Do ({todoTasks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                      activeTab === 'completed'
                        ? 'text-white bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Completed ({completedTasks.length})
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                {(activeTab === 'todo' ? todoTasks : completedTasks).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">No tasks to display</p>
                  </div>
                ) : (
                  (activeTab === 'todo' ? todoTasks : completedTasks).map((task) => (
                    <div
                      key={task.id}
                      className="p-3 sm:p-4 lg:p-5 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                      onClick={() => openTaskModal(task)}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex-1 leading-tight">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold border ${getPriorityBadgeColor(task.priorityColor)} whitespace-nowrap flex-shrink-0`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Task Description */}
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                        {task.description}
                      </p>

                      {/* Task Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {task.status === 'completed' ? `Completed: ${task.completedDate}` : task.dueDate}
                          </span>
                        </div>
                        {task.status === 'todo' && (
                          <button 
                            className="text-xs sm:text-sm text-teal-600 font-medium hover:text-teal-700 text-left sm:text-right whitespace-nowrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle mark as done
                            }}
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
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

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="p-6 space-y-6">
                  {/* Title and Priority */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">
                        {selectedTask.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getPriorityBadgeColor(selectedTask.priorityColor)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedTask.description}
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Due Date */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Due Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTask.dueDate}
                      </p>
                    </div>

                    {/* Estimated Time */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Estimated Time</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTask.estimatedTime}
                      </p>
                    </div>

                    {/* Assigned By */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Assigned By</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTask.assignedBy}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTask.category}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedTask.notes && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-900">
                            {selectedTask.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {selectedTask.status === 'completed' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-semibold text-green-900">
                            Task Completed
                          </p>
                          <p className="text-xs text-green-700">
                            {selectedTask.completedDate}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
                {selectedTask.status === 'todo' && (
                  <button className="flex-1 bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
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