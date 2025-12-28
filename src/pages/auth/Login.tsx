import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';
import { apiPost } from '@services/api';

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ user: any; token: string }>('/auth/login', data);
      login(response.user, response.token);
      toast.success('Welcome back!');
      // Small delay to ensure state is persisted before navigation
      setTimeout(() => {
        navigate('/feed', { replace: true });
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-dark-400 mt-2">Login to continue your confessions</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1">
            Username
          </label>
          <input
            type="text"
            className="input"
            placeholder="Your username"
            {...register('username', {
              required: 'Username is required',
            })}
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
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
              {...register('password', {
                required: 'Password is required',
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

      <div className="text-center text-sm">
        <span className="text-dark-400">Don't have an account? </span>
        <Link to="/register" className="text-primary-400 hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
