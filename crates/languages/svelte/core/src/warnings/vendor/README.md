Data printed from the MIT-licensed Svelte compiler. `codes.rs` lists the warning codes
`svelte-ignore` accepts (`compiler/warnings.js` `codes`, then `IGNORABLE_RUNTIME_WARNINGS`).
The first line names the version, which a test compares with `tools/oracle/package.json`.

Regenerate with `mise exec -- node tools/oracle/oracle.ts warnings`.
