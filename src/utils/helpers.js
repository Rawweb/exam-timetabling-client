// utils/helpers.js
// Small reusable helper functions used across multiple pages.

// Formats a raw date string into a readable human-friendly format
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Capitalizes the first letter of any string
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
