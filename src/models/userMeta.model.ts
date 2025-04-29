import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    first_name: { type: String, required: true },
    last_name: {type: String, required:false},
    email_verified: { type: Boolean, default: false },
    phone_verified: { type: Boolean, default: false },
    dob: { type: Date, required: false },
    postal_code: { type: String, required: false },
    Locality : { type:String, required:false },
    address : { type:String, required:false },
    city : { type:String, required:false },
    state: { type: String, required: false },
    about_me: { type: String, required: false },
}, {
  timestamps: true,
});

export default mongoose.model('UserMeta', userSchema);