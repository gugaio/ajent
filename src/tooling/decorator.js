// Symbol to store function descriptions
const FUNCTION_DESCRIPTION = Symbol('functionDescription');

// Decorator factory to add description to functions
function tool(description) {
    return function(target) {
        if (typeof target === 'function') {
            target[FUNCTION_DESCRIPTION] = description;
            return target;
        }
        throw new Error('tool decorator can only be used on functions');
    };
}

function getDescription(fn) {
    if (typeof fn !== 'function') {
        throw new Error('Argument must be a function');
    }
    return fn[FUNCTION_DESCRIPTION] || 'No description available';
}

function getAllProperties(obj) {
    const props = new Set();
    
    let currentObj = obj;
    while (currentObj !== null) {
        Object.getOwnPropertyNames(currentObj).forEach(prop => props.add(prop));
        currentObj = Object.getPrototypeOf(currentObj);
    }
    
    return [...props];
}

function getPropertyDescriptorFromChain(obj, prop) {
    let currentObj = obj;
    while (currentObj !== null) {
        const descriptor = Object.getOwnPropertyDescriptor(currentObj, prop);
        if (descriptor) return descriptor;
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return undefined;
}


function getDescribedFunctions(obj) {
    if (obj === null || typeof obj !== 'object') {
        throw new Error('Argument must be an object or class instance');
    }

    const result = {};
    
    // Get all properties including methods from prototype chain
    const props = getAllProperties(obj);

    // Filter for functions with descriptions
    for (const prop of props) {
        const descriptor = getPropertyDescriptorFromChain(obj, prop);
        
        if (descriptor && typeof descriptor.value === 'function') {
            const fn = descriptor.value;
            if (fn[FUNCTION_DESCRIPTION]) {
                result[prop] = fn;
            }
        }
    }

    return result;
}

export { tool, getDescription, getDescribedFunctions };