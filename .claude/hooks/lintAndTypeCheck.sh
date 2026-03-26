#!/bin/bash

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if echo "$file_path" | grep -qE '\.(ts|tsx)$'; then
  cd /Users/william/VScode/e-commerce
  npx tsc --noEmit 2>&1
  npm run lint 2>&1
fi

exit 0
