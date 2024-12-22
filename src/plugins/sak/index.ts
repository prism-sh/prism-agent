import { Plugin } from "@ai16z/eliza";

import { SolanaAgentKit } from "solana-agent-kit";
import { deployCollectionAction, fetchPriceAction, getTokenDataAction } from "./actions/index";
// Initialize with private key and optional RPC URL
const agent = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY,
  process.env.SOLANA_RPC_URL,
  process.env.OPENAI_API_KEY
);

const sakPlugin: Plugin = {
  name: "sak-plugin",
  description: "Plugin for interacting with Solana Agent Kit",
  actions: [deployCollectionAction, fetchPriceAction, getTokenDataAction],
};

export default sakPlugin;
