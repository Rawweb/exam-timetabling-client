// pages/ExamPeriodsPage.jsx
// Manages examination periods. Each period covers one semester
// and defines the date range and daily time slots available for scheduling.
// Only one period can be active at a time since generation targets the active one.

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, Circle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import {
  fetchExamPeriods,
  createExamPeriod,
  updateExamPeriod,
  deleteExamPeriod,
  activateExamPeriod,
} from '../api/axios';

// Default time slots pre-filled in the form.
// These match a standard two-hour exam schedule.
const defaultTimeSlots = [
  {
    label: '8:00 AM - 10:00 AM',
    startTime: '8:00 AM',
    endTime: '10:00 AM',
    durationMinutes: 120,
  },
  {
    label: '10:00 AM - 12:00 PM',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    durationMinutes: 120,
  },
  {
    label: '12:00 PM - 2:00 PM',
    startTime: '12:00 PM',
    endTime: '2:00 PM',
    durationMinutes: 120,
  },
  {
    label: '2:00 PM - 4:00 PM',
    startTime: '2:00 PM',
    endTime: '4:00 PM',
    durationMinutes: 120,
  },
];

const emptyForm = {
  name: '',
  academicYear: '',
  semester: '',
  startDate: '',
  endDate: '',
  timeSlots: defaultTimeSlots,
  isActive: false,
};

