# `is-branch-unused-warning-position.svelte`

**Issue:** warning-position residue

`branch_is_marked_unused` reads the set the unused walk itself fills, so a rule asked before its own `:is()` branch is marked answers against an empty set, is judged used, and its warning moves from the whole prelude onto the branch inside the parentheses. The printer runs the marking pass first; the warning path did not, which is why the two disagreed. **Order is load-bearing in this file**: the first rule is the control (it is used, so its dead branch is correctly reported on the branch) *and* it is what leaves the shared set non-empty for the second — reversing the two makes the defect unreachable and the repro non-discriminating.
