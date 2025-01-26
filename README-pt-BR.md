# Ajent

Ajent é uma framework JavaScript para construir agentes conversacionais com capacidades de ferramentas. Fornece um framework para criar, gerenciar e orquestrar múltiplos agentes que podem lidar com diferentes tipos de conversas e tarefas.

## Recursos

- 🤖 Crie agentes personalizados com capacidades específicas
- 🛠 Defina e use ferramentas (funções) dentro dos agentes
- ⚛️ Suporte para integração com React
- 🔌 Arquitetura extensível
- 🎮 Gerenciamento de conversação integrado

## Instalação

```bash
npm install ajent
# or
yarn add ajent
```

## Configuração Básica

1. Primeiro, configure o Babel para suportar decorators. Crie ou atualize seu `babel.config.js`:

```javascript
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { version: '2023-05' }],
  ],
};
```

2. Instale as dependências necessárias:

```bash
npm install @babel/core @babel/preset-env @babel/plugin-proposal-decorators
# If using React
npm install @babel/preset-react
```

## Uso básico

### Criando um Agente Personalizado

```javascript
import { Agent } from 'ajent';
import { tool } from 'ajent';

class MyCustomAgent extends Agent {
    constructor() {
        super("my_agent", "Handle specific tasks");
    }

    instructions = () => {
        return {
            instruction: "Escreve aqui suas instructions...",
            tools: [this.myTool1, this.myTool2]
        }
    }

    @tool("Descrição da tool 1")
    myTool1(param1) {
        // Tool implementation
        return "Result";
    }

    @tool("Descrição da tool 2")
    myTool2(param1, param2) {
        // Tool implementation
        return "Result";
    }
}
```

### Usando o Squad Manager

```javascript
import { Squad } from 'ajent';
import { MyCustomAgent } from './myCustomAgent';

const agents = [new MyCustomAgent()];
const squad = new Squad({
    agents,
    apiToken: 'your-api-token'
});

// Send a message
const response = await squad.send("Your message here");
```

## Integração com React

### Setup para projetos React

1. Instale dependências adicionais:

```bash
npm install @babel/preset-react
```

2. Atualize seu `babel.config.js`:

```javascript
module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
        ['@babel/plugin-proposal-decorators', { version: '2023-05' }]
    ]
};
```

### Examplo de uso com um React Component

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
            apiToken: process.env.AJENT_API_TOKEN
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

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do seu projeto:

```env
AJENT_API_TOKEN=your-api-token
```

## API Reference

### Squad

```javascript
new Squad({
    agents,            // Array of agents
    apiToken,         // API token for authentication
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
   - Nunca exponha tokens de API no código frontend
   - Implemente tratamento de erros adequado
   - Use variáveis de ambiente para dados sensíveis

2. **Performance**:
   - Implemente debouncing para envio de mensagens
   - Use memoização quando apropriado
   - Trate estados de carregamento

3. **Error Handling**:
   - Implemente limites de erro adequados
   - Forneça feedback ao usuário
   - Registre erros adequadamente

## Contribuindo

Contribuições são bem-vindas! Por favor, leia nosso [Contributing Guide](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo de envio de pull requests.

## Licença

Este projeto é licenciado sob a Licença ISC - veja o arquivo [LICENSE](LICENSE) para detalhes.
