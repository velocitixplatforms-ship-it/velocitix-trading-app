import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/contexts/MarketDataContext';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

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
  console.log("Placing order:", {
    symbol: selectedSymbol,
    quantity,
    orderType,
    limitPrice
  });

  setPlacingOrder(true);

  try {
    const orderData = {
      symbol: selectedSymbol,
      side,
      quantity: parseInt(quantity),
      order_type: orderType,
      price: orderType === 'limit' ? parseFloat(limitPrice) : undefined
    };

    console.log("API URL:", `${API}/orders`);
    console.log("Payload:", orderData);

    const res = await axios.post(
      `${API}/orders`,
      orderData,
      { headers: getAuthHeader() }
    );

    console.log("Response:", res.data);

    toast.success(`${side.toUpperCase()} order placed successfully!`);
  } catch (error) {
    console.log("ERROR:", error);
    console.log("ERROR RESPONSE:", error.response);

    toast.error(
      error.response?.data?.detail || "Order failed"
    );
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

      {/* Sidebar */}
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
                    setSelectedSymbol(symbol.symbol);
                    setOrderModal({ side: 'buy', symbol: symbol.symbol });
                  }}
                  className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                >
                  Buy
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSymbol(symbol.symbol);
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

      {/* Center */}
      <div className="flex-1 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl mb-3">{selectedSymbol}</h2>
          <button
            onClick={() => openTradingView(selectedSymbol)}
            className="px-4 py-2 bg-blue-600 rounded-lg"
          >
            Open Chart
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-80 bg-[#131722] p-4 space-y-3">
        <Button onClick={() => setOrderModal({ side: 'buy', symbol: selectedSymbol })}>
          BUY
        </Button>

        <Button onClick={() => setOrderModal({ side: 'sell', symbol: selectedSymbol })}>
          SELL
        </Button>
      </div>

      {/* 🔥 PRO TRADING MODAL */}
      {orderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-[#0b1220] w-[440px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className={`px-5 py-3 text-white font-semibold text-sm flex justify-between ${
              orderModal.side === 'buy'
                ? 'bg-gradient-to-r from-green-600 to-green-500'
                : 'bg-gradient-to-r from-red-600 to-red-500'
            }`}>
              <span>{orderModal.symbol}</span>
              <span className="text-xs opacity-80">
                {selectedSymbolData ? formatCurrency(selectedSymbolData.price) : '--'}
              </span>
            </div>

            <div className="p-5 space-y-5">

              {/* Tabs */}
              <div className="flex bg-[#020617] rounded-lg p-1">
                <button className="flex-1 py-1.5 text-xs rounded-md bg-blue-600 text-white">Quick</button>
                <button className="flex-1 py-1.5 text-xs text-gray-400">Regular</button>
                <button className="flex-1 py-1.5 text-xs text-gray-400">Iceberg</button>
              </div>

              {/* Quantity */}
              <div>
                <div className="text-xs text-gray-400 mb-1">Quantity</div>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 text-white px-3 py-2 rounded-lg"
                />
              </div>

              {/* Order Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2 rounded-lg ${
                    orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-[#020617] text-gray-400'
                  }`}
                >
                  Market
                </button>

                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2 rounded-lg ${
                    orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-[#020617] text-gray-400'
                  }`}
                >
                  Limit
                </button>
              </div>

              {/* Price */}
              {orderType === 'limit' && (
                <input
                  type="number"
                  placeholder="Price"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-[#020617] border border-white/10 text-white px-3 py-2 rounded-lg"
                />
              )}

              {/* Order Value */}
              <div className="bg-[#020617] p-3 rounded-lg border border-white/5 text-sm flex justify-between">
                <span className="text-gray-400">Order Value</span>
                <span className="text-white">
                  {selectedSymbolData
                    ? formatCurrency(
                        (orderType === 'limit' && limitPrice
                          ? parseFloat(limitPrice)
                          : selectedSymbolData.price) * quantity
                      )
                    : '--'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setOrderModal(null)}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    placeOrder(orderModal.side);
                    setOrderModal(null);
                  }}
                  className={`flex-1 py-2 text-white rounded-lg ${
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
