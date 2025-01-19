# Ajent

Ajent is a JavaScript library for building conversational agents with tool capabilities. It provides a framework to create, manage, and orchestrate multiple agents that can handle different types of conversations and tasks.

## Features

- 🤖 Create custom agents with specific capabilities
- 🛠 Define and use tools (functions) within agents
- 🔄 Agent orchestration with automatic routing
- ⚛️ React integration support
- 🔌 Extensible architecture
- 🎮 Built-in conversation management

## Installation

```bash
npm install ajent
# or
yarn add ajent
```

## Basic Setup

1. First, configure Babel to support decorators. Create or update your `babel.config.js`:

```javascript
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
  ],
};
```

2. Install required dependencies:

```bash
npm install @babel/core @babel/preset-env @babel/plugin-proposal-decorators
# If using React
npm install @babel/preset-react
```

## Basic Usage

### Creating a Custom Agent

```javascript
import { Agent } from 'ajent';
import { tool } from 'ajent';

class MyCustomAgent extends Agent {
    constructor() {
        super("my_agent", "Handle specific tasks");
    }

    instructions = () => {
        return {
            instruction: "Your custom instructions here",
            tools: [this.myTool1, this.myTool2]
        }
    }

    @tool("Description of tool 1")
    myTool1(param1) {
        // Tool implementation
        return "Result";
    }

    @tool("Description of tool 2")
    myTool2(param1, param2) {
        // Tool implementation
        return "Result";
    }
}
```

### Using the Squad Manager

```javascript
import { Squad } from 'ajent';
import { MyCustomAgent } from './myCustomAgent';

const agents = [new MyCustomAgent()];
const squad = new Squad({
    agents,
    apiToken: 'your-api-token',
    apiUrl: 'your-api-url'
});

// Send a message
const response = await squad.send("Your message here");
```

## React Integration

### Setup for React Projects

1. Install additional dependencies:

```bash
npm install @babel/preset-react
```

2. Update your `babel.config.js`:

```javascript
module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
        ['@babel/plugin-proposal-decorators', { version: '2023-05' }]
    ]
};
```

### Example React Component

```javascript
import React, { useState } from 'react';
import { Squad } from 'ajent';
import { MyCustomAgent } from './myCustomAgent';

function ChatComponent() {
    const [messages, setMessages] = useState([]);
    const [squad] = useState(() => {
        const agents = [new MyCustomAgent()];
        return new Squad({
            agents,
            apiToken: process.env.REACT_APP_API_TOKEN,
            apiUrl: process.env.REACT_APP_API_URL
        });
    });

    const handleSendMessage = async (message) => {
        try {
            const response = await squad.send(message);
            setMessages(prev => [...prev, 
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            ]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            {messages.map((msg, index) => (
                <div key={index}>
                    <strong>{msg.role}:</strong> {msg.content}
                </div>
            ))}
            <input 
                type="text" 
                onKeyPress={e => {
                    if (e.key === 'Enter') {
                        handleSendMessage(e.target.value);
                        e.target.value = '';
                    }
                }}
            />
        </div>
    );
}

export default ChatComponent;
```

## Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_API_TOKEN=your-api-token
REACT_APP_API_URL=your-api-url
```

## Available Agents

### Built-in Agents

- `TriageAgent`: Routes conversations to appropriate specialist agents
- `PlaybackAgent`: Handles video playback analysis and information
- `CustomerServiceAgent`: Handles customer service inquiries (example implementation)

### Creating Custom Agents

1. Extend the base `Agent` class
2. Define tools using the `@tool` decorator
3. Implement the `instructions()` method
4. Add your agent to the Squad

Example:

```javascript
import { Agent, tool } from 'ajent';

class CustomAgent extends Agent {
    constructor() {
        super("custom_agent", "Handle custom tasks");
    }

    instructions = () => ({
        instruction: "Custom instructions",
        tools: [this.customTool]
    });

    @tool("Custom tool description")
    customTool(param) {
        return `Processed ${param}`;
    }
}
```

## API Reference

### Squad

```javascript
new Squad({
    agents,            // Array of agents
    apiToken,         // API token for authentication
    apiUrl,           // API endpoint URL
    triageInstruction // Optional triage instructions
})
```

### Agent

```javascript
class Agent {
    constructor(id, task)
    instructions()
    toolSchemas(tools)
    mapTools()
}
```

### Tool Decorator

```javascript
@tool(description)
```

## Best Practices

1. **Security**:
   - Never expose API tokens in frontend code
   - Implement proper error handling
   - Use environment variables for sensitive data

2. **Performance**:
   - Implement debouncing for message sending
   - Use memoization where appropriate
   - Handle loading states

3. **Error Handling**:
   - Implement proper error boundaries
   - Provide user feedback
   - Log errors appropriately

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
