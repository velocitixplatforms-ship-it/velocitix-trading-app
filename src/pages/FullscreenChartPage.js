import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, TrendingUp } from 'lucide-react';
import TradingChart from '@/components/TradingChart';
import { useMarketData } from '@/contexts/MarketDataContext';

const FullscreenChartPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { marketData } = useMarketData();
  
  const symbolParam = searchParams.get('symbol') || 'NIFTY 50';
  const [selectedSymbol, setSelectedSymbol] = useState(symbolParam);
  const selectedSymbolData = marketData.find(s => s.symbol === selectedSymbol);

  useEffect(() => {
    // Keyboard shortcut: ESC to exit fullscreen
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        navigate('/trade');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#131722] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white font-[Manrope]">VelocitiX <span className="text-blue-400">Chart</span></span>
          </div>

          {/* Symbol Info */}
          <div className="ml-6 flex items-center space-x-3">
            <div>
              <div className="text-sm text-gray-400">Symbol</div>
              <div className="text-lg font-bold text-white">{selectedSymbol}</div>
            </div>
            {selectedSymbolData && (
              <>
                <div className="text-3xl font-bold font-mono-data text-white">
                  ₹{selectedSymbolData.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`text-sm font-mono-data flex items-center ${
                  selectedSymbolData.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {selectedSymbolData.change >= 0 ? '+' : ''}
                  {selectedSymbolData.change.toFixed(2)} ({selectedSymbolData.change_percent >= 0 ? '+' : ''}{selectedSymbolData.change_percent.toFixed(2)}%)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={() => navigate('/trade')}
          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-150 border border-white/10 hover:border-red-500/30"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">Exit Fullscreen</span>
        </button>
      </div>

      {/* Fullscreen Chart */}
      <div className="flex-1 p-6">
        <div className="h-full bg-[#131722] rounded-2xl border border-[#1f2937] p-4">
          <TradingChart 
            symbol={selectedSymbol}
            currentPrice={selectedSymbolData?.price || 0}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenChartPage;
