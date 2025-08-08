import express, { Router } from 'express';
import { createCard, moveCard,deleteCard, updateCard } from '../controllers/cardController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router=new Router();

router.route('/').post(protect,createCard);
router.route('/:cardId/move').put(protect,moveCard);
router.route('/:cardId').delete(protect, deleteCard).put(protect,updateCard);

export default router;

