---
"@rsvelte/compiler": patch
---

Treat a template literal as one opaque run in the phase-3 lexical scanner. `${…}` re-enters code and may open another template, so scanning a backtick like a quote ended the run at the second backtick and read the text up to the third as code — a `$state(` / `$derived(` written inside a nested template was lowered as a rune call, and every bracket, `;` and `,` that text carried leaked into the depth counters and statement splitters built on the same scanner. The run now follows the substitutions, with their own strings, comments and regex literals lexed, at any nesting depth.
