# `computed-property-dependency-order.svelte`

**Issue:** corpus residue

A computed object-property key is evaluated before its value, so reactive dependency collection must preserve `documents` before `object`. Walking the value first reversed the generated `$.deep_read_state` sequence even though both dependencies were present.
