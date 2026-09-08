# `4115-snippet-cycle-ancestors.svelte`

**Issue:** [#4115](https://github.com/baseballyama/rsvelte/issues/4115)

The one file here that always matched: it is the shape #4115's own fix broke on its way through. `entry` renders `body` and `body` renders `entry`, so resolving either snippet's ancestors hits the recursion bound — and a bounded answer is a function of where the walk started, not of the snippet, so caching one under its own key hands whichever snippet was resolved first to the other and the inner `<ul>` loses `nav.drawer-nav ul ul`. The 70-cell grid that drove that fix could not see it, because every cell in it was a cell the defect broke. `nav.drawer-nav li b` matches nothing and is the control that rejects a fix which resolves the cycle by scoping everything reachable.
