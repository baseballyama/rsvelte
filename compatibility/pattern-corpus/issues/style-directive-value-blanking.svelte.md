# `style-directive-value-blanking.svelte`

**Issue:** corpus residue

svelte2tsx moves a `style:` value out of the start tag, so the reference left in `__sveltets_2_ensureType(String, Number, …)` is the value **blanked**: its whitespace characters survive in order, a non-empty run without whitespace collapses to one space, an empty run stays empty, and the wrapping quote is the source's own (`'red'` → `' '`). rsvelte had that rule in the multi-part arm and a hardcoded `" "` in the single-text arm — one upstream function ported into one of two branches. The preserved class is JavaScript's `\s`, which is neither `char::is_whitespace` (U+FEFF, U+0085 both wrong) nor ASCII, and the run blanked is the **decoded** value, so `a&nbsp;b` keeps U+00A0. The mustache, shorthand and multi-part rows are the controls.
