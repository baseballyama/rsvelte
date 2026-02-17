//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).
//!
//! This module is organized to match the Svelte compiler structure.

pub mod build;
pub mod helpers;
pub mod transform_legacy;
pub mod transform_script;
pub mod transform_store;
pub mod types;
pub mod visitors;

use super::TransformError;
use super::css::render_stylesheet_minified;
use crate::ast::template::{Fragment, Root, Script, TemplateNode};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use helpers::*;
use types::{OutputPart, SnippetDef};

use rustc_hash::FxHashMap;

/// Transform a component analysis into server-side JavaScript.
///
/// # Arguments
///
/// * `analysis` - The component analysis from Phase 2
/// * `ast` - The parsed AST from Phase 1 (to avoid re-parsing)
/// * `_source` - The original source code (for backward compatibility)
/// * `_options` - Compile options
pub fn transform_server(
    analysis: &ComponentAnalysis,
    ast: &Root,
    _source: &str,
    options: &CompileOptions,
) -> Result<String, TransformError> {
    let component_name = &analysis.name;

    // Use the AST's instance script directly (no re-parsing needed)
    let instance_script = ast.instance.as_ref().map(|s| s.as_ref());
    // Use the AST's module script (context="module")
    let module_script = ast.module.as_ref().map(|s| s.as_ref());

    let mut generator = ServerCodeGenerator::new(
        component_name.clone(),
        analysis.source.clone(),
        instance_script,
        module_script,
        Some(analysis),
        options.experimental.r#async,
    );

    // Handle CSS injection for <svelte:options css="injected" />
    if analysis.inject_styles && analysis.css.has_css && !analysis.css.hash.is_empty() {
        // Render the CSS stylesheet with scoping and minification for SSR
        if let Ok(css_output) = render_stylesheet_minified(analysis, &analysis.source, options)
            && !css_output.code.is_empty()
        {
            generator.set_injected_css(analysis.css.hash.clone(), css_output.code);
        }
    }

    // Use the AST fragment directly (no re-parsing needed)
    generator.generate_component(&ast.fragment)?;

    Ok(generator.build())
}

/// Server-side code generator.
pub(crate) struct ServerCodeGenerator<'a> {
    pub(crate) component_name: String,
    pub(crate) source: String,
    pub(crate) output_parts: Vec<OutputPart>,
    pub(crate) instance_script: Option<&'a Script>,
    /// Module script (context="module") - executed at module level outside component
    pub(crate) module_script: Option<&'a Script>,
    /// Map of constant variable names to their values
    pub(crate) constant_vars: FxHashMap<String, String>,
    /// Snippet definitions to be generated at module level
    pub(crate) snippets: Vec<SnippetDef>,
    /// Component analysis from Phase 2
    pub(crate) analysis: Option<&'a ComponentAnalysis>,
    /// Whether the component uses store subscriptions (requires $$store_subs variable)
    pub(crate) uses_store_subs: bool,
    /// Whether experimental.async is enabled
    pub(crate) use_async: bool,
    /// CSS injection info (hash, code) if css="injected"
    pub(crate) injected_css: Option<(String, String)>,
    /// Whether to skip hydration boundaries (empty comment markers after RenderTags/Components)
    /// This is true when the current fragment is "standalone" (contains only a single RenderTag/Component)
    pub(crate) skip_hydration_boundaries: bool,
    /// Whether the component uses TypeScript (lang="ts")
    pub(crate) is_typescript: bool,
}

