---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

svelte2tsx now removes an instance script's `export` modifier only for the declaration kinds upstream removes it for. Upstream's `processInstanceScriptContent` reaches an allow-list — `VariableStatement`, `FunctionDeclaration`, `ClassDeclaration`, and a whole-statement `ExportDeclaration` — and keeps `export` on everything else; rsvelte had transcribed that decision inside out, stripping for every kind except `TSTypeAliasDeclaration` and `TSInterfaceDeclaration`. So `export namespace`, `export enum`, `export const enum`, `export declare module` and `export import x = require()` each lost an `export` upstream keeps, which drops them from the module's export surface in the projected `.tsx`.
