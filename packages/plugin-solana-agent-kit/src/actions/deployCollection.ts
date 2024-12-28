import { getSakAgent } from "@/common";
import { Action, composeContext, Content, elizaLogger, generateObject, GoalStatus, IAgentRuntime, Memory, ModelClass, State } from "@elizaos/core";
import { z } from "zod";
import * as templates from "../templates/deployCollection";
export const deployCollectionSchema = z.object({
  name: z.string().nullable(),
  uri: z.string().nullable(),
  royaltyBasisPoints: z.number().nullable(),
  creators: z.array(z.object({
    address: z.string().default(process.env.SOLANA_PUBLIC_KEY),
    percentage: z.number().default(100),
  })).nullable(),
})

export type DeployCollectionParams = z.infer<typeof deployCollectionSchema>;

export function isDeployCollectionParamsValid(params: any): params is DeployCollectionParams {
  return deployCollectionSchema.safeParse(params).success;
}

export const deployCollectionAction: Action = {
  name: 'DEPLOY_COLLECTION',
  similes: ["DEPLOY_COLLECTION", "NFT_COLLECTION", "CREATE_NFT_COLLECTION", "CREATE_COLLECTION"],
  description: 'Deploy a new collection on the Solana blockchain',
  examples: templates.examples,
  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    elizaLogger.info('DeployCollectionAction.validate');
    
    if (await hasExistingGoal(runtime, message, 'Deploy NFT Collection')) {
      elizaLogger.info('DeployCollectionAction.validate.hasExistingGoal');
      return true;
    }

    elizaLogger.info('DeployCollectionAction.validate.noExistingGoal');
    return true;
  },
  handler: async (runtime, message, state, options?, callback?) => {
    elizaLogger.info('DeployCollectionAction.handler', message);
    const goal = await getOrCreateGoal(runtime, message, 'Deploy NFT Collection');

    const extractedParams = await extractParameters(runtime, message, state, callback);
    
    if (!extractedParams) {
      elizaLogger.info('DeployCollectionAction.handler.missingParams');
      return true;
    }

    if (!isDeployCollectionParamsValid(extractedParams)) {
      elizaLogger.info('DeployCollectionAction.handler.invalidParams');
      callback({
        text: 'Some parameters are invalid. Please check and try again.',
      });
      return true;
    }

    const objective = goal.objectives.find(o => o.id === 'gather_parameters');
    if (objective && !objective.completed) {
      elizaLogger.info('Updating goal objective status');
      await runtime.databaseAdapter.updateGoal({
        ...goal,
        objectives: goal.objectives.map(o => 
          o.id === 'gather_parameters' ? { ...o, completed: true } : o
        )
      });
    }

    elizaLogger.info('Deploying collection...', {
      params: extractedParams,
    });

    try {
      const sakAgent = getSakAgent(runtime);
  
      const collection = await sakAgent.deployCollection({
        name: extractedParams.name,
        uri: extractedParams.uri,
        royaltyBasisPoints: extractedParams.royaltyBasisPoints,
        creators: extractedParams.creators.map(c => ({
          address: c.address,
          percentage: c.percentage,
        })),
      });

      elizaLogger.info('DeployCollectionAction.handler.success', { collection });

      await runtime.databaseAdapter.updateGoal({
        ...goal,
        status: GoalStatus.DONE,
        objectives: goal.objectives.map(o => 
          o.id === 'deploy_collection' ? { ...o, completed: true } : o
        )
      });

      callback({
        text: `Collection deployed successfully: ${collection.collectionAddress} via https://solana.fm/tx/${collection.signature}!`,
      });
      return true;
    } catch (error) {
      elizaLogger.error('DeployCollectionAction.handler.error', { error });
      callback({
        text: 'There was an error deploying the collection. Please try again.',
      });
      return true;
    }
  },
}

async function hasExistingGoal(runtime: IAgentRuntime, message: Memory, goalName: string) {
  const existingGoals  = await runtime.databaseAdapter.getGoals({
    agentId: runtime.agentId,
    roomId: message.roomId,
    userId: message.userId,
    onlyInProgress: true,
  });

  return existingGoals.some(g => g.name === goalName);
}

async function getOrCreateGoal(runtime: IAgentRuntime, message: Memory, goalName: string) {

  if (await hasExistingGoal(runtime, message, goalName)) {
    elizaLogger.info('DeployCollectionAction.getOrCreateGoal.hasExistingGoal');
    return await runtime.databaseAdapter.getGoals({
      agentId: runtime.agentId,
      roomId: message.roomId,
      userId: message.userId,
      onlyInProgress: true,
    }).then(goals => goals.find(g => g.name === goalName));
  }

  elizaLogger.info('DeployCollectionAction.getOrCreateGoal.noExistingGoal');
  await runtime.databaseAdapter.createGoal({
    roomId: message.roomId,
    userId: message.userId,
    name: goalName,
    status: GoalStatus.IN_PROGRESS,
    objectives: [
      {
        id: 'gather_parameters',
        description: 'Gather the collection parameters',
        completed: false,
      },
      {
        id: 'deploy_collection',
        description: 'Deploy the collection',
        completed: false,
      },
    ],
  });

  const goal = await runtime.databaseAdapter.getGoals({
    agentId: runtime.agentId,
    roomId: message.roomId,
    userId: message.userId,
    onlyInProgress: true,
  });

  return goal[0];
}

async function extractParameters(runtime: IAgentRuntime, message: Memory, state?: State, callback?: (content: Content) => void) {
  let extractedParams: { object: DeployCollectionParams } | null = null;
  
  const parameterExtractionContext = composeContext({
    state,
    template: templates.parameterExtractionTemplate
  });

  try {
    extractedParams = await generateObject({
      runtime,
      context: parameterExtractionContext,
      modelClass: ModelClass.SMALL,
      schema: deployCollectionSchema as any,
    }) as { object: DeployCollectionParams };

    elizaLogger.info('Generated object from message', { params: extractedParams.object });

    if (!isDeployCollectionParamsValid(extractedParams.object)) {
      elizaLogger.error('Generated object is not DeployCollectionParams', { params: extractedParams.object });
      return null;
    }
  } catch (error) {
    elizaLogger.warn('Error generating object', { error });
    callback({
      text: 'Please provide the collection name, uri, royalty basis points, and creators.',
      inReplyTo: message.id,
    });
    return null;
  }

  elizaLogger.info('Extracted token parameters', { params: extractedParams.object });

  const missingParams = [];
  if (!extractedParams.object.name) missingParams.push('name');
  if (!extractedParams.object.uri) missingParams.push('uri');
  if (extractedParams.object.royaltyBasisPoints === null) missingParams.push('royalty basis points');
  if (!extractedParams.object.creators) missingParams.push('creators');
  
  if (missingParams.length > 0) {
    elizaLogger.info('Missing required parameters', { missingParams });
    callback({
      text: `Please provide the ${missingParams.length === 1 ? 'following parameter' : 'following parameters'}: ${missingParams.join(', ')}`,
      inReplyTo: message.id,
    });
    return null;
  }

  return extractedParams.object;
}