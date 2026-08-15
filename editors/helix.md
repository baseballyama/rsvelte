# Helix

Install `rsvelte-language-server` on `PATH`. Add this to
`~/.config/helix/languages.toml` (or the platform-equivalent Helix config
directory):

```toml
[language-server.rsvelte]
command = "rsvelte-language-server"
args = ["--stdio"]

[language-server.rsvelte.config.rsvelte]
format.enable = true
lint.enable = true
preprocess.enable = true

[[language]]
name = "svelte"
language-servers = ["rsvelte"]
```

The final language entry replaces Helix's default `svelteserver` for Svelte
files. Keep only one of the two servers in the array to avoid duplicate
diagnostics.
