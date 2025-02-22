import {toolSchemaGenerator} from './schema_generator.js';


const load_video_to_context = (video_id) => {
  return `Loading video ${video_id} to context`;
};

test('function with a parameter', () => {
  
  const toolDescription = "Load a video into the context";
  const schema = toolSchemaGenerator(load_video_to_context, toolDescription);
  expect(schema).toEqual({
    type: 'function',
    function: {
      name: 'load_video_to_context',
      description: 'Load a video into the context',
      parameters: {
        type: 'object',
        properties: {
          video_id: {
            type: 'string',
            description: 'Description for parameter: video_id.',
          },
        },
        required: ['video_id'],
      },
    },
  });
}
);