# `3569-single-attribute-metadata.svelte`

**Issue:** [#3569](https://github.com/baseballyama/rsvelte/issues/3569)

Standalone and multipart regular attributes consume the Phase-2 metadata owned by each expression chunk. Local calls, state arguments and member reads stay visible to Phase 3 on every legal host, while a pure global call remains unpromoted.
