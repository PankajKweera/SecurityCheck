const { findById } = require('../models/User');

const sanitize = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
});

const getProfile = async (req, res) => {
  try {
    const user = findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Error---login again' });
    }

    return res.status(200).json({
      success: true,
      profile: sanitize(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

module.exports = { getProfile };
