import { Tool } from '../tooling/tool.js';

export class Agent {
  constructor(id, task, tools = [], context = {}) {
    this.id = id
    this.task = task
    this.context = context
    this._tools = tools.concat([new Tool('transfer_to_agent', 'Transfer to an agent ' + id +'. The tool function expect the id as string', this.transfer_to_agent)])
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

  transfer_to_agent (id){
    if(!this.context["agents"][id]) {
      return `Agent with id ${id} not found in the context.`
    }
    const new_agent = this.context["agents"][id]
    return new_agent
  }

  mapTools = () =>  {
    return this._tools.reduce((acc, tool) => {
      acc[tool.id] = tool.tool_function
      return acc
    }, {})
  };
  
} 