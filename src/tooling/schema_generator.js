import {getDescription} from './decorator';

function toolSchemaGenerator(func) {
    const description = getDescription(func) || extractFunctionComment(func)
    const params = func.toString().match(/\(([^)]*)\)/)[1]; // Extract function parameters
    const paramList = params.split(",").map(param => param.trim()).filter(Boolean);
  
    const schema = {
      type: "function",
      function: {
        name: func.name,
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
  
    return schema;
}

function extractFunctionComment(func) {
    const funcStr = func.toString();
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
 
  export default toolSchemaGenerator;