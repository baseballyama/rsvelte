# `2720-is-leading-unused-branch.svelte`

**Issue:** [#2720](https://github.com/baseballyama/rsvelte/issues/2720)

`:is(.a, .b)` with only `.b` used. Both compilers decide the same branch is unused and warn at the same position; what differs is **where the `(unused)` comment is written**. Official comments the branch out in place, taking the trailing comma with it, so the surviving text reads in source order — `:is(/* (unused) .a,*/ .b.svelte-X)`; rsvelte emitted the survivor first and appended the comment — `:is(.b.svelte-X /* (unused) .a*/)`, which reorders the argument list against the source. The unused branch is **leading** because a trailing one cannot tell the two orders apart
