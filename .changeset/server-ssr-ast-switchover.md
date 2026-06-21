---
"@rsvelte/compiler": patch
---

Phase-3 server: the pure oxc-AST + `rsvelte_esrap` SSR pipeline (`server/ast/`)
now matches the official Svelte compiler byte-for-byte across the entire curated
suite — runtime-runes 993/993, runtime-legacy 1205/1205, hydration 77/77, the
byte-exact `compiler_fixtures` / `ssr` snapshots, and 100% of every
compatibility-report category. It remains OPT-IN behind `RSVELTE_SERVER_AST=1`;
the text-based `ServerCodeGenerator` is still the default. The switchover to
default is deferred: enabling the AST pipeline by default currently regresses 88
real-world corpus entries on SSR (chiefly an over-eager `$.stringify(...)` wrap
on conditional class/title interpolations, dropped instance-script comments, and
a few function/`$$settled` ordering and slot-arg cases), which must be fixed
first. See `docs/phase3-server-ast-remaining-work.md`. No change to default
output; corpus baseline holds at 120.
