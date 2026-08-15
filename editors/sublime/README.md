# LSP-rsvelte for Sublime Text

This directory is a Sublime LSP helper package backed by the standalone
`rsvelte-language-server` executable.

1. Install [LSP](https://packagecontrol.io/packages/LSP) with Package Control.
2. Install `rsvelte-language-server` on `PATH` from a GitHub release.
3. Copy this directory into Sublime Text's `Packages/LSP-rsvelte` directory.
4. Run **LSP: Enable Language Server Globally** and choose `rsvelte`.

If `LSP-svelte` is installed, disable it for the workspace. Running both
servers produces duplicate diagnostics, hovers, and completions.

Use **Preferences → Package Settings → LSP → Servers → rsvelte** to override
[`LSP-rsvelte.sublime-settings`](./LSP-rsvelte.sublime-settings), including an
absolute executable path when it is not on `PATH`.
