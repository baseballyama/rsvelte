#!/usr/bin/env node
// Self-test for scripts/release/vscode-publish-decision.mjs.
//
// Every case below pairs a state the guard must publish from with the
// near-miss it must skip, so a guard that always answered one way fails here.
// The negative controls are the two that have actually shipped a red `main`:
// a failed query read as "not published", and an unlisted-but-name-reserved
// Marketplace read as "not published".

import { cmp, decide } from './vscode-publish-decision.mjs';

const PLATFORMS = ['universal', 'darwin-arm64', 'linux-x64'];

let failures = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function run(overrides) {
  return decide({
    target: '0.5.2',
    mp: null,
    ovsx: null,
    hasOvsx: false,
    force: false,
    platforms: PLATFORMS,
    ...overrides,
  });
}

const live = (...versions) => new Set(versions);

console.log('vscode-publish-decision self-test');

check('cmp orders x.y.z numerically, not lexically', () => {
  assert(cmp('0.5.10', '0.5.9') > 0, '0.5.10 must be newer than 0.5.9');
  assert(cmp('0.5.2', '0.5.2') === 0, 'equal versions compare equal');
  assert(cmp('0.5.2', '0.6.0') < 0, '0.5.2 must be older than 0.6.0');
});

check('first publish: both registries empty → publish everything', () => {
  const d = run({ mp: { latest: null, live: live() }, ovsx: { latest: null } });
  assert(d.needMp === true, 'must publish to the Marketplace');
  assert(d.missingMp.length === PLATFORMS.length, 'every platform is missing');
  assert(d.mpReason === 'publish', `reason was ${d.mpReason}`);
});

check('a failed Marketplace query publishes nothing', () => {
  const d = run({ mp: null, ovsx: { latest: null } });
  assert(d.needMp === false, 'an unknown state must not publish');
  assert(d.mpReason === 'query-failed', `reason was ${d.mpReason}`);
});

check('a failed Open VSX query publishes nothing there', () => {
  const d = run({ mp: { latest: null, live: live() }, ovsx: null, hasOvsx: true });
  assert(d.needOvsx === false, 'an unknown state must not publish');
});

check('every platform live → nothing to publish', () => {
  const d = run({
    mp: { latest: '0.5.2', live: live(...PLATFORMS) },
    ovsx: { latest: '0.5.2' },
  });
  assert(d.needMp === false, 'nothing is missing');
  assert(d.mpReason === 'up-to-date', `reason was ${d.mpReason}`);
});

check('one platform missing → only that platform is published', () => {
  const d = run({
    mp: { latest: '0.5.2', live: live('universal', 'darwin-arm64') },
    ovsx: { latest: '0.5.2' },
  });
  assert(d.needMp === true, 'the missing platform must be published');
  assert(
    d.missingMp.length === 1 && d.missingMp[0] === 'linux-x64',
    `missing was ${JSON.stringify(d.missingMp)}`,
  );
});

check('a newer live release supersedes ours → skip', () => {
  const d = run({ mp: { latest: '0.6.0', live: live() }, ovsx: { latest: '0.6.0' } });
  assert(d.needMp === false, 'the release already moved on');
  assert(d.mpReason === 'superseded', `reason was ${d.mpReason}`);
});

check('gallery empty while Open VSX already has the target → name reserved, skip', () => {
  const d = run({ mp: { latest: null, live: live() }, ovsx: { latest: '0.5.2' } });
  assert(d.needMp === false, 'publishing here is rejected as "already exists"');
  assert(d.missingMp.length === 0, 'nothing may be packaged for the Marketplace');
  assert(d.mpReason === 'name-reserved', `reason was ${d.mpReason}`);
});

check('name-reserved does NOT swallow the next version', () => {
  // Open VSX behind the target is the discriminating half: the same empty
  // gallery must still produce a real publish attempt for a new version.
  const d = run({
    target: '0.5.3',
    mp: { latest: null, live: live() },
    ovsx: { latest: '0.5.2' },
  });
  assert(d.needMp === true, 'a new version must still be attempted');
  assert(d.mpReason === 'publish', `reason was ${d.mpReason}`);
});

check('force publishes through every skip', () => {
  for (const mp of [null, { latest: null, live: live() }, { latest: '0.6.0', live: live() }]) {
    const d = run({ mp, ovsx: { latest: '0.5.2' }, hasOvsx: true, force: true });
    assert(d.needMp === true, 'force must reach the Marketplace');
    assert(d.needOvsx === true, 'force must reach Open VSX');
  }
});

check('Open VSX is skipped without a token, whatever its state', () => {
  const d = run({ mp: { latest: null, live: live() }, ovsx: { latest: null }, hasOvsx: false });
  assert(d.needOvsx === false, 'no token, no publish');
});

if (failures > 0) {
  console.error(`\n${failures} case(s) failed`);
  process.exit(1);
}
console.log('\nall cases passed');
