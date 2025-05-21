import mongoose from 'mongoose';
const prefix = 'pd_';

// Define the schema for user metadata
const pickupRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    pickupLocation: { type: String, required: true },
    pickupCity: { type: String, required: true },
    pickupLat: { type: String, required: false },
    pickupLong: { type: String, required: false },
    dropLocation: { type: String, required: true },
    dropingCity: { type: String, required: true },
    dropingLat: { type: String, required: false },
    dropingLong: { type: String, required: false },
    carringWeight: { type: String, required: true },
    itemDescription: { type: String, required: false },
    packaging_type: { type: String, required: false },
    other_packaging_type: { type: String, required: false },
    package_category: { type: String, required: false },
    package_other_category: { type: String, required: false },
    pickupDateTime: { type: String, required: false },
    totalDistance: { type: String, required: false },
    adjustPrice: { type: String, required: false },
    pickupStatus: {type: String, required: true}
  },
  {
    timestamps: true, // Automatically manage createdAt & updatedAt
    collection: prefix + 'pickup_requests',
  }
);

// Export the model
export default mongoose.model('PickupRequest', pickupRequestSchema);
