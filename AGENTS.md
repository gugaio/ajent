# AGENTS.md - Coding Guidelines for Ajent

## Commands

### Testing
- Run all tests: `npm test`
- Run single test file: `npm test -- src/agent/base_agent.test.js`
- Run specific test: `npm test -- -t "test_name"`

### Build & Development
- Build for production: `npm run build` or `npm run production`
- Development server: `npm run dev`
- Start built app: `npm start`

### Linting
- Run linter: `npm run lint`
- Auto-fix issues: `npm run lint:fix`

---

## Code Style Guidelines

### Module System
- Use ES modules (`type: "module"` in package.json)
- All imports/exports use .js extensions

### Imports
```javascript
// Named imports from same directory
import { Agent } from './agent/base_agent.js';
import { Tool } from '../tooling/tool.js';

// Default imports
import Logger from '../utils/logger.js';
```

### Naming Conventions
- **Classes**: PascalCase (`Agent`, `Tool`, `Squad`, `AgenticLoop`)
- **Methods/Functions**: camelCase (`executeToolCalls`, `addTool`, `processMessage`)
- **Variables/Constants**: camelCase (`apiUrl`, `xApiToken`, `maxSteps`)
- **Tool IDs**: snake_case (`transfer_to_agent`, `final_answer`)
- **Private methods/fields**: underscore prefix (`_agents`, `_context`, `_sendToCompletionService`)

### Class Structure
```javascript
export class ClassName {
  constructor(param1, param2, options = {}) {
    this._privateField = param1;
    this.publicField = param2;
  }

  publicMethod() {
    return this._privateMethod();
  }

  _privateMethod() {
    // Implementation
  }
}
```

### Async Functions
- Use async/await consistently
- Destructure response objects when possible
- Always wrap in try-catch for error handling

```javascript
async method() {
  try {
    const { messages, agent } = await this._orchestrator.executeToolCalls(calls, this._agent);
    return messages;
  } catch (error) {
    logger.error('Operation failed', error);
    throw new Error(`Context: ${error.message}`);
  }
}
```

### Error Handling
- Wrap async operations in try-catch
- Wrap errors with context: `throw new Error(\`Description: ${error.message}\`)`
- Use Logger for structured logging: `logger.error('Message', error)`
- Return error objects for non-critical failures: `_createErrorResponse(id, msg)`

### Comments & JSDoc
- Use JSDoc for public methods with @param and @returns
- Keep comments concise and Portuguese/English as appropriate

```javascript
/**
 * Executes tool calls and handles agent transfers
 * @param {Array<ToolCall>} toolCalls - Array of tool calls
 * @param {Agent} agent - Current agent
 * @returns {Promise<{messages: Array<Message>, agent: Agent}>}
 */
async executeToolCalls(toolCalls, agent) {
  // Implementation
}
```

### Testing
- Use Jest: `describe`/`test` blocks
- `beforeEach`/`afterEach` for setup/teardown
- Mock functions: `jest.fn()`, `jest.mock()`
- Clear mocks in `afterEach`

```javascript
describe('ClassName', () => {
  let instance;

  beforeEach(() => {
    instance = new ClassName();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('method works correctly', () => {
    expect(instance.method()).toBe(expected);
  });
});
```

### Tools
- Tools are created using the `Tool` class with id, description, and function
- Provide `sample_input` object for automatic schema generation
- Tool functions receive a single destructured object parameter

```javascript
new Tool(
  'tool_name',
  'Tool description',
  ({ param1, param2 }) => {
    // Implementation
    return result;
  },
  { param1: 'sample', param2: 'sample' }  // sample_input for schema
)
```

### Linting Rules
- Semicolons required: Always use `;`
- no-console: Off (allowed)
- no-unused-vars: Warning level

### Project Structure
- `src/agent/` - Agent classes (base_agent.js, planner_agent.js)
- `src/infra/` - Infrastructure (agent_tool_orchestrator.js)
- `src/service/` - Services (completion_service.js)
- `src/tooling/` - Tool utilities (tool.js, schema_generator.js)
- `src/utils/` - Utilities (logger.js)
- `src/prompts/` - Prompt templates
- `src/samples/` - Example agents
