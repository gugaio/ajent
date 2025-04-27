function schemaGenerator(tools) {
  return tools.map(tool => toolSchemaGenerator(tool));
}


function toolSchemaGenerator(tool) {
    const description = tool.description
    const params = _getFunctionParameters(tool.tool_function);
    const paramList = params.split(",").map(param => param.trim()).filter(Boolean);
  
    const schema = {
      type: "function",
      function: {
        name: tool.id,
        description: description || "No description provided.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    };
  
    paramList.forEach(param => {
      // Assume all parameters are strings for simplicity, we can customize this later
      schema.function.parameters.properties[param] = {
        type: "string",
        description: `Description for parameter: ${param}.`
      };
      schema.function.parameters.required.push(param);
    });
  
    return schema;
}

function _getFunctionParameters(func) {
  const funcStr = func.toString().trim();
  
  // Handle traditional functions: function name(params) { ... }
  const traditionalMatch = funcStr.match(/^function\s*.*?\(([^)]*)\)/);
  if (traditionalMatch) return traditionalMatch[1];

  // Handle arrow functions: (params) => { ... } or param => { ... }
  const arrowMatch = funcStr.match(/^(?:\(([^)]*)\)|([^=]*))\s*=>/);
  if (arrowMatch) return arrowMatch[1] || arrowMatch[2] || '';

  const genericMatch = funcStr.match(/^(async\s+)?(\w+)\s*\(([^)]*)\)/);
  if (genericMatch) return genericMatch[3] || '';


  return ''; // Fallback if no match
}
 
export {toolSchemaGenerator, schemaGenerator};