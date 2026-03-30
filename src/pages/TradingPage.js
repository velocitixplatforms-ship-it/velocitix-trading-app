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
      toast.success(`${side.toUpperCase()} EXECUTED`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Execution failed');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-[#0A0F1C] via-[#0D1422] to-[#0A0F1C] text-white">

      {/* WATCHLIST */}
      <div className="w-72 border-r border-white/[0.05] bg-black/20 backdrop-blur-xl flex flex-col">

        <div className="px-4 py-3 border-b border-white/[0.05]">
          <div className="text-[10px] text-gray-500 tracking-widest">MARKET WATCH</div>
          <div className="text-sm font-semibold mt-1">Equity Universe</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {symbols.map((s) => (
            <div
              key={s.symbol}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={`px-4 py-3 cursor-pointer border-b border-white/[0.03] transition-all ${
                selectedSymbol === s.symbol
                  ? 'bg-white/[0.04]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold tracking-tight">
                  {s.symbol}
                </span>
                <span className="text-sm font-mono text-gray-200">
                  {format(s.price)}
                </span>
              </div>

              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-gray-500 truncate w-32">
                  {s.name}
                </span>
                <span className={`text-[11px] font-medium ${
                  s.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {s.change >= 0 ? '+' : ''}
                  {s.change_percent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER */}
      <div className="flex-1 flex flex-col">

        {/* INSTRUMENT HEADER */}
        <div className="px-6 py-4 border-b border-white/[0.05] bg-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">

            <div>
              <div className="text-xl font-semibold tracking-tight">
                {selectedSymbol}
              </div>

              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-mono text-gray-200">
                  {selected ? format(selected.price) : '--'}
                </span>

                {selected && (
                  <span className={`text-sm font-medium ${
                    selected.change >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}>
                    {selected.change >= 0 ? '+' : ''}
                    {selected.change} ({selected.change_percent.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              NSE • REALTIME
            </div>

          </div>
        </div>

        {/* CHART AREA */}
        <div className="flex-1 relative">

          {/* Grid background */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm tracking-wide">
            Professional Charting Engine (Coming Next)
          </div>
        </div>
      </div>

      {/* ORDER PANEL */}
      <div className="w-80 border-l border-white/[0.05] bg-black/20 backdrop-blur-xl flex flex-col">

        <div className="p-5 border-b border-white/[0.05]">
          <div className="text-[10px] text-gray-500 tracking-widest">ORDER WINDOW</div>
          <div className="text-lg font-semibold mt-1">{selectedSymbol}</div>
        </div>

        <div className="p-5 space-y-5">

          {/* BUY SELL */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => placeOrder('buy')}
              className="py-2 bg-emerald-500/90 hover:bg-emerald-500 rounded text-sm font-semibold"
            >
              BUY
            </button>

            <button
              onClick={() => placeOrder('sell')}
              className="py-2 bg-red-500/90 hover:bg-red-500 rounded text-sm font-semibold"
            >
              SELL
            </button>
          </div>

          {/* ORDER TYPE */}
          <div>
            <div className="text-[10px] text-gray-500 mb-2 tracking-widest">ORDER TYPE</div>
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
          </div>

          {/* QTY */}
          <div>
            <div className="text-[10px] text-gray-500 mb-1 tracking-widest">QUANTITY</div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#0B0F14] border border-white/10 px-3 py-2 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* PRICE */}
          {orderType === 'limit' && (
            <div>
              <div className="text-[10px] text-gray-500 mb-1 tracking-widest">PRICE</div>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full bg-[#0B0F14] border border-white/10 px-3 py-2 rounded text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="mt-auto p-5 border-t border-white/[0.05]">

          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-500">Estimated Value</span>
            <span className="font-mono text-white">
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
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold tracking-wide"
          >
            EXECUTE ORDER
          </button>

        </div>
      </div>
    </div>
  );
};

export default TradingPage;
