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
| `commands.check` | optional; a `svelte-check` invocation (Wave 2). When set, the runner also verifies the rsvelte `svelte-check` CLI: it runs the *same* command under the official `svelte-check` (baseline) and then under the rsvelte `@rsvelte/svelte-check` binary (swapped in alongside the compiler). Use flags both binaries accept (`--workspace`, `--output`, `--tsconfig`, `--ignore`, `--fail-on-warnings`, `--compiler-warnings`, `--diagnostic-sources`). Gated by the baseline like every other phase. |
| `swap.strategy` | `vps-shim` (preferred when the target uses vite-plugin-svelte), `loader-hook` (require-hook fallback), or `pnpm-override` (already-forked targets). The runner stages a renamed copy of `submodules/vite-plugin-svelte/packages/vite-plugin-svelte` and injects pnpm `overrides` **into both `package.json` and `pnpm-workspace.yaml`** (each target pins a different pnpm major that reads overrides from a different place — see "pnpm version caveats" below) — `@sveltejs/vite-plugin-svelte`, `@rsvelte/vite-plugin-svelte-native`, and `@rsvelte/vite-plugin-svelte-native-<triple>` (plus `svelte-check` + `@rsvelte/svelte-check-<triple>` when `commands.check` is set) — so the target picks up the *local* rsvelte binaries, not the last npm-published ones. |
| `subPath` | optional; if the verification target is a sub-package of a monorepo |
| `timeoutMinutes` | per-phase timeout |
| `tags` | free-form labels for grouping (`ui-library`, `sveltekit`, …) |
| `allowList.expectedBaselineFailures` | regex patterns of test names the official compiler is *expected* to fail; these are excluded from regression comparison |

## How a run works

1. Resolve the target JSON.
2. Clone or fast-forward `compat/ecosystem-ci/checkout/<name>/` to the latest commit on `branch`.
3. Ensure `pnpm-workspace.yaml` carries `dangerouslyAllowAllBuilds: true` (see "pnpm version caveats" below), then `pnpm install` (or whatever `commands.install` says).
4. **Baseline**: run `commands.build`, `commands.test`, and/or `commands.check` against the unmodified target. Save log + exit code under `.cache/<name>-baseline-*.{log,json}`.
5. Build rsvelte NAPI (`cargo build --release --features napi --lib`) and stage it into `apps/npm/vite-plugin-svelte-native-<triple>/`; for targets with `commands.check`, also build `svelte_check` and stage it into `apps/npm/svelte-check-<triple>/`.
6. **Swap**: inject pnpm `overrides` into the target's `package.json` and `pnpm-workspace.yaml`, then remove `node_modules` + `pnpm-lock.yaml` and re-install so the overrides actually resolve (see "pnpm version caveats" below). A post-install sanity check confirms the rsvelte plugin really landed in `node_modules`.
7. **rsvelte run**: re-run the same commands. Save log + exit code under `.cache/<name>-rsvelte-*.{log,json}`.
8. **Verdict**: written to `results/<name>.json`. The rsvelte phases must all exit 0 (gated by the baseline):

   ```jsonc
   {
     "name": "shadcn-svelte",
     "targetSha": "abc123",
     "rsvelteSha": "def456",
     "result": "pass" | "baseline-failure" | "regression" | "rsvelte-install-failure" | "swap-failure" | "swap-noop",
     "baseline": { "install": { "exitCode": 0, "durationMs": 145000 }, "build": { "exitCode": 0, "durationMs": 12000 } },
     "rsvelte":  { "install": { "exitCode": 0, "durationMs": 8000 }, "build": { "exitCode": 0, "durationMs": 16000 } },
     "verifiedAt": "2026-05-25T12:34:56Z"
   }
   ```

If baseline itself fails, the run is classified `baseline-failure` and does
**not** count as a regression — the target is broken for everyone. `swap-noop`
means the override silently failed to take effect (the run would have verified
official svelte, not rsvelte) — treated as a hard failure, never a green pass.

### pnpm version caveats

Each target pins its own pnpm via `package.json#packageManager` (corepack /
pnpm's self-version-management honours it), so a single sweep runs a mix of
pnpm majors — e.g. melt-ui pins `pnpm@9`, bits-ui `pnpm@10`, and flowbite-svelte
(no pin) uses the ambient pnpm 11. Where pnpm reads its config changed across
those majors, so the harness works around three things:

- **Where `overrides` live moved.** pnpm 9 reads `package.json#pnpm.overrides`
  and ignores overrides in `pnpm-workspace.yaml`; pnpm 11 ignores the
  `package.json` `pnpm` field entirely and only reads `pnpm-workspace.yaml`;
  pnpm 10 reads both. The swap therefore writes the overrides to **both** places
  so it takes effect regardless of the target's pinned pnpm.
- **Build-script approval (pnpm 10+).** pnpm 10+ aborts install with
  `ERR_PNPM_IGNORED_BUILDS` when a dependency ships an unapproved build script.
  Targets that keep their approvals in `package.json#pnpm.onlyBuiltDependencies`
  (ignored by pnpm 11, e.g. flowbite-svelte) would break at baseline, so we set
  `dangerouslyAllowAllBuilds: true` in `pnpm-workspace.yaml` to build native deps
  (esbuild, sharp, …) during install. pnpm 9 builds everything anyway and just
  ignores the key.
- **Changing overrides doesn't invalidate an existing install.** A plain (or even
  `--force`) reinstall reports "Already up to date" and keeps the baseline's
  official packages, so the swap becomes a silent no-op. The runner therefore
  deletes `node_modules` + `pnpm-lock.yaml` before the rsvelte install to force a
  fresh resolution against the overrides; the warm pnpm store keeps that
  re-resolution fast. A post-install sanity check (`swap-noop` result) fails the
  run loudly if the rsvelte plugin still didn't land in `node_modules`.

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
