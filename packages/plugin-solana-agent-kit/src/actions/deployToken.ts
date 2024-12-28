import { getSakAgent } from "@/common";
import { Action, composeContext, elizaLogger, generateObject, GoalStatus, ModelClass } from "@elizaos/core";
import { z } from "zod";
import { parameterExtractionTemplate } from "../templates/deployToken";

export const TokenParamsSchema = z.object({
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  decimals: z.number().nullable(),
  description: z.string().nullable(),
  imageDescription: z.string().nullable(),
});

export type DeployTokenParams = z.infer<typeof TokenParamsSchema>;

export function isDeployTokenParamsValid(params: any): params is DeployTokenParams {
  return TokenParamsSchema.safeParse(params).success;
}

export type TokenParams = z.infer<typeof TokenParamsSchema>;

export const deploySplTokenAction: Action = {
  name: 'DEPLOY_SPL_TOKEN',
  similes: ["DEPLOY_TOKEN"],
  description: 'Deploy a new SPL token on the Solana blockchain',
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "deploy a token with the name TolyToken, symbol TLY, and 6 decimals",
          action: "DEPLOY_SPL_TOKEN",
          content: {
            name: "TolyToken",
            symbol: "TLY",
            decimals: 9,
            description: "TolyToken is a token that represents the Toly token",
            imageDescription: "A picture of a toly token"
          }
        }
      },
      {
        user: "tolybot",
        content: {
          text: "Minted TolyToken ($TLY) with 9 decimals! Here's the token metadata: https://solscan.io/token/AbcDefekeFLekdfleELFlelFe"
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options?, callback?) => {
    if (message.userId === runtime.agentId) {
      return;
    }

    runtime.cacheManager.delete('tokenParams');
    elizaLogger.info('Starting token deployment process', { messageId: message.id });

    const parameterExtractionContext = composeContext({
      state,
      template: parameterExtractionTemplate
    });

    // Use generateObject to extract parameters
    let extractedParams: { object: TokenParams } | null = null;
    try {
      extractedParams = await generateObject({
        runtime,
        context: parameterExtractionContext,
        modelClass: ModelClass.SMALL,
        schema: TokenParamsSchema as any,
      }) as { object: TokenParams };

      elizaLogger.info('Generated object from message', { params: extractedParams.object });

      if (!isDeployTokenParamsValid(extractedParams.object)) {
        elizaLogger.error('Generated object is not DeployTokenContent', { params: extractedParams.object });
        return false;
      }
    } catch (error) {
      elizaLogger.warn('Error generating object', { error });
      callback({
        text: 'Please provide the token name, symbol, description, and image description.',
      });
      return false;
    }

    elizaLogger.info('Extracted token parameters', { params: extractedParams.object });

    const missingParams = [];
    if (!extractedParams.object.name) missingParams.push('name');
    if (!extractedParams.object.symbol) missingParams.push('symbol');
    if (!extractedParams.object.decimals) missingParams.push('decimals');
    if (!extractedParams.object.description) missingParams.push('description');
    if (!extractedParams.object.imageDescription) missingParams.push('image description');
    
    if (missingParams.length > 0) {
      elizaLogger.info('Missing required parameters', { missingParams });
      callback({
        text: `Please provide the following token parameters: ${missingParams.join(', ')}`,
      });
      return false;
    }

    // Store params in cache
    runtime.cacheManager.set('tokenParams', extractedParams.object);
    elizaLogger.info('Stored token parameters in cache');

    // Update goal progress
    const goal = await runtime.databaseAdapter.getGoals({
      agentId: runtime.agentId,
      roomId: message.roomId,
      userId: message.userId,
      onlyInProgress: true,
      count: 1,
    });

    if (goal.length > 0) {
      const currentGoal = goal[0];
      const gatherParamsObjective = currentGoal.objectives.find(o => o.id === 'gather_token_params');
      
      if (gatherParamsObjective && !gatherParamsObjective.completed) {
        elizaLogger.info('Updating goal objective status');
        await runtime.databaseAdapter.updateGoal({
          ...currentGoal,
          objectives: currentGoal.objectives.map(o => 
            o.id === 'gather_token_params' ? { ...o, completed: true } : o
          )
        });
      }
    }

    const isValid = await deploySplTokenAction.validate(runtime, message, state);
    if (!isValid) {
      callback({
        text: 'Invalid token parameters. Please ensure you provide valid values for name and symbol.',
      });
      return false;
    }

    elizaLogger.info('Deploying token...', {
      params: extractedParams.object,
    });

    const sakAgent = getSakAgent(runtime);
    try {
        const token = await sakAgent.deployToken(
            extractedParams.object.name, 
            extractedParams.object.description, 
            extractedParams.object.symbol, 
            extractedParams.object.decimals
        );

        // Only send callback after successful deployment
        callback({
            text: `Deployed token with name: ${extractedParams.object.name}, symbol: ${extractedParams.object.symbol}, and ${extractedParams.object.decimals} decimals! You can check it out on Solana.fm here: https://solana.fm/address/${token.mint.toBase58()}`,
        });

        // Clear cache after successful deployment
        runtime.cacheManager.delete('tokenParams');
        elizaLogger.info('Cleared token parameters from cache');

        return true; // Signal successful completion
    } catch (error) {
        elizaLogger.error('Error deploying token', { error });
        callback({
            text: 'There was an error deploying your token. Please try again.',
        });
        return false;
    }
  },
  validate: async (runtime, message, state) => {
    const goal = await runtime.databaseAdapter.getGoals({
      agentId: runtime.agentId,
      roomId: message.roomId,
      userId: message.userId,
      onlyInProgress: true,
      count: 1,
    });
    
    if (goal.length === 0) {
      // Clear any existing cache when starting new goal
      runtime.cacheManager.delete('tokenParams');
      await runtime.databaseAdapter.createGoal({
        roomId: message.roomId,
        userId: message.userId,
        name: 'deploy_token',
        status: GoalStatus.IN_PROGRESS,
        objectives: [
          {
            id: 'gather_token_params',
            description: 'Gather the token parameters',
            completed: false
          }
        ]
      });
      return true;
    }

    const currentGoal = goal[0];
    
    if (currentGoal.status === GoalStatus.DONE) {
      await runtime.databaseAdapter.createGoal({
        roomId: message.roomId,
        userId: message.userId,
        name: 'deploy_token',
        status: GoalStatus.IN_PROGRESS,
        objectives: [
          {
            id: 'gather_token_params',
            description: 'Gather the token parameters',
            completed: false
          }
        ]
      });
      return true;
    }

    return currentGoal.name === 'deploy_token';
  },
}
