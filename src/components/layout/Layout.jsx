// components/layout/Layout.jsx
// Wraps all protected pages with the Sidebar and Header.
// Holds the sidebar open/close state so both Header and Sidebar
// can read and control it from one central place.

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  // Controls whether the sidebar is visible on mobile.
  // On desktop this state is ignored because the sidebar
  // is always visible via CSS.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Dark overlay that appears behind the sidebar on mobile.
          Tapping it closes the sidebar.
          lg:hidden means it never shows on desktop. */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black/20 z-20 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar receives open state and a close function */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area.
          On desktop: pushed right by the sidebar width (lg:ml-64).
          On mobile: takes full width since sidebar is hidden. */}
      <div className='flex-1 flex flex-col min-h-screen lg:ml-64'>
        {/* Header receives a function to open the sidebar on mobile */}
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
