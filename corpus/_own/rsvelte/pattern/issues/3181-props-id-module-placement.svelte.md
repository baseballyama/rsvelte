# `3181-props-id-module-placement.svelte`

**Issue:** [#3181](https://github.com/baseballyama/rsvelte/issues/3181)

The **legal** half of the `$props.id()` placement rule, which is what stops the fix from becoming an over-rejection: the rune in the instance script, beside a `$props.id`-shaped MEMBER expression in `<script module>` that is not the rune at all. A check that keys on the text rather than on the resolved rune rejects that member