impl<'a> ServerCodeGenerator<'a> {
    pub(crate) fn new(
        component_name: String,
        source: String,
        instance_script: Option<&'a Script>,
        module_script: Option<&'a Script>,
        analysis: Option<&'a ComponentAnalysis>,
        use_async: bool,
    ) -> Self {
        // Extract constant variables from script
        let mut constant_vars = FxHashMap::default();

        // Extract constants from module script first (only const declarations)
        if let Some(script) = module_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                for (k, v) in extract_constant_vars(&source[start..end], &source) {
                    constant_vars.insert(k, v);
                }
            }
        }

        // Then from instance script (both let and const)
        if let Some(script) = instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            if end > start && end <= source.len() {
                for (k, v) in extract_constant_vars(&source[start..end], &source) {
                    constant_vars.insert(k, v);
                }
            }
        }

        // Add scope-based constants for $state variables that are not updated.
        // The text-based extraction skips $state lines, but if scope analysis shows
        // a $state binding is never reassigned/mutated, we can fold its initial value.
        if let Some(analysis) = analysis {
            for binding in &analysis.root.bindings {
                if matches!(binding.kind, BindingKind::State | BindingKind::RawState)
                    && !binding.is_updated()
                    && !constant_vars.contains_key(&binding.name)
                    && let Some(ref init) = binding.initial
                {
                    let trimmed = init.trim();
                    // Parse the initial value as a constant
                    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
                        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
                    {
                        if trimmed.len() >= 2 {
                            constant_vars.insert(
                                binding.name.clone(),
                                trimmed[1..trimmed.len() - 1].to_string(),
                            );
                        }
                    } else if let Ok(n) = trimmed.parse::<i64>() {
                        constant_vars.insert(binding.name.clone(), n.to_string());
                    } else if let Ok(n) = trimmed.parse::<f64>() {
                        if n.is_finite() {
                            constant_vars.insert(binding.name.clone(), n.to_string());
                        }
                    } else {
                        match trimmed {
                            "true" | "false" | "null" | "undefined" => {
                                constant_vars.insert(binding.name.clone(), trimmed.to_string());
                            }
                            _ => {}
                        }
                    }
                }
            }
        }

        // Check if the analysis has any StoreSub bindings
        let uses_store_subs = analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .any(|b| matches!(b.kind, BindingKind::StoreSub))
            })
            .unwrap_or(false);

        // Check if any script uses TypeScript
        let is_typescript = instance_script.is_some_and(script_is_typescript)
            || module_script.is_some_and(script_is_typescript);

        Self {
            component_name,
            source,
            // Pre-allocate capacity based on typical component sizes
            // Average component has ~50-100 output parts
            output_parts: Vec::with_capacity(64),
            instance_script,
            module_script,
            constant_vars,
            // Most components have 0-5 snippets
            snippets: Vec::with_capacity(4),
            analysis,
            uses_store_subs,
            use_async,
            injected_css: None,
            skip_hydration_boundaries: false,
            is_typescript,
        }
    }

    /// Create a generator for a child fragment with the given skip_hydration_boundaries flag
    pub(crate) fn new_child_generator(&self, skip_hydration_boundaries: bool) -> Self {
        Self {
            component_name: self.component_name.clone(),
            source: self.source.clone(),
            output_parts: Vec::with_capacity(32),
            instance_script: None,
            module_script: None,
            constant_vars: self.constant_vars.clone(),
            snippets: Vec::new(),
            analysis: self.analysis,
            uses_store_subs: self.uses_store_subs,
            use_async: self.use_async,
            injected_css: None,
            skip_hydration_boundaries,
            is_typescript: self.is_typescript,
        }
    }

    /// Set the injected CSS info (for css="injected" mode)
    pub(crate) fn set_injected_css(&mut self, hash: String, code: String) {
        self.injected_css = Some((hash, code));
    }

    /// Transform store subscriptions in an expression.
    /// Converts `$store` to `$.store_get($$store_subs ??= {}, '$store', store)`.
    pub(crate) fn transform_store_refs(&self, expr: &str) -> String {
        if !self.uses_store_subs {
            return expr.to_string();
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return expr.to_string(),
        };

        // Collect store subscription names from the analysis
        let store_sub_names: Vec<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect();

        if store_sub_names.is_empty() {
            return expr.to_string();
        }

        let mut result = expr.to_string();

        // Transform each store subscription
        for name in store_sub_names {
            // Skip if it doesn't start with $
            if !name.starts_with('$') {
                continue;
            }

            // Get the store variable name (without $)
            let store_name = &name[1..];

            // Replace $store with $.store_get($$store_subs ??= {}, '$store', store)
            // We need to be careful to only replace complete identifiers, not substrings
            result = replace_store_identifier(&result, name, store_name);
        }

        result
    }

    /// Transform rune calls in template expressions for server-side rendering.
    /// Handles: $state.eager(x) -> x, $state.snapshot(x) -> $.snapshot(x),
    ///          $effect.tracking() -> false, $effect.pending() -> false
    pub(crate) fn transform_rune_in_template_expr(expr: &str) -> String {
        use crate::compiler::phases::phase3_transform::server::transform_script::remove_effect_blocks;

        let mut result = expr.to_string();
        // $state.eager(x) -> x (unwrap the rune call)
        if result.contains("$state.eager(") {
            result = transform_rune_call_simple(&result, "$state.eager(");
        }
        // $state.snapshot(x) -> $.snapshot(x)
        if result.contains("$state.snapshot(") {
            result = result.replace("$state.snapshot(", "$.snapshot(");
        }
        // $effect.tracking() -> false
        if result.contains("$effect.tracking()") {
            result = result.replace("$effect.tracking()", "false");
        }
        // $effect.pending() -> false
        if result.contains("$effect.pending()") {
            result = result.replace("$effect.pending()", "false");
        }
        // Remove $effect(), $effect.pre(), $effect.root(), $inspect(), $inspect.trace() blocks
        // These are client-side only and should be stripped in SSR template expressions too
        if result.contains("$effect(")
            || result.contains("$effect.pre(")
            || result.contains("$effect.root(")
            || result.contains("$inspect(")
            || result.contains("$inspect.trace(")
        {
            result = remove_effect_blocks(&result);
        }
        result
    }

    /// Strip TypeScript syntax from a template expression string.
    ///
    /// This wraps the expression in a parseable JavaScript statement (`var _ = EXPR;`),
    /// runs `strip_typescript()` to remove TS-specific syntax (like non-null assertions `!`,
    /// type assertions `as T`, etc.), then extracts the cleaned expression back.
    pub(crate) fn strip_ts_from_expr(&self, expr: &str) -> String {
        if !self.is_typescript {
            return expr.to_string();
        }
        use crate::compiler::phases::phase2_analyze::types::strip_typescript;
        let wrapper = format!("var _ = {};", expr);
        let stripped = strip_typescript(&wrapper);
        // Extract the expression back: "var _ = EXPR;"
        if let Some(rest) = stripped.strip_prefix("var _ = ") {
            let result = rest.trim_end_matches(';').trim();
            result.to_string()
        } else {
            // Fallback if stripping changed the structure
            expr.to_string()
        }
    }

    /// Transform store subscriptions in script content.
    /// This is used for the instance script where store references like `$page`
    /// need to be transformed to `$.store_get($$store_subs ??= {}, '$page', page)`.
    pub(crate) fn transform_store_refs_in_script(&self, script: &str) -> String {
        if !self.uses_store_subs {
            return script.to_string();
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return script.to_string(),
        };

        // Collect store subscription names from the analysis
        let store_sub_names: Vec<&str> = analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .map(|b| b.name.as_str())
            .collect();

        if store_sub_names.is_empty() {
            return script.to_string();
        }

        let mut result = script.to_string();

        // Transform each store subscription
        for name in store_sub_names {
            // Skip if it doesn't start with $
            if !name.starts_with('$') {
                continue;
            }

            // Get the store variable name (without $)
            let store_name = &name[1..];

            // Replace $store with $.store_get($$store_subs ??= {}, '$store', store)
            // We need to be careful to only replace complete identifiers, not substrings
            // Also need to skip store assignments which are handled separately
            result = replace_store_identifier_in_script(&result, name, store_name);
        }

        result
    }

    /// Collect store subscription names from the analysis.
    /// Returns a list of (store_ref, store_name) pairs like ("$a", "a").
    pub(crate) fn get_store_sub_names(&self) -> Vec<(String, String)> {
        if !self.uses_store_subs {
            return Vec::new();
        }

        let analysis = match self.analysis {
            Some(a) => a,
            None => return Vec::new(),
        };

        analysis
            .root
            .bindings
            .iter()
            .filter(|b| matches!(b.kind, BindingKind::StoreSub))
            .filter(|b| b.name.starts_with('$'))
            .map(|b| (b.name.clone(), b.name[1..].to_string()))
            .collect()
    }

    /// Check if a fragment is "standalone" (contains only a single RenderTag or Component).
    /// When standalone, hydration boundaries can be skipped because the parent's anchors are sufficient.
    pub(crate) fn is_standalone_fragment(nodes: &[TemplateNode]) -> bool {
        // Filter out whitespace-only text, comments, and hoisted nodes
        // (matching clean_nodes behavior in the official compiler)
        let meaningful_nodes: Vec<_> = nodes
            .iter()
            .filter(|n| match n {
                TemplateNode::Text(text) => !text.data.trim().is_empty(),
                TemplateNode::Comment(_) => false,
                // These node types are hoisted out by clean_nodes in the official compiler
                TemplateNode::SnippetBlock(_) => false,
                TemplateNode::ConstTag(_) => false,
                TemplateNode::SvelteBody(_) => false,
                TemplateNode::SvelteWindow(_) => false,
                TemplateNode::SvelteDocument(_) => false,
                TemplateNode::SvelteHead(_) => false,
                TemplateNode::TitleElement(_) => false,
                _ => true,
            })
            .collect();

        // Standalone if there's exactly one node and it's a non-dynamic RenderTag or Component
        // (matching official compiler's clean_nodes logic)
        if meaningful_nodes.len() != 1 {
            return false;
        }
        match meaningful_nodes[0] {
            TemplateNode::RenderTag(tag) => !tag.metadata.dynamic,
            TemplateNode::Component(comp) => {
                !comp.metadata.dynamic
                    && !comp.attributes.iter().any(|attr| {
                        matches!(attr, crate::ast::template::Attribute::Attribute(a) if a.name.starts_with("--"))
                    })
            }
            _ => false,
        }
    }

    pub(crate) fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Helper to check if a node is "meaningful" for SSR output purposes
        // SvelteWindow, SvelteDocument, SvelteBody don't render anything in SSR
        let is_ssr_meaningful = |n: &&TemplateNode| {
            !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty())
                && !matches!(n, TemplateNode::Comment(_))
                && !matches!(n, TemplateNode::SvelteWindow(_))
                && !matches!(n, TemplateNode::SvelteDocument(_))
                && !matches!(n, TemplateNode::SvelteBody(_))
        };

        // Find indices of first and last non-whitespace nodes (excluding SSR-invisible elements)
        let first_meaningful_idx = nodes.iter().position(is_ssr_meaningful);
        let last_meaningful_idx = nodes.iter().rposition(is_ssr_meaningful);

        // Check if the root fragment is standalone (only a single RenderTag/Component)
        // to determine if we should skip hydration boundaries
        self.skip_hydration_boundaries = Self::is_standalone_fragment(&fragment.nodes);

        // If the first meaningful node is a Text or ExpressionTag, add <!---->
        // to prevent text fusion during hydration
        let first_meaningful_node = first_meaningful_idx.map(|i| &nodes[i]);
        let needs_anchor = matches!(
            first_meaningful_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        if needs_anchor {
            self.output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        // Track whether we need to trim leading whitespace from the first text node
        // When an anchor comment is added, the next text should not have a leading space
        let mut trim_leading_ws = needs_anchor;

        for (i, node) in nodes.iter().enumerate() {
            // Skip whitespace-only text at root level
            if let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                // Skip if before first meaningful content
                if first_meaningful_idx.is_some() && i < first_meaningful_idx.unwrap() {
                    continue;
                }
                // Skip if after last meaningful content
                if last_meaningful_idx.is_some() && i > last_meaningful_idx.unwrap() {
                    continue;
                }
                // Skip whitespace between snippets and other elements at root level
                // Check if previous node is a snippet
                if i > 0
                    && let TemplateNode::SnippetBlock(_) = nodes[i - 1]
                {
                    continue;
                }
                // Check if next node is a snippet
                if i + 1 < len
                    && let TemplateNode::SnippetBlock(_) = nodes[i + 1]
                {
                    continue;
                }
                // Skip whitespace after SvelteHead (head elements are hoisted in official compiler)
                if i > 0 && matches!(nodes[i - 1], TemplateNode::SvelteHead(_)) {
                    continue;
                }
                // Skip whitespace before SvelteHead
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::SvelteHead(_)) {
                    continue;
                }
                // Skip whitespace around SvelteWindow (these don't render in SSR)
                if i > 0 && matches!(nodes[i - 1], TemplateNode::SvelteWindow(_)) {
                    continue;
                }
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::SvelteWindow(_)) {
                    continue;
                }
                // Skip whitespace around SvelteDocument (these don't render in SSR)
                if i > 0 && matches!(nodes[i - 1], TemplateNode::SvelteDocument(_)) {
                    continue;
                }
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::SvelteDocument(_)) {
                    continue;
                }
                // Skip whitespace around SvelteBody (these don't render in SSR)
                if i > 0 && matches!(nodes[i - 1], TemplateNode::SvelteBody(_)) {
                    continue;
                }
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::SvelteBody(_)) {
                    continue;
                }
                // Comments are skipped during rendering. Whitespace around them should
                // collapse to a single space (matching clean_nodes behavior which strips
                // comments first, then collapses adjacent whitespace). Skip whitespace
                // BEFORE a comment; keep whitespace AFTER to produce one space total.
                if i + 1 < len && matches!(nodes[i + 1], TemplateNode::Comment(_)) {
                    continue;
                }
            }
            // Handle text node modifications:
            // 1. Trim leading whitespace from the first text after anchor comment
            // 2. Trim trailing whitespace from the last meaningful text node
            if let TemplateNode::Text(text) = node {
                let mut modified_data = text.data.to_string();
                let mut needs_modification = false;

                // Trim leading whitespace if this is the first text after an anchor comment
                if trim_leading_ws {
                    let trimmed = modified_data.trim_start().to_string();
                    if trimmed != modified_data {
                        modified_data = trimmed;
                        needs_modification = true;
                    }
                    trim_leading_ws = false;
                }

                // Trim trailing whitespace from the last meaningful text node
                if last_meaningful_idx.is_some() && i == last_meaningful_idx.unwrap() {
                    let trimmed = modified_data.trim_end().to_string();
                    if trimmed != modified_data {
                        modified_data = trimmed;
                        needs_modification = true;
                    }
                }

                if needs_modification {
                    let mut modified_text = text.clone();
                    modified_text.data = modified_data.into();
                    self.generate_node(&TemplateNode::Text(modified_text), true)?;
                    continue;
                }
            } else {
                // Reset trim flag when we hit a non-text, non-whitespace node
                if trim_leading_ws
                    && first_meaningful_idx.is_some()
                    && i >= first_meaningful_idx.unwrap()
                {
                    trim_leading_ws = false;
                }
            }

            self.generate_node(node, true)?;
        }
        Ok(())
    }
}
