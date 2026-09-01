---
"@rsvelte/svelte2tsx": patch
---

Emit parseable TypeScript from `--mode dts` when an interface's heritage clause carries a comment.

The `interface X extends Y { … }` → `type X = Y & { … }` rewrite reconstructed three positions by scanning raw text — a backward walk to the `extends` keyword that skipped whitespace but not comments, a `find(',')` for the separator between entries, and a `find('{')` for the body. A comment defeated all three: `extends` survived (`type X extends …`), and a `,` or `{` written inside a comment took the operator into the comment's body. All three now come from spans, as upstream's does. The trailing ` & ` moves with them, so the join now spells `Y &  {` like official instead of `Y  & {`.
