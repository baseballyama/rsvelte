---
'@rsvelte/compiler': patch
---

Drop comments from destructuring-pattern segments so a comment cannot become a binding name

A comment inside a legacy destructuring pattern was carried into the segment that
`split_derived_object_properties` / `split_derived_array_elements` return, and every
consumer reads a segment as pattern text. A comment-only segment therefore became a
declarator named `// c`, which commented out the rest of the emitted line including its
`;` — the declaration never terminated and the whole module stopped parsing.
