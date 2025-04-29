import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: false },
  login_name: {type: String, required:true},
  email: { type: String },
  phone: { type: String},
  password: { type: String, required: true },
  register_via: {type: String, enum: ['email', 'phone'], required: true},
  otp : { type:Number, required:false },
  otp_status: { type: Boolean, default: false },
  otp_expired: { type: Date, required: false },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);