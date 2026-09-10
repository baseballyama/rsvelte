---
"@rsvelte/compiler": patch
---

client: a `$props()` declaration the transform removes outright no longer takes its comments with it

When the destructured `$props()` declaration is the script's only statement, the
transform empties the instance script, and the re-emission loop that puts a
dropped declaration comment back is inside `if !trimmed.is_empty()`. The comment
was therefore dropped from the client output entirely. Re-entering the comments
as the script's own text puts them in the comment buffer, where the template
root's declarator — which already carries the source anchor upstream stamps on
it — picks them up, so the output is `var /* c */ i = root();` the way upstream
writes it.

The line break rsvelte still adds after a block comment in this position when
`</script>` and the first element share a source line is #4500 and is unchanged
here.
