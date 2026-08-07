---
"@rsvelte/compiler": patch
---

Answer the hot expression predicates from the typed AST instead of materializing JSON

Five predicates in the client transform — "does this expression call anything",
"does it read reactive state", "is this a `$store` member expression", the
expression-tag metadata flags, and the analyze-phase feature walk — each asked
their question by turning the expression into a `serde_json::Value` tree and
walking that. The tree is built for the question and thrown away, and
`JsNode::to_value` alone accounted for 15.8% of every allocation the compiler
made on a 2,123-file corpus.

Each predicate now walks the typed nodes directly and keeps its JSON walk as
the fallback for the shapes the typed walk cannot reach (opaque
`type_annotation` / comment blobs). On the same corpus that drops `as_json`
calls from 49,776 to 15,056 and JSON materializations from 27,488 to 12,089,
with byte-identical output across 14,036 client/server × prod/dev comparisons.
