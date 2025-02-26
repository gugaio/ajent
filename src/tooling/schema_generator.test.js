import {toolSchemaGenerator, schemaGenerator} from './schema_generator.js';
import { Tool } from './tool.js';


const tool_with_one_parameter = (video_id) => {
  return `Loading video ${video_id} to context`;
};

const tool_without_parameter = () => {
  return `Loading video to context`;
};

const tool_with_two_parameters = (video_id, video_url) => {
  return `Loading video ${video_id} from ${video_url} to context`;
};

it('function with one parameter', () => {
  
  const toolFuncLabel = "load_video_to_context";
  const toolDescription = "Load a video into the context";
  const tool = new Tool(toolFuncLabel, toolDescription, tool_with_one_parameter);
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
}
);

it('function without a parameter', () => {
    
    const toolFuncLabel = "tool_without_parameter";
    const toolDescription = "Load a video into the context";
    const tool = new Tool(toolFuncLabel, toolDescription, tool_without_parameter);
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
    
    const toolFuncLabel = "tool_with_two_parameters";
    const toolDescription = "Load a video into the context";
    const tool = new Tool(toolFuncLabel, toolDescription, tool_with_two_parameters);

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
      
      const toolFuncLabel1 = "tool_with_two_parameters";
      const toolDescription1 = "Load a video of two parameter into the context";
      const tool1 = new Tool(toolFuncLabel1, toolDescription1, tool_with_two_parameters);
  
      const toolFuncLabel2 = "tool_without_parameter";
      const toolDescription2 = "Load a video without parameter into the context";
      const tool2 = new Tool(toolFuncLabel2, toolDescription2, tool_without_parameter);
  
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