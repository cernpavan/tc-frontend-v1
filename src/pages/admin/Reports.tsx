import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Check,
  X,
  Eye,
  FileText,
  MessageSquare,
  User,
  Clock,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService, AdminReport } from '@services/adminApi';

const statusOptions = [
  { value: '', label: 'All Reports' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'action-taken', label: 'Action Taken' },
  { value: 'dismissed', label: 'Dismissed' },
];

const actionOptions = [
  'Deleted content',
  'Warned user',
  'Banned user',
  'No violation found',
  'Duplicate report',
  'Other',
];

export default function Reports() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState<AdminReport | null>(null);
  const [selectedAction, setSelectedAction] = useState('');

  const fetchReports = async (status?: string) => {
    setIsLoading(true);
    try {
      const data = await adminService.getReports(status || undefined);
      setReports(data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(statusFilter);
  }, [statusFilter]);

  const handleTakeAction = async () => {
    if (!actionModal || !selectedAction) {
      toast.error('Please select an action');
      return;
    }
    setActionLoading(actionModal.id);
    try {
      await adminService.takeReportAction(actionModal.id, selectedAction);
      toast.success('Action taken on report');
      setActionModal(null);
      setSelectedAction('');
      fetchReports(statusFilter);
    } catch (error) {
      toast.error('Failed to take action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await adminService.dismissReport(reportId);
      toast.success('Report dismissed');
      fetchReports(statusFilter);
    } catch (error) {
      toast.error('Failed to dismiss report');
    } finally {
      setActionLoading(null);
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText size={14} className="text-blue-400" />;
      case 'comment':
        return <MessageSquare size={14} className="text-purple-400" />;
      case 'user':
        return <User size={14} className="text-green-400" />;
      default:
        return <AlertTriangle size={14} className="text-amber-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-400';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-400';
      case 'action-taken':
        return 'bg-green-500/20 text-green-400';
      case 'dismissed':
        return 'bg-dark-600 text-dark-400';
      default:
        return 'bg-dark-600 text-dark-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports Queue</h1>
          <p className="text-dark-400 mt-1">Review and manage user reports</p>
        </div>
        <div className="text-sm text-dark-400">
          {reports.filter((r) => r.status === 'pending').length} pending
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-dark-400" />
          <span className="text-sm text-dark-400">Filter:</span>
        </div>
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                statusFilter === option.value
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-dark-900 border border-dark-800 rounded-xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No reports found</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-dark-900 border border-dark-800 rounded-xl p-6 hover:border-dark-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Report Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTargetTypeIcon(report.targetType)}
                      <span className="text-sm font-medium text-white capitalize">
                        {report.targetType} Report
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-dark-300">
                      <span className="text-dark-500">Reason: </span>
                      {report.reason}
                    </p>
                    {report.details && (
                      <p className="text-sm text-dark-400 mt-1">{report.details}</p>
                    )}
                  </div>

                  {/* Target Content Preview */}
                  {report.targetPost && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <p className="text-xs text-dark-500 mb-1">Reported Post:</p>
                      <p className="text-sm text-dark-300 line-clamp-2">
                        {report.targetPost.content}
                      </p>
                    </div>
                  )}
                  {report.targetComment && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <p className="text-xs text-dark-500 mb-1">Reported Comment:</p>
                      <p className="text-sm text-dark-300 line-clamp-2">
                        {report.targetComment.content}
                      </p>
                    </div>
                  )}
                  {report.targetUser && (
                    <div className="bg-dark-800/50 rounded-lg p-3">
                      <p className="text-xs text-dark-500 mb-1">Reported User:</p>
                      <p className="text-sm text-dark-300">{report.targetUser.username}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-dark-500">
                    <span>Reported by: {report.reporter?.username || 'Anonymous'}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setActionModal(report)}
                        disabled={actionLoading === report.id}
                        className="p-2 text-dark-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Take Action"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => handleDismiss(report.id)}
                        disabled={actionLoading === report.id}
                        className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Dismiss"
                      >
                        <X size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 text-dark-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-dark-400">Type</label>
                  <p className="text-white mt-1 capitalize">{selectedReport.targetType}</p>
                </div>
                <div>
                  <label className="text-sm text-dark-400">Status</label>
                  <p className="text-white mt-1 capitalize">{selectedReport.status}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400">Reason</label>
                <p className="text-white mt-1">{selectedReport.reason}</p>
              </div>
              {selectedReport.details && (
                <div>
                  <label className="text-sm text-dark-400">Additional Details</label>
                  <p className="text-white mt-1">{selectedReport.details}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-dark-400">Reporter</label>
                <p className="text-white mt-1">
                  {selectedReport.reporter?.username || 'Anonymous'}
                </p>
              </div>
              <div>
                <label className="text-sm text-dark-400">Reported At</label>
                <p className="text-white mt-1">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Target Content */}
              <div className="border-t border-dark-800 pt-4">
                <label className="text-sm text-dark-400 mb-2 block">Reported Content</label>
                {selectedReport.targetPost && (
                  <div className="bg-dark-800 rounded-lg p-4">
                    <p className="text-white">{selectedReport.targetPost.content}</p>
                  </div>
                )}
                {selectedReport.targetComment && (
                  <div className="bg-dark-800 rounded-lg p-4">
                    <p className="text-white">{selectedReport.targetComment.content}</p>
                  </div>
                )}
                {selectedReport.targetUser && (
                  <div className="bg-dark-800 rounded-lg p-4">
                    <p className="text-white">User: {selectedReport.targetUser.username}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedReport.status === 'pending' && (
              <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleDismiss(selectedReport.id);
                    setSelectedReport(null);
                  }}
                  className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setActionModal(selectedReport);
                    setSelectedReport(null);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Take Action
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-800">
              <h2 className="text-lg font-semibold text-white">Take Action</h2>
              <p className="text-sm text-dark-400 mt-1">Select the action you took on this report</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {actionOptions.map((action) => (
                  <button
                    key={action}
                    onClick={() => setSelectedAction(action)}
                    className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                      selectedAction === action
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-transparent'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-dark-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedAction('');
                }}
                className="px-4 py-2 bg-dark-800 text-dark-300 rounded-lg hover:bg-dark-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTakeAction}
                disabled={!selectedAction || actionLoading !== null}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
