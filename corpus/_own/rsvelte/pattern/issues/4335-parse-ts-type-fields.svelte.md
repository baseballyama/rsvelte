# `4335-parse-ts-type-fields.svelte`

**Issue:** [#4335](https://github.com/baseballyama/rsvelte/issues/4335), [#4133](https://github.com/baseballyama/rsvelte/issues/4133)

Every TypeScript type field `parse()` used to erase, in one file. The nine fields have three producers, not one: the typed path, and two `Value`-path writers reached whenever a class is bailed out of the typed walk -- which **any** TS member modifier on **any** sibling does, so `private label` here is what routes `wrap<U>` and its `: U` through the second writer. Nine constructed cells retired 14 of the 18 ratchet keys and left 4 listed; the survivors were the only signal that the key was counting a second producer. Held together because a fragment that fails to parse drops the whole file to a different path, so a per-field file cannot see them interfering.
