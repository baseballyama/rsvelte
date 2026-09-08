# `prop-mutation-location-value-matching.svelte`

**Issue:** corpus residue

The dev ownership validator's `(line, column)` is matched back to a source mutation by the identifier words of the assigned value, and three shapes broke that match: a right-hand side that opens on the line after its `=` or spans several lines collected no words at all, a trailing line comment contributed words the generated expression never carries, and the setter call's own `, true)` tail added a `true` that collided with a sibling `x = true`. The `$:` body and the template handler pin the emission order the same-valued sites are consumed in.
