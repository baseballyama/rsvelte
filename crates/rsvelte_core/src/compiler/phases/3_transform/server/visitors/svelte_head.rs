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
        // Generate body parts for the head content.
        // Note: upstream's `is_text_first` (clean_nodes in 3-transform/utils.js) is only
        // true for Fragment/SnippetBlock/EachBlock/SvelteComponent/SvelteBoundary/
        // Component/SvelteSelf parents — SvelteHead is not in that list, so head
        // content that starts with text does NOT get a `<!---->` anchor.
        let body = self.generate_fragment_body_parts_inner(&head.fragment, true)?;

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
