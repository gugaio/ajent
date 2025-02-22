import { Agent } from './base_agent.js';
import Tool from '../tooling/tool.js';


describe('Agent class', () => {

  let agent;
  let context;

  beforeEach(() => {
    context = {
      agents: {
        'agent_2': { id: 'agent_2', task: 'task_2' }
      }
    };
    agent = new Agent('agent_1', 'task_1', [], context);
  });

  test('instruction method', () => {
    expect(agent.instruction()).toBe('The agent with id agent_1 is a base agent.');
  });

  test('tools method with default transfer_to_agent', () => {
    expect(agent.tools()).toEqual([new Tool('transfer_to_agent', 'Transfer to an agent', agent.transfer_to_agent)]);
  });

  test('addTool method', () => {
    const tool = new Tool('tool_1', 'Tool 1', () => {});
    agent.addTool(tool);
    expect(agent.tools()).toEqual([new Tool('transfer_to_agent', 'Transfer to an agent', agent.transfer_to_agent), tool]);
  });

  test('transfer_to_agent method', () => {
    const transferredAgent = agent.transfer_to_agent('agent_2');
    expect(transferredAgent).toEqual({ id: 'agent_2', task: 'task_2' });
  });

  test('mapTools method', () => {
    const toolMap = agent.mapTools();
    expect(toolMap).toHaveProperty('transfer_to_agent');
    expect(typeof toolMap['transfer_to_agent']).toBe('function');
  });

});