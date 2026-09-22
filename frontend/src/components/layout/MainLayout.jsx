import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <Header />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;