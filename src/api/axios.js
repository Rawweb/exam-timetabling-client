import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Course API calls ────────────────────
export const fetchCourses = (params) => api.get('/courses', { params });
export const fetchCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// ─── Venue API calls ─────────────────────
export const fetchVenues = (params) => api.get('/venues', { params });
export const fetchVenueById = (id) => api.get(`/venues/${id}`);
export const createVenue = (data) => api.post('/venues', data);
export const updateVenue = (id, data) => api.put(`/venues/${id}`, data);
export const deleteVenue = (id) => api.delete(`/venues/${id}`);

// ─── Student API calls ───────────────────
export const fetchStudents = (params) => api.get('/students', { params });
export const fetchStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const importStudentsCSV = (formData) =>
  api.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Exam Period API calls ───────────────
export const fetchExamPeriods = (params) =>
  api.get('/exam-periods', { params });
export const fetchExamPeriodById = (id) => api.get(`/exam-periods/${id}`);
export const createExamPeriod = (data) => api.post('/exam-periods', data);
export const updateExamPeriod = (id, data) =>
  api.put(`/exam-periods/${id}`, data);
export const deleteExamPeriod = (id) => api.delete(`/exam-periods/${id}`);
export const activateExamPeriod = (id) =>
  api.patch(`/exam-periods/${id}/activate`);

// ─── Timetable API calls ─────────────────
export const fetchTimetables = () => api.get('/timetable');
export const fetchTimetableById = (id) => api.get(`/timetable/${id}`);
export const generateTimetable = (data) => api.post('/timetable/generate', data);
export const publishTimetable = (id) => api.patch(`/timetable/${id}/publish`);
export const deleteTimetable = (id) => api.delete(`/timetable/${id}`);
export const fetchTimetableConflicts = (id) =>
  api.get(`/timetable/${id}/conflicts`);

// Export returns binary data, so responseType must be 'blob'.
// Without this, Axios treats the response as text and corrupts the file.
export const exportTimetableExcel = (id) =>
  api.get(`/timetable/${id}/export`, { responseType: 'blob' });

// ─── Dashboard API calls ─────────────────
export const fetchDashboardStats = () => api.get('/dashboard/stats');

export default api;
