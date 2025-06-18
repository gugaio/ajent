function schemaGenerator(tools) {
  return tools.map(tool => toolSchemaGenerator(tool));
}

function toolSchemaGenerator(tool) {
  const description = tool.description;

  // Tenta pegar parâmetros desestruturados
  const destructuredParams = getDestructuredParams(tool.tool_function);

  // Se não for desestruturado, tenta pegar os posicionais
  const paramKeys = destructuredParams.length
    ? destructuredParams
    : getPositionalParams(tool.tool_function);

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

  paramKeys.forEach(param => {
    schema.function.parameters.properties[param] = {
      type: "string", // Pode ser melhorado com inferência
      description: `Description for parameter: ${param}.`
    };
    schema.function.parameters.required.push(param);
  });

  return schema;
}

function getDestructuredParams(func) {
  const funcStr = func.toString().trim();
  const match = funcStr.match(/\(\s*{([^}]*)}\s*\)/);
  if (match) {
    return match[1]
      .split(",")
      .map(p => p.trim().split("=")[0].trim()) // remove defaults
      .filter(Boolean);
  }
  return [];
}

function getPositionalParams(func) {
  const funcStr = func.toString().trim();

  // function nome(param1, param2)
  const traditionalMatch = funcStr.match(/^function\s*.*?\(([^)]*)\)/);
  if (traditionalMatch) return splitParamList(traditionalMatch[1]);

  // arrow function (param1, param2) => ...
  const arrowMatch = funcStr.match(/^(?:\(([^)]*)\)|([^=]*))\s*=>/);
  if (arrowMatch) return splitParamList(arrowMatch[1] || arrowMatch[2] || '');

  // fallback
  return [];
}

function splitParamList(paramStr) {
  return paramStr
    .split(",")
    .map(p => p.trim().split("=")[0].trim()) // remove defaults
    .filter(Boolean);
}

export { toolSchemaGenerator, schemaGenerator, getPositionalParams, getDestructuredParams };
