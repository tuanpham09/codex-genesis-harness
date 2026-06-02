const fs = require('fs');
const path = require('path');

const subagentTranscriptPath = '/Users/tmi2026/.gemini/antigravity/brain/acc78322-25b6-4591-af45-46a891106c64/.system_generated/logs/transcript.jsonl';
const targetPath = '/Users/tmi2026/.gemini/antigravity/brain/6468e609-5207-4b6f-a860-73a8b182d6d9/superpowers_research_report.md';

try {
  const content = fs.readFileSync(subagentTranscriptPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const obj = JSON.parse(line);
    if (obj.step_index === 35) {
      let message = obj.tool_calls[0].args.Message;
      if (typeof message === 'string') {
        if (message.startsWith('"') && message.endsWith('"')) {
          message = message.substring(1, message.length - 1);
        }
        message = message
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\');
      }
      fs.writeFileSync(targetPath, message, 'utf8');
      console.log('Successfully extracted and unescaped superpowers research report via custom unescaper!');
      process.exit(0);
    }
  }
  console.log('Step 35 not found.');
} catch (err) {
  console.error('Error:', err);
}
