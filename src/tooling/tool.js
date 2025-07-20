export  class Tool {
  constructor(id, description, tool_function, sample_input = null) {
    this.id = id;
    this.description = description;
    this.tool_function = tool_function;
    this.sample_input = sample_input;
  }
}