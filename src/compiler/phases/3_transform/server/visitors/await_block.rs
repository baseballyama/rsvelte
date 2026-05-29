//! Server-side await block and key block visitors.

use super::super::ServerCodeGenerator;
use super::super::helpers::trim_output_parts;
use super::super::types::OutputPart;
use crate::ast::template::{AwaitBlock, KeyBlock, TemplateNode};
use crate::compiler::phases::phase3_transform::TransformError;
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;

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
        // Svelte 5.52+: derived reads in template expressions become calls.
        let promise_expr = self.wrap_derived_reads(&promise_expr);

        // Svelte 5.55.9 upstream `000c594e0` "fix: `{#await await ...}` and async
        // dependencies fixes": when the promise expression itself contains
        // `await`, the expression should NOT be awaited eagerly on the server
        // (the SSR/hydration markup would otherwise diverge from the client).
        // Instead, transform the inner `await` into `(await $.save(...))()` and
        // wrap the whole expression in an immediately-invoked `async () => ...`
        // so the result is a promise that `$.await(...)` can consume. The outer
        // `$$renderer.child_block(...)` wrapper is added later by
        // `convert_await_block` in `bridge.rs`.
        let has_await = block.metadata.expression.has_await();
        let promise_expr = if has_await {
            let inner = super::super::helpers::transform_await_to_save(&promise_expr);
            format!("(async () => {})()", inner)
        } else {
            promise_expr
        };

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
                self.analysis,
                self.use_async,
            );
            pending_generator.constant_vars = self.constant_vars.clone();
            pending_generator.is_typescript = self.is_typescript;
            pending_generator.dev = self.dev;
            pending_generator.uses_store_subs = self.uses_store_subs;
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
                self.analysis,
                self.use_async,
            );
            then_generator.constant_vars = self.constant_vars.clone();
            then_generator.is_typescript = self.is_typescript;
            then_generator.dev = self.dev;
            then_generator.uses_store_subs = self.uses_store_subs;
            // Await `then` parameter bindings shadow any outer derived
            // bindings of the same name. Drop those names from the body
            // generator so reads of the parameter inside the then body
            // are emitted as bare identifiers (e.g. `$.escape(result)`)
            // rather than derived-call wraps (`$.escape(result())`).
            // Mirrors the upstream `Scope` shadowing that `build_getter`
            // observes when the then-body walk hits an identifier whose
            // binding is the local then parameter, not the outer
            // `const result = $derived(await ...)`.
            // This matches the same handling for snippet parameters in
            // `snippet_block.rs` and the each-block context pattern in
            // `each_block.rs::extract_pattern_names`.
            if !then_param.is_empty() {
                let names = super::each_block::extract_pattern_names(&then_param);
                let bare = if names.is_empty() {
                    vec![then_param.clone()]
                } else {
                    names
                };
                for n in &bare {
                    then_generator.derived_names.remove(n);
                    then_generator.derived_var_names.remove(n);
                }
            }
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
                self.analysis,
                self.use_async,
            );
            catch_generator.constant_vars = self.constant_vars.clone();
            catch_generator.is_typescript = self.is_typescript;
            catch_generator.dev = self.dev;
            catch_generator.uses_store_subs = self.uses_store_subs;
            // Same shadowing for `catch` parameter as for `then` above.
            if !catch_param.is_empty() {
                let names = super::each_block::extract_pattern_names(&catch_param);
                let bare = if names.is_empty() {
                    vec![catch_param.clone()]
                } else {
                    names
                };
                for n in &bare {
                    catch_generator.derived_names.remove(n);
                    catch_generator.derived_var_names.remove(n);
                }
            }
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
            has_await,
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
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();
        body_generator.is_typescript = self.is_typescript;
        body_generator.dev = self.dev;
        body_generator.uses_store_subs = self.uses_store_subs;

        // Determine range of nodes, trimming leading/trailing whitespace-only text nodes
        // but preserving interior whitespace (e.g., between expression tags and elements)
        let nodes = &block.fragment.nodes;
        let len = nodes.len();
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace-only text nodes
        while start_idx < len {
            if let TemplateNode::Text(text) = &nodes[start_idx]
                && is_svelte_whitespace_only(&text.data)
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace-only text nodes
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = &nodes[end_idx - 1]
                && is_svelte_whitespace_only(&text.data)
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        for node in &nodes[start_idx..end_idx] {
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
