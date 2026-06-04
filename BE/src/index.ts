import dotenv from 'dotenv';
import app from './app';
import { initializeChatRealtime } from './realtime/chatSocket';
import { getEnv } from './utils/env';

dotenv.config();

const port = Number(getEnv('PORT', '4000'));

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

initializeChatRealtime(server);
