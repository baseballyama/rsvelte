---
"@rsvelte/compiler": patch
---

css: a nested rule under a `:global(...)`-leading parent is pruned against the component's own DOM again. The ancestor walk abandoned the level because no branch of `:global(.x) .p` was structurally evaluable, so `.a &` was kept and unwarned where the official compiler prunes it; a wholly global prefix constrains nothing above the component, so the walk now continues from the first local compound.
