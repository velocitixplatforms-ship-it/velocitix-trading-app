import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import TradingChart from '@/components/TradingChart';
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
  const { symbols, selectedSymbol, setSelectedSymbol } = useMarketData();
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

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden relative z-0" data-testid="trading-page">
      {/* Watchlist Sidebar */}
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
              data-testid="symbol-search-input"
              className="pl-10 bg-[#0b0f14] border-white/10 focus:border-blue-500/50 text-white h-10 rounded-xl"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredSymbols.map((symbol) => (
            <button
              key={symbol.symbol}
              onClick={() => setSelectedSymbol(symbol.symbol)}
              data-testid={`watchlist-symbol-${symbol.symbol}`}
              className={`w-full px-4 py-3.5 flex items-center justify-between border-b border-white/5 hover:bg-blue-500/10 transition-all duration-150 ${
                selectedSymbol === symbol.symbol ? 'bg-blue-500/20 border-l-2 border-l-blue-500' : ''
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-sm text-white">{symbol.symbol}</div>
                <div className="text-xs text-gray-400 truncate max-w-[180px]">{symbol.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono-data text-sm font-medium text-white">
                  {formatCurrency(symbol.price)}
                </div>
                <div className={`text-xs font-mono-data flex items-center justify-end ${
                  symbol.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {symbol.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {symbol.change_percent >= 0 ? '+' : ''}{symbol.change_percent.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-0">
        {/* Chart Section */}
        <div className="flex-1 bg-[#0A0A0A] p-4">
          <div className="h-full bg-[#121212] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSymbol}</h3>
                {selectedSymbolData && (
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-2xl font-bold font-mono-data text-white">
                      {formatCurrency(selectedSymbolData.price)}
                    </span>
                    <span className={`text-sm font-mono-data flex items-center ${
                      selectedSymbolData.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {selectedSymbolData.change >= 0 ? '+' : ''}{formatCurrency(selectedSymbolData.change)}
                      ({selectedSymbolData.change_percent >= 0 ? '+' : ''}{selectedSymbolData.change_percent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[calc(100%-100px)] relative z-0 bg-[#131722] rounded-lg border border-[#1f2937] p-3">
              <TradingChart 
                symbol={selectedSymbol} 
                currentPrice={selectedSymbolData?.price || 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order Panel */}
      <div className="w-full lg:w-96 bg-[#131722] border-l border-white/5 flex flex-col relative z-0">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Place Order
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Symbol Display */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4">
            <div className="text-xs text-gray-400 mb-1">Selected Symbol</div>
            <div className="text-lg font-bold text-white">{selectedSymbol}</div>
            {selectedSymbolData && (
              <div className="text-sm font-mono-data text-gray-300 mt-1">
                LTP: {formatCurrency(selectedSymbolData.price)}
              </div>
            )}
          </div>

          {/* Order Type Toggle */}
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 block">Order Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrderType('market')}
                data-testid="order-type-market"
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  orderType === 'market'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0A0A0A] text-gray-400 hover:bg-white/5 border border-white/10'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                data-testid="order-type-limit"
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  orderType === 'limit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0A0A0A] text-gray-400 hover:bg-white/5 border border-white/10'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-300 mb-2 block">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              data-testid="order-quantity-input"
              className="bg-[#0A0A0A] border-white/10 focus:border-blue-500/50 text-white h-11"
            />
          </div>

          {/* Limit Price (if limit order) */}
          {orderType === 'limit' && (
            <div>
              <Label htmlFor="limitPrice" className="text-sm font-medium text-gray-300 mb-2 block">Limit Price (₹)</Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                data-testid="order-limit-price-input"
                className="bg-[#0A0A0A] border-white/10 focus:border-blue-500/50 text-white h-11"
              />
            </div>
          )}

          {/* Buy/Sell Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => placeOrder('buy')}
              disabled={placingOrder}
              data-testid="place-buy-order-button"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              {placingOrder ? 'Placing...' : 'BUY'}
            </Button>
            <Button
              onClick={() => placeOrder('sell')}
              disabled={placingOrder}
              data-testid="place-sell-order-button"
              className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-xl transition-all duration-150 active:scale-95 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
            >
              {placingOrder ? 'Placing...' : 'SELL'}
            </Button>
          </div>

          {/* Order Summary */}
          {selectedSymbolData && quantity > 0 && (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order Value</span>
                <span className="font-mono-data text-white font-semibold">
                  {formatCurrency(
                    (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : selectedSymbolData.price) * quantity
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingPage;