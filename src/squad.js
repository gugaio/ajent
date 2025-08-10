import { AgenticLoop } from './agentic_loop.js';
import { config } from './config.js';


export class Squad {

  constructor({agents, apiToken, apiUrl = config.DEFAULT_AJENT_API_URL, maxSteps = config.DEFAULT_MAX_STEPS, enableStream = config.DEFAULT_ENABLE_STREAM, forceTools = config.DEFAULT_FORCE_TOOLS}) {
    this._agenticLoop = new AgenticLoop(apiUrl, apiToken, agents, maxSteps, enableStream, forceTools);
  }

  async send(message, options={createPlanningTask:false, streamCallback:null }) {
    return await this._agenticLoop.processMessage(message, options);
  }

}