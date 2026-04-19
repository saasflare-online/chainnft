import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  nft: mongoose.Types.ObjectId;
  seller: string;
  price: string;
  currency: string;
  active: boolean;
  contractId: string;
  createdAt: Date;
}

const ListingSchema: Schema = new Schema({
  nft: { type: Schema.Types.ObjectId, ref: 'NFT', required: true },
  seller: { type: String, required: true },
  price: { type: String, required: true },
  currency: { type: String, required: true },
  active: { type: Boolean, default: true },
  contractId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IListing>('Listing', ListingSchema);
