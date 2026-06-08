---
"@rsvelte/fmt": patch
---

test(fmt): add the svelte.dev formatter parity corpus. A new test suite formats every `.svelte` file and every ` ```svelte ` markdown code block from the `svelte.dev` repo (added as a submodule) and asserts byte-for-byte equality with an `oxfmt(svelte: true)` oracle — `prettier-plugin-svelte` for the Svelte structure plus the oxc engine for embedded JS/CSS, the same layering rsvelte-fmt uses — so diffs isolate rsvelte's Svelte-structure formatting. A third stage runs the `rsvelte-fmt` CLI on whole markdown files vs a direct-oxfmt oracle to guard `.md` delegation. Oracle outputs are precomputed by `pnpm run generate-fmt-corpus` (gitignored, CI-cached by svelte.dev SHA); the suites track progress against committed baselines (`tests/fmt_corpus_baseline.txt`, `tests/fmt_corpus_markdown_baseline.txt`) and fail only on new regressions. Initial: Stage 1+2 726/1148, Stage 3 638/638.
