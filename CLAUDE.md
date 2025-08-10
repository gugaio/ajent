Ajent é uma biblioteca JavaScript para construção de agentes conversacionais com capacidades de uso de ferramentas. Ela oferece um framework para criar, gerenciar e orquestrar múltiplos agentes, cada um com habilidades específicas para lidar com diferentes tipos de conversas e tarefas.

Principais Funcionalidades
Criação de agentes customizados com capacidades específicas

Definição e uso de ferramentas (funções) dentro dos agentes

Orquestração automática de agentes com roteamento inteligente das interações

Principais classes:

agentic_loop.js responsavel pelo loop agentico
agent_tool_orchestrator.js responsavel por percorrer as tool calls solicitados e fazer a execuçao de cada uma
diretorio tooling possui a classe tool, o schema generator.