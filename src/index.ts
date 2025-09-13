import express from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import userRoutes from './routes/user-routes';
import agentRoutes from './routes/agent-routes';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';


dotenv.config();
const app = express();
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agentdb';
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Agentic API',
      version: '1.0.0',
      description: 'API documentation for the Agentic TypeScript backend',
    },
  },
  apis: ['./src/routes/*.ts'], // path to your route files
};
const swaggerSpec = swaggerJsDoc(swaggerOptions);


app.use(cors({
  origin: 'http://localhost:5173',
}));

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/users', userRoutes);
app.use('/agent', agentRoutes);

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📄 Swagger docs at http://localhost:${PORT}/api-docs`);
});
