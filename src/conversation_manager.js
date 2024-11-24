import { ConversationApi } from './index';
import { ToolExecutionService } from './services/ToolExecutionService';
import { TriageAgent } from './agent/triage_agent';


export class ConversationManager {
  /**
   * @param {string} apiUrl
   * @param {Object} agent
   */
  constructor(initial_instruction,apiUrl, agents) {
    this.api = new ConversationApi(apiUrl);
    this.toolService = new ToolExecutionService();
    this.agents = agents;
    this.context = {agents: agents, viewer: {}};
    for (const agent of agents) {
      this.context.agents[agent.id] = agent;
      agent.context = this.context;
    }
    
    this.current_agent = new TriageAgent(this.context, agents, initial_instruction);
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
        let {messages: enrichedMessages, tools, toolSchemas} = this.enrichMessages(this.messages);
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
    const instructions = this.current_agent.instructions();
    const system_instruction = {
      content: instructions.instruction,
      role: 'system'
    };
    const tools = instructions.tools.concat([this.current_agent.transfer_to_agent]);
    const toolSchemas = this.current_agent.toolSchemas(tools);
    return {messages:[system_instruction, ...messages], tools: tools, toolSchemas};
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
    const {messages, current_agent} = await this.toolService.executeTools(response.tool_calls, this.current_agent);
    this.current_agent = current_agent;
    return messages
  }
}