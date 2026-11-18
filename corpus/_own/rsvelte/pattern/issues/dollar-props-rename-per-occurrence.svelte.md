# `dollar-props-rename-per-occurrence.svelte`

**Issue:** corpus residue

The legacy `$$props` → `$$sanitized_props` rename was decided per LINE: a line holding any `$$props` outside code was skipped whole, and a line holding both a generated read-only-prop call and a source read had the second occurrence lost. Both directions are here — the comment, block comment, string and template rows must keep their spelling (over-rewrite), and `export let b = count + $$props.z` must be rewritten even though `$.prop(…)` is emitted on the same line (under-rewrite). A line rule passes either half alone; only the pair separates it from a per-occurrence one.
