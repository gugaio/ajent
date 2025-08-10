import { Squad } from './index.js';
import { UXAgent } from './samples/uxAgent.js';

console.log('Starting UX Agent test');

// Cria instância do agente
const agents = [new UXAgent()];

// Pega token da env
const ajentApiToken = process.env.AJENT_API_TOKEN;
if (!ajentApiToken || ajentApiToken === '') {
    console.error('AJENT_API_TOKEN is not set. Please pass it as an environment variable. Sample: AJENT_API_TOKEN=your_token npm start');
    process.exit(1);
}

// Parâmetros para Squad
let squadParams = {
    agents: agents,
    apiToken: ajentApiToken,
    enableStream: true,
    apiUrl: 'http://localhost:5000',
    llmName: 'openai',
    model: 'gpt-4.1',
    llmTemperature: 0.1,
};

const squad = new Squad(squadParams);

let message = null;

console.log('Sending test messages to UXAgent');

// 1️⃣ Mensagem para mostrar instruções
message = await squad.send('Show me how to use the applyStyles tool');
console.log('\nInstruction response:\n', message, '\n');

// 2️⃣ Aplicar um estilo válido
message = await squad.send(
    'Apply styles with { selector: "p", styles: { color: "white", fontSize: "20px" } }');
console.log('\nApply styles (valid) response:\n', message, '\n');


// 4️⃣ Testar propriedade inválida
message = await squad.send(
    'Apply styles with { selector: "p", styles: { colr: "green" } }');
console.log('\nApply styles (invalid property) response:\n', message, '\n');
