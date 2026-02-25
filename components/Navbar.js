import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Bell } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-[#121212] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
      <div>
        <h2 className="text-lg font-semibold text-white">Welcome back, {user?.name?.split(' ')[0] || 'Trader'}</h2>
        <p className="text-xs text-gray-400">Manage your portfolio and execute trades</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          <Bell className="w-5 h-5" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="navbar-theme-toggle"
          className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* User Avatar */}
        <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;