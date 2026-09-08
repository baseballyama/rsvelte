# `state-referenced-locally-no-instance-script.svelte`

**Issue:** warning probe

The second half of the same defect, and the arm the first fix broke: with no `<script>` rsvelte creates no instance scope, so the template sits one level shallower and the hardcoded `+2` in `identifier.rs` stopped lining up. Restoring the collapsed fragment level alone turned this shape from silent into warning (reproduced on `runtime-runes/samples/declaration-tags-each/main.svelte`); the depth is now derived from the root fragment scope instead of assumed. A component whose only `$state` lives in a declaration tag is the whole population — pin it separately, because a file with a `<script>` cannot reach it.
