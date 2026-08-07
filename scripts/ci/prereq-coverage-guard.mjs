#!/usr/bin/env node
// Asserts that every test guarded by `RSVELTE_REQUIRE_PREREQS` is actually run by
// a CI job that declares it.
//
// The guards in the Rust sources are one-sided by design: a job that does not
// declare the prerequisite is allowed to take the skip path. That asymmetry is
// right, but it means "the ratchet passed" and "the ratchet was skipped" are the
// same colour, and nothing anywhere asserted that *some* job both selects the
// target and sets the variable. Drop the variable from a job and every remaining
// run skips: green everywhere, one missing line in one job log. See #2431.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');

export const PREREQ_ENV = 'RSVELTE_REQUIRE_PREREQS';
export const SHARD_SCRIPT = 'scripts/ci/run-test-shard.sh';

const EXIT_CLEAN = 0;
const EXIT_VIOLATIONS = 1;
const EXIT_ERROR = 2;

// --- Which cargo target does a guarded source file belong to? ---------------

/** `crates/<crate>/src/**` -> that crate's lib; `crates/<crate>/tests/<name>{.rs,/**}` -> that test binary. */
export function targetForSource(relPath) {
  const parts = relPath.split('/');
  if (parts[0] !== 'crates' || parts.length < 3) {
    throw new Error(`${relPath}: not a path under crates/<crate>/`);
  }
  const crate = parts[1];
  if (parts[2] === 'src') return { crate, kind: 'lib', target: crate, source: relPath };
  if (parts[2] === 'tests' && parts.length >= 4) {
    return { crate, kind: 'test', target: parts[3].replace(/\.rs$/, ''), source: relPath };
  }
  throw new Error(`${relPath}: cannot map to a cargo target (expected crates/<crate>/{src,tests}/…)`);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'target' || entry === 'node_modules') continue;
      walk(full, out);
    } else if (entry.endsWith('.rs')) {
      out.push(full);
    }
  }
  return out;
}

/** Every guarded source file, as a cargo target. Discovered, never declared. */
export function findGuardedTargets(repoRoot = REPO_ROOT) {
  const cratesDir = join(repoRoot, 'crates');
  const guarded = [];
  for (const file of walk(cratesDir)) {
    if (!readFileSync(file, 'utf8').includes(PREREQ_ENV)) continue;
    guarded.push(targetForSource(file.slice(repoRoot.length + 1).split('\\').join('/')));
  }
  if (guarded.length === 0) {
    throw new Error(`found no source guarded by ${PREREQ_ENV} — the search itself is broken`);
  }
  // One target can carry several guarded files (tests/cli/{daemon,tailwind}.rs).
  const seen = new Map();
  for (const t of guarded) {
    const key = `${t.crate}:${t.kind}:${t.target}`;
    if (!seen.has(key)) seen.set(key, { ...t, sources: [] });
    seen.get(key).sources.push(t.source);
  }
  return [...seen.values()];
}

/** Test binaries the shard script hands to a dedicated job instead of running itself. */
export function shardExclusions(repoRoot = REPO_ROOT) {
  const script = readFileSync(join(repoRoot, SHARD_SCRIPT), 'utf8');
  const names = [...script.matchAll(/\$2 != "([^"]+)"/g)].map((m) => m[1]);
  if (names.length === 0) {
    throw new Error(`${SHARD_SCRIPT}: could not read its target exclusion list — parse it or fail`);
  }
  return names;
}

// --- Workflow parsing (the subset GitHub Actions files actually use) --------

const indentOf = (line) => line.length - line.trimStart().length;
const isBlank = (line) => line.trim() === '' || line.trim().startsWith('#');

/** Lines strictly more indented than `indent`, starting at `from`. */
function block(lines, from, indent) {
  const out = [];
  for (let i = from; i < lines.length; i += 1) {
    if (isBlank(lines[i])) {
      out.push([i, lines[i]]);
      continue;
    }
    if (indentOf(lines[i]) <= indent) break;
    out.push([i, lines[i]]);
  }
  return out;
}

function envKeys(lines, envLineIndex) {
  const keys = new Set();
  for (const [, line] of block(lines, envLineIndex + 1, indentOf(lines[envLineIndex]))) {
    if (isBlank(line)) continue;
    const key = line.trim().match(/^([A-Za-z_][A-Za-z0-9_-]*)\s*:/);
    if (key) keys.add(key[1]);
  }
  return keys;
}

