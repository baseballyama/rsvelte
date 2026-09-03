---
"@rsvelte/compiler": patch
---

A tagged template with a pure tag no longer forces a `$.template_effect`

`TaggedTemplateExpression.js` sets `has_state` from the tag's purity alone, so
`pattern={String.raw`…`}` is written once at init. rsvelte's `has_reactive_state_json` had no
arm for the node type and fell into its conservative `_ => true`.
