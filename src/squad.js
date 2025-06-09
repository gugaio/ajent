import { ConversationManager } from './conversation_manager.js';

const DEFAULT_AJENT_API_URL = 'https://spinal.onrender.com/';


export class Squad {

  constructor({agents, apiToken, apiUrl = DEFAULT_AJENT_API_URL, maxSteps = 7}) {
    this._conversationManager = new ConversationManager(apiUrl, apiToken, agents, maxSteps);
  }

  async send(message, options={createPlanningTask:false, streamContentCallback:null, streamThinkingCallback:null }) {
    return await this._conversationManager.processMessage(message, options);
  }

}