import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-navy-900', text: '' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (pass.length < 10) return { label: 'Medium', color: 'bg-blue-500', text: 'text-blue-400' };
    return { label: 'Strong', color: 'bg-lime-400', text: 'text-lime-400' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-cream-200 flex">
      {/* LEFT COLUMN */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy-800 border-r border-navy-700 flex-col justify-center items-center p-12 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-8 max-w-md">
          <div className="w-16 h-16 bg-lime-400 rounded-2xl flex items-center justify-center text-navy-900 font-bold text-3xl mx-auto shadow-[0_0_30px_rgba(228,255,48,0.3)]">
            H
          </div>
          <h1 className="text-4xl font-bold">Build better habits.<br/><span className="text-blue-400">One day at a time.</span></h1>
        </div>
      </div>
      
      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-navy-800 rounded-3xl p-8 border border-navy-700 shadow-2xl relative">
          <h2 className="text-2xl font-bold mb-2 text-cream-200">Create your account</h2>
          <p className="text-blue-400 text-sm mb-6">Start building habits that actually stick.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors"
                placeholder="Subha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-200/50 hover:text-lime-400 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className={`font-medium ${strength.text}`}>{strength.label}</span>
                  <div className="flex gap-1 w-24">
                    <div className={`h-1.5 w-1/3 rounded-full ${password.length > 0 ? strength.color : 'bg-navy-900'}`}></div>
                    <div className={`h-1.5 w-1/3 rounded-full ${password.length >= 6 ? strength.color : 'bg-navy-900'}`}></div>
                    <div className={`h-1.5 w-1/3 rounded-full ${password.length >= 10 ? strength.color : 'bg-navy-900'}`}></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-cream-200 focus:outline-none focus:border-lime-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-lime-400 hover:bg-lime-500 text-navy-900 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(228,255,48,0.2)] hover:shadow-[0_0_25px_rgba(228,255,48,0.4)] mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-cream-200/60">
            Already have an account? <Link to="/login" className="text-blue-400 hover:text-lime-400 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
