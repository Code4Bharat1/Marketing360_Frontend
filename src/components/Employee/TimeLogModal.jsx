'use client';

import { useState } from 'react';
import { IoClose, IoCalendarOutline, IoTimeOutline, IoAlertCircle } from 'react-icons/io5';
import projectTimeLogService from '@/services/projectTimeLogService';

export default function TimeLogModal({ project, employeeId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursSpent: '',
    taskType: 'Development',
    description: '',
  });
  const [errors, setErrors] = useState({});

  // // DEBUG: Check if employeeId is received
  // console.log('TimeLogModal - employeeId:', employeeId);
  // console.log('TimeLogModal - project:', project);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setError('');
  };

  const validate = () => {
    const newErrors = {};

    // IMPORTANT: Check if employeeId exists
    if (!employeeId) {
      setError('Employee ID is missing. Please refresh and try again.');
      return false;
    }

    if (!formData.hoursSpent) {
      newErrors.hoursSpent = 'Hours spent is required';
    } else if (formData.hoursSpent <= 0 || formData.hoursSpent > 24) {
      newErrors.hoursSpent = 'Hours must be between 0 and 24';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setError('');

      const submitData = {
        project: project._id,
        employee: employeeId, // Make sure this is being sent
        date: formData.date,
        hoursSpent: Number(formData.hoursSpent),
        taskType: formData.taskType,
        description: formData.description,
      };

      console.log('Submitting time log data:', submitData);

      const response = await projectTimeLogService.createTimeLog(submitData);
      console.log('Time log created successfully:', response);
      
      onSuccess();
    } catch (error) {
      console.error('Error creating time log:', error);
      const errorMessage = error.response?.data?.message || 'Error creating time log';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show error if no employeeId
  if (!employeeId) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-start gap-3 mb-4">
            <IoAlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Error</h3>
              <p className="text-sm text-slate-600 mt-1">
                Employee ID is missing. Please refresh the page and try again.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Log Time</h2>
            <p className="text-sm text-slate-600 mt-1">{project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IoClose className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <IoAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <IoCalendarOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hours Spent *
              </label>
              <div className="relative">
                <IoTimeOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  name="hoursSpent"
                  value={formData.hoursSpent}
                  onChange={handleChange}
                  min="0.5"
                  max="24"
                  step="0.5"
                  className={`w-full pl-10 pr-4 py-2.5 border ${
                    errors.hoursSpent ? 'border-red-500' : 'border-slate-200'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  placeholder="e.g., 8"
                />
              </div>
              {errors.hoursSpent && (
                <p className="text-sm text-red-600 mt-1">{errors.hoursSpent}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Type *
              </label>
              <select
                name="taskType"
                value={formData.taskType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Testing">Testing</option>
                <option value="Bug Fix">Bug Fix</option>
                <option value="Documentation">Documentation</option>
                <option value="Meeting">Meeting</option>
                <option value="Planning">Planning</option>
                <option value="Review">Review</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-2.5 border ${
                  errors.description ? 'border-red-500' : 'border-slate-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
                placeholder="Describe what you worked on..."
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Time Log'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}