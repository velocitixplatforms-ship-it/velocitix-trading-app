import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { TrendingUp, TrendingDown, Wallet, PieChart, Activity } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MetricCard = ({ title, value, change, changePercent, icon: Icon, isPositive }) => {
  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-white/5">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {changePercent !== undefined ? `${changePercent > 0 ? '+' : ''}${changePercent}%` : ''}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-white font-mono-data">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-2 font-mono-data ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {change > 0 ? '+' : ''}{change}
          </p>
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { getAuthHeader } = useAuth();
  const [summary, setSummary] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, positionsRes] = await Promise.all([
        axios.get(`${API}/account/summary`, { headers: getAuthHeader() }),
        axios.get(`${API}/positions`, { headers: getAuthHeader() })
      ]);
      setSummary(summaryRes.data);
      setPositions(positionsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of your trading account</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Account Balance"
          value={formatCurrency(summary?.balance || 0)}
          icon={Wallet}
        />
        <MetricCard
          title="Available Margin"
          value={formatCurrency(summary?.available_margin || 0)}
          icon={Activity}
        />
        <MetricCard
          title="Day P&L"
          value={formatCurrency(Math.abs(summary?.day_pnl || 0))}
          change={formatCurrency(summary?.day_pnl || 0)}
          isPositive={(summary?.day_pnl || 0) >= 0}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total P&L"
          value={formatCurrency(Math.abs(summary?.total_pnl || 0))}
          change={formatCurrency(summary?.total_pnl || 0)}
          isPositive={(summary?.total_pnl || 0) >= 0}
          icon={PieChart}
        />
      </div>

      {/* Positions Table */}
      <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">Open Positions</h2>
          <p className="text-sm text-gray-400 mt-1">Your current holdings</p>
        </div>
        <div className="overflow-x-auto">
          {positions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Symbol</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Quantity</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Avg Price</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">LTP</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => (
                  <tr 
                    key={index}
                    data-testid={`position-row-${position.symbol}`}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">{position.symbol}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono-data text-white">{position.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono-data text-gray-300">{formatCurrency(position.avg_price)}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono-data text-white">{formatCurrency(position.current_price)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-mono-data font-semibold ${
                      position.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(position.pnl)}
                      <span className="text-xs ml-2">({position.pnl_percent >= 0 ? '+' : ''}{position.pnl_percent.toFixed(2)}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-gray-400">
              <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No open positions yet</p>
              <p className="text-xs mt-1">Start trading to see your positions here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;