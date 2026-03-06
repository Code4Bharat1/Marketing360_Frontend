'use client';

import { useState } from 'react';
import { IoClose, IoAlertCircle } from 'react-icons/io5';

export default function RejectModal({ timeLog, onClose, onSubmit }) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit(rejectionReason);
    } catch (err) {
      setError('Failed to reject time log');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Reject Time Log</h2>
            <p className="text-sm text-slate-600 mt-1">
              {timeLog.employee?.name} - {timeLog.project?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <IoClose className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Warning */}
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <IoAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Warning</p>
            <p className="text-sm text-red-700 mt-1">
              Rejecting this time log will notify the employee. Please provide a clear reason for rejection.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Time Log Summary */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(timeLog.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Hours</p>
                  <p className="text-sm font-medium text-slate-900">
                    {timeLog.hoursSpent} hours
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Task Type</p>
                  <p className="text-sm font-medium text-slate-900">
                    {timeLog.taskType}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setError('');
                }}
                rows="5"
                className={`w-full px-4 py-2.5 border ${
                  error ? 'border-red-500' : 'border-slate-200'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
                placeholder="Please explain why this time log is being rejected..."
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                This reason will be visible to the employee. Be specific and constructive.
              </p>
            </div>

            {/* Common Rejection Reasons (Quick Select) */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Quick Select Reasons:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Hours exceed daily limit',
                  'Missing work description',
                  'Incorrect project selected',
                  'Task type mismatch',
                  'Work not approved by manager',
                  'Duplicate entry',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rejectionReason.trim()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rejecting...
              </>
            ) : (
              'Reject Time Log'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}