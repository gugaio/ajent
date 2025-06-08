import { CompletionService } from './index.js';
import { AgentToolOrchestrator } from './infra/agent_tool_orchestrator.js';
import { PlannerAgent } from './agent/planner_agent.js';
import {schemaGenerator} from './tooling/schema_generator.js';
import Logger from './utils/logger.js';

const logger = new Logger({
  level: 'info',  // Set logging level
  prefix: 'ConversationManager',   // Add prefix to all logs
  enableTimestamp: true,  // Include timestamps
  enableColors: true,     // Enable colors in Node.js
});

export class ConversationManager {
  /**
   * @param {string} apiUrl
   * @param {Object} agent
   */
  constructor(apiUrl, xApiToken, agents, maxSteps) {
    this._completionService = new CompletionService(apiUrl, xApiToken);
    this._toolOrchestrator = new AgentToolOrchestrator();
    this._agents = agents;
    this._context = {agents: agents, viewer: {}};
    this._maxSteps = maxSteps;
    for (const agent of agents) {
      this._context.agents[agent.id] = agent;
      agent.context = this._context;
    }
    this.current_agent = agents[0];
    this.messages = [];
    this.streamCallback = null;
  }

  set streamCallback(callback) {
    this._streamCallback = callback;
  }

  async processMessage(message, createPlanningTask) {
    try {
      logger.info('Processing user message:', message);
      if(createPlanningTask) {
       this.planner_agent = this.planner_agent || new PlannerAgent(this._context, message);
       this.current_agent = this.planner_agent;
      }
      this.messages.push({content: message, role: 'user'});
      this._context.viewer = {};
      const responseMessage = await this.processConversation();
      const response = responseMessage.content;
      logger.info('Ajent reply to user:', response);
      return response;
    } catch (error) {
      logger.error('Message processing failed:', error);
      throw error;
    }
  }


  /**
   * @param {Array<Message>} messages
   * @returns {Promise<Message>}
   */
  async processConversation() {
    let currentStep = 0;
    try {
      while (currentStep <= this._maxSteps) {
        currentStep++;
        let { agent_instruction_message, toolSchemas } = this._getCurrentAgentInstructionAndTools();
        let messagesWithInstruction = [...this.messages, agent_instruction_message];
        let response;
        if (this._streamCallback) {
          response = await this._streamToCompletionService(messagesWithInstruction, toolSchemas, this._streamCallback);
        } else {
          response = await this._sendToCompletionService(messagesWithInstruction, toolSchemas);
        }
        if(this.current_agent.id === 'PlannerAgent') {
          logger.info('Task planning created:', response.content);
        }    
        if (this.hasEndToolCall(response)) {
          await this._handleToolCalls(response.tool_calls);
          return this.messages[this.messages.length - 1];
        }
        if (this.hasToolCalls(response)) {
          await this._handleToolCalls(response.tool_calls);
        } else {
          // No tool calls and not an end tool, keep reasoning (loop)
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
    logger.debug('Current agent: ', this.current_agent.id)
    logger.debug('Current agent instruction: ', this.current_agent.instruction())
    const agent_instruction_message = {
      content:  this.current_agent.instruction() + '\n' + this.current_agent.base_instruction(),
      role: 'system'
    };
    const toolSchemas = schemaGenerator(this.current_agent.tools());
    logger.debug('Current agent tools: ', toolSchemas)
    return {agent_instruction_message, toolSchemas};
  }

  async _sendToCompletionService(enrichedMessages, toolSchemas) {
    const response = await this._completionService.sendMessage(enrichedMessages, toolSchemas);
    this.messages.push(response);
    return response;
  }

  async _streamToCompletionService(enrichedMessages, toolSchemas, streamCallback) {
    logger.info('Streaming messages to completion service');
    let messageResponse = {
      content: '',
      role: 'assistant'
    };

    await this._completionService.streamMessage(enrichedMessages, toolSchemas, {
      onContent: streamCallback,
      onFinish: ({ content, toolCalls, finishReason }) => {
        console.log('Stream finished', { finishReason });
        console.log('Final content:', content);
        console.log('Final tool calls:', toolCalls);
        
        if (content) {
          messageResponse.content = content;
        }
        
        // Use the final tool calls if provided
        if (toolCalls && toolCalls.length > 0) {
          messageResponse.tool_calls = toolCalls;
        }
      },
      onError: (error) => {
        logger.error('Stream error:', error);
        throw error;
      }
    });
    console.log('Response:', messageResponse);
    this.messages.push(messageResponse);
    return messageResponse;
  }

  async _handleToolCalls(tool_calls) {
    const {messages, agent} = await this._toolOrchestrator.executeToolCalls(tool_calls, this.current_agent);
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
  async handleToolResponse(response, previousMessages) {
    const {messages, current_agent} = await this._toolOrchestrator.executeToolCalls(response.tool_calls, this.current_agent);
    this.current_agent = current_agent;
    return messages
  }
}