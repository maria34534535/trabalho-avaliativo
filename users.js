const express = require('express');
const {
  saveUser,
  findUserByEmail,
  findUserById,
} = require('../database/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const z = require('zod');
const router = express.Router();

const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', async (req, res) => {
  try {
    const user = userSchema.parse(req.body);
    const checkUserRegister = await findUserByEmail(user.email);
    if (checkUserRegister)
      res.status(400).json({
        message: 'Email registrado',
      });

    const hashPassword = bcrypt.hashSync(req.body.password, 10);
    user.password = hashPassword;
    const savedUser = await saveUser(user);
    delete savedUser.password;
    res.status(201).json({
      message: 'Created',
      savedUser,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = loginSchema.parse(req.body);

    const registerUser = await findUserByEmail(user.email);
    if (!registerUser) return res.status(401).send();

    const comparePassword = bcrypt.compareSync(
      user.password,
      registerUser.password
    );
    if (!comparePassword) return res.status(401).send();

    const token = jwt.sign({ userId: registerUser.id }, process.env.SECRET);

    res.status(200).json({
      message: 'Sucesso',
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

router.get('/id', auth, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) return res.status(400).json({ message: 'User not found' });

    res.status(200).json({
      user,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({
        message: err.message,
      });
    res.status(500).json({
      message: 'Server Error',
    });
  }
});

module.exports = {
  router,
};
