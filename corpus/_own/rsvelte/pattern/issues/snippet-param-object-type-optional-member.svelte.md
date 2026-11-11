# `snippet-param-object-type-optional-member.svelte`

**Issue:** corpus residue

The type-annotation stripper looked for `?:` anywhere in a parameter's source, so an optional member of an object type (`b: { t?: string }`) named the parameter `b: { t`; the list then failed to re-parse and every parameter was dropped. A required-member object type and a top-level `a?: boolean` are the controls.
