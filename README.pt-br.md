# Ajent

- [Read in English](README.md)

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

## Uso básico

### Criando um Agente Personalizado

```javascript
import { Agent } from 'ajent';
import { Tool } from '../../tooling/tool.js';

class MyCustomAgent extends Agent {
    constructor() {
        super("my_agent", "Handle specific tasks");
        this.addTool(new Tool('myTool1', "Descrição da tool 1", this.myTool1)); 
    }

    instruction = () => {
        return "Escreve aqui suas instructions...";
    }

    async myTool1(param1) {
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

## Observação sobre o uso do api token
Para inicializar o Squad, é necessário fornecer seu api token. O token pode ser obtido registrando um endpoint no site www.ajent.com.br, onde você receberá um apiToken para uso seguro. Isso é necessário para não expor seu llm token no front de sua aplicação.

Caso precise de uma solução mais rápida para testes, você pode utilizar diretamente o token LLM (llmToken), como mostrado abaixo:

```javascript
const squad = new Squad({
    agents,
    llmToken: 'your-llm-token'
});
```

MAS ATENÇÃO: o uso do llmToken diretamente no cliente não é seguro e não deve ser feito em ambientes de produção, pois expõe o token de forma pública. Para produção, recomendamos fortemente a criação de um endpoint seguro no www.ajent.com.br.

Como alternativa, você também pode criar seu próprio serviço proxy para interagir com as LLMs. Para facilitar essa implementação, disponibilizamos uma biblioteca open source em: https://github.com/gugaio/ajent-py-server-lib.



## Integração com React

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

## API Reference

### Squad

```javascript
new Squad({
    agents,            // Array of agents
    apiToken,         // API token for authentication
    triageInstruction // Optional triage instructions
})
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
