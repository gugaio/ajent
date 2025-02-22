import {Squad} from './index.js';
import {PlaybackAgent} from './samples/playback/playbackAgent.js';

console.log('Starting conversation manager');

const initial_instruction = 'You are a playback api analyst';

const agents = [new PlaybackAgent()];

let squadParams = {
    agents: agents,
    apiToken: "xxxxxxxxx-xxxxxx-xxxx"
  }

const squad = new Squad(squadParams);


let message = await squad.send('I want to analyse a playback video');
console.log('Response:', message);

message = await squad.send('Load video 999 to context');

console.log('Response:', message);

message = await squad.send('What the duration and description of video?');

console.log('Response:', message);