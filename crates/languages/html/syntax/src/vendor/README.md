The named character references of HTML, from the MIT-licensed Svelte compiler
(`src/compiler/phases/1-parse/utils/entities.js`). A row is the name without its semicolon,
the code point, the second code point the few two-code-point references decode to in Vue
(Svelte's table drops it; 0 for none) and whether the name is also recognized without a
semicolon. The first line of `entities.rs` names the versions, which a test compares with
`tools/oracle/package.json`.

Regenerate with `mise exec -- node tools/oracle/oracle.ts entities`.
