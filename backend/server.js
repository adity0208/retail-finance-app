import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';


// 1. Resolve Runtime Port (with your defensive fallback)
const PORT = process.env.PORT || 5000;

connectDB(); // 2. Establish Database Connection
const app = express();
app.use(cors());
app.use(express.json());

//core infrastructure routes
app.get('/api/health', (req, res) =>{
    res.status(200).json({
        status: 'healthy',
        message: 'Shop finance API is healthy and running smoothly.',
        timestamp: new Date().toISOString()
    })
})

// 5. Start the HTTP Listener
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` SERVER BOOT SUCCESSFUL                  `);
  console.log(` Finance API listening on port: ${PORT}   `);
  console.log(`=========================================`);
});