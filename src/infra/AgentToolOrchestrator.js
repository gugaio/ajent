import { Agent } from '../agent/base_agent.js';

export class AgentToolOrchestrator {
  /**
   * @param {Array<ToolCall>} toolCalls
   * @returns {Array<Message>}
   */
  async executeTools(toolCalls, agent) {
    const toolResults = [];
    let current_agent = agent;
    for( const toolCall of toolCalls){
      const result = await this.executeTool(toolCall, agent);
      if(result instanceof Agent){
        current_agent = result;
        console.log('Transfered to', current_agent.id);
        toolResults.push(this.createToolMessageResult(toolCall.id, `Transfered to ${current_agent.id}. Adopt persona immediately.`, agent));
      }else{
        console.log('Tool result:', result);
        toolResults.push(this.createToolMessageResult(toolCall.id, result, agent));
      }
    }
    console.log('Tool calls finished:', toolResults);
    return {messages: toolResults, current_agent: current_agent};
  }

  async executeTool(message, agent) {
    let func = agent.mapTools()[message.function.name]
    const toolArgs = JSON.parse(message.function.arguments)
    const parameters = Object.keys(toolArgs).map(key => toolArgs[key])
    func = func.bind(agent)
    const result = await func(...parameters)
    console.log('Tool executed:', message.function.name, result)
    return result
  }

  /**
   * @param {ToolCall} toolCall
   * @returns {Message}
   */
  createToolMessageResult(toolCallId, toolCallResult, agent) {
    return {
      role: "tool",
      tool_call_id: toolCallId,
      content: toolCallResult,
      tools: agent.mapTools()
    }
  }

}
