import express from 'express';
import { searchByCode } from '../controllers/searchController.js';

const router = express.Router();

router.route('/').get(searchByCode);

export default router;
