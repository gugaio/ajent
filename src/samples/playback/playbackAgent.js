import { Agent } from '../../agent/base_agent';
import { withDescription } from '../../tooling/decorator';

const ID = "playback_agent"
const TASK = "Analyze playback api video information"

export class PlaybackAgent extends Agent {
    constructor() {
        super(ID, TASK);
    }

    instructions = () => {
        if(!this.context["video"]) {
            const instruction = `No video loaded into context.
            You need load a video using the load_video_to_context tool.
            User must provide the video id.
            Ask the user for the video id if not provided yet.
            Then call the tool with the video id as argument.`;
            const tools = [this.load_video_to_context];
            return {instruction, tools}
        }

        const video_available_fields = this._get_video_fields();
        const instruction = `The video loaded into context is ${this.context["video"]["title"]}.
        You can get the video info using the get_video_info tool.
        The tool requires a list of fields to retrieve, the fields must be a string separated by commas.
        The available fields are ${video_available_fields}.
        Provide the fields based on the user request.`;
        const tools = [this.get_video_info]; 
        return {instruction, tools}
    }

    @withDescription("Load a video into the context.")
    load_video_to_context(video_id) {
        this.context["video"] = {
            id: video_id,
            title: "Gladiator",
            description: "Gladiator is a 2000 epic historical action drama film directed by Ridley Scott and written by David Franzoni, John Logan, and William Nicholson.",
            duration: "5 secondsn",
            tags: ["continuation", "denzel"],
            categories: ["war", "war"]
        }
        return `Video ${video_id} loaded to context. The available fields are ${this._get_video_fields()}`;
    }

    @withDescription("Get video info")
    get_video_info(fields) {
        const video = this.context["video"];
        const requested_fields = fields.split(",");
        const available_fields = this._get_video_fields().split(",");
        const invalid_fields = requested_fields.filter(field => !available_fields.includes(field));
        if(invalid_fields.length > 0) {
            return `The fields ${invalid_fields} are not available. Please ask for available fields.`;
        }
        const video_info = requested_fields.reduce((acc, field) => {
            acc[field] = video[field];
            return acc;
        }, {});
        const video_info_str = JSON.stringify(video_info, null, 2);
        return video_info_str;
    }

    _get_video_fields = () => {
        return "id,title,description,duration,tags,categories"
    }

}