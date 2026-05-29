---
"@rsvelte/compiler": minor
---

Bundle 71 compiler/AST correctness commits since 0.5.1 (Svelte target stays at 5.55.9). Highlights:

- **async / blockers**: sync-statement grouping in the async-body transform (5.54.1), transitive `touch`-through-assignments in `compute_blocker_map` (5.55.1), `{#await await ...}` async-batching (5.55.9), `$derived(await ...)` nested-fn `$.save` lowering + then-arg shadowing (5.55.9), `has_more_blockers_than` IfBlock flattening guard and `@debug` blocker plumbing (5.55.3/5.55.6), `async-eager-derived` blocker reorder (5.53.12), `$inspect` after top-level await, `$$promises` threaded through head effects.
- **`@const`**: per-const-tag blocker computation (5.55.3).
- **CSS**: upstream-matching selector pruning + `:where()` composition.
- **parse**: comments between attributes and in expressions, OXC-AST script-statement splitting, empty transition/in/out directive name rejection, attribute-shorthand bare-identifier rule, assignment-target preservation for for-of/for-in.
- **analyze**: lexical-scope resolution of same-name rune declarations, `NewExpression` template-literal coercion.
- **server**: SSR rune rewrite inside `{#if}` tests (5.55.4), multi-line declaration collapse in `extract_constant_vars`.
- **napi**: upgrade napi-rs to v3 (compat-mode), RAII arena guard + zero-copy envelope offset/length validation.
- **client**: whitespace-tolerant `$bindable` / `$props.id()`, call-only `<title>` memo binding, logical-assign proxy + store ops.

Plus ~50 smaller correctness fixes from the review backlog.
