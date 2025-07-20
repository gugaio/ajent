import {Squad} from './index.js';
import {PlaybackAgent} from './samples/playback/playbackAgent.js';

console.log('Starting conversation manager');

const agents = [new PlaybackAgent()];

//get token from env
const ajentApiToken = process.env.AJENT_API_TOKEN;
if(!ajentApiToken || ajentApiToken === '') {
    console.error('AJENT_API_TOKEN is not set. Please pass it as an environment variable. Sample: AJENT_API_TOKEN=your_token npm start');
    process.exit(1);
}

let squadParams = {
    agents: agents,
    apiToken: ajentApiToken,
    model: 'gpt-4.1',
    enableStream: true
  };

const squad = new Squad(squadParams);

const streamCallback = (content, isReasoning) => {
    console.log('Stream message:', content, isReasoning ? '(reasoning)' : '(content)');
};


let message = null;


console.log('Starting conversation manager');
message = await squad.send('I want to analyse the playback video api', {createPlanningTask:true, streamCallback });

console.log(message + '\n');

message = await squad.send('What duration of video 999', {createPlanningTask:true, streamCallback});

console.log(message + '\n');