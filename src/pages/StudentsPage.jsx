// pages/StudentsPage.jsx
// Displays all students in a table with filters and search.
// Officer can add individual students, edit, delete,
// download a CSV template, and import students in bulk via CSV.

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Upload, Download } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import {
  fetchStudents,
  fetchCourses,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudentsCSV,
} from '../api/axios';

const DEPARTMENTS = ['Computer Science', 'Mathematics'];
const LEVELS = [100, 200, 300, 400, 500];

const emptyForm = {
  name: '',
  matricNumber: '',
  department: '',
  level: '',
  courses: [],
};

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Import modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // Filter and search state
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [search, setSearch] = useState('');

  // Load students when filters or search change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents();
    }, 300); // Small delay so search doesn't fire on every keystroke
    return () => clearTimeout(timer);
  }, [filterDept, filterLevel, search]);

  // Load all courses once, used in the add/edit form
  useEffect(() => {
    loadCourses();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDept) params.department = filterDept;
      if (filterLevel) params.level = filterLevel;
      if (search) params.search = search;

      const { data } = await fetchStudents(params);
      setStudents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const { data } = await fetchCourses();
      setAllCourses(data);
    } catch {
      // Fail silently, courses list just won't show in the form
    }
  };

  // Filter the available courses to show in the form.
  // Shows courses matching the selected department and level first,
  // but officer can scroll to see all courses for carryover registration.
  const filteredFormCourses =
    form.department && form.level
      ? allCourses.filter(
          (c) =>
            c.department === form.department && c.level === Number(form.level),
        )
      : allCourses;

  const handleAddNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleEdit = (student) => {
    setForm({
      name: student.name,
      matricNumber: student.matricNumber,
      department: student.department,
      level: student.level,
      // courses is an array of populated objects, we extract just the IDs
      courses: student.courses.map((c) => c._id),
    });
    setEditingId(student._id);
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?'))
      return;
    setDeletingId(id);
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle a course ID in the form's courses array
  const handleCourseToggle = (courseId) => {
    setForm((prev) => {
      const alreadySelected = prev.courses.includes(courseId);
      return {
        ...prev,
        courses: alreadySelected
          ? prev.courses.filter((id) => id !== courseId)
          : [...prev.courses, courseId],
      };
    });
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingId) {
        const { data } = await updateStudent(editingId, form);
        setStudents((prev) =>
          prev.map((s) => (s._id === editingId ? data : s)),
        );
      } else {
        const { data } = await createStudent(form);
        setStudents((prev) => [...prev, data]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── CSV Import ───────────────────────────────────────

  // Generates and downloads a template CSV so the officer knows
  // exactly how to format their import file.
  const handleDownloadTemplate = () => {
    const headers = 'name,matricNumber,department,level,courses';
    const example1 =
      'John Doe,2021513001,Computer Science,500,CSC501|CSC502|CSC503';
    const example2 =
      'Jane Smith,2021512001,Mathematics,500,MTH501|MTH502|MTH503';
    const csvContent = [headers, example1, example2].join('\n');

    // Create a temporary link element and click it to trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'students_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      // FormData is the correct way to send a file over HTTP.
      // The key 'file' must match upload.single('file') in the route.
      const formData = new FormData();
      formData.append('file', csvFile);

      const { data } = await importStudentsCSV(formData);
      setImportResult(data);

      // Reload the students table to show the newly imported records
      loadStudents();
    } catch (err) {
      setImportResult({
        message: err.response?.data?.message || 'Import failed',
        created: 0,
        skipped: 0,
        errors: [],
      });
    } finally {
      setImportLoading(false);
      setCsvFile(null);
    }
  };

  return (
    <Layout title='Students'>
      <div>
        {/* Page header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
              Students
            </h1>
            <p className='text-gray-500 text-sm mt-1'>
              {students.length} student{students.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Action buttons */}
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={handleDownloadTemplate}
              className='flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors'
            >
              <Download size={15} />
              CSV Template
            </button>
            <button
              onClick={() => {
                setImportResult(null);
                setCsvFile(null);
                setImportModalOpen(true);
              }}
              className='flex items-center gap-2 px-3 py-2 border border-indigo-300 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50 transition-colors'
            >
              <Upload size={15} />
              Import CSV
            </button>
            <button
              onClick={handleAddNew}
              className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
            >
              <Plus size={15} />
              Add Student
            </button>
          </div>
        </div>

        {/* Search and filter row */}
        <div className='flex flex-wrap gap-3 mb-6'>
          <input
            type='text'
            placeholder='Search by name or matric number...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />

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

          {(filterDept || filterLevel || search) && (
            <button
              onClick={() => {
                setFilterDept('');
                setFilterLevel('');
                setSearch('');
              }}
              className='px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline'
            >
              Clear all
            </button>
          )}
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : students.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
            <p className='text-gray-500 text-sm'>No students found.</p>
            <div className='flex justify-center gap-3 mt-4'>
              <button
                onClick={() => setImportModalOpen(true)}
                className='px-4 py-2 border border-indigo-300 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50 transition-colors'
              >
                Import CSV
              </button>
              <button
                onClick={handleAddNew}
                className='px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
              >
                Add manually
              </button>
            </div>
          </div>
        ) : (
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 border-b border-gray-100'>
                  <tr>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Name
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Matric No.
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell'>
                      Department
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Level
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell'>
                      Courses
                    </th>
                    <th className='text-right px-4 py-3 font-medium text-gray-600'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {students.map((student) => (
                    <tr
                      key={student._id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3 font-medium text-gray-800'>
                        {student.name}
                      </td>
                      <td className='px-4 py-3 font-mono text-indigo-700 text-xs'>
                        {student.matricNumber}
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden md:table-cell'>
                        {student.department}
                      </td>
                      <td className='px-4 py-3 text-gray-600'>
                        {student.level}L
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden sm:table-cell'>
                        {/* Show course count with a tooltip of codes on hover */}
                        <span
                          title={student.courses.map((c) => c.code).join(', ')}
                          className='cursor-default'
                        >
                          {student.courses.length} course
                          {student.courses.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleEdit(student)}
                            className='p-1.5 text-gray-400 hover:text-indigo-600 transition-colors'
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            disabled={deletingId === student._id}
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

      {/* ─── Add / Edit Student Modal ──────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Student' : 'Add New Student'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {formError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm'>
              {formError}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Full Name
            </label>
            <input
              name='name'
              value={form.name}
              onChange={handleFormChange}
              placeholder='e.g. John Doe'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Matric Number
            </label>
            <input
              name='matricNumber'
              value={form.matricNumber}
              onChange={handleFormChange}
              placeholder='e.g. 2021513001'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
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
                <option value=''>Select</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

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
                <option value=''>Select</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course selection checkboxes */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Registered Courses
              {form.department && form.level
                ? ` (${form.department}, ${form.level}L)`
                : ' (select department and level first)'}
            </label>

            {filteredFormCourses.length === 0 ? (
              <p className='text-gray-400 text-xs'>
                No courses found for this department and level. Add courses
                first on the Courses page.
              </p>
            ) : (
              <div className='border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50'>
                {filteredFormCourses.map((course) => (
                  <label
                    key={course._id}
                    className='flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={form.courses.includes(course._id)}
                      onChange={() => handleCourseToggle(course._id)}
                      className='w-4 h-4 text-indigo-600 rounded'
                    />
                    <span className='text-sm text-gray-700'>
                      <span className='font-mono text-indigo-600 mr-2'>
                        {course.code}
                      </span>
                      {course.title}
                      <span className='text-gray-400 text-xs ml-2'>
                        Sem {course.semester}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className='text-xs text-gray-400 mt-1'>
              {form.courses.length} course
              {form.courses.length !== 1 ? 's' : ''} selected
            </p>
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
                  : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── CSV Import Modal ──────────────────────────── */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title='Import Students from CSV'
      >
        <div className='space-y-4'>
          {/* Template download prompt */}
          <div className='bg-indigo-50 border border-indigo-100 rounded-lg p-3'>
            <p className='text-sm text-indigo-800 font-medium mb-1'>
              CSV Format Required
            </p>
            <p className='text-xs text-indigo-600 mb-2'>
              Columns: name, matricNumber, department, level, courses
              (pipe-separated codes e.g. CSC501|CSC502)
            </p>
            <button
              onClick={handleDownloadTemplate}
              className='flex items-center gap-1 text-xs text-indigo-700 font-medium hover:underline'
            >
              <Download size={12} />
              Download template CSV
            </button>
          </div>

          {/* File input */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Select CSV File
            </label>
            <input
              type='file'
              accept='.csv'
              onChange={(e) => {
                setCsvFile(e.target.files[0]);
                setImportResult(null);
              }}
              className='w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
            />
          </div>

          {/* Import result feedback */}
          {importResult && (
            <div
              className={`rounded-lg p-3 text-sm ${
                importResult.created > 0
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <p className='font-medium text-gray-800 mb-1'>
                {importResult.message}
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className='mt-2'>
                  <p className='text-xs font-medium text-gray-600 mb-1'>
                    Warnings:
                  </p>
                  <ul className='text-xs text-gray-500 space-y-0.5 max-h-24 overflow-y-auto'>
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={() => setImportModalOpen(false)}
              className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors'
            >
              Close
            </button>
            <button
              onClick={handleImportSubmit}
              disabled={!csvFile || importLoading}
              className='flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors'
            >
              {importLoading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default StudentsPage;
