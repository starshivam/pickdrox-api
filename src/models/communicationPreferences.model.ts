import mongoose, { Collection } from 'mongoose';
import { json } from 'stream/consumers';
const prefix = 'pd_';
const communicationPreferencesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    push_notification: { type: JSON, required: false },
    emails: { type: JSON, required: false },
    text_messages: { type: JSON, required: false },
}, 
{
  timestamps: true,
  collection: prefix + 'communication_preferences'
});

export default mongoose.model('communication_preferences', communicationPreferencesSchema);