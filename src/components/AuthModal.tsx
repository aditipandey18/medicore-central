import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight, 
  AlertCircle, CheckCircle2, KeyRound 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string; // e.g. "before appointment booking"
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  reason,
  onSuccess
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your legal name.');
        }
        await signUpWithEmail(email, password, name, phone);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      let userFriendly = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        userFriendly = 'Invalid email or password combination. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        userFriendly = 'This email is already registered. Please click "Sign In" instead.';
      } else if (err.code === 'auth/weak-password') {
        userFriendly = 'Password should be at least 6 characters.';
      }
      setErrorMsg(userFriendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Patient Identity Verification
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            {mode === 'signin' ? 'Sign In to MediCore Central' : 'Create Patient Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {reason || 'Securely manage your medical appointments and confidential health records.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Quick 1-Click Google Sign-In */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
              <span>{mode === 'signin' ? 'Continue with Google' : 'Sign Up with Google'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex-1 h-px bg-slate-200" />
            <span>or use email</span>
            <span className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Toggle Tab */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                mode === 'signin' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up / Register
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs font-medium">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                    Legal Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                    Mobile Phone (for Appointment Alerts)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-slate-900"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Account & Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Privacy footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Protected by MediCore Central encrypted security and HIPAA compliance rules.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
