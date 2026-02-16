import mongoose, { Schema, Document, Model } from 'mongoose';

interface IPoint {
  id: number;
  coordinates: [number, number];
  timestamp: number;
}

interface IRoute extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  points: IPoint[];
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
      maxlength: [100, 'Route name cannot exceed 100 characters'],
    },
    points: {
      type: [
        {
          id: Number,
          coordinates: {
            type: [Number], // [latitude, longitude]
            required: true,
          },
          timestamp: Number,
        },
      ],
      required: true,
      validate: {
        validator: function (points: IPoint[]) {
          return points && points.length > 0;
        },
        message: 'Route must have at least one point',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
routeSchema.index({ userId: 1, createdAt: -1 });

const Route: Model<IRoute> = mongoose.models.Route || mongoose.model<IRoute>('Route', routeSchema);

export default Route;