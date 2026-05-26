import cors from 'cors';
import express from 'express';
import routes from './routes';
import { getEnv } from './utils/env';

const app = express();

app.use(
  cors({
    origin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  }),
);
app.use(express.json());

app.use('/api', routes);

export default app;