// Formats a date string for clean display in the table
const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const ExamPeriodsPage = () => {
  const [examPeriods, setExamPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activatingId, setActivatingId] = useState(null);

  useEffect(() => {
    loadExamPeriods();
  }, []);

  const loadExamPeriods = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchExamPeriods();
      setExamPeriods(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exam periods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleEdit = (period) => {
    setForm({
      name: period.name,
      academicYear: period.academicYear,
      semester: period.semester,
      // Convert ISO date to YYYY-MM-DD format for the HTML date input
      startDate: period.startDate.split('T')[0],
      endDate: period.endDate.split('T')[0],
      timeSlots: period.timeSlots,
      isActive: period.isActive,
    });
    setEditingId(period._id);
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam period?'))
      return;
    setDeletingId(id);
    try {
      await deleteExamPeriod(id);
      setExamPeriods((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete exam period');
    } finally {
      setDeletingId(null);
    }
  };

  const handleActivate = async (id) => {
    setActivatingId(id);
    try {
      const { data } = await activateExamPeriod(id);
      // Update local state: set the activated one to active,
      // set all others to inactive, without re-fetching from server
      setExamPeriods((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, isActive: true } : { ...p, isActive: false },
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate exam period');
    } finally {
      setActivatingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (editingId) {
        const { data } = await updateExamPeriod(editingId, form);
        setExamPeriods((prev) =>
          prev.map((p) => (p._id === editingId ? data : p)),
        );
      } else {
        const { data } = await createExamPeriod(form);
        setExamPeriods((prev) => [data, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  // ─── Time Slot Handlers ───────────────────────────────

  // Updates one field of one time slot at a given index
  const handleTimeSlotChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.timeSlots];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, timeSlots: updated };
    });
  };

  // Adds a new blank time slot row to the form
  const handleAddTimeSlot = () => {
    setForm((prev) => ({
      ...prev,
      timeSlots: [
        ...prev.timeSlots,
        { label: '', startTime: '', endTime: '', durationMinutes: 120 },
      ],
    }));
  };

  // Removes a time slot at a given index
  const handleRemoveTimeSlot = (index) => {
    setForm((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index),
    }));
  };

  return (
    <Layout title='Exam Periods'>
      <div>
        {/* Page header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
              Exam Periods
            </h1>
            <p className='text-gray-500 text-sm mt-1'>
              {examPeriods.length} period
              {examPeriods.length !== 1 ? 's' : ''} configured
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
          >
            <Plus size={16} />
            Add Exam Period
          </button>
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
        ) : examPeriods.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
            <p className='text-gray-500 text-sm'>No exam periods found.</p>
            <button
              onClick={handleAddNew}
              className='mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
            >
              Add your first exam period
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            {examPeriods.map((period) => (
              <div
                key={period._id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${
                  period.isActive
                    ? 'border-indigo-300 ring-1 ring-indigo-200'
                    : 'border-gray-100'
                }`}
              >
                {/* Period card header */}
                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <h3 className='font-semibold text-gray-900 text-base'>
                        {period.name}
                      </h3>
                      {period.isActive && (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full'>
                          <CheckCircle size={11} />
                          Active
                        </span>
                      )}
                    </div>

                    {/* Period metadata */}
                    <div className='flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500'>
                      <span>Academic Year: {period.academicYear}</span>
                      <span>Semester {period.semester}</span>
                      <span>
                        {formatDate(period.startDate)} to{' '}
                        {formatDate(period.endDate)}
                      </span>
                    </div>

                    {/* Time slots summary */}
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {period.timeSlots.map((slot, i) => (
                        <span
                          key={i}
                          className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md'
                        >
                          {slot.label}: {slot.startTime} to {slot.endTime} (
                          {slot.durationMinutes} mins)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className='flex items-center gap-2 shrink-0'>
                    {!period.isActive && (
                      <button
                        onClick={() => handleActivate(period._id)}
                        disabled={activatingId === period._id}
                        className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50'
                      >
                        <Circle size={12} />
                        {activatingId === period._id
                          ? 'Activating...'
                          : 'Set Active'}
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(period)}
                      className='p-1.5 text-gray-400 hover:text-indigo-600 transition-colors'
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(period._id)}
                      disabled={deletingId === period._id}
                      className='p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50'
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ──────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Exam Period' : 'Add Exam Period'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {formError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm'>
              {formError}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Period Name
            </label>
            <input
              name='name'
              value={form.name}
              onChange={handleFormChange}
              placeholder='e.g. 2024/2025 First Semester Examination'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Academic Year
              </label>
              <input
                name='academicYear'
                value={form.academicYear}
                onChange={handleFormChange}
                placeholder='e.g. 2024/2025'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
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
                <option value=''>Select</option>
                <option value='1'>Semester 1</option>
                <option value='2'>Semester 2</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>
              <input
                name='startDate'
                type='date'
                value={form.startDate}
                onChange={handleFormChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <input
                name='endDate'
                type='date'
                value={form.endDate}
                onChange={handleFormChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
          </div>

          {/* Dynamic time slots section */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Time Slots
              </label>
              <button
                type='button'
                onClick={handleAddTimeSlot}
                className='flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium'
              >
                <Plus size={12} />
                Add Slot
              </button>
            </div>

            <div className='space-y-3'>
              {form.timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className='border border-gray-200 rounded-lg p-3 space-y-2'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-medium text-gray-500'>
                      Slot {index + 1}
                    </span>
                    {/* Only allow removing a slot if there are more than one */}
                    {form.timeSlots.length > 1 && (
                      <button
                        type='button'
                        onClick={() => handleRemoveTimeSlot(index)}
                        className='text-xs text-red-400 hover:text-red-600'
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        Label
                      </label>
                      <input
                        value={slot.label}
                        onChange={(e) =>
                          handleTimeSlotChange(index, 'label', e.target.value)
                        }
                        placeholder='e.g. Morning'
                        required
                        className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        Duration (mins)
                      </label>
                      <input
                        type='number'
                        value={slot.durationMinutes}
                        onChange={(e) =>
                          handleTimeSlotChange(
                            index,
                            'durationMinutes',
                            Number(e.target.value),
                          )
                        }
                        min='30'
                        required
                        className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        Start Time
                      </label>
                      <input
                        value={slot.startTime}
                        onChange={(e) =>
                          handleTimeSlotChange(
                            index,
                            'startTime',
                            e.target.value,
                          )
                        }
                        placeholder='e.g. 9:00 AM'
                        required
                        className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-gray-500 mb-1'>
                        End Time
                      </label>
                      <input
                        value={slot.endTime}
                        onChange={(e) =>
                          handleTimeSlotChange(index, 'endTime', e.target.value)
                        }
                        placeholder='e.g. 11:00 AM'
                        required
                        className='w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Set as active checkbox */}
          <div className='flex items-center gap-3'>
            <input
              type='checkbox'
              name='isActive'
              id='isActive'
              checked={form.isActive}
              onChange={handleFormChange}
              className='w-4 h-4 text-indigo-600 rounded'
            />
            <label htmlFor='isActive' className='text-sm text-gray-700'>
              Set as active exam period
              <span className='block text-xs text-gray-400'>
                Only one period can be active at a time. Activating this will
                deactivate the current one.
              </span>
            </label>
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
                  : 'Add Period'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ExamPeriodsPage;
