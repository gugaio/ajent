import toolSchemaGenerator from './schema_generator';

const load_video_to_context = (video_id) => {
  /**
     * Load a video into the context!!
     * @param {string} video_id - The ID of the video to load.
     * @returns {string} A message indicating the video has been loaded.
     */
  return `Loading video ${video_id} to context`;};

test('function with a parameter', () => {
  
  const schema = toolSchemaGenerator(load_video_to_context);
  expect(schema).toEqual({
    type: 'function',
    function: {
      name: 'load_video_to_context',
      description: 'Load a video into the context!! @param {string} video_id - The ID of the video to load. @returns {string} A message indicating the video has been loaded.',
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