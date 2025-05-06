import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';


const app: Application = express();

// ✅ Enable CORS
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true // if you're using cookies or auth headers
}));


app.use(express.json());
// Public routes (no auth)
app.use('/api/auth', authRoutes);

// Protected routes (with user auth)
app.use('/api/user',  userRoutes);


export default app;