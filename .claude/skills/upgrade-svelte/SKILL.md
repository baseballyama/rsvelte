---
name: upgrade-svelte
description: Upgrade the Svelte submodule to the latest (or specified) version, regenerate fixtures, identify test failures, and fix all regressions until tests pass 100%.
argument-hint: "[version e.g. 5.52.0 | 'latest']"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent, WebSearch, WebFetch
effort: max
---

# Upgrade Svelte Submodule

Upgrade `submodules/svelte`, regenerate fixtures, and fix every regression until the
compatibility report is 100%.

```
Phase 1: Upgrade   → checkout tag, build compiler, regenerate fixtures (script)
Phase 2: Assess    → read the compatibility report, group failures by cause
Phase 3: Fix       → one category at a time, one commit per fix
Phase 4: Validate  → full report, cargo test --release, docs, commit
```

## Phase 1: Upgrade

### 1.1 Pick the version

Use `$ARGUMENTS` if given (e.g. `5.52.0`). Otherwise take the latest stable `svelte@*` tag
(skip `next` / `rc`); confirm with the user if ambiguous.

```bash
cd submodules/svelte && git fetch --tags && git tag -l 'svelte@*' --sort=-version:refname | head -5
```

### 1.2 Run the upgrade script

```bash
./scripts/dev/upgrade-svelte.sh <VERSION>
```

It performs, in order: submodule checkout → writes `crates/rsvelte_core/svelte-version.txt` →
`pnpm install && pnpm build` in `submodules/svelte/packages/svelte` (`compiler/index.js` is
gitignored, so this step is mandatory) → `generate-fixtures --force` → `compatibility-report`
→ `update-docs` → bumps `apps/playground/src/lib/preview.ts` and
`apps/playground/rsvelte-shim/compiler.mjs`.

| Step fails | Try |
|---|---|
| pnpm install | `pnpm install --no-frozen-lockfile` |
| pnpm build | Node >= 22? new build deps? |
| generate-fixtures | Svelte's compile/test API changed — read the error |

### 1.3 Read what changed upstream

```bash
cd submodules/svelte
git log --oneline svelte@<OLD>..svelte@<NEW> -- packages/svelte/src/compiler/
git diff --stat  svelte@<OLD>..svelte@<NEW> -- packages/svelte/src/compiler/
```

Also `packages/svelte/CHANGELOG.md`. Look for: new syntax, changed codegen output,
new/removed/renamed compiler options, CSS scoping changes, new warning/error codes.

## Phase 2: Assess

### 2.1 Read the report

```bash
COMMIT=$(git -C submodules/svelte rev-parse --short=12 HEAD)
node -e "
const r = require('./fixtures/${COMMIT}/compatibility-report.json');
const s = r.summary;
console.log('Overall: ' + s.total_passed + '/' + (s.total_tests - s.total_skipped) + ' (' + s.overall_percentage.toFixed(1) + '%)');
for (const [cat, d] of Object.entries(r.categories)) {
  const st = d.stats;
  if (st.failed || st.errors) console.log(cat + ': ' + st.passed + '/' + st.total + ' failed=' + st.failed + ' errors=' + st.errors);
}"
```

### 2.2 Categorize, then order

| Pattern | Fix in |
|---|---|
| New AST node type | parser + `crates/rsvelte_core/src/ast/template.rs` |
| Changed codegen output | transform phase |
| New compiler option | `CompileOptions` + plumbing |
| New warning/error code | validator + `crates/rsvelte_core/src/error/` |
| CSS output changed | `3_transform/css.rs` |
| Renamed internal API | mirror the rename |

Fix order: parser → compiler errors → validator warnings → CSS → SSR → snapshot (client) →
runtime (depends on everything above).

## Phase 3: Fix regressions

Mirror layout: `submodules/svelte/packages/svelte/src/compiler/phases/{1-parse,2-analyze,3-transform}/`
→ `crates/rsvelte_core/src/compiler/phases/{1_parse,2_analyze,3_transform}/`;
`errors.js` / `warnings.js` → `crates/rsvelte_core/src/error/`.

For each failure:

1. Read the reference implementation first; use the same algorithm and structure.
2. Diff the fixture (`fixtures/${COMMIT}/<category>/<sample>/…`) against rsvelte's output.
3. Implement in the mirror module. New feature: `ast/template.rs` → `1_parse` → `2_analyze`
   → `3_transform/client` → `3_transform/server` → `3_transform/css.rs` if CSS-related.
4. Changed codegen: `rg "<unique output string>" submodules/svelte/packages/svelte/src/compiler/`,
   then the same string under `crates/rsvelte_core/src/compiler/`.
5. Verify: `cargo test --release <test_name> -- --nocapture`
6. Commit before the next failure:
   `cargo fmt && cargo clippy --all-targets --all-features -- -D warnings && git add -u && git commit -m "fix: <what>"`

Use subagents for parallel investigation when several categories fail.

## Phase 4: Validate & ship

```bash
pnpm run compatibility-report      # must be 0 failures, 0 errors in every category
cargo test --release               # runtime/ssr suites; audit_skipped re-checks the skip lists
pnpm run update-docs               # README.md + apps/playground/static/test-results.json
./scripts/bench/bench.sh --quick   # only if codegen hot paths changed
```

Also update `AGENTS.md` (Test Status table and the `Svelte **vX.Y.Z**` line) if numbers moved.
The former `USE_RSVELTE=true npx vitest` step is gone: nothing in `submodules/svelte` reads
that variable; runtime parity is the `Runtime *` rows of the report.

```bash
git add -A
git commit -m "chore: upgrade Svelte to <VERSION>

- Updated submodule to svelte@<VERSION>
- Regenerated all test fixtures
- Fixed N regressions: <brief list>
- Compatibility report 100%"
git push
```

## Quick reference

```bash
cd submodules/svelte && git describe --tags --abbrev=0          # current version
./scripts/dev/upgrade-svelte.sh <VERSION>                        # automated Phase 1
pnpm run compatibility-report                                    # report → fixtures/<commit>/compatibility-report.json
cargo test --release <test_name> -- --nocapture                  # single test
pnpm run update-docs                                             # docs
cargo fmt && cargo clippy --all-targets --all-features -- -D warnings
```
