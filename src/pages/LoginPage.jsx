import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  // useState manages the form fields and UI states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // login() comes from AuthContext, navigate() moves between pages
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // Prevent the default browser form submission behavior
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send POST request to your Node.js backend login route
      const { data } = await API.post('/auth/login', { email, password });

      // Store the officer data and token in context and localStorage
      login(data);

      // Redirect to the dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      // Display the error message returned by the server
      setError(
        err.response?.data?.message || 'Login failed. Please try again.',
      );
    } finally {
      // Always stop the loading state when the request finishes
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-indigo-900 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-8'>
        {/* Page header */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Examination Timetabling System
          </h1>
          <p className='text-gray-500 text-sm mt-2'>Officer Login Portal</p>
        </div>

        {/* Error message, only shown when there is an error */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm'>
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='officer@university.edu'
              required
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Enter your password'
              required
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-lg transition-colors text-sm'
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className='text-center text-xs text-gray-400 mt-6'>
          Access restricted to authorized examination officers only
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
