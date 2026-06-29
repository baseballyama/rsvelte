---
"@rsvelte/fmt": patch
---

fix(fmt): move the open `>` to its own line for a hug-start pure-text element with a wrapped open tag

A pure-text element/component with a wrapped (multi-line) open tag whose body
hugs the open tag (shouldHugStart) but ends with whitespace before the close tag
(shouldHugEnd = false) is handled by `try_collapse`. It kept the open `>` glued to
the last attribute (`disabled>Disabled button`) instead of dropping it onto its own
indented line:

```
<Button
  disabledClasses="…"
  disabled
  >Disabled button
</Button>
```

`try_collapse`'s `had_trail` branch now reconstructs the open `>` on its own
attribute-indented line, mirroring `build_element_doc`'s hug_start assembly (whose
`indent([softline, group(['>', body])])` softline breaks once the open tag wrapped)
— the pure-text counterpart of the `try_hug_mixed` hug-start fix.

Burns down the fmt-parity corpus by 1 (79 known failures; smelte).
