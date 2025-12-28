import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User,
  Globe,
  Moon,
  Eye,
  Lock,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAuthStore } from '@store/authStore';
import { apiPut, apiDelete } from '@services/api';

interface SettingsForm {
  language: 'telugu' | 'english';
  theme: 'light' | 'dark';
  showNsfw: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UsernameForm {
  newUsername: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'danger'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register: registerSettings,
    handleSubmit: handleSettingsSubmit,
  } = useForm<SettingsForm>({
    defaultValues: {
      language: user?.language || 'telugu',
      theme: user?.theme || 'dark',
      showNsfw: user?.showNsfw || false,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();

  const {
    register: registerUsername,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
  } = useForm<UsernameForm>();

  const onSaveSettings = async (data: SettingsForm) => {
    setIsSaving(true);
    try {
      await apiPut('/users/settings', data);
      updateUser(data);

      // Apply theme
      document.documentElement.classList.toggle('dark', data.theme === 'dark');

      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await apiPut('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const onChangeUsername = async (data: UsernameForm) => {
    setIsSaving(true);
    try {
      const response = await apiPut<{ username: string; changesRemaining: number }>(
        '/users/change-username',
        { newUsername: data.newUsername }
      );
      updateUser({ username: response.username } as any);
      toast.success(`Username changed! ${response.changesRemaining} changes remaining.`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to change username');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await apiDelete('/users/account');
      logout();
      toast.success('Account deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'account', label: 'Account', icon: User },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-dark-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              activeTab === tab.id
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-dark-400 hover:bg-dark-800'
            )}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSettingsSubmit(onSaveSettings)} className="space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <Globe size={16} />
              Language
            </label>
            <select className="input" {...registerSettings('language')}>
              <option value="telugu">తెలుగు (Telugu)</option>
              <option value="english">English</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
              <Moon size={16} />
              Theme
            </label>
            <select className="input" {...registerSettings('theme')}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>

          {/* NSFW Preference */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...registerSettings('showNsfw')}
                className="w-5 h-5 rounded border-dark-600 bg-dark-800 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="flex items-center gap-2 text-dark-200">
                  <Eye size={16} />
                  Always show NSFW content
                </div>
                <p className="text-dark-500 text-sm">
                  Disable blur effect on explicit content
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save Settings
          </button>
        </form>
      )}

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          {/* Change Username */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={18} />
              Change Username
            </h3>
            <p className="text-dark-400 text-sm mb-4">
              You have {user?.usernameChangesLeft || 0} username changes remaining.
            </p>
            <form onSubmit={handleUsernameSubmit(onChangeUsername)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  New Username
                </label>
                <input
                  type="text"
                  {...registerUsername('newUsername', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Min 3 characters' },
                    maxLength: { value: 20, message: 'Max 20 characters' },
                  })}
                  className="input"
                  placeholder="Enter new username"
                />
                {usernameErrors.newUsername && (
                  <p className="text-red-400 text-sm mt-1">
                    {usernameErrors.newUsername.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-secondary"
              >
                Change Username
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock size={18} />
              Change Password
            </h3>
            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                  className="input"
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                  className="input"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-secondary"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div className="card border-red-700/50 bg-red-900/10">
          <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
            <Trash2 size={18} />
            Delete Account
          </h3>
          <p className="text-dark-300 mb-4">
            Once you delete your account, there is no going back. All your posts,
            comments, and data will be permanently removed.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Delete My Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-red-400 font-medium">
                Are you absolutely sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
