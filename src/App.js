import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MarketDataProvider } from '@/contexts/MarketDataContext';
import { Toaster } from '@/components/ui/sonner';

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import TradingPage from '@/pages/TradingPage';
import PositionsPage from '@/pages/PositionsPage';
import OrdersPage from '@/pages/OrdersPage';
import FundsPage from '@/pages/FundsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ProfilePage from '@/pages/ProfilePage';
import FullscreenChartPage from '@/pages/FullscreenChartPage';

import '@/App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MarketDataProvider>
          <BrowserRouter>

            <Routes>

              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >

                <Route index element={<Navigate to="/dashboard" />} />

                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="trade" element={<TradingPage />} />
                <Route path="positions" element={<PositionsPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="funds" element={<FundsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="profile" element={<ProfilePage />} />

              </Route>

              {/* Fullscreen Chart */}
              <Route
                path="/chart"
                element={
                  <ProtectedRoute>
                    <FullscreenChartPage />
                  </ProtectedRoute>
                }
              />

            </Routes>

          </BrowserRouter>

          <Toaster position="top-right" theme="dark" richColors />

        </MarketDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
