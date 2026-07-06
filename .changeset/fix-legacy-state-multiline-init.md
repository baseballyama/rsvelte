---
"@rsvelte/compiler": patch
---

fix(transform): client legacy `$.mutable_source` wrapping handles inits on the next line

The legacy state-declaration transform matched `let x = <init>` with a hardcoded
trailing space after `=`, so a declaration whose initializer begins on the
following line — e.g. `let selectedDayOfWeek: DayOfWeek =\n  $format.settings…` —
did not match the init-bearing pattern. The declarator was mis-wrapped as an
empty `$.mutable_source()` and its initializer was orphaned as a dangling
statement (`$.mutable_source();\n $format()…;`).

Match `=` without the trailing space, guard against `==` / `=>`, and skip any
whitespace (including newlines) between `=` and the initializer before reading
the init expression. Removes
`svelte-ux/packages/svelte-ux/src/lib/components/DateRange.svelte` from
known-failures.client.json.
