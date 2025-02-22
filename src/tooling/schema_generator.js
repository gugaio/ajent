import {getDescription} from './decorator.js';

function schemaGenerator(tools) {
  return tools.map(tool => toolSchemaGenerator(tool.id, tool.description, tool.tool_function));
}


function toolSchemaGenerator(id, toolDescription, func) {
    const toolId = id || func.name; 
    const description = toolDescription || getDescription(func) || extractFunctionComment(func)
    const params = getFunctionParameters(func);
    const paramList = params.split(",").map(param => param.trim()).filter(Boolean);

    console.log("toolId", toolId);
  
    const schema = {
      type: "function",
      function: {
        name: toolId,
        description: description || "No description provided.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    };
  
    paramList.forEach(param => {
      // Assume all parameters are strings for simplicity, you can customize this
      schema.function.parameters.properties[param] = {
        type: "string",
        description: `Description for parameter: ${param}.`
      };
      schema.function.parameters.required.push(param);
    });

    console.log("schema", schema);
  
    return schema;
}

function getFunctionParameters(func) {
  const funcStr = func.toString().trim();
  
  // Handle traditional functions: function name(params) { ... }
  const traditionalMatch = funcStr.match(/^function\s*.*?\(([^)]*)\)/);
  if (traditionalMatch) return traditionalMatch[1];

  // Handle arrow functions: (params) => { ... } or param => { ... }
  const arrowMatch = funcStr.match(/^(?:\(([^)]*)\)|([^=]*))\s*=>/);
  if (arrowMatch) return arrowMatch[1] || arrowMatch[2] || '';

  return ''; // Fallback if no match
}

function extractFunctionComment(func) {
    const funcStr = func.toString();
    console.log("-------------------------")
    debugger
    console.log(funcStr);
    const commentMatch = funcStr.match(/\/\*\*([\s\S]*?)\*\//);
  
    if (commentMatch) {
      const comment = commentMatch[1]
        .split('\n') // Split lines
        .map(line => line.trim().replace(/^\* ?/, '')) // Remove leading `*` or whitespace
        .filter(line => line.length > 0) // Remove empty lines
        .join(' '); // Join lines into a single string
      return comment;
    }
  
    return "No description found."; // Default if no comment
}
 
  export {toolSchemaGenerator, schemaGenerator};