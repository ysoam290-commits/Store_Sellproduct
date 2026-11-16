import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthLayout from '../../layouts/AuthLayout';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [devToken, setDevToken] = useState(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const res = await authApi.forgotPassword({ email: data.email });
      setSubmitted(true);
      setSubmittedEmail(data.email);

      // Backend dev-mode token helper
      if (res?.devResetToken) {
        setDevToken(res.devResetToken);
      }

      toast.success('Password reset instructions generated!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not send reset request';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your registered email to receive password reset instructions
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-medium animate-fadeIn">
          {serverError}
        </div>
      )}

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Instructions Sent
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            If an account exists for <strong className="text-slate-700 dark:text-slate-200">{submittedEmail}</strong>,
            password reset instructions have been dispatched.
          </p>

          {/* Dev Token Banner if Spring Boot dev mode is enabled */}
          {devToken && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Dev Mode Reset Token</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2 rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all break-all border border-amber-100 dark:border-amber-900">
                {devToken}
              </div>
              <Link
                to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Continue to reset password with this token</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <div className="pt-3 space-y-2">
            {!devToken && (
              <Link
                to="/reset-password"
                className="block text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Have a reset token? Enter token here →
              </Link>
            )}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Registered Email"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            loading={isSubmitting}
            fullWidth
            size="md"
          >
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
