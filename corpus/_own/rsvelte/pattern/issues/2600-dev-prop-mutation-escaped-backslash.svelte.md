# `2600-dev-prop-mutation-escaped-backslash.svelte`

**Issue:** [#2600](https://github.com/baseballyama/rsvelte/issues/2600)

A prop member assignment whose value ends in `\\`, followed by another function. The dev ownership-validator wrap scans forward for the end of the assignment expression; stuck inside the string it spliced the **rest of the script** into the validator call. Client-dev only
