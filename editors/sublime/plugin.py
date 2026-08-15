from LSP.plugin import LspPlugin


def plugin_loaded():
    LspRsveltePlugin.register()


def plugin_unloaded():
    LspRsveltePlugin.unregister()


class LspRsveltePlugin(LspPlugin):
    pass
