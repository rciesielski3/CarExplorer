#!/bin/bash

# Recovery script for completing PHASE 2+3 fixes after environment issue
# Run this once bash environment recovers

set -e

echo "🔄 Recovery: Committing Fix 4 and Fix 10..."

# Verify we're on the right branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "release-automation" ]; then
  echo "❌ ERROR: Not on release-automation branch. Currently on: $CURRENT_BRANCH"
  exit 1
fi

# Commit Fix 4 and Fix 10 together
git add src/screens/CompareScreen.tsx src/api/wikidataApi.ts

git commit -m "fix: refactor getValue to return arrays and add sort comparator comment

Fix 4: getValue now returns string | string[] directly
- All getValue functions return arrays for isArray rows instead of joined strings
- Render logic uses Array.isArray(value) instead of row.isArray
- Eliminates join/split round-trip that corrupted values containing \", \"

Fix 10: Add architectural comment to sort comparator
- Documents single-unit assumption in Wikidata specs sorting
- Future refactors should be aware if mixed units are added

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

echo "✅ Commits completed!"

# Show final status
echo ""
echo "📊 Final PHASE 2+3 Status:"
git log --oneline -12 | grep -E "fix:|feat:" | head -10

echo ""
echo "🔗 Check PR #31 conflicts:"
echo "  gh pr view 31 --web"
echo ""
echo "📋 Next: Run final branch review and resolve PR #31 conflicts"
