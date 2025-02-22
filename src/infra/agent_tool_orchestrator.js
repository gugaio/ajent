import { Agent } from '../agent/base_agent.js';

export class AgentToolOrchestrator {
  /**
   * Executes a series of tool calls and handles potential agent transfers
   * @param {Array<ToolCall>} toolCalls - Array of tool calls to execute
   * @param {Agent} agent - Current agent executing the tools
   * @returns {Promise<{messages: Array<Message>, current_agent: Agent}>}
   */
  async executeToolCalls(toolCalls, agent) {
    const toolResults = [];
    let currentAgent = agent;

    for (const toolCall of toolCalls) {
      try {
        const result = await this.invokeTool(toolCall, currentAgent);
        const response = this.handleToolResult(result, toolCall, currentAgent);
        
        if (response.agentTransfer) {
          currentAgent = response.agentTransfer;
        }
        
        toolResults.push(response.message);
      } catch (error) {
        console.error(`Failed to execute tool ${toolCall.function.name}:`, error);
        toolResults.push(this._createErrorResponse(toolCall.id, error.message, currentAgent));
      }
    }

    return {
      messages: toolResults,
      current_agent: currentAgent
    };
  }

  /**
   * Invokes a single tool function
   * @param {ToolCall} toolCall - Tool call to execute
   * @param {Agent} agent - Agent executing the tool
   * @returns {Promise<any>}
   */
  async invokeTool(toolCall, agent) {
    const { function: { name, arguments: args } } = toolCall;
    const toolFunction = this._getToolFunction(name, agent);
    if(!toolFunction){
      return `Tool id ${toolCall.id} with function name ${name}  was not found at current agent`;
    }
    const parameters = this._parseToolArguments(args);
    if (!parameters) {
      return `Failed to parse tool arguments for function ${name}. Json must be invalid.`;
    }

    const result = await toolFunction(...parameters);
    console.log('Tool executed:', name, result);
    return result;
  }

  /**
   * Handles the result of a tool execution
   * @private
   */
  handleToolResult(result, toolCall, agent) {
    if (result instanceof Agent) {
      console.log('Transferred to', result.id);
      return {
        message: this._createToolResponse(
          toolCall.id,
          `Transferred to ${result.id}. Adopt persona immediately.`,
          agent
        ),
        agentTransfer: result
      };
    }

    return {
      message: this._createToolResponse(toolCall.id, result, agent),
      agentTransfer: null
    };
  }

  /**
   * Creates a tool response message
   * @param {string} toolCallId - ID of the tool call
   * @param {string} content - Result content
   * @param {Agent} agent - Agent that executed the tool
   * @returns {Message}
   */
  _createToolResponse(toolCallId, content, agent) {
    return {
      role: "tool",
      tool_call_id: toolCallId,
      content
    };
  }

  /**
   * Creates an error response message
   * @private
   */
  _createErrorResponse(toolCallId, errorMessage, agent) {
    return this._createToolResponse(
      toolCallId,
      `Error executing tool: ${errorMessage}`,
      agent
    );
  }

  /**
   * Gets the tool function from the agent
   * @private
   */
  _getToolFunction(functionName, agent) {
    const func = agent.mapTools()[functionName];
    if (!func) {
      return null
    }
    return func.bind(agent);
  }

  /**
   * Parses tool arguments from JSON string
   * @private
   */
  _parseToolArguments(argsString) {
    let result = null;
    try {
      const toolArgs = JSON.parse(argsString);
      result = Object.values(toolArgs);
    } catch (error) {
      console.error('Failed to parse tool arguments:', error.message);      
    }
    return result;
  }
}