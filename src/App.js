import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';

const Page = ({ name }) => (
  <div style={{ padding: 40 }}>
    <h1>{name}</h1>
    <Link to="/dashboard">Dashboard</Link> |{" "}
    <Link to="/trade">Trade</Link> |{" "}
    <Link to="/orders">Orders</Link>
  </div>
);

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/dashboard" element={<Page name="Dashboard" />} />
        <Route path="/trade" element={<Page name="Trade" />} />
        <Route path="/orders" element={<Page name="Orders" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
