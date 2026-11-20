// Starts the HTTP server only.
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const app = await createApp();
app.listen(port, () => console.log(`web listening on http://localhost:${port}`));
