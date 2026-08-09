# P3 — benchmark installs its lint oracle without a lockfile

Category: reproducibility / supply chain / performance measurement

Evidence: `scripts/bench/run-benchmark.mjs:89-95` runs `npm install --no-package-lock` for the eslint-plugin-svelte oracle at benchmark time.

Impact: identical rsvelte commits can measure different transitive dependency versions on different days, invalidating regression comparisons and adding an avoidable registry supply-chain input.

Remediation: commit an isolated lockfile and use `npm ci`, or use the root pnpm lock with a frozen isolated workspace; record the oracle dependency digest in benchmark output.

Acceptance: two clean runs resolve identical dependency trees and report the same oracle version/hash without modifying lockfiles.
