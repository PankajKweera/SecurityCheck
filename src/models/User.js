const users = [
  {
    id: 'user_001',
    name: 'Pankaj',
    email: 'pankaj@test.com',
    password: '$2b$12$UEpMl1DS4wb49V8TAD.1L.lm.XMvmqoE6bhgyVDsEfjBdRPAug63S', // bcrypt of 'secret123'
    phone: null,
    address: null,
    activeToken: null,
  },
];

const findByEmail = (email) =>
  users.find((u) => u.email.toLowerCase() === email.toLowerCase());

const findById = (id) => users.find((u) => u.id === id);

const updateActiveToken = (id, token) => {
  const user = findById(id);
  if (user) user.activeToken = token;
};

module.exports = { findByEmail, findById, updateActiveToken };
