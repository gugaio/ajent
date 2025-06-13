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
    return `You are an expert assistant who can solve any task using tool calls. 
    You will be given a task to solve as best you can, using the tools available.

    You must always use a tool call to continue your reasoning — you may not output freeform content or questions directly unless it is returned by a tool.

    # Tool Call Guidelines
    - Use the "transfer_to_agent" tool to transfer the user to another agent.
    - Use the "final_answer" tool to indicate that you have completed your reasoning and are ready to return a final response to the user.
    - Use the "final_answer" tool to ask the user for more information when you need clarification or missing details.

    ⚠️ Important:
    - Do not write questions or outputs directly in the message content. Instead, **use the "final_answer" tool** to deliver your message or request for information.
    - If you need the user to provide input (e.g., “Please provide the video ID you want to analyze”), do not write it in a normal message — instead, call the "final_answer" tool with that message.

    Your reasoning must end with a tool call, not a regular message.`
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
    return answer
  }

  mapTools = () =>  {
    return this._tools.reduce((acc, tool) => {
      acc[tool.id] = tool.tool_function
      return acc
    }, {})
  };
  
} 