import { ConversationApi } from './index.js';
import { AgentToolOrchestrator } from './infra/agent_tool_orchestrator.js';
import { TriageAgent } from './agent/triage_agent.js';
import {schemaGenerator} from './tooling/schema_generator.js';


export class ConversationManager {
  /**
   * @param {string} apiUrl
   * @param {Object} agent
   */
  constructor(apiUrl, xApiToken, agents, triage_instruction) {
    this.api = new ConversationApi(apiUrl, xApiToken);
    this.toolOrchestrator = new AgentToolOrchestrator();
    this.agents = agents;
    this.context = {agents: agents, viewer: {}};
    for (const agent of agents) {
      this.context.agents[agent.id] = agent;
      agent.context = this.context;
    }
    if(triage_instruction){
      this.current_agent = new TriageAgent(this.context, agents, triage_instruction);
    }else{
      this.current_agent = agents[0];
    }
    console.log('Initial agent:', this.current_agent.id);
    this.messages = [];
  }

  async processMessage(message) {
    try {
      console.log('Processing message:', message);
      this.messages.push({content: message, role: 'user'});
      this.context.viewer = {};
      const reponseMessage = await this.processConversation();
      const response = reponseMessage.content;
      return response;
    } catch (error) {
      console.error('Message processing failed:', error);
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
        let {messages: enrichedMessages, toolSchemas} = this.enrichMessages(this.messages);
        console.log('Request to Spinal with messages:', enrichedMessages);
        const response = await this.api.sendMessage(enrichedMessages, toolSchemas);
        this.messages.push(response);
        if(!this.hasToolCalls(response)){
          console.log('Conversation finished:', response);
          return response;
        }
        console.log('Spinal asked tools:', response);
        const toolMessages= await this.handleToolResponse(response, enrichedMessages);
        console.log('Tool messages:', toolMessages);
        this.messages = [
          ...this.messages,
          ...toolMessages
        ];
      }
      
    } catch (error) {
      console.error('Conversation processing failed:', error);
      throw error;
    }
  }

  /**
   * @private
   * @param {Array<Message>} messages
   * @returns {Array<Message>}
   */
  enrichMessages(messages) {
    const system_instruction = {
      content: this.current_agent.instruction(),
      role: 'system'
    };
    const toolSchemas = schemaGenerator(this.current_agent.tools());
    return {messages:[system_instruction, ...messages], toolSchemas};
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
    const {messages, current_agent} = await this.toolOrchestrator.executeToolCalls(response.tool_calls, this.current_agent);
    this.current_agent = current_agent;
    return messages
  }
}