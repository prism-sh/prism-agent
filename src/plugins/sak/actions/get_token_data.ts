import { Action, Content, HandlerCallback } from "@ai16z/eliza";
import { PublicKey } from "@solana/web3.js";

interface JupiterTokenData {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
}

async function getTokenDataByAddress(
  mint: PublicKey,
): Promise<JupiterTokenData | undefined> {
  try {
    if (!mint) {
      throw new Error("Mint address is required");
    }

    const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as JupiterTokenData[];
    const token = data.find((token: JupiterTokenData) => {
      return token.address === mint.toBase58();
    });
    return token;
  } catch (error: any) {
    throw new Error(`Error fetching token data: ${error.message}`);
  }
}

async function getTokenAddressFromTicker(ticker: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${ticker}`
    );
    const data = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }

    let solanaPairs = data.pairs
      .filter((pair: any) => pair.chainId === "solana")
      .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0))
      .filter(
        (pair: any) =>
          pair.baseToken.symbol.toLowerCase() === ticker.toLowerCase()
      );

    return solanaPairs[0]?.baseToken.address || null;
  } catch (error) {
    console.error("Error fetching token address from DexScreener:", error);
    return null;
  }
}

async function getTokenDataByTicker(
  ticker: string
): Promise<JupiterTokenData | undefined> {
  const address = await getTokenAddressFromTicker(ticker);
  if (!address) {
    throw new Error(`Token address not found for ticker: ${ticker}`);
  }
  return getTokenDataByAddress(new PublicKey(address));
}

export const getTokenDataAction: Action = {
  name: "GET_TOKEN_DATA",
  description: "Get token data from Jupiter API",
  similes: ["TOKEN_INFO", "TOKEN_DATA", "GET_TOKEN_INFO"],
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Get info about BONK token",
          action: "GET_TOKEN_DATA",
          options: { ticker: "BONK" }
        }
      },
      {
        user: "{{agent}}",
        content: {
          text: "Here's the token data for BONK...",
          type: "text"
        }
      }
    ]
  ],
  validate: async () => true,
  handler: async (runtime, message, state, options, callback?: HandlerCallback) => {
    try {
      let tokenData: JupiterTokenData | undefined;

      if (options.address) {
        tokenData = await getTokenDataByAddress(new PublicKey(options.address as string));
      } else if (options.ticker) {
        tokenData = await getTokenDataByTicker(options.ticker as string);
      } else {
        throw new Error("Either address or ticker must be provided");
      }

      if (!tokenData) {
        throw new Error("Token not found");
      }

      const response: Content = {
        text: `Token Info:
Name: ${tokenData.name}
Symbol: ${tokenData.symbol}
Address: ${tokenData.address}
Decimals: ${tokenData.decimals}`,
        type: "text"
      };

      if (callback) {
        callback(response);
      }

      return true;
    } catch (error: any) {
      if (callback) {
        callback({
          text: `Error getting token data: ${error.message}`,
          type: "text"
        });
      }
      return false;
    }
  }
};
