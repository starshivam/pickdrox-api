import mongoose, { Collection } from 'mongoose';
const prefix = 'pd_';
const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String },
  phone: { type: String},
  email_verified: {type: Boolean, default:false},
  phone_verified: {type: Boolean, default:false},
  password: { type: String, required: true },
  otp : { type:Number, required:false },
  otp_status: { type: Boolean, default: false },
  otp_expired: { type: Date, required: false },
}, 
{
  timestamps: true,
  collection: prefix + 'users'
});

export default mongoose.model('users', userSchema);