import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@store/authStore';

export default function AgeGate() {
  const navigate = useNavigate();
  const { verifyAge } = useAuthStore();

  const handleConfirm = () => {
    verifyAge();
    navigate('/register');
  };

  const handleDeny = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-accent-600/20 rounded-full flex items-center justify-center mx-auto">
          <Shield size={40} className="text-accent-400" />
        </div>

        <h1 className="text-3xl font-bold">Age Verification Required</h1>

        <div className="space-y-4 text-dark-300">
          <p>
            Telugu Confession contains adult content including NSFW material.
            This platform is intended for adults only (18+).
          </p>

          <p className="font-telugu text-dark-400">
            తెలుగు కన్ఫెషన్‌లో NSFW మెటీరియల్‌తో సహా పెద్దల కంటెంట్ ఉంది.
            ఈ ప్లాట్‌ఫారమ్ పెద్దలకు మాత్రమే (18+).
          </p>
        </div>

        <div className="bg-accent-900/20 border border-accent-700/50 rounded-lg p-4 text-sm text-accent-300">
          By clicking "I am 18+", you confirm that:
          <ul className="mt-2 space-y-1 text-left list-disc list-inside">
            <li>You are at least 18 years of age</li>
            <li>It is legal to view adult content in your jurisdiction</li>
            <li>You wish to view such content</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button onClick={handleDeny} className="btn-secondary flex-1">
            Exit
          </button>
          <button onClick={handleConfirm} className="btn-primary flex-1">
            I am 18 or older
          </button>
        </div>
      </div>
    </div>
  );
}
