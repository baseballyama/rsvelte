# `3181-props-id-in-module-script.svelte`

**Issue:** [#3181](https://github.com/baseballyama/rsvelte/issues/3181)

The illegal half — `$props.id()` in `<script module>`, which rsvelte compiled into output referencing an undefined global. Scored as an error **code** comparison, and the corpus error ratchets additionally compare the message and both endpoints, which is what gates the reworded `props_id_invalid_placement` text
