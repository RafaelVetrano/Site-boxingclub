import { env } from './env.js';
import { buildApp } from './app.js';

async function main() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
    console.log(`🥊 API running at http://0.0.0.0:${env.API_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
