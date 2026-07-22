import express from 'express';
import { createCustomer, listCustomers, getCustomerById } from '../controllers/customerController.js';

const router = express.Router();

router.route('/')
  .post(createCustomer)
  .get(listCustomers);

router.route('/:id')
  .get(getCustomerById);

export default router;
