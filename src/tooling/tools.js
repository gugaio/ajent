async function execute_tool(message, agent) {
    const toolArgs = JSON.parse(message.function.arguments)
    const parameters = Object.keys(toolArgs).map(key => toolArgs[key])
    let func = agent.mapTools()[message.function.name]
    func = func.bind(agent)
    const result = await func(...parameters)
    console.log('Tool executed:', message.function.name, result)
    return result
}

export default execute_tool;