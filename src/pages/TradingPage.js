import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TradingPage = () => {
  const { getAuthHeader } = useAuth();
  const { symbols = [], selectedSymbol = 'NIFTY 50', setSelectedSymbol } = useMarketData();

  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderModal, setOrderModal] = useState(null);

  const selectedSymbolData = symbols.find(s => s.symbol === selectedSymbol);

  const filteredSymbols = symbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    symbol.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const placeOrder = async (side) => {
    if (!selectedSymbol) {
      toast.error('Please select a symbol');
      return;
    }

    setPlacingOrder(true);

    try {
      const orderData = {
        symbol: selectedSymbol,
        side,
        quantity: parseInt(quantity),
        order_type: orderType,
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined
      };

      await axios.post(`${API}/orders`, orderData, { headers: getAuthHeader() });

      toast.success(`${side.toUpperCase()} order placed successfully!`);
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const openTradingView = (symbol) => {
    let tvSymbol = symbol.replace(/\s+/g, '').replace('&', '');
    if (tvSymbol === 'NIFTY50') tvSymbol = 'NIFTY';

    window.open(`https://www.tradingview.com/chart/?symbol=NSE:${tvSymbol}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">

      <div className="w-full lg:w-80 bg-[#131722] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white mb-3">Watchlist</h2>
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSymbols.map((symbol) => (
            <div
              key={symbol.symbol}
              className={`group px-4 py-3 flex justify-between items-center hover:bg-gray-800 cursor-pointer ${
                selectedSymbol === symbol.symbol ? 'bg-gray-700' : ''
              }`}
            >
              <div
                onClick={() => {
                  setSelectedSymbol(symbol.symbol);
                  openTradingView(symbol.symbol);
                }}
                className="flex-1"
              >
                <div className="text-white text-sm">{symbol.symbol}</div>
                <div className="text-gray-400 text-xs">{symbol.name}</div>
              </div>

              <div className="text-right mr-3">
                <div className="text-white text-sm">
                  {formatCurrency(symbol.price)}
                </div>
                <div className={symbol.change >= 0 ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>
                  {symbol.change_percent.toFixed(2)}%
                </div>
              </div>

              <div className="hidden group-hover:flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOrderModal({ side: 'buy', symbol: symbol.symbol });
                  }}
                  className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                >
                  Buy
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOrderModal({ side: 'sell', symbol: symbol.symbol });
                  }}
                  className="bg-red-600 text-white px-2 py-1 text-xs rounded"
                >
                  Sell
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black text-white">
        <div>
          <h2>{selectedSymbol}</h2>
          <button onClick={() => openTradingView(selectedSymbol)}>
            Open Chart
          </button>
        </div>
      </div>

      <div className="w-full lg:w-80 bg-[#131722] p-4">
        <Button onClick={() => setOrderModal({ side: 'buy', symbol: selectedSymbol })}>
          BUY
        </Button>

        <Button onClick={() => setOrderModal({ side: 'sell', symbol: selectedSymbol })} className="mt-2">
          SELL
        </Button>
      </div>

      {orderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-[#131722] w-[380px] rounded-xl border border-white/10 overflow-hidden">

            <div className={`px-4 py-3 text-white font-semibold ${
              orderModal.side === 'buy' ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {orderModal.symbol}
            </div>

            <div className="p-4 space-y-4">

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-1 rounded">Quick</button>
                <button className="flex-1 bg-gray-700 text-gray-300 py-1 rounded">Regular</button>
              </div>

              <div>
                <div className="text-gray-400 text-xs">Quantity</div>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-1 rounded ${
                    orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Market
                </button>

                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-1 rounded ${
                    orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  Limit
                </button>
              </div>

              {orderType === 'limit' && (
                <div>
                  <div className="text-gray-400 text-xs">Price</div>
                  <Input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setOrderModal(null)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setSelectedSymbol(orderModal.symbol);
                    placeOrder(orderModal.side);
                    setOrderModal(null);
                  }}
                  className={`flex-1 py-2 text-white rounded ${
                    orderModal.side === 'buy' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {orderModal.side.toUpperCase()}
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
