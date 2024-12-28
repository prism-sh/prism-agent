import { Plugin } from "@elizaos/core";
import { deployCollectionAction } from "./actions/deployCollection";
import { deploySplTokenAction } from "./actions/deployToken";
export const solanaPlugin: Plugin = {
  name: 'solana',
  description: 'Solana plugin',
  actions: [deploySplTokenAction, deployCollectionAction],
}