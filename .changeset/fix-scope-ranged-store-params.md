---
"@rsvelte/compiler": patch
---

fix(transform): scope-range store-subscription parameter shadows

A `$name` used as a function/arrow parameter (including inside array/object
destructuring, e.g. `([$s, $focused]) => …`) was added to a script-global
"declared" set, suppressing genuine top-level store subscriptions of the same
name everywhere. Parameter shadows are now scope-ranged to the parameter's own
arrow body, so a real `$initialized` subscription outside that body is still
detected, while a destructured `$focused` param no longer produces a spurious
subscription. Mirrors upstream scope resolution.
