import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthLayout from '../../layouts/AuthLayout';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await login(data);
      toast.success('Signed in successfully!');

      // Redirect to origin or dashboard/home
      const from = location.state?.from?.pathname;
      const isAdminUser =
        response.roles?.some((r) => String(r).toUpperCase().includes('ADMIN'));

      if (from) {
        navigate(from, { replace: true });
      } else if (isAdminUser) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
      toast.error(err.message || 'Invalid credentials');
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your email/phone and password to continue
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-medium animate-fadeIn">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email or Phone Number"
          placeholder="name@example.com or +12345678"
          icon={Mail}
          autoComplete="username"
          error={errors.identifier?.message}
          {...register('identifier')}
          disabled={isSubmitting}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            icon={Lock}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          loading={isSubmitting}
          fullWidth
          size="md"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>

      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account yet?{' '}
        <Link
          to="/register"
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
}
