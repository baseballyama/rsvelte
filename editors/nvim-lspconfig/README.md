# Neovim / nvim-lspconfig

Install `rsvelte-language-server` on `PATH`, then copy [`rsvelte.lua`](./lsp/rsvelte.lua)
to a directory on Neovim's runtime path as `lsp/rsvelte.lua`. With Neovim 0.11
or newer:

```lua
vim.lsp.enable('rsvelte')
```

For a checked-out `nvim-lspconfig`, the file can be used directly:

```sh
cp editors/nvim-lspconfig/lsp/rsvelte.lua /path/to/nvim-lspconfig/lsp/rsvelte.lua
```

The config follows `nvim-lspconfig`'s native `vim.lsp.Config` layout and is
ready to submit upstream. It prefers a project-local
`node_modules/.bin/rsvelte-language-server` over the executable on `PATH`.

To override settings:

```lua
vim.lsp.config('rsvelte', {
  settings = {
    rsvelte = {
      format = { enable = true },
      lint = { enable = true },
      preprocess = { enable = true },
    },
  },
})
vim.lsp.enable('rsvelte')
```
