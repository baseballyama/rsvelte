---
'@rsvelte/compiler': patch
---

A `$state` write whose value is a prop with an `undefined` destructure default is no longer
wrapped in `$.proxy`. Upstream's `should_proxy` answers `false` for `undefined` in the same
clause as the literal types and resolves a bare identifier by recursing on `binding.initial`;
rsvelte ports that node-type list twice, and `is_non_proxy_node_type` was the correct port's
negation without the `undefined` arm. Two of its four call sites had bolted the arm back on at
the call site and two had not, so the answer depended on which list a binding reached. The
identifier name is now a parameter of the predicate rather than a caller-side `||`.

Measured one cell per shape against the official compiler: 8 of 24 diverged before and 2 after,
the remaining 2 being a `<script module>` local that reaches a different port (0 carriers over
33,545 corpus files). A 134,180-unit four-target sweep moves 2 units, both `MISMATCH -> match`.
