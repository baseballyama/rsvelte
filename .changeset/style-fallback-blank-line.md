---
"@rsvelte/fmt": patch
---

Stop inserting a blank line when a `<style>` body fails to parse. The native CSS
formatter's parse-error path returns the body verbatim, but the body begins at the
newline after `<style>` while the caller splices its own — so every block the CSS
parser rejects gained a blank line and shifted its rules down one line.
