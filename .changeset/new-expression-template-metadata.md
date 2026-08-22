---
"@rsvelte/compiler": patch
---

Walk a `NewExpression`'s callee and arguments when the client computes a template expression's metadata. Upstream's `NewExpression` visitor only calls `context.next()`, so a `new` contributes no flag of its own; rsvelte had no arm for it, so the catch-all marked every `new` reactive — `{new String(s)}` over a non-reactive binding became `$.template_effect(() => $.set_text(…))` where official assigns `nodeValue` once — while `has_call` / `has_member` / `has_await` were not propagated out of it at all, so `{new String(f())}` and `{new (getC())()}` got the bare-closure form instead of the memoized dependency-array one.
