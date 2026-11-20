# Svelte syntax

The public entry is `parse::parse`. It builds one surface tree with source
spans, lossless tokens, and shared JavaScript nodes. JavaScript and CSS parsing use
their language parsers.

| Module under `src/parse/`             | Owns                                                           |
| ------------------------------------- | -------------------------------------------------------------- |
| `fragment`                            | Children, text, and comments                                   |
| `element_rules`                       | Implicit HTML closing rules and void elements                  |
| `element`                             | Element names and child modes, including raw text and textarea |
| `options`                             | `<svelte:options>` validation                                  |
| `attribute`, `sequence`, `directive`  | Attribute names, value parts, and directive targets            |
| `tag`, `block`, `snippet`             | Expression tags, block branches, and snippet parameters        |
| `token`                               | Lossless token recording and embedded JavaScript regions       |
| `script`                              | Top-level scripts, styles, and the template language mode      |
| `whitespace`                          | ASCII whitespace scans shared by parsing and lookahead         |
| `javascript`, `pattern`, `identifier` | Embedded JavaScript, binding patterns, and identifier lexing   |

Shared parser state stays in `parse.rs`. The modules are private; `parse.rs` reexports what
other crates use from them.
Text searches stop at ASCII delimiters, which are UTF-8 boundaries. Expressions
still end where the JavaScript parser ends them.

Run the boundary tests with `cargo test -p rsvelte_svelte_syntax`. The corpus test
(`cargo test -p rsvelte_command_line --test corpus`) checks that every token table it parses is
the source byte for byte.
