# `3218-expected-token-point.svelte`

**Issue:** [#3218](https://github.com/baseballyama/rsvelte/issues/3218)

A self-closed top-level `<script/>`. Upstream passes a bare index to `e.expected_token`, and `errors.js`'s `e()` reads `node.start ?? node` for BOTH endpoints, so the span is a point; rsvelte's helper built `(position, position + 1)` for every `expected_token` it raised
