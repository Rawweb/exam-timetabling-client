// App.jsx
// The root component of the React application.
// Sets up routing, wraps the app in AuthProvider so all
// components have access to authentication state.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import VenuesPage from './pages/VenuesPage';
import ExamPeriodsPage from './pages/ExamPeriodsPage';
import TimetablePage from './pages/TimetablePage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <BrowserRouter>
      {/* AuthProvider must wrap everything so all pages
          and components can access the auth state */}
      <AuthProvider>
        <Routes>
          {/* Public route: anyone can reach the login page */}
          <Route path='/login' element={<LoginPage />} />

          {/* Protected routes: only accessible when logged in */}
          <Route
            path='/dashboard'
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path='/students'
            element={
              <PrivateRoute>
                <StudentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path='/courses'
            element={
              <PrivateRoute>
                <CoursesPage />
              </PrivateRoute>
            }
          />
          <Route
            path='/venues'
            element={
              <PrivateRoute>
                <VenuesPage />
              </PrivateRoute>
            }
          />
          <Route
            path='/exam-periods'
            element={
              <PrivateRoute>
                <ExamPeriodsPage />
              </PrivateRoute>
            }
          />
          <Route
            path='/timetable'
            element={
              <PrivateRoute>
                <TimetablePage />
              </PrivateRoute>
            }
          />

          {/* Visiting the root URL redirects to login */}
          <Route path='/' element={<Navigate to='/login' replace />} />

          {/* Anything else shows the 404 page */}
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
