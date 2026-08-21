---
'@rsvelte/compiler': patch
---

Report malformed markup where the official compiler does. `expected_token` is now a point rather than a one-column span (upstream passes a bare index, and `errors.js` reads it for both endpoints); a `{:else}` / `{/if}` with nothing open points at the `:` / `/` instead of the `{`; `<br / title="a">` demands the `>` immediately after the `/` rather than past the whitespace; an unterminated comment, `<style>`, `<script>` or attribute quote runs out where the right-trimmed template ends instead of after the file's trailing whitespace, and an unclosed `<script>` distinguishes `element_unclosed` from `unexpected_eof` the way upstream does; and a closing tag missing its `>` (`</div` ⊣) or a mustache missing its `}` (`{@html z` ⊣) is now an error instead of compiling with the construct silently dropped
