import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FlowSync AI Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
