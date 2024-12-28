import { IAgentRuntime, Memory } from "@elizaos/core";
import { SolanaAgentKit } from "solana-agent-kit";
export function getSakAgent(runtime: IAgentRuntime) {
  return new SolanaAgentKit(
    runtime.getSetting("SOLANA_PRIVATE_KEY"),
    runtime.getSetting("SOLANA_RPC_URL"),
    runtime.getSetting("OPENAI_API_KEY")
  );
}

export async function getOrCreateGoal(runtime: IAgentRuntime, message: Memory, goalId: string) {
  const goal = await runtime.databaseAdapter.getGoals({
    agentId: runtime.agentId,
    roomId: message.roomId,
    userId: message.userId,
    onlyInProgress: true,
    count: 1,
  });

  if (goal.length > 0) {
    return goal[0];
  }
}