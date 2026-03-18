import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  FileText, 
  User,
  Activity,
  BarChart3,
  Wallet
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trade', icon: Activity, label: 'Trade' },
  { path: '/positions', icon: PieChart, label: 'Positions' },
  { path: '/orders', icon: FileText, label: 'Orders' },
  { path: '/funds', icon: Wallet, label: 'Funds' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-[#131722] border-r border-white/5 flex flex-col fixed left-0 top-0 h-screen z-[99999]">

      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-white" />
          <h1 className="text-white font-bold">VelocitiX</h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-lg ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};

export default Sidebar;
