import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { apiPost } from '@services/api';

interface LoginForm {
  username: string;
  password: string;
}

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  ageVerified: boolean;
  termsAccepted: boolean;
}

type TabType = 'login' | 'signup';

export default function AuthModal() {
  const { showAuthModal, closeAuthModal, login, executePendingAction } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  if (!showAuthModal) return null;

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ user: any; token: string }>('/auth/login', data);
      login(response.user, response.token);
      toast.success('Welcome back!');
      closeAuthModal();
      // Execute pending action after login
      setTimeout(() => {
        executePendingAction();
      }, 100);
    } catch (error: any) {
      // Parse and display the actual error message from backend
      const errorData = error.response?.data;
      let errorMessage = 'Login failed. Please check your credentials.';

      if (errorData) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost<{ user: any; token: string }>('/auth/register', {
        username: data.username,
        password: data.password,
        ageVerified: data.ageVerified,
        termsAccepted: data.termsAccepted,
      });
      login(response.user, response.token);
      toast.success('Account created successfully!');
      closeAuthModal();
      // Execute pending action after registration
      setTimeout(() => {
        executePendingAction();
      }, 100);
    } catch (error: any) {
      // Parse and display the actual error message from backend
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed. Please try again.';

      if (errorData) {
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.map((e: any) => e.message || e).join('. ');
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      closeAuthModal();
      loginForm.reset();
      registerForm.reset();
      setShowPassword(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-md shadow-2xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800">
          <h2 className="text-2xl font-bold">
            {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="btn-ghost p-2 hover:bg-dark-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-800">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'login'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-400 hover:text-dark-200'
            }`}
            disabled={isLoading}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'signup'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-dark-400 hover:text-dark-200'
            }`}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Your username"
                  disabled={isLoading}
                  {...loginForm.register('username', {
                    required: 'Username is required',
                  })}
                />
                {loginForm.formState.errors.username && (
                  <p className="text-red-400 text-sm mt-1">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Your password"
                    disabled={isLoading}
                    {...loginForm.register('password', {
                      required: 'Password is required',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Login
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Choose a username"
                  disabled={isLoading}
                  {...registerForm.register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters',
                    },
                    maxLength: {
                      value: 20,
                      message: 'Username must be at most 20 characters',
                    },
                  })}
                />
                {registerForm.formState.errors.username && (
                  <p className="text-red-400 text-sm mt-1">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Choose a password"
                    disabled={isLoading}
                    {...registerForm.register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-red-400 text-sm mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  {...registerForm.register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Age Verification */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="modal-ageVerified"
                  disabled={isLoading}
                  {...registerForm.register('ageVerified', {
                    required: 'You must be 18+ to use this platform',
                  })}
                />
                <label htmlFor="modal-ageVerified" className="text-sm text-dark-300">
                  I confirm that I am 18 years of age or older
                </label>
              </div>
              {registerForm.formState.errors.ageVerified && (
                <p className="text-red-400 text-sm -mt-2">
                  {registerForm.formState.errors.ageVerified.message}
                </p>
              )}

              {/* Terms Accepted */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="modal-termsAccepted"
                  disabled={isLoading}
                  {...registerForm.register('termsAccepted', {
                    required: 'You must accept the terms',
                  })}
                />
                <label htmlFor="modal-termsAccepted" className="text-sm text-dark-300">
                  I accept the{' '}
                  <Link
                    to="/terms"
                    className="text-primary-400 hover:underline"
                    onClick={() => closeAuthModal()}
                  >
                    Terms & Moderation Policy
                  </Link>
                </label>
              </div>
              {registerForm.formState.errors.termsAccepted && (
                <p className="text-red-400 text-sm -mt-2">
                  {registerForm.formState.errors.termsAccepted.message}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 pb-6 text-center text-sm text-dark-500">
          {activeTab === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('signup')}
                disabled={isLoading}
                className="text-primary-400 hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('login')}
                disabled={isLoading}
                className="text-primary-400 hover:underline"
              >
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
