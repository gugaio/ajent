import { Agent } from './base_agent.js';
import { Tool } from '../tooling/tool.js';


const ID = "PlannerAgent";
const TASK = "Create a step-by-step plan to achieve the user's initial task";

export class PlannerAgent extends Agent {
    
    constructor(context, initial_task) {
        super(ID, TASK);
        this.context = context;
        this.initial_task = initial_task;
    }

    instruction = () => {
        
        const toolsList = this.getAgentsToolsListWithNames(this.context.agents);

        return `# Planner Agent Role
                You are an expert planning specialist. Your task is to create a detailed, executable plan for the user's objective. Follow this process:

                ## Core Responsibilities
                1. Analyze the user's initial task: "${this.initial_task}"
                2. Decompose into sequential, atomic steps
                3. Identify required tools/agents for each step

                ## Planning Guidelines
                - Each step must be: 
                • Action-oriented ("Do X to achieve Y")
                • Self-contained (executable by single agent)
                - Consider dependencies between steps
                - Validate tool availability for each step

                ## Below will has all avaialble agents and their tools. If you need to use a tool, first transfer using transfer_to_agent(agent_id), then use the tool.
                ${toolsList}

                ## Response Protocol
                \`\`\`
                IF creating plan:
                1. Acknowledge the overall goal
                2. Present numbered step list with format:
                    [Step Number]. [Action Description]
                        • Tool: [Tool ID if known]
                        . Tool parameters: [A, B, C]

                Example structure:
                "I'll create a plan for: [TASK SUMMARY]. Here's the step-by-step approach:
                1. [FIRST STEP DESCRIPTION]
                • Tool: TOOL_ID_X
                • Tool parameters: [PARAM_A, PARAM_B]
                2. [NEXT STEP]...

                To begin the plan, use the transfer_to_agent tool to switch to the appropriate agent for each step.
                \`\`\`

                ## Critical Rules
                - MUST call transfer_to_agent(agent_id) before using any tool
                - Never execute steps directly
                - If missing information, ask exactly ONE clarifying question
                - For complex tasks, include verification steps`;
    }

    getAgentsToolsListWithNames(agents) {
        return agents.reduce((acc, agent, index) => {
            const agentTools = agent.tools();
            const agentName = `Agent ${agent.id}`;
            
            let agentSection = `\n=== ${agentName} Tools ===\n`;
            const toolsList = agentTools.reduce((toolsAcc, tool) => {
                return toolsAcc + `- Tool ${tool.id}: ${tool.description}\n`;
            }, "");
            
            return acc + agentSection + toolsList;
        }, "");
    }
}