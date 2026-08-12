// components/layout/Sidebar.jsx
// On desktop: always visible, fixed to the left side.
// On mobile: hidden off screen by default, slides in when isOpen is true.
// The transform and transition classes handle the slide animation.

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MapPin,
  CalendarDays,
  Clock,
  LogOut,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', to: '/students', icon: Users },
  { label: 'Courses', to: '/courses', icon: BookOpen },
  { label: 'Venues', to: '/venues', icon: MapPin },
  { label: 'Exam Periods', to: '/exam-periods', icon: CalendarDays },
  { label: 'Generate Timetable', to: '/timetable', icon: Clock },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-indigo-900 text-white
        flex flex-col z-30
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Top section: app name and mobile close button */}
      <div className='p-6 border-b border-indigo-700 flex items-center justify-between'>
        <div>
          <h1 className='text-lg font-bold leading-tight'>Exam Timetabling</h1>
          <p className='text-indigo-300 text-xs mt-1'>Management System</p>
        </div>

        {/* Close button only visible on mobile.
            lg:hidden makes it disappear on desktop. */}
        <button
          onClick={onClose}
          className='lg:hidden text-indigo-300 hover:text-white p-1'
          aria-label='Close menu'
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation links */}
      <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Officer info and logout at the bottom */}
      <div className='p-4 border-t border-indigo-700'>
        <p className='text-indigo-400 text-xs mb-1'>Signed in as</p>
        <p className='text-white text-sm font-medium mb-3 truncate'>
          {user?.name}
        </p>
        <button
          onClick={logout}
          className='flex items-center gap-2 text-indigo-300 hover:text-white text-sm transition-colors w-full'
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
