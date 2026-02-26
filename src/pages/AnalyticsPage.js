import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const AnalyticsPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-[Manrope]">Analytics</h1>
        <p className="text-gray-400">Performance insights and trading analytics</p>
      </div>

      {/* Coming Soon */}
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3 font-[Manrope]">Advanced Analytics Coming Soon</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Get detailed insights into your trading performance, risk metrics, and profit analytics.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-[#131722] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
              <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
              <p className="text-sm text-gray-400">Win Rate Analysis</p>
            </div>
            <div className="bg-[#131722] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
              <DollarSign className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-sm text-gray-400">P&L Reports</p>
            </div>
            <div className="bg-[#131722] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
              <Activity className="w-6 h-6 text-purple-400 mb-2" />
              <p className="text-sm text-gray-400">Risk Metrics</p>
            </div>
            <div className="bg-[#131722] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300">
              <TrendingDown className="w-6 h-6 text-red-400 mb-2" />
              <p className="text-sm text-gray-400">Drawdown Tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
