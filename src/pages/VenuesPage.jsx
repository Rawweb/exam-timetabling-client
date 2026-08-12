// pages/VenuesPage.jsx
// Displays all venues in a table.
// Officer can add, edit, delete, and toggle availability.

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import {
  fetchVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} from '../api/axios';

const emptyForm = {
  name: '',
  capacity: '',
  location: '',
  isAvailable: true,
};

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchVenues();
      setVenues(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load venues');
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

  const handleEdit = (venue) => {
    setForm({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location || '',
      isAvailable: venue.isAvailable,
    });
    setEditingId(venue._id);
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    setDeletingId(id);
    try {
      await deleteVenue(id);
      setVenues((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete venue');
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
        const { data } = await updateVenue(editingId, form);
        setVenues((prev) => prev.map((v) => (v._id === editingId ? data : v)));
      } else {
        const { data } = await createVenue(form);
        setVenues((prev) => [...prev, data]);
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

  return (
    <Layout title='Venues'>
      <div>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
              Venues
            </h1>
            <p className='text-gray-500 text-sm mt-1'>
              {venues.length} venue{venues.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
          >
            <Plus size={16} />
            Add Venue
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
        ) : venues.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
            <p className='text-gray-500 text-sm'>No venues found.</p>
            <button
              onClick={handleAddNew}
              className='mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
            >
              Add your first venue
            </button>
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
                      Capacity
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell'>
                      Location
                    </th>
                    <th className='text-left px-4 py-3 font-medium text-gray-600'>
                      Status
                    </th>
                    <th className='text-right px-4 py-3 font-medium text-gray-600'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {venues.map((venue) => (
                    <tr
                      key={venue._id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3 font-medium text-gray-800'>
                        {venue.name}
                      </td>
                      <td className='px-4 py-3 text-gray-600'>
                        {venue.capacity} seats
                      </td>
                      <td className='px-4 py-3 text-gray-600 hidden md:table-cell'>
                        {venue.location || 'Not specified'}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            venue.isAvailable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {venue.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleEdit(venue)}
                            className='p-1.5 text-gray-400 hover:text-indigo-600 transition-colors'
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(venue._id)}
                            disabled={deletingId === venue._id}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Venue' : 'Add New Venue'}
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          {formError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm'>
              {formError}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Venue Name
            </label>
            <input
              name='name'
              value={form.name}
              onChange={handleFormChange}
              placeholder='e.g. Main Auditorium'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Capacity
            </label>
            <input
              name='capacity'
              type='number'
              value={form.capacity}
              onChange={handleFormChange}
              placeholder='e.g. 200'
              required
              min='1'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Location (optional)
            </label>
            <input
              name='location'
              value={form.location}
              onChange={handleFormChange}
              placeholder='e.g. Faculty of Science Block B'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </div>

          <div className='flex items-center gap-3'>
            <input
              type='checkbox'
              name='isAvailable'
              id='isAvailable'
              checked={form.isAvailable}
              onChange={handleFormChange}
              className='w-4 h-4 text-indigo-600 rounded'
            />
            <label htmlFor='isAvailable' className='text-sm text-gray-700'>
              Venue is currently available
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
                  : 'Add Venue'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default VenuesPage;
