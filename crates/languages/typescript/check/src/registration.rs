use std::sync::Arc;

use rsvelte_kernel::computation::pipeline::Registry;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::matches;

use crate::{TypeScriptDocument, TypeScriptEnv, TypeScriptView};

pub fn register(registry: &mut Registry) {
    rsvelte_typescript::register(registry);
    let env = Arc::new(TypeScriptEnv::default());
    registry.provide::<TypeScriptView>("typescript", matches, move |context| {
        if !rsvelte_typescript::is_typescript(context.document) {
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
        })
    });
}
