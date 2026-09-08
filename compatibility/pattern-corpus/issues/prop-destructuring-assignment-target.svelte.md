# `prop-destructuring-assignment-target.svelte`

**Issue:** corpus residue

`validate_mutation` runs on the source `AssignmentExpression`, and bails unless its `left` is a `MemberExpression` — so `[items[i], items[s]] = …` and `({ a: items[0] } = src)` are not prop writes, even though rsvelte lowers each leaf to the same setter call a plain write produces. The generated program cannot tell the two apart (an object pattern needs no temporary at all), so the answer comes from the source: a prop the source never writes through a member of gets no wrap. `obj.count = 1` is the positive control. A member target carrying a pattern **default** (`({ p: obj.z = 3 } = src)`) still reads as a site to the source scan and is still wrapped — measured residue, not covered here.
