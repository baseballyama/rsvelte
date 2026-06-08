---
"@rsvelte/fmt": patch
---

Keep a `<script>` body indented after a regex literal that contains quotes.

The body is formatted at indent 0 then re-indented one level under `<script>`. The re-indent scanner tracks string / comment / template context to avoid misreading a quote or `` ${ `` that sits inside one, but it doesn't lex regex literals — so quotes inside a regex (`/["']x/`) opened a string that never closed. The spuriously-open string then swallowed every following newline, and the rest of the body collapsed to column 0 (idempotent and still valid JS, so earlier break/idempotency checks didn't catch it; it surfaced as an `oxfmt` divergence). The scanner now treats a raw newline inside a string as a desync and recovers at the line boundary, so the body stays correctly indented.

The attribute-value re-indent in `markup.rs` carried a byte-for-byte copy of the same scanner (with the same latent bug); it now shares the fixed `reindent` helper instead.
