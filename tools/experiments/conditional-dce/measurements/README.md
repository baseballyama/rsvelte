# Prototype measurements

These files record the full run of `npm test` for this prototype. `summary.json`
records the population, versions, source hashes, and limits. The other JSON files
hold each comparison. `source-files.json` records the complete prototype source.

`native.log` records the separate immutable IR check. `clippy.log` records its
lint check. `structure.log` records the repository layout check. Native Svelte
optimization is not implemented. Corpus coverage, latency, and final minified CSS
maps are unmeasured.

Run the commands in the parent README to make new reports under `results/`.
Temporary paths in the reports identify that run; they are not stable input paths.
