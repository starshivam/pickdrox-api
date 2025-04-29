import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiredAt: { type: Date, required: true }
});

export const Blacklist = mongoose.model('Blacklist', blacklistSchema);