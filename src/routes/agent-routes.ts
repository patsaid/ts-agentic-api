import { Router } from 'express';
import { runAgent } from '../services/agent-service';
import { agentQuerySchema } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /agent/ask:
 *   post:
 *     summary: Ask the agent a question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Who is the president of France?"
 *     responses:
 *       200:
 *         description: Answer from the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 */
router.post('/ask', async (req, res) => {
  try {
    const { question } = agentQuerySchema.parse(req.body);
    const answer = await runAgent(question);
    res.json({ answer });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /agent/weather/{city}:
 *   get:
 *     summary: Get weather info for a city
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *           example: "Montreal"
 *     responses:
 *       200:
 *         description: Weather info from the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 */
router.get('/weather/:city', async (req, res) => {
  try {
    const answer = await runAgent(`What is the weather in ${req.params.city}?`);
    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /agent/local/{name}:
 *   get:
 *     summary: Fetch local DB info via the agent
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "Alice"
 *     responses:
 *       200:
 *         description: Local DB info returned by the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 */
router.get('/local/:name', async (req, res) => {
  try {
    const answer = await runAgent(`Fetch info for user ${req.params.name}`);
    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
