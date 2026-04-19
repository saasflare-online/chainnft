import mongoose, { Schema, Document } from 'mongoose';

export interface INFT extends Document {
  tokenId: number;
  owner: string;
  metadataUri: string;
  contractId: string;
  name?: string;
  description?: string;
  image?: string;
  createdAt: Date;
}

const NFTSchema: Schema = new Schema({
  tokenId: { type: Number, required: true },
  owner: { type: String, required: true },
  metadataUri: { type: String, required: true },
  contractId: { type: String, required: true },
  name: { type: String },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

NFTSchema.index({ contractId: 1, tokenId: 1 }, { unique: true });

export default mongoose.model<INFT>('NFT', NFTSchema);
