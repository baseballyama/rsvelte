---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): a TypeScript compiler run that did not finish now fails the check instead of reading as zero diagnostics. `run_tsgo` parsed diagnostics out of the compiler's output and never looked at its exit status, so a compiler killed by a signal (OOM), a Go panic or runtime `fatal error:`, a launcher that could not start `node`, or any non-zero exit without a parseable error reported `svelte-check found 0 errors` with exit code 0 (#4715). A non-zero exit is now accepted only alongside a reported `error` diagnostic, a signal or a Go crash banner is always an error, and the last 40 lines of the compiler's output are kept in the message.
