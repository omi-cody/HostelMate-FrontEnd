import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);

  const stepIdx = { email: 0, otp: 1, reset: 2 };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.sendForgotOtp(email);
      toast.success('OTP sent! Check your email inbox.');
      setStep('otp');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not send OTP. Check the email address.');
    } finally { setLoading(false); }
  };

  // Step 2: verify OTP — backend uses peekOtp (does NOT consume it), so step 3 still works
  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(email, otp);
      if (res?.success === false) throw new Error(res.message);
      toast.success('OTP verified! Set your new password.');
      setStep('reset');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  // Step 3: reset — OTP is still in store because step 2 used peekOtp
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. Please start over.');
    } finally { setLoading(false); }
  };

  const inp = 'w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-medium">HostelMate</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            {(['email','otp','reset'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  stepIdx[step] >= i ? 'bg-cyan-400 text-white' : 'bg-gray-200 text-gray-400'
                }`}>{i + 1}</div>
                {i < 2 && <div className={`w-14 h-1 mx-1 rounded ${stepIdx[step] > i ? 'bg-cyan-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-medium mb-1">Forgot Password</h1>
                <p className="text-gray-500 text-sm">Enter your registered email to receive an OTP</p>
              </div>
              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" className={inp} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-medium mb-1">Enter OTP</h1>
                <p className="text-gray-500 text-sm">6-digit code sent to <strong>{email}</strong></p>
              </div>
              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">OTP Code</label>
                  <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:border-cyan-400 text-center text-3xl tracking-[0.5em] font-mono" />
                  <p className="text-xs text-gray-400 mt-2 text-center">Valid for 5 minutes</p>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => { setStep('email'); setOtp(''); }}
                  className="w-full text-sm text-gray-500 hover:text-cyan-500">← Back / resend OTP</button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-medium mb-1">New Password</h1>
                <p className="text-gray-500 text-sm">Choose a strong password</p>
              </div>
              <form onSubmit={resetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type={showPw ? 'text' : 'password'} required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••" className={`${inp} pr-12`} />
                    <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••" className={inp} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-cyan-400 text-white rounded-xl hover:bg-cyan-500 font-medium disabled:opacity-60">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-cyan-500 hover:text-cyan-600">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
