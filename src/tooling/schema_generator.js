function schemaGenerator(tools) {
  return tools.map(tool => toolSchemaGenerator(tool));
}

function toolSchemaGenerator(tool) {
  const description = tool.description;

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

  // Use sample_input to generate better schema if available
  if (tool.sample_input && typeof tool.sample_input === 'object') {
    Object.keys(tool.sample_input).forEach(key => {
      const sampleValue = tool.sample_input[key];
      const inferredType = inferTypeFromValue(sampleValue);
      
      schema.function.parameters.properties[key] = {
        type: inferredType.type,
        description: `Parameter: ${key}${inferredType.description ? ` - ${inferredType.description}` : ''}`
      };
      
      if (inferredType.enum) {
        schema.function.parameters.properties[key].enum = inferredType.enum;
      }
      
      // Add to required if sample value is not null/undefined
      if (sampleValue !== null && sampleValue !== undefined) {
        schema.function.parameters.required.push(key);
      }
    });
  } else {
    // Fallback to parameter inference

    // Tenta pegar parâmetros desestruturados
    const destructuredParams = getDestructuredParams(tool.tool_function);

    // Se não for desestruturado, tenta pegar os posicionais
    const paramKeys = destructuredParams.length
    ? destructuredParams
    : getPositionalParams(tool.tool_function);

    paramKeys.forEach(param => {
      schema.function.parameters.properties[param] = {
        type: "string", // Pode ser melhorado com inferência
        description: `Description for parameter: ${param}.`
      };
      schema.function.parameters.required.push(param);
    });
  }

  return schema;
}

function inferTypeFromValue(value) {
  if (value === null || value === undefined) {
    return { type: "null", description: "This parameter can be null." };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: "array", description: "Empty array, type cannot be inferred." };
    }
    const itemType = inferTypeFromValue(value[0]);
    return { type: "array", description: `Array of ${itemType.type}s.`, items: itemType };
  }

  if (typeof value === 'object') {
    return { type: "object", description: "Object with unspecified properties." };
  }

  if (typeof value === 'string') {
    return { type: "string", description: "String value." };
  }

  if (typeof value === 'number') {
    return { type: "number", description: "Number value." };
  }

  if (typeof value === 'boolean') {
    return { type: "boolean", description: "Boolean value." };
  }

  // Fallback for unknown types
  return { type: "string", description: `Unknown type for value: ${value}.` };
};

/**
 * Extrai os nomes originais de parâmetros vindos do primeiro argumento da função,
 * cobrindo:
 * 1. Arrow functions com desestruturação direta: ({ a, b }) => { … }
 * 2. Funções com transpilação _ref: function fn(_ref) { var x = _ref.x; … }
 * 3. Métodos de classe: nome({ a, b }) { … }
 * 4. Desestruturação com alias (minificado): let {a:t, b:n} = e
 * 5. Acesso ponto-a-ponto: var x = e.x
 * 6. Acesso via const/let/var (dot) em transpilado: const y = e.y
 *
 * @param {Function} func — a função original (antes de stringificar)
 * @returns {string[]} — lista de nomes extraídos (ex: ["context","eventName"])
 */
function getDestructuredParams(func) {
  const funcStr = func.toString().trim();

  // 1. Arrow com desestruturação direta
  let m = funcStr.match(/^\(?\s*{([^}]*)}\s*\)?\s*=>/);
  if (m && m[1]) {
    return m[1].split(',')
      .map(p => p.trim().split('=')[0].trim())
      .filter(Boolean);
  }

  // 2. Transpilado com _ref: var x = _ref.x
  let refMatches = [...funcStr.matchAll(/var\s+\w+\s*=\s*_ref\.(\w+)/g)];
  if (refMatches.length) {
    return [...new Set(refMatches.map(r => r[1]))];
  }

  // 3. Método de classe com desestruturação direta: nome({ a, b }) { … }
  m = funcStr.match(/^[\w\s]*\(?\s*{([^}]*)}\s*\)?\s*{/);
  if (m && m[1]) {
    return m[1].split(',')
      .map(p => p.trim().split('=')[0].trim())
      .filter(Boolean);
  }

  // 4. Desestruturação com alias (minificado/transpilado):
  //    let {foo: t, bar: n} = e
  let aliasMatches = [...funcStr.matchAll(/(?:let|const|var)\s*{([^}]+)}\s*=\s*\w+/g)];
  if (aliasMatches.length) {
    const joined = aliasMatches.map(a => a[1]).join(',');
    return [...new Set(
      joined.split(',')
        .map(p => p.trim().split(':')[0].trim())
        .filter(Boolean)
    )];
  }

  // 5. Acesso via ponto: var x = e.x; ou const y = e.y; ...
  //    Observação: só pega se for o primeiro parâmetro e variável única (e=>)
  let dotMatches = [...funcStr.matchAll(/(?:var|let|const)\s+(\w+)\s*=\s*(\w+)\.(\w+)/g)];
  if (dotMatches.length) {
    // identificamos algo como var t = e.id;
    // vamos só pegar os grupos onde a fonte (grupo 2) coincide com o nome do primeiro
    // parâmetro "e" ou "_ref"
    const firstParam = funcStr.match(/^\s*(?:async\s*)?(?:function)?\s*\w*\s*\(?\s*(\w+)/);
    const paramName = firstParam && firstParam[1];
    return [...new Set(
      dotMatches
        .filter(d => d[2] === paramName)
        .map(d => d[3])
    )];
  }

  // Se nada bateu, assume sem parâmetros desestruturados
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
