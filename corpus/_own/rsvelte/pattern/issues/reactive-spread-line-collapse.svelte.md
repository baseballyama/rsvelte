# `reactive-spread-line-collapse.svelte`

**Issue:** corpus residue

The chain-continuation collapse joins a line starting with `.` onto the line above, but a spread element also starts with `.`; joining it swallows the spread when the line above ends in a `//` comment.
