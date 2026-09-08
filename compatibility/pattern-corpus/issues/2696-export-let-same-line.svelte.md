# `2696-export-let-same-line.svelte`

**Issue:** [#2696](https://github.com/baseballyama/rsvelte/issues/2696)

A legacy `export let` followed by another top-level declaration on the **same physical line**. The instance pipeline must use parsed statement spans to split the declarations; treating the full line as the export declaration swallows the second statement into `$.prop(...)` and emits invalid JavaScript. Kept deliberately unformatted because formatting splits the only triggering boundary.
