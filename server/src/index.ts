import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";

async function main() {
  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

void main();
