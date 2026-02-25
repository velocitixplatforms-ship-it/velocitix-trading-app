import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { TrendingUp, Activity, BarChart3 } from 'lucide-react';

const TIMEFRAMES = [
  { label: '1m', value: 60, candles: 200 },
  { label: '5m', value: 300, candles: 200 },
  { label: '15m', value: 900, candles: 150 },
  { label: '30m', value: 1800, candles: 150 },
  { label: '1H', value: 3600, candles: 120 },
  { label: '1D', value: 86400, candles: 100 }
];

// Volatility factors for different symbol types (realistic for Indian markets)
const VOLATILITY_MAP = {
  'NIFTY 50': 0.03,      // Index - low volatility
  'BANKNIFTY': 0.04,     // Bank index - slightly higher
  'RELIANCE': 0.05,      // Large cap - medium
  'INFY': 0.06,          // Large cap tech
  'TCS': 0.05,           // Large cap IT
  'HDFCBANK': 0.04,      // Banking large cap
  'ICICIBANK': 0.05,
  'SBIN': 0.07,          // Higher volatility
  'default': 0.05        // Default medium volatility
};

// Get volatility factor for symbol
const getVolatility = (symbolName) => {
  return VOLATILITY_MAP[symbolName] || VOLATILITY_MAP['default'];
};

// Generate small random change with gaussian-like distribution
const generateGaussianNoise = () => {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * 0.3; // Scale down for small movements
};

