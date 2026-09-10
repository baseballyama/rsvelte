---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fmt: charge a directive value's `name={` prefix to its first line only

Once an open tag wraps, a directive value was formatted at a print width
narrowed by its own `class:<name>=` prefix, so continuation lines that fit at
their real indent were broken again (`selected_category.id ===` / `category.id}`
where prettier keeps `selected_category.id === category.id}`), and the per-shape
discounts that softened that for arrow bodies and object literals left an
object flat past the print width where prettier expands it.

The prefix is now a first-line offset: the expression is formatted with a
same-line placeholder of the prefix's width in front of it and the full width
for every later line, which is how prettier's printer measures each group
against the column it starts at.
