import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './Sidebar';
import Navbar from './Navbar';

import DashboardPage from '@/pages/DashboardPage';
import TradingPage from '@/pages/TradingPage';
import PositionsPage from '@/pages/PositionsPage';
import OrdersPage from '@/pages/OrdersPage';
import FundsPage from '@/pages/FundsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import ProfilePage from '@/pages/ProfilePage';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#0A0A0A]">

      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">

        <Navbar />

        <main className="flex-1 overflow-y-auto">

          <Routes>

            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trade" element={<TradingPage />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/funds" element={<FundsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

          </Routes>

        </main>

      </div>

    </div>
  );
};

export default Layout;
