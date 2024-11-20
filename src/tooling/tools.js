function execute_tool(message, agent) {
    const toolArgs = JSON.parse(message.function.arguments)
    const parameters = Object.keys(toolArgs).map(key => toolArgs[key])
    let func = agent.mapTools()[message.function.name]
    func = func.bind(agent)
    return func(...parameters)
}

export default execute_tool;