import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiPost } from '@services/api';

interface ReportModalProps {
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  onClose: () => void;
}

const reportReasons = [
  { value: 'minors', label: 'Involves minors', labelTe: 'మైనర్లు ఉన్నారు' },
  { value: 'non-consensual', label: 'Non-consensual content', labelTe: 'అసమ్మతి కంటెంట్' },
  { value: 'extreme-abuse', label: 'Extreme abuse/violence', labelTe: 'తీవ్ర దుర్వినియోగం' },
  { value: 'spam', label: 'Spam content', labelTe: 'స్పామ్' },
  { value: 'fake-stories', label: 'Fake/misleading story', labelTe: 'నకిలీ కథ' },
  { value: 'personal-data', label: 'Exposes personal data', labelTe: 'వ్యక్తిగత డేటా' },
  { value: 'threats', label: 'Threats/blackmail', labelTe: 'బెదిరింపులు' },
  { value: 'other', label: 'Other', labelTe: 'ఇతర' },
];

export default function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost('/reports', {
        targetType,
        targetId,
        reason,
        details: details || undefined,
      });

      toast.success('Report submitted. Thank you for helping keep our community safe.');
      onClose();
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={20} />
            <h2 className="text-lg font-semibold">Report Content</h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Why are you reporting this?
            </label>
            <div className="space-y-2">
              {reportReasons.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    reason === r.value
                      ? 'border-primary-500 bg-primary-600/10'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-dark-200">{r.label}</span>
                  <span className="text-dark-500 text-sm">({r.labelTe})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">
              Additional details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="input h-24 resize-none"
              placeholder="Provide more context if needed..."
              maxLength={1000}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-accent flex-1"
              disabled={isSubmitting || !reason}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
