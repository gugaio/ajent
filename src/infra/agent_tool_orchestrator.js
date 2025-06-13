import { Agent } from '../agent/base_agent.js';
import Logger from '../utils/logger.js';
import {getFunctionParameters} from '../tooling/schema_generator.js';

const logger = new Logger({
  level: 'info',  // Set logging level
  prefix: 'AgentToolOrchestrator',   // Add prefix to all logs
  enableTimestamp: true,  // Include timestamps
  enableColors: true,     // Enable colors in Node.js
});

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
        console.info(`Executing tool call: ${toolCall.function.name} with args: ${toolCall.function.arguments}`);
        const result = await this.invokeTool(toolCall, currentAgent);
        const response = this._handleToolCallResult(result, toolCall, currentAgent);        
        if (response.agentTransfer) {
          console.info(`Transferring to agent: ${response.agentTransfer.id}`);
          currentAgent = response.agentTransfer;
        }
        console.info(`Tool call ${toolCall.function.name} message:`, response.message);    
        toolResults.push(response.message);
      } catch (error) {
        console.error(`Failed to execute tool ${toolCall.function.name}:`, error);
        toolResults.push(this._createErrorResponse(toolCall.id, error.message, currentAgent));
      }
    }
    return {
      messages: toolResults,
      agent: currentAgent
    };
  }

  /**
   * Invokes a single tool function
   * @param {ToolCall} toolCall - Tool call to execute
   * @param {Agent} agent - Agent executing the tool
   * @returns {Promise<any>}
   */
  async invokeTool(toolCall, agent) {

    let params = {};
      const { function: { name, arguments: args } } = toolCall;
      const toolFunction = this._getToolFunction(name, agent);
      if(!toolFunction){
        return `Tool id ${toolCall.id} with function name ${name}  was not found at current agent`;
      }
      const toolCallParameters = this._parseToolArguments(args);
      if (!toolCallParameters) {
        return `Failed to parse tool arguments for function ${name}. Json must be invalid.`;
      }

      let expectedParameters = getFunctionParameters(toolFunction);
      if(!Array.isArray(expectedParameters))
      {
        expectedParameters = [expectedParameters]
      }
      params = expectedParameters.map(name => {
        if (toolCallParameters && typeof toolCallParameters === 'object') {
            return toolCallParameters[name] || null;
        } else {
          console.warn('Invalid toolCallParameters: Expected an object.');
        }
        
    });

    const result = await toolFunction.bind(agent)(...params);
    logger.info('Tool executed:', name, result);
    return result;
  }

  /**
   * Handles the result of a tool execution
   * @private
   */
  _handleToolCallResult(result, toolCall, agent) {
    if (result instanceof Agent) {
      logger.info('Transferred to', result.id);
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
    return func;
  }

  /**
   * Parses tool arguments from JSON string
   * @private
   */
  _parseToolArguments(argsString) {
    let result = null;
    try {
      const toolArgs = JSON.parse(argsString);
      result = toolArgs;
    } catch (error) {
      console.error('Failed to parse tool arguments:', error.message);      
    }
    return result;
  }
}