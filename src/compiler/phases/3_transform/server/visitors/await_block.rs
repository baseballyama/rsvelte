//! Server-side await block and key block visitors.

use super::super::ServerCodeGenerator;
use super::super::helpers::trim_output_parts;
use super::super::types::OutputPart;
use crate::ast::template::{AwaitBlock, KeyBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn generate_await_block(
        &mut self,
        block: &AwaitBlock,
    ) -> Result<(), TransformError> {
        // Get the promise expression
        let expr_start = block.expression.start().unwrap_or(0) as usize;
        let expr_end = block.expression.end().unwrap_or(0) as usize;
        let promise_expr = if expr_end > expr_start && expr_end <= self.source.len() {
            self.source[expr_start..expr_end].trim().to_string()
        } else {
            "null".to_string()
        };

        // Transform store subscriptions ($store -> $.store_get())
        let promise_expr = self.transform_store_refs(&promise_expr);

        // Get the then value variable name if present
        let then_param = if let Some(ref value) = block.value {
            let start = value.start().unwrap_or(0) as usize;
            let end = value.end().unwrap_or(0) as usize;
            if end > start && end <= self.source.len() {
                self.source[start..end].trim().to_string()
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        // Get the catch error variable name if present
        let catch_param = if let Some(ref error) = block.error {
            let start = error.start().unwrap_or(0) as usize;
            let end = error.end().unwrap_or(0) as usize;
            if end > start && end <= self.source.len() {
                self.source[start..end].trim().to_string()
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        // Generate pending body
        let mut pending_body = if let Some(ref pending) = block.pending {
            let mut pending_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                self.instance_script,
                None,
                None,
                self.use_async,
            );
            pending_generator.constant_vars = self.constant_vars.clone();
            for node in &pending.nodes {
                pending_generator.generate_node(node, false)?;
            }
            pending_generator.output_parts
        } else {
            Vec::new()
        };
        // Trim leading/trailing whitespace from await block bodies
        trim_output_parts(&mut pending_body);

        // Generate then body
        let mut then_body = if let Some(ref then) = block.then {
            let mut then_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                self.instance_script,
                None,
                None,
                self.use_async,
            );
            then_generator.constant_vars = self.constant_vars.clone();
            for node in &then.nodes {
                then_generator.generate_node(node, false)?;
            }
            then_generator.output_parts
        } else {
            Vec::new()
        };
        trim_output_parts(&mut then_body);

        // Generate catch body
        let mut catch_body = if let Some(ref catch) = block.catch {
            let mut catch_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                self.instance_script,
                None,
                None,
                self.use_async,
            );
            catch_generator.constant_vars = self.constant_vars.clone();
            for node in &catch.nodes {
                catch_generator.generate_node(node, false)?;
            }
            catch_generator.output_parts
        } else {
            Vec::new()
        };
        trim_output_parts(&mut catch_body);

        self.output_parts.push(OutputPart::AwaitBlock {
            promise: promise_expr,
            then_param,
            pending_body,
            then_body,
            catch_param,
            catch_body,
        });

        Ok(())
    }

    pub(crate) fn generate_key_block(&mut self, block: &KeyBlock) -> Result<(), TransformError> {
        // Key block in SSR outputs: <!---->{ fragment content }<!---->
        // First comment marker
        self.output_parts.push(OutputPart::Comment);

        // Generate fragment content in a block scope
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        for node in &block.fragment.nodes {
            // Skip whitespace-only text nodes in key block
            if let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        self.output_parts.push(OutputPart::BlockScope {
            body: body_generator.output_parts,
        });

        // Second comment marker
        self.output_parts.push(OutputPart::Comment);
        Ok(())
    }
}
