import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
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

  const format = (v) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(v || 0);

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

  return (
    <div className="flex h-full bg-[#0B0F14] text-white">

      {/* LEFT SIDEBAR (existing stays) */}

      {/* WATCHLIST */}
      <div className="w-72 border-r border-white/[0.06] bg-[#121A24] flex flex-col">

        <div className="px-3 py-3 border-b border-white/[0.06] text-xs text-gray-400 tracking-wide">
          WATCHLIST
        </div>

        <div className="flex-1 overflow-y-auto">
          {symbols.map((s) => (
            <div
              key={s.symbol}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={`px-3 py-2 cursor-pointer border-b border-white/[0.04] hover:bg-[#1A2330] ${
                selectedSymbol === s.symbol ? 'bg-[#1A2330]' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold tracking-tight">
                  {s.symbol}
                </div>
                <div className="text-sm font-mono">
                  {format(s.price)}
                </div>
              </div>

              <div className="flex justify-between mt-1">
                <div className="text-[11px] text-gray-500">
                  {s.name}
                </div>
                <div className={`text-[11px] font-medium ${
                  s.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {s.change >= 0 ? '+' : ''}
                  {s.change_percent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col bg-[#0B0F14]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center">
          <div>
            <div className="text-lg font-semibold tracking-tight">
              {selectedSymbol}
            </div>
            <div className="text-sm text-gray-400 font-mono">
              {selected ? format(selected.price) : '--'}
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
            No chart loaded
          </div>
        </div>
      </div>

      {/* ORDER PANEL */}
      <div className="w-80 border-l border-white/[0.06] bg-[#121A24] flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="text-xs text-gray-400 mb-1 tracking-wide">ORDER</div>
          <div className="text-lg font-semibold">{selectedSymbol}</div>
        </div>

        <div className="p-4 space-y-4">

          {/* Buy Sell */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => placeOrder('buy')}
              disabled={placingOrder}
              className="py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-semibold"
            >
              BUY
            </button>

            <button
              onClick={() => placeOrder('sell')}
              disabled={placingOrder}
              className="py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold"
            >
              SELL
            </button>
          </div>

          {/* Order Type */}
          <div className="flex bg-[#0B0F14] rounded p-1">
            <button
              onClick={() => setOrderType('market')}
              className={`flex-1 py-1 text-xs rounded ${
                orderType === 'market'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400'
              }`}
            >
              MARKET
            </button>

            <button
              onClick={() => setOrderType('limit')}
              className={`flex-1 py-1 text-xs rounded ${
                orderType === 'limit'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400'
              }`}
            >
              LIMIT
            </button>
          </div>

          {/* Quantity */}
          <div>
            <div className="text-[11px] text-gray-500 mb-1">QUANTITY</div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0B0F14] border border-white/10 px-3 py-2 rounded text-white"
            />
          </div>

          {/* Price */}
          {orderType === 'limit' && (
            <div>
              <div className="text-[11px] text-gray-500 mb-1">PRICE</div>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 px-3 py-2 rounded text-white"
              />
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="mt-auto p-4 border-t border-white/[0.06]">

          <div className="flex justify-between text-sm mb-2">
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

          <button
            onClick={() => placeOrder('buy')}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
          >
            PLACE ORDER
          </button>

        </div>

      </div>

    </div>
  );
};

export default TradingPage;
