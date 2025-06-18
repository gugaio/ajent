import { toolSchemaGenerator, schemaGenerator } from './schema_generator.js';
import { Tool } from './tool.js'; // Certifique-se de que Tool está exportando corretamente

const tool_with_one_parameter = (video_id) => {
  return `Loading video ${video_id} to context`;
};

const tool_without_parameter = () => {
  return `Loading video to context`;
};

const tool_with_two_parameters = (video_id, video_url) => {
  return `Loading video ${video_id} from ${video_url} to context`;
};

describe('toolSchemaGenerator', () => {
  it('function with one parameter', () => {
    const tool = new Tool('load_video_to_context', 'Load a video into the context', tool_with_one_parameter);
    const schema = toolSchemaGenerator(tool);
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
  });

  it('function without a parameter', () => {
    const tool = new Tool('tool_without_parameter', 'Load a video into the context', tool_without_parameter);
    const schema = toolSchemaGenerator(tool);
    expect(schema).toEqual({
      type: 'function',
      function: {
        name: 'tool_without_parameter',
        description: 'Load a video into the context',
        parameters: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    });
  });

  it('function with two parameters', () => {
    const tool = new Tool('tool_with_two_parameters', 'Load a video into the context', tool_with_two_parameters);
    const schema = toolSchemaGenerator(tool);
    expect(schema).toEqual({
      type: 'function',
      function: {
        name: 'tool_with_two_parameters',
        description: 'Load a video into the context',
        parameters: {
          type: 'object',
          properties: {
            video_id: {
              type: 'string',
              description: 'Description for parameter: video_id.',
            },
            video_url: {
              type: 'string',
              description: 'Description for parameter: video_url.',
            },
          },
          required: ['video_id', 'video_url'],
        },
      },
    });
  });

  it('function schemaGenerator with multiple tools', () => {
    const tool1 = new Tool('tool_with_two_parameters', 'Load a video of two parameter into the context', tool_with_two_parameters);
    const tool2 = new Tool('tool_without_parameter', 'Load a video without parameter into the context', tool_without_parameter);

    const schema = schemaGenerator([tool1, tool2]);
    expect(schema).toEqual([
      {
        type: 'function',
        function: {
          name: 'tool_with_two_parameters',
          description: 'Load a video of two parameter into the context',
          parameters: {
            type: 'object',
            properties: {
              video_id: {
                type: 'string',
                description: 'Description for parameter: video_id.',
              },
              video_url: {
                type: 'string',
                description: 'Description for parameter: video_url.',
              },
            },
            required: ['video_id', 'video_url'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'tool_without_parameter',
          description: 'Load a video without parameter into the context',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
    ]);
  });
});
