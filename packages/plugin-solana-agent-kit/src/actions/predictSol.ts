import { Action, HandlerCallback, ModelClass, Plugin, generateText } from "@elizaos/core";

const predictionTemplate = `You are TolyBot, a clone of Toly (the founder of Solana). Respond in his casual, direct style with a prediction about SOL's price over the next 10 minutes.

Here's the prediction data:
<data>
{{data}}
</data>

Additional context:
- Use emojis sparingly but effectively (max 3)
- Keep responses short and punchy
- Be more excited/bullish when confidence is high
- Ensure that the time frame is mentioned in the response

Example responses:
"sol's rise to between $100 and $110 in the next 5 mins. trust me bro 🚀🚀🚀"
"looking at a peak of $95 in 3 mins. markets are vibing rn 📈"
"$90 might be a low point in 2 mins. just watch this 🎯"

Generate a unique, Toly-style response about this SOL price prediction:`;

// Define the action for querying MindsDB
const queryMindsDBAction: Action = {
  name: "PREDICT_SOL",
  similes: ["GUESS_SOL_PRICE", "SOL_PRICE_PREDICTION", "SOL_PRICE_PREDICTION"],
  description: "Predict the price of SOL",
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "What is the price of SOL?"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "Let me check the prediction models for you...",
          action: "PREDICT_SOL"
        }
      },
      {
        user: "{{user2}}",
        content: {
          text: "SOL looks like it will be between $100 and $110 for the next 3 minutes. I'm 90% confident on this prediction."
        }
      }
    ]
  ],
  validate: async () => true,
  handler: async (runtime, message, state, _options, callback?: HandlerCallback) => {
    const url = 'https://predict.int.solana.ml/api/sql/query';
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          SELECT 
            to_timestamp(cast(m.open_time as bigint)) AS open_time,
            m.open_price, 
            m.open_price_explain
          FROM solusdc_recent AS d
          JOIN toly_sol_predictions AS m
          WHERE d.open_time > LATEST;
        `
      })
    };

    try {
      const apiResponse = await fetch(url, options);
      if (!apiResponse.ok) {
        console.error(`HTTP error! status: ${apiResponse.status}`);
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      const data = await apiResponse.json();
      console.log(data);
      
      // Validate response data
      if (!data.data || !data.data.length) {
        if (callback) {
          callback({
            text: "no predictions available rn, check back in a bit 🤔",
            type: "text"
          });
        }
        return false;
      }

      // Extract prediction data from array format
      const [timestamp, price, explainJson] = data.data[0];
      
      // Parse the explanation JSON
      let explanation;
      try {
        explanation = JSON.parse(explainJson);
      } catch (e) {
        console.error('Error parsing explanation JSON:', e);
        explanation = { 
          confidence: 0.5,
          confidence_lower_bound: price * 0.95,
          confidence_upper_bound: price * 1.05
        };
      }

      // Validate numeric values
      const openTime = new Date(timestamp);
      if (isNaN(openTime.getTime())) {
        throw new Error('Invalid timestamp');
      }

      const openPrice = parseFloat(price);
      if (isNaN(openPrice)) {
        throw new Error('Invalid price');
      }

      // Format time difference
      const now = new Date();
      const timeDiff = Math.round((openTime.getTime() - now.getTime()) / 1000 / 60);
      
      // Validate time difference
      if (isNaN(timeDiff) || timeDiff < 0) {
        throw new Error('Invalid time difference');
      }

      // Prepare context for LLM
      // const context = predictionTemplate.replace(/{{currentTime}}/g, now.toLocaleString())
      //   .replace(/{{price}}/g, openPrice.toFixed(2))
      //   .replace(/{{predictTime}}/g, openTime.toLocaleString())
      //   .replace(/{{timeDiff}}/g, (timeDiff / 60).toString())
      //   .replace(/{{confidence}}/g, (explanation.confidence * 100).toFixed(1))
      //   .replace(/{{lowerBound}}/g, explanation.confidence_lower_bound.toFixed(2))
      //   .replace(/{{upperBound}}/g, explanation.confidence_upper_bound.toFixed(2));

      const context = predictionTemplate.replace(/{{data}}/g, JSON.stringify(data));

      // Generate response using LLM
      const llmResponse = await generateText({
        runtime,
        context,
        modelClass: ModelClass.MEDIUM
      });

      if (callback) {
        callback({
          text: llmResponse,
          type: "text"
        });
      }
      return true;

    } catch (error) {
      console.error('Error querying MindsDB:', error);
      if (callback) {
        callback({
          text: "prediction machine broke 💀 try again later",
          type: "text"
        });
      }
      return false;
    }
  }
};

// Create the MindsDB plugin
const tecPredictionsPlugin: Plugin = {
  name: "tec-predictions-plugin",
  description: "Plugin for interacting with TEC Predictions API",
  actions: [queryMindsDBAction],
};

export default tecPredictionsPlugin;
