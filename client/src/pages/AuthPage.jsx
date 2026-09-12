import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Compass, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1113] text-[#cfc8ba] flex items-center justify-center p-6 select-none font-sans relative overflow-hidden">
      
      {/* Subtle Background Art */}
      <svg className="art absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
        <path className="hair" d="M-20,430 L310,430 C360,430 368,398 400,398 C432,398 440,462 472,462 C504,462 512,398 544,398 C576,398 584,430 634,430 L1020,430" />
        <circle className="adot" cx="400" cy="398" r="4" />
        <circle className="mdot" cx="472" cy="462" r="4" />
      </svg>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column: Brand Story */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#d9a441] flex items-center justify-center text-[#12140f] font-bold font-mono">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#cfc8ba] uppercase font-mono tracking-wider">
                Tracker · OS
              </h1>
              <p className="text-[10px] font-mono text-[#7a7568] uppercase tracking-[0.24em]">
                Track. Reflect. Improve.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#cfc8ba] leading-tight text-halo">
              A personal system for consistency and growth.
            </h2>
            <p className="text-sm text-[#b5afa2] leading-relaxed max-w-md font-light">
              Combines the structure of habit tracking, the speed of task management, the honesty of daily journaling, and transparent score analytics.
            </p>
          </div>

          {/* Receipt style teaser */}
          <div className="receipt max-w-sm">
            <h4 className="font-mono text-[10px] tracking-[0.2em] text-[#7a7568] uppercase mb-2">
              System Specifications
            </h4>
            <div className="r-row text-xs">
              <span>habits & streak engine</span>
              <span className="dots"></span>
              <span className="v">preserved</span>
            </div>
            <div className="r-row text-xs">
              <span>daily journal & mood</span>
              <span className="dots"></span>
              <span className="v">private</span>
            </div>
            <div className="r-row text-xs">
              <span>transparent score formula</span>
              <span className="dots"></span>
              <span className="v">4-part</span>
            </div>
            <div className="r-row total text-xs">
              <span>telemetry status</span>
              <span className="dots"></span>
              <span className="v text-[#8fb896]">ready</span>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Box */}
        <div className="bg-[#121518] border border-[#2b2e2b] p-6 sm:p-8 rounded space-y-6">
          {/* Instant 1-Click Demo Button */}
          <div>
            <button
              onClick={handleDemo}
              disabled={loading}
              className="btn-story accent w-full justify-center py-3 text-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Demo Account (Instant Test Drive)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <p className="font-mono text-[10px] text-center text-[#7a7568] mt-2">
              Pre-loaded with sample habits, journal reflections, and real-time history.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#262822] w-full"></div>
            <span className="bg-[#121518] px-3 font-mono text-[10px] text-[#7a7568] uppercase absolute">
              Or sign in with email
            </span>
          </div>

          {error && (
            <div className="p-3 rounded border border-[#7a3228] bg-[#1d1211] font-mono text-xs text-[#e06c58]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block font-mono text-xs text-[#7a7568] uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full p-2.5 rounded bg-[#0e1113] border border-[#2b2e2b] text-xs font-mono text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
                />
              </div>
            )}

            <div>
              <label className="block font-mono text-xs text-[#7a7568] uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 rounded bg-[#0e1113] border border-[#2b2e2b] text-xs font-mono text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-[#7a7568] uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded bg-[#0e1113] border border-[#2b2e2b] text-xs font-mono text-[#cfc8ba] focus:outline-none focus:border-[#d9a441]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-story w-full justify-center py-2.5 text-xs"
            >
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="text-center pt-1">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="font-mono text-xs text-[#d9a441] hover:underline"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
