---
'@rsvelte/compiler': patch
---

The published compiler is built with a checked-in PGO profile.

Held out from its own training set — training selects `--skip 0` and evaluation
`--skip 1` at the same stride, so the two file sets share no file — and measured
over ten ABBA passes with both arms rebuilt from one tree, it is worth 1.100x on
client, 1.111x on server, 1.139x on client-dev and 1.110x on server-dev in the
parallel shape the performance report publishes, with every arm producing a
byte-identical output.

The profile's training set is exactly the set of workloads the flag is applied
to, which is why `parse` and `svelte2tsx` are in it and the formatter, linter and
checker are not: `-Cprofile-use` treats a function with no counters as never
executed, so a profile handed to code it never trained on makes that code colder
rather than merely un-improved.
