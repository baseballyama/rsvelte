---
'@rsvelte/language-server': patch
---

fix(language-server): answer "is this inside generated code" the way upstream does

Upstream has one `isInGeneratedCode`
(`language-server/src/plugins/typescript/features/utils.ts:102-109`). The rename
correction layer carried its own second answer, and it disagreed with upstream in
two independent ways.

`lastIndexOf(needle, from)` in JS matches a needle *beginning* at or before
`from`, so it finds a marker straddling the position; `text[..start].rfind(…)`
requires the needle to end before `start`, so it does not. And upstream's
`lastEnd === nextEnd` disjunct — whose own comment says it fires when the
position sits inside an END marker — had no counterpart at all.

The reachable case is a position on a marker's own leading `/`, which is exactly
where a TypeScript node's `pos` sits: `getStart()` skips leading trivia and `pos`
does not. Upstream answers *generated* there and the rename port answered *not
generated*. Measured over every position of six texts, the two disagree only at
or inside a marker's own bytes; every ordinary span already agreed.

Both markers open and close with `/`, so `/*Ωignore_endΩ*/` immediately followed
by its own tail contains a second end marker starting one byte before the first
one ends. JS `lastIndexOf` finds it and a non-overlapping scan does not, so the
port scans overlapping positions; a randomized comparison against upstream's
verbatim source over 256,462 probes reports 0 disagreements, with the
non-overlapping variant kept as a live control at 131.

`textDocument/rename` is requested by nothing under `scripts/compat-lsp/` — the
ratchet holds 0 rename keys against 3,569 for hover — so no gate has ever
compared this predicate and no ratchet moves. Whether tsgo returns a rename span
whose start abuts a marker is unmeasured, and two call-site guards could mask it,
so this may change no observable behaviour.

The marker constants were defined twice inside the crate, which is what let two
predicates exist; there is now one definition and one predicate.
