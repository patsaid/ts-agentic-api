import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import { userSchema } from '../utils/validation';
import Conversation from '../models/conversation';

const router = Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "alice@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "secret123"
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', async (req, res) => {
  try {
    const { email, password } = userSchema.parse(req.body);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      hashed_password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ _id: user._id, email: user.email });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user (email or password)
 */
router.put('/:id', async (req, res) => {
  try {
    const { email, password } = req.body;

    const updateData: Partial<{ email: string; hashed_password: string }> = {};
    if (email) updateData.email = email;
    if (password) {
      updateData.hashed_password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ _id: updated._id, email: updated.email });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user and cascade delete conversations
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cascade delete conversations
    await Conversation.deleteMany({ userId });

    res.json({ message: 'User and conversations deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Log in an existing user
 *     description: Authenticate a user with email and password, returning basic user info.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "patrick@example.com"
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: Successfully authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64c9f4f8c2d5f2e4b8d12345"
 *                 email:
 *                   type: string
 *                   example: "patrick@example.com"
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid email or password"
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.json({ _id: user._id, email: user.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
