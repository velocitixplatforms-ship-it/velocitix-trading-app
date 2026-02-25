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
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Fullscreen Chart Route (Protected) */}
              <Route
                path="/chart"
                element={
                  <ProtectedRoute>
                    <FullscreenChartPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DashboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trade"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TradingPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/positions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PositionsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <OrdersPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/funds"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <FundsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AnalyticsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProfilePage />
                    </Layout>
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
