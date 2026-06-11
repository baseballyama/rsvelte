//! Server-side title element visitor.

use super::super::ServerCodeGenerator;
use super::super::types::OutputPart;
use crate::ast::template::TitleElement;
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    /// Generate <title> element inside svelte:head.
    /// Uses $$renderer.title() callback.
    pub(crate) fn generate_title_element(
        &mut self,
        title: &TitleElement,
    ) -> Result<(), TransformError> {
        // Generate body parts for the title content
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();
        body_generator.current_scope_index = self.current_scope_index;
        body_generator.is_typescript = self.is_typescript;
        body_generator.dev = self.dev;
        body_generator.uses_store_subs = self.uses_store_subs;
        // <title> is element-like (upstream uses `process_children`, not
        // `visit(fragment)`), so the immediate template parent of any
        // expression-tag inside it is `TitleElement`, not a `Fragment`. That
        // is exactly the path-walk case where upstream's `AwaitExpression.js`
        // applies `$.save(...)`. Toggle `in_block_body` off accordingly.
        body_generator.in_block_body = false;

        // Add <title> tag
        body_generator
            .output_parts
            .push(OutputPart::Html("<title>".to_string()));

        // Process children (text and expressions)
        for node in &title.fragment.nodes {
            body_generator.generate_node(node, false)?;
        }

        // Add </title> tag
        body_generator
            .output_parts
            .push(OutputPart::Html("</title>".to_string()));

        // Add TitleElement output part
        self.output_parts.push(OutputPart::TitleElement {
            body: body_generator.output_parts,
        });

        Ok(())
    }
}
