import { AgenticLoop } from './agentic_loop.js';
import { CompletionService } from './service/completion_service.js';
import { AgentToolOrchestrator } from './infra/agent_tool_orchestrator.js';
import { Agent } from './agent/base_agent.js';

jest.mock('./service/completion_service.js');
jest.mock('./infra/agent_tool_orchestrator.js');

describe('AgenticLoop', () => {
  let agenticLoop;
  let mockAgents;
  let mockCompletionService;
  let mockToolOrchestrator;

  beforeEach(() => {
    mockCompletionService = new CompletionService();
    mockToolOrchestrator = new AgentToolOrchestrator();

    mockAgents = [
      new Agent('agent-1', 'Task 1'),
      new Agent('agent-2', 'Task 2')
    ];

    agenticLoop = new AgenticLoop({
      apiUrl: 'http://api.test',
      xApiToken: 'test-token',
      agents: mockAgents,
      maxSteps: 10,
      enableStream: false,
      forceTools: false,
      model: 'gpt-4',
      llmName: 'openai',
      llmTemperature: 0.7
    });
  });

  test('initializes with provided agents', () => {
    expect(agenticLoop._agents).toEqual(mockAgents);
    expect(agenticLoop.current_agent).toBe(mockAgents[0]);
  });

  test('detects reasoning state correctly', () => {
    expect(agenticLoop.isReasoning()).toBe(false);
    agenticLoop.current_agent = { id: 'PlannerAgent' };
    expect(agenticLoop.isReasoning()).toBe(true);
  });
});
