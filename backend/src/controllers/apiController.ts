import { Request, Response } from 'express';
import NFT from '../models/NFT';
import Activity from '../models/Activity';

export const getNFTs = async (req: Request, res: Response) => {
  try {
    const nfts = await NFT.find().sort({ createdAt: -1 });
    res.json(nfts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
};

export const getActivity = async (req: Request, res: Response) => {
  try {
    const activity = await Activity.find().sort({ timestamp: -1 }).limit(50);
    res.json(activity);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};
