import { AgenticLoop } from './agentic_loop.js';
import { config } from './config.js';


export class Squad {

  constructor({
    agents,
    apiToken,
    apiUrl = config.DEFAULT_AJENT_API_URL,
    maxSteps = config.DEFAULT_MAX_STEPS,
    enableStream = config.DEFAULT_ENABLE_STREAM,
    forceTools = config.DEFAULT_FORCE_TOOLS,
    model = config.DEFAULT_LLM_MODEL,
    llmName = config.DEFAULT_LLM_NAME,
    llmTemperature = config.DEFAULT_LLM_TEMPERATURE
  }) {
    this._agenticLoop = new AgenticLoop({
      apiUrl,
      xApiToken: apiToken,
      agents,
      maxSteps,
      enableStream,
      forceTools,
      model,
      llmName,
      llmTemperature
    });
  }

  async send(message, options={createPlanningTask:false, streamCallback:null, images:null }) {
    return await this._agenticLoop.processMessage(message, options);
  }

}