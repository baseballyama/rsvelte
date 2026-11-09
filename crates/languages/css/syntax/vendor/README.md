# Vendored data

`known_properties.rs` is `data/all.json` of
[known-css-properties](https://github.com/known-css-properties/known-css-properties) 0.37.0
(MIT, see `LICENSE`), the list `eslint-plugin-svelte` checks style directives against, sorted
and deduplicated. To regenerate it from an unpacked package:

```sh
node -e 'const p=[...new Set(require(process.argv[1]).properties)].sort();console.log("[\n"+p.map(x=>"    "+JSON.stringify(x)+",\n").join("")+"]")' <package>/data/all.json > known_properties.rs
```
