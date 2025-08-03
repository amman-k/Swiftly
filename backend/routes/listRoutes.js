import express from 'express';
import { createList } from '../controllers/listController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router=express.Router();

router.route('/').post(protect,createList);

export default router;



