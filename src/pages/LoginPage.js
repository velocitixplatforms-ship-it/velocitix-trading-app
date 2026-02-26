import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, name);
      }

      if (result.success) {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@velocitix.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg shadow-blue-500/50 animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-[Manrope]">
            VelocitiX <span className="text-blue-400">Funded</span>
          </h1>
          <p className="text-sm text-gray-400">Professional Prop Trading Platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-[#131722] to-[#1a1f2e] border border-white/10 rounded-2xl p-8 shadow-2xl hover:border-blue-500/30 transition-all duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-1 font-[Manrope]">
              {isLogin ? 'Welcome back, Demo' : 'Create account'}
            </h2>
            <p className="text-sm text-gray-400">
              {isLogin ? 'Login to access your trading account' : 'Start your prop trading journey today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  data-testid="register-name-input"
                  className="bg-[#0b0f14] border-white/10 focus:border-blue-500/50 text-white h-11 rounded-xl"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="login-email-input"
                className="bg-[#0b0f14] border-white/10 focus:border-blue-500/50 text-white h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password-input"
                  className="bg-[#0b0f14] border-white/10 focus:border-blue-500/50 text-white h-11 pr-10 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="login-submit-button"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>

          {isLogin && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              data-testid="demo-login-button"
              className="w-full mt-3 h-11 bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-blue-500/30 font-medium rounded-xl transition-all duration-300"
            >
              Try VelocitiX Demo Account
            </Button>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="text-blue-500 font-semibold">
                {isLogin ? 'Sign up' : 'Login'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p className="flex items-center justify-center space-x-1">
            <span>VelocitiX Funded</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <span className="text-red-500 inline-block animate-pulse">❤️</span>
              <span>in India</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
