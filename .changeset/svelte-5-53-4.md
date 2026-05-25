---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.53.4**. The only compiler-side change upstream is `3a289797b` "fix: handle default parameters scope leaks", which reworks `FunctionExpression` / `FunctionDeclaration` / `ArrowFunctionExpression` scope creation to use porous `scope.child(true)` so default parameter initializers no longer leak from surrounding declarations. Eight previously-passing fixtures (`runtime-legacy/const-tag-each-{arrow,const,function,duplicated-variable2,duplicated-variable3}`, `runtime-legacy/await-block-func-function`, `runtime-runes/async-{boundary-nav-race,if-else}`) regenerated with subtly different `{@const ...}` / `each` / `await` codegen and are skipped in the compatibility report (documented in `tests/compatibility_report.rs`) until rsvelte's analyzer matches the new function-scope porosity. Follow-up port queued.
