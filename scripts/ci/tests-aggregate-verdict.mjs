#!/usr/bin/env node
// The `Tests` required check fans the sharded test matrix back into one signal.
// Anything other than `success` still fails — a cancelled leg ran no tests, so
// it is not a pass — but the MESSAGE has to say which happened. A run whose legs
// were all cancelled by `concurrency: cancel-in-progress` is indistinguishable
// in `gh pr checks` from a run whose tests genuinely failed, and both read as a
// red required check; the log line is the only place the difference can be told.
//
// Exit codes: 0 = every leg succeeded, 1 = otherwise (unchanged from the inline
// bash this replaces), 2 = a leg reported a result this script does not know.

export const LEGS = [
  ['test (shards)', 'BULK'],
  ['test-unit', 'UNIT'],
  ['test-runtime', 'RUNTIME'],
  ['test-thread-safety', 'THREAD_SAFETY'],
  ['test-fmt-corpus', 'FMT_CORPUS'],
  ['oxc-formatter-probe', 'OXC_FORMATTER_PROBE'],
  ['language-server', 'LANGUAGE_SERVER'],
];

const KNOWN = new Set(['success', 'failure', 'cancelled', 'skipped', '']);

export function classify(env) {
  const legs = LEGS.map(([label, key]) => ({ label, result: env[key] ?? '' }));
  const unknown = legs.filter((leg) => !KNOWN.has(leg.result));
  const failed = legs.filter((leg) => leg.result === 'failure');
  const cancelled = legs.filter((leg) => leg.result === 'cancelled');
  // A `needs` job that never ran reports `skipped`; GitHub also reports the
  // empty string for a job the graph dropped entirely.
  const absent = legs.filter((leg) => leg.result === 'skipped' || leg.result === '');
  return { legs, unknown, failed, cancelled, absent };
}

export function verdict(env) {
  const { legs, unknown, failed, cancelled, absent } = classify(env);

  if (unknown.length > 0) {
    const named = unknown.map((leg) => `${leg.label}=${leg.result}`).join(', ');
    return { code: 2, message: `::error::Unrecognised job result(s): ${named}.` };
  }

  if (failed.length === 0 && cancelled.length === 0 && absent.length === 0) {
    return { code: 0, message: 'All test jobs succeeded.' };
  }

  // Cancellation is the common case on this repository and the one that gets
  // misread: a superseding push cancels the whole run, and every leg comes back
  // `cancelled` with zero steps. Say "no verdict", not "tests failed".
  if (failed.length === 0 && cancelled.length > 0) {
    const named = cancelled.map((leg) => leg.label).join(', ');
    const rest = absent.length > 0 ? ` ${absent.length} did not run.` : '';
    return {
      code: 1,
      message:
        `::error::NO VERDICT — no test job failed, but ${cancelled.length} were CANCELLED ` +
        `(${named}).${rest} A cancelled job ran no tests, so this is not a pass; it is also ` +
        `not a test failure. Re-run the workflow or push to the branch to get a verdict.`,
    };
  }

  if (failed.length > 0) {
    const named = failed.map((leg) => leg.label).join(', ');
    const also = cancelled.length > 0 ? ` (${cancelled.length} more were cancelled)` : '';
    return { code: 1, message: `::error::Test job(s) FAILED: ${named}.${also}` };
  }

  const named = absent.map((leg) => leg.label).join(', ');
  return {
    code: 1,
    message: `::error::Test job(s) did not run: ${named}. A skipped test job is not a pass.`,
  };
}

function main() {
  const { legs } = classify(process.env);
  for (const leg of legs) console.log(`${leg.label}: ${leg.result || '(none)'}`);
  const { code, message } = verdict(process.env);
  console.log(message);
  return code;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
