import cors from 'cors';
import express from 'express';
import path from 'path';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';
import routes from './routes';
import { getEnv } from './utils/env';

const app = express();

app.use(
  cors({
    origin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
    credentials: true,
  }),
);
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
