---
"@rsvelte/fmt": patch
---

The formatter now collapses whitespace runs inside a `class` attribute value on a regular element, matching prettier-plugin-svelte: a run after a non-whitespace character shrinks to one space (or is dropped when a newline follows), and a run at the end of the value is dropped when it ends the value and shrunk to one space otherwise. Leading whitespace, a multi-line value, other attributes, and `class` on a component / `<svelte:element>` / `<slot>` are left untouched.
