import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Mail, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6" data-testid="profile-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Profile & Settings</h1>
        <p className="text-sm text-gray-400">Manage your account preferences</p>
      </div>

      {/* Profile Info */}
      <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="p-3 bg-white/5 rounded-lg mr-4">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Full Name</div>
              <div className="text-base font-semibold text-white">{user?.name || 'N/A'}</div>
            </div>
          </div>
          <div className="flex items-start">
            <div className="p-3 bg-white/5 rounded-lg mr-4">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Email Address</div>
              <div className="text-base font-semibold text-white">{user?.email || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balance */}
      <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">Total Balance</div>
            <div className="text-2xl font-bold font-mono-data text-white">
              {formatCurrency(user?.balance || 0)}
            </div>
          </div>
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">Available Margin</div>
            <div className="text-2xl font-bold font-mono-data text-white">
              {formatCurrency(user?.available_margin || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/10 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-white/5 rounded-lg mr-3">
              {isDark ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-blue-500" />}
            </div>
            <div>
              <Label htmlFor="theme-toggle" className="text-sm font-medium text-white cursor-pointer">
                Dark Mode
              </Label>
              <p className="text-xs text-gray-400">Toggle between light and dark theme</p>
            </div>
          </div>
          <Switch 
            id="theme-toggle" 
            checked={isDark} 
            onCheckedChange={toggleTheme}
            data-testid="theme-toggle-switch"
          />
        </div>
      </div>

      {/* Logout */}
      <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>
        <Button
          onClick={handleLogout}
          data-testid="logout-button"
          variant="destructive"
          className="bg-red-600 hover:bg-red-500 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;