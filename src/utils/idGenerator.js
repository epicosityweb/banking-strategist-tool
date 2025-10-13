/**
 * Simple UUID v4 generator
 * @returns {string} UUID v4 string
 */
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate a short ID (8 characters)
 * @returns {string} Short ID
 */
export const generateShortId = () => {
  return Math.random().toString(36).substring(2, 10);
};
