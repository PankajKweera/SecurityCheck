

require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';


const users = [
  {
    id: 'user_001',
    name: 'Pankaj Test',
    email: 'pankaj@test.com',
    password: 'secret123',
    activeToken: null,    
  },
];


const generateToken = (id, device) =>
  jwt.sign({ id, device, ts: Date.now() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const findUser = (email) => users.find((u) => u.email === email);
const findUserById = (id) => users.find((u) => u.id === id);



const login = (email, password) => {
  const user = findUser(email);
  if (!user || user.password !== password) {
    return { status: 401, body: { success: false, message: 'Invalid credentials' } };
  }

  const token = generateToken(user.id, email + Date.now());
  user.activeToken = token; 

  return {
    status: 200,
    body: {
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    },
  };
};


const logout = (token) => {
  const result = protect(token);
  if (!result.success) return { status: 401, body: result };

  result.user.activeToken = null; 
  return { status: 200, body: { success: true, message: 'Logged out successfully' } };
};


const protect = (token) => {
  if (!token) {
    return { success: false, status: 401, message: 'No token provided' };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return { success: false, status: 401, message: 'Token is invalid or expired' };
  }

  const user = findUserById(decoded.id);
  if (!user) {
    return { success: false, status: 401, message: 'User not found' };
  }


  if (user.activeToken !== token) {
    return {
      success: false,
      status: 401,
      message: 'Session expired. You logged in from another device. Please log in again.',
    };
  }

  return { success: true, user };
};


const getMe = (token) => {
  const result = protect(token);
  if (!result.success) return { status: result.status, body: { success: false, message: result.message } };

  const { user } = result;
  return {
    status: 200,
    body: { success: true, user: { id: user.id, name: user.name, email: user.email } },
  };
};


const log = (label, res) => {
  const icon = res.status === 200 || res.status === 201 ? 'ok' : 'notok';
  console.log(`${icon}  ${label}`);
  console.log(`   Status : ${res.status}`);
  console.log(`   Message: ${res.body.message || JSON.stringify(res.body.user || '')}`);
  console.log();
};


