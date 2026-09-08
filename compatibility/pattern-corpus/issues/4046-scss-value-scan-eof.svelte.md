# `4046-scss-value-scan-eof.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

The same scan reaching EOF: `//` is not a CSS comment, so the apostrophe in `can't` opens a string that swallows every terminator and upstream throws `unexpected_eof` at the trimmed template end. A closing-tag pre-scan that answers `css_expected_identifier` at the slash guesses the other branch of this decision.
