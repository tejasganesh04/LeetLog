const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../repositories');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/server-config');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const register = async ({ name, email, password }) => {
  const existing = await UserRepository.findByEmail(email);
  if (existing) throw new BadRequestError('Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserRepository.create({ name, email, passwordHash });

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: user._id, name: user.name, email: user.email } };
};

const login = async ({ email, password }) => {
  const user = await UserRepository.findByEmail(email);
  if (!user) throw new UnauthorizedError('Invalid credentials');

  if (!user.passwordHash) throw new UnauthorizedError('Invalid credentials');
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: user._id, name: user.name, email: user.email } };
};

const getMe = async (userId) => UserRepository.findById(userId);

module.exports = { register, login, getMe };
