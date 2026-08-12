import { Link } from 'react-router-dom';
const NotFoundPage = () => (
  <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
    <div className='text-center'>
      <h1 className='text-6xl font-bold text-indigo-600'>404</h1>
      <p className='text-xl text-gray-600 mt-4'>Page not found</p>
      <Link
        to='/dashboard'
        className='mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
      >
        Go to Dashboard
      </Link>
    </div>
  </div>
);
export default NotFoundPage;
