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
    this.context = {agents: agents};
    for (const agent of agents) {
      this.context.agents[agent.id] = agent;
      agent.context = this.context;
    }
    
    this.current_agent = new TriageAgent(this.context, agents, initial_instruction);
  }

  /**
   * @param {Array<Message>} messages
   * @returns {Promise<Message>}
   */
  async processConversation(messages) {
    try {
      let {messages: enrichedMessages, tools} = this.enrichMessages(messages);
      const toolsSchems = this.current_agent.toolSchemas(tools);

      while(true){
        const response = await this.api.sendMessage(enrichedMessages, toolsSchems);
        if(!this.hasToolCalls(response)){
          return response;
        }
        enrichedMessages= this.handleToolResponse(response, enrichedMessages);
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
    return {messages:[system_instruction, ...messages], tools: tools};
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
  handleToolResponse(response, previousMessages) {
    const {messages, current_agent} = this.toolService.executeTools(response.tool_calls, this.current_agent);
    this.current_agent = current_agent;
    const updatedMessages = [
      ...previousMessages,
      response,
      ...messages
    ];
    
    return updatedMessages
  }
}