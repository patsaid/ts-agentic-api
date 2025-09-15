import { Router } from 'express';
import { runAgent } from '../services/agent-service';
import { agentAskSchema } from '../utils/validation';
import Conversation from '../models/conversation';

const router = Router();


/**
 * @swagger
 * /agent/conversations/new:
 *   post:
 *     summary: Start a new conversation for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64c9f4f8c2d5f2e4b8d12345"
 *     responses:
 *       201:
 *         description: New conversation created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversationId:
 *                   type: string
 */
router.post('/conversations/new', async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = new Conversation({
      user: userId,
      summary: '',
      messages: [],
    });
    await conversation.save();
    res.status(201).json({ conversationId: conversation._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * @swagger
 * /agent/ask:
 *   post:
 *     summary: Ask the agent a question (link to a conversation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64c9f4f8c2d5f2e4b8d12345"
 *                 description: User asking the question
 *               conversationId:
 *                 type: string
 *                 example: "64ca0f1a3b4e2c5d6f7a1234"
 *                 description: Optional. If provided, the question is added to this conversation. If missing or invalid, a new conversation is created.
 *               question:
 *                 type: string
 *                 example: "Who is the president of France?"
 *     responses:
 *       200:
 *         description: Answer from the agent with conversation info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                 conversationId:
 *                   type: string
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, userId, conversationId } = agentAskSchema.parse(req.body);

    // Run the agent
    const answer = await runAgent(question);

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      // Create a new conversation if no valid conversationId
      conversation = new Conversation({
        user: userId,
        summary: question.slice(0, 50) + '...',
        messages: [],
      });
    }

    conversation.messages.push({ question: question ?? '', answer: answer ?? '' });
    await conversation.save();

    res.json({ answer, conversationId: conversation._id });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /agent/conversations/{userId}:
 *   get:
 *     summary: Get all conversations for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "64c9f4f8c2d5f2e4b8d12345"
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conversation'
 */
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.json(conversations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /agent/weather/{city}:
 *   post:
 *     summary: Get weather info for a city (with persistence)
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64c9f4f8c2d5f2e4b8d12345"
 *     responses:
 *       200:
 *         description: Weather answer with persisted conversation
 */
router.post('/weather/:city', async (req, res) => {
  try {
    const { userId } = req.body;
    const question = `What is the weather in ${req.params.city}?`;

    const answer = await runAgent(question);

    // Find or create conversation
    let conversation = await Conversation.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (!conversation) {
      conversation = new Conversation({
        user: userId,
        summary: question.slice(0, 50) + '...',
        messages: [],
      });
    }

    conversation.messages.push({ question: question ?? '', answer: answer ?? '' });
    await conversation.save();

    res.json({ answer, conversationId: conversation._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /agent/local/{name}:
 *   post:
 *     summary: Fetch local DB info via the agent (with persistence)
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "Alice"
 *         description: Name of the user to fetch info for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "64c9f4f8c2d5f2e4b8d12345"
 *                 description: The ID of the signed-in user performing the request
 *     responses:
 *       200:
 *         description: Answer from the agent with persisted conversation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: The agent’s answer
 *                 conversationId:
 *                   type: string
 *                   description: The ID of the conversation in the database
 *       500:
 *         description: Server error
 */
router.post('/local/:name', async (req, res) => {
  try {
    const { userId } = req.body;
    const question = `Fetch info for user ${req.params.name}`;

    const answer = await runAgent(question);

    let conversation = await Conversation.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (!conversation) {
      conversation = new Conversation({
        user: userId,
        summary: question.slice(0, 50) + '...',
        messages: [],
      });
    }

    conversation.messages.push({ question: question ?? '', answer: answer ?? '' });
    await conversation.save();

    res.json({ answer, conversationId: conversation._id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         summary:
 *           type: string
 *         messages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
