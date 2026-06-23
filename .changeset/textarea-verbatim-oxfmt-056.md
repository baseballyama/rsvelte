---
"@rsvelte/fmt": patch
---

fmt: treat `<textarea>` as a verbatim whitespace-sensitive element, matching oxfmt 0.56

oxfmt 0.56 formats `<textarea>` content as verbatim raw text (like the browser, where a textarea's text is literal). rsvelte-fmt now matches: the open tag's `>` always hugs the last attribute (never breaks onto its own line, which would inject a newline into the content), and the interior text is preserved unchanged rather than re-indented (tabs → spaces). This is paired with bumping the `oxfmt` oracle dependency to ^0.56.0.
