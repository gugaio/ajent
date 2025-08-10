import { Agent } from '../agent/base_agent.js';
import Logger from '../utils/logger.js';
import {getDestructuredParams, getPositionalParams} from '../tooling/schema_generator.js';

const logger = new Logger({
  level: 'info',  // Set logging level
  prefix: 'AgentToolOrchestrator',   // Add prefix to all logs
  enableTimestamp: true,  // Include timestamps
  enableColors: true,     // Enable colors in Node.js
});

export class AgentToolOrchestrator {
  constructor() {
    this.toolCallHistory = new Map(); // Tracks recent tool calls to prevent loops
    this.maxHistorySize = 10; // Maximum number of recent calls to track
  }

  /**
   * Executes a series of tool calls and handles potential agent transfers
   * @param {Array<ToolCall>} toolCalls - Array of tool calls to execute
   * @param {Agent} agent - Current agent executing the tools
   * @returns {Promise<{messages: Array<Message>, current_agent: Agent}>}
   */
  async executeToolCalls(toolCalls, agent, streamCallback) {
    const toolResults = [];
    let currentAgent = agent;
    for (const toolCall of toolCalls) {
      try {
        // Check for consecutive tool calls to prevent loops
        if (this._isConsecutiveToolCall(toolCall.function.name, currentAgent.id)) {
          logger.warn(`Detected consecutive tool call: ${toolCall.function.name}. Skipping to prevent loop.`);
          toolResults.push(this._createErrorResponse(
            toolCall.id, 
            `Tool ${toolCall.function.name} was just called. Avoiding consecutive calls to prevent loops. Try a different approach or tool.`,
            currentAgent
          ));
          continue;
        }

        const toolCallingMsg = `<tool>Tool calling ${toolCall.function.name} (${toolCall.function.arguments})</tool>`;
        console.info(toolCallingMsg);
        streamCallback && streamCallback(toolCallingMsg, false);        
        const result = await this.invokeTool(toolCall, currentAgent);
        
        // Track this tool call
        this._trackLastTool(toolCall.function.name, currentAgent.id);
        const response = this._handleToolCallResult(result, toolCall, currentAgent);        
        if (response.agentTransfer) {
          console.info(`Transferring to agent: ${response.agentTransfer.id}`);
          currentAgent = response.agentTransfer;
        }
        console.info(`Tool call ${toolCall.function.name} response message:`, response.message);    
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
  const {
    function: { name, arguments: args }
  } = toolCall;

  const toolFunction = this._getToolFunction(name, agent);
  if (!toolFunction) {
    return `Tool id ${toolCall.id} with function name ${name} was not found at current agent`;
  }

  const toolCallParameters = this._parseToolArguments(args);
  if (!toolCallParameters || typeof toolCallParameters !== 'object') {
    return `Failed to parse tool arguments for function ${name}. JSON must be a valid object.`;
  }

  return await toolFunction.bind(agent)(toolCallParameters);
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
  _createToolResponse(toolCallId, content) {
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
      return null;
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

  /**
   * Checks if a tool is being called consecutively
   * @private
   */
  _isConsecutiveToolCall(toolName, agentId) {
    // Allow consecutive transfers to enable agent-to-agent redirections
    if (toolName === 'transfer_to_agent') {
      return false;
    }
    
    const key = `${agentId}:lastTool`;
    return this.toolCallHistory.get(key) === toolName;
  }

  /**
   * Tracks the last tool called for an agent
   * @private
   */
  _trackLastTool(toolName, agentId) {
    const key = `${agentId}:lastTool`;
    this.toolCallHistory.set(key, toolName);
  }

  /**
   * Clears the tool call history - useful when starting a new conversation
   * @public
   */
  clearHistory() {
    this.toolCallHistory.clear();
    logger.debug('Tool call history cleared');
  }
}