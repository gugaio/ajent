import { CompletionService } from './index.js';
import { AgentToolOrchestrator } from './infra/agent_tool_orchestrator.js';
import { TriageAgent } from './agent/triage_agent.js';
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
  constructor(apiUrl, xApiToken, agents, triage_instruction) {
    this._completionService = new CompletionService(apiUrl, xApiToken);
    this._toolOrchestrator = new AgentToolOrchestrator();
    this._agents = agents;
    this._context = {agents: agents, viewer: {}};
    for (const agent of agents) {
      this._context.agents[agent.id] = agent;
      agent.context = this._context;
    }
    if(triage_instruction){
      this.current_agent = new TriageAgent(this._context, agents, triage_instruction);
    }else{
      this.current_agent = agents[0];
    }
    logger.info('Initial agent:', this.current_agent.id);
    this.messages = [];
  }

  async processMessage(message) {
    try {
      logger.info('Processing message:', message);
      this.messages.push({content: message, role: 'user'});
      this._context.viewer = {};
      const reponseMessage = await this.processConversation();
      const response = reponseMessage.content;
      logger.info('Message reply:', response);
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
    try {
      while(true){
        let {enrichedMessages, toolSchemas} = this._enrichMessages(this.messages);
        const response = await this._sendToCompletionService(enrichedMessages, toolSchemas);
        if(!this.hasToolCalls(response)){
          return response; 
        }
        await this._handleToolCalls(response.tool_calls, enrichedMessages);
      }
      
    } catch (error) {
      logger.error('Conversation processing failed:', error);
      throw error;
    }
  }

  /**
   * @private
   * @param {Array<Message>} messages
   * @returns {Array<Message>}
   */
  _enrichMessages(messages) {
    const system_instruction = {
      content: this.current_agent.instruction(),
      role: 'system'
    };
    const toolSchemas = schemaGenerator(this.current_agent.tools());
    return {enrichedMessages:[system_instruction, ...messages], toolSchemas};
  }

  async _sendToCompletionService(enrichedMessages, toolSchemas) {
    const response = await this._completionService.sendMessage(enrichedMessages, toolSchemas);
    this.messages.push(response);
    return response;
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