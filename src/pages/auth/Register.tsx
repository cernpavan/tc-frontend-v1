import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { apiPost, apiGet } from '@services/api';

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  ageVerified: boolean;
  termsAccepted: boolean;
}

export default function Register() {
  const navigate = useNavigate();
  const { login, ageVerified } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      ageVerified: ageVerified,
      termsAccepted: false,
    },
  });

  const username = watch('username');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Check password match in real-time
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  // Check username availability with debounce
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await apiGet<{ available: boolean }>(
        `/auth/check-username/${encodeURIComponent(usernameToCheck)}`
      );
      setUsernameAvailable(response.available);
      if (!response.available) {
        setError('username', {
          type: 'manual',
          message: 'This username is already taken. Please choose another one.',
        });
      } else {
        clearErrors('username');
      }
    } catch (error) {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(() => {
      checkUsernameAvailability(username);
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const onSubmit = async (data: RegisterForm) => {
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      toast.error('Passwords do not match');
      return;
    }

    // Check if username is available
    if (usernameAvailable === false) {
      toast.error('This username is already taken. Please choose another one.');
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
      // Small delay to ensure state is persisted before navigation
      setTimeout(() => {
        navigate('/feed', { replace: true });
      }, 100);
    } catch (error: any) {
      // Parse and display the actual error message from backend
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed. Please try again.';

      if (errorData) {
        // Check different possible error formats
        if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.errors)) {
          // Handle validation errors array
          errorMessage = errorData.errors.map((e: any) => e.message || e).join('. ');
        }
      }

      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('taken')) {
        setUsernameAvailable(false);
        setError('username', {
          type: 'manual',
          message: 'This username is already taken',
        });
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-dark-400 mt-2">Join the Telugu Confession community</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              className={`input pr-10 ${
                usernameAvailable === true
                  ? 'border-green-500 focus:border-green-500'
                  : usernameAvailable === false
                  ? 'border-red-500 focus:border-red-500'
                  : ''
              }`}
              placeholder="Choose a unique username"
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Min 3 characters' },
                maxLength: { value: 20, message: 'Max 20 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Only letters, numbers, and underscores allowed',
                },
              })}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingUsername && (
                <Loader2 size={18} className="animate-spin text-dark-400" />
              )}
              {!checkingUsername && usernameAvailable === true && (
                <Check size={18} className="text-green-500" />
              )}
              {!checkingUsername && usernameAvailable === false && (
                <X size={18} className="text-red-500" />
              )}
            </div>
          </div>
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
          )}
          {!errors.username && usernameAvailable === true && (
            <p className="text-green-400 text-sm mt-1">Username is available!</p>
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
              placeholder="Create a password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1">
            Re-enter Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={`input pr-10 ${
                passwordMismatch
                  ? 'border-red-500 focus:border-red-500'
                  : confirmPassword && !passwordMismatch
                  ? 'border-green-500 focus:border-green-500'
                  : ''
              }`}
              placeholder="Re-enter your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
          {passwordMismatch && !errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
          )}
          {confirmPassword && !passwordMismatch && !errors.confirmPassword && (
            <p className="text-green-400 text-sm mt-1">Passwords match!</p>
          )}
        </div>

        {/* Age Verification */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="ageVerified"
            className="mt-1"
            {...register('ageVerified', {
              required: 'You must be 18+ to use this platform',
            })}
          />
          <label htmlFor="ageVerified" className="text-sm text-dark-300">
            I confirm that I am 18 years of age or older
          </label>
        </div>
        {errors.ageVerified && (
          <p className="text-red-400 text-sm">{errors.ageVerified.message}</p>
        )}

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="termsAccepted"
            className="mt-1"
            {...register('termsAccepted', {
              required: 'You must accept the terms',
            })}
          />
          <label htmlFor="termsAccepted" className="text-sm text-dark-300">
            I accept the{' '}
            <Link to="/terms" className="text-primary-400 hover:underline">
              Terms & Moderation Policy
            </Link>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-red-400 text-sm">{errors.termsAccepted.message}</p>
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

      <div className="text-center text-sm">
        <span className="text-dark-400">Already have an account? </span>
        <Link to="/login" className="text-primary-400 hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
}
