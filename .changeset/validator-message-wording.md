---
"@rsvelte/compiler": patch
---

Align several validator/a11y diagnostic message bodies with the official compiler. The
element name and the ARIA role were swapped in
`a11y_no_interactive_element_to_noninteractive_role` and
`a11y_no_noninteractive_element_to_interactive_role`; the "did you mean" suggestions for
unknown ARIA attributes and roles are now full sentences; `a11y_missing_attribute` picks
its article and joins candidates like upstream; ARIA token / token-list values are quoted
and joined with `or`; an invalid node placement under the immediate parent is now worded
"cannot be a (direct) child of" instead of "cannot be a descendant of"; and reactive
declarations in a module script report that they "only exist" at the top level of the
instance script.
