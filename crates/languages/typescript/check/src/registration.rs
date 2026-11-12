use std::sync::Arc;

use rsvelte_kernel::computation::plugins::Plugin;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{is_typescript, matches};

use crate::{TypeScriptDocument, TypeScriptEnv, TypeScriptView};

pub static PLUGIN: Plugin = Plugin {
    identifier: "typescript.check",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[],
};

pub fn register_service(registry: &mut Registry) {
    registry.plugin(&PLUGIN);
}

pub fn register(registry: &mut Registry) {
    register_service(registry);
    let env = Arc::new(TypeScriptEnv::default());
    registry.provide::<TypeScriptView>("typescript", matches, move |context| {
        if !is_typescript(context.document) {
            return Ok(TypeScriptDocument::Unchecked);
        }
        let mut projection = Emitter::new();
        projection.copy(
            context.source_text(),
            Span::new(0, context.source_text().len() as u32),
        );
        Ok(TypeScriptDocument::Checked {
            projection,
            map_back: Emitter::lookup_overlap,
            env: Arc::clone(&env),
            placement: Vec::new(),
        })
    });
}
