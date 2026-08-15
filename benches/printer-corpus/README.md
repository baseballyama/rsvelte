# Printer benchmark corpus

The first eleven files are fixed CSR outputs generated from `benches/corpus/*.svelte` by
rsvelte at commit `38b4f2a56`, with a terminal newline added. They are committed so
compiler-transform changes cannot move the printer workload. `12-comments-common.js` adds
the statement-level comments supported by all three compared printers.

CI parses each input once and measures code-only, decoded-source-map, and common-comment
printing for `rsvelte_esrap` and `oxc_codegen`. The site report runs the same cases with
JavaScript `esrap` 2.3.2 on the same native runner. Parsing is outside every timed sample.

`manifest.json` records each input digest and the aggregate workload digest. Update both only
when intentionally changing the benchmark population.
