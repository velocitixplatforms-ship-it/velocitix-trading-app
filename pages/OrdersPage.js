import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { Clock, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrdersPage = () => {
  const { getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/history`, { headers: getAuthHeader() });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="orders-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Order History</h1>
        <p className="text-sm text-gray-400">All your executed orders</p>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <div className="text-sm">Loading orders...</div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Time</th>
                  <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Symbol</th>
                  <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Type</th>
                  <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Side</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Quantity</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Price</th>
                  <th className="text-right text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Total</th>
                  <th className="text-left text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr 
                    key={order.order_id}
                    data-testid={`order-row-${order.order_id}`}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-2" />
                        {formatDateTime(order.executed_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">{order.symbol}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {order.order_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.side === 'buy' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {order.side === 'buy' ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono-data text-white">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono-data text-gray-300">
                      {formatCurrency(order.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono-data font-semibold text-white">
                      {formatCurrency(order.price * order.quantity)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders yet</p>
            <p className="text-xs mt-1">Your order history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;