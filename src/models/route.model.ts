import mongoose from 'mongoose';
const prefix = 'pd_';

// Define the schema for user metadata
const routeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    leavingFrom: { type: String, required: true },
    leavingCity: { type: String, required: true },
    leavingLat: { type: String, required: false },
    leavingLong: { type: String, required: false },
    goingTo: { type: String, required: true },
    goingCity: { type: String, required: true },
    goingLat: { type: String, required: false },
    goingLong: { type: String, required: false },
    pickNearby: { type: Boolean, default: false },
    pickRedius: { type: String, required: false },
    selectedRoute: { type: String, required: true },
    carringWeight: { type: String, required: true },
    itemDescription: { type: String, required: false },
    packaging_type: { type: JSON, required: false },
    other_packaging_type: { type: String, required: false },
    package_category: { type: JSON, required: false },
    package_other_category: { type: String, required: false },
    routeType: { type: String, required: false },
    travelingType: { type: String, required: false },
    travelDays: { type: JSON, required: false },
    leavingTime: { type: String, required: false },
    returnTime: { type: String, required: false },
    leavingDateTime: { type: String, required: false },
    returnDateTime: { type: String, required: false },
    totalDistance: { type: String, required: false },
    adjustPrice: { type: String, required: false },
    routeStatus: {type: String, required: true}
  },
  {
    timestamps: true, // Automatically manage createdAt & updatedAt
    collection: prefix + 'routes',
  }
);

// Export the model
export default mongoose.model('Routes', routeSchema);
