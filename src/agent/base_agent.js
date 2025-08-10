import { Tool } from '../tooling/tool.js';
import { INSTRUCTION_WITH_FINAL_ANSWER, INSTRUCTION_WITHOUT_FINAL_ANSWER } from '../prompts/base_agent_prompts.js';


export class Agent {
  constructor(id, task, tools = [], context = {}) {
    this.id = id;
    this.task = task;
    this.context = context;
    this._tools = tools.concat([
      new Tool(
      `transfer_to_agent_${id}`,
      `Transfer directly to agent ${id}. This tool does not require parameters. Task of this agent is: ${this.task}`,
      () => this.transfer_to_agent({ id })
      ),
    ]);
  }

  useFinalAnswerTool(){
    this._tools.push(
      new Tool(
        'final_answer',
        'Use this tool to indicate that the agent has reached the end of its reasoning loop and is ready to provide a final response.',
        this.final_answer,
        { 'answer': 'The final answer is ...' }
      )
      );
  }

  base_instruction = () => {
    if(this.context.forceTools){
      return INSTRUCTION_WITH_FINAL_ANSWER;
    }else{
      return INSTRUCTION_WITHOUT_FINAL_ANSWER;
    }    
  };

  instruction = () => {
    return `The agent with id ${this.id} is a base agent.`;
  };

  tools = () => {
    return this._tools;
  };

  addTool = (tool) => {
    this._tools.push(tool);
  };


  transfer_to_agent({id}) {
    if (!this.context["agents"][id]) {
      return `Agent with id ${id} not found in the context.`;
    }
    
    // Prevent self-transfer
    if (id === this.id) {
      return `Cannot transfer to the same agent (${this.id}). You are already this agent. Use other available tools or provide a final answer instead.`;
    }
    
    const new_agent = this.context["agents"][id];
    return new_agent;
  }

  /**
   * Tool to signal the end of the reasoning loop.
   * @returns {string}
   */
  final_answer({answer}) {
    return answer;
  }

  mapTools = () =>  {
    return this._tools.reduce((acc, tool) => {
      acc[tool.id] = tool.tool_function;
      return acc;
    }, {});
  };
  
} 