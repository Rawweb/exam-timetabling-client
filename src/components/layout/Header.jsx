// components/layout/Header.jsx
// Shows the page title and a hamburger menu button on mobile.
// The hamburger button is hidden on desktop (lg:hidden).

import { Menu } from 'lucide-react';

const Header = ({ title, onMenuClick }) => {
  return (
    <header className='h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 sticky top-0 z-10 gap-4'>
      {/* Hamburger button, only visible on mobile */}
      <button
        onClick={onMenuClick}
        className='lg:hidden text-gray-600 hover:text-gray-900 p-1'
        aria-label='Open menu'
      >
        <Menu size={22} />
      </button>

      <h2 className='text-base md:text-lg font-semibold text-gray-800'>
        {title}
      </h2>
    </header>
  );
};

export default Header;
