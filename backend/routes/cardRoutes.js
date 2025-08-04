import express, { Router } from 'express';
import { createCard } from '../controllers/cardController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router=new Router();

router.route('/').post(protect,createCard);

export default router;

