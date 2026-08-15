---@brief
---
--- https://github.com/baseballyama/rsvelte/tree/main/crates/rsvelte_language_server
---
--- `rsvelte-language-server` can be installed as a standalone executable or via npm:
--- ```sh
--- npm install [-g] @rsvelte/language-server
--- ```

---@type vim.lsp.Config
return {
  cmd = function(dispatchers, config)
    local cmd = 'rsvelte-language-server'
    if (config or {}).root_dir then
      local local_cmd = vim.fs.joinpath(config.root_dir, 'node_modules/.bin', cmd)
      if vim.fn.executable(local_cmd) == 1 then
        cmd = local_cmd
      end
    end
    return vim.lsp.rpc.start({ cmd, '--stdio' }, dispatchers)
  end,
  filetypes = { 'svelte' },
  root_dir = function(bufnr, on_dir)
    local fname = vim.api.nvim_buf_get_name(bufnr)
    if vim.uv.fs_stat(fname) == nil then
      return
    end

    local root_markers = {
      'svelte.config.js',
      'svelte.config.mjs',
      'svelte.config.cjs',
      'svelte.config.ts',
      'svelte.config.mts',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'bun.lockb',
      'bun.lock',
      'deno.lock',
    }
    root_markers = vim.fn.has('nvim-0.11.3') == 1 and { root_markers, { '.git' } }
      or vim.list_extend(root_markers, { '.git' })
    on_dir(vim.fs.root(bufnr, root_markers) or vim.fn.getcwd())
  end,
  settings = {
    rsvelte = {
      format = { enable = true },
      lint = { enable = true },
      preprocess = { enable = true },
    },
  },
}
