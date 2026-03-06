'use client';

import {
  IoClose,
  IoCalendarOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoAlertCircle,
} from 'react-icons/io5';

export default function TimeLogDetailsModal({ timeLog, onClose }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getTaskTypeColor = (taskType) => {
    const colors = {
      Development: 'bg-blue-100 text-blue-700',
      Design: 'bg-purple-100 text-purple-700',
      Testing: 'bg-orange-100 text-orange-700',
      'Bug Fix': 'bg-red-100 text-red-700',
      Documentation: 'bg-slate-100 text-slate-700',
      Meeting: 'bg-teal-100 text-teal-700',
      Planning: 'bg-indigo-100 text-indigo-700',
      Review: 'bg-pink-100 text-pink-700',
      Other: 'bg-gray-100 text-gray-700',
    };
    return colors[taskType] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Time Log Details</h2>
            <p className="text-sm text-slate-600 mt-1">
              Submitted on {new Date(timeLog.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IoClose className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(timeLog.status)}`}>
                {timeLog.status === 'pending' && (
                  <IoAlertCircle className="inline w-4 h-4 mr-2" />
                )}
                {timeLog.status === 'approved' && (
                  <IoCheckmarkCircle className="inline w-4 h-4 mr-2" />
                )}
                {timeLog.status === 'rejected' && (
                  <IoCloseCircle className="inline w-4 h-4 mr-2" />
                )}
                {timeLog.status.charAt(0).toUpperCase() + timeLog.status.slice(1)}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTaskTypeColor(timeLog.taskType)}`}>
                {timeLog.taskType}
              </span>
            </div>

            {/* Employee Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <IoPersonOutline className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Employee Information</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {timeLog.employee?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{timeLog.employee?.name}</p>
                  <p className="text-sm text-slate-600">{timeLog.employee?.email}</p>
                  {timeLog.employee?.department && (
                    <p className="text-xs text-slate-500 mt-0.5">{timeLog.employee.department}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <IoBriefcaseOutline className="w-5 h-5 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Project Information</h3>
              </div>
              <div>
                <p className="font-medium text-slate-900">{timeLog.project?.name}</p>
                {timeLog.project?.client && (
                  <p className="text-sm text-slate-600 mt-1">Client: {timeLog.project.client}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Status: <span className="font-medium">{timeLog.project?.status}</span>
                </p>
              </div>
            </div>

            {/* Time Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IoCalendarOutline className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Date</span>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {new Date(timeLog.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IoTimeOutline className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Hours Spent</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {timeLog.hoursSpent} hours
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Work Description</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {timeLog.description}
                </p>
              </div>
            </div>

            {/* Approval/Rejection Info */}
            {timeLog.status !== 'pending' && (
              <div className={`rounded-lg p-4 border ${
                timeLog.status === 'approved' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {timeLog.status === 'approved' ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <IoCloseCircle className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className={`text-sm font-semibold ${
                    timeLog.status === 'approved' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {timeLog.status === 'approved' ? 'Approved' : 'Rejected'} By
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${
                      timeLog.status === 'approved' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {timeLog.approvedBy?.name || 'Unknown'}
                    </p>
                    <p className={`text-sm ${
                      timeLog.status === 'approved' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {timeLog.approvedBy?.email || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${
                      timeLog.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Date(timeLog.approvedAt).toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${
                      timeLog.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Date(timeLog.approvedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {timeLog.status === 'rejected' && timeLog.rejectionReason && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-xs font-medium text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-red-700">{timeLog.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs text-slate-500 mb-1">Created At</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(timeLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(timeLog.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}