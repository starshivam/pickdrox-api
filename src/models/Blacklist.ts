import mongoose from 'mongoose';
const prefix = 'pd_';
const blacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiredAt: { type: Date, required: true }
},
{
  collection: prefix + 'user'
}
);

export const Blacklist = mongoose.model('Blacklist', blacklistSchema);