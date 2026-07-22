import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import transactionRoutes from './routes/transactionRoutes.js'; // New Import Shard
import electronicsRoutes from './routes/electronicsRoutes.js';
import clothingRoutes from './routes/clothingRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';

const PORT = process.env.PORT || 5000;
const app = express();

// Initialize Database Connection
connectDB();

// Global Middleware Pipeline
app.use(cors());
app.use(express.json());

// Mounting Core Architectural Routes
app.use('/api/transactions', transactionRoutes); // Existing financial ledger routes
app.use('/api/electronics', electronicsRoutes);  // Electronics inventory (was Coolers)
app.use('/api/clothing', clothingRoutes);         // Clothing SKU management
app.use('/api/customers', customerRoutes);       // Customer directory
app.use('/api/search', searchRoutes);             // Global quick-lookup search by code
app.use('/api/checkout', checkoutRoutes);         // POS checkout endpoint

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