import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`[server] RentHub API running in ${env.NODE_ENV} mode`);
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] Health → http://localhost:${PORT}/api/health`);
});