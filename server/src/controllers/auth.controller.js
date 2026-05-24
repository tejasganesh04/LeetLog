const { AuthService } = require('../services');
const { success } = require('../utils/response');
const { BadRequestError } = require('../utils/errors');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim()) throw new BadRequestError('Name is required');
    if (!email?.trim() || !EMAIL_RE.test(email)) throw new BadRequestError('Valid email is required');
    if (!password || password.length < 8) throw new BadRequestError('Password must be at least 8 characters');
    const data = await AuthService.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
    success(res, data, 'Account created', 201);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email?.trim() || !password) throw new BadRequestError('Email and password are required');
    const data = await AuthService.login({ email: email.trim().toLowerCase(), password });
    success(res, data, 'Logged in');
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    const user = await AuthService.getMe(req.userId);
    success(res, user);
  } catch (err) { next(err); }
};

module.exports = { register, login, me };
