import { AgentToolOrchestrator } from './agent_tool_orchestrator';
import { Agent } from '../agent/base_agent';

// Mock Agent class
jest.mock('../agent/base_agent');

describe('AgentToolOrchestrator', () => {
  let orchestrator;
  let mockAgent;
  let mockToolCall;

  beforeEach(() => {
    orchestrator = new AgentToolOrchestrator();    
    
    // Setup mock agent
    mockAgent = {
      id: 'agent-1',
      mapTools: jest.fn(),
    };

    const mockToolFunction = jest.fn().mockResolvedValue('success');
    const mapTools = { 'testTool': mockToolFunction };
    mockAgent.mapTools.mockReturnValue(mapTools);

    // Setup default tool call
    
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  
  describe('invokeTool', () => {
    it('should invoke tool function with correct parameters', async () => {

      const funcName = 'testTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: '{"arg1": "value1", "arg2": "value2"}'
        }
      };

      await orchestrator.invokeTool(mockToolCall, mockAgent);

      expect(mockAgent.mapTools()[funcName]).toHaveBeenCalledWith('value1', 'value2');
    });

    it('should return message informing about non-existent tool', async () => {
      const funcName = 'wrongTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: '{"arg1": "value1", "arg2": "value2"}'
        }
      };

      const result = await orchestrator.invokeTool(mockToolCall, mockAgent);
      expect(result).toBe(`Tool id ${mockToolCall.id} with function name ${funcName}  was not found at current agent`);
    });

    it('should handle invalid JSON arguments', async () => {

      console.error = jest.fn();

      const funcName = 'testTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: 'invalid json'
        }
      };

      const result = await orchestrator.invokeTool(mockToolCall, mockAgent);

      expect(result).toBe(`Failed to parse tool arguments for function ${funcName}. Json must be invalid.`);
    });

    it('wrong arguments but valid json should executed tool function with sucess', async () => {
      const funcName = 'testTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: '{"arg2": "value1", "arg4": "value2"}'
        }
      };

      const result = await orchestrator.invokeTool(mockToolCall, mockAgent);
      expect(result).toBe(`success`);
    });

  });

  describe('executeToolCalls', () => {
    it('should execute tool calls and return messages', async () => {
      const funcName = 'testTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: '{"arg1": "value1", "arg2": "value2"}'
        }
      };

      const result = await orchestrator.executeToolCalls([mockToolCall], mockAgent);
      

      expect(result.messages.length).toBe(1);
      expect(result.messages[0].content).toBe('success');
      expect(result.messages[0].role).toBe('tool');
      expect(result.messages[0].tool_call_id).toBe(mockToolCall.id);
    });

    it('should handle tool execution errors', async () => {

      console.error = jest.fn();

      const funcName = 'testTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: '{"arg1": "value1", "arg2": "value2"}'
        }
      };

      const mockError = new Error('Test error');
      mockAgent.mapTools()[funcName].mockRejectedValue(mockError);

      const result = await orchestrator.executeToolCalls([mockToolCall], mockAgent);

      expect(result.messages.length).toBe(1);
      expect(result.messages[0].content).toBe('Error executing tool: Test error');
      expect(result.messages[0].role).toBe('tool');
      expect(result.messages[0].tool_call_id).toBe(mockToolCall.id);
    });

    it('should transfer agent if tool returns an Agent instance', async () => {
      const funcName = 'testTool';

      mockToolCall = {
        id: 'tool-1',
        function: {
          name: funcName,
          arguments: '{"arg1": "value1", "arg2": "value2"}'
        }
      };

      const mockAgentTransfer = new Agent();
      mockAgent.mapTools()[funcName].mockResolvedValue(mockAgentTransfer);

      const result = await orchestrator.executeToolCalls([mockToolCall], mockAgent);

      expect(result.agent).toBe(mockAgentTransfer);
    });

    
  });  

});