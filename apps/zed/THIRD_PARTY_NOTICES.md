# Third-party notices

This extension bundles assets copied from third-party projects. Their original
licenses are reproduced below and apply to the corresponding files.

## zed-extensions/svelte

Upstream: <https://github.com/zed-extensions/svelte>
License: Apache-2.0

The following files are copied from that extension, verbatim or lightly edited
(the language config drops `prettier_parser_name` / `prettier_plugins` so Zed
formats through the rsvelte language server):

| File in this extension | Upstream source |
| --- | --- |
| `languages/svelte/config.toml` | `languages/svelte/config.toml` |
| `languages/svelte/brackets.scm` | `languages/svelte/brackets.scm` |
| `languages/svelte/highlights.scm` | `languages/svelte/highlights.scm` |
| `languages/svelte/indents.scm` | `languages/svelte/indents.scm` |
| `languages/svelte/injections.scm` | `languages/svelte/injections.scm` |
| `languages/svelte/outline.scm` | `languages/svelte/outline.scm` |
| `languages/svelte/overrides.scm` | `languages/svelte/overrides.scm` |

The `language_server_command` / npm bootstrap shape in `src/rsvelte.rs` follows
the same upstream extension's structure.

### License

```
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use these files except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

## tree-sitter-grammars/tree-sitter-svelte

Upstream: <https://github.com/tree-sitter-grammars/tree-sitter-svelte>
License: MIT

Not vendored — `extension.toml` pins a commit that Zed fetches and compiles at
extension build time.
