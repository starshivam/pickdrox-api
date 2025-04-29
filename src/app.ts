import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';


const app: Application = express();

// ✅ Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // your frontend
  credentials: false // if using cookies or auth headers
}));

app.use(express.json());
// Public routes (no auth)
app.use('/api/auth', authRoutes);

// Protected routes (with user auth)
app.use('/api/user',  userRoutes);


export default app;