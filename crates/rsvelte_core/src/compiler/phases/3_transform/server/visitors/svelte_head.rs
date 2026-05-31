//! Server-side svelte:head visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::SvelteElement;
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    /// Generate code for <svelte:head> elements.
    ///
    /// Generates: $.head('hash', $$renderer, ($$renderer) => { ... });
    pub(crate) fn generate_svelte_head(
        &mut self,
        head: &SvelteElement,
    ) -> Result<(), TransformError> {
        // Generate body parts for the head content
        let body = self.generate_fragment_body_parts(&head.fragment)?;

        // Generate a hash for hydration validation based on the filename
        // The official Svelte compiler uses hash(filename) for this
        let hash = self
            .analysis
            .map(|a| a.filename_hash.clone())
            .unwrap_or_else(|| "0".to_string());

        self.output_parts
            .push(OutputPart::SvelteHead { hash, body });
        Ok(())
    }
}
