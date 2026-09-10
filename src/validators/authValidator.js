
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const validateLogin = (body) => {
  const { email, password } = body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Please provide a valid email address' };
  }

  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  return { valid: true, message: '' };
};

module.exports = { validateLogin };
