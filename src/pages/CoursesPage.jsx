// pages/CoursesPage.jsx
// Displays all courses in a table.
// Officer can add, edit, and delete courses.
// Filters by department, level, and semester are built into the header.

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../api/axios';

// The two departments locked in for this project
const DEPARTMENTS = ['Computer Science', 'Mathematics'];
const LEVELS = [100, 200, 300, 400, 500];
const SEMESTERS = [1, 2];

// Default shape of the form when adding a new course
const emptyForm = {
  code: '',
  title: '',
  department: '',
  level: '',
  semester: '',
  creditUnit: 3,
};

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Controls whether the add/edit modal is visible
  const [modalOpen, setModalOpen] = useState(false);

  // Holds form field values for the add/edit modal
  const [form, setForm] = useState(emptyForm);

  // When editing, stores the ID of the course being edited.
  // null means we are adding a new course.
  const [editingId, setEditingId] = useState(null);

  // Tracks which delete request is in progress so we can show a spinner
  const [deletingId, setDeletingId] = useState(null);

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Filter state
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  // Load courses whenever filters change
  useEffect(() => {
    loadCourses();
  }, [filterDept, filterLevel, filterSemester]);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterLevel) params.level = filterLevel;
      if (filterSemester) params.semester = filterSemester;

      const { data } = await fetchCourses(params);
      setCourses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Opens the modal for adding a new course
  const handleAddNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setModalOpen(true);
  };

  // Opens the modal pre-filled with an existing course's data
  const handleEdit = (course) => {
    setForm({
      code: course.code,
      title: course.title,
      department: course.department,
      level: course.level,
      semester: course.semester,
      creditUnit: course.creditUnit,
    });
    setEditingId(course._id);
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setDeletingId(id);
    try {
      await deleteCourse(id);
      // Remove the deleted course from local state
      // without making a new network request
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingId) {
        // Update existing course
        const { data } = await updateCourse(editingId, form);
        setCourses((prev) => prev.map((c) => (c._id === editingId ? data : c)));
      } else {
        // Create new course
        const { data } = await createCourse(form);
        setCourses((prev) => [...prev, data]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Layout title='Courses'>
      <div>
        {/* Page header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
              Courses
            </h1>
            <p className='text-gray-500 text-sm mt-1'>
              {courses.length} course{courses.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>

        {/* Filter row */}
        <div className='flex flex-wrap gap-3 mb-6'>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value=''>All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value=''>All Levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </select>

          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value=''>All Semesters</option>
            <option value='1'>Semester 1</option>
            <option value='2'>Semester 2</option>
          </select>

          {/* Clear filters button, only shown when a filter is active */}
          {(filterDept || filterLevel || filterSemester) && (
            <button
              onClick={() => {
                setFilterDept('');
                setFilterLevel('');
                setFilterSemester('');
              }}
              className='px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline'
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm'>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : courses.length === 0 ? (
          // Empty state
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
            <p className='text-gray-500 text-sm'>No courses found.</p>
            <button
              onClick={handleAddNew}
              className='mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
            >
              Add your first course
            </button>
          </div>
        ) : (
          // Courses table, horizontally scrollable on mobile
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 border-b border-gray-100'>
                  <tr>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Code
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Title
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell'>
                      Department
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Level
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell'>
                      Semester
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell'>
                      Credit Units
                    </th>
                    <th className='text-right px-4 py-3 font-medium text-gray-600'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3 font-mono font-medium text-indigo-700'>
                        {course.code}
                      </td>
                      <td className='px-4 py-3 text-gray-800'>
                        {course.title}
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden md:table-cell'>
                        {course.department}
                      </td>
                      <td className='px-4 py-3 text-gray-600'>
                        {course.level}L
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden sm:table-cell'>
                        Sem {course.semester}
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden lg:table-cell'>
                        {course.creditUnit}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleEdit(course)}
                            className='p-1.5 text-gray-400 hover:text-indigo-600 transition-colors'
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            disabled={deletingId === course._id}
                            className='p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50'
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Course' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {formError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm'>
              {formError}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Course Code
            </label>
            <input
              name='code'
              value={form.code}
              onChange={handleFormChange}
              placeholder='e.g. CSC101'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Course Title
            </label>
            <input
              name='title'
              value={form.title}
              onChange={handleFormChange}
              placeholder='e.g. Introduction to Programming'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Department
            </label>
            <select
              name='department'
              value={form.department}
              onChange={handleFormChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value=''>Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Level
              </label>
              <select
                name='level'
                value={form.level}
                onChange={handleFormChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              >
                <option value=''>Select level</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Semester
              </label>
              <select
                name='semester'
                value={form.semester}
                onChange={handleFormChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              >
                <option value=''>Select semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Credit Units
            </label>
            <input
              name='creditUnit'
              type='number'
              value={form.creditUnit}
              onChange={handleFormChange}
              min='1'
              max='6'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={() => setModalOpen(false)}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={formLoading}
              className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors'
            >
              {formLoading
                ? 'Saving...'
                : editingId
                  ? 'Save Changes'
                  : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default CoursesPage;
