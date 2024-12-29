import { ActionExample } from "@elizaos/core";

 const isStartingGoalTemplate = `You must respond with ONLY the word "true" or "false".

Is this message about starting to deploy an NFT collection? "{{message.content.text}}"

Respond "true" if the message indicates:
- Deploying a new NFT collection
- Creating an NFT collection
- Setting up a collection
- Starting a new collection

Otherwise respond "false".`

const isContinuingGoalTemplate = `You must respond with ONLY the word "true" or "false".

Is this message continuing a conversation about deploying an NFT collection? "{{message.content.text}}"

Respond "true" if the message contains:
- Collection details (name, uri, royalties, creators)
- Answers about collection information
- Confirmations about collection details

Otherwise respond "false".`

const parameterExtractionTemplate = `
        Extract the NFT collection details from this message and output them in JSON format.
        Message: "{{message.content.text}}"

        Rules:
        - Name should be the full collection name (e.g., "Bored Ape Yacht Club")
        - Symbol should be the collection symbol in uppercase (e.g., "BAYC")
        - Royalty basis points should be a number between 0 and 10000 (100% = 10000)
        - Creators should be an array of objects with address and percentage (percentages should sum to 100)

        Example response:
        \`\`\`json
        {
          "name": "Bored Ape Yacht Club",
          "symbol": "BAYC",
          "description": "A collection of 10,000 unique Bored Ape NFTs",
          "imageDescription": "A cartoon ape with unique traits and accessories",
          "uri": "https://agent.def345.prism.sh/api/collections/abc123-abc123-abc123-abc123/metadata.json",
          "royaltyBasisPoints": 500,
          "creators": [
            {
              "address": "ABC123...",
              "percentage": 100
            }
          ]
        }
        \`\`\`

        {{recentMessages}}

        Given the recent messages, extract the following information about the requested NFT collection creation. Do not make up any information, return null for any values that cannot be determined:
        - Collection name
        - Collection symbol
        - Collection description
        - Collection image description (Use the Collection description to generate if the image description is not provided)
        - Collection uri
        - Royalty basis points
        - Creators array with addresses and percentages

        Respond with a JSON markdown block containing only the extracted values.
      `

const examples: ActionExample[][] = [
  [
    {
      user: '{{user1}}',
      content: {
        text: 'Create a collection of 10,000 unique Bored Ape NFTs',
        action: 'DEPLOY_COLLECTION',
        params: {
          name: 'Bored Ape Yacht Club',
          symbol: 'BAYC',
          description: 'A collection of 10,000 unique Bored Ape NFTs',
          imageDescription: 'A cartoon ape with unique traits and accessories',
          uri: 'https://agent.def345.prism.sh/api/collections/abc123-abc123-abc123-abc123/metadata.json',
          royaltyBasisPoints: 500,
          creators: [{ address: 'ABC123...', percentage: 100 }],
        },
      },
    },
    {
      user: 'prism-agent',
      content: {
        text: "I've created that collection of 10,000 unique Bored Ape NFTs you asked for!",
      },
    },
  ],
];

export { examples, isContinuingGoalTemplate, isStartingGoalTemplate, parameterExtractionTemplate };

