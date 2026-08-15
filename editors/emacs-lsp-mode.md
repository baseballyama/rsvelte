# Emacs lsp-mode

Install `rsvelte-language-server` on `PATH` and a Svelte major mode such as
`svelte-mode`. Register a separate client so the official `svelteserver` client
does not start at the same time:

```elisp
(require 'lsp-mode)

(lsp-register-client
 (make-lsp-client
  :new-connection
  (lsp-stdio-connection '("rsvelte-language-server" "--stdio"))
  :activation-fn (lsp-activate-on "svelte")
  :priority 1
  :server-id 'rsvelte))

(add-hook 'svelte-mode-hook #'lsp-deferred)
```

Settings use ordinary `lsp-mode` custom settings. For example:

```elisp
(lsp-register-custom-settings
 '(("rsvelte.format.enable" t t)
   ("rsvelte.lint.enable" t t)
   ("rsvelte.preprocess.enable" t t)))
```

If `lsp-svelte` was loaded earlier, disable or remove its Svelte client before
opening a component; two active Svelte servers publish duplicate results.
