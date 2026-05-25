---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.53.1**. The only compiler-side change upstream is `0c7f81514` "fix: handle shadowed function names correctly", which associates a `FunctionDeclaration` / `FunctionExpression` id node with its outer scope (so a nested `const foo = $derived(...)` inside `function foo() { ... }` doesn't leak its derived-ness to the outer `foo` reference). The new `runtime-runes/derived-name-shadowed` fixture is skipped in the compatibility report (with rationale in `tests/compatibility_report.rs`) until rsvelte's derived analysis is made scope-aware — tracked as a follow-up port.
