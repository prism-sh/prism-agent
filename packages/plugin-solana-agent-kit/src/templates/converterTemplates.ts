
export const convertToolNameToSimilesTemplate = `
  Convert the name of this tool to a list of similes.
  Tool Name: "{{tool.name}}"
  Tool Description: "{{tool.description}}"
  Tool Parameters: "{{tool.parameters}}"

  Rules:
  - Similes should be a list of strings
  - Similes should be all capitalized, with spaces represented as underscores
  - Similes should be in the same language as the tool name
  - Similes should be in the same tense as the tool name
  - Similes should be in the same tone as the tool name
  - Similes should be in the same style as the tool name

  Respond with a JSON markdown block containing only the extracted values.

  Example response:
  \`\`\`json
  ["BUILD_RESPONSE", "GENERATE_TOOL_RESPONSE", "RESPONSE_BUILDER"]
  \`\`\`
`