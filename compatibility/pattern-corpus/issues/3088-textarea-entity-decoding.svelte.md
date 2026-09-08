# `3088-textarea-entity-decoding.svelte`

**Issue:** [#3088](https://github.com/baseballyama/rsvelte/issues/3088)

`<textarea>` is escapable raw text, so its content decodes character references; rsvelte copied `data` from `raw`, so `&lt;` was escaped a second time and the page showed the source spelling. `<title>`, `<p>` and `<option>` were already right — only the raw-text branch of `parse_raw_text_content` skipped the decode
