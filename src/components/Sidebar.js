import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-[#131722] border-r border-white/5 flex flex-col fixed left-0 top-0 h-screen z-[9999]">

      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-base font-bold text-white">
              VelocitiX <span className="text-blue-400">Funded</span>
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              Prop Trading
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">

        {navItems.map((item) => {

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-[#0b0f14] border border-white/10 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-gray-300">Market Open</span>
          </div>
          <p className="text-[10px] text-gray-400">VelocitiX Demo • NSE/BSE</p>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
