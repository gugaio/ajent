import { Agent } from './base_agent.js';

const ID = "TriageAgent"
const TASK = "Triage the user to the right agent or tool"

export class TriageAgent extends Agent {
    
    constructor(context, agents, initial_instruction) {
        super(ID, TASK);
        this.context = context;
        this.agents = agents;
        this.initial_instruction = initial_instruction;
    }

    instructions = () => {
        const instructions_to_transfer = this.agents.reduce((acc, agent) => {
            const agent_task_description = `If the task is ${agent.task}, call transfer to agent tool with id ${agent.id}.\n`;
            return acc + agent_task_description;
        }, "");

        const final_instruction = `You are a triage agent. \n
        You goal is to help users execute the right agent or tool \n.
        Always answer in a sentence or less. \n
        The follow are the tasks you can handle and the agent id to transfer for:\n
        ${instructions_to_transfer}
        Below you have a custom and important initial instruction to help following routine with the user:
        ${this.initial_instruction}
        `
        return {instruction: final_instruction, tools: []}
    }
    

}