# Third-party notices

This extension bundles assets copied from third-party projects. Their original
licenses are reproduced below and apply to the corresponding files.

## sveltejs/language-tools

Upstream: <https://github.com/sveltejs/language-tools> (`packages/svelte-vscode`)
License: MIT

The following files are copied from that package, either verbatim or compiled
from its YAML sources with the same `js-yaml` step upstream uses
(`npx js-yaml <file>.src.yaml`):

| File in this extension | Upstream source |
| --- | --- |
| `syntaxes/svelte.tmLanguage.json` | `syntaxes/svelte.tmLanguage.src.yaml` (compiled) |
| `syntaxes/postcss.json` | `syntaxes/postcss.src.yaml` (compiled) |
| `syntaxes/pug-svelte.json` | `syntaxes/pug-svelte.json` |
| `syntaxes/pug-svelte-tags.json` | `syntaxes/pug-svelte-tags.json` |
| `syntaxes/pug-svelte-dotblock.json` | `syntaxes/pug-svelte-dotblock.json` |
| `syntaxes/markdown-svelte.json` | `syntaxes/markdown-svelte.json` |
| `syntaxes/markdown-svelte-js.json` | `syntaxes/markdown-svelte-js.json` |
| `syntaxes/markdown-svelte-css.json` | `syntaxes/markdown-svelte-css.json` |
| `snippets/svelte.json` | `snippets/svelte.json` |
| `snippets/javascript.json` | `snippets/javascript.json` |
| `snippets/typescript.json` | `snippets/typescript.json` |
| `language-configuration.json` | `language-configuration.json` |
| `language-configuration-start-tag.json` | `language-configuration-start-tag.json` |

The Svelte language configuration applied at activation time in
`src/extension.ts` (indentation rules, word pattern, on-enter rules, and the
list of void HTML elements they reference) is also derived from that package's
`src/extension.ts` and `src/html/htmlEmptyTagsShared.ts`.

### License

Copyright (c) 2020-Present [these people](https://github.com/sveltejs/language-tools/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## microsoft/vscode

Upstream: <https://github.com/microsoft/vscode>
(`extensions/html-language-features/client/src/htmlEmptyTagsShared.ts`)
License: MIT

The list of void HTML elements used by the on-enter rules in
`src/extension.ts` originates here, by way of `sveltejs/language-tools`.

### License

Copyright (c) Microsoft Corporation. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
