#!/bin/bash
# Upgrade the Svelte submodule to a new version and regenerate all fixtures.
#
# Usage:
#   ./scripts/dev/upgrade-svelte.sh <version>
#   ./scripts/dev/upgrade-svelte.sh 5.52.0
#
# This script performs ALL steps needed when upgrading Svelte:
#   1. Checkout the submodule to the specified tag
#   2. Build the Svelte compiler from source (compiler/index.js is gitignored)
#   3. Regenerate test fixtures with the new compiler
#   4. Run the compatibility report
#   5. Update docs (README.md, test-results.json)
#   6. Update the docs site preview runtime version

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ $# -ne 1 ]; then
    echo "Usage: $0 <svelte-version>"
    echo "Example: $0 5.52.0"
    exit 1
fi

VERSION="$1"
TAG="svelte@${VERSION}"

echo "=== Upgrading Svelte to ${VERSION} ==="
echo ""

# Step 1: Checkout submodule
echo "[1/6] Checking out svelte submodule to ${TAG}..."
cd "${ROOT}/submodules/svelte"
git fetch --tags
git checkout "${TAG}"
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "  -> Commit: ${COMMIT_HASH}"
cd "${ROOT}"

# Step 2: Build the Svelte compiler from source
# IMPORTANT: compiler/index.js is in .gitignore and NOT tracked by git.
# Without this step, the old compiled version remains and fixtures will be wrong.
echo ""
echo "[2/6] Building Svelte compiler from source..."
cd "${ROOT}/submodules/svelte"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
cd "${ROOT}/submodules/svelte/packages/svelte"
pnpm build
cd "${ROOT}"
echo "  -> compiler/index.js rebuilt"

# Step 3: Regenerate fixtures
echo ""
echo "[3/6] Regenerating test fixtures..."
if [ -n "${DOCKER:-}" ] || command -v docker &>/dev/null && docker ps &>/dev/null; then
    ./docker-dev.sh run npm run generate-fixtures -- --force
else
    npm run generate-fixtures -- --force
fi

# Step 4: Run compatibility report
echo ""
echo "[4/6] Running compatibility report..."
if [ -n "${DOCKER:-}" ] || command -v docker &>/dev/null && docker ps &>/dev/null; then
    ./docker-dev.sh run npm run compatibility-report
else
    npm run compatibility-report
fi

# Step 5: Update docs
echo ""
echo "[5/6] Updating documentation..."
if [ -n "${DOCKER:-}" ] || command -v docker &>/dev/null && docker ps &>/dev/null; then
    ./docker-dev.sh run npm run update-docs
else
    npm run update-docs
fi

# Step 6: Update docs site preview runtime version + rsvelte shim version
echo ""
echo "[6/6] Updating docs preview runtime to ${VERSION}..."
PREVIEW_FILE="${ROOT}/apps/playground/src/lib/preview.ts"
if [ -f "${PREVIEW_FILE}" ]; then
    sed -i.bak "s|esm\.sh/svelte@[0-9.]*|esm.sh/svelte@${VERSION}|g" "${PREVIEW_FILE}"
    rm -f "${PREVIEW_FILE}.bak"
    echo "  -> Updated ${PREVIEW_FILE}"
else
    echo "  -> WARNING: ${PREVIEW_FILE} not found"
fi

# Bump the VERSION constant reported by the docs rsvelte shim so tools that
# call `compiler.VERSION` see the same version we target.
SHIM_FILE="${ROOT}/apps/playground/rsvelte-shim/compiler.mjs"
if [ -f "${SHIM_FILE}" ]; then
    sed -i.bak "s|export const VERSION = '[0-9.]*';|export const VERSION = '${VERSION}';|g" "${SHIM_FILE}"
    sed -i.bak "s|sveltejs/svelte@[0-9.]*|sveltejs/svelte@${VERSION}|g" "${SHIM_FILE}"
    rm -f "${SHIM_FILE}.bak"
    echo "  -> Updated ${SHIM_FILE}"
fi

echo ""
echo "=== Upgrade complete ==="
echo ""
echo "Summary:"
echo "  Svelte version: ${VERSION}"
echo "  Submodule commit: ${COMMIT_HASH}"
echo ""
echo "Next steps:"
echo "  1. Review the compatibility report results above"
echo "  2. Update AGENTS.md test status if needed"
echo "  3. git add -A && git commit -m 'chore: upgrade Svelte to ${VERSION}'"
echo "  4. git push"
