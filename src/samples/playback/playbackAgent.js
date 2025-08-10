import { Agent } from '../../agent/base_agent.js';
import { Tool } from '../../tooling/tool.js';

const ID = "playback_agent";
const TASK = `Analyze and provide detailed insights about video content from the Playback API. 
Responsibilities:
1. Retrieve video metadata using video_id
2. Analyze video information including title, description, duration, tags and categories
3. Provide summaries and answer questions about the video content
4. Maintain context of the currently loaded video`;

export class PlaybackAgent extends Agent {
    constructor() {
        super(ID, TASK);
        
        // Tool para carregar vídeo
        this.addTool(
            new Tool(
                'get_video_info',
                "ONLY FOR INITIAL LOAD. Retrieves complete video metadata. Parameters: {video_id: string} (required)",
                this.get_video_info.bind(this),
                {video_id: "9999"}
            ));
        
        // Tools para ações com o vídeo carregado
        this.addTool(
            new Tool(
                'analyze_video_content',
                "Analyzes the currently loaded video's content. No parameters required.",
                this.analyze_video_content.bind(this),
                {}
            ));
        
        this.addTool(
            new Tool(
                'answer_video_question',
                "Answers specific questions about the video. Parameters: {question: string} (required)",
                this.answer_video_question.bind(this),
                {question: "What is this video about?"}
            ));
        
        this.hasLoadedVideo = false;
        this.currentAnalysis = null;
    }

    instruction = () => {
        if (!this.hasLoadedVideo) {
            return "REQUIRED: Call get_video_info ONCE with {video_id}";
        }
        return `CURRENT VIDEO: ${this.context["video"].id}\n` +
               `STRICT RULES:\n` +
               `1. NEVER call get_video_info again\n` +
               `2. Use analyze_video_content for analysis`;
    };

    async get_video_info({video_id}) {
        if (this.hasLoadedVideo) {
            return JSON.stringify({
                status: "error",
                message: "Video already loaded. Use analyze_video_content instead.",
                should_continue: false,
                required_action: "Analyze existing video or request new analysis"
            });
        }

        try {
            this.context["video"] = {
                id: video_id,
                title: `Video ${video_id}`,
                duration: "2h 30m",
                // ... other fields
            };
            this.hasLoadedVideo = true;
            
            return JSON.stringify({
                status: "success",
                message: "Video loaded ONCE. Do not call this again.",
                should_continue: true,
                data: this.context["video"]
            });
        } catch (error) {
            return JSON.stringify({
                status: "error",
                message: "Load failed",
                should_continue: false,
                error: error.message
            });
        }
    }

    async analyze_video_content() {
        if (!this.hasLoadedVideo) {
            return JSON.stringify({
                status: "error",
                message: "No video loaded",
                should_continue: false,
                required_action: "Call get_video_info first"
            });
        }

        try {
            const video = this.context["video"];
            // Análise simulada baseada nos metadados
            this.currentAnalysis = {
                summary: `The video "${video.title}" appears to be about ${video.description.substring(0, 50)}...`,
                mainTopics: video.categories,
                sentiment: "neutral",
                keyWords: video.tags
            };

            return JSON.stringify({
                status: "success",
                message: "Video analysis completed",
                should_continue: true,
                data: this.currentAnalysis
            });
        } catch (error) {
            return JSON.stringify({
                status: "error",
                message: "Analysis failed",
                should_continue: true,
                error: error.message
            });
        }
    }

    async answer_video_question({question}) {
        if (!this.hasLoadedVideo) {
            return JSON.stringify({
                status: "error",
                message: "No video loaded",
                should_continue: false,
                required_action: "Call get_video_info first"
            });
        }

        try {
            const video = this.context["video"];
            // Resposta simulada baseada na pergunta
            let answer;
            
            if (question.toLowerCase().includes("duration")) {
                answer = `The video duration is ${video.duration}.`;
            } else if (question.toLowerCase().includes("about")) {
                answer = `The video "${video.title}" is about: ${video.description}`;
            } else if (question.toLowerCase().includes("tags") || question.toLowerCase().includes("categories")) {
                answer = `Tags: ${video.tags.join(', ')}\nCategories: ${video.categories.join(', ')}`;
            } else {
                answer = `I can answer questions about the video "${video.title}". Based on your question "${question}", here's what I know: ${video.description.substring(0, 100)}...`;
            }

            return JSON.stringify({
                status: "success",
                message: "Question answered",
                should_continue: true,
                data: {
                    question: question,
                    answer: answer
                }
            });
        } catch (error) {
            return JSON.stringify({
                status: "error",
                message: "Failed to answer question",
                should_continue: true,
                error: error.message
            });
        }
    }
}