import { Plugin } from "@ai16z/eliza";
import { deployCollectionAction } from "./actions/deployCollection";
import { deploySplTokenAction } from "./actions/deployToken";
export const solanaPlugin: Plugin = {
  name: 'solana',
  description: 'Solana plugin',
  actions: [deploySplTokenAction, deployCollectionAction],
}
