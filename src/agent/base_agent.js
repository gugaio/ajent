import toolSchemaGenerator from '../tooling/schema_generator';
import { tool, getDescribedFunctions } from '../tooling/decorator';

export class Agent {
  constructor(id, task, context = {}) {
    this.id = id
    this.task = task
    this.context = context
  }

  instructions = () => {
    return `The agent with id ${this.id} is a base agent.`, []
  }

  @tool("Transfer to an agent.")
  transfer_to_agent (id){
    const new_agent = this.context["agents"][id]
    return new_agent
  }

  toolSchemas = (lsttools) => {
    return lsttools.map(tool => toolSchemaGenerator(tool));
  }

  mapTools = () =>  {
    return getDescribedFunctions(this)
  };
  
} 