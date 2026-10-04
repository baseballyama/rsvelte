# Svelte parser

The public entry is `syntax::parse::parse`. It builds one surface tree with source
spans, lossless tokens, and shared JavaScript nodes. JavaScript and CSS parsing use
their language parsers.

| Module under `src/syntax/parse/` | Owns |
|---|---|
| `fragment`, `html` | Children, text, comments, and implicit HTML closing rules |
| `element` | Element names and child modes, including raw text and textarea |
| `attribute`, `sequence`, `directive` | Attribute names, value parts, and directive targets |
| `tag`, `block`, `snippet` | Expression tags, block branches, and snippet parameters |
| `token` | Lossless token recording and embedded JavaScript regions |
| `script` | Top-level scripts, styles, and the template language mode |
| `whitespace` | ASCII whitespace scans shared by parsing and lookahead |
| `javascript`, `pattern`, `identifier` | Embedded JavaScript, binding patterns, and identifier lexing |

Shared parser state stays in `parse.rs`. Implementation modules are private.
Text searches stop at ASCII delimiters, which are UTF-8 boundaries. Expressions
still end where the JavaScript parser ends them.

Run the boundary tests with `cargo test -p rsvelte_svelte_parser` and the corpus
lossless check with `cargo test -p rsvelte_svelte --test lossless`.
