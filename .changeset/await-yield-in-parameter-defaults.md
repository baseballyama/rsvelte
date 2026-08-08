---
'@rsvelte/compiler': patch
---

Reject `await` and `yield` inside a function's formal parameters, which the official compiler raises as `js_parse_error` ("Await expression cannot be a default value") and rsvelte compiled. `export const f = async (p = await load()) => p;` built successfully here while `svelte.compileModule` refuses it, so a file the official compiler will not accept shipped instead of failing loudly. Acorn enforces this and OXC does not, so the check is now applied at every place rsvelte hands source to OXC — the instance and module scripts, `compileModule`, snippet parameters, and template expressions, which parse through a different function and stayed accepting after the script paths were fixed.
