// pages/DashboardPage.jsx
// Shows live system stats fetched from the database on every load.
// No hardcoded numbers anywhere in this file.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  MapPin,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import useAuth from '../hooks/useAuth';
import { fetchDashboardStats } from '../api/axios';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  // Each stat card is defined here as data, not JSX.
  // This keeps the render section clean and easy to read.
  const statCards = stats
    ? [
        {
          label: 'Total Students',
          value: stats.students.total,
          sub: `CS: ${stats.students.computerScience}  |  Maths: ${stats.students.mathematics}`,
          icon: Users,
          color: 'bg-blue-500',
          light: 'bg-blue-50',
          text: 'text-blue-600',
          route: '/students',
        },
        {
          label: 'Total Courses',
          value: stats.courses.total,
          sub: `Sem 1: ${stats.courses.semester1}  |  Sem 2: ${stats.courses.semester2}`,
          icon: BookOpen,
          color: 'bg-green-500',
          light: 'bg-green-50',
          text: 'text-green-600',
          route: '/courses',
        },
        {
          label: 'Venues',
          value: stats.venues.total,
          sub: 'Examination halls registered',
          icon: MapPin,
          color: 'bg-purple-500',
          light: 'bg-purple-50',
          text: 'text-purple-600',
          route: '/venues',
        },
        {
          label: 'Exam Periods',
          value: stats.examPeriods.total,
          sub: stats.examPeriods.active
            ? `Active: ${stats.examPeriods.active.name}`
            : 'No active period set',
          icon: CalendarDays,
          color: 'bg-orange-500',
          light: 'bg-orange-50',
          text: 'text-orange-600',
          route: '/exam-periods',
        },
        {
          label: 'Timetables Generated',
          value: stats.timetables.total,
          sub: stats.timetables.latest
            ? stats.timetables.latest.isValid
              ? `Latest: Valid, Semester ${stats.timetables.latest.semester} (${stats.timetables.latest.status})`
              : `Latest: Has conflicts, Semester ${stats.timetables.latest.semester}`
            : `${stats.timetables.published} published`,
          icon: Clock,
          color: stats.timetables.latest
            ? stats.timetables.latest.isValid
              ? 'bg-indigo-500'
              : 'bg-red-500'
            : 'bg-indigo-500',
          light: 'bg-indigo-50',
          text: 'text-indigo-600',
          route: '/timetable',
        },
      ]
    : [];

  return (
    <Layout title='Dashboard'>
      <div>
        {/* Welcome header */}
        <div className='mb-6 md:mb-8'>
          <h1 className='text-xl md:text-2xl font-bold text-gray-900 mb-1'>
            Dashboard
          </h1>
          <p className='text-gray-500 text-sm md:text-base'>
            Welcome back, {user?.name}. Here is your system overview.
          </p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2'>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          // Skeleton loading state so the page does not flash blank
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100 animate-pulse'
              >
                <div className='w-10 h-10 bg-gray-200 rounded-lg mb-4' />
                <div className='h-7 bg-gray-200 rounded w-16 mb-2' />
                <div className='h-4 bg-gray-100 rounded w-32' />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8'>
              {statCards.map((card) => (
                <button
                  key={card.label}
                  onClick={() => navigate(card.route)}
                  className='bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-gray-200 transition-all group'
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 ${card.color} rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform`}
                  >
                    <card.icon size={18} className='text-white' />
                  </div>

                  {/* Main count */}
                  <p className='text-2xl md:text-3xl font-bold text-gray-900 mb-1'>
                    {card.value.toLocaleString()}
                  </p>

                  {/* Label */}
                  <p className='text-sm font-medium text-gray-700 mb-1'>
                    {card.label}
                  </p>

                  {/* Sub text */}
                  <p className='text-xs text-gray-400'>{card.sub}</p>
                </button>
              ))}
            </div>

            {/* Active exam period banner */}
            {stats?.examPeriods?.active ? (
              <div className='bg-indigo-50 border border-indigo-200 rounded-xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0'>
                    <CheckCircle size={16} className='text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-indigo-900'>
                      Active Exam Period
                    </p>
                    <p className='text-xs text-indigo-600 mt-0.5'>
                      {stats.examPeriods.active.name}, Semester{' '}
                      {stats.examPeriods.active.semester},{' '}
                      {stats.examPeriods.active.academicYear}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/timetable')}
                  className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors shrink-0'
                >
                  <TrendingUp size={14} />
                  Generate Timetable
                </button>
              </div>
            ) : (
              <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 md:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shrink-0'>
                    <AlertCircle size={16} className='text-white' />
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-yellow-900'>
                      No Active Exam Period
                    </p>
                    <p className='text-xs text-yellow-700 mt-0.5'>
                      Set an active exam period before generating a timetable.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/exam-periods')}
                  className='flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors shrink-0'
                >
                  <CalendarDays size={14} />
                  Set Exam Period
                </button>
              </div>
            )}

            {/* Quick actions */}
            <div className='bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100'>
              <h2 className='text-base font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h2>
              <div className='flex flex-wrap gap-3'>
                <button
                  onClick={() => navigate('/timetable')}
                  className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
                >
                  <TrendingUp size={14} />
                  Generate Timetable
                </button>
                <button
                  onClick={() => navigate('/students')}
                  className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors'
                >
                  <Users size={14} />
                  Manage Students
                </button>
                <button
                  onClick={() => navigate('/exam-periods')}
                  className='flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors'
                >
                  <CalendarDays size={14} />
                  Exam Periods
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
