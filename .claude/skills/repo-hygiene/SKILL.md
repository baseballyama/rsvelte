---
name: repo-hygiene
description: Audit and clean up the repository — remove dead files, fix naming inconsistencies, update .gitignore, and ensure the repo is well-organized for OSS contributors. Does NOT modify source code logic.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write, Agent
effort: high
---

# Repository Hygiene

Audit repository structure, naming, configuration and documentation. **Never modify source
code logic.** Deletions need user confirmation.

## Never delete

| What | Why |
|---|---|
| `compatibility/*known-failures*.json`, `*-oracle-excluded.json`, `*-mechanisms.json`, `*.provenance.json`, `attribution-pending.json`, `KNOWN-FAILURES.md`, `GATES.md` | shrink-only CI ratchets and their justifications |
| `compatibility/{pattern-corpus,lint-adversarial,lint-env,check-fixtures,lsp-fixtures}/` | checked-in gate inputs |
| `submodules/*` (every entry in `.gitmodules`) | pinned corpus sources and upstream references |
| `fixtures/`, `target*/`, `pkg*/`, `compatibility/{sources,expected,actual,fmt,…}/`, `.corpus-cache/` | generated and gitignored; reclaim only with `pnpm run corpus:clean`, never `git rm` |
| `pgo/rsvelte.profdata`, `upstream_issues/` | shipped-build input; index gated by `scripts/ci/check-upstream-issues.mjs` |

## Checklist

### 1. Dead and generated files

```bash
find . \( -name "*.backup" -o -name "*.bak" -o -name "*.orig" -o -name "*~" -o -name ".DS_Store" -o -name "Thumbs.db" \) \
  -not -path "*/node_modules/*" -not -path "./.git/*" -not -path "*/target/*" -not -path "./submodules/*"
ls -la benchmark-results.json .benchmark-files.txt npm 2>/dev/null   # should be gitignored / absent
find . -type d -empty -not -path "*/node_modules/*" -not -path "./.git/*" -not -path "*/target/*" -not -path "./submodules/*"
```

Dead file → `git rm`. Generated but tracked → add to `.gitignore`, then `git rm --cached`.

### 2. `.gitignore` coverage

Confirm each is present; add what is missing:

| Group | Patterns |
|---|---|
| OS / editor | `.DS_Store`, `Thumbs.db`, `*.swp`, `*.swo`, `*~` |
| Rust | `/target`, `**/*.rs.bk` |
| Generated | `benchmark-results.json`, `.benchmark-files.txt`, `/fixtures/`, `/pkg`, `/npm/` |
| Deps | `node_modules/`, `.pnpm-store/` |
| IDE / backup | `.idea/`, `.vscode/`, `*.code-workspace`, `*.backup`, `*.bak`, `*.orig` |

### 3. Unused scripts

Scripts live in nested dirs (`scripts/{bench,ci,compat-corpus,compat-lsp,dev,diff,fixtures,perf,release,reports}/`).

```bash
for f in $(find scripts -type f \( -name '*.mjs' -o -name '*.sh' \) -not -path '*/node_modules/*'); do
  name=$(basename "$f")
  hits=$(grep -rl --exclude-dir=node_modules --exclude-dir=target "$name" package.json README.md AGENTS.md .github scripts crates 2>/dev/null | grep -v "^$f$" | wc -l)
  [ "$hits" -eq 0 ] && echo "UNREFERENCED: $f"
done
```

Referenced anywhere → keep. Debugging utility (e.g. `scripts/diff/compare-parsers.mjs`) → keep and
document. Unreferenced and undocumented → `[ask]`.

### 4. Unused binaries

No root `[[bin]]`; dev binaries are `crates/rsvelte_devtools/src/bin/*.rs` and
`crates/rsvelte_core/src/bin/`. `pnpm run report-orphan-test-binaries` lists test targets
nothing references. A dev tool (`profiler`, `benchmark_runner`, …) is fine outside CI if documented.

### 5. Naming

- Scripts: kebab-case, `*.sh` / `*.mjs`.
- Rust files and dirs: `snake_case` — `find crates -name '*.rs' | grep -E '[A-Z]|-'` must be empty.
- Tests: `crates/*/tests/*.rs` in `snake_case`.
- Non-Rust dirs: `kebab-case`.

### 6. Documentation

- `CLAUDE.md` must remain a symlink to `AGENTS.md` (`ls -la CLAUDE.md`); `README.md` is for humans.
- Stale references: ``grep -oE '`[^`]+\.(rs|mjs|sh|json)`' README.md | tr -d '`' | while read f; do [ -e "$f" ] || echo "MISSING: $f"; done``
- OSS scaffolding: `CONTRIBUTING.md` (present), `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`. Report missing ones; **do not create** unless asked.

### 7. CI/CD

`ls .github/workflows/`; per workflow check referenced scripts exist and actions are pinned
(`.pinact.yaml` is the pin config). Run `pnpm run check:workflow-triggers`.

### 8. Dependencies

- Cargo: `cargo clippy --all-targets --all-features 2>&1 | grep unused`; a dependency present in a `Cargo.toml` but never imported → `[ask]`.
- `package.json`: every `devDependency` referenced by some script, workflow or workspace package.

### 9. Build artifacts in git

```bash
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | awk '/^blob/ {print $3, $4}' | sort -rn | head -20
```

`.wasm`, `.node` and platform binaries must not be tracked.

### 10. Root cleanliness

`ls -a` vs `git ls-tree --name-only HEAD`: every root entry must be tracked, gitignored, or a
known local dir (`target*/`, `node_modules/`, `fixtures/`). Anything else (e.g. `.measure/`) → `[ask]`.

## Workflow

1. Run sections 1–10 in order; report each item as `[ok]`, `[fix]` (auto-fixable) or `[ask]` (needs a decision).
2. Summarize findings in one table.
3. Apply `[fix]` items; ask the user about `[ask]` items and apply what is approved.
4. Commit: `git commit -m "chore: repository cleanup"`.
