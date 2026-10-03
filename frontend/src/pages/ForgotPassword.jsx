import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    try {
      // API call placeholder
      await new Promise(r => setTimeout(r, 1000));
      // Fake action for now
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-cream-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-navy-800 rounded-3xl p-8 border border-navy-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2 text-cream-200">Forgot your password?</h2>
          <p className="text-blue-400 text-sm mb-8">Enter your email and we'll help you reset your password.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-lime-400 hover:bg-lime-500 text-navy-900 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(228,255,48,0.2)] hover:shadow-[0_0_25px_rgba(228,255,48,0.4)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm text-cream-200/60 hover:text-lime-400 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
