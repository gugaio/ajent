import { CompletionService } from './index.js';
import { AgentToolOrchestrator } from './infra/agent_tool_orchestrator.js';
import { PlannerAgent } from './agent/planner_agent.js';
import {schemaGenerator} from './tooling/schema_generator.js';
import Logger from './utils/logger.js';

const logger = new Logger({
  level: 'info',  // Set logging level
  prefix: 'AgenticLoop',   // Add prefix to all logs
  enableTimestamp: true,  // Include timestamps
  enableColors: true,     // Enable colors in Node.js
});

export class AgenticLoop {
  /**
   * @param {string} apiUrl
   * @param {Object} agent
   */
  constructor(apiUrl, xApiToken, agents, maxSteps, enableStream) {
    this._completionService = new CompletionService(apiUrl, xApiToken);
    this._toolOrchestrator = new AgentToolOrchestrator();
    this._agents = agents;
    this._context = {agents: agents, viewer: {}, enableStream};
    this._maxSteps = maxSteps;
    for (const agent of agents) {
      this._context.agents[agent.id] = agent;
      agent.context = this._context;
      if(!enableStream){
        agent.useFinalAnswerTool();
      }
    }
    this.current_agent = agents[0];
    this.messages = [];
    this.streamCallback = null;
  }

  set streamCallback(callback) {
    this._streamCallback = callback;
  }

  async processMessage(message, options) {
    try {
      logger.info('Processing user message:', message);
      if(options.createPlanningTask) {
       this.planner_agent = this.planner_agent || new PlannerAgent(this._context, message);
       this.current_agent = this.planner_agent;
      }
      this.messages.push({content: message, role: 'user'});
      this._context.viewer = {};
      const responseMessage = await this.processConversation(options.streamCallback);
      const response = responseMessage.content;
      logger.info('Ajent reply to user:', response);
      return response;
    } catch (error) {
      logger.error('Message processing failed:', error);
      throw error;
    }
  }

  isReasoning(){
    return this.current_agent.id === 'PlannerAgent';
  }

  /**
   * @param {Array<Message>} messages
   * @returns {Promise<Message>}
   */
  async processConversation(streamCallback) {
    let currentStep = 0;
    let streamCallbackWrapper = streamCallback 
    ? (content, isToolCall = false) => {
        streamCallback(content, this.isReasoning() || isToolCall);
      } 
    : null;
    try {
      while (currentStep <= this._maxSteps) {
        currentStep++;
        logger.info('<####### Processing step:', currentStep, '#######>');
        let { agent_instruction_message, toolSchemas } = this._getCurrentAgentInstructionAndTools();
        let messagesWithInstruction = [...this.messages, agent_instruction_message];
        let response;
        if (streamCallbackWrapper) {
          response = await this._streamToCompletionService(messagesWithInstruction, toolSchemas, streamCallbackWrapper);
        } else {
          response = await this._sendToCompletionService(messagesWithInstruction, toolSchemas);
        }
        if(this.current_agent.id === 'PlannerAgent') {
          logger.info('Task planning created:', response.content);
        }    
        if (this.hasEndToolCall(response)) {
          await this._handleToolCalls(response.tool_calls, streamCallbackWrapper);
          return this.messages[this.messages.length - 1];
        }
        if (this.hasToolCalls(response)) {
          await this._handleToolCalls(response.tool_calls, streamCallbackWrapper);
        } else {
          if(this._context.enableStream) {
            return response;
          }
          logger.info('No tool calls found in response. Content:', response.content, 'Continuing conversation.');
          this.messages.push({
            role: "system",
            content: "Você não chamou nenhuma ferramenta nem a tool 'final_answer'. Continue raciocinando e, se quiser finalizar ou perguntar alguma informação, chame explicitamente a tool 'final_answer'."
          });
          continue;
        }
      }
      logger.info('Max steps reached, stopping conversation.');
      const answer = { content: 'Max steps reached without a final answer.' };
      return answer;
    } catch (error) {
      logger.error('Conversation processing failed:', error);
      throw error;
    }
  }
  /**
   * Checks if the message contains a tool call of type "end"
   * @param {Message} message
   * @returns {boolean}
   */
  hasEndToolCall(message) {
    if (!message.tool_calls || !Array.isArray(message.tool_calls)) return false;
    return message.tool_calls.some(tc => tc.function && (tc.function.name === 'final_answer' || tc.function.type === 'final_answer'));
  }

  _getCurrentAgentInstructionAndTools() {
    logger.debug('Current agent: ', this.current_agent.id);
    logger.debug('Current agent instruction: ', this.current_agent.instruction());
    const agent_instruction_message = {
      content:  this.current_agent.instruction() + '\n' + this.current_agent.base_instruction(),
      role: 'system'
    };
    const toolSchemas = schemaGenerator(this.current_agent.tools());
    logger.debug('Current agent tools: ', toolSchemas);
    return {agent_instruction_message, toolSchemas};
  }

  async _sendToCompletionService(enrichedMessages, toolSchemas) {
    const response = await this._completionService.sendMessage(enrichedMessages, toolSchemas);
    this.messages.push(response);
    return response;
  }

  async _streamToCompletionService(enrichedMessages, toolSchemas, streamCallback) {

    const messageResponse = {
      content: '',
      role: 'assistant'
    };
  
    try {
      await this._completionService.streamMessage(enrichedMessages, toolSchemas, {
        onContent: streamCallback,
        onFinish: this._handleStreamFinish(messageResponse),
        onError: this._handleStreamError
      });
  
      this.messages.push(messageResponse);
      return messageResponse;
    } catch (error) {
      logger.error('Failed to stream to completion service', { error: error.message });
      throw error;
    }
  }
  
  _handleStreamFinish(messageResponse) {
    return ({ content, toolCalls, finishReason }) => {
      logger.debug('Stream finished', { finishReason, hasContent: !!content, toolCallsCount: toolCalls?.length || 0 });
      if (content) {
        messageResponse.content = content;
      }
      
      if (toolCalls?.length > 0) {
        messageResponse.tool_calls = toolCalls;
      }
    };
  }
  
  _handleStreamError(error) {
    logger.error('Stream error occurred', { error: error.message, stack: error.stack });
    throw error;
  }

  async _handleToolCalls(tool_calls, streamCallback) {
    const {messages, agent} = await this._toolOrchestrator.executeToolCalls(tool_calls, this.current_agent, streamCallback);
    this.current_agent = agent;
    logger.debug('Tool response:', messages);
    this.messages = [
      ...this.messages,
      ...messages
    ];
  }

  /**
   * @private
   * @param {Message} message
   * @returns {boolean}
   */
  hasToolCalls(message) {
    return message.tool_calls?.length > 0;
  }

  /**
   * @private
   * @param {Message} response
   * @param {Array<Message>} previousMessages
   * @param {Array<Object>} tools
   * @returns {Promise<Message>}
   */
  async handleToolResponse(response) {
    const {messages, current_agent} = await this._toolOrchestrator.executeToolCalls(response.tool_calls, this.current_agent);
    this.current_agent = current_agent;
    return messages;
  }
}