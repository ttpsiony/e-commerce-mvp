#!/bin/bash

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Normalize path to relative
relative_path="${file_path#/Users/william/VScode/e-commerce/}"

case "$relative_path" in
  "shared/hooks/useCart.ts")
    test_file="shared/hooks/useCart.test.ts"
    ;;
  "shared/utils/currency.ts")
    test_file="shared/utils/currency.test.ts"
    ;;
  *)
    exit 0
    ;;
esac

cd /Users/william/VScode/e-commerce

echo "Running tests for $relative_path..."

output=$(npx vitest run "$test_file" --reporter=verbose 2>&1)
exit_code=$?

if [[ $exit_code -ne 0 ]]; then
  echo ""
  echo "Test failures in $test_file:"
  echo "$output" | grep -E "(FAIL|✗|×|Error|AssertionError|expected|received|●)" | head -50
  echo ""
  echo "Full output:"
  echo "$output"
fi

exit 0
