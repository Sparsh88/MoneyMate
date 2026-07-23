export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 letter, 1 number
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '').trim(); // Basic XSS protection logic
};
