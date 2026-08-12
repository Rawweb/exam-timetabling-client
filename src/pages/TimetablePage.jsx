// pages/TimetablePage.jsx
// The core feature page of the system.
// Officer selects a semester, clicks generate, and the system
// runs GA + SA and displays the resulting timetable.

import { useState, useEffect } from 'react';
import {
  Play,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  FileWarning,
  Printer,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Modal from '../components/common/Modal';
import {
  fetchTimetables,
  fetchTimetableById,
  generateTimetable,
  publishTimetable,
  deleteTimetable,
  exportTimetableExcel,
  fetchTimetableConflicts,
} from '../api/axios';

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-700',
  validated: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const TimetablePage = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Generate modal state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // View modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingTimetable, setViewingTimetable] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Filter
  const [filterSemester, setFilterSemester] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  // conflict
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictReport, setConflictReport] = useState(null);
  const [conflictLoading, setConflictLoading] = useState(false);

  useEffect(() => {
    loadTimetables();
  }, []);

  const loadTimetables = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await fetchTimetables();
      setTimetables(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load timetables');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!viewingTimetable) return;

    // Group entries by date for clean day-by-day layout
    const grouped = groupEntriesByDate(viewingTimetable.entries);

    // Assign day numbers the same way the Excel export does
    const uniqueDates = [
      ...new Set(
        viewingTimetable.entries.map(
          (e) => new Date(e.date).toISOString().split('T')[0],
        ),
      ),
    ].sort();

    const dayNumberMap = {};
    uniqueDates.forEach((date, index) => {
      dayNumberMap[date] = index + 1;
    });

    // Build the rows for the full timetable table
    const tableRows = viewingTimetable.entries
      .slice()
      .sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.timeSlot.localeCompare(b.timeSlot);
      })
      .map((entry) => {
        const dateStr = new Date(entry.date).toISOString().split('T')[0];
        const formattedDate = new Date(entry.date).toLocaleDateString('en-NG', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return `
        <tr>
          <td>${dayNumberMap[dateStr]}</td>
          <td>${formattedDate}</td>
          <td>${entry.timeSlot}</td>
          <td><strong>${entry.course?.code || ''}</strong></td>
          <td>${entry.course?.title || ''}</td>
          <td>${entry.course?.department || ''}</td>
          <td>${entry.course?.level ? entry.course.level + 'L' : ''}</td>
          <td>${entry.venue?.name || ''}</td>
          <td>${entry.studentCount || 0}</td>
        </tr>
      `;
      })
      .join('');

    // Build the complete HTML document for the print page
    const printContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${viewingTimetable.examPeriod?.name || 'Timetable'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #111;
          padding: 20mm;
          background: white;
        }

        /* Header section */
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #1e1b4b;
          padding-bottom: 12px;
        }
        .header h1 {
          font-size: 16px;
          font-weight: bold;
          color: #1e1b4b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header p {
          font-size: 11px;
          color: #444;
          margin-top: 4px;
        }

        /* Metadata row */
        .meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 10px;
          color: #555;
        }
        .meta span { font-weight: bold; color: #111; }

        /* Validity badge */
        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        .badge.valid { background: #dcfce7; color: #166534; }
        .badge.invalid { background: #fee2e2; color: #991b1b; }

        /* Table styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #1e1b4b;
          color: white;
          padding: 6px 8px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        td {
          padding: 5px 8px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }
        tr:nth-child(even) td { background: #f9fafb; }
        tr:hover td { background: #eff6ff; }

        /* Footer */
        .footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #888;
        }

        /* Print specific rules */
        @media print {
          body { padding: 10mm; }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
        }
      </style>
    </head>
    <body>

      <div class="header">
        <h1>${viewingTimetable.examPeriod?.name || 'Examination Timetable'}</h1>
        <p>
          Academic Year: <strong>${viewingTimetable.academicYear}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Semester: <strong>${viewingTimetable.semester}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Status: <span class="badge ${viewingTimetable.isValid ? 'valid' : 'invalid'}">
            ${viewingTimetable.isValid ? 'Valid — No Conflicts' : 'Has Conflicts'}
          </span>
        </p>
      </div>

      <div class="meta">
        <div>
          Total Exam Entries: <span>${viewingTimetable.entries.length}</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          GA Generations: <span>${viewingTimetable.algorithmMetrics?.generationCount || 0}</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Fitness Score: <span>${viewingTimetable.algorithmMetrics?.fitnessScore || 0}</span>
        </div>
        <div>
          Generated: <span>${new Date(
            viewingTimetable.createdAt,
          ).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Date</th>
            <th>Time</th>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Department</th>
            <th>Level</th>
            <th>Venue</th>
            <th>Students</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <span>Generated by Examination Timetabling System</span>
        <span>Printed: ${new Date().toLocaleDateString('en-NG', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}</span>
      </div>

      <script>
        // Automatically open the print dialog when the tab loads.
        // The officer does not need to press Ctrl+P manually.
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

    // Open a new browser tab and write the HTML into it
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert(
        'Pop-up blocked. Please allow pop-ups for this site and try again.',
      );
    }
  };

  const handleConflictReport = async (id) => {
    setConflictReport(null);
    setConflictLoading(true);
    setConflictModalOpen(true);
    try {
      const { data } = await fetchTimetableConflicts(id);
      setConflictReport(data);
    } catch (err) {
      setConflictReport(null);
    } finally {
      setConflictLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSemester) return;
    setGenerateError('');
    setGenerating(true);

    try {
      const { data } = await generateTimetable({
        semester: Number(selectedSemester),
      });
      setTimetables((prev) => [data, ...prev]);
      setGenerateModalOpen(false);
      setSelectedSemester('');
    } catch (err) {
      setGenerateError(
        err.response?.data?.message ||
          'Generation failed. Make sure the Python service is running.',
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (id, name, semester) => {
    try {
      const response = await exportTimetableExcel(id);

      // Create a temporary URL pointing to the binary blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a hidden link element, click it to trigger the download,
      // then remove it from the DOM immediately
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${(name || 'Timetable').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Semester${semester}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the object URL to free memory
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export timetable. Please try again.');
    }
  };

  const handleView = async (id) => {
    setViewLoading(true);
    setViewModalOpen(true);
    try {
      const { data } = await fetchTimetableById(id);
      setViewingTimetable(data);
    } catch (err) {
      setViewingTimetable(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handlePublish = async (id) => {
    if (
      !window.confirm(
        'Publish this timetable? This marks it as the official timetable.',
      )
    )
      return;
    setPublishingId(id);
    try {
      await publishTimetable(id);
      setTimetables((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: 'published' } : t)),
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this timetable permanently?')) return;
    setDeletingId(id);
    try {
      await deleteTimetable(id);
      setTimetables((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filterSemester
    ? timetables.filter((t) => String(t.semester) === filterSemester)
    : timetables;

  // Group timetable entries by date for display
  const groupEntriesByDate = (entries) => {
    const groups = {};
    for (const entry of entries) {
      const date = new Date(entry.date).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  return (
    <Layout title='Generate Timetable'>
      <div>
        {/* Page header */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900'>
              Timetable Generation
            </h1>
            <p className='text-gray-500 text-sm mt-1'>
              {timetables.length} timetable
              {timetables.length !== 1 ? 's' : ''} generated
            </p>
          </div>

          <div className='flex gap-3'>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value=''>All Semesters</option>
              <option value='1'>Semester 1</option>
              <option value='2'>Semester 2</option>
            </select>

            <button
              onClick={() => {
                setGenerateError('');
                setSelectedSemester('');
                setGenerateModalOpen(true);
              }}
              className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
            >
              <Play size={15} />
              Generate
            </button>
          </div>
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
        ) : filtered.length === 0 ? (
          <div className='bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center'>
            <Play size={40} className='mx-auto text-indigo-200 mb-4' />
            <p className='text-gray-500 text-sm'>
              No timetables generated yet.
            </p>
            <p className='text-gray-400 text-xs mt-1 mb-4'>
              Make sure you have an active exam period set before generating.
            </p>
            <button
              onClick={() => setGenerateModalOpen(true)}
              className='px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors'
            >
              Generate First Timetable
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            {filtered.map((timetable) => (
              <div
                key={timetable._id}
                className='bg-white rounded-xl border border-gray-100 shadow-sm p-5'
              >
                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                  <div className='flex-1'>
                    {/* Timetable title and status */}
                    <div className='flex items-center gap-2 flex-wrap mb-2'>
                      <h3 className='font-semibold text-gray-900'>
                        {timetable.examPeriod?.name || 'Exam Timetable'}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[timetable.status]
                        }`}
                      >
                        {timetable.status.charAt(0).toUpperCase() +
                          timetable.status.slice(1)}
                      </span>
                      {timetable.isValid ? (
                        <span className='flex items-center gap-1 text-xs text-green-600'>
                          <CheckCircle size={12} />
                          Valid
                        </span>
                      ) : (
                        <span className='flex items-center gap-1 text-xs text-red-500'>
                          <XCircle size={12} />
                          Has conflicts
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500'>
                      <span>Semester {timetable.semester}</span>
                      <span>{timetable.academicYear}</span>
                      <span>{timetable.entries?.length || 0} exam entries</span>
                      <span>Generated {formatDate(timetable.createdAt)}</span>
                    </div>

                    {/* Algorithm metrics */}
                    {timetable.algorithmMetrics && (
                      <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-2'>
                        <span>
                          {timetable.algorithmMetrics.generationCount} GA
                          generations
                        </span>
                        <span>
                          Fitness score:{' '}
                          {timetable.algorithmMetrics.fitnessScore}
                        </span>
                        <span>
                          {timetable.algorithmMetrics.executionTimeMs}ms
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className='flex items-center gap-2 shrink-0 flex-wrap'>
                    <button
                      onClick={() => handleView(timetable._id)}
                      className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <Eye size={12} />
                      View
                    </button>

                    <button
                      onClick={() => handleConflictReport(timetable._id)}
                      className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors'
                    >
                      <FileWarning size={12} />
                      Conflicts
                    </button>

                    <button
                      onClick={() =>
                        handleExport(
                          timetable._id,
                          timetable.examPeriod?.name,
                          timetable.semester,
                        )
                      }
                      className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors'
                    >
                      <Download size={12} />
                      Export
                    </button>

                    {timetable.isValid && timetable.status !== 'published' && (
                      <button
                        onClick={() => handlePublish(timetable._id)}
                        disabled={publishingId === timetable._id}
                        className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50'
                      >
                        <CheckCircle size={12} />
                        {publishingId === timetable._id
                          ? 'Publishing...'
                          : 'Publish'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(timetable._id)}
                      disabled={deletingId === timetable._id}
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

      {/* ─── Generate Modal ────────────────────────────── */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => !generating && setGenerateModalOpen(false)}
        title='Generate Examination Timetable'
      >
        <div className='space-y-4'>
          {generateError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm'>
              {generateError}
            </div>
          )}

          {generating ? (
            <div className='text-center py-8'>
              <div className='w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
              <p className='text-gray-700 font-medium'>
                Generating timetable...
              </p>
              <p className='text-gray-400 text-sm mt-2'>
                Running Genetic Algorithm and Simulated Annealing. This may take
                up to 30 seconds.
              </p>
            </div>
          ) : (
            <>
              <div className='bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-indigo-800'>
                Make sure an active exam period is set for the semester you
                choose. The system will use that period's date range and time
                slots.
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Select Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
                >
                  <option value=''>Choose semester</option>
                  <option value='1'>Semester 1</option>
                  <option value='2'>Semester 2</option>
                </select>
              </div>

              <div className='flex gap-3 pt-2'>
                <button
                  onClick={() => setGenerateModalOpen(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedSemester}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors'
                >
                  <Play size={14} />
                  Generate Now
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ─── View Timetable Modal ──────────────────────── */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingTimetable(null);
        }}
        title={viewingTimetable?.examPeriod?.name || 'Timetable Details'}
      >
        {viewLoading ? (
          <div className='flex justify-center py-8'>
            <div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : viewingTimetable ? (
          <div className='space-y-4'>
            {/* Print and export actions inside the modal */}
            <div className='flex justify-end gap-2'>
              <button
                onClick={handlePrint}
                className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Printer size={13} />
                Print Timetable
              </button>
            </div>

            {/* Validity banner */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                viewingTimetable.isValid
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {viewingTimetable.isValid ? (
                <CheckCircle size={16} />
              ) : (
                <XCircle size={16} />
              )}
              {viewingTimetable.isValid
                ? 'This timetable is conflict-free and valid.'
                : 'This timetable has conflicts. Consider regenerating.'}
            </div>

            {/* Timetable entries grouped by date */}
            <div className='max-h-96 overflow-y-auto space-y-4'>
              {groupEntriesByDate(viewingTimetable.entries).map(
                ([date, entries]) => (
                  <div key={date}>
                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      {new Date(date).toLocaleDateString('en-NG', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <div className='space-y-2'>
                      {entries.map((entry, i) => (
                        <div
                          key={i}
                          className='border border-gray-100 rounded-lg px-3 py-2 bg-gray-50'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='font-mono text-indigo-700 text-xs font-medium'>
                              {entry.course?.code}
                            </span>
                            <span className='text-xs text-gray-500'>
                              {entry.timeSlot}
                            </span>
                          </div>
                          <p className='text-sm text-gray-800 mt-0.5'>
                            {entry.course?.title}
                          </p>
                          <div className='flex items-center justify-between mt-1 text-xs text-gray-500'>
                            <span>{entry.venue?.name}</span>
                            <span>
                              {entry.studentCount} students /{' '}
                              {entry.venue?.capacity} capacity
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          <p className='text-gray-500 text-sm text-center py-4'>
            Failed to load timetable details.
          </p>
        )}
      </Modal>

      {/* ─── Conflict Report Modal ────────────────────────── */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => {
          setConflictModalOpen(false);
          setConflictReport(null);
        }}
        title='Conflict Report'
      >
        {conflictLoading ? (
          <div className='flex justify-center py-8'>
            <div className='w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin' />
          </div>
        ) : conflictReport ? (
          <div className='space-y-5'>
            {/* Summary banner */}
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                conflictReport.isClean
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {conflictReport.isClean ? (
                <CheckCircle size={18} className='shrink-0' />
              ) : (
                <XCircle size={18} className='shrink-0' />
              )}
              <div>
                <p className='text-sm font-semibold'>
                  {conflictReport.isClean
                    ? 'No conflicts detected. This timetable is clean.'
                    : `${conflictReport.totalConflicts} conflict${
                        conflictReport.totalConflicts !== 1 ? 's' : ''
                      } detected.`}
                </p>
                {!conflictReport.isClean && (
                  <p className='text-xs mt-0.5 opacity-80'>
                    Regenerate the timetable to resolve these conflicts.
                  </p>
                )}
              </div>
            </div>

            {/* Only show detail sections when conflicts exist */}
            {!conflictReport.isClean && (
              <div className='space-y-4 max-h-80 overflow-y-auto'>
                {/* Student conflicts */}
                {conflictReport.studentConflicts.length > 0 && (
                  <div>
                    <h4 className='text-xs font-semibold text-red-700 uppercase tracking-wide mb-2'>
                      Student Conflicts (
                      {conflictReport.studentConflicts.length})
                    </h4>
                    <div className='space-y-2'>
                      {conflictReport.studentConflicts.map((c, i) => (
                        <div
                          key={i}
                          className='bg-red-50 border border-red-100 rounded-lg p-3 text-xs'
                        >
                          <p className='font-medium text-red-800 mb-1'>
                            {c.date}, {c.timeSlot}
                          </p>
                          <p className='text-red-700'>
                            <span className='font-mono'>{c.courseA.code}</span>{' '}
                            and{' '}
                            <span className='font-mono'>{c.courseB.code}</span>{' '}
                            are scheduled at the same time.
                          </p>
                          <p className='text-red-500 mt-1'>
                            {c.affectedStudents} student
                            {c.affectedStudents !== 1 ? 's' : ''} registered for
                            both.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Venue conflicts */}
                {conflictReport.venueConflicts.length > 0 && (
                  <div>
                    <h4 className='text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2'>
                      Venue Conflicts ({conflictReport.venueConflicts.length})
                    </h4>
                    <div className='space-y-2'>
                      {conflictReport.venueConflicts.map((c, i) => (
                        <div
                          key={i}
                          className='bg-orange-50 border border-orange-100 rounded-lg p-3 text-xs'
                        >
                          <p className='font-medium text-orange-800 mb-1'>
                            {c.date}, {c.timeSlot}, {c.venue}
                          </p>
                          <p className='text-orange-700'>
                            {c.courses.map((course) => (
                              <span
                                key={course.code}
                                className='font-mono mr-2'
                              >
                                {course.code}
                              </span>
                            ))}
                            are both assigned to this venue.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity violations */}
                {conflictReport.capacityViolations.length > 0 && (
                  <div>
                    <h4 className='text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2'>
                      Capacity Violations (
                      {conflictReport.capacityViolations.length})
                    </h4>
                    <div className='space-y-2'>
                      {conflictReport.capacityViolations.map((c, i) => (
                        <div
                          key={i}
                          className='bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs'
                        >
                          <p className='font-medium text-yellow-800 mb-1'>
                            {c.date}, {c.timeSlot}
                          </p>
                          <p className='text-yellow-700'>
                            <span className='font-mono'>{c.course.code}</span>{' '}
                            at {c.venue}: {c.studentCount} students in a{' '}
                            {c.venueCapacity}-seat venue.
                          </p>
                          <p className='text-yellow-500 mt-1'>
                            Overflow: {c.overflow} student
                            {c.overflow !== 1 ? 's' : ''} over capacity.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className='text-gray-500 text-sm text-center py-4'>
            Failed to load conflict report.
          </p>
        )}
      </Modal>
    </Layout>
  );
};

export default TimetablePage;
