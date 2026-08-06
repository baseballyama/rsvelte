---
"@rsvelte/compiler": patch
---

Trim trailing comments from `$props()` destructuring declarators

A `//` comment between the last entry of a `$props()` pattern and its closing brace
stayed glued to the declarator text, so the `= $.rest_props($$props, rest_excludes)`
initializer the client transform appends landed *inside* the comment. The result still
parsed — no error, no warning — but the rest binding was declared and never assigned, so
every forwarded attribute silently disappeared at runtime. The declarator splitter was
already comment-aware; only its caller was, and only for *leading* comments. Both ends of
each declarator are now trimmed lexically through `shared::js_scan::skip_opaque`, which
steps over strings, template literals, regexes and both comment forms.
