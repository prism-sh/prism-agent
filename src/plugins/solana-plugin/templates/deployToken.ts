export const parameterExtractionTemplate = `
        Extract the token details from this message and output them in JSON format.
        Message: "{{message.content.text}}"

        Rules:
        - Name should be the full token name (e.g., "Fooballs")
        - Symbol should be the ticker in uppercase (e.g., "BALLZ")
        - Decimals should be a number (default: 9)

        Example response:
        \`\`\`json
        {
          "name": "Fooballs",
          "symbol": "BALLZ",
          "decimals": 9,
          "description": "Fooballs are the best balls in the world",
          "imageDescription": "A picture of a fooball",
          "uri": "https://agent.def345.prism.sh/api/tokens/abc123-abc123-abc123-abc123/metadata.json"
        }
        \`\`\`

        {{recentMessages}}

        Given the recent messages, extract the following information about the requested token creation. Do not make up any information, return null for any values that cannot be determined:
        - Token name
        - Token symbol
        - Token description
        - Token image description (Use the Token description to generate if the image description is not provided)
        - Token uri

        Respond with a JSON markdown block containing only the extracted values.
      `