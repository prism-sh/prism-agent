import PostgresDatabaseAdapter from "@ai16z/adapter-postgres";
import { SqliteDatabaseAdapter } from "@ai16z/adapter-sqlite";
import { AutoClientInterface } from "@ai16z/client-auto";
import { DirectClient, DirectClientInterface } from "@ai16z/client-direct";
import { DiscordClientInterface } from "@ai16z/client-discord";
import { TelegramClientInterface } from "@ai16z/client-telegram";
import { TwitterClientInterface } from "@ai16z/client-twitter";
import {
  AgentRuntime,
  Character,
  elizaLogger,
  IAgentRuntime,
  ICacheManager,
  IDatabaseAdapter,
  settings,
  stringToUuid
} from "@ai16z/eliza";
import { bootstrapPlugin } from "@ai16z/plugin-bootstrap";
import { createNodePlugin } from "@ai16z/plugin-node";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { initializeDatabase, intializeDbCache } from "./lib/databases.ts";

const nodePlugin = createNodePlugin();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeClients(character: Character, runtime: IAgentRuntime) {
  const clients = [];
  const clientTypes = character.clients?.map((str) => str.toLowerCase()) || [];

  if (clientTypes.includes("auto")) {
    const autoClient = await AutoClientInterface.start(runtime);
    if (autoClient) clients.push(autoClient);
  }

  if (clientTypes.includes("discord")) {
    clients.push(await DiscordClientInterface.start(runtime));
  }

  if (clientTypes.includes("telegram")) {
    const telegramClient = await TelegramClientInterface.start(runtime);
    if (telegramClient) clients.push(telegramClient);
  }

  if (clientTypes.includes("twitter")) {
    const twitterClients = await TwitterClientInterface.start(runtime);
    clients.push(twitterClients);
  }

  return clients;
}

function createAgent(
  character: Character,
  db: PostgresDatabaseAdapter | SqliteDatabaseAdapter,
  cache: ICacheManager,
) {
  console.log("Creating PRISM Agent Runtime with character:", character.name);
  return new AgentRuntime({
    databaseAdapter: db as IDatabaseAdapter,
    token: process.env.OPENROUTER_API_KEY,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      ...(character.plugins || []),
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function loadCharacter(): Promise<Character> {
  // load the character.json file from the disk
  const characterFilePath = path.join(__dirname, "../character.json");
  try {
    const character = await fs.promises.readFile(characterFilePath, "utf-8");
    return JSON.parse(character) as Character;
  } catch (error) {
    throw new Error(`Failed to load character file at ${characterFilePath}: ${error.message}`);
  }
}

async function startAgent() {
  try {
    const character = await loadCharacter();
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = initializeDatabase(dataDir);
    await db.init();

    const cache = intializeDbCache(character, db);
    const runtime = createAgent(character, db, cache);
    await runtime.initialize();

    const clients = await initializeClients(character, runtime);
    const directClient = await DirectClientInterface.start(runtime) as DirectClient;
    directClient.registerAgent(runtime);

    if (!process.env.INTERACTIVE_DISABLED) {
      startInteractiveChat(character.name);
    }

    return clients;
  } catch (error) {
    elizaLogger.error("Error starting agent:", error);
    throw error;
  }
}

function startInteractiveChat(agentName: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", () => {
    rl.close();
    process.exit(0);
  });

  function chat() {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        process.exit(0);
      }

      try {
        const serverPort = parseInt(settings.SERVER_PORT || "3000");
        const response = await fetch(
          `http://localhost:${serverPort}/${agentName}/message`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: input,
              userId: "user",
              userName: "User",
            }),
          }
        );

        const data = await response.json();
        data.forEach((message) => console.log(`${agentName}: ${message.text}`));
      } catch (error) {
        console.error("Error fetching response:", error);
      }

      chat();
    });
  }

  elizaLogger.log("Chat started. Type 'exit' to quit.");
  chat();
}

startAgent().catch((error) => {
  elizaLogger.error("Unhandled error:", error);
  process.exit(1);
});