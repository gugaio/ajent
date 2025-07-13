import { ConversationManager } from './conversation_manager.js';
import { config } from './config.js';


export class Squad {

  constructor({agents, apiToken, apiUrl = config.DEFAULT_AJENT_API_URL, maxSteps = 7, enableStream = false}) {
    this._conversationManager = new ConversationManager(apiUrl, apiToken, agents, maxSteps, enableStream);
  }

  async send(message, options={createPlanningTask:false, streamCallback:null }) {
    return await this._conversationManager.processMessage(message, options);
  }

}