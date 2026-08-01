---
"@rsvelte/compiler": patch
---

fix(compiler): keep class members that share a source line — `class Foo { n = $state(1); d = $derived(this.n * 2); }` used to drop the `$derived` backing field and its accessors from the emitted class
