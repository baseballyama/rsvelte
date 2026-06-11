---
"@rsvelte/compiler": patch
---

Corpus output-parity fixes (known failures 262 → 125, on top of wave 6):
`should_proxy` identifier-binding resolution + `SequenceExpression`; comment-only
`<script module>` dropped; `$props.id()` evaluates to a defined string (server);
`TEMPLATE_USE_IMPORT_NODE` for static `<video>` / custom elements; known-global
calls (`Math.*`/`Number`/`String`/`BigInt`) skip the `?? ""` coalesce in text
interpolation; server-module public `$state` class fields stay public; scoped
`<svelte:element>` emits its scope class on the server; CSS rendering handles
whitespace in the `</style>` closing tag.
