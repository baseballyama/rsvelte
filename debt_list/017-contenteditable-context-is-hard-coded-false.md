# P2 — client child processing never tracks bound contenteditable context

Category: runtime compatibility

Evidence: `process_children` hard-codes `within_bound_contenteditable = false` with an implementation TODO (`crates/rsvelte_core/src/compiler/phases/3_transform/client/visitors/shared/fragment.rs:249-258`). Downstream child/update decisions therefore cannot observe the parent binding context official Svelte carries.

Impact: text/expression updates under bound or nested contenteditable elements can differ in DOM preservation and hydration behavior.

Remediation: propagate the official fragment traversal state from the owning element/binding instead of recomputing or using a constant.

Acceptance: browser fixtures for nested contenteditable, relevant bindings, interpolation updates, and SSR hydration match official behavior and generated output.
