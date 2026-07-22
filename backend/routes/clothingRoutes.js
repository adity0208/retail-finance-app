import express from 'express';
import { createClothing, listClothing, getClothingById } from '../controllers/clothingController.js';

const router = express.Router();

router.route('/')
  .post(createClothing)
  .get(listClothing);

router.route('/:id')
  .get(getClothingById);

export default router;
