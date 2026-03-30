import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradingPage = () => {
  const { getAuthHeader } = useAuth();
  const { symbols = [], selectedSymbol, setSelectedSymbol } = useMarketData();

  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const selected = symbols.find(s => s.symbol === selectedSymbol);

  const placeOrder = async (side) => {
    setPlacingOrder(true);

    try {
      await axios.post(
        `${API}/orders`,
        {
          symbol: selectedSymbol,
          side,
          quantity: Number(quantity),
          order_type: orderType,
          price: orderType === 'limit' ? Number(limitPrice) : undefined
        },
        { headers: getAuthHeader() }
      );

      toast.success(`${side.toUpperCase()} order executed`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Order failed');
    } finally {
      setPlacingOrder(false);
    }
  };

  const format = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(v || 0);

  return (
    <div className="flex h-full bg-[#0B0F14] text-white">

      {/* LEFT PANEL - WATCHLIST */}
      <div className="w-72 border-r border-white/5 bg-[#121A24] flex flex-col">

        <div className="px-4 py-3 border-b border-white/5 text-sm text-gray-400">
          WATCHLIST
        </div>

        <div className="flex-1 overflow-y-auto">
          {symbols.map((s) => (
            <div
              key={s.symbol}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={`px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-[#182230] ${
                selectedSymbol === s.symbol ? 'bg-[#182230]' : ''
              }`}
            >
              <div>
                <div className="text-sm font-medium">{s.symbol}</div>
                <div className="text-xs text-gray-500">{s.name}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-mono">{format(s.price)}</div>
                <div className={`text-xs ${
                  s.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {s.change_percent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold">{selectedSymbol}</div>
            <div className="text-sm text-gray-400">
              {selected ? format(selected.price) : '--'}
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Chart Area (TradingView integration here)
        </div>
      </div>

      {/* RIGHT PANEL - ORDER */}
      <div className="w-80 border-l border-white/5 bg-[#121A24] p-5 flex flex-col">

        {/* Buy/Sell Toggle */}
        <div className="flex mb-4">
          <button
            onClick={() => placeOrder('buy')}
            disabled={placingOrder}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-l-lg text-sm font-semibold"
          >
            BUY
          </button>
          <button
            onClick={() => placeOrder('sell')}
            disabled={placingOrder}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-r-lg text-sm font-semibold"
          >
            SELL
          </button>
        </div>

        {/* Order Type */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-2 rounded ${
              orderType === 'market'
                ? 'bg-blue-600'
                : 'bg-[#182230] text-gray-400'
            }`}
          >
            Market
          </button>

          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-2 rounded ${
              orderType === 'limit'
                ? 'bg-blue-600'
                : 'bg-[#182230] text-gray-400'
            }`}
          >
            Limit
          </button>
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-1">QUANTITY</div>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-[#182230] border border-white/10 px-3 py-2 rounded text-white"
          />
        </div>

        {/* Limit Price */}
        {orderType === 'limit' && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-1">PRICE</div>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full bg-[#182230] border border-white/10 px-3 py-2 rounded text-white"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="mt-auto bg-[#182230] p-3 rounded-lg border border-white/5 text-sm flex justify-between">
          <span className="text-gray-400">Order Value</span>
          <span className="font-mono">
            {selected
              ? format(
                  (orderType === 'limit' && limitPrice
                    ? Number(limitPrice)
                    : selected.price) * quantity
                )
              : '--'}
          </span>
        </div>

      </div>
    </div>
  );
};

export default TradingPage;
