---
"@rsvelte/fmt": patch
---

Fix two block-header formatting divergences from the oracle. A call with a spread final
argument (e.g. `{#each list.getGrid(alpha, ...rest) as m}`) was mistaken for a call-chain
break and split across lines; it now stays on one line like every other block header. A
call whose only multi-line argument is an arrow function with a block body (e.g.
`{#if useEffect(() => { run(); }, [depA, depB])}`) now reindents its continuation lines to
the header's own depth instead of OXC's column-0 output.
