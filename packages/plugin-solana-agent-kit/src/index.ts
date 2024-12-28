import { Plugin } from "@elizaos/core";
import { deployCollectionAction } from "./actions/deployCollection";
import { deploySplTokenAction } from "./actions/deployToken";
export const solanaAgentKitPlugin: Plugin = {
  name: 'solana-agent-kit',
  description: 'Solana Agent Kit plugin',
  actions: [deploySplTokenAction, deployCollectionAction],
}
