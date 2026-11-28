//! What an editor shows of a Svelte component, as the official Svelte language server shows it.

use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;

pub mod folding;

static PLUGIN: Plugin = Plugin {
    identifier: "svelte.editor",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[Dependency {
        identifier: "svelte.syntax",
        requirement: concat!("=", env!("CARGO_PKG_VERSION")),
    }],
};

pub fn register(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
    rsvelte_svelte_syntax::register(registry);
    registry.task(folding::Folding);
}
