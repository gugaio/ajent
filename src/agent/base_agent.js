import { Tool } from '../tooling/tool.js';


const INSTRUCTION_WITH_FINAL_ANSWER = `You are an expert assistant who can solve any task using tool calls. 
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

const INSTRUCTION_WITHOUT_FINAL_ANSWER = `You are an expert assistant who can solve any task using tool calls when necessary.
You will be given a task to solve as best you can, using the available tools strategically.

# Response Guidelines
- You can provide direct text responses for explanations, clarifications, and general assistance
- Use tool calls when you need to perform specific actions, gather information, or transfer to other agents
- Continue your reasoning naturally - you don't need to force tool calls if direct text is more appropriate

# Tool Call Guidelines
- Use the "transfer_to_agent" tool to transfer the user to another agent when specialized help is needed
- Use tool calls to perform actions like searching, calculating, or retrieving information
- Provide clear explanations before and after tool calls to maintain context

# When to Use Tools vs Text
**Use tools when:**
- You need to search for current information
- You need to perform calculations or data processing
- You need to transfer to a specialized agent
- You need to execute specific actions

**Use direct text when:**
- Explaining concepts or providing educational content
- Asking for clarification or more details
- Providing analysis or recommendations based on available information
- Engaging in conversational dialogue

# Response Flow
- Start with direct text explanation when appropriate
- Use tools as needed during your reasoning process
- Conclude with direct text unless a tool call is specifically required for the final step

Your goal is to be helpful and natural in your responses while using tools strategically to enhance your capabilities.`


export class Agent {
  constructor(id, task, tools = [], context = {}) {
    this.id = id
    this.task = task
    this.context = context
    this._tools = tools.concat([
      new Tool('transfer_to_agent', 'Transfer to an agent using their ID. The function expects an object like: { id: "agent-id" }.', this.transfer_to_agent),
       ])
  }

  useFinalAnswerTool(){
    this._tools.push(new Tool('final_answer', 'Use this tool to indicate that the agent has reached the end of its reasoning loop and is ready to provide a final response.', this.final_answer))
  }

  base_instruction = () => {
    if(this.context.enableStream){
      return INSTRUCTION_WITHOUT_FINAL_ANSWER;
    }else{
      return INSTRUCTION_WITH_FINAL_ANSWER;
    }
    
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


  transfer_to_agent({id}) {
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
  final_answer({answer}) {
    return answer
  }

  mapTools = () =>  {
    return this._tools.reduce((acc, tool) => {
      acc[tool.id] = tool.tool_function
      return acc
    }, {})
  };
  
} 