const TradingChart = ({ symbol, currentPrice }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const emaSeriesRef = useRef(null);
  const vwapSeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const rsiChartRef = useRef(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[2]); // Default: 15m
  const [indicators, setIndicators] = useState({
    ema: false,
    vwap: false,
    rsi: false
  });
  const lastUpdateRef = useRef(0);
  const symbolRef = useRef(symbol);
  const trendDirectionRef = useRef(1); // 1: bullish, -1: bearish, 0: consolidation
  const trendStrengthRef = useRef(0.3); // 0 to 1 (start with gentle trend)
  const phaseCounterRef = useRef(0); // Counter to change market phases
  const lockedHistoricalRef = useRef(null); // Lock historical data
  const lastPriceRef = useRef(0); // Track last price for smooth updates

  // Calculate EMA
  const calculateEMA = useCallback((data, period = 20) => {
    const k = 2 / (period + 1);
    let ema = data[0]?.close || 0;
    
    return data.map(candle => {
      ema = candle.close * k + ema * (1 - k);
      return {
        time: candle.time,
        value: parseFloat(ema.toFixed(2))
      };
    });
  }, []);

  // Calculate VWAP
  const calculateVWAP = useCallback((data) => {
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;
    
    return data.map(candle => {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      const volume = Math.random() * 1000000; // Simulated volume
      cumulativeTPV += typicalPrice * volume;
      cumulativeVolume += volume;
      
      return {
        time: candle.time,
        value: parseFloat((cumulativeTPV / cumulativeVolume).toFixed(2))
      };
    });
  }, []);

  // Calculate RSI
  const calculateRSI = useCallback((data, period = 14) => {
    const rsiData = [];
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      
      if (i <= period) {
        if (change > 0) gains += change;
        else losses -= change;
      } else {
        if (change > 0) {
          gains = (gains * (period - 1) + change) / period;
          losses = (losses * (period - 1)) / period;
        } else {
          gains = (gains * (period - 1)) / period;
          losses = (losses * (period - 1) - change) / period;
        }
      }
      
      if (i >= period) {
        const rs = gains / (losses || 1);
        const rsi = 100 - (100 / (1 + rs));
        rsiData.push({
          time: data[i].time,
          value: parseFloat(rsi.toFixed(2))
        });
      }
    }
    
    return rsiData;
  }, []);

  // Generate realistic historical data based on timeframe with SMOOTH trends
  const generateHistoricalData = useCallback((basePrice, timeframe) => {
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    const candleInterval = timeframe.value;
    const numCandles = timeframe.candles;
    
    const volatility = getVolatility(symbol);
    let price = basePrice * 0.97; // Start from 97% of current price
    let trendDirection = 1; // Start bullish to reach current price
    let trendStrength = 0.4;
    let phaseLength = 0;
    let maxPhaseLength = 20 + Math.floor(Math.random() * 25); // 20-45 candles per phase
    
    for (let i = numCandles; i >= 0; i--) {
      const time = now - (i * candleInterval);
      
      // Change market phase periodically
      phaseLength++;
      if (phaseLength >= maxPhaseLength) {
        phaseLength = 0;
        maxPhaseLength = 20 + Math.floor(Math.random() * 25);
        const rand = Math.random();
        if (rand < 0.35) {
          trendDirection = 1; // Bullish
          trendStrength = 0.3 + Math.random() * 0.3;
        } else if (rand < 0.7) {
          trendDirection = -1; // Bearish
          trendStrength = 0.3 + Math.random() * 0.3;
        } else {
          trendDirection = 0; // Consolidation
          trendStrength = 0.15 + Math.random() * 0.15;
        }
      }
      
      const open = price;
      
      // REALISTIC PRICE MOVEMENT: Trend + Noise model
      // Base movement: 0.02% - 0.05% per candle (very small)
      const baseMove = volatility * 0.01 * (0.02 + Math.random() * 0.03);
      const trendComponent = trendDirection * trendStrength * baseMove;
      const noiseComponent = generateGaussianNoise() * baseMove * 0.5;
      
      // Combine trend and noise
      const priceChangePercent = trendComponent + noiseComponent;
      const close = open * (1 + priceChangePercent);
      
      // Calculate high/low with VERY SMALL wicks (realistic)
      const bodySize = Math.abs(close - open);
      const wickRatio = 0.2 + Math.random() * 0.3; // 20-50% of body
      const maxWick = Math.max(bodySize * wickRatio, open * volatility * 0.002);
      
      const upperWick = maxWick * (0.3 + Math.random() * 0.7);
      const lowerWick = maxWick * (0.3 + Math.random() * 0.7);
      
      const high = Math.max(open, close) + upperWick;
      const low = Math.min(open, close) - lowerWick;
      
      data.push({
        time: Math.floor(time),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      });
      
      price = close;
    }
    
    // Ensure last candle is close to current price
    if (data.length > 0) {
      const lastCandle = data[data.length - 1];
      data[data.length - 1].close = parseFloat(currentPrice.toFixed(2));
      data[data.length - 1].high = Math.max(
        lastCandle.high, 
        lastCandle.open, 
        currentPrice
      );
      data[data.length - 1].low = Math.min(
        lastCandle.low, 
        lastCandle.open, 
        currentPrice
      );
    }
    
    return data;
  }, [currentPrice, symbol]);

  // Initialize main chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: indicators.rsi ? chartContainerRef.current.clientHeight * 0.7 : chartContainerRef.current.clientHeight,
        layout: {
          background: { type: 'solid', color: '#131722' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: 'rgba(197, 203, 206, 0.05)' },
          horzLines: { color: 'rgba(197, 203, 206, 0.05)' },
        },
        crosshair: {
          mode: 1,
          vertLine: {
            width: 1,
            color: 'rgba(197, 203, 206, 0.5)',
            style: 0,
          },
          horzLine: {
            width: 1,
            color: 'rgba(197, 203, 206, 0.5)',
            style: 0,
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.1)',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.1)',
          timeVisible: true,
          secondsVisible: false,
        },
        localization: {
          locale: 'en-IN',
          priceFormatter: (price) => {
            return '₹' + price.toFixed(2);
          },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });
      chart.subscribeCrosshairMove(() => {});

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: indicators.rsi ? chartContainerRef.current.clientHeight * 0.7 : chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (emaSeriesRef.current) emaSeriesRef.current = null;
        if (vwapSeriesRef.current) vwapSeriesRef.current = null;
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }, [indicators.rsi]);

  // Initialize historical data ONCE when symbol or timeframe changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || !currentPrice) return;

    // Only regenerate if symbol changed or timeframe changed or no locked data
    const shouldRegenerate = 
      symbolRef.current !== symbol || 
      !lockedHistoricalRef.current ||
      lockedHistoricalRef.current.timeframe !== selectedTimeframe.value;

    if (!shouldRegenerate) return;

    try {
      const data = generateHistoricalData(currentPrice, selectedTimeframe);
      setHistoricalData(data);
      candlestickSeriesRef.current.setData(data);
      
      // Lock this historical data
      lockedHistoricalRef.current = {
        data: [...data],
        timeframe: selectedTimeframe.value
      };
      
      // Initialize trend direction
      trendDirectionRef.current = Math.random() < 0.5 ? 1 : -1;
      trendStrengthRef.current = 0.3 + Math.random() * 0.4;
      phaseCounterRef.current = 0;
      
      // Update indicators
      if (indicators.ema && chartRef.current) {
        if (emaSeriesRef.current) {
          chartRef.current.removeSeries(emaSeriesRef.current);
        }
        const emaSeries = chartRef.current.addLineSeries({
          color: '#2962FF',
          lineWidth: 2,
          title: 'EMA(20)',
        });
        const emaData = calculateEMA(data, 20);
        emaSeries.setData(emaData);
        emaSeriesRef.current = emaSeries;
      }

      if (indicators.vwap && chartRef.current) {
        if (vwapSeriesRef.current) {
          chartRef.current.removeSeries(vwapSeriesRef.current);
        }
        const vwapSeries = chartRef.current.addLineSeries({
          color: '#FF6D00',
          lineWidth: 2,
          title: 'VWAP',
        });
        const vwapData = calculateVWAP(data);
        vwapSeries.setData(vwapData);
        vwapSeriesRef.current = vwapSeries;
      }
      
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
      
      lastUpdateRef.current = Date.now();
      symbolRef.current = symbol;
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [symbol, currentPrice, selectedTimeframe, indicators.ema, indicators.vwap, generateHistoricalData, calculateEMA, calculateVWAP]);

  // FIX: Sync candle with current price (single source of truth)
  useEffect(() => {
    if (!candlestickSeriesRef.current || historicalData.length === 0 || !currentPrice) return;
    if (symbolRef.current !== symbol) return;

    // Update immediately when currentPrice changes
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // Get last candle from state
      const lastCandle = historicalData[historicalData.length - 1];
      if (!lastCandle) return;
      
      // SINGLE SOURCE OF TRUTH: Use currentPrice directly (no internal generation)
      const livePrice = parseFloat(currentPrice.toFixed(2));
      
      // Check if we need to create a NEW CANDLE (timeframe completed)
      const timeSinceLastCandle = now - lastCandle.time;
      const shouldCreateNewCandle = timeSinceLastCandle >= selectedTimeframe.value;
      
      if (shouldCreateNewCandle) {
        // CREATE NEW CANDLE (timeframe completed)
        const newCandle = {
          time: now,
          open: lastCandle.close,  // New open = previous close
          high: lastCandle.close,  // Start with same value
          low: lastCandle.close,   // Start with same value
          close: livePrice,        // Current price
        };
        
        // Update high/low if needed
        if (livePrice > newCandle.high) newCandle.high = livePrice;
        if (livePrice < newCandle.low) newCandle.low = livePrice;
        
        // Add new candle to series
        candlestickSeriesRef.current.update(newCandle);
        
        // Update state with new candle
        setHistoricalData(prev => [...prev, newCandle]);
        
        // Update indicators with new candle
        if (indicators.ema && emaSeriesRef.current) {
          const k = 2 / 21;
          const emaData = calculateEMA([...historicalData, newCandle], 20);
          if (emaData.length > 0) {
            emaSeriesRef.current.update(emaData[emaData.length - 1]);
          }
        }
        
        if (indicators.vwap && vwapSeriesRef.current) {
          const vwapData = calculateVWAP([...historicalData, newCandle]);
          if (vwapData.length > 0) {
            vwapSeriesRef.current.update(vwapData[vwapData.length - 1]);
          }
        }
      } else {
        // UPDATE ONLY LAST CANDLE (micro movements)
        // lastCandle.close = currentPrice
        // lastCandle.high = max(high, currentPrice)
        // lastCandle.low = min(low, currentPrice)
        
        let newHigh = lastCandle.high;
        let newLow = lastCandle.low;
        
        // Update high if price exceeds it
        if (livePrice > lastCandle.high) {
          newHigh = livePrice;
        }
        
        // Update low if price drops below it
        if (livePrice < lastCandle.low) {
          newLow = livePrice;
        }
        
        const updatedCandle = {
          time: lastCandle.time,
          open: lastCandle.open,  // NEVER changes
          high: parseFloat(newHigh.toFixed(2)),
          low: parseFloat(newLow.toFixed(2)),
          close: livePrice,  // Always current price
        };
        
        // Update chart (smooth, no redraw)
        candlestickSeriesRef.current.update(updatedCandle);
        
        // Update state (only last candle)
        setHistoricalData(prev => {
          const newData = [...prev];
          newData[newData.length - 1] = updatedCandle;
          return newData;
        });
        
        // Update indicators smoothly
        if (indicators.ema && emaSeriesRef.current) {
          const k = 2 / 21;
          const emaData = calculateEMA(historicalData, 20);
          if (emaData.length > 0) {
            const prevEma = emaData[emaData.length - 1]?.value || livePrice;
            const newEma = livePrice * k + prevEma * (1 - k);
            emaSeriesRef.current.update({
              time: lastCandle.time,
              value: parseFloat(newEma.toFixed(2))
            });
          }
        }
        
        if (indicators.vwap && vwapSeriesRef.current) {
          const vwapData = calculateVWAP(historicalData);
          if (vwapData.length > 0) {
            vwapSeriesRef.current.update(vwapData[vwapData.length - 1]);
          }
        }
      }
      
      lastUpdateRef.current = Date.now();
    } catch (error) {
      console.error('Error syncing candle with price:', error);
    }
  }, [currentPrice, historicalData, selectedTimeframe, symbol, indicators.ema, indicators.vwap, calculateEMA, calculateVWAP]); // Trigger on currentPrice change

  const toggleIndicator = (indicator) => {
    setIndicators(prev => {
      const newState = { ...prev, [indicator]: !prev[indicator] };
      
      // Remove series if turning off
      if (!newState[indicator]) {
        if (indicator === 'ema' && emaSeriesRef.current && chartRef.current) {
          chartRef.current.removeSeries(emaSeriesRef.current);
          emaSeriesRef.current = null;
        }
        if (indicator === 'vwap' && vwapSeriesRef.current && chartRef.current) {
          chartRef.current.removeSeries(vwapSeriesRef.current);
          vwapSeriesRef.current = null;
        }
      }
      
      return newState;
    });
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#131722' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                selectedTimeframe.value === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        
        {/* Indicators and Expand */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => toggleIndicator('ema')}
            className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-all ${
              indicators.ema
                ? 'bg-[#2962FF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>EMA</span>
          </button>
          
          <button
            onClick={() => toggleIndicator('vwap')}
            className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-all ${
              indicators.vwap
                ? 'bg-[#FF6D00] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>VWAP</span>
          </button>
          
          <button
            onClick={() => toggleIndicator('rsi')}
            className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-all ${
              indicators.rsi
                ? 'bg-[#9C27B0] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>RSI</span>
          </button>
          
          {/* Expand Button */}
          <button
            onClick={() => window.open(`/chart?symbol=${encodeURIComponent(symbol)}`, '_blank')}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-all text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 hover:border-blue-500/30"
            title="Open in fullscreen"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main Chart */}
      <div 
        ref={chartContainerRef} 
        className="flex-1 w-full"
        style={{ minHeight: 0 }}
      />
      
      {/* RSI Chart */}
      {indicators.rsi && historicalData.length > 0 && (
        <div className="h-[30%] px-4 pb-2 border-t border-white/5">
          <div className="text-xs text-gray-400 mb-1">RSI(14)</div>
          <div className="relative h-[calc(100%-20px)] bg-[#0A0A0A]/50 rounded">
            {(() => {
              const rsiData = calculateRSI(historicalData, 14);
              const latestRsi = rsiData[rsiData.length - 1]?.value || 50;
              const rsiColor = latestRsi > 70 ? '#ef4444' : latestRsi < 30 ? '#22c55e' : '#3b82f6';
              
              return (
                <>
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2 px-2">
                    <div className="text-xs text-red-500/50 border-b border-red-500/20">70</div>
                    <div className="text-xs text-gray-500/50 border-b border-gray-500/20">50</div>
                    <div className="text-xs text-green-500/50 border-b border-green-500/20">30</div>
                  </div>
                  <div className="absolute top-2 right-2 text-sm font-bold pointer-events-none" style={{ color: rsiColor }}>
                    {latestRsi.toFixed(2)}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingChart;
