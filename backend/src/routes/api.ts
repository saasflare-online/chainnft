import { Router } from 'express';
import { getNFTs, getActivity } from '../controllers/apiController';

const router = Router();

router.get('/nfts', getNFTs);
router.get('/activity', getActivity);

export default router;
