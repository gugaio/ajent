import { Agent } from '../../agent/base_agent.js';
import { Tool } from '../../tooling/tool.js';

const ID = "playback_agent";
const TASK = "Analyze playback api video information";

export class PlaybackAgent extends Agent {
    constructor() {
        super(ID, TASK);
           this.addTool(
            new Tool(
                'get_video_info',
                "Get video info of the video. Provide an object with a 'video' field containing the video ID.",
                this.get_video_info,
                {video_id: "9999"}
            ));        
    }

    instruction = () => {
        if(!this.context["video"]) {
            const instruction = `No video loaded into context.
            You need load a video using the get_video_info tool, providing an object with a 'video' field containing the video ID.`;
            return instruction;
        }

        const video_info_str = JSON.stringify(this.context["video"], null, 2);

        const instruction = `The video loaded into context is ${this.context["video"]["title"]}.
        Complete info ${video_info_str}.`;
        return instruction;
    };


    async get_video_info({video_id}) {
        this.context["video"] = {
            id: video_id,
            title: "Gladiator",
            description: "Gladiator is a 2000 epic historical action drama film directed by Ridley Scott and written by David Franzoni, John Logan, and William Nicholson.",
            duration: "5 seconds",
            tags: ["continuation", "denzel"],
            categories: ["war", "war"]
        };
        const video_info_str = JSON.stringify(this.context["video"], null, 2);
        return video_info_str;
    }

    _get_video_fields = () => {
        return "id,title,description,duration,tags,categories";
    };

}