import { ConversationManager } from './conversation_manager.js';

const DEFAULT_AJENT_API_URL = 'https://spinal.onrender.com/';


export class Squad {

  constructor({agents, apiToken, apiUrl = DEFAULT_AJENT_API_URL, maxSteps = 7}) {
    this._conversationManager = new ConversationManager(apiUrl, apiToken, agents, maxSteps);
  }

  set streamCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error('streamCallback must be a function');
    }
    this._conversationManager.streamCallback = callback;
  }

  async send(message, createPlanningTask = false) {
    return await this._conversationManager.processMessage(message, createPlanningTask);
  }

}