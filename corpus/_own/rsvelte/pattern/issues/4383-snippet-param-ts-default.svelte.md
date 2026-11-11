# `4383-snippet-param-ts-default.svelte`

**Issue:** [#4383](https://github.com/baseballyama/rsvelte/issues/4383)

The server rebuilt a snippet's parameter list by re-parsing each parameter's SOURCE SPAN, and the span still covers the TypeScript the parse erased — `(t: string) => t` spans `t: string`. A slice that failed to re-parse made `reparse_params` return `None`, and the caller then fell back to `($$renderer)`, discarding EVERY declared parameter while the body still read them. The default now comes from the parsed node. `sibling` is the amplifier — one unreadable parameter took its neighbour with it — and `annot`, `asExpr` and `plain` are the controls that were already right. The reported spelling, a `<string>()` cast on an arrow, is pinned in `snippet_param_ts_default_4383.rs` instead of here: the fmt oracle rewrites it to `<string,>` ([#4399](https://github.com/baseballyama/rsvelte/issues/4399)), which would enrol this file in a second gate's ratchet for an unrelated reason.
