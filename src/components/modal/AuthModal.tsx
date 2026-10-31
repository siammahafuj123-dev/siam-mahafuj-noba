import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { closeAuthModal, setAuthModalMode, setCredentials } from '../../features/auth/authSlice';
import { addToast } from '../../features/toast/toastSlice';
import { Modal } from './Modal';
import { Mail, Lock, User, Phone, LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, authModalMode } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = authModalMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body =
        authModalMode === 'register'
          ? { name, email, password, phone }
          : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication request failed');
      }

      dispatch(setCredentials({ user: data.user, token: data.token }));
      dispatch(
        addToast({
          type: 'success',
          title: authModalMode === 'register' ? 'Account Created' : 'Welcome Back!',
          message: `Signed in as ${data.user.name} (${data.user.role})`,
        })
      );
      dispatch(closeAuthModal());
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      dispatch(
        addToast({
          type: 'error',
          title: 'Authentication Error',
          message: err.message || 'Failed to authenticate',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick dev demo logins
  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    setLoading(true);
    setError(null);
    try {
      const creds =
        role === 'admin'
          ? { email: 'admin@novara.com', password: 'Admin@123' }
          : { email: 'customer@example.com', password: 'Customer@123' };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Demo login failed');

      dispatch(setCredentials({ user: data.user, token: data.token }));
      dispatch(
        addToast({
          type: 'success',
          title: 'Signed In',
          message: `Logged in as ${data.user.name} (${data.user.role})`,
        })
      );
      dispatch(closeAuthModal());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => dispatch(closeAuthModal())}
      title={
        authModalMode === 'login'
          ? 'Sign in to Novara Commerce'
          : authModalMode === 'register'
          ? 'Create a Customer Account'
          : 'Reset Your Password'
      }
      description="Orders, reviews, and address management require an authenticated customer account."
      maxWidth="md"
    >
      {/* Tab toggle */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => {
            dispatch(setAuthModalMode('login'));
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authModalMode === 'login'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch(setAuthModalMode('register'));
            setError(null);
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            authModalMode === 'register'
              ? 'bg-white text-emerald-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {authModalMode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Khan"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {authModalMode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Phone Number (Bangladesh)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 17XX XXXXXX"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-gray-700">Password</label>
            {authModalMode === 'login' && (
              <button
                type="button"
                onClick={() => dispatch(setAuthModalMode('forgot'))}
                className="text-[11px] text-emerald-700 hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : authModalMode === 'login' ? (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Honest 3P OAuth integration note */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <div className="text-[11px] text-gray-400 text-center mb-2">Or continue with</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              dispatch(
                addToast({
                  type: 'info',
                  title: 'Google OAuth',
                  message: 'Google Client ID requires configuration in environment variables.',
                })
              )
            }
            className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch(
                addToast({
                  type: 'info',
                  title: 'Facebook OAuth',
                  message: 'Facebook App ID requires configuration in environment variables.',
                })
              )
            }
            className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      {/* One-click demo test accounts */}
      <div className="mt-4 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Demo Testing (1-Click)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            className="py-1.5 px-2.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 hover:bg-emerald-50 transition shadow-xs text-left"
          >
            👤 Customer (Sarah)
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="py-1.5 px-2.5 bg-emerald-800 text-white rounded-lg text-xs font-medium hover:bg-emerald-900 transition shadow-xs text-left"
          >
            ⚡ Super Admin
          </button>
        </div>
      </div>
    </Modal>
  );
};
