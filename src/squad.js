import { ConversationManager } from './conversation_manager.js';

export class Squad {

  constructor(agents, apiToken, triage_instruction, apiUrl) {
    this._conversationManager = new ConversationManager(apiUrl, apiToken, agents, triage_instruction);
  }

  async send(message) {
    return await this._conversationManager.processMessage(message);
  }
}