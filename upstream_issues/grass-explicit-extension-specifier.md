# `grass` cannot resolve a `@use` / `@import` / `@forward` specifier that carries an explicit `.scss` extension

dart-sass accepts both `@use "./vars"` and `@use "./vars.scss"`. `grass` 0.13.4
accepts only the extension-less form; with the extension it fails with
`Error: Can't find stylesheet to import.` even though the file is a sibling of
the importing file.

## Reproduction

```
_vars.scss     $c: red;
plain.scss     $d: blue;
```

| specifier | dart-sass | `grass` 0.13.4 |
|---|---|---|
| `@use "./_vars"` | OK | OK |
| `@use "_vars"` | OK | OK |
| `@use "./plain"` | OK | OK |
| `@use "plain"` | OK | OK |
| `@use "./_vars.scss"` | OK | **`Can't find stylesheet to import`** |
| `@use "_vars.scss"` | OK | **`Can't find stylesheet to import`** |
| `@use "./plain.scss"` | OK | **`Can't find stylesheet to import`** |
| `@use "plain.scss"` | OK | **`Can't find stylesheet to import`** |

The leading `_` and the leading `./` are both irrelevant; the extension is the
whole trigger. `@import "./variables.scss"` fails the same way, and so does
`@include meta.load-css("./loaded.scss")` while `meta.load-css("./loaded")`
succeeds.

## Where it shows up

28 of the 99 units the `scss-known-failures` ratchet lists as
`grass-rejects-accepted` — 25 of them through a plain `@use`/`@import` with the
extension, and the remaining 3 through `meta.load-css` with one.
