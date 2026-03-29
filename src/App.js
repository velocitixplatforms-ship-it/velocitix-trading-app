import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

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
          <HashRouter>
            <Routes>

              {/* Public */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>

                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="trade" element={<TradingPage />} />
                  <Route path="positions" element={<PositionsPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="funds" element={<FundsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="profile" element={<ProfilePage />} />

                </Route>
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
          </HashRouter>

          <Toaster position="top-right" theme="dark" richColors />
        </MarketDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
