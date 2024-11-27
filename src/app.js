import {ConversationManager} from './index.js';
import {PlaybackAgent} from './samples/playback/playbackAgent.js';


const initial_instruction = 'You are a playback api analyst';

const agents = [new PlaybackAgent()];

const client = new ConversationManager(initial_instruction, 'http://localhost:5000', agents);

let messages = [ {content: 'I want to analyse a playback video', role: 'user'}];

let message = await client.processConversation(messages);

messages = messages.concat(message);

let newMEssage  = [ {content: 'Load video 999 to context', role: 'user'}];
messages = messages.concat(newMEssage);

message = await client.processConversation(messages);

messages = messages.concat(message);
newMEssage  = [ {content: 'What the duration and description of video?', role: 'user'}];
messages = messages.concat(newMEssage);

message = await client.processConversation(messages);

console.log('Response:', message);