import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import AuthLayout from '../../layouts/AuthLayout';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9+()\- ]{8,16}$/, 'Phone must contain 8 to 16 valid characters').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password cannot exceed 72 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.email || data.phone, { message: 'Enter an email address or phone number', path: ['email'] })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { email: '', phone: '', password: '', confirmPassword: '' } });

  const onSubmit = async ({ email, phone, password }) => {
    try {
      setServerError('');
      await registerUser({ email: email || undefined, phone: phone || undefined, password });
      toast.success('Account created successfully. Please sign in.');
      navigate('/login');
    } catch (error) {
      const message = error.message || 'Registration failed. Please try again.';
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create an account</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Register with an email or phone number supported by the store API.</p>
      </div>
      {serverError && <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-medium">{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email Address" type="email" placeholder="name@example.com" icon={Mail} error={errors.email?.message} {...register('email')} disabled={isSubmitting} />
        <Input label="Phone Number" type="tel" placeholder="+855 12 345 678" icon={Phone} error={errors.phone?.message} {...register('phone')} disabled={isSubmitting} />
        <Input label="Password" type="password" placeholder="At least 8 characters" icon={Lock} error={errors.password?.message} {...register('password')} disabled={isSubmitting} />
        <Input label="Confirm Password" type="password" placeholder="Re-enter your password" icon={Lock} error={errors.confirmPassword?.message} {...register('confirmPassword')} disabled={isSubmitting} />
        <p className="text-[11px] text-slate-500">The backend currently creates the account only; profile details and order history are not available.</p>
        <Button type="submit" loading={isSubmitting} fullWidth size="md"><span>Create Account</span><ArrowRight className="w-4 h-4 ml-1" /></Button>
      </form>
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">Already have an account? <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link></div>
    </AuthLayout>
  );
}
