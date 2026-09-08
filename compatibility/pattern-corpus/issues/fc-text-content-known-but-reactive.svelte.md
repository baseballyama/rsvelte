# `fc-text-content-known-but-reactive.svelte`

**Issue:** corpus residue

The `textContent` shortcut is gated on `metadata.expression.has_state`, never on whether the value is known. `Identifier.js:95` sets that per identifier, so `<em>x{void p}</em>` over a prop keeps its own text node even though the chunk folds to `x`; a non-reactive `{fixed}` takes the shortcut and a reactive `{s}` gets a `template_effect`. The three elements are each other's controls.
