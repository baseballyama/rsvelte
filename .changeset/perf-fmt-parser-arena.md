---
"@rsvelte/fmt": patch
"@rsvelte/compiler": patch
---

perf(fmt): make the formatter significantly faster; borrow the parser AST from source

A sweep of formatter and parser performance work, all verified byte-for-byte
identical against the full compiler test suites and the formatter parity corpus
(no output changes).

**Formatter (`@rsvelte/fmt`) — significantly faster.** On real-world corpora the
multi-threaded CLI is roughly **1.4× faster** than before, and single-threaded
in-process formatting is down ~40% from the start of this work. The wins stack:

- `mimalloc` as the `rsvelte-fmt` CLI global allocator — removes the page-churn
  the system allocator paid streaming one file at a time (the largest CLI win).
- The initial parse now **defers `<script>` bodies and template expressions**:
  the formatter re-parses both from source anyway, so the eager phase-1 parse was
  pure waste. TypeScript-in-plain-`<script>` (#682) still round-trips via a
  dialect-sensitive retry.
- A **per-thread oxc scratch allocator** reused across a file's throwaway parses,
  a `Doc` printer that **borrows** instead of cloning its measured subtree, and
  expression fast-paths + within-file memoization for repeated expressions.
- The collapse post-pass re-parse is gated on a structural candidate check and
  reindent/reflow scans bytes instead of `Vec<char>`.

**Parser AST (`@rsvelte/compiler`) — internal zero-copy refactor.** The parser
AST gained a source lifetime (`Root<'a>`) and `Text` nodes now borrow their raw
data directly from the source (`Cow<'a, str>`) instead of copying it, trimming
per-file allocations in the parse phase. This is an internal refactor only — the
compiler's output and public API are unchanged.
