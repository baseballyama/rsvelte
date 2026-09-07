---
'@rsvelte/compiler': patch
---

Server: keep a snippet's parameter list when a default carries TypeScript

`build_snippet_function` rebuilt each parameter by re-parsing its source span,
and the span still covers the TypeScript the parse erased — `(t: string) => t`
spans `t: string`. A slice that failed to re-parse discarded the whole
parameter list, so the emitted function read names it never declared. The
default now comes from the parsed node.
