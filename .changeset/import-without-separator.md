---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(client): hoist an `import` written with no whitespace after the keyword. `import"pkg";` — the form Bun's TypeScript transpiler prints — was left inside the component function, which is a syntax error; `import*as ns from"pkg"` and the semicolon-free `import{x}from"pkg"` were affected the same way. `import ("pkg")` is no longer mistaken for a declaration.
