//! The `rsvelte-language-server` binary — serves the LSP over stdio.

fn main() -> anyhow::Result<()> {
    rsvelte_language_server::run_stdio()
}
