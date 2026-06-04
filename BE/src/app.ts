import cors from 'cors';
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
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

const swaggerPath = path.resolve(__dirname, '../src/docs/assessment-openapi.yaml');
const swaggerDoc = YAML.load(swaggerPath);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

app.use(errorHandler);

export default app;
