# ecosystem-ci

Real-world compatibility verification for rsvelte. Modeled after
[vite-ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci): for each
target repo (UI library, app, tool), clone it, run its own test/build suite
under the official `svelte/compiler`, then re-run it with `svelte/compiler`
swapped out for the rsvelte NAPI binding, and compare results.

The goal is to keep rsvelte honest against codebases that are actually
shipped in production, not just the fixtures vendored in `svelte/`.

## Layout

```
compat/ecosystem-ci/
├── README.md             # this file
├── targets/              # one JSON file per verified repo (tracked)
│   └── shadcn-svelte.json
├── checkout/             # per-target git clones (gitignored)
├── results/              # per-run JSON results (gitignored)
├── state/                # last-verified upstream HEAD SHA per target (gitignored)
└── .cache/               # baseline logs etc. (gitignored)
```

## Running locally

```bash
# Build rsvelte NAPI once (or every time you change rsvelte)
.claude/skills/verify-svelte-compat/scripts/build-rsvelte.sh

# Run a single target end-to-end
node scripts/ecosystem/ecosystem-ci.mjs run shadcn-svelte

# Run every tracked target
node scripts/ecosystem/ecosystem-ci.mjs run-all

# Just list known targets
node scripts/ecosystem/ecosystem-ci.mjs list

# Aggregate the latest results/ into a markdown summary
node scripts/ecosystem/ecosystem-ci.mjs report
```

Use `--filter <tag>` with `run-all` to narrow to a tag (e.g. `ui-library`).

## Target JSON schema

See `targets/shadcn-svelte.json` for a worked example. Required fields:

| field | meaning |
|---|---|
| `name` | unique identifier; also used as the checkout directory name |
| `repo` | git URL (https or ssh) |
| `branch` | upstream branch to follow (the one that "merges to develop" semantically) |
| `license` | must be `MIT` (or another permissive license we explicitly opt in to) |
| `type` | `app` or `tool` — controls verification strategy |
| `commands.install` | how to install deps |
| `commands.test` and/or `commands.build` | what to run for verification (at least one required) |
| `swap.strategy` | `vps-shim` (preferred when the target uses vite-plugin-svelte), `loader-hook` (require-hook fallback), or `pnpm-override` (already-forked targets). The runner stages a renamed copy of `submodules/vite-plugin-svelte/packages/vite-plugin-svelte` and uses three pnpm.overrides — `@sveltejs/vite-plugin-svelte`, `@rsvelte/vite-plugin-svelte-native`, and `@rsvelte/vite-plugin-svelte-native-<triple>` — so the target picks up the *local* NAPI binary, not the last npm-published one. |
| `subPath` | optional; if the verification target is a sub-package of a monorepo |
| `timeoutMinutes` | per-phase timeout |
| `tags` | free-form labels for grouping (`ui-library`, `sveltekit`, …) |
| `allowList.expectedBaselineFailures` | regex patterns of test names the official compiler is *expected* to fail; these are excluded from regression comparison |

## How a run works

1. Resolve the target JSON.
2. Clone or fast-forward `compat/ecosystem-ci/checkout/<name>/` to the latest commit on `branch`.
3. `pnpm install` (or whatever `commands.install` says).
4. **Baseline**: run `commands.build` and/or `commands.test` against the unmodified target. Save log + exit code under `.cache/<name>-baseline.{log,json}`.
5. Build rsvelte NAPI via `.claude/skills/verify-svelte-compat/scripts/build-rsvelte.sh`, drop the `.node` into `checkout/<name>/.rsvelte/`.
6. **Swap**: invoke the swap script that matches `swap.strategy`. This injects a `svelte/compiler` shim or a `pnpm.overrides` entry.
7. **rsvelte run**: re-run the same commands. Save log + exit code under `.cache/<name>-rsvelte.{log,json}`.
8. **Compare**: exit codes + log diff. Write final verdict to `results/<name>.json`:

   ```jsonc
   {
     "name": "shadcn-svelte",
     "targetCommit": "abc123",
     "rsvelteCommit": "def456",
     "result": "pass" | "baseline-failure" | "regression",
     "baseline": { "exitCode": 0, "durationSeconds": 145 },
     "rsvelte":  { "exitCode": 0, "durationSeconds": 162 },
     "verifiedAt": "2026-05-25T12:34:56Z"
   }
   ```

If baseline itself fails, the run is classified `baseline-failure` and does
**not** count as a regression — the target is broken for everyone.

## Adding a target

1. Confirm the repo is MIT-licensed (or another license you explicitly accept).
2. Create `compat/ecosystem-ci/targets/<name>.json` following the schema above.
3. Run it locally once: `node scripts/ecosystem/ecosystem-ci.mjs run <name>`.
4. If it produces a green `results/<name>.json`, commit the target JSON.

## Triggers (CI)

- **`workflow_dispatch` / PR label `ecosystem-ci`** — opt-in run against a
  specific rsvelte change. (`T1`)
- **`schedule: cron` nightly** — full sweep over all targets. (`T2`)
- **`ecosystem-ci-poll` workflow** runs hourly, polls each target's upstream
  `branch` HEAD SHA against `state/<name>.json`, and triggers a per-target
  run when the SHA changes. (`T3`)
