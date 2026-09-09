---
'@rsvelte/language-server': patch
---

fix(language-server): `textDocument/inlayHint` answers `null` when the client enabled no category

`getInlayHints` returns `null` before asking TypeScript for anything when
`areInlayHintsEnabled(userPreferences)` is false (`InlayHintProvider.ts:38-43`),
and `ls-config.ts:515-522` maps each of the six categories from the client's
config with **no fallback** — so a client that sends no `inlayHints` has every
one of them undefined and gets `null`. rsvelte read none of them: the only
occurrence of `inlayHints` in the language server was a literal in
`TsgoPreferences::default()` that turned all six on, so hints were produced
whatever the client asked for and `null` was not a reachable answer.

The config is chosen by the document's own script kind rather than by the
shadow's extension — `getUserPreferences` picks `'typescript'` for
`ScriptKind.TS`/`TSX` and `'javascript'` otherwise
(`LSAndTSDocResolver.ts:339-342`) — which rsvelte could not have got right by
looking at the shadow, because every shadow is a `.svelte.tsx` and so reads as
TypeScript. `is_typescript_component` already answers the question the way
upstream's `DocumentSnapshot` does, so the decision is the sibling of the one
`component_reference_code_lens_enabled` already makes.

Measured against the official server over stdio with the LSP gate's own
configuration, which gives `typescript` all six categories and `javascript`
none. Before, a plain `<script>` component answered a list where official
answered `null`; after, both answer `null`, while a `lang="ts"` component still
answers a list on both sides:

| component | official | rsvelte before | rsvelte after |
|---|---|---|---|
| `codeaction-checkJs.svelte` (plain) | `null` | list | `null` |
| `organize-imports-error.svelte` (plain) | `null` | list | `null` |
| `another-ref-format-date.svelte` (`lang="ts"`) | list | list | list |
| `codeaction-const-reassign.svelte` (`lang="ts"`) | list | list | list |

The `lang="ts"` rows are the load-bearing half: a rule that read the six
categories off rsvelte's own merged defaults, or that keyed on the shadow's
extension, disables hints there too and still turns the plain rows green.

The built-in defaults are removed rather than kept alongside the check, because
upstream forwards exactly what the client asked for; leaving them would mean a
client that enables one category gets six.

`parameterNames` is a string enum (`'literals'` / `'all'` are on, `'none'` is
off) while the other five are booleans, so reading all six the same way is wrong
in both directions — that is one of the pinned cells.