function scalarValue(lines, index) {
  const line = lines[index];
  const inline = line.slice(line.indexOf(':') + 1).trim();
  if (inline && !/^[|>][-+]?$/.test(inline)) return inline;
  const body = block(lines, index + 1, indentOf(line)).map(([, l]) => l.trim());
  // A folded scalar (`>`) is ONE command spread over lines; joining it with
  // newlines would parse each continuation as a command of its own — and a bare
  // `cargo nextest run` fragment then looks like it selects every target.
  return body.join(inline.startsWith('>') ? ' ' : '\n');
}

/**
 * `{ env, jobs: [{ id, name, env, steps: [{ run, env }] }] }`.
 * Throws rather than reporting an empty parse: a workflow this cannot read must
 * not silently count as "runs nothing".
 */
export function parseWorkflow(text, label = '<workflow>') {
  const lines = text.split('\n');
  const result = { env: new Set(), jobs: [] };

  let jobsIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (isBlank(lines[i]) || indentOf(lines[i]) !== 0) continue;
    if (/^env\s*:/.test(lines[i])) result.env = envKeys(lines, i);
    if (/^jobs\s*:/.test(lines[i])) jobsIndex = i;
  }
  if (jobsIndex === -1) throw new Error(`${label}: no top-level \`jobs:\` block`);

  const jobLines = block(lines, jobsIndex + 1, 0);
  if (jobLines.length === 0) throw new Error(`${label}: \`jobs:\` block is empty`);
  const jobIndent = indentOf(jobLines.find(([, l]) => !isBlank(l))[1]);

  for (const [i, line] of jobLines) {
    if (isBlank(line) || indentOf(line) !== jobIndent) continue;
    const id = line.trim().match(/^([A-Za-z0-9_-]+)\s*:/);
    if (!id) continue;
    const job = { id: id[1], name: id[1], env: new Set(), steps: [] };

    const body = block(lines, i + 1, jobIndent);
    for (const [j, jl] of body) {
      if (isBlank(jl) || indentOf(jl) !== jobIndent + 2) continue;
      if (/^name\s*:/.test(jl.trim())) job.name = scalarValue(lines, j).replace(/^['"]|['"]$/g, '');
      if (/^env\s*:/.test(jl.trim())) job.env = envKeys(lines, j);
      if (!/^steps\s*:/.test(jl.trim())) continue;

      const stepLines = block(lines, j + 1, jobIndent + 2);
      const stepIndent = stepLines.length
        ? indentOf(stepLines.find(([, l]) => !isBlank(l))[1])
        : jobIndent + 4;
      for (const [k, sl] of stepLines) {
        if (isBlank(sl) || indentOf(sl) !== stepIndent || !sl.trim().startsWith('- ')) continue;
        const step = { run: '', env: new Set() };
        // The `- ` sits on the first key; keys of the same step are one level deeper.
        const keyIndent = stepIndent + 2;
        const first = sl.replace(/^(\s*)- /, '$1  ');
        const own = [[k, first], ...block(lines, k + 1, stepIndent)];
        for (const [m, kl] of own) {
          if (isBlank(kl) || indentOf(kl) !== keyIndent) continue;
          if (/^run\s*:/.test(kl.trim())) {
            step.run = m === k ? first.slice(first.indexOf(':') + 1).trim() : scalarValue(lines, m);
          }
          if (/^env\s*:/.test(kl.trim()) && m !== k) step.env = envKeys(lines, m);
        }
        job.steps.push(step);
      }
    }
    result.jobs.push(job);
  }
  if (result.jobs.length === 0) throw new Error(`${label}: parsed no jobs`);
  return result;
}

// --- Does a command select a given cargo target? ----------------------------

const VALUE_FLAGS = new Set([
  '-p',
  '--package',
  '--exclude',
  '--test',
  '--bench',
  '--bin',
  '--example',
  '--features',
  '--profile',
  '-E',
  '--filter-expr',
  '--partition',
  '--manifest-path',
  '--target',
  '--config',
  '-j',
  '--jobs',
]);

/** Split a `run:` body into individual shell commands. */
function commands(run) {
  return run
    .replace(/\\\n/g, ' ')
    .split(/\n|&&|\|\||;/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseCargoCommand(command) {
  const tokens = command.split(/\s+/);
  const start = tokens.findIndex((t) => t === 'cargo');
  if (start === -1) return null;
  const rest = tokens.slice(start + 1).filter((t) => !t.startsWith('$') && !t.includes('${{'));
  const sub = rest[0] === 'nextest' ? `${rest[0]} ${rest[1]}` : rest[0];
  if (sub !== 'test' && sub !== 'nextest run') return null;

  const args = rest.slice(sub.split(' ').length);
  const parsed = {
    packages: [],
    excluded: [],
    tests: [],
    lib: false,
    allTargets: false,
    narrowed: false,
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--') {
      // Everything after `--` is a test-name filter.
      if (args.length > i + 1) parsed.narrowed = true;
      break;
    }
    if (arg === '--lib') parsed.lib = true;
    else if (arg === '--all-targets' || arg === '--tests') parsed.allTargets = true;
    else if (arg === '-p' || arg === '--package') parsed.packages.push(args[++i]);
    else if (arg === '--exclude') parsed.excluded.push(args[++i]);
    else if (arg === '--test') parsed.tests.push(args[++i]);
    else if (arg === '-E' || arg === '--filter-expr') {
      parsed.narrowed = true;
      i += 1;
    } else if (VALUE_FLAGS.has(arg)) i += 1;
    else if (arg.startsWith('-')) continue;
    // A bare word is a test-name filter: it runs a subset of the binary, so this
    // command cannot be credited with covering the whole target.
    else parsed.narrowed = true;
  }
  return parsed;
}

/** True when `run` unambiguously runs every test in `target`. */
export function runSelectsTarget(run, target, exclusions) {
  for (const command of commands(run)) {
    if (command.includes(SHARD_SCRIPT)) {
      if (target.kind === 'test' && !exclusions.includes(target.target)) return true;
      continue;
    }
    const cargo = parseCargoCommand(command);
    if (!cargo || cargo.narrowed) continue;
    if (cargo.excluded.includes(target.crate)) continue;
    if (cargo.packages.length > 0 && !cargo.packages.includes(target.crate)) continue;
    if (cargo.tests.length > 0) {
      if (target.kind === 'test' && cargo.tests.includes(target.target)) return true;
      continue;
    }
    if (cargo.lib) {
      if (target.kind === 'lib') return true;
      continue;
    }
    // No target filter: `cargo test` builds and runs lib + integration tests.
    if (!cargo.allTargets || target.kind === 'test') return true;
  }
  return false;
}

// --- The check ---------------------------------------------------------------

export function checkCoverage(repoRoot = REPO_ROOT) {
  const workflowDir = join(repoRoot, '.github', 'workflows');
  const files = readdirSync(workflowDir).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  if (files.length === 0) throw new Error('no workflow files found');

  const exclusions = shardExclusions(repoRoot);
  const targets = findGuardedTargets(repoRoot);

  const runs = [];
  for (const file of files) {
    const workflow = parseWorkflow(readFileSync(join(workflowDir, file), 'utf8'), file);
    for (const job of workflow.jobs) {
      for (const step of job.steps) {
        if (!step.run) continue;
        runs.push({
          file,
          job: job.name,
          run: step.run,
          declares: workflow.env.has(PREREQ_ENV) || job.env.has(PREREQ_ENV) || step.env.has(PREREQ_ENV),
        });
      }
    }
  }

  const violations = [];
  const covered = [];
  for (const target of targets) {
    const selecting = runs.filter((r) => runSelectsTarget(r.run, target, exclusions));
    const enforcing = selecting.filter((r) => r.declares);
    if (enforcing.length === 0) {
      violations.push({
        target,
        message:
          selecting.length === 0
            ? `no CI job runs ${target.crate} ${target.kind === 'lib' ? '--lib' : `--test ${target.target}`}`
            : `${selecting.length} job(s) run it (${selecting
                .map((r) => `${r.file}:${r.job}`)
                .join(', ')}) but none set ${PREREQ_ENV}, so every run takes the skip path`,
      });
    } else {
      covered.push({ target, by: enforcing.map((r) => `${r.file}:${r.job}`) });
    }
  }
  return { targets, runs, covered, violations };
}

function main() {
  let result;
  try {
    result = checkCoverage();
  } catch (err) {
    console.error(`prereq-coverage-guard: ${err.message}`);
    return EXIT_ERROR;
  }

  if (result.violations.length === 0) {
    console.log(
      `prereq-coverage-guard: ${result.targets.length} ${PREREQ_ENV}-guarded targets, ` +
        `each run by at least one job that declares the prerequisite.`,
    );
    for (const { target, by } of result.covered) {
      console.log(`  ${target.crate} ${target.kind}:${target.target} — ${by.join(', ')}`);
    }
    return EXIT_CLEAN;
  }

  console.error(`prereq-coverage-guard: ${result.violations.length} unenforced guard(s)\n`);
  for (const { target, message } of result.violations) {
    console.error(`  ${target.sources.join(', ')}`);
    console.error(`    ${message}\n`);
  }
  return EXIT_VIOLATIONS;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
