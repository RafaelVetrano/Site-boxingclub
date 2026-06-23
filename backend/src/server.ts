import { env } from './env.js';
import { buildApp } from './app.js';

async function main() {
  const app = await buildApp();

  try {
    const port = env.PORT ?? env.API_PORT;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🥊 API running at http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
