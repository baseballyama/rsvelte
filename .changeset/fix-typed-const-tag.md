---
"@rsvelte/fmt": patch
---

Fix a regression where a `{@const}` tag carrying a TypeScript type annotation
(`{@const name: Type = value}`, e.g. an exhaustiveness check
`{@const _: never = column}`) failed with `script parse failed`. The collapse
path was formatting the tag body as a bare expression (`(name: Type = value);`),
which is not valid; it is now formatted as the TS variable declaration it
actually is (`const name: Type = value;`) using the same TS-aware parse path as
`<script lang="ts">`, so the type annotation is parsed and preserved.
