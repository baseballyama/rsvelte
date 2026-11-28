# rsvelte for Visual Studio Code

The extension shows the problems `rsvelte lint` finds in Svelte, TypeScript and JavaScript files
as you type, fixes them, and formats files as `rsvelte format` does. It runs `rsvelte lsp`, the
language server of the [`@rsvelte/cli`](../cli/README.md) that each workspace folder installs, so
the editor and the folder's scripts run the same version:

```sh
npm install --save-dev @rsvelte/cli
```

rsvelte does not run in a folder without `@rsvelte/cli`. The output channel "rsvelte" says why a folder
has no server. To run another program, set `rsvelte.path` in your user settings; a workspace
cannot set it.

## What it does

- Problems: what `rsvelte lint` reports, for the text in the editor, saved or not, with
  oxlint's configuration (`.oxlintrc.json` and the others oxlint reads). The language server of
  oxlint reports them, with the Svelte rules of rsvelte.
- Fixes: oxlint's quick fixes and its fix of all problems. To fix on save:

  ```json
  { "editor.codeActionsOnSave": { "source.fixAll.oxc": "explicit" } }
  ```

- Format: what `rsvelte format` writes when run in the workspace folder, with oxfmt's
  configuration. The Svelte extension formats Svelte files too, so pick rsvelte:

  ```json
  { "[svelte]": { "editor.defaultFormatter": "rsvelte.rsvelte" } }
  ```

It lints as oxc's extension does, with Svelte files too, so turn that one off in the
folder: with both, each problem shows twice.

It does not type check; run `rsvelte typecheck`. It does not highlight Svelte syntax or offer
TypeScript features. The [Svelte extension](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
does, and the two can run together.

It runs only in a trusted workspace, because it runs the workspace's program and configuration
files. A JavaScript or TypeScript configuration needs `node` on the `PATH` that the editor sees.
After you upgrade `@rsvelte/cli`, or change a file that a configuration imports or a Tailwind CSS
stylesheet, run "rsvelte: Restart the language server". A file that does not format, such as one
that does not parse, stays unchanged; `rsvelte format` prints why.

## Settings and commands

| Setting                | Default | Purpose                                                |
| ---------------------- | ------- | ------------------------------------------------------ |
| `rsvelte.enable`       | `true`  | Run rsvelte in the workspace folder                    |
| `rsvelte.path`         |         | The program to run instead of the folder's             |
| `rsvelte.trace.server` | `off`   | Log the messages with the server in the output channel |

The commands are "rsvelte: Restart the language server" and "rsvelte: Show the output".

## Develop

```sh
node --run build        # bundle dist/extension.cjs
node --run package      # dist/rsvelte.vsix, for `code --install-extension`
node --run test         # the program lookup
cargo build -p rsvelte_command_line --bin rsvelte
node --run test:editor  # a real editor, with the debug build
```

`test:editor` runs the files the package ships and downloads Visual Studio Code into `generated/`; `VSCODE_VERSION=stable` tests the latest
release instead of the oldest one `engines` accepts. Other editors can run `rsvelte lsp` too: it
talks on standard input and output.
