import { Tool } from '../tooling/tool.js';

export class Agent {
  constructor(id, task, tools = [], context = {}) {
    this.id = id
    this.task = task
    this.context = context
    this._tools = tools.concat([
      new Tool('transfer_to_agent', 'Transfer to an agent ' + id + '. The tool function expects the id as string', this.transfer_to_agent),
      new Tool('final_answer', 'Use this tool to indicate that the agent has reached the end of its reasoning loop and is ready to provide a final response.', this.final_answer)
    ])
  }

  base_instruction = () => {
    return `Use the final_answer tool to indicate that the agent has reached the end of its reasoning loop and is ready to provide a final response. This can happen either because the task is complete and the agent has a definitive answer, or because the agent requires additional input from the user before proceeding. Remenber to use the final_answer tool to ask user for more information.`
  }

  instruction = () => {
    return `The agent with id ${this.id} is a base agent.`
  }

  tools = () => {
    return this._tools
  }

  addTool = (tool) => {
    this._tools.push(tool)
  }


  transfer_to_agent(id) {
    if (!this.context["agents"][id]) {
      return `Agent with id ${id} not found in the context.`
    }
    const new_agent = this.context["agents"][id]
    return new_agent
  }

  /**
   * Tool to signal the end of the reasoning loop.
   * @returns {string}
   */
  final_answer(answer) {
    console.log('Final answer:', answer)
    return answer
  }

  mapTools = () =>  {
    return this._tools.reduce((acc, tool) => {
      acc[tool.id] = tool.tool_function
      return acc
    }, {})
  };
  
} 