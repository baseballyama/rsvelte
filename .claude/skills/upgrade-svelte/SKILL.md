---
name: upgrade-svelte
description: Upgrade the Svelte submodule to the latest (or specified) version, regenerate fixtures, identify test failures, and fix all regressions until tests pass 100%.
argument-hint: "[version e.g. 5.52.0 | 'latest']"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, WebSearch, WebFetch
effort: max
---

# Upgrade Svelte Submodule

Upgrade the Svelte submodule, regenerate all test fixtures, identify regressions,
and fix every failing test until the rsvelte compiler reaches 100% compatibility
with the new version.

## Overview

```
Phase 1: Upgrade           → checkout new tag, build compiler, regenerate fixtures
Phase 2: Assess            → run compatibility report, identify all failures
Phase 3: Fix regressions   → fix each failure category by category
Phase 4: Validate & Ship   → full test suite, vitest, update docs, commit
```

## Phase 1: Upgrade the Submodule

### Step 1.1: Determine the target version

If the user specified a version (e.g. `5.52.0`), use that. Otherwise, find the latest:

```bash
cd svelte && git fetch --tags
git tag -l 'svelte@*' --sort=-version:refname | head -5
```

Pick the latest stable tag (not `next` or `rc`). Confirm with the user if ambiguous.

### Step 1.2: Run the upgrade script

The existing script handles the mechanical upgrade:

```bash
./scripts/dev/upgrade-svelte.sh <VERSION>
```

This does:
1. `git checkout svelte@<VERSION>` in the submodule
2. `pnpm install && pnpm build` in `svelte/packages/svelte/`
3. `npm run generate-fixtures -- --force`
4. `npm run compatibility-report`
5. `npm run update-docs`
6. Update docs preview runtime version

If the script fails at any step, troubleshoot:
- **pnpm install fails**: Try `pnpm install --no-frozen-lockfile`
- **pnpm build fails**: Check Node.js version (need >=22), check for new build deps
- **generate-fixtures fails**: The Svelte API may have changed; inspect the error

### Step 1.3: Review what changed in Svelte

After upgrading, understand what changed:

```bash
# See commits between old and new version
cd svelte
git log --oneline svelte@<OLD_VERSION>..svelte@<NEW_VERSION> -- packages/svelte/src/compiler/

# Check for breaking changes in the compiler specifically
git diff svelte@<OLD_VERSION>..svelte@<NEW_VERSION> -- packages/svelte/src/compiler/ --stat
```

Also check the Svelte changelog:
- https://github.com/sveltejs/svelte/blob/main/packages/svelte/CHANGELOG.md

Focus on:
- New syntax or template features
- Changed code generation output
- New/removed/renamed compiler options
- CSS scoping changes
- New warning or error codes

## Phase 2: Assess Test Failures

### Step 2.1: Read the compatibility report

```bash
# The report was generated in Phase 1 step 1.2
# Find it:
COMMIT=$(cd svelte && git rev-parse --short=12 HEAD)
cat fixtures/${COMMIT}/compatibility-report.json | node -e "
const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const s = r.summary;
console.log('Overall: ' + s.passed + '/' + s.total + ' (' + (s.passed/s.total*100).toFixed(1) + '%)');
console.log('');
for (const [cat, data] of Object.entries(r.categories)) {
    const st = data.stats;
    if (st.failed > 0 || st.errors > 0) {
        console.log(cat + ': ' + st.passed + '/' + st.total + ' (FAILED: ' + st.failed + ', ERRORS: ' + st.errors + ')');
    }
}
"
```

### Step 2.2: Categorize failures

Group failures by root cause. Common patterns after a Svelte upgrade:

| Pattern | Typical Cause | Fix Strategy |
|---------|---------------|--------------|
| New AST node type | Svelte added new syntax | Add node to parser + AST types |
| Changed code output | Codegen logic updated | Update transform phase to match |
| New compiler option | New option added | Add to CompileOptions + plumb through |
| New warning/error code | New validation rules | Add to validator phase |
| CSS output changed | Scoping logic updated | Update CSS transform |
| Renamed internal APIs | Refactoring in Svelte | Mirror the rename |

### Step 2.3: Create a prioritized fix list

Order failures by:
1. **Parser failures first** — everything downstream depends on correct parsing
2. **Compiler errors** — error detection is independent
3. **Validator warnings** — warning detection is independent
4. **CSS** — CSS scoping is relatively isolated
5. **SSR** — server transform
6. **Snapshot (Client)** — client transform
7. **Runtime tests** — these depend on correct compiled output

## Phase 3: Fix Regressions

### Workflow for each failure

For EACH failing test:

1. **Read the official Svelte implementation** to understand the expected behavior:
   ```bash
   # The reference implementation is in the submodule
   cat svelte/packages/svelte/src/compiler/phases/1-parse/<relevant-file>.js
   cat svelte/packages/svelte/src/compiler/phases/2-analyze/<relevant-file>.js
   cat svelte/packages/svelte/src/compiler/phases/3-transform/<relevant-file>.js
   ```

2. **Compare expected vs actual output**:
   ```bash
   # Load fixture (expected output from the JS compiler)
   cat fixtures/${COMMIT}/<category>/<sample>/client.js

   # Run the Rust compiler and compare
   cargo test --release --test compatibility_report -- --nocapture 2>&1 | grep -A5 "<sample_name>"
   ```

