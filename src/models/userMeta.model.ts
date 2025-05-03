import mongoose from 'mongoose';
const prefix = 'pd_';

// Define the schema for user metadata
const userSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    first_name: { type: String, required: true },
    last_name: { type: String, required: false },
    dob: { type: Date, required: false },
    postal_code: { type: String, required: false },
    locality: { type: String, required: false }, // Consistent camelCase
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    about_me: { type: String, required: false }, // Consistent camelCase
  },
  {
    timestamps: true, // Automatically manage createdAt & updatedAt
    collection: prefix + 'usermeta',
  }
);

// Export the model
export default mongoose.model('UserMeta', userSchema);
