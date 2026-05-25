import express from 'express';
import { createTransaction } from '../controllers/transactionController.js';

const router = express.Router();

// Route Mapping: Direct incoming POST requests to our Controller handler
router.route('/').post(createTransaction);

export default router;