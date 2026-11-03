import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <Header />
      <main className="layout-content">
        <div className="layout-page-content">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default MainLayout;
