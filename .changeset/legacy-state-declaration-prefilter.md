---
"@rsvelte/compiler": patch
---

Rule a legacy state variable out with one scan before searching four patterns

`transform_legacy_state_declarations` runs once per legacy statement and loops
over every legacy state variable, formatting and searching up to four needles per
declaration keyword — `let x =`, `let x : `, `let x: `, `let x;`, `let x`. Each
`str::find` built a fresh two-way searcher, and on a legacy-heavy component the
loop is (statements × variables). Every one of those patterns contains the
variable name, so one `memmem` scan settles them all.

Measured on open-webui v0.11.0 (650 components, 554 of them using `export let`),
interleaved paired runs, 6 pairs, all favouring the change: 909.5 ms → 821.9 ms,
**-9.6%**. carbon-components-svelte -6.4%, Huly Platform's plugins -2.8%. Before
the change `str::find` plus its searcher construction was 9.1% of open-webui's
CPU, of which this function alone accounted for 7.7%; it is now 2.0% in total.

Runes-only components are unaffected: the function returns early when there are
no legacy state variables.
