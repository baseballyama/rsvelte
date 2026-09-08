# `3136-fragment-scoping-and-directives.svelte`

**Issue:** [#3136](https://github.com/baseballyama/rsvelte/issues/3136)

Children of `<svelte:fragment>` got no scoping class and children of either it or `<svelte:boundary>` lost `class:`/`style:` on the server, because five scoping walks and the class/style synthesizer each re-enumerate the containers they descend into, where upstream reads one flat `analysis.elements`. The file carries a plain `class`, a `class:`, a `style:` and a spread under both containers, since a container that already recurses for one of them is not evidence for the rest