3. **Implement the fix** in the corresponding Rust module:
   - Parser changes → `src/compiler/phases/1_parse/`
   - Analysis changes → `src/compiler/phases/2_analyze/`
   - Transform changes → `src/compiler/phases/3_transform/`
   - AST changes → `src/ast/`
   - Error/warning changes → `src/error/`

4. **Run the specific test** to verify the fix:
   ```bash
   cargo test --release <test_name> -- --nocapture
   ```

5. **Commit the fix** before moving to the next failure:
   ```bash
   cargo fmt && cargo clippy --all-targets --all-features -- -D warnings
   git add -u && git commit -m "fix: <description of the fix>"
   ```

### Key reference paths

```
Svelte source (reference):    svelte/packages/svelte/src/compiler/
  phases/1-parse/             → src/compiler/phases/1_parse/
  phases/2-analyze/           → src/compiler/phases/2_analyze/
  phases/3-transform/client/  → src/compiler/phases/3_transform/client/
  phases/3-transform/server/  → src/compiler/phases/3_transform/server/
  phases/3-transform/css/     → src/compiler/phases/3_transform/css/
  errors.js                   → src/error/
  warnings.js                 → src/error/
```

### Handling new Svelte features

If Svelte added entirely new syntax or features:

1. **AST node**: Add new variant to `TemplateNode` or sub-enums in `src/ast/template.rs`
2. **Parser**: Add parsing logic in `src/compiler/phases/1_parse/`
3. **Analysis**: Add scope/binding handling in `src/compiler/phases/2_analyze/`
4. **Client transform**: Add code generation in `src/compiler/phases/3_transform/client/`
5. **Server transform**: Add SSR generation in `src/compiler/phases/3_transform/server/`
6. **CSS**: If CSS-related, update `src/compiler/phases/3_transform/css/`

Always read the official implementation first. Mirror the structure and logic.

### Handling changed code generation output

If the JS compiler now generates different output:

1. **Identify the diff**: Compare old fixture vs new fixture for the same sample
2. **Find the responsible code in Svelte**: Search for unique output strings
   ```bash
   rg "some_unique_output_string" svelte/packages/svelte/src/compiler/ --type js
   ```
3. **Find the corresponding Rust code**:
   ```bash
   rg "some_unique_output_string" src/compiler/ --type rust
   ```
4. **Update the Rust code** to produce the new output

## Phase 4: Validate & Ship

### Step 4.1: Run full compatibility report

```bash
npm run compatibility-report
```

Verify **0 failures, 0 errors** across all categories.

### Step 4.2: Run cargo tests

```bash
cargo test --release
```

All tests must pass.

### Step 4.3: Run vitest (NAPI integration)

```bash
# Build NAPI binding
cargo build --release --features napi --lib
cp target/release/libsvelte_compiler_rust.dylib svelte/rsvelte.darwin-arm64.node

# Run official Svelte test suite with rsvelte
cd svelte
USE_RSVELTE=true npx vitest run \
  packages/svelte/tests/runtime-runes/test.ts \
  packages/svelte/tests/runtime-legacy/test.ts
```

All tests must pass.

### Step 4.4: Update documentation

```bash
npm run update-docs
```

This updates:
- `README.md` — compatibility table
- `docs/static/test-results.json` — dashboard data

Also update the test status table in `CLAUDE.md` if the numbers changed.

### Step 4.5: Run benchmarks

```bash
./scripts/bench/bench.sh --quick
```

Update `README.md` performance tables if the numbers changed significantly.

### Step 4.6: Commit and push

```bash
git add -A
git commit -m "chore: upgrade Svelte to <VERSION>

- Updated submodule to svelte@<VERSION>
- Regenerated all test fixtures
- Fixed N regressions: <brief list>
- All 3,028+ tests passing"

git push
```

## Quick Reference

```bash
# Current Svelte version
cd svelte && git describe --tags --abbrev=0

# Latest available version
cd svelte && git fetch --tags && git tag -l 'svelte@*' --sort=-version:refname | head -1

# Full upgrade (automated steps)
./scripts/dev/upgrade-svelte.sh <VERSION>

# Compatibility report
npm run compatibility-report

# Single test
cargo test --release <test_name> -- --nocapture

# All tests
cargo test --release

# NAPI build
cargo build --release --features napi --lib
cp target/release/libsvelte_compiler_rust.dylib svelte/rsvelte.darwin-arm64.node

# Vitest
cd svelte && USE_RSVELTE=true npx vitest run packages/svelte/tests/runtime-runes/test.ts packages/svelte/tests/runtime-legacy/test.ts

# Update docs
npm run update-docs

# Lint
cargo fmt && cargo clippy --all-targets --all-features -- -D warnings
```

## Workflow

When the user invokes `/upgrade-svelte $ARGUMENTS`:

1. Determine target version from `$ARGUMENTS` (or find latest if "latest" or empty)
2. **Phase 1**: Run `./scripts/dev/upgrade-svelte.sh <VERSION>`
3. **Phase 2**: Read compatibility report, list all failures with counts
4. **Phase 3**: Fix failures one by one, committing each fix
   - Always read the Svelte reference implementation before fixing
   - Always run the specific test after each fix
   - Use subagents for parallel investigation when multiple categories fail
5. **Phase 4**: Full validation (cargo test, vitest, update docs), final commit
