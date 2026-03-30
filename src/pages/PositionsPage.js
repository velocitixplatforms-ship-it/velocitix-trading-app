import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PositionsPage = () => {
  const { getAuthHeader } = useAuth();
  const { refreshSymbols } = useMarketData();
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(() => {
      fetchPositions();
      refreshSymbols();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API}/positions`, { headers: getAuthHeader() });
      setPositions(response.data);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
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

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Positions</h1>
          <p className="text-sm text-gray-400">Your active holdings</p>
        </div>

        {positions.length > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${
              totalPnL >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(totalPnL)}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400">
            Loading positions...
          </div>
        ) : positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-6 py-4 text-left text-xs text-gray-400">Symbol</th>
                  <th className="px-6 py-4 text-right text-xs text-gray-400">Qty</th>
                  <th className="px-6 py-4 text-right text-xs text-gray-400">Avg</th>
                  <th className="px-6 py-4 text-right text-xs text-gray-400">LTP</th>
                  <th className="px-6 py-4 text-right text-xs text-gray-400">Value</th>
                  <th className="px-6 py-4 text-right text-xs text-gray-400">P&L</th>
                  <th className="px-6 py-4 text-right text-xs text-gray-400">%</th>
                </tr>
              </thead>

              <tbody>
                {positions.map((position, index) => {
                  const pnlPercent =
                    ((position.pnl / (position.avg_price * position.quantity)) * 100) || 0;

                  return (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/[0.02]">

                      <td className="px-6 py-4 text-white font-semibold">
                        {position.symbol}
                      </td>

                      <td className="px-6 py-4 text-right text-white">
                        {position.quantity}
                      </td>

                      <td className="px-6 py-4 text-right text-gray-300">
                        {formatCurrency(position.avg_price)}
                      </td>

                      <td className="px-6 py-4 text-right text-white">
                        {formatCurrency(position.ltp)}
                      </td>

                      <td className="px-6 py-4 text-right text-white">
                        {formatCurrency(position.ltp * position.quantity)}
                      </td>

                      <td className={`px-6 py-4 text-right font-semibold ${
                        position.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <div className="flex items-center justify-end">
                          {position.pnl >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {formatCurrency(position.pnl)}
                        </div>
                      </td>

                      <td className={`px-6 py-4 text-right font-semibold ${
                        pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {pnlPercent.toFixed(2)}%
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No open positions</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PositionsPage;
