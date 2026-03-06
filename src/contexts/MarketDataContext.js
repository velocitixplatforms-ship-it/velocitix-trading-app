import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const MarketDataContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within MarketDataProvider');
  }
  return context;
};

export const MarketDataProvider = ({ children }) => {
  const [symbols, setSymbols] = useState([
  {
    symbol: "NIFTY 50",
    name: "NIFTY 50 Index",
    price: 22500,
    change: 120,
    change_percent: 0.54
  },
  {
    symbol: "BANKNIFTY",
    name: "Bank Nifty",
    price: 48000,
    change: -150,
    change_percent: -0.31
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 2950,
    change: 12,
    change_percent: 0.41
  },
  {
    symbol: "INFY",
    name: "Infosys",
    price: 1650,
    change: -8,
    change_percent: -0.48
  }
]);
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [loading, setLoading] = useState(false);

  const fetchSymbols = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/market/symbols`);
      setSymbols(response.data);
    } catch (error) {
      console.error('Failed to fetch symbols:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymbols();
    const interval = setInterval(fetchSymbols, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const getSymbolData = (symbol) => {
    return symbols.find(s => s.symbol === symbol);
  };

  return (
    <MarketDataContext.Provider value={{ 
      symbols, 
      selectedSymbol, 
      setSelectedSymbol, 
      loading,
      getSymbolData,
      refreshSymbols: fetchSymbols
    }}>
      {children}
    </MarketDataContext.Provider>
  );
};
