# `2523-dynamic-element-a11y.svelte`

**Issue:** [#2523](https://github.com/baseballyama/rsvelte/issues/2523)

The a11y rules that upstream still reaches when the tag is **not** statically known — `a11y_no_static_element_interactions`, `a11y_accesskey`, `a11y_autofocus`, `a11y_positive_tabindex`, the `aria-*` spelling / type checks, the `role` checks and `a11y_mouse_events_have_key_events` on a `<svelte:element>`. `check_element` had no call site in `svelte_element.rs`, so the whole pass was absent
