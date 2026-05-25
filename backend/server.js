import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import transactionRoutes from './routes/transactionRoutes.js'; // New Import Shard

const PORT = process.env.PORT || 5000;
const app = express();

// Initialize Database Connection
connectDB();

// Global Middleware Pipeline
app.use(cors());
app.use(express.json());

// Mounting Core Architectural Routes
app.use('/api/transactions', transactionRoutes); // New Routing Mount Shard

// Infrastructure Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Shop Finance API is fully operational',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` SERVER BOOT SUCCESSFUL                  `);
  console.log(` Finance API listening on port: ${PORT}   `);
  console.log(`=========================================`);
});