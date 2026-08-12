import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Course API calls ────────────────────
export const fetchCourses = (params) => API.get('/courses', { params });
export const fetchCourseById = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);

// ─── Venue API calls ─────────────────────
export const fetchVenues = (params) => API.get('/venues', { params });
export const fetchVenueById = (id) => API.get(`/venues/${id}`);
export const createVenue = (data) => API.post('/venues', data);
export const updateVenue = (id, data) => API.put(`/venues/${id}`, data);
export const deleteVenue = (id) => API.delete(`/venues/${id}`);

// ─── Student API calls ───────────────────
export const fetchStudents = (params) => API.get('/students', { params });
export const fetchStudentById = (id) => API.get(`/students/${id}`);
export const createStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);
export const importStudentsCSV = (formData) =>
  API.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Exam Period API calls ───────────────
export const fetchExamPeriods = (params) =>
  API.get('/exam-periods', { params });
export const fetchExamPeriodById = (id) => API.get(`/exam-periods/${id}`);
export const createExamPeriod = (data) => API.post('/exam-periods', data);
export const updateExamPeriod = (id, data) =>
  API.put(`/exam-periods/${id}`, data);
export const deleteExamPeriod = (id) => API.delete(`/exam-periods/${id}`);
export const activateExamPeriod = (id) =>
  API.patch(`/exam-periods/${id}/activate`);

// ─── Timetable API calls ─────────────────
export const fetchTimetables = () => API.get('/timetable');
export const fetchTimetableById = (id) => API.get(`/timetable/${id}`);
export const generateTimetable = (data) => API.post('/timetable/generate', data);
export const publishTimetable = (id) => API.patch(`/timetable/${id}/publish`);
export const deleteTimetable = (id) => API.delete(`/timetable/${id}`);
export const fetchTimetableConflicts = (id) =>
  API.get(`/timetable/${id}/conflicts`);

// Export returns binary data, so responseType must be 'blob'.
// Without this, Axios treats the response as text and corrupts the file.
export const exportTimetableExcel = (id) =>
  API.get(`/timetable/${id}/export`, { responseType: 'blob' });

// ─── Dashboard API calls ─────────────────
export const fetchDashboardStats = () => API.get('/dashboard/stats');

export default API;
