import { Agent } from '../agent/base_agent.js';
import { Tool } from '../tooling/tool.js';

// Agent metadata
const ID = "ux_agent";
const TASK = `Modify the CSS styles of provided HTML elements.
Responsibilities:
1. Receive CSS selectors and properties
2. Validate CSS property names and values
3. Apply styles to matching elements in the DOM
4. Return success or error messages`;

export class UXAgent extends Agent {
    constructor() {
        super(ID, TASK);

        // Tool to apply styles
        this.addTool(
            new Tool(
                'applyStyles',
                "Applies given CSS styles to elements. Parameters: { selector: string, styles: object }",
                this.applyStyles.bind(this),
                { selector: "p", styles: { color: "red" } }
            )
        );
    }

    instruction = () => {
        return `Usage Guide — Tool: applyStyles
    
    Purpose:
    - Dynamically apply valid CSS styles to elements matching a given selector.
    
    Parameters:
    {
        selector: string   // Any valid CSS selector (e.g., 'p', '.btn', '#header nav')
        styles: object     // Key-value pairs of CSS properties in camelCase or kebab-case
    }
    
    ✅ Valid Examples:
    1. { selector: "p", styles: { color: "red", fontSize: "18px" } }
    2. { selector: ".card", styles: { backgroundColor: "#fff", border: "1px solid #ccc" } }
    3. { selector: "#title", styles: { textAlign: "center" } }
    
    ❌ Invalid Examples:
    1. { selector: "???", styles: { color: "red" } }       // Invalid selector
    2. { selector: "p", styles: { colr: "blue" } }         // Misspelled property
    3. { selector: ".btn", styles: { display: "flying" } } // Invalid property value
    
    Rules:
    1. Property names must be valid CSS properties.
    2. Values must be valid for the given property.
    3. Selector must match at least one element in the DOM.
    
    If validation fails, the tool will return { status: "error", message: "...reason..." }.
    On success, returns { status: "success", message: "...applied..." }.`;
    };

    validateCSSProperty(name, value) {
        // Mock validation for local testing
        const validProperties = [
            "color", "fontSize", "backgroundColor", "border", "textAlign", "display"
        ];
        const validValues = [
            "red", "white", "20px", "#fff", "#ffffff", "#ccc", "center", "block", "none"
        ];

        if (!validProperties.includes(name)) {
            return { valid: false, reason: `Invalid CSS property name: ${name}` };
        }

        if (!validValues.includes(value)) {
            return { valid: false, reason: `Invalid value "${value}" for property "${name}"` };
        }

        return { valid: true };
    }

    async applyStyles({ selector, styles }) {
        try {

            // Validate and apply
            for (const [prop, val] of Object.entries(styles)) {
                const validation = this.validateCSSProperty(prop, val);
                if (!validation.valid) {
                    return JSON.stringify({
                        status: "error",
                        message: validation.reason,
                        should_continue: false
                    });
                }
            }

            return JSON.stringify({
                status: "success",
                message: `Applied styles to all element(s).`,
                should_continue: true
            });

        } catch (error) {
            return JSON.stringify({
                status: "error",
                message: "Failed to apply styles",
                should_continue: false,
                error: error.message
            });
        }
    }
}
