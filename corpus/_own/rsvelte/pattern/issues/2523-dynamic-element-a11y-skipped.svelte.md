# `2523-dynamic-element-a11y-skipped.svelte`

**Issue:** [#2523](https://github.com/baseballyama/rsvelte/issues/2523)

The other side of the same fix: the rules upstream guards on a statically known tag (`scope`, `aria-activedescendant`, click-without-key, non-interactive `tabindex`, required `role` props) must stay **silent** on a dynamic tag, a dynamic ancestor must suppress `a11y_autofocus` / `a11y_figcaption_parent`, and an **empty** `<svelte:element>` child must not count as content. Without this half, forwarding to the checker with `is_dynamic_element = false` scores green
