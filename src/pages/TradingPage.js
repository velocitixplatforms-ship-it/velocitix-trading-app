import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';

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

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    if (orderType === 'limit' && !limitPrice) {
      toast.error('Please enter limit price');
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

      toast.success(`${side.toUpperCase()} order placed successfully!`, {
        description: `${quantity} x ${selectedSymbol}`
      });

      setQuantity(1);
      setLimitPrice('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
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

  const openTradingView = (symbol) => {
    let tvSymbol = symbol
      .replace(/\s+/g, '')
      .replace('&', '');

    if (tvSymbol === 'NIFTY50') tvSymbol = 'NIFTY';

    window.open(
      `https://www.tradingview.com/chart/?symbol=NSE:${tvSymbol}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">

      <div className="w-full lg:w-80 bg-[#131722] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white mb-3">Watchlist</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0b0f14] border-white/10 text-white h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredSymbols.map((symbol) => (
            <div
              key={symbol.symbol}
              onClick={() => {
                setSelectedSymbol(symbol.symbol);
                openTradingView(symbol.symbol);
              }}
              className={`w-full px-4 py-3.5 flex items-center justify-between border-b border-white/5 hover:bg-blue-500/10 cursor-pointer ${
                selectedSymbol === symbol.symbol ? 'bg-blue-500/20 border-l-2 border-l-blue-500' : ''
              }`}
            >
              <div>
                <div className="font-semibold text-sm text-white">{symbol.symbol}</div>
                <div className="text-xs text-gray-400">{symbol.name}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-white">
                  {formatCurrency(symbol.price)}
                </div>
                <div className={`text-xs flex items-center justify-end ${
                  symbol.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {symbol.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {symbol.change_percent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-[#0A0A0A] p-4">
          <div className="h-full bg-[#121212] border border-white/5 rounded-xl flex flex-col">

            <div className="p-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">{selectedSymbol}</h3>
              {selectedSymbolData && (
                <div className="text-white mt-1">
                  {formatCurrency(selectedSymbolData.price)}
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center justify-center text-center px-6">
              <div>
                <h3 className="text-lg text-white mb-2">Open Chart in TradingView</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Click any symbol to view full chart
                </p>
                <button
                  onClick={() => openTradingView(selectedSymbol)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Open {selectedSymbol}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-[#131722] border-l border-white/5 p-4">
        <h2 className="text-white mb-4 flex items-center">
          <Activity className="mr-2" /> Place Order
        </h2>

        <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

        <Button onClick={() => placeOrder('buy')} className="w-full mt-3">
          BUY
        </Button>

        <Button onClick={() => placeOrder('sell')} className="w-full mt-2">
          SELL
        </Button>
      </div>

    </div>
  );
};

export default TradingPage;
