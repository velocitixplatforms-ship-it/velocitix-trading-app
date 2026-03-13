import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#0A0A0A]">

      {/* TEST BAR - DO NOT REMOVE YET */}
      <div style={{position:'fixed',top:0,left:0,zIndex:99999,background:'red',color:'white',padding:'6px'}}>
        LAYOUT TEST
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default Layout;
