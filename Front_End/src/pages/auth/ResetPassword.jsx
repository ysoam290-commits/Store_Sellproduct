import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthLayout from '../../layouts/AuthLayout';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password cannot exceed 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const tokenParam = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenParam,
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await authApi.resetPassword({
        token: data.token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password updated successfully! Please sign in.');
      navigate('/login');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to reset password. Token may be invalid or expired.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Create New Password
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your reset token and choose a secure password
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-medium animate-fadeIn">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Reset Token"
          placeholder="Paste token from email"
          icon={KeyRound}
          error={errors.token?.message}
          {...register('token')}
          disabled={isSubmitting}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.newPassword?.message}
          {...register('newPassword')}
          disabled={isSubmitting}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          loading={isSubmitting}
          fullWidth
          size="md"
        >
          <span>Reset Password & Proceed</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Remembered your password?{' '}
        <Link
          to="/login"
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
