import express, { Router } from 'express';
import { createCard, moveCard,deleteCard } from '../controllers/cardController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router=new Router();

router.route('/').post(protect,createCard);
router.route('/:cardId/move').put(protect,moveCard);
router.route('/:cardId').delete(protect, deleteCard);

export default router;

