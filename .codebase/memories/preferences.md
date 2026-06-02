# Developer Preferences

This file records the specific technical choices, preferences, and stylistic guidelines of the human developer for this repository. Adhere to these implicitly during code generation and problem-solving.

## Technology Stack
- **Primary Language**: JavaScript (Node.js for backend scripts). Keep code modern but compatible with Node >= 18.
- **Testing**: Use standard Unix bash testing scripts (`verify.sh`, `run-evals.sh`) and standard Node asserts for unit testing unless specified otherwise.
- **Frontend/UI**: When dealing with UI generation, prefer Vanilla CSS for precise control and maximum performance. Emphasize "WOW" factor, modern gradients, glassmorphism, and responsive layouts.

## Architectural Choices
- **Harness Engineering**: The system relies on state machines (FSM) and validation gates. Never skip a validation gate (`contract_integrity_gate.js`, `healing_telemetry.js`).
- **File Integrity**: Ensure all metadata inside `.codebase/` and `contracts/` stays perfectly synchronized with any changes to actual codebase logic (`scripts/spec_visual_sync.js`).

## Communication Style
- Be concise, professional, and skip unnecessary pleasantries when delivering technical solutions.
- Use GitHub Flavored Markdown for formatting logs, alerts, and instructions.
- Provide Vietnamese localization in READMEs and user-facing artifacts where possible, as the user frequently requests Vietnamese communication.
