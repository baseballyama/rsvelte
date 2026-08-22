---
"@rsvelte/compiler": patch
---

Hoist a root-level snippet that declares a nested snippet. Rendering the nested one read as an instance-level reference, so the whole snippet stayed inside the component function; a nested snippet binds its name in the same fragment, which upstream's `binding.scope.function_depth >= scope.function_depth` skip already allows. The nested body is now checked rather than skipped, so a nested snippet that reads instance state still pins its parent.
