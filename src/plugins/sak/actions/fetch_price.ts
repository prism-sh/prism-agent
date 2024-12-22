import { Action, Content, HandlerCallback, IAgentRuntime, Memory, State } from "@ai16z/eliza";
import bs58 from 'bs58';
import { CollectionOptions, SolanaAgentKit } from "solana-agent-kit";

export const fetchPriceAction: Action = {
  name: "FETCH_PRICE",
  description: "Fetch the price of a token on Solana",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "fetch the price of SOL",
          action: "FETCH_PRICE"
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "I'll fetch the price of SOL. Please provide the token address.",
          action: "FETCH_PRICE"
        }
      }
    ]
  ],
  similes: ["nft collection", "nft mint", "nft deploy", "nft create"],
  validate: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    const secrets = runtime.character.settings.secrets;
    if (!secrets.SOLANA_PRIVATE_KEY || !secrets.SOLANA_RPC_URL) {
      if (message.content.action === "DEPLOY_COLLECTION") {
        message.content.text = "Missing required Solana configuration. Please set SOLANA_PRIVATE_KEY and SOLANA_RPC_URL in secrets.";
        message.content.type = "text";
        return false;
      }
      return false;
    }
    return true;
  },
  handler: async (runtime, message, state, options: { [key: string]: unknown }, callback?: HandlerCallback) => {
    try {
      
      const agent = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY,
        process.env.SOLANA_RPC_URL,
        process.env.OPENAI_API_KEY
      );

      const collectionOptions: CollectionOptions = {
        name: (options?.name as string) || "test",
        uri: (options?.uri as string) || "https://example.com",
      };

      const result = await agent.deployCollection(collectionOptions);

      console.log(result);

      let returnMessage = {
        text: `Collection deployed successfully! Transaction signature: ${bs58.encode(result.signature)}. View it on SolanaFM: https://solana.fm/tx/${bs58.encode(result.signature)}`,
        type: "text"
      }

      if (callback) {
        callback(returnMessage);
      }

      return true;
    } catch (error) {
      console.error("Error deploying collection:", error);
      if (callback) {
        callback({
          text: `Failed to deploy collection: ${error.message}`,
          type: "text"
        } as Content);
      }
      return false;
    }
  }
};

