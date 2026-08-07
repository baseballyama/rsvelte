---
"@rsvelte/compiler": patch
---

Scan the comment/string state once per source for prop-mutation validation

`PropMutationSites::collect` re-ran the comment/string scanner from the last
accepted site for every candidate occurrence of every prop, and recomputed the
`$:` statement ranges once per prop. Both scans are prop-independent, so they
now run once per source and each candidate is a binary search.

Interleaved paired runs, dev-mode client: carbon-components-svelte −37.7%
(8/8), SMUI −16.0% (8/8), open-webui −15.9% (8/8), Huly plugins −10.6% (6/6).
Production-mode client is unchanged (−0.1%).
