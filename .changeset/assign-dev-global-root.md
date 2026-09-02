---
'@rsvelte/compiler': patch
---

Dev-mode `$.assign` is not emitted for a member chain rooted at a global.

Upstream's `build_assignment` walks the assignment target down to its root identifier and
stops at `if (!binding) return null`, so `document.body.onfocus = handler` is left alone.
rsvelte's settled-script pass had no binding test and wrapped every member assignment.

The guard reads two things, because neither half is sufficient on its own: the pass walks
the instance body, whose imports have been hoisted out of it, so an imported root resolves
nowhere in the fragment and is known only to the component's binding set — while a name
declared inside a function here is not a component binding and is known only to the
fragment. `shadowed global` and `import` are the two rows that separate them.
