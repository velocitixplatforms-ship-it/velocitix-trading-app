import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradingPage = () => {
  const { getAuthHeader } = useAuth();
  const { symbols = [], selectedSymbol = 'NIFTY 50', setSelectedSymbol } = useMarketData();

  const [searchQuery, setSearchQuery] = useState('');
  const [orderModal, setOrderModal] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  const selectedSymbolData = symbols.find(s => s.symbol === selectedSymbol);

  const filteredSymbols = symbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const placeOrder = async (side) => {
    setPlacingOrder(true);

    try {
      const orderData = {
        symbol: selectedSymbol,
        side,
        quantity: parseInt(quantity),
        order_type: orderType,
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined
      };

      await axios.post(`${API}/orders`, orderData, {
        headers: getAuthHeader()
      });

      toast.success(`${side.toUpperCase()} order executed`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Order failed');
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val || 0);
  };

  const openTradingView = (symbol) => {
    let tvSymbol = symbol.replace(/\s+/g, '').replace('&', '');
    if (tvSymbol === 'NIFTY50') tvSymbol = 'NIFTY';

    window.open(`https://www.tradingview.com/chart/?symbol=NSE:${tvSymbol}`, '_blank');
  };

  return (
    <div className="flex h-full bg-[#0B0F14] text-white">

      {/* WATCHLIST */}
      <div className="w-80 border-r border-white/5 flex flex-col">

        <div className="p-4 border-b border-white/5">
          <div className="text-sm font-semibold mb-3">Watchlist</div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search instruments"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#121722] border-white/10 text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSymbols.map((s) => (
            <div
              key={s.symbol}
              onClick={() => {
                setSelectedSymbol(s.symbol);
                openTradingView(s.symbol);
              }}
              className={`px-4 py-3 border-b border-white/5 cursor-pointer transition ${
                selectedSymbol === s.symbol
                  ? 'bg-[#1a2233]'
                  : 'hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex justify-between items-center">

                <div>
                  <div className="text-sm font-medium">{s.symbol}</div>
                  <div className="text-xs text-gray-400">{s.name}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">{formatCurrency(s.price)}</div>
                  <div className={`text-xs flex items-center justify-end ${
                    s.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {s.change >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                    {s.change_percent.toFixed(2)}%
                  </div>
                </div>

              </div>

              {/* Hover actions */}
              <div className="hidden group-hover:flex gap-2 mt-2">
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* CENTER PANEL */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center">

          <div>
            <div className="text-lg font-semibold">{selectedSymbol}</div>
            <div className="text-sm text-gray-400">
              {selectedSymbolData ? formatCurrency(selectedSymbolData.price) : '--'}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOrderModal({ side: 'buy' })}
              className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium"
            >
              Buy
            </button>

            <button
              onClick={() => setOrderModal({ side: 'sell' })}
              className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium"
            >
              Sell
            </button>
          </div>

        </div>

        {/* EMPTY STATE (NO EMBEDDED CHART) */}
        <div className="flex-1 flex items-center justify-center text-center">

          <div>
            <div className="text-lg mb-2">Advanced Chart</div>
            <div className="text-gray-400 text-sm mb-4">
              Open full TradingView chart for detailed analysis
            </div>

            <button
              onClick={() => openTradingView(selectedSymbol)}
              className="px-5 py-2 bg-blue-600 rounded-lg text-sm"
            >
              Open Chart
            </button>
          </div>

        </div>

      </div>

      {/* ORDER MODAL */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#121722] w-[420px] rounded-xl border border-white/10">

            <div className={`px-4 py-3 text-sm font-semibold ${
              orderModal.side === 'buy'
                ? 'bg-green-600'
                : 'bg-red-600'
            }`}>
              {orderModal.side.toUpperCase()} {selectedSymbol}
            </div>

            <div className="p-4 space-y-4">

              <div>
                <div className="text-xs text-gray-400 mb-1">Quantity</div>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 px-3 py-2 rounded"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2 rounded ${
                    orderType === 'market'
                      ? 'bg-blue-600'
                      : 'bg-[#0B0F14]'
                  }`}
                >
                  Market
                </button>

                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2 rounded ${
                    orderType === 'limit'
                      ? 'bg-blue-600'
                      : 'bg-[#0B0F14]'
                  }`}
                >
                  Limit
                </button>
              </div>

              {orderType === 'limit' && (
                <input
                  type="number"
                  placeholder="Price"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-[#0B0F14] border border-white/10 px-3 py-2 rounded"
                />
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setOrderModal(null)}
                  className="flex-1 py-2 bg-gray-700 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    placeOrder(orderModal.side);
                    setOrderModal(null);
                  }}
                  className={`flex-1 py-2 ${
                    orderModal.side === 'buy'
                      ? 'bg-green-600'
                      : 'bg-red-600'
                  } rounded`}
                >
                  Execute
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default TradingPage;
