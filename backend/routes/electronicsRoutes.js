import express from 'express';
import { createElectronics, listElectronics, getElectronicsById, sellElectronics } from '../controllers/coolerController.js';

const router = express.Router();

router.route('/')
  .post(createElectronics)
  .get(listElectronics);

router.route('/:id')
  .get(getElectronicsById);

// Explicit action route to mark an electronics item sold. Uses req.params to identify resource.
router.route('/:id/sell')
  .patch(sellElectronics);

export default router;
