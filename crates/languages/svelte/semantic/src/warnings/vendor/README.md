Data printed from the MIT-licensed Svelte compiler. `codes.rs` lists the warning codes
`svelte-ignore` accepts (`compiler/warnings.js` `codes`, then `IGNORABLE_RUNTIME_WARNINGS`).
`a11y.rs` holds the tables `a11y/constants.js` derives from the Apache-2.0-licensed
aria-query and axobject-query. The first line of each file names the versions, which a test
compares with `tools/oracle/package.json`.

Regenerate with `mise exec -- node tools/oracle/oracle.ts warnings`.
