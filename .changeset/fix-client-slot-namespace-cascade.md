---
"@rsvelte/compiler": patch
---

fix(transform): propagate inferred namespace into nested component slots

When lowering a component's slot content, the client computed the slot fragment's inferred namespace (used for whitespace trimming) but never stored it on the child state's `metadata.namespace`. So a namespace inferred from an `<svg>` deep in one component's slot did not cascade to a nested component's slot whose own children are namespace-inconclusive (only text + components).

For `<Card>…<svg/></Card>` with a `<CardDescription>418.2K Visitors <Badge/></CardDescription>` inside, upstream infers `svg` for the `Card` slot and inherits it down (`infer_namespace`'s `new_namespace ?? namespace` fallback) so the `CardDescription` fragment is also `svg`. rsvelte kept `html`, building `$.from_html` with untrimmed SVG whitespace and mismatched `$.sibling` offsets.

Set `state.metadata.namespace` to the inferred namespace while visiting slot children (save/restore around it), mirroring upstream `Fragment.js`, which puts the inferred `namespace` on the new child `state.metadata`. Removes `shadcn-svelte/…/cards/analytics-card.svelte` from known-failures.client.json.
