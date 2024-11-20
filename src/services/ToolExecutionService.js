import execute_tool from '../tooling/tools';
import { Agent } from '../agent/base_agent';

export class ToolExecutionService {
  /**
   * @param {Array<ToolCall>} toolCalls
   * @returns {Array<Message>}
   */
  executeTools(toolCalls, agent) {
    const toolResults = [];
    let current_agent = agent;
    for( const toolCall of toolCalls){
      const result = execute_tool(toolCall, agent);
      if(result instanceof Agent){
        current_agent = result;
        toolResults.push(this.createToolMessageResult(toolCall.id, `Transfered to ${current_agent.id}. Adopt persona immediately.`, agent));
      }else{
        toolResults.push(this.createToolMessageResult(toolCall.id, result, agent));
      }
    }
    return {messages: toolResults, current_agent: current_agent};
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
