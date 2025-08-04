import express, { Router } from 'express';
import { createCard, moveCard } from '../controllers/cardController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router=new Router();

router.route('/').post(protect,createCard);
router.route('/:cardId/move').post(protect,moveCard);

export default router;

