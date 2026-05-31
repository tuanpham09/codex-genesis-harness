#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: bash scripts/transition_state.sh <NEW_STATE> [Reason]"
  exit 1
fi

NEW_STATE=$1
REASON=${2:-"State transition"}
STATE_FILE=".codebase/state.json"
CURRENT_STATE_MD=".codebase/CURRENT_STATE.md"

if [ ! -f "$STATE_FILE" ]; then
  echo "Error: $STATE_FILE not found."
  exit 1
fi

if [ "$NEW_STATE" == "COMPLETED" ]; then
  if [ -f "scripts/validation_gates.sh" ]; then
    echo "Running Validation Gates before transitioning to COMPLETED..."
    if ! bash scripts/validation_gates.sh; then
      echo "Transition blocked by Validation Gates."
      exit 1
    fi
  fi
fi

node -e "
const fs = require('fs');
const file = '$STATE_FILE';
const newState = '$NEW_STATE';
const reason = '$REASON';

const allowed = {
  'INIT': ['REQUIREMENTS_GATHERING', 'PLANNING'],
  'REQUIREMENTS_GATHERING': ['PLANNING'],
  'PLANNING': ['IMPLEMENTATION'],
  'IMPLEMENTATION': ['VERIFICATION', 'PLANNING'],
  'VERIFICATION': ['COMPLETED', 'IMPLEMENTATION'],
  'COMPLETED': ['INIT', 'REQUIREMENTS_GATHERING']
};

let data = JSON.parse(fs.readFileSync(file, 'utf8'));
const current = data.current_state || 'INIT';

if (allowed[current] && allowed[current].includes(newState)) {
  data.history = data.history || [];
  data.history.push({ from: current, to: newState, reason: reason, timestamp: new Date().toISOString() });
  data.current_state = newState;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Transition successful: ' + current + ' -> ' + newState);
} else {
  console.error('Invalid transition from ' + current + ' to ' + newState);
  process.exit(1);
}
"

if [ $? -eq 0 ]; then
  echo "# Current State: $NEW_STATE" > "$CURRENT_STATE_MD"
  echo "Last updated: $(date)" >> "$CURRENT_STATE_MD"
  echo "" >> "$CURRENT_STATE_MD"
  echo "## Reason" >> "$CURRENT_STATE_MD"
  echo "$REASON" >> "$CURRENT_STATE_MD"
  exit 0
else
  exit 1
fi
