---
"@rsvelte/fmt": patch
---

fix(formatter): break a prose expression/render tag's call arguments in place

A long call inside an expression or render tag in prose (`… LineChart. {format(
chartData.length,
)} data points`) was treated as an atomic fill word, so rsvelte wrapped at the
word boundary before it instead of breaking the call's arguments in place and
gluing the following word to the `)}` line. Prettier builds such a paragraph as
fill + expression-tag concat + fill — the tag sits outside the fill with its own
call-arguments group — so the tag breaks internally while its neighbors stay
glued. Element-body prose now represents multi-line content tags as a breakable
flat/broken doc inside the run, reproducing that layout; all other call sites
keep the previous atomic behavior.
