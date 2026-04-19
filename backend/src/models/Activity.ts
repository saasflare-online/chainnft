import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  type: 'mint' | 'list' | 'sold' | 'cancel';
  user: string;
  details: string;
  txHash: string;
  timestamp: Date;
  contractId: string;
}

const ActivitySchema: Schema = new Schema({
  type: { type: String, enum: ['mint', 'list', 'sold', 'cancel'], required: true },
  user: { type: String, required: true },
  details: { type: String, required: true },
  txHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  contractId: { type: String, required: true },
});

ActivitySchema.index({ contractId: 1, timestamp: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);
