//! Server-side code generation.
//!
//! Generates JavaScript code for server-side rendering (SSR).

use super::super::TransformError;
use super::super::css::render_stylesheet_minified;
use super::super::js_ast::normalize_js;
use super::super::shared::{escape_attr, escape_html, is_void_element};
use crate::ast::template::{
    Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock, BindDirective,
    ClassDirective, Component, ConstTag, EachBlock, ExpressionTag, Fragment, HtmlTag, IfBlock,
    KeyBlock, RegularElement, RenderTag, Root, Script, SnippetBlock, StyleDirective,
    SvelteComponentElement, SvelteDynamicElement, SvelteElement, TemplateNode, Text, TitleElement,
};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;

use rustc_hash::FxHashMap;

/// Check if a property name is a valid JavaScript identifier.
/// If not, it needs to be quoted in object literals.
fn is_valid_js_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }

    let mut chars = name.chars();

    // First character must be a letter, underscore, or dollar sign
    let first = chars.next().unwrap();
    if !first.is_alphabetic() && first != '_' && first != '$' {
        return false;
    }

    // Subsequent characters can also include digits
    for c in chars {
        if !c.is_alphanumeric() && c != '_' && c != '$' {
            return false;
        }
    }

    true
}

/// Strip TypeScript type annotations from snippet parameters.
///
/// Handles cases like:
/// - `n: number` -> `n`
/// - `n` -> `n` (no change)
/// - `{ a, b }: Props` -> `{ a, b }` (destructured with type annotation)
///
/// This is needed because snippet parameters in `.svelte` files with `lang="ts"`
/// may include TypeScript type annotations that must not appear in the generated JavaScript.
fn strip_ts_type_annotation(param: &str) -> String {
    let trimmed = param.trim();

    // Handle destructured parameters: { ... }: Type or [ ... ]: Type
    if trimmed.starts_with('{') || trimmed.starts_with('[') {
        let close_char = if trimmed.starts_with('{') { '}' } else { ']' };
        // Find the matching closing bracket
        let mut depth = 0;
        let mut close_pos = None;
        for (i, c) in trimmed.char_indices() {
            match c {
                '{' | '[' => depth += 1,
                '}' | ']' if c == close_char => {
                    depth -= 1;
                    if depth == 0 {
                        close_pos = Some(i);
                        break;
                    }
                }
                _ => {}
            }
        }
        if let Some(pos) = close_pos {
            // Return everything up to and including the closing bracket
            return trimmed[..=pos].to_string();
        }
    }

    // Handle simple identifier with type annotation: `name: Type`
    // Be careful not to strip object destructuring rename syntax
    if let Some(colon_pos) = trimmed.find(':') {
        let before = trimmed[..colon_pos].trim();
        // Only strip if the part before `:` is a valid identifier
        // (not a destructuring pattern)
        if is_valid_js_identifier(before) {
            return before.to_string();
        }
    }

    trimmed.to_string()
}

/// Check if a class attribute value needs to be wrapped in $.clsx().
///
/// Corresponds to the condition in Attribute.js for setting needs_clsx:
/// - The value is a single Expression (not a Sequence or True)
/// - The expression type is NOT Literal, TemplateLiteral, or BinaryExpression
///
/// This is needed for class={x} where x is a variable, array, or object,
/// because Svelte's clsx function normalizes these to proper class strings.
fn needs_clsx(attr_value: &AttributeValue) -> bool {
    // Helper to check if an expression type needs clsx
    let expr_needs_clsx = |expr_type: &str| -> bool {
        // Needs clsx if NOT a simple literal, template literal, or binary expression
        !matches!(
            expr_type,
            "Literal" | "TemplateLiteral" | "BinaryExpression"
        )
    };

    match attr_value {
        AttributeValue::Expression(expr_tag) => {
            // Get expression type
            let expr_type = expr_tag.expression.node_type().unwrap_or("");
            expr_needs_clsx(expr_type)
        }
        // Also check for Sequence with single ExpressionTag (for quoted expressions like class="{x}")
        AttributeValue::Sequence(parts) if parts.len() == 1 => {
            if let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0] {
                let expr_type = expr_tag.expression.node_type().unwrap_or("");
                expr_needs_clsx(expr_type)
            } else {
                // Single text part doesn't need clsx
                false
            }
        }
        // Multiple parts (mixed text and expressions) or True don't need clsx
        _ => false,
    }
}

/// Quote a property name if needed for JavaScript object literal syntax.
/// Returns the name as-is if it's a valid identifier, or quoted if it contains special characters.
fn quote_prop_name(name: &str) -> String {
    if is_valid_js_identifier(name) {
        name.to_string()
    } else {
        format!("'{}'", name)
    }
}

/// Extract slot name from a template node's attributes.
///
/// If the node has a `slot="..."` attribute, returns that slot name.
/// Otherwise returns "default".
fn get_slot_name(node: &TemplateNode) -> String {
    // Helper to extract slot name from element attributes
    fn extract_slot_from_attributes(attrs: &[Attribute]) -> Option<String> {
        for attr in attrs {
            if let Attribute::Attribute(attr_node) = attr
                && attr_node.name.as_str() == "slot"
            {
                // Extract the slot name value
                match &attr_node.value {
                    AttributeValue::True(_) => {
                        // slot (boolean) - unlikely but handle it
                        return Some("default".to_string());
                    }
                    AttributeValue::Sequence(parts) => {
                        // slot="name" - text value
                        if let Some(AttributeValuePart::Text(text)) = parts.first() {
                            return Some(text.data.to_string());
                        }
                    }
                    AttributeValue::Expression(_) => {
                        // slot={expr} - dynamic slot names not supported, use default
                        return None;
                    }
                }
            }
        }
        None
    }

    match node {
        TemplateNode::RegularElement(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::Component(comp) => {
            extract_slot_from_attributes(&comp.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteElement(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteSelf(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteComponent(elem) => {
            extract_slot_from_attributes(&elem.attributes).unwrap_or_else(|| "default".to_string())
        }
        TemplateNode::SvelteFragment(frag) => {
            extract_slot_from_attributes(&frag.attributes).unwrap_or_else(|| "default".to_string())
        }
        _ => "default".to_string(),
    }
}

/// Extract let directive names from a node's attributes.
/// Returns a list of let directive names (e.g., `let:thing` -> "thing").
fn get_let_directives(node: &TemplateNode) -> Vec<String> {
    fn extract_let_from_attributes(attrs: &[Attribute]) -> Vec<String> {
        attrs
            .iter()
            .filter_map(|attr| {
                if let Attribute::LetDirective(let_dir) = attr {
                    Some(let_dir.name.to_string())
                } else {
                    None
                }
            })
            .collect()
    }

    match node {
        TemplateNode::RegularElement(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::Component(comp) => extract_let_from_attributes(&comp.attributes),
        TemplateNode::SvelteElement(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::SvelteSelf(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::SvelteComponent(elem) => extract_let_from_attributes(&elem.attributes),
        TemplateNode::SvelteFragment(frag) => extract_let_from_attributes(&frag.attributes),
        _ => Vec::new(),
    }
}

/// Sanitize a name to be a valid JavaScript identifier.
/// Replaces invalid identifier characters with underscores.
/// For example, "0" becomes "_", "1foo" becomes "_foo".
fn sanitize_identifier(name: &str) -> String {
    if name.is_empty() {
        return "_".to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    // First character must be a letter, underscore, or dollar sign
    if let Some(first) = chars.next() {
        if first.is_alphabetic() || first == '_' || first == '$' {
            result.push(first);
        } else {
            result.push('_');
        }
    }

    // Subsequent characters can also include digits
    for c in chars {
        if c.is_alphanumeric() || c == '_' || c == '$' {
            result.push(c);
        } else {
            result.push('_');
        }
    }

    result
}

/// Collapse whitespace sequences (including newlines) to single spaces.
/// This matches the behavior of clean_nodes in the official compiler.
fn collapse_whitespace(s: &str) -> String {
    let trimmed = s.trim();
    let has_leading_ws = s.chars().next().is_some_and(|c| c.is_whitespace());
    let has_trailing_ws = s.chars().last().is_some_and(|c| c.is_whitespace());

    // Collapse internal whitespace sequences to single spaces
    let mut result = String::new();
    let mut in_whitespace = false;

    if has_leading_ws {
        result.push(' ');
    }

    for c in trimmed.chars() {
        if c.is_whitespace() {
            if !in_whitespace {
                result.push(' ');
                in_whitespace = true;
            }
        } else {
            result.push(c);
            in_whitespace = false;
        }
    }

    // Remove trailing space that was added if content ended with whitespace
    if in_whitespace && !has_trailing_ws {
        result.pop();
    } else if has_trailing_ws && !result.ends_with(' ') {
        result.push(' ');
    }

    result
}

/// Collapse all whitespace sequences (including newlines) to single spaces.
/// Unlike `collapse_whitespace`, this doesn't preserve leading/trailing whitespace markers.
#[allow(dead_code)]
fn collapse_whitespace_to_single_space(s: &str) -> String {
    let mut result = String::new();
    let mut in_whitespace = false;

    for c in s.chars() {
        if c.is_whitespace() {
            if !in_whitespace {
                result.push(' ');
                in_whitespace = true;
            }
        } else {
            result.push(c);
            in_whitespace = false;
        }
    }

    result
}

/// Escape special characters for single-quoted JavaScript strings.
/// Escapes: single quote, backslash, newlines, tabs, carriage returns.
#[allow(dead_code)]
fn escape_for_single_quote(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\'' => result.push_str("\\'"),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            '\t' => result.push_str("\\t"),
            _ => result.push(c),
        }
    }
    result
}

/// Escape special characters for JavaScript template literals.
/// Escapes: backtick, backslash, ${, newlines, tabs, carriage returns.
#[allow(dead_code)]
fn escape_for_template_literal(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        match c {
            '`' => result.push_str("\\`"),
            '\\' => result.push_str("\\\\"),
            '$' if chars.peek() == Some(&'{') => {
                result.push_str("\\$");
            }
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            '\t' => result.push_str("\\t"),
            _ => result.push(c),
        }
    }
    result
}

/// Trim leading and trailing whitespace from output parts.
/// This trims whitespace from the first and last Html parts if they exist.
fn trim_output_parts(parts: &mut Vec<OutputPart>) {
    // Trim leading whitespace from first Html part
    if let Some(OutputPart::Html(html)) = parts.first_mut() {
        *html = html.trim_start().to_string();
        if html.is_empty() {
            parts.remove(0);
        }
    }

    // Trim trailing whitespace from last Html part
    if let Some(OutputPart::Html(html)) = parts.last_mut() {
        *html = html.trim_end().to_string();
        if html.is_empty() {
            parts.pop();
        }
    }
}

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

/// A snippet definition.
#[derive(Debug)]
struct SnippetDef {
    name: String,
    params: Vec<String>,
    body_parts: Vec<OutputPart>,
    /// Whether this snippet can be hoisted to module level
    can_hoist: bool,
}

/// Server-side code generator.
struct ServerCodeGenerator<'a> {
    component_name: String,
    source: String,
    output_parts: Vec<OutputPart>,
    instance_script: Option<&'a Script>,
    /// Module script (context="module") - executed at module level outside component
    module_script: Option<&'a Script>,
    /// Map of constant variable names to their values
    constant_vars: FxHashMap<String, String>,
    /// Snippet definitions to be generated at module level
    snippets: Vec<SnippetDef>,
    /// Component analysis from Phase 2
    analysis: Option<&'a ComponentAnalysis>,
    /// Whether the component uses store subscriptions (requires $$store_subs variable)
    uses_store_subs: bool,
    /// Whether experimental.async is enabled
    use_async: bool,
    /// CSS injection info (hash, code) if css="injected"
    injected_css: Option<(String, String)>,
    /// Whether to skip hydration boundaries (empty comment markers after RenderTags/Components)
    /// This is true when the current fragment is "standalone" (contains only a single RenderTag/Component)
    skip_hydration_boundaries: bool,
}

/// A part of the output - either static HTML or dynamic code.
#[derive(Debug)]
enum OutputPart {
    Html(String),
    Expression(String),
    /// Raw expression that doesn't need escaping (e.g., $.attributes())
    RawExpression(String),
    /// Raw HTML expression - {@html expr}
    HtmlExpression(String),
    Component {
        name: String,
        props: Vec<String>,
        /// Spread expressions (e.g., `attrs` from `{...attrs}`)
        spreads: Vec<String>,
        has_prior_content: bool,
        children: Option<Vec<OutputPart>>,
        /// Snippets defined inside the component (name, params, body, is_true_snippet)
        /// is_true_snippet=true means it's a SnippetBlock (needs hoisting as function)
        /// is_true_snippet=false means it's a slot child (inline in $$slots with destructured params)
        snippets: Vec<(String, Vec<String>, Vec<OutputPart>, bool)>,
        /// Slot names to add to $$slots
        slot_names: Vec<String>,
        /// Whether this component is dynamic (could be undefined/null)
        dynamic: bool,
    },
    /// Component with bind directives - requires do/while settling
    ComponentWithBindings {
        name: String,
        props: Vec<String>,
        /// Spread expressions (e.g., `attrs` from `{...attrs}`)
        spreads: Vec<String>,
        bindings: Vec<(String, String)>, // (prop_name, variable_name)
        #[allow(dead_code)]
        // Always true for component bindings - comment marker handled in build_parts
        has_prior_content: bool,
        #[allow(dead_code)] // TODO: Handle children for components with bindings
        children: Option<Vec<OutputPart>>,
        /// Whether this component is dynamic (could be undefined/null)
        dynamic: bool,
    },
    Comment,
    /// Each block - produces a for loop
    EachBlock {
        iterable: String,
        context_name: Option<String>,
        index_name: Option<String>,
        body: Vec<OutputPart>,
        /// Fallback content (for {:else} clause)
        #[allow(dead_code)]
        fallback: Option<Vec<OutputPart>>,
    },
    /// If block - produces an if statement
    IfBlock {
        test_expr: String,
        consequent_body: Vec<OutputPart>,
        alternate_body: Option<Vec<OutputPart>>,
    },
    /// svelte:element - dynamic element
    SvelteElement {
        tag_expr: String,
        /// Attributes expression (e.g., "{ class: 'foo' }" or "void 0" for none)
        attrs_expr: Option<String>,
        /// Body content (children)
        body: Vec<OutputPart>,
    },
    /// Select element with value - produces $$renderer.select() call
    SelectElement {
        attrs_obj: String,
        body: Vec<OutputPart>,
        /// Whether this select has rich content
        is_rich: bool,
        /// CSS hash for scoped elements
        css_hash: Option<String>,
    },
    /// Option element - produces $$renderer.option() call
    OptionElement {
        attrs: Vec<(String, String)>,
        body: Vec<OutputPart>,
        /// Whether this option has rich content (requires 7th argument `true`)
        is_rich: bool,
        /// Direct value expression (when synthetic_value_node is set) - passed directly without callback
        direct_value: Option<String>,
        /// CSS hash for scoped elements
        css_hash: Option<String>,
    },
    /// Await block - produces $.await() call
    AwaitBlock {
        promise: String,
        then_param: String,
        pending_body: Vec<OutputPart>,
        then_body: Vec<OutputPart>,
        catch_param: String,
        catch_body: Vec<OutputPart>,
    },
    /// svelte:boundary - async error boundary
    SvelteBoundary {
        body: Vec<OutputPart>,
        /// True if this is rendering the pending state (use <!--[!-->) marker)
        /// False if rendering main content (use <!--[--> marker)
        is_pending: bool,
    },
    /// svelte:head - document head manipulation
    SvelteHead {
        hash: String,
        body: Vec<OutputPart>,
    },
    /// title element inside svelte:head - uses $$renderer.title()
    TitleElement {
        body: Vec<OutputPart>,
    },
    /// Textarea body with value - generates const $$body = $.escape(expr); if ($$body) { ... }
    TextareaBody {
        value_expr: String,
    },
    /// Render tag call - calls a snippet function
    RenderCall {
        call_str: String,
        /// Whether to skip the hydration boundary marker after the call
        /// This is true when the RenderTag is the only child in a fragment (standalone)
        skip_boundary: bool,
    },
    /// Const declaration - produces const variable
    ConstDeclaration(String),
    /// Block scope - wraps content in { } JavaScript block
    BlockScope {
        body: Vec<OutputPart>,
    },
    /// Hydration anchor marker - outputs "<!>" after Components/RenderTags/HtmlTags in select/optgroup
    HydrationAnchor,
    /// Local snippet function declaration (e.g., `function failed($$renderer, e) { ... }`)
    /// Used for snippets inside svelte:boundary that need to be local functions
    SnippetFunction {
        name: String,
        params: Vec<String>,
        body: Vec<OutputPart>,
    },
}

impl<'a> ServerCodeGenerator<'a> {
    fn new(
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

        // Check if the analysis has any StoreSub bindings
        let uses_store_subs = analysis
            .map(|a| {
                a.root
                    .bindings
                    .iter()
                    .any(|b| matches!(b.kind, BindingKind::StoreSub))
            })
            .unwrap_or(false);

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
        }
    }

    /// Create a generator for a child fragment with the given skip_hydration_boundaries flag
    fn new_child_generator(&self, skip_hydration_boundaries: bool) -> Self {
        Self {
            component_name: self.component_name.clone(),
            source: self.source.clone(),
            output_parts: Vec::with_capacity(32),
            instance_script: None,
            module_script: None,
            constant_vars: self.constant_vars.clone(),
            snippets: Vec::new(),
            analysis: None,
            uses_store_subs: self.uses_store_subs,
            use_async: self.use_async,
            injected_css: None,
            skip_hydration_boundaries,
        }
    }

    /// Set the injected CSS info (for css="injected" mode)
    fn set_injected_css(&mut self, hash: String, code: String) {
        self.injected_css = Some((hash, code));
    }

    /// Transform store subscriptions in an expression.
    /// Converts `$store` to `$.store_get($$store_subs ??= {}, '$store', store)`.
    fn transform_store_refs(&self, expr: &str) -> String {
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
    fn transform_rune_in_template_expr(expr: &str) -> String {
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
        result
    }

    /// Transform store subscriptions in script content.
    /// This is used for the instance script where store references like `$page`
    /// need to be transformed to `$.store_get($$store_subs ??= {}, '$page', page)`.
    fn transform_store_refs_in_script(&self, script: &str) -> String {
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

    fn generate_component(&mut self, fragment: &Fragment) -> Result<(), TransformError> {
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

    fn generate_node(&mut self, node: &TemplateNode, is_root: bool) -> Result<(), TransformError> {
        match node {
            TemplateNode::Text(text) => self.generate_text(text, is_root),
            TemplateNode::RegularElement(element) => self.generate_element(element),
            TemplateNode::ExpressionTag(tag) => self.generate_expression_tag(tag),
            TemplateNode::Component(component) => self.generate_component_usage(component),
            TemplateNode::IfBlock(block) => self.generate_if_block(block),
            TemplateNode::EachBlock(block) => self.generate_each_block(block),
            TemplateNode::AwaitBlock(block) => self.generate_await_block(block),
            TemplateNode::KeyBlock(block) => self.generate_key_block(block),
            TemplateNode::SnippetBlock(block) => self.generate_snippet_block(block),
            TemplateNode::RenderTag(tag) => self.generate_render_tag(tag),
            TemplateNode::HtmlTag(tag) => self.generate_html_tag(tag),
            TemplateNode::SvelteElement(elem) => self.generate_svelte_element(elem),
            TemplateNode::SvelteBoundary(boundary) => self.generate_svelte_boundary(boundary),
            TemplateNode::SvelteHead(head) => self.generate_svelte_head(head),
            TemplateNode::ConstTag(tag) => self.generate_const_tag(tag),
            TemplateNode::TitleElement(title) => self.generate_title_element(title),
            TemplateNode::SvelteComponent(elem) => self.generate_svelte_component(elem),
            TemplateNode::SvelteSelf(elem) => self.generate_svelte_self(elem),
            _ => Ok(()),
        }
    }

    fn generate_text(&mut self, text: &Text, _is_root: bool) -> Result<(), TransformError> {
        let data = &text.data;

        if data.trim().is_empty() {
            // Whitespace-only text becomes a single space if not empty
            if !data.is_empty() {
                self.output_parts.push(OutputPart::Html(" ".to_string()));
            }
        } else {
            // Collapse all whitespace sequences (including newlines) to single spaces
            // This matches the behavior of clean_nodes in the official compiler
            let collapsed = collapse_whitespace(data);
            self.output_parts
                .push(OutputPart::Html(escape_html(&collapsed)));
        }
        Ok(())
    }

    fn generate_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Handle <option> element specially
        if name == "option" {
            return self.generate_option_element(element);
        }

        // Handle <select> with value specially - use $$renderer.select()
        if name == "select" && self.select_has_value_attribute(element) {
            return self.generate_select_element(element);
        }

        // Check if we have spread attributes
        let has_spread = element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        // If we have spread attributes, use $.attributes() for the whole thing
        // This must come before textarea handling since textarea with spreads
        // needs $.attributes() (e.g., <textarea {...value}></textarea>)
        if has_spread {
            return self.generate_element_with_spread(element);
        }

        // Handle <textarea> with value/bind:value specially - output value as content
        if name == "textarea" {
            return self.generate_textarea_element(element);
        }

        // Collect directives and base attributes
        let mut class_directives: Vec<&ClassDirective> = Vec::new();
        let mut style_directives: Vec<&StyleDirective> = Vec::new();
        let mut base_class: Option<String> = None;
        let mut base_style: Option<String> = None;

        // Get CSS hash for scoped elements
        let css_hash = if element.metadata.scoped {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        for attr in &element.attributes {
            match attr {
                Attribute::ClassDirective(dir) => {
                    class_directives.push(dir);
                }
                Attribute::StyleDirective(dir) => {
                    style_directives.push(dir);
                }
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    base_class = self.extract_attribute_text_value(node);
                    // Also extract dynamic expression for class={expr} with class directives
                    if base_class.is_none()
                        && let AttributeValue::Expression(expr_tag) = &node.value
                    {
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                            base_class = Some(format!("__EXPR__:{}", raw_expr));
                        }
                    }
                }
                Attribute::Attribute(node) if node.name.as_str() == "style" => {
                    base_style = self.extract_attribute_text_value(node);
                }
                _ => {}
            }
        }

        // Start tag
        let mut tag = format!("<{}", name);

        // Attributes - handle class and style specially if directives exist
        for attr in &element.attributes {
            match attr {
                // Skip class/style directives - handled separately
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => continue,
                // Skip class attribute if we have class directives
                Attribute::Attribute(node)
                    if node.name.as_str() == "class" && !class_directives.is_empty() =>
                {
                    continue;
                }
                // Skip style attribute if we have style directives
                Attribute::Attribute(node)
                    if node.name.as_str() == "style" && !style_directives.is_empty() =>
                {
                    continue;
                }
                // Handle class attribute specially - add CSS hash if scoped
                Attribute::Attribute(node) if node.name.as_str() == "class" => {
                    if let Some(attr_str) =
                        self.generate_attribute_node_with_css_hash(node, css_hash.as_deref())?
                    {
                        tag.push_str(&attr_str);
                    }
                }
                _ => {
                    if let Some(attr_str) =
                        self.generate_attribute_for_element(attr, Some(element))?
                    {
                        tag.push_str(&attr_str);
                    }
                }
            }
        }

        // If element is scoped but has no class attribute, add one with just the hash
        if let Some(ref hash) = css_hash
            && base_class.is_none()
            && class_directives.is_empty()
        {
            tag.push_str(&format!(" class=\"{}\"", hash));
        }

        // Generate $.attr_class() if we have class directives
        if !class_directives.is_empty() {
            let attr_class_call =
                self.generate_attr_class_call(&class_directives, base_class.as_deref())?;
            tag.push_str(&attr_class_call);
        }

        // Generate $.attr_style() if we have style directives
        if !style_directives.is_empty() {
            let attr_style_call =
                self.generate_attr_style_call(&style_directives, base_style.as_deref())?;
            tag.push_str(&attr_style_call);
        }

        if is_void_element(name) {
            tag.push_str("/>");
            self.output_parts.push(OutputPart::Html(tag));
        } else {
            tag.push('>');
            self.output_parts.push(OutputPart::Html(tag));

            // Children - filter and process with position awareness
            // First, filter out comments and find meaningful content boundaries
            let children: Vec<_> = element.fragment.nodes.iter().collect();

            // Find first and last non-whitespace, non-comment, non-snippet children
            // Snippet blocks are hoisted and don't produce inline output
            let _first_content = children.iter().position(|c| {
                !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                    && !matches!(c, TemplateNode::Comment(_))
                    && !matches!(c, TemplateNode::SnippetBlock(_))
            });
            let last_content = children.iter().rposition(|c| {
                !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty())
                    && !matches!(c, TemplateNode::Comment(_))
                    && !matches!(c, TemplateNode::SnippetBlock(_))
            });

            let mut has_output_content = false;
            let mut is_first_content = true;

            for (i, child) in children.iter().enumerate() {
                // Skip comments
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }

                // For text nodes, check if it should become a space
                if let TemplateNode::Text(text) = child {
                    let data = &text.data;
                    if data.trim().is_empty() {
                        // For certain elements, skip all whitespace-only text nodes entirely
                        // This matches the clean_nodes behavior in the official compiler:
                        // - SVG elements (except <text>) strip internal whitespace
                        // - Table-related elements strip internal whitespace
                        // - select/optgroup strip internal whitespace
                        let is_svg_parent = matches!(
                            name,
                            "svg"
                                | "g"
                                | "defs"
                                | "symbol"
                                | "marker"
                                | "clipPath"
                                | "mask"
                                | "pattern"
                                | "linearGradient"
                                | "radialGradient"
                                | "filter"
                                | "feBlend"
                                | "feColorMatrix"
                                | "feComponentTransfer"
                                | "feComposite"
                                | "feConvolveMatrix"
                                | "feDiffuseLighting"
                                | "feDisplacementMap"
                                | "feFlood"
                                | "feGaussianBlur"
                                | "feImage"
                                | "feMerge"
                                | "feMorphology"
                                | "feOffset"
                                | "feSpecularLighting"
                                | "feTile"
                                | "feTurbulence"
                        );
                        let can_remove_whitespace = is_svg_parent
                            || matches!(
                                name,
                                "select"
                                    | "optgroup"
                                    | "tr"
                                    | "table"
                                    | "tbody"
                                    | "thead"
                                    | "tfoot"
                                    | "colgroup"
                                    | "datalist"
                            );
                        if can_remove_whitespace {
                            continue;
                        }
                        // Whitespace-only text: add space only if between content elements
                        if has_output_content
                            && last_content.is_some()
                            && i < last_content.unwrap()
                            && !data.is_empty()
                        {
                            self.output_parts.push(OutputPart::Html(" ".to_string()));
                        }
                        continue;
                    }

                    // For text nodes, strip leading/trailing whitespace and collapse internal whitespace
                    if is_first_content {
                        // First content: trim leading whitespace
                        // If this is also the last content, trim trailing too
                        let is_last = last_content.is_some() && i == last_content.unwrap();
                        let trimmed = if is_last {
                            // Both first and last - trim both sides
                            data.trim()
                        } else {
                            data.trim_start()
                        };
                        if !trimmed.is_empty() {
                            // Collapse internal whitespace
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    // Check if this is the last content - trim trailing
                    if last_content.is_some() && i == last_content.unwrap() {
                        let trimmed = data.trim_end();
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        continue;
                    }
                }

                self.generate_node(child, false)?;
                // Snippet blocks are hoisted and don't produce inline output
                if !matches!(child, TemplateNode::SnippetBlock(_)) {
                    has_output_content = true;
                    is_first_content = false;
                }
            }

            // For select/optgroup with Component/RenderTag/HtmlTag, add <!> marker before closing tag
            if (name == "select" || name == "optgroup")
                && Self::is_customizable_select_element(element)
            {
                self.output_parts.push(OutputPart::HydrationAnchor);
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    /// Generate an element with spread attributes using $.attributes().
    fn generate_element_with_spread(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        let name = element.name.as_str();

        // Build the object literal for $.attributes()
        let mut object_parts: Vec<String> = Vec::new();
        // Collect class directives: { className: expression }
        let mut class_directive_parts: Vec<String> = Vec::new();
        // Collect style directives: { styleName: expression }
        let mut style_directive_parts: Vec<String> = Vec::new();

        for attr in &element.attributes {
            match attr {
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        // Transform rune calls in spread expressions
                        let expr = Self::transform_rune_in_template_expr(&expr);
                        object_parts.push(format!("...{}", expr));
                    }
                }
                Attribute::Attribute(node) => {
                    // Skip event handlers
                    if node.name.starts_with("on") {
                        continue;
                    }
                    let attr_name = node.name.as_str();
                    let value = self.extract_attribute_value_as_string(node)?;
                    // Wrap class attribute dynamic expressions in $.clsx()
                    let value = if attr_name == "class" && needs_clsx(&node.value) {
                        format!("$.clsx({})", value)
                    } else {
                        value
                    };
                    object_parts.push(format!("{}: {}", quote_prop_name(attr_name), value));
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    // Skip bind:this on server - it's a DOM reference only needed client-side
                    if bind_name == "this" {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(format!("{}: {}", quote_prop_name(bind_name), expr));
                    }
                }
                Attribute::ClassDirective(class_dir) => {
                    // Build class directive: { className: expression }
                    let class_name = class_dir.name.as_str();
                    let expr_start = class_dir.expression.start().unwrap_or(0) as usize;
                    let expr_end = class_dir.expression.end().unwrap_or(0) as usize;
                    let value = if expr_end > expr_start && expr_end <= self.source.len() {
                        self.source[expr_start..expr_end].trim().to_string()
                    } else {
                        "true".to_string()
                    };
                    class_directive_parts.push(format!("{}: {}", class_name, value));
                }
                Attribute::StyleDirective(style_dir) => {
                    // Build style directive: { styleName: expression }
                    let style_name = style_dir.name.as_str();
                    let value = match &style_dir.value {
                        AttributeValue::True(_) => "true".to_string(),
                        AttributeValue::Expression(expr) => {
                            let expr_start = expr.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                self.source[expr_start..expr_end].trim().to_string()
                            } else {
                                "true".to_string()
                            }
                        }
                        AttributeValue::Sequence(parts) => {
                            // For sequences, build a template literal or concatenation
                            let mut expr_parts: Vec<String> = Vec::new();
                            for part in parts {
                                match part {
                                    AttributeValuePart::Text(text) => {
                                        let text_start = text.start as usize;
                                        let text_end = text.end as usize;
                                        if text_end > text_start && text_end <= self.source.len() {
                                            expr_parts.push(format!(
                                                "'{}'",
                                                &self.source[text_start..text_end]
                                            ));
                                        }
                                    }
                                    AttributeValuePart::ExpressionTag(expr) => {
                                        let expr_start =
                                            expr.expression.start().unwrap_or(0) as usize;
                                        let expr_end = expr.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            expr_parts.push(
                                                self.source[expr_start..expr_end]
                                                    .trim()
                                                    .to_string(),
                                            );
                                        }
                                    }
                                }
                            }
                            if expr_parts.len() == 1 {
                                expr_parts.remove(0)
                            } else {
                                expr_parts.join(" + ")
                            }
                        }
                    };
                    style_directive_parts.push(format!("{}: {}", style_name, value));
                }
                Attribute::OnDirective(_) => {}
                _ => {}
            }
        }

        let object_literal = format!("{{ {} }}", object_parts.join(", "));

        // Build class directives object or "void 0"
        let classes_arg = if class_directive_parts.is_empty() {
            "void 0".to_string()
        } else {
            format!("{{ {} }}", class_directive_parts.join(", "))
        };

        // Build style directives object or "void 0"
        let styles_arg = if style_directive_parts.is_empty() {
            "void 0".to_string()
        } else {
            format!("{{ {} }}", style_directive_parts.join(", "))
        };

        // Determine flags for $.attributes() call
        // ELEMENT_IS_NAMESPACED = 1, ELEMENT_PRESERVE_ATTRIBUTE_CASE = 2, ELEMENT_IS_INPUT = 4
        let is_custom_element = self.is_custom_element(element);
        let is_svg_or_mathml = element.metadata.svg || element.metadata.mathml;
        let flags = if is_svg_or_mathml {
            3 // ELEMENT_IS_NAMESPACED | ELEMENT_PRESERVE_ATTRIBUTE_CASE
        } else if is_custom_element {
            2 // ELEMENT_PRESERVE_ATTRIBUTE_CASE
        } else if name == "input" {
            4 // ELEMENT_IS_INPUT
        } else {
            0
        };

        // Start tag with $.attributes() call
        let tag = format!("<{}", name);
        self.output_parts.push(OutputPart::Html(tag));

        // Determine CSS hash for scoped elements
        let css_hash = if element.metadata.scoped {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        // Add $.attributes() expression with full arguments
        // $.attributes(object, css_hash, classes, styles, flags)
        // Only include trailing arguments if they are non-default values
        // Defaults: css_hash=void 0, classes=void 0, styles=void 0, flags=0
        let attributes_call = {
            let mut args = vec![object_literal.clone()];
            let css_hash_arg = if let Some(ref hash) = css_hash {
                format!("'{}'", hash)
            } else {
                "void 0".to_string()
            };
            // Build args from right to left, omitting trailing defaults
            let has_flags = flags != 0;
            let has_styles = styles_arg != "void 0";
            let has_classes = classes_arg != "void 0";
            let has_css_hash = css_hash.is_some();

            if has_flags || has_styles || has_classes || has_css_hash {
                args.push(css_hash_arg);
                if has_flags || has_styles || has_classes {
                    args.push(classes_arg.clone());
                    if has_flags || has_styles {
                        args.push(styles_arg.clone());
                        if has_flags {
                            args.push(flags.to_string());
                        }
                    }
                }
            }
            format!("$.attributes({})", args.join(", "))
        };
        self.output_parts
            .push(OutputPart::RawExpression(attributes_call));

        if is_void_element(name) {
            self.output_parts.push(OutputPart::Html("/>".to_string()));
        } else {
            self.output_parts.push(OutputPart::Html(">".to_string()));

            // Generate children with proper whitespace handling
            let children: Vec<_> = element
                .fragment
                .nodes
                .iter()
                .filter(|c| !matches!(c, TemplateNode::Comment(_)))
                .collect();

            // Find first and last non-whitespace content children
            let _first_content = children
                .iter()
                .position(|c| !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty()));
            let last_content = children
                .iter()
                .rposition(|c| !matches!(c, TemplateNode::Text(t) if t.data.trim().is_empty()));

            let mut has_output_content = false;
            let mut is_first_content = true;

            // Determine if whitespace-only text nodes can be removed entirely
            let is_svg_parent = matches!(
                name,
                "svg" | "g" | "defs" | "symbol" | "marker" | "clipPath" | "mask" | "pattern"
            );
            let can_remove_whitespace = is_svg_parent
                || matches!(
                    name,
                    "select"
                        | "optgroup"
                        | "tr"
                        | "table"
                        | "tbody"
                        | "thead"
                        | "tfoot"
                        | "colgroup"
                        | "datalist"
                );

            for (i, child) in children.iter().enumerate() {
                if let TemplateNode::Text(text) = *child {
                    let data = &text.data;
                    if data.trim().is_empty() {
                        if can_remove_whitespace {
                            continue;
                        }
                        // Whitespace-only text: add space only if between content elements
                        if has_output_content
                            && last_content.is_some()
                            && i < last_content.unwrap()
                            && !data.is_empty()
                        {
                            self.output_parts.push(OutputPart::Html(" ".to_string()));
                        }
                        continue;
                    }

                    // Handle first content text node - trim leading whitespace
                    if is_first_content {
                        let is_last = last_content.is_some() && i == last_content.unwrap();
                        let trimmed = if is_last {
                            data.trim()
                        } else {
                            data.trim_start()
                        };
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        is_first_content = false;
                        continue;
                    }

                    // Handle last content text node - trim trailing whitespace
                    if last_content.is_some() && i == last_content.unwrap() {
                        let trimmed = data.trim_end();
                        if !trimmed.is_empty() {
                            let collapsed = collapse_whitespace(trimmed);
                            self.output_parts
                                .push(OutputPart::Html(escape_html(&collapsed)));
                        }
                        has_output_content = true;
                        continue;
                    }

                    // Middle text - collapse whitespace
                    let collapsed = collapse_whitespace(data);
                    self.output_parts
                        .push(OutputPart::Html(escape_html(&collapsed)));
                    has_output_content = true;
                    is_first_content = false;
                } else {
                    self.generate_node(child, false)?;
                    has_output_content = true;
                    is_first_content = false;
                }
            }

            // For select/optgroup with Component/RenderTag/HtmlTag, add <!> marker before closing tag
            if (name == "select" || name == "optgroup")
                && Self::is_customizable_select_element(element)
            {
                self.output_parts.push(OutputPart::HydrationAnchor);
            }

            // End tag
            self.output_parts
                .push(OutputPart::Html(format!("</{}>", name)));
        }

        Ok(())
    }

    /// Check if an element is a custom element.
    /// Custom elements have a hyphen in their name or have an `is` attribute.
    fn is_custom_element(&self, element: &RegularElement) -> bool {
        let name = element.name.as_str();
        // Check if name contains hyphen
        if name.contains('-') {
            return true;
        }
        // Check if element has an `is` attribute
        element
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::Attribute(node) if node.name.as_str() == "is"))
    }

    /// Extract attribute value as a string representation for code generation.
    fn extract_attribute_value_as_string(
        &self,
        node: &AttributeNode,
    ) -> Result<String, TransformError> {
        // Check if this is a class attribute - needs whitespace normalization
        let is_class_attr = node.name.eq_ignore_ascii_case("class");

        match &node.value {
            AttributeValue::True(_) => Ok("true".to_string()),
            AttributeValue::Sequence(parts) => {
                // Optimization: if the sequence is a single expression with no text,
                // return the expression directly without template literal wrapping
                if parts.len() == 1
                    && let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0]
                {
                    let start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if end > start && end <= self.source.len() {
                        return Ok(self.source[start..end].trim().to_string());
                    }
                }

                let mut value = String::new();
                let mut has_expression = false;
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            // Normalize whitespace for class attributes
                            if is_class_attr {
                                let normalized: String =
                                    text.data.split_whitespace().collect::<Vec<_>>().join(" ");
                                value.push_str(&normalized);
                            } else {
                                value.push_str(&text.data);
                            }
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            has_expression = true;
                            // Extract expression from source
                            let start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if end > start && end <= self.source.len() {
                                let expr = self.source[start..end].trim();
                                // Wrap expressions in $.stringify() when mixed with text
                                // This matches the official Svelte build_attribute_value behavior
                                value.push_str(&format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                }
                // If it looks like it needs to be a template literal (has ${...})
                if has_expression {
                    Ok(format!("`{}`", value))
                } else {
                    Ok(format!("'{}'", value))
                }
            }
            AttributeValue::Expression(expr_tag) => {
                let start = expr_tag.expression.start().unwrap_or(0) as usize;
                let end = expr_tag.expression.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    Ok(self.source[start..end].trim().to_string())
                } else {
                    Ok("undefined".to_string())
                }
            }
        }
    }

    /// Check if select element has a value attribute or bind:value.
    fn select_has_value_attribute(&self, element: &RegularElement) -> bool {
        element.attributes.iter().any(|attr| {
            matches!(attr, Attribute::Attribute(node) if node.name.as_str() == "value")
                || matches!(attr, Attribute::BindDirective(bind) if bind.name.as_str() == "value")
                || matches!(attr, Attribute::SpreadAttribute(_))
        })
    }

    /// Generate <select> element using $$renderer.select().
    fn generate_select_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        // Extract attributes for the select element, preserving declaration order.
        // The value attribute (from value={...} or bind:value={...}) is included inline
        // in the attrs list to maintain its position relative to spreads.
        let mut attrs = Vec::new();
        let mut has_value = false;

        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    if attr_name == "value" {
                        // Include value in its original position
                        let value = self.extract_attribute_value_as_string(node)?;
                        attrs.push((attr_name.to_string(), value));
                        has_value = true;
                        continue;
                    }
                    // Skip event handlers
                    if attr_name.starts_with("on") {
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    attrs.push((attr_name.to_string(), value));
                }
                Attribute::BindDirective(bind) => {
                    if bind.name.as_str() == "value" {
                        // Extract the bound variable expression, keeping it in order
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let raw_expr = self.source[expr_start..expr_end].trim().to_string();
                            let value = self.transform_store_refs(&raw_expr);
                            attrs.push(("value".to_string(), value));
                            has_value = true;
                        }
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Include spread attributes in the select attrs object
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        let expr = Self::transform_rune_in_template_expr(&expr);
                        attrs.push(("__spread__".to_string(), format!("...{}", expr)));
                    }
                }
                _ => {}
            }
        }
        let _ = has_value; // value is now included in attrs directly

        // Generate body parts for children
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Process children
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        // Skip leading/trailing whitespace
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Skip all whitespace-only text nodes in select elements (not just leading/trailing)
        // This matches the clean_nodes behavior in the official compiler
        for node in children.iter().take(end_idx).skip(start_idx) {
            if let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        // Build the attributes object, preserving declaration order
        let mut attr_parts = Vec::new();
        for (name, value) in &attrs {
            if name == "__spread__" {
                // Spread attributes: emit as ...expr
                attr_parts.push(value.clone());
            } else {
                attr_parts.push(format!("{}: {}", quote_prop_name(name), value));
            }
        }
        let attrs_obj = if attr_parts.is_empty() {
            "{}".to_string()
        } else {
            format!("{{ {} }}", attr_parts.join(", "))
        };

        // Check if it has rich content (Components, RenderTags, etc.)
        let is_rich = Self::has_component_or_render_tag(&element.fragment.nodes);

        // Check if this element has a class attribute
        let has_class = attrs.iter().any(|(name, _)| name == "class");

        // Get CSS hash for scoped elements - only if they have a class attribute
        let css_hash = if element.metadata.scoped && has_class {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        // Push SelectElement OutputPart
        self.output_parts.push(OutputPart::SelectElement {
            attrs_obj,
            body: body_generator.output_parts,
            is_rich,
            css_hash,
        });

        Ok(())
    }

    /// Generate <textarea> element with value as content.
    fn generate_textarea_element(
        &mut self,
        element: &RegularElement,
    ) -> Result<(), TransformError> {
        // Find value attribute or bind:value
        let mut value_expr: Option<String> = None;
        let mut bind_value_expr: Option<String> = None;

        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.as_str() == "value" => {
                    value_expr = Some(self.extract_attribute_value_as_string(node)?);
                }
                Attribute::BindDirective(bind) if bind.name.as_str() == "value" => {
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        bind_value_expr =
                            Some(self.source[expr_start..expr_end].trim().to_string());
                    }
                }
                _ => {}
            }
        }

        // Get the body expression (value takes precedence, then bind:value)
        let body_expr = value_expr.or(bind_value_expr);

        // Start building the tag
        let mut tag = "<textarea".to_string();

        // Add other attributes (excluding value)
        for attr in &element.attributes {
            match attr {
                Attribute::Attribute(node) if node.name.as_str() == "value" => continue,
                Attribute::BindDirective(bind) if bind.name.as_str() == "value" => continue,
                Attribute::ClassDirective(_) | Attribute::StyleDirective(_) => continue,
                Attribute::OnDirective(_) => continue,
                _ => {
                    if let Some(attr_str) =
                        self.generate_attribute_for_element(attr, Some(element))?
                    {
                        tag.push_str(&attr_str);
                    }
                }
            }
        }

        tag.push('>');
        self.output_parts.push(OutputPart::Html(tag));

        // Generate the body - if we have a value expression, use it
        if let Some(expr) = body_expr {
            // Use TextareaBody OutputPart for proper statement-based generation
            self.output_parts
                .push(OutputPart::TextareaBody { value_expr: expr });
        } else {
            // No value - process children normally
            for child in &element.fragment.nodes {
                if matches!(child, TemplateNode::Comment(_)) {
                    continue;
                }
                self.generate_node(child, false)?;
            }
        }

        self.output_parts
            .push(OutputPart::Html("</textarea>".to_string()));

        Ok(())
    }

    fn generate_option_element(&mut self, element: &RegularElement) -> Result<(), TransformError> {
        // Extract attributes as (name, value) pairs
        let mut attrs = Vec::new();
        for attr in &element.attributes {
            if let Attribute::Attribute(node) = attr {
                let name = node.name.to_string();
                match &node.value {
                    AttributeValue::True(_) => {
                        attrs.push((name, "true".to_string()));
                    }
                    AttributeValue::Sequence(parts) => {
                        // Check if it's a single expression (like value='{foo}')
                        let expr_parts: Vec<_> = parts
                            .iter()
                            .filter(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                            .collect();
                        let text_parts: Vec<_> = parts
                            .iter()
                            .filter_map(|p| match p {
                                AttributeValuePart::Text(t) => Some(t.data.as_str()),
                                _ => None,
                            })
                            .collect();
                        let all_text_whitespace = text_parts.iter().all(|t| t.trim().is_empty());

                        if expr_parts.len() == 1 && all_text_whitespace {
                            // Single expression - use variable reference
                            if let AttributeValuePart::ExpressionTag(expr_tag) = expr_parts[0] {
                                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if expr_end > expr_start && expr_end <= self.source.len() {
                                    let expr = self.source[expr_start..expr_end].trim().to_string();
                                    attrs.push((name, expr));
                                }
                            }
                        } else {
                            // Mixed or pure text - concatenate
                            let mut value = String::new();
                            for part in parts {
                                match part {
                                    AttributeValuePart::Text(text) => {
                                        value.push_str(&text.data);
                                    }
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        let expr_start =
                                            expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end =
                                            expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            let expr = self.source[expr_start..expr_end]
                                                .trim()
                                                .to_string();
                                            value.push_str(&format!("${{$.stringify({})}}", expr));
                                        }
                                    }
                                }
                            }
                            attrs.push((name, format!("'{}'", value)));
                        }
                    }
                    _ => {}
                }
            }
        }

        // Check if this element has a class attribute
        let has_class = attrs.iter().any(|(name, _)| name == "class");

        // Get CSS hash for scoped elements - only if they have a class attribute
        let css_hash = if element.metadata.scoped && has_class {
            self.analysis.and_then(|a| {
                if !a.css.hash.is_empty() {
                    Some(a.css.hash.clone())
                } else {
                    None
                }
            })
        } else {
            None
        };

        // Check if we have a synthetic_value_node - if so, pass the value directly
        if let Some(synthetic_value_node) = &element.metadata.synthetic_value_node {
            // Get expression source directly
            let expr_start = synthetic_value_node.expression.start().unwrap_or(0) as usize;
            let expr_end = synthetic_value_node.expression.end().unwrap_or(0) as usize;
            let expr_source = if expr_end > expr_start && expr_end <= self.source.len() {
                self.source[expr_start..expr_end].trim().to_string()
            } else {
                "undefined".to_string()
            };

            // Check if this option has rich content
            let is_rich = Self::is_rich_option_content(&element.fragment.nodes);

            self.output_parts.push(OutputPart::OptionElement {
                attrs,
                body: Vec::new(),
                is_rich,
                direct_value: Some(expr_source),
                css_hash: css_hash.clone(),
            });

            return Ok(());
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Process children (skip leading/trailing whitespace)
        let children: Vec<_> = element.fragment.nodes.iter().collect();
        let len = children.len();

        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = children[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = children[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        for node in children.iter().take(end_idx).skip(start_idx) {
            body_generator.generate_node(node, false)?;
        }

        // Check if this option has rich content (non-option elements, components, etc.)
        let is_rich = Self::is_rich_option_content(&element.fragment.nodes);

        self.output_parts.push(OutputPart::OptionElement {
            attrs,
            body: body_generator.output_parts,
            is_rich,
            direct_value: None,
            css_hash,
        });

        Ok(())
    }

    /// Check if option content is "rich" (contains elements other than text, or components/render tags)
    fn is_rich_option_content(nodes: &[TemplateNode]) -> bool {
        for node in nodes {
            match node {
                // Regular elements in option are rich content
                TemplateNode::RegularElement(_) => return true,
                // Components are rich content
                TemplateNode::Component(_) => return true,
                TemplateNode::SvelteComponent(_) => return true,
                // Render tags and HTML tags are rich content
                TemplateNode::RenderTag(_) => return true,
                TemplateNode::HtmlTag(_) => return true,
                // Blocks that may contain rich content need recursive check
                TemplateNode::IfBlock(if_block) => {
                    if Self::is_rich_option_content(&if_block.consequent.nodes) {
                        return true;
                    }
                    if let Some(alt) = &if_block.alternate
                        && Self::is_rich_option_content(&alt.nodes)
                    {
                        return true;
                    }
                }
                TemplateNode::EachBlock(each) => {
                    if Self::is_rich_option_content(&each.body.nodes) {
                        return true;
                    }
                }
                TemplateNode::KeyBlock(key) => {
                    if Self::is_rich_option_content(&key.fragment.nodes) {
                        return true;
                    }
                }
                TemplateNode::AwaitBlock(await_block) => {
                    if let Some(pending) = &await_block.pending
                        && Self::is_rich_option_content(&pending.nodes)
                    {
                        return true;
                    }
                    if let Some(then) = &await_block.then
                        && Self::is_rich_option_content(&then.nodes)
                    {
                        return true;
                    }
                    if let Some(catch) = &await_block.catch
                        && Self::is_rich_option_content(&catch.nodes)
                    {
                        return true;
                    }
                }
                TemplateNode::SvelteBoundary(boundary) => {
                    if Self::is_rich_option_content(&boundary.fragment.nodes) {
                        return true;
                    }
                }
                // Text and expression tags are not rich content
                TemplateNode::Text(_) => {}
                TemplateNode::ExpressionTag(_) => {}
                // Other nodes
                _ => {}
            }
        }
        false
    }

    /// Check if a select or optgroup element contains Components, RenderTags, or HtmlTags
    /// that require hydration anchor markers (<!>) before the closing tag.
    /// This does NOT include option elements with rich content - those are handled separately.
    fn is_customizable_select_element(element: &RegularElement) -> bool {
        let element_name = element.name.as_str();
        if element_name == "select" || element_name == "optgroup" {
            // Check for Components, RenderTags, HtmlTags directly in select/optgroup
            // or within control flow blocks (if, each, key, boundary)
            return Self::has_component_or_render_tag(&element.fragment.nodes);
        }
        false
    }

    /// Check if nodes contain Component, RenderTag, or HtmlTag (recursively through control flow).
    /// Does NOT recurse into option/optgroup children - only control flow blocks.
    fn has_component_or_render_tag(nodes: &[TemplateNode]) -> bool {
        for node in nodes {
            match node {
                // These require <!> marker
                TemplateNode::Component(_)
                | TemplateNode::SvelteComponent(_)
                | TemplateNode::RenderTag(_)
                | TemplateNode::HtmlTag(_) => return true,

                // Control flow blocks: check their contents
                TemplateNode::IfBlock(block) => {
                    if Self::has_component_or_render_tag(&block.consequent.nodes) {
                        return true;
                    }
                    if let Some(alt) = &block.alternate
                        && Self::has_component_or_render_tag(&alt.nodes)
                    {
                        return true;
                    }
                }
                TemplateNode::EachBlock(block) => {
                    if Self::has_component_or_render_tag(&block.body.nodes) {
                        return true;
                    }
                }
                TemplateNode::KeyBlock(block) => {
                    if Self::has_component_or_render_tag(&block.fragment.nodes) {
                        return true;
                    }
                }
                TemplateNode::SvelteBoundary(boundary) => {
                    if Self::has_component_or_render_tag(&boundary.fragment.nodes) {
                        return true;
                    }
                }

                // option/optgroup: do NOT recurse - their content doesn't affect the parent's <!> marker
                TemplateNode::RegularElement(_) => {}

                // Text, ExpressionTag, etc. don't require <!> marker
                _ => {}
            }
        }
        false
    }

    /// Check if a fragment is "standalone" - contains only a single RenderTag or Component
    /// (after trimming whitespace-only text nodes and comments).
    /// When standalone, hydration boundaries can be skipped because the parent's anchors are sufficient.
    fn is_standalone_fragment(nodes: &[TemplateNode]) -> bool {
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

        // Standalone if there's exactly one node and it's a RenderTag or Component
        meaningful_nodes.len() == 1
            && matches!(
                meaningful_nodes[0],
                TemplateNode::RenderTag(_) | TemplateNode::Component(_)
            )
    }

    fn generate_attribute_for_element(
        &mut self,
        attr: &Attribute,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        match attr {
            Attribute::Attribute(node) => self.generate_attribute_node(node, element),
            Attribute::BindDirective(bind) => {
                Self::generate_bind_directive_for_element(bind, &self.source, element)
            }
            // Event handlers are not rendered on server
            Attribute::OnDirective(_) => Ok(None),
            _ => Ok(None),
        }
    }

    /// Generate bind directive, optionally with element context for group bindings.
    fn generate_bind_directive_for_element(
        bind: &BindDirective,
        source: &str,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        let name = bind.name.as_str();

        // Skip bindings that should be omitted in SSR
        // Reference: svelte/packages/svelte/src/compiler/phases/bindings.js
        if Self::should_omit_binding_in_ssr(name) {
            return Ok(None);
        }

        // Skip bind:value on file input elements
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js
        if name == "value"
            && let Some(el) = element
        {
            // Check if this is a file input
            let is_file_input = el.attributes.iter().any(|attr| {
                if let Attribute::Attribute(node) = attr
                    && node.name.as_str() == "type"
                {
                    if let AttributeValue::Sequence(parts) = &node.value {
                        parts
                            .iter()
                            .any(|p| matches!(p, AttributeValuePart::Text(t) if t.data == "file"))
                    } else {
                        false
                    }
                } else {
                    false
                }
            });
            if is_file_input {
                return Ok(None);
            }
        }

        let expr_start = bind.expression.start().unwrap_or(0) as usize;
        let expr_end = bind.expression.end().unwrap_or(0) as usize;

        if expr_end > expr_start && expr_end <= source.len() {
            let expr = source[expr_start..expr_end].trim().to_string();

            // Handle bind:group specially - convert to checked attribute
            if name == "group" {
                return Self::generate_group_binding(element, source, &expr);
            }

            // For bind directives on server, output as $.attr() call
            // Use third true argument for boolean attributes like checked, open, etc.
            {
                use crate::compiler::phases::phase3_transform::shared::template::is_boolean_attribute;
                if is_boolean_attribute(name) {
                    Ok(Some(format!("${{$.attr('{}', {}, true)}}", name, expr)))
                } else {
                    Ok(Some(format!("${{$.attr('{}', {})}}", name, expr)))
                }
            }
        } else {
            Ok(None)
        }
    }

    /// Check if a binding should be omitted in SSR.
    /// Reference: svelte/packages/svelte/src/compiler/phases/bindings.js
    fn should_omit_binding_in_ssr(name: &str) -> bool {
        matches!(
            name,
            // bind:this
            "this"
            // media bindings
            | "currentTime"
            | "duration"
            | "paused"
            | "buffered"
            | "seekable"
            | "played"
            | "volume"
            | "muted"
            | "playbackRate"
            | "seeking"
            | "ended"
            | "readyState"
            // video specific
            | "videoHeight"
            | "videoWidth"
            // img specific
            | "naturalWidth"
            | "naturalHeight"
            // document
            | "activeElement"
            | "fullscreenElement"
            | "pointerLockElement"
            | "visibilityState"
            // window
            | "innerWidth"
            | "innerHeight"
            | "outerWidth"
            | "outerHeight"
            | "scrollX"
            | "scrollY"
            | "online"
            | "devicePixelRatio"
            // dimension bindings
            | "clientWidth"
            | "clientHeight"
            | "offsetWidth"
            | "offsetHeight"
            | "contentRect"
            | "contentBoxSize"
            | "borderBoxSize"
            | "devicePixelContentBoxSize"
            // checkbox
            | "indeterminate"
            // file input
            | "files"
        )
    }

    /// Generate bind:group as checked attribute for radio/checkbox inputs.
    fn generate_group_binding(
        element: Option<&RegularElement>,
        source: &str,
        group_expr: &str,
    ) -> Result<Option<String>, TransformError> {
        // We need the value attribute to generate the checked expression
        let value_expr = element.and_then(|el| {
            el.attributes.iter().find_map(|attr| {
                if let Attribute::Attribute(node) = attr
                    && node.name.as_str() == "value"
                {
                    match &node.value {
                        AttributeValue::Sequence(parts) => {
                            // Check if this is a single expression tag like value="{expr}"
                            let expr_parts: Vec<&AttributeValuePart> = parts
                                .iter()
                                .filter(|p| !matches!(p, AttributeValuePart::Text(t) if t.data.is_empty()))
                                .collect();
                            if expr_parts.len() == 1 {
                                match expr_parts[0] {
                                    AttributeValuePart::ExpressionTag(expr_tag) => {
                                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= source.len() {
                                            Some(source[expr_start..expr_end].trim().to_string())
                                        } else {
                                            None
                                        }
                                    }
                                    AttributeValuePart::Text(text) => {
                                        Some(format!("'{}'", text.data))
                                    }
                                }
                            } else {
                                // Static text value (multiple parts)
                                let mut text_val = String::new();
                                for part in parts {
                                    if let AttributeValuePart::Text(text) = part {
                                        text_val.push_str(&text.data);
                                    }
                                }
                                Some(format!("'{}'", text_val))
                            }
                        }
                        AttributeValue::Expression(expr_tag) => {
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= source.len() {
                                Some(source[expr_start..expr_end].trim().to_string())
                            } else {
                                None
                            }
                        }
                        AttributeValue::True(_) => Some("true".to_string()),
                    }
                } else {
                    None
                }
            })
        });

        // Check if this is a checkbox (type="checkbox")
        let is_checkbox = element
            .map(|el| {
                el.attributes.iter().any(|attr| {
                    if let Attribute::Attribute(node) = attr
                        && node.name.as_str() == "type"
                    {
                        if let AttributeValue::Sequence(parts) = &node.value {
                            parts.iter().any(|p| {
                                matches!(p, AttributeValuePart::Text(t) if t.data == "checkbox")
                            })
                        } else {
                            false
                        }
                    } else {
                        false
                    }
                })
            })
            .unwrap_or(false);

        if let Some(value) = value_expr {
            // Generate: checked={group.includes(value)} for checkbox
            // Generate: checked={group === value} for radio
            let checked_expr = if is_checkbox {
                format!("{}.includes({})", group_expr, value)
            } else {
                format!("{} === {}", group_expr, value)
            };
            Ok(Some(format!(
                "${{$.attr('checked', {}, true)}}",
                checked_expr
            )))
        } else {
            // If no value attribute, skip the binding
            Ok(None)
        }
    }

    fn generate_attribute_node(
        &mut self,
        node: &AttributeNode,
        element: Option<&RegularElement>,
    ) -> Result<Option<String>, TransformError> {
        use crate::compiler::phases::phase3_transform::shared::template::is_boolean_attribute;

        let raw_name = node.name.as_str();

        // Skip defaultValue and defaultChecked - these are not real HTML attributes
        // They are pseudo-properties used for form element initialization
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/shared/element.js L78-79
        if raw_name == "defaultValue" || raw_name == "defaultChecked" {
            return Ok(None);
        }

        // Normalize attribute name: lowercase for HTML elements, preserve case for SVG/MathML
        let is_html = element
            .map(|el| !el.metadata.svg && !el.metadata.mathml)
            .unwrap_or(true);
        let name = if is_html {
            raw_name.to_lowercase()
        } else {
            raw_name.to_string()
        };
        let name = name.as_str();

        // Helper to generate $.attr() call with optional boolean flag
        // For style attribute, use $.attr_style() instead
        let make_attr_call = |attr_name: &str, expr: &str| -> String {
            if attr_name == "style" {
                format!("${{$.attr_style({})}}", expr)
            } else if is_boolean_attribute(attr_name) {
                format!("${{$.attr('{}', {}, true)}}", attr_name, expr)
            } else {
                format!("${{$.attr('{}', {})}}", attr_name, expr)
            }
        };

        match &node.value {
            AttributeValue::True(_) => {
                // Boolean attributes like `disabled`, `checked` render without a value: ` disabled`
                // Non-boolean attributes render with empty string value: ` data-potato=""`
                if is_boolean_attribute(name) {
                    Ok(Some(format!(" {}", name)))
                } else {
                    Ok(Some(format!(" {}=\"\"", name)))
                }
            }
            AttributeValue::Sequence(parts) => {
                // Check if it's a single expression (like x='{x}')
                // In this case, treat it the same as AttributeValue::Expression
                if parts.len() == 1
                    && let AttributeValuePart::ExpressionTag(expr_tag) = &parts[0]
                {
                    // Skip event handler attributes (onclick, onmousedown, etc.)
                    if name.starts_with("on") {
                        return Ok(None);
                    }

                    // Check if the expression is a string literal - if so, inline it directly.
                    // Numeric and boolean literals use $.attr() to match official compiler.
                    if let Some(literal_value) = self.extract_literal_value(&expr_tag.expression) {
                        return Ok(Some(format!(
                            " {}=\"{}\"",
                            name,
                            escape_attr(&literal_value)
                        )));
                    }

                    // Generate $.attr() call for non-string-literal expression attributes
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        return Ok(Some(make_attr_call(name, &expr)));
                    } else {
                        return Ok(None);
                    }
                }

                // Mixed content (text + expressions) - build template string
                let mut has_expressions = false;
                let mut template_parts = Vec::new();
                let mut current_text = String::new();

                // For style attribute, use $.stringify for expressions
                let is_style_attr = name == "style";

                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            current_text.push_str(&escape_attr(&text.data));
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            has_expressions = true;
                            // Push current text as template part
                            template_parts.push(current_text.clone());
                            current_text.clear();

                            // Get the expression
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr = self.source[expr_start..expr_end].trim().to_string();
                                // All attributes with expressions need $.stringify() for proper value coercion
                                template_parts.push(format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                }
                // Push any remaining text
                if !current_text.is_empty() || template_parts.is_empty() {
                    template_parts.push(current_text);
                }

                if has_expressions {
                    let value = template_parts.join("");
                    if is_style_attr {
                        // For style attribute with expressions, use $.attr_style()
                        Ok(Some(format!("${{$.attr_style(`{}`)}}", value)))
                    } else {
                        // For other attributes with expressions, use $.attr()
                        // This ensures proper escaping and handling of special values
                        Ok(Some(format!("${{$.attr('{}', `{}`)}}", name, value)))
                    }
                } else {
                    // Pure text - no expressions
                    let value = template_parts.join("");
                    // Skip empty class attributes (matches official compiler behavior)
                    if name == "class" && value.is_empty() {
                        Ok(None)
                    } else {
                        Ok(Some(format!(" {}=\"{}\"", name, value)))
                    }
                }
            }
            AttributeValue::Expression(expr_tag) => {
                // Skip event handler attributes (onclick, onmousedown, etc.)
                if name.starts_with("on") {
                    return Ok(None);
                }

                // Check if the expression is a string literal - if so, inline it directly.
                // Numeric and boolean literals use $.attr() to match official compiler.
                if let Some(literal_value) = self.extract_literal_value(&expr_tag.expression) {
                    return Ok(Some(format!(
                        " {}=\"{}\"",
                        name,
                        escape_attr(&literal_value)
                    )));
                }

                // Generate $.attr() call for non-string-literal expression attributes
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr = self.source[expr_start..expr_end].trim().to_string();
                    Ok(Some(make_attr_call(name, &expr)))
                } else {
                    Ok(None)
                }
            }
        }
    }

    /// Generate class attribute with CSS hash appended if provided.
    fn generate_attribute_node_with_css_hash(
        &mut self,
        node: &AttributeNode,
        css_hash: Option<&str>,
    ) -> Result<Option<String>, TransformError> {
        let name = node.name.as_str();

        match &node.value {
            AttributeValue::True(_) => {
                // class with no value - just add the hash
                if let Some(hash) = css_hash {
                    Ok(Some(format!(" {}=\"{}\"", name, hash)))
                } else {
                    Ok(Some(format!(" {}", name)))
                }
            }
            AttributeValue::Sequence(parts) => {
                // Check if we have any dynamic expressions
                let has_expression = parts
                    .iter()
                    .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));

                if !has_expression {
                    // All static text - inline as string attribute
                    let mut value = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            value.push_str(&escape_attr(&text.data));
                        }
                    }
                    // Normalize whitespace for class attribute
                    let normalized: String = value.split_whitespace().collect::<Vec<_>>().join(" ");
                    // Append CSS hash
                    let final_value = if let Some(hash) = css_hash {
                        if normalized.is_empty() {
                            hash.to_string()
                        } else {
                            format!("{} {}", normalized, hash)
                        }
                    } else {
                        normalized
                    };
                    // Skip empty class attributes (class='' with no CSS hash should be omitted)
                    if final_value.is_empty() {
                        return Ok(None);
                    }
                    return Ok(Some(format!(" {}=\"{}\"", name, final_value)));
                }

                // Has dynamic expressions - need to use $.attr_class()
                // Special case: if the sequence is just whitespace + single expression + whitespace,
                // pass the expression directly to $.attr_class() without template literal wrapping
                {
                    let expr_count = parts
                        .iter()
                        .filter(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                        .count();
                    let all_text_is_whitespace = parts.iter().all(|p| match p {
                        AttributeValuePart::Text(t) => t.data.trim().is_empty(),
                        _ => true,
                    });
                    if expr_count == 1
                        && all_text_is_whitespace
                        && let Some(AttributeValuePart::ExpressionTag(expr_tag)) = parts
                            .iter()
                            .find(|p| matches!(p, AttributeValuePart::ExpressionTag(_)))
                    {
                        let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                        let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim().to_string();
                            if let Some(hash) = css_hash {
                                return Ok(Some(format!(
                                    "${{$.attr_class({}, '{}')}}",
                                    expr, hash
                                )));
                            } else {
                                return Ok(Some(format!("${{$.attr_class({})}}", expr)));
                            }
                        }
                    }
                }

                // Build template literal with $.stringify() for expressions
                let mut template_parts = Vec::new();
                let mut current_text = String::new();
                let mut is_first_part = true;

                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            // Normalize whitespace for class attributes while preserving
                            // leading/trailing spaces that separate parts
                            let trimmed: String =
                                text.data.split_whitespace().collect::<Vec<_>>().join(" ");

                            // Check if original text had leading whitespace (important for parts after expressions)
                            let has_leading_ws = text.data.starts_with(char::is_whitespace);
                            // Check if original text had trailing whitespace (important for parts before expressions)
                            let has_trailing_ws = text.data.ends_with(char::is_whitespace);

                            // Add space prefix if needed (for parts that come after expressions)
                            if has_leading_ws && !is_first_part && !current_text.is_empty() {
                                current_text.push(' ');
                            } else if has_leading_ws && !is_first_part && current_text.is_empty() {
                                // If this is right after an expression, add leading space
                                current_text.push(' ');
                            }

                            current_text.push_str(&trimmed);

                            // Add space suffix if needed (for parts before expressions)
                            if has_trailing_ws && !trimmed.is_empty() {
                                current_text.push(' ');
                            }
                        }
                        AttributeValuePart::ExpressionTag(expr_tag) => {
                            // Add accumulated text
                            template_parts.push(current_text.clone());
                            current_text.clear();

                            // Add expression wrapped in $.stringify()
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr = self.source[expr_start..expr_end].trim().to_string();
                                template_parts.push(format!("${{$.stringify({})}}", expr));
                            }
                        }
                    }
                    is_first_part = false;
                }
                // Add any remaining text
                if !current_text.is_empty() {
                    template_parts.push(current_text);
                }

                let template_content = template_parts.join("");

                // Build $.attr_class() call
                if let Some(hash) = css_hash {
                    Ok(Some(format!(
                        "${{$.attr_class(`{}`, '{}')}}",
                        template_content, hash
                    )))
                } else {
                    Ok(Some(format!("${{$.attr_class(`{}`)}}", template_content)))
                }
            }
            AttributeValue::Expression(expr_tag) => {
                // Dynamic class expression - use $.attr_class()
                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                if expr_end > expr_start && expr_end <= self.source.len() {
                    let expr = self.source[expr_start..expr_end].trim().to_string();

                    // Check if we need to wrap in $.clsx() for dynamic class expressions
                    let should_clsx = needs_clsx(&node.value);
                    let value_expr = if should_clsx {
                        format!("$.clsx({})", expr)
                    } else {
                        // Pass simple expressions directly to $.attr_class()
                        // The runtime handles coercion, no need for $.stringify()
                        expr.clone()
                    };

                    if let Some(hash) = css_hash {
                        Ok(Some(format!(
                            "${{$.attr_class({}, '{}')}}",
                            value_expr, hash
                        )))
                    } else {
                        Ok(Some(format!("${{$.attr_class({})}}", value_expr)))
                    }
                } else {
                    Ok(None)
                }
            }
        }
    }

    /// Extract a literal string or number value from an Expression.
    /// Returns Some(string_value) if the expression is a Literal, None otherwise.
    /// Extract a string literal value from an expression.
    /// Only returns string literals - numeric and boolean literals should use $.attr() calls
    /// because the official Svelte compiler uses $.attr() for non-string expression attributes.
    fn extract_literal_value(&self, expr: &crate::ast::js::Expression) -> Option<String> {
        let json = expr.as_json();
        let expr_type = json.get("type").and_then(|t| t.as_str())?;

        if expr_type == "Literal" {
            // Only inline string literals. Numeric and boolean literals should
            // use $.attr() calls to match the official compiler behavior.
            if let Some(serde_json::Value::String(s)) = json.get("value") {
                return Some(s.clone());
            }
        }

        None
    }

    /// Extract a plain text value from an attribute.
    fn extract_attribute_text_value(&self, node: &AttributeNode) -> Option<String> {
        match &node.value {
            AttributeValue::Sequence(parts) => {
                let mut value = String::new();
                for part in parts {
                    if let AttributeValuePart::Text(text) = part {
                        value.push_str(&text.data);
                    }
                }
                Some(value)
            }
            AttributeValue::True(_) => None,
            AttributeValue::Expression(_) => None,
        }
    }

    /// Generate a $.attr_class() call for class directives.
    fn generate_attr_class_call(
        &self,
        directives: &[&ClassDirective],
        base_class: Option<&str>,
    ) -> Result<String, TransformError> {
        // Build the directives object
        let mut directive_props = Vec::new();
        for dir in directives {
            // Get the expression - if it's an Identifier with the same name, use shorthand
            let expr_start = dir.expression.start().unwrap_or(0) as usize;
            let expr_end = dir.expression.end().unwrap_or(0) as usize;

            let expr_value = if expr_end > expr_start && expr_end <= self.source.len() {
                self.source[expr_start..expr_end].trim().to_string()
            } else {
                dir.name.to_string()
            };

            directive_props.push(format!("'{}': {}", dir.name, expr_value));
        }

        let directives_obj = format!("{{ {} }}", directive_props.join(", "));

        // Check if base_class is a dynamic expression (marked with __EXPR__: prefix)
        let base_arg = match base_class {
            Some(s) if s.starts_with("__EXPR__:") => {
                // Dynamic expression - use $.clsx(expr) or expr directly
                let expr = &s["__EXPR__:".len()..];
                format!("$.clsx({})", expr)
            }
            Some(s) if !s.is_empty() => {
                // Static text value - quote it
                format!("'{}'", s)
            }
            _ => {
                // No base class
                "''".to_string()
            }
        };

        // Output: ${$.attr_class(base, void 0, { 'foo': foo })}
        Ok(format!(
            "${{$.attr_class({}, void 0, {})}}",
            base_arg, directives_obj
        ))
    }

    /// Generate a $.attr_style() call for style directives.
    fn generate_attr_style_call(
        &self,
        directives: &[&StyleDirective],
        base_style: Option<&str>,
    ) -> Result<String, TransformError> {
        // Separate normal and important properties
        let mut normal_props = Vec::new();
        let mut important_props = Vec::new();

        for dir in directives {
            let value = match &dir.value {
                AttributeValue::True(_) => {
                    // Shorthand: style:color means style:color={color}
                    dir.name.to_string()
                }
                AttributeValue::Sequence(parts) => {
                    // Static text value
                    let mut text_val = String::new();
                    for part in parts {
                        if let AttributeValuePart::Text(text) = part {
                            text_val.push_str(&text.data);
                        }
                    }
                    format!("'{}'", text_val)
                }
                AttributeValue::Expression(expr_tag) => {
                    let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                    let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        self.source[expr_start..expr_end].trim().to_string()
                    } else {
                        "undefined".to_string()
                    }
                }
            };

            // CSS custom properties (--var) keep their case, others get lowercased
            let prop_name = if dir.name.starts_with("--") {
                dir.name.to_string()
            } else {
                dir.name.to_lowercase().replace("_", "-")
            };

            // Only quote property names that contain special characters like hyphens
            let prop_str = if prop_name.contains('-') {
                format!("'{}': {}", prop_name, value)
            } else {
                format!("{}: {}", prop_name, value)
            };

            // Check for !important modifier
            if dir.modifiers.iter().any(|m| m.as_str() == "important") {
                important_props.push(prop_str);
            } else {
                normal_props.push(prop_str);
            }
        }

        // Build the directives argument
        let directives_arg = if !important_props.is_empty() {
            // Array form: [{ normal }, { important }]
            format!(
                "[{{ {} }}, {{ {} }}]",
                normal_props.join(", "),
                important_props.join(", ")
            )
        } else {
            // Object form: { normal }
            format!("{{ {} }}", normal_props.join(", "))
        };

        // Output: ${$.attr_style('base', { color: 'red' })}
        let base = base_style.unwrap_or("");
        Ok(format!("${{$.attr_style('{}', {})}}", base, directives_arg))
    }

    fn generate_expression_tag(&mut self, tag: &ExpressionTag) -> Result<(), TransformError> {
        let start = tag.start as usize;
        let end = tag.end as usize;

        if start + 1 < end && end <= self.source.len() {
            let expr_source = self.source[start + 1..end - 1].trim().to_string();

            // First, try constant variable lookup and folding
            let folded = self.try_fold_with_constants(&expr_source);

            match folded {
                ConstantFoldResult::Null => {
                    // Skip null expressions entirely
                }
                ConstantFoldResult::Constant(content) => {
                    // Output constant with HTML escaping (matches official compiler's
                    // escape_html() call on evaluated values)
                    self.output_parts
                        .push(OutputPart::Html(escape_html(&content)));
                }
                ConstantFoldResult::Dynamic => {
                    // Dynamic expression - needs escaping
                    // Transform store subscriptions ($store -> $.store_get())
                    let transformed = self.transform_store_refs(&expr_source);
                    // Transform rune calls that need server-side handling
                    let transformed = Self::transform_rune_in_template_expr(&transformed);
                    self.output_parts.push(OutputPart::Expression(transformed));
                }
            }
        }

        Ok(())
    }

    /// Try to fold an expression using known constant variables.
    fn try_fold_with_constants(&self, expr: &str) -> ConstantFoldResult {
        let trimmed = expr.trim();

        // First check if it's a simple variable that we know is constant
        if let Some(value) = self.constant_vars.get(trimmed) {
            return ConstantFoldResult::Constant(value.clone());
        }

        // Handle nullish coalescing with variable lookup
        if let Some(idx) = trimmed.find("??") {
            let left = trimmed[..idx].trim();
            let right = trimmed[idx + 2..].trim();

            // Try to fold left side with constants
            match self.try_fold_with_constants(left) {
                ConstantFoldResult::Null => {
                    // Left is null, evaluate right
                    return self.try_fold_with_constants(right);
                }
                ConstantFoldResult::Constant(val) => {
                    // Left is a non-null constant, use it
                    return ConstantFoldResult::Constant(val);
                }
                ConstantFoldResult::Dynamic => {
                    // Left is dynamic, can't fold
                }
            }
        }

        // Fall back to generic constant folding
        try_constant_fold_full(trimmed)
    }

    fn generate_component_usage(&mut self, component: &Component) -> Result<(), TransformError> {
        let comp_name = component.name.to_string();

        // Check if there's any prior content (HTML, expressions, or other components)
        let has_prior_content = self.output_parts.iter().any(|part| {
            matches!(part, OutputPart::Html(s) if !s.trim().is_empty())
                || matches!(part, OutputPart::Expression(_))
                || matches!(part, OutputPart::RawExpression(_))
                || matches!(part, OutputPart::Component { .. })
                || matches!(part, OutputPart::ComponentWithBindings { .. })
        });

        // Extract props, spreads, and bindings
        // Pre-allocate based on typical attribute counts
        let attr_count = component.attributes.len();
        let mut props = Vec::with_capacity(attr_count);
        let mut spreads = Vec::with_capacity(2);
        let mut bindings = Vec::with_capacity(2);

        for attr in &component.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    match &node.value {
                        AttributeValue::Expression(expr_tag) => {
                            // Get expression from ExpressionTag's expression field
                            let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                            let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                            if expr_end > expr_start && expr_end <= self.source.len() {
                                let expr_source =
                                    self.source[expr_start..expr_end].trim().to_string();
                                // Check if it's a shorthand property (name equals expression)
                                if expr_source == name && is_valid_js_identifier(name) {
                                    props.push(name.to_string());
                                } else {
                                    props.push(format!(
                                        "{}: {}",
                                        quote_prop_name(name),
                                        expr_source
                                    ));
                                }
                            }
                        }
                        AttributeValue::Sequence(parts) => {
                            // Check for special case: sequence with only a single expression
                            // This happens when attribute is like foo='{bar}' - treat as direct expression
                            if parts.len() == 1
                                && let crate::ast::template::AttributeValuePart::ExpressionTag(
                                    expr_tag,
                                ) = &parts[0]
                            {
                                let expr_start = expr_tag.expression.start().unwrap_or(0) as usize;
                                let expr_end = expr_tag.expression.end().unwrap_or(0) as usize;
                                if expr_end > expr_start && expr_end <= self.source.len() {
                                    let expr_source =
                                        self.source[expr_start..expr_end].trim().to_string();
                                    // Check if it's a shorthand property (name equals expression)
                                    if expr_source == name && is_valid_js_identifier(name) {
                                        props.push(name.to_string());
                                    } else {
                                        props.push(format!(
                                            "{}: {}",
                                            quote_prop_name(name),
                                            expr_source
                                        ));
                                    }
                                    continue;
                                }
                            }

                            // Handle text or mixed values like name="world"
                            let mut value_str = String::new();
                            let mut has_expression = false;
                            for part in parts {
                                match part {
                                    crate::ast::template::AttributeValuePart::Text(text) => {
                                        value_str.push_str(&text.data);
                                    }
                                    crate::ast::template::AttributeValuePart::ExpressionTag(
                                        expr_tag,
                                    ) => {
                                        has_expression = true;
                                        // For mixed values with expressions, extract from source
                                        // and wrap in $.stringify() for proper string conversion
                                        let expr_start =
                                            expr_tag.expression.start().unwrap_or(0) as usize;
                                        let expr_end =
                                            expr_tag.expression.end().unwrap_or(0) as usize;
                                        if expr_end > expr_start && expr_end <= self.source.len() {
                                            value_str.push_str("${$.stringify(");
                                            value_str
                                                .push_str(self.source[expr_start..expr_end].trim());
                                            value_str.push_str(")}");
                                        }
                                    }
                                }
                            }
                            // Always add the prop (even for empty strings like foo='')
                            // Check if the value contains expressions
                            if has_expression {
                                props.push(format!("{}: `{}`", quote_prop_name(name), value_str));
                            } else {
                                // Simple string value (including empty strings)
                                props.push(format!("{}: '{}'", quote_prop_name(name), value_str));
                            }
                        }
                        AttributeValue::True(_) => {
                            // Boolean attribute (e.g., disabled)
                            props.push(format!("{}: true", quote_prop_name(name)));
                        }
                    }
                }
                Attribute::SpreadAttribute(spread) => {
                    // Get the spread expression from source
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        spreads.push(expr);
                    }
                }
                Attribute::BindDirective(bind) => {
                    let prop_name = bind.name.as_str();
                    // Skip bind:this - it doesn't require do/while pattern on server
                    if prop_name == "this" {
                        continue;
                    }
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        // Handle shorthand bindings where span might include "bind:"
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push((prop_name.to_string(), var_name));
                    }
                }
                _ => {}
            }
        }

        // Extract snippets from the component's fragment and process children
        let (children, snippets, slot_names) =
            self.generate_component_children_with_snippets(&component.fragment)?;

        // Check if the component is dynamic (could be undefined/null)
        // A component is dynamic if it's marked as such in metadata
        let is_dynamic = component.metadata.dynamic;

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props,
                spreads,
                has_prior_content,
                children,
                snippets,
                slot_names,
                dynamic: is_dynamic,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props,
                spreads,
                bindings,
                has_prior_content,
                children,
                dynamic: is_dynamic,
            });
        }

        Ok(())
    }

    /// Generate component children, extracting snippets as props.
    /// Returns (children_parts, snippets, slot_names)
    /// Snippets are tuples of (name, params, body_parts, is_true_snippet)
    /// - is_true_snippet=true means it's a SnippetBlock (needs hoisting)
    /// - is_true_snippet=false means it's a slot child (inline in $$slots with destructured params)
    #[allow(clippy::type_complexity)]
    fn generate_component_children_with_snippets(
        &mut self,
        fragment: &Fragment,
    ) -> Result<
        (
            Option<Vec<OutputPart>>,
            Vec<(String, Vec<String>, Vec<OutputPart>, bool)>,
            Vec<String>,
        ),
        TransformError,
    > {
        // Pre-allocate based on typical usage patterns
        // (name, params, body_parts, is_true_snippet)
        let mut snippets: Vec<(String, Vec<String>, Vec<OutputPart>, bool)> = Vec::with_capacity(4);
        let mut slot_names: Vec<String> = Vec::with_capacity(4);

        // Group children by slot name
        // Key: slot name, Value: (nodes, let_directive_names)
        let mut slot_children: FxHashMap<String, (Vec<&TemplateNode>, Vec<String>)> =
            FxHashMap::default();

        // Separate snippets from other children, and group by slot
        for node in &fragment.nodes {
            if let TemplateNode::SnippetBlock(snippet_block) = node {
                // Extract snippet name
                let name_start = snippet_block.expression.start().unwrap_or(0) as usize;
                let name_end = snippet_block.expression.end().unwrap_or(0) as usize;
                let snippet_name = if name_end > name_start && name_end <= self.source.len() {
                    self.source[name_start..name_end].trim().to_string()
                } else {
                    "snippet".to_string()
                };

                // Extract parameters (strip TypeScript type annotations)
                let params: Vec<String> = snippet_block
                    .parameters
                    .iter()
                    .map(|p| {
                        let start = p.start().unwrap_or(0) as usize;
                        let end = p.end().unwrap_or(0) as usize;
                        if end > start && end <= self.source.len() {
                            strip_ts_type_annotation(&self.source[start..end])
                        } else {
                            String::new()
                        }
                    })
                    .filter(|s| !s.is_empty())
                    .collect();

                // Generate snippet body
                let body_parts = self.generate_snippet_body(&snippet_block.body)?;

                // Add to slot names
                let slot_name = if snippet_name == "children" {
                    "default".to_string()
                } else {
                    snippet_name.clone()
                };
                slot_names.push(slot_name);

                snippets.push((snippet_name, params, body_parts, true)); // true = is_true_snippet
            } else {
                // Get the slot name and let directives from the node's attributes
                let slot_name = get_slot_name(node);
                let let_directives = get_let_directives(node);
                let entry = slot_children.entry(slot_name).or_default();
                entry.0.push(node);
                // Merge let directives (usually there's one element with let directives per slot)
                for let_dir in let_directives {
                    if !entry.1.contains(&let_dir) {
                        entry.1.push(let_dir);
                    }
                }
            }
        }

        // Process default slot children
        let children = if let Some((default_nodes, _let_dirs)) = slot_children.remove("default") {
            self.generate_children_from_nodes(&default_nodes)?
        } else {
            None
        };

        // Process named slot children (non-default) as snippets with let directive params
        for (slot_name, (nodes, let_dirs)) in slot_children {
            // Generate children content for this named slot
            if let Some(slot_parts) = self.generate_children_from_nodes(&nodes)? {
                // Add as a snippet with the slot name and let directive names as params
                slot_names.push(slot_name.clone());
                snippets.push((slot_name, let_dirs, slot_parts, false)); // false = not a true snippet
            }
        }

        Ok((children, snippets, slot_names))
    }

    /// Generate snippet body parts
    fn generate_snippet_body(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Collect non-empty nodes
        let body_nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if first node is text or expression tag - if so, we need hydration marker
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/utils.js clean_nodes()
        // This prevents text from being fused with its surroundings during hydration
        let first_node = body_nodes.get(start_idx);
        let is_text_first = matches!(
            first_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        // Add hydration marker if first content is text
        if is_text_first {
            body_generator
                .output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        // Generate body content
        for (i, node) in body_nodes
            .iter()
            .enumerate()
            .skip(start_idx)
            .take(end_idx - start_idx)
        {
            if i == start_idx {
                // First node - if it's text, trim leading whitespace but preserve trailing space
                // if there is a following node (the space separates text from expression/element)
                if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim_start();
                    // Check if there's a next node - preserve trailing space if so
                    let next_node = body_nodes.get(i + 1);
                    let needs_trailing_space = next_node.is_some()
                        && text.data.chars().last().is_some_and(|c| c.is_whitespace());

                    let trimmed_end = trimmed.trim_end();
                    if !trimmed_end.is_empty() {
                        let mut content = escape_html(trimmed_end);
                        if needs_trailing_space {
                            content.push(' ');
                        }
                        body_generator.output_parts.push(OutputPart::Html(content));
                    }
                    continue;
                }
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }

    /// Generate children from a list of nodes (excluding snippets)
    fn generate_children_from_nodes(
        &mut self,
        nodes: &[&TemplateNode],
    ) -> Result<Option<Vec<OutputPart>>, TransformError> {
        let len = nodes.len();

        if len == 0 {
            return Ok(None);
        }

        // Find first and last meaningful content
        let mut start_idx = 0;
        let mut end_idx = len;

        while start_idx < len {
            if let TemplateNode::Text(text) = nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        while end_idx > start_idx {
            if let TemplateNode::Text(text) = nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if there's any meaningful content
        if start_idx >= end_idx {
            return Ok(None);
        }

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Check if first meaningful content is text/expression
        // If so, add <!---> anchor to prevent text fusion during hydration
        let first_content = nodes.get(start_idx);
        let needs_anchor = matches!(
            first_content,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        if needs_anchor {
            body_generator.output_parts.push(OutputPart::Comment);
        }

        let nodes_to_process: Vec<_> = nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .collect();
        let num_nodes = nodes_to_process.len();

        for (i, node) in nodes_to_process.iter().enumerate() {
            let is_first = i == 0;
            let is_last = i == num_nodes - 1;

            // For text nodes, normalize whitespace
            if let TemplateNode::Text(text) = node {
                let mut normalized = text.data.to_string();

                // Trim leading whitespace from first node
                if is_first {
                    normalized = normalized.trim_start().to_string();
                }

                // Trim trailing whitespace from last node
                if is_last {
                    normalized = normalized.trim_end().to_string();
                }

                if !normalized.is_empty() {
                    body_generator
                        .output_parts
                        .push(OutputPart::Html(escape_html(&normalized)));
                }
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(Some(body_generator.output_parts))
    }

    fn generate_if_block(&mut self, block: &IfBlock) -> Result<(), TransformError> {
        // Get the test expression from the source
        let start = block.test.start().unwrap_or(0) as usize;
        let end = block.test.end().unwrap_or(0) as usize;
        let test_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "false".to_string()
        };

        // Transform store subscriptions ($store -> $.store_get())
        let test_expr = self.transform_store_refs(&test_expr);

        // Generate consequent body parts
        let consequent_body = self.generate_if_branch_body(&block.consequent)?;

        // Generate alternate body parts if present
        let alternate_body = if let Some(ref alternate) = block.alternate {
            Some(self.generate_if_branch_body(alternate)?)
        } else {
            None
        };

        self.output_parts.push(OutputPart::IfBlock {
            test_expr,
            consequent_body,
            alternate_body,
        });

        Ok(())
    }

    /// Generate body parts for an if/else branch, handling nested IfBlocks for else-if chains.
    fn generate_if_branch_body(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        // Check if this fragment contains only a single IfBlock (else-if case)
        let nodes: Vec<_> = fragment.nodes.iter().collect();

        // Filter out whitespace-only text nodes
        let meaningful_nodes: Vec<_> = nodes
            .iter()
            .filter(|n| {
                if let TemplateNode::Text(text) = n {
                    !text.data.trim().is_empty()
                } else {
                    true
                }
            })
            .collect();

        // If there's exactly one node and it's an IfBlock, this is an else-if chain
        if meaningful_nodes.len() == 1
            && let TemplateNode::IfBlock(nested_if) = meaningful_nodes[0]
        {
            // For else-if, we return a nested IfBlock OutputPart directly
            let nested_test_start = nested_if.test.start().unwrap_or(0) as usize;
            let nested_test_end = nested_if.test.end().unwrap_or(0) as usize;
            let nested_test_expr =
                if nested_test_end > nested_test_start && nested_test_end <= self.source.len() {
                    self.source[nested_test_start..nested_test_end]
                        .trim()
                        .to_string()
                } else {
                    "false".to_string()
                };

            let nested_consequent = self.generate_if_branch_body(&nested_if.consequent)?;
            let nested_alternate = if let Some(ref alt) = nested_if.alternate {
                Some(self.generate_if_branch_body(alt)?)
            } else {
                None
            };

            return Ok(vec![OutputPart::IfBlock {
                test_expr: nested_test_expr,
                consequent_body: nested_consequent,
                alternate_body: nested_alternate,
            }]);
        }

        // Standard case: generate body parts for the branch
        let len = nodes.len();
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace and comments (comments don't produce output)
        while start_idx < len {
            match nodes[start_idx] {
                TemplateNode::Text(text) if text.data.trim().is_empty() => {
                    start_idx += 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    start_idx += 1;
                    continue;
                }
                _ => break,
            }
        }

        // Skip trailing whitespace and comments
        while end_idx > start_idx {
            match nodes[end_idx - 1] {
                TemplateNode::Text(text) if text.data.trim().is_empty() => {
                    end_idx -= 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    end_idx -= 1;
                    continue;
                }
                _ => break,
            }
        }

        // Collect trimmed nodes (owned) - nodes is Vec<&TemplateNode> so we need to clone
        let mut trimmed_nodes: Vec<TemplateNode> = nodes
            .iter()
            .take(end_idx)
            .skip(start_idx)
            .map(|n| (*n).clone())
            .collect();

        // Trim leading whitespace from first text node and trailing whitespace from last text node
        // This handles cases like `{#if cond}\nmid\n{/if}` which should output `mid` not ` mid `
        if !trimmed_nodes.is_empty() {
            // Find the first text node (may be after ConstTag or other non-output nodes)
            for node in trimmed_nodes.iter_mut() {
                if let TemplateNode::Text(text) = node {
                    let trimmed_data = text.data.trim_start().to_string();
                    text.data = trimmed_data.into();
                    break;
                }
                // Skip non-output nodes like ConstTag
                if !matches!(node, TemplateNode::ConstTag(_)) {
                    break;
                }
            }
            // Find the last text node (may be before trailing non-output nodes)
            for node in trimmed_nodes.iter_mut().rev() {
                if let TemplateNode::Text(text) = node {
                    let trimmed_data = text.data.trim_end().to_string();
                    text.data = trimmed_data.into();
                    break;
                }
                if !matches!(node, TemplateNode::ConstTag(_)) {
                    break;
                }
            }
        }

        // Check if this fragment is standalone (only contains a single RenderTag/Component)
        let is_standalone = Self::is_standalone_fragment(&trimmed_nodes);

        // Generate body parts with the appropriate skip_hydration_boundaries flag
        let mut body_generator = self.new_child_generator(is_standalone);

        for node in &trimmed_nodes {
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }

    fn generate_each_block(&mut self, block: &EachBlock) -> Result<(), TransformError> {
        // Get the iterable expression from the parser
        let start = block.expression.start().unwrap_or(0) as usize;
        let end = block.expression.end().unwrap_or(0) as usize;
        let iterable = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "[]".to_string()
        };

        // Transform store subscriptions ($store -> $.store_get())
        let iterable = self.transform_store_refs(&iterable);

        // Get the context variable name (None if no "as" clause)
        let context_name = if let Some(ref context) = block.context {
            let ctx_start = context.start().unwrap_or(0) as usize;
            let ctx_end = context.end().unwrap_or(0) as usize;
            if ctx_end > ctx_start && ctx_end <= self.source.len() {
                Some(self.source[ctx_start..ctx_end].trim().to_string())
            } else {
                None
            }
        } else {
            None
        };

        // Get optional index name from the parser
        let index_name = block.index.as_ref().map(|idx| idx.to_string());

        // Filter body nodes - skip leading/trailing whitespace
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Determine indices to process (skip leading/trailing whitespace)
        let mut start_idx = 0;
        let mut end_idx = len;

        // Skip leading whitespace
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Skip trailing whitespace
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Collect trimmed body nodes (owned)
        let mut trimmed_body_nodes: Vec<TemplateNode> = body_nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .copied()
            .cloned()
            .collect();

        // Trim leading whitespace from first text node and trailing whitespace from last text node
        // This handles cases like `{#each items as item}\ncontent\n{/each}`
        if !trimmed_body_nodes.is_empty() {
            // Trim leading whitespace from first text node
            if let TemplateNode::Text(ref mut text) = trimmed_body_nodes[0] {
                let trimmed_data = text.data.trim_start().to_string();
                text.data = trimmed_data.into();
            }
            // Trim trailing whitespace from last text node
            let last_idx = trimmed_body_nodes.len() - 1;
            if let TemplateNode::Text(ref mut text) = trimmed_body_nodes[last_idx] {
                let trimmed_data = text.data.trim_end().to_string();
                text.data = trimmed_data.into();
            }
        }

        // Check if this fragment is standalone (only contains a single RenderTag/Component)
        let is_standalone = Self::is_standalone_fragment(&trimmed_body_nodes);

        // Generate body parts with the appropriate skip_hydration_boundaries flag
        let mut body_generator = self.new_child_generator(is_standalone);

        // Check if first node is text or expression - if so, add comment marker
        // This prevents text from being fused with surroundings (hydration marker)
        if start_idx < end_idx {
            if let TemplateNode::ExpressionTag(_) = body_nodes[start_idx] {
                body_generator.output_parts.push(OutputPart::Comment);
            } else if let TemplateNode::Text(text) = body_nodes[start_idx] {
                // Only add comment if text has non-whitespace content after trimming
                if !text.data.trim().is_empty() {
                    body_generator.output_parts.push(OutputPart::Comment);
                }
            }
        }

        // Track if previous node was a ConstTag to skip whitespace after it
        let mut prev_was_const = false;
        let nodes_to_process: Vec<_> = body_nodes
            .iter()
            .skip(start_idx)
            .take(end_idx - start_idx)
            .collect();
        let num_nodes = nodes_to_process.len();

        for (i, node) in nodes_to_process.into_iter().enumerate() {
            // Skip whitespace-only text after ConstTag
            if prev_was_const
                && let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                prev_was_const = false;
                continue;
            }
            prev_was_const = matches!(node, TemplateNode::ConstTag(_));

            // Special handling for first/last text nodes to trim whitespace
            if let TemplateNode::Text(text) = node {
                let mut data = text.data.to_string();
                // Trim leading whitespace from first text node
                if i == 0 {
                    data = data.trim_start().to_string();
                }
                // Trim trailing whitespace from last text node
                if i == num_nodes - 1 {
                    data = data.trim_end().to_string();
                }
                // Output the trimmed text
                if !data.is_empty() {
                    body_generator
                        .output_parts
                        .push(OutputPart::Html(escape_html(&data)));
                }
            } else {
                body_generator.generate_node(node, false)?;
            }
        }

        // Generate fallback content if there's an {:else} clause
        let fallback = if let Some(ref fallback_fragment) = block.fallback {
            let mut fallback_generator = ServerCodeGenerator::new(
                self.component_name.clone(),
                self.source.clone(),
                None,
                None,
                None,
                self.use_async,
            );
            fallback_generator.constant_vars = self.constant_vars.clone();
            // Trim leading/trailing whitespace from fallback fragment nodes
            let mut fallback_nodes: Vec<TemplateNode> = fallback_fragment.nodes.to_vec();
            // Skip leading whitespace-only text nodes
            let start = fallback_nodes
                .iter()
                .position(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
                .unwrap_or(fallback_nodes.len());
            // Skip trailing whitespace-only text nodes
            let end = fallback_nodes
                .iter()
                .rposition(|n| !matches!(n, TemplateNode::Text(t) if t.data.trim().is_empty()))
                .map(|i| i + 1)
                .unwrap_or(0);
            fallback_nodes = fallback_nodes[start..end].to_vec();
            // Trim leading whitespace from first text node
            if let Some(TemplateNode::Text(text)) = fallback_nodes.first_mut() {
                let trimmed = text.data.trim_start().to_string();
                text.data = trimmed.into();
            }
            // Trim trailing whitespace from last text node
            if let Some(TemplateNode::Text(text)) = fallback_nodes.last_mut() {
                let trimmed = text.data.trim_end().to_string();
                text.data = trimmed.into();
            }
            // Add comment marker before fallback if first node is text or expression
            // This matches the behavior of the main each body
            if let Some(first_node) = fallback_nodes.first() {
                match first_node {
                    TemplateNode::Text(text) if !text.data.trim().is_empty() => {
                        fallback_generator.output_parts.push(OutputPart::Comment);
                    }
                    TemplateNode::ExpressionTag(_) => {
                        fallback_generator.output_parts.push(OutputPart::Comment);
                    }
                    _ => {}
                }
            }
            for node in &fallback_nodes {
                fallback_generator.generate_node(node, false)?;
            }
            Some(fallback_generator.output_parts)
        } else {
            None
        };

        self.output_parts.push(OutputPart::EachBlock {
            iterable,
            context_name,
            index_name,
            body: body_generator.output_parts,
            fallback,
        });

        Ok(())
    }

    fn generate_await_block(&mut self, block: &AwaitBlock) -> Result<(), TransformError> {
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

    fn generate_key_block(&mut self, block: &KeyBlock) -> Result<(), TransformError> {
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

    fn generate_const_tag(&mut self, tag: &ConstTag) -> Result<(), TransformError> {
        // Get the declaration from the source
        let start = tag.declaration.start().unwrap_or(0) as usize;
        let end = tag.declaration.end().unwrap_or(0) as usize;
        if end > start && end <= self.source.len() {
            let declaration_source = self.source[start..end].trim().to_string();
            self.output_parts
                .push(OutputPart::ConstDeclaration(declaration_source));
        }
        Ok(())
    }

    fn generate_snippet_block(&mut self, block: &SnippetBlock) -> Result<(), TransformError> {
        // Extract snippet name from expression
        let name_start = block.expression.start().unwrap_or(0) as usize;
        let name_end = block.expression.end().unwrap_or(0) as usize;
        let name = if name_end > name_start && name_end <= self.source.len() {
            self.source[name_start..name_end].trim().to_string()
        } else {
            "snippet".to_string()
        };

        // Extract parameters (strip TypeScript type annotations)
        let params: Vec<String> = block
            .parameters
            .iter()
            .map(|p| {
                let start = p.start().unwrap_or(0) as usize;
                let end = p.end().unwrap_or(0) as usize;
                if end > start && end <= self.source.len() {
                    strip_ts_type_annotation(&self.source[start..end])
                } else {
                    String::new()
                }
            })
            .filter(|s| !s.is_empty())
            .collect();

        // Generate body parts
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            None,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Collect non-empty nodes
        let body_nodes: Vec<_> = block.body.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Compute standalone-ness for the trimmed fragment
        let is_standalone = Self::is_standalone_fragment(
            &body_nodes[start_idx..end_idx]
                .iter()
                .map(|n| (*n).clone())
                .collect::<Vec<_>>(),
        );
        body_generator.skip_hydration_boundaries = is_standalone;

        // Check if first node is text or expression tag - if so, we need hydration marker
        // Reference: svelte/packages/svelte/src/compiler/phases/3-transform/utils.js clean_nodes()
        // This prevents text from being fused with its surroundings during hydration
        if !is_standalone {
            let first_node = body_nodes.get(start_idx);
            let is_text_first = matches!(
                first_node,
                Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
            );

            // Add hydration marker if first content is text
            if is_text_first {
                body_generator
                    .output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }
        }

        // Generate body content, trimming whitespace properly
        // Track previous non-output nodes (like ConstTag) to skip whitespace after them
        let mut prev_was_const_tag = false;
        for (i, node) in body_nodes
            .iter()
            .enumerate()
            .skip(start_idx)
            .take(end_idx - start_idx)
        {
            if i == start_idx {
                // First node - if it's text, trim leading whitespace but preserve trailing space
                // if there is a following node (the space separates text from expression/element)
                if let TemplateNode::Text(text) = node {
                    let trimmed = text.data.trim_start();
                    // Check if there's a next node - preserve trailing space if so
                    let next_node = body_nodes.get(i + 1);
                    let needs_trailing_space = next_node.is_some()
                        && text.data.chars().last().is_some_and(|c| c.is_whitespace());

                    let trimmed_end = trimmed.trim_end();
                    if !trimmed_end.is_empty() {
                        let mut content = escape_html(trimmed_end);
                        if needs_trailing_space {
                            content.push(' ');
                        }
                        body_generator.output_parts.push(OutputPart::Html(content));
                    }
                    prev_was_const_tag = false;
                    continue;
                }
            }

            // Skip whitespace-only text nodes after ConstTag
            if prev_was_const_tag
                && let TemplateNode::Text(text) = node
                && text.data.trim().is_empty()
            {
                continue;
            }

            // Track if current node is a ConstTag
            prev_was_const_tag = matches!(node, TemplateNode::ConstTag(_));

            body_generator.generate_node(node, false)?;
        }

        // Determine if the snippet can be hoisted to module level
        // Use metadata.can_hoist from the analyze phase
        let can_hoist = block.metadata.can_hoist;

        // Store the snippet definition
        self.snippets.push(SnippetDef {
            name,
            params,
            body_parts: body_generator.output_parts,
            can_hoist,
        });

        Ok(())
    }

    fn generate_render_tag(&mut self, tag: &RenderTag) -> Result<(), TransformError> {
        use serde_json::Value;

        // Get the expression JSON
        let expr_json = tag.expression.as_json();
        let expr_type = expr_json
            .get("type")
            .and_then(|t: &Value| t.as_str())
            .unwrap_or("");

        let is_optional = expr_type == "ChainExpression";

        // Get the inner call for ChainExpression - clone to avoid lifetime issues
        let call_json: Value = if is_optional {
            match expr_json.get("expression") {
                Some(v) => v.clone(),
                None => return Ok(()),
            }
        } else {
            expr_json.clone()
        };

        let call_type = call_json
            .get("type")
            .and_then(|t: &Value| t.as_str())
            .unwrap_or("");
        if call_type != "CallExpression" {
            return Ok(());
        }

        // Get callee position
        let callee = match call_json.get("callee") {
            Some(c) => c,
            None => return Ok(()),
        };

        let c_start = callee
            .get("start")
            .and_then(|s: &Value| s.as_u64())
            .unwrap_or(0) as usize;
        let c_end = callee
            .get("end")
            .and_then(|s: &Value| s.as_u64())
            .unwrap_or(0) as usize;

        if c_end <= c_start || c_end > self.source.len() {
            return Ok(());
        }

        let callee_str = self.source[c_start..c_end].trim().to_string();

        // Get arguments
        let mut arg_strs = Vec::new();
        if let Some(args) = call_json
            .get("arguments")
            .and_then(|a: &Value| a.as_array())
        {
            for arg in args {
                let a_start = arg
                    .get("start")
                    .and_then(|s: &Value| s.as_u64())
                    .unwrap_or(0) as usize;
                let a_end = arg.get("end").and_then(|s: &Value| s.as_u64()).unwrap_or(0) as usize;
                if a_end > a_start && a_end <= self.source.len() {
                    arg_strs.push(self.source[a_start..a_end].trim().to_string());
                }
            }
        }

        // Build the call: snippet($$renderer, ...args) or snippet?.($$renderer, ...args)
        let call_str = if is_optional {
            if arg_strs.is_empty() {
                format!("{}?.($$renderer)", callee_str)
            } else {
                format!("{}?.($$renderer, {})", callee_str, arg_strs.join(", "))
            }
        } else if arg_strs.is_empty() {
            format!("{}($$renderer)", callee_str)
        } else {
            format!("{}($$renderer, {})", callee_str, arg_strs.join(", "))
        };

        // Add the render call
        self.output_parts.push(OutputPart::RenderCall {
            call_str,
            skip_boundary: self.skip_hydration_boundaries,
        });

        Ok(())
    }

    fn generate_html_tag(&mut self, tag: &HtmlTag) -> Result<(), TransformError> {
        // Get the expression from HtmlTag
        let start = tag.expression.start().unwrap_or(0) as usize;
        let end = tag.expression.end().unwrap_or(0) as usize;

        if end > start && end <= self.source.len() {
            let expr = self.source[start..end].trim().to_string();
            self.output_parts.push(OutputPart::HtmlExpression(expr));
        } else {
            self.output_parts.push(OutputPart::Comment);
        }
        Ok(())
    }

    fn generate_svelte_component(
        &mut self,
        elem: &SvelteComponentElement,
    ) -> Result<(), TransformError> {
        // Extract the component expression from `this={expr}`
        let start = elem.expression.start().unwrap_or(0) as usize;
        let end = elem.expression.end().unwrap_or(0) as usize;

        let component_expr = if end > start && end <= self.source.len() {
            let raw = self.source[start..end].trim().to_string();
            let expr = self.transform_store_refs(&raw);
            // Wrap in parens so that optional chaining `?.()` applies to the
            // whole expression (e.g. `(x ? Foo : Bar)?.(...)`) instead of only
            // the last operand.  Simple identifiers like `null` or `Foo` get
            // the extra parens stripped by OXC, so this is safe.
            format!("({})", expr)
        } else {
            "null".to_string()
        };

        // Build props and bindings from attributes (same approach as component_usage)
        let mut props = Vec::new();
        let mut spreads = Vec::new();
        let mut bindings: Vec<(String, String)> = Vec::new();
        for attr in &elem.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    if attr_name.starts_with("on") {
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    props.push(format!("{}: {}", quote_prop_name(attr_name), value));
                }
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        spreads.push(expr);
                    }
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        // Handle shorthand bindings where span might include "bind:"
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push((bind_name.to_string(), var_name));
                    }
                }
                _ => {}
            }
        }

        // Extract snippets from the component's fragment and process children
        let (children, snippets, slot_names) =
            self.generate_component_children_with_snippets(&elem.fragment)?;

        // Use ComponentWithBindings if there are any bind directives
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: component_expr,
                props,
                spreads,
                has_prior_content: true,
                children,
                snippets,
                slot_names,
                dynamic: true,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: component_expr,
                props,
                spreads,
                bindings,
                has_prior_content: true,
                children,
                dynamic: true,
            });
        }

        Ok(())
    }

    fn generate_svelte_self(&mut self, elem: &SvelteElement) -> Result<(), TransformError> {
        // <svelte:self> renders as a call to the component function itself
        let comp_name = self.component_name.to_string();

        // Build props and bindings from attributes (same as svelte:component)
        let mut props = Vec::new();
        let mut spreads = Vec::new();
        let mut bindings: Vec<(String, String)> = Vec::new();
        for attr in &elem.attributes {
            match attr {
                Attribute::Attribute(node) => {
                    let attr_name = node.name.as_str();
                    if attr_name.starts_with("on") {
                        continue;
                    }
                    let value = self.extract_attribute_value_as_string(node)?;
                    props.push(format!("{}: {}", quote_prop_name(attr_name), value));
                }
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        spreads.push(expr);
                    }
                }
                Attribute::BindDirective(bind) => {
                    let bind_name = bind.name.as_str();
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let mut var_name = self.source[expr_start..expr_end].trim().to_string();
                        if let Some(stripped) = var_name.strip_prefix("bind:") {
                            var_name = stripped.to_string();
                        }
                        bindings.push((bind_name.to_string(), var_name));
                    }
                }
                _ => {}
            }
        }

        // Extract children from the fragment
        let (children, snippets, slot_names) =
            self.generate_component_children_with_snippets(&elem.fragment)?;

        // svelte:self is NOT dynamic (it always refers to the current component)
        if bindings.is_empty() {
            self.output_parts.push(OutputPart::Component {
                name: comp_name,
                props,
                spreads,
                has_prior_content: true,
                children,
                snippets,
                slot_names,
                dynamic: false,
            });
        } else {
            self.output_parts.push(OutputPart::ComponentWithBindings {
                name: comp_name,
                props,
                spreads,
                bindings,
                has_prior_content: true,
                children,
                dynamic: false,
            });
        }

        Ok(())
    }

    fn generate_svelte_element(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<(), TransformError> {
        // Extract the tag expression from the source
        let start = elem.tag.start().unwrap_or(0) as usize;
        let end = elem.tag.end().unwrap_or(0) as usize;

        let tag_expr = if end > start && end <= self.source.len() {
            self.source[start..end].trim().to_string()
        } else {
            "null".to_string()
        };

        // Generate attributes expression if there are any
        let attrs_expr = self.generate_svelte_element_attrs_expr(elem)?;

        // Generate body content from fragment
        // Use skip_anchor=true because svelte:element children are in a callback
        // and don't need an anchor to prevent text fusion
        let body = self.generate_fragment_body_parts_inner(&elem.fragment, true)?;

        self.output_parts.push(OutputPart::SvelteElement {
            tag_expr,
            attrs_expr,
            body,
        });
        Ok(())
    }

    /// Generate attributes expression for svelte:element.
    fn generate_svelte_element_attrs_expr(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<Option<String>, TransformError> {
        // Check if we have any attributes that need to be output
        let has_relevant_attrs = elem.attributes.iter().any(|attr| {
            match attr {
                Attribute::Attribute(_) => true,
                Attribute::SpreadAttribute(_) => true,
                Attribute::ClassDirective(_) => true,
                Attribute::StyleDirective(_) => true,
                Attribute::BindDirective(bind) => bind.name != "this",
                _ => false, // Skip event handlers, use directives, etc.
            }
        });

        if !has_relevant_attrs {
            return Ok(None);
        }

        // Check if we have spread attributes
        let has_spread = elem
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        if has_spread {
            // Use $.attributes() for spread attributes
            let attrs_call = self.build_svelte_element_spread_attributes(elem)?;
            if !attrs_call.is_empty() {
                Ok(Some(attrs_call))
            } else {
                Ok(None)
            }
        } else {
            // Build a simple object for non-spread attributes
            let mut object_parts: Vec<String> = Vec::new();

            for attr in &elem.attributes {
                match attr {
                    Attribute::Attribute(node) => {
                        let name = node.name.as_str();
                        let value = self.extract_attribute_value_as_string(node)?;
                        let quoted_name = quote_prop_name(name);
                        object_parts.push(format!("{}: {}", quoted_name, value));
                    }
                    Attribute::BindDirective(bind) => {
                        if bind.name == "this" {
                            continue;
                        }
                        let name = bind.name.as_str();
                        let expr_start = bind.expression.start().unwrap_or(0) as usize;
                        let expr_end = bind.expression.end().unwrap_or(0) as usize;
                        if expr_end > expr_start && expr_end <= self.source.len() {
                            let expr = self.source[expr_start..expr_end].trim().to_string();
                            let quoted_name = quote_prop_name(name);
                            object_parts.push(format!("{}: {}", quoted_name, expr));
                        }
                    }
                    _ => {}
                }
            }

            if object_parts.is_empty() {
                Ok(None)
            } else {
                Ok(Some(format!("{{ {} }}", object_parts.join(", "))))
            }
        }
    }

    /// Generate attributes for svelte:element.
    /// This handles spread attributes, class/style directives, and regular attributes.
    #[allow(dead_code)]
    fn generate_svelte_element_attributes(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut parts = Vec::new();

        // Check if we have spread attributes
        let has_spread = elem
            .attributes
            .iter()
            .any(|attr| matches!(attr, Attribute::SpreadAttribute(_)));

        if has_spread {
            // Use $.attributes() for spread attributes
            let attributes_call = self.build_svelte_element_spread_attributes(elem)?;
            if !attributes_call.is_empty() {
                parts.push(OutputPart::Html(attributes_call));
            }
        } else {
            // Generate inline attributes
            for attr in &elem.attributes {
                if let Some(attr_str) = self.generate_attribute_for_element(attr, None)? {
                    parts.push(OutputPart::Html(attr_str));
                }
            }
        }

        Ok(parts)
    }

    /// Build $.attributes() call for svelte:element with spread.
    #[allow(dead_code)]
    fn build_svelte_element_spread_attributes(
        &mut self,
        elem: &SvelteDynamicElement,
    ) -> Result<String, TransformError> {
        let mut object_parts: Vec<String> = Vec::new();

        for attr in &elem.attributes {
            match attr {
                Attribute::SpreadAttribute(spread) => {
                    let expr_start = spread.expression.start().unwrap_or(0) as usize;
                    let expr_end = spread.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        object_parts.push(format!("...{}", expr));
                    }
                }
                Attribute::Attribute(node) => {
                    let name = node.name.as_str();
                    let value = self.extract_attribute_value_as_string(node)?;
                    let quoted_name = quote_prop_name(name);
                    object_parts.push(format!("{}: {}", quoted_name, value));
                }
                Attribute::BindDirective(bind) => {
                    let name = bind.name.as_str();
                    let expr_start = bind.expression.start().unwrap_or(0) as usize;
                    let expr_end = bind.expression.end().unwrap_or(0) as usize;
                    if expr_end > expr_start && expr_end <= self.source.len() {
                        let expr = self.source[expr_start..expr_end].trim().to_string();
                        let quoted_name = quote_prop_name(name);
                        object_parts.push(format!("{}: {}", quoted_name, expr));
                    }
                }
                _ => {}
            }
        }

        if object_parts.is_empty() {
            return Ok(String::new());
        }

        // Build: $.attributes({ ... }, void 0, void 0, void 0, 4)
        // The 4 is a flag for dynamic elements
        Ok(format!(
            "${{$.attributes({{ {} }}, void 0, void 0, void 0, 4)}}",
            object_parts.join(", ")
        ))
    }

    fn generate_svelte_boundary(&mut self, boundary: &SvelteElement) -> Result<(), TransformError> {
        // Look for pending attribute or pending snippet
        let pending_attribute = boundary
            .attributes
            .iter()
            .find(|attr| matches!(attr, Attribute::Attribute(a) if a.name == "pending"));

        let pending_snippet = boundary.fragment.nodes.iter().find_map(|node| {
            if let TemplateNode::SnippetBlock(snippet) = node {
                // Check if the snippet expression is named "pending"
                let json = snippet.expression.as_json();
                if json.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                    && json.get("name").and_then(|n| n.as_str()) == Some("pending")
                {
                    return Some(snippet);
                }
            }
            None
        });

        // Generate body based on whether we have a pending snippet or attribute
        // Filter out `failed` and `pending` snippets from the fragment when generating body
        let (mut body, is_pending) = if let Some(snippet) = pending_snippet {
            // Generate body from the pending snippet - this is the pending state
            // When in pending state, the `failed` snippet is NOT included
            (self.generate_fragment_body_parts(&snippet.body)?, true)
        } else if pending_attribute.is_some() {
            // For pending attribute, we would need to call the attribute value as a function
            // For now, just generate empty body (the attribute case is less common)
            (Vec::new(), true)
        } else {
            // No pending - generate the main fragment content excluding named snippets
            // Create a filtered fragment that excludes pending/failed snippets
            let filtered_nodes: Vec<TemplateNode> = boundary
                .fragment
                .nodes
                .iter()
                .filter(|node| {
                    if let TemplateNode::SnippetBlock(snippet) = node {
                        let json = snippet.expression.as_json();
                        let name = json.get("name").and_then(|n| n.as_str()).unwrap_or("");
                        // Keep everything except `failed` and `pending` snippets
                        name != "failed" && name != "pending"
                    } else {
                        true
                    }
                })
                .cloned()
                .collect();

            let filtered_fragment = Fragment {
                nodes: filtered_nodes,
                ..boundary.fragment.clone()
            };

            (
                self.generate_fragment_body_parts(&filtered_fragment)?,
                false,
            )
        };

        // Only include the `failed` snippet when NOT in pending state
        // (in pending state, the boundary renders the pending content, not the main content)
        if !is_pending {
            // Look for `failed` snippet in the boundary fragment
            let failed_snippet = boundary.fragment.nodes.iter().find_map(|node| {
                if let TemplateNode::SnippetBlock(snippet) = node {
                    let json = snippet.expression.as_json();
                    if json.get("type").and_then(|t| t.as_str()) == Some("Identifier")
                        && json.get("name").and_then(|n| n.as_str()) == Some("failed")
                    {
                        return Some(snippet);
                    }
                }
                None
            });

            if let Some(failed) = failed_snippet {
                // Extract parameters (strip TypeScript type annotations)
                let params: Vec<String> = failed
                    .parameters
                    .iter()
                    .map(|p| {
                        let start = p.start().unwrap_or(0) as usize;
                        let end = p.end().unwrap_or(0) as usize;
                        if end > start && end <= self.source.len() {
                            strip_ts_type_annotation(&self.source[start..end])
                        } else {
                            String::new()
                        }
                    })
                    .filter(|s| !s.is_empty())
                    .collect();

                // Generate body parts for the failed snippet
                let body_parts = self.generate_snippet_body_parts(&failed.body)?;

                // Insert the `failed` snippet function at the beginning of the body
                body.insert(
                    0,
                    OutputPart::SnippetFunction {
                        name: "failed".to_string(),
                        params,
                        body: body_parts,
                    },
                );
            }
        }

        self.output_parts
            .push(OutputPart::SvelteBoundary { body, is_pending });
        Ok(())
    }

    /// Generate body parts for a snippet body (used for inline snippet functions like `failed`)
    fn generate_snippet_body_parts(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Collect non-empty nodes
        let body_nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = body_nodes.len();

        // Find first non-whitespace node
        let mut start_idx = 0;
        while start_idx < len {
            if let TemplateNode::Text(text) = body_nodes[start_idx]
                && text.data.trim().is_empty()
            {
                start_idx += 1;
                continue;
            }
            break;
        }

        // Find last non-whitespace node
        let mut end_idx = len;
        while end_idx > start_idx {
            if let TemplateNode::Text(text) = body_nodes[end_idx - 1]
                && text.data.trim().is_empty()
            {
                end_idx -= 1;
                continue;
            }
            break;
        }

        // Check if first node is text or expression tag - if so, we need hydration marker
        let first_node = body_nodes.get(start_idx);
        let is_text_first = matches!(
            first_node,
            Some(TemplateNode::Text(_)) | Some(TemplateNode::ExpressionTag(_))
        );

        // Add hydration marker if first content is text
        if is_text_first {
            body_generator
                .output_parts
                .push(OutputPart::Html("<!---->".to_string()));
        }

        // Generate body content
        for (i, node) in body_nodes
            .iter()
            .enumerate()
            .skip(start_idx)
            .take(end_idx - start_idx)
        {
            if i == start_idx
                && let TemplateNode::Text(text) = node
            {
                let trimmed = text.data.trim_start();
                let trimmed_end = trimmed.trim_end();
                if !trimmed_end.is_empty() {
                    let content = escape_html(trimmed_end);
                    body_generator.output_parts.push(OutputPart::Html(content));
                }
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }

    /// Generate code for <svelte:head> elements.
    ///
    /// Generates: $.head('hash', $$renderer, ($$renderer) => { ... });
    fn generate_svelte_head(&mut self, head: &SvelteElement) -> Result<(), TransformError> {
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

    /// Generate <title> element inside svelte:head.
    /// Uses $$renderer.title() callback.
    fn generate_title_element(&mut self, title: &TitleElement) -> Result<(), TransformError> {
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

    /// Generate body parts from a fragment.
    fn generate_fragment_body_parts(
        &mut self,
        fragment: &Fragment,
    ) -> Result<Vec<OutputPart>, TransformError> {
        self.generate_fragment_body_parts_inner(fragment, false)
    }

    /// Generate body parts from a fragment, optionally skipping the anchor comment.
    /// The anchor is used to prevent text fusion in the main template, but is not
    /// needed inside callbacks (like svelte:element children).
    fn generate_fragment_body_parts_inner(
        &mut self,
        fragment: &Fragment,
        skip_anchor: bool,
    ) -> Result<Vec<OutputPart>, TransformError> {
        let mut body_generator = ServerCodeGenerator::new(
            self.component_name.clone(),
            self.source.clone(),
            None,
            None,
            self.analysis,
            self.use_async,
        );
        body_generator.constant_vars = self.constant_vars.clone();

        // Get the nodes and find meaningful content bounds
        let nodes: Vec<_> = fragment.nodes.iter().collect();
        let len = nodes.len();

        // Find first meaningful node (skip whitespace-only text, comments, and snippet blocks)
        // Snippet blocks are hoisted and don't produce inline output
        let mut start_idx = 0;
        while start_idx < len {
            match nodes[start_idx] {
                TemplateNode::Text(text) if text.data.trim().is_empty() => {
                    start_idx += 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    start_idx += 1;
                    continue;
                }
                _ => break,
            }
        }

        // Find last meaningful node (skip whitespace-only text, comments, and snippet blocks)
        let mut end_idx = len;
        while end_idx > start_idx {
            match nodes[end_idx - 1] {
                TemplateNode::Text(text) if text.data.trim().is_empty() => {
                    end_idx -= 1;
                    continue;
                }
                TemplateNode::Comment(_) => {
                    end_idx -= 1;
                    continue;
                }
                _ => break,
            }
        }

        // Compute standalone-ness for the trimmed fragment
        let is_standalone = Self::is_standalone_fragment(
            &nodes[start_idx..end_idx]
                .iter()
                .map(|n| (*n).clone())
                .collect::<Vec<_>>(),
        );
        body_generator.skip_hydration_boundaries = is_standalone;

        // Check if first meaningful content needs an anchor
        // If the first node is Text or ExpressionTag, add <!----> to prevent text fusion
        // Skip this for callbacks (like svelte:element children) since they're isolated
        // Also skip for standalone fragments (single RenderTag/Component)
        if !skip_anchor && !is_standalone && start_idx < end_idx {
            let first_node = &nodes[start_idx];
            let needs_anchor = matches!(
                first_node,
                TemplateNode::Text(_) | TemplateNode::ExpressionTag(_)
            );
            if needs_anchor {
                body_generator
                    .output_parts
                    .push(OutputPart::Html("<!---->".to_string()));
            }
        }

        // Generate only the meaningful nodes
        // Track when we've just output a TitleElement to trim leading whitespace from next text
        let mut just_had_title = false;
        let meaningful_nodes = &nodes[start_idx..end_idx];
        for (i, node) in meaningful_nodes.iter().enumerate() {
            let is_last = i == meaningful_nodes.len() - 1;
            // If we just had a title and this is a text node, trim leading whitespace
            if just_had_title && let TemplateNode::Text(text) = node {
                let mut modified_text = text.clone();
                modified_text.data = modified_text.data.trim_start().to_string().into();
                // Also trim trailing whitespace if this is the last node
                if is_last {
                    modified_text.data = modified_text.data.trim_end().to_string().into();
                }
                body_generator.generate_node(&TemplateNode::Text(modified_text), false)?;
                just_had_title = false;
                continue;
            }
            just_had_title = matches!(node, TemplateNode::TitleElement(_));
            // For the last text node in a fragment, trim trailing whitespace
            if is_last && let TemplateNode::Text(text) = node {
                let mut modified_text = text.clone();
                modified_text.data = modified_text.data.trim_end().to_string().into();
                body_generator.generate_node(&TemplateNode::Text(modified_text), false)?;
                continue;
            }
            body_generator.generate_node(node, false)?;
        }

        Ok(body_generator.output_parts)
    }

    fn build(self) -> String {
        let mut each_counter: usize = 0;
        let body_code = Self::build_parts(&self.output_parts, 1, &mut each_counter);

        // Process module script content (context="module") if present
        // Module script runs at module level, outside the component function
        let (module_imports, module_code) = if let Some(script) = self.module_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // Extract imports and transform the rest
            // Use extract_imports_module to keep `export { ... }` statements
            let (imports, rest) = extract_imports_module(&raw_script);
            let transformed = transform_script_content_module(&rest);

            (imports, transformed)
        } else {
            (Vec::new(), String::new())
        };

        // Get analysis flags for determining component wrapper and props injection
        // These are independent of whether there's an instance script
        let needs_context = self.analysis.map(|a| a.needs_context).unwrap_or(false);
        let analysis_needs_props = self.analysis.map(|a| a.needs_props).unwrap_or(false);
        let analysis_uses_props = self.analysis.map(|a| a.uses_props).unwrap_or(false);
        let analysis_uses_rest_props = self.analysis.map(|a| a.uses_rest_props).unwrap_or(false);
        let analysis_uses_slots = self.analysis.map(|a| a.uses_slots).unwrap_or(false);
        let uses_component_bindings = self
            .analysis
            .map(|a| a.uses_component_bindings)
            .unwrap_or(false);

        // Process instance script content if present
        let (
            script_code,
            hoisted_imports,
            script_uses_props,
            has_class_state_fields,
            uses_props_spread,
        ) = if let Some(script) = self.instance_script {
            let start = script.content.start().unwrap_or(0) as usize;
            let end = script.content.end().unwrap_or(0) as usize;
            let raw_script = if end > start && end <= self.source.len() {
                self.source[start..end].to_string()
            } else {
                String::new()
            };

            // First, remove $effect, $effect.pre, $effect.root, and $inspect.trace blocks
            // These are client-side only and should not appear in SSR output
            let raw_script = remove_effect_blocks(&raw_script);

            // Check if script uses $props() or export let (legacy props)
            let uses_props = raw_script.contains("$props()")
                || raw_script.contains("export let ")
                || raw_script.contains("export var ");

            // Check if class fields use $state, $state.raw, or $derived runes
            // This requires $$props and $$renderer.component() wrapper
            let class_state_fields = raw_script.contains("class ")
                && (raw_script.contains("= $state(")
                    || raw_script.contains("= $state.raw(")
                    || raw_script.contains("= $derived("));

            // Check if uses spread pattern: let props = $props() or let xxx = $props()
            // This requires $$renderer.component() wrapper with destructuring
            let props_spread = detect_props_spread_pattern(&raw_script);

            // Extract imports and transform the rest
            let (imports, rest) = extract_imports(&raw_script);

            // Apply class field transformation for $derived fields
            let rest = transform_class_fields_server(&rest);

            let transformed = transform_script_content(&rest);

            // Transform store subscriptions in script content ($store -> $.store_get())
            let transformed = self.transform_store_refs_in_script(&transformed);

            (
                transformed,
                imports,
                uses_props,
                class_state_fields,
                props_spread,
            )
        } else {
            (String::new(), Vec::new(), false, false, false)
        };

        // Determine if we need $$renderer.component() wrapper
        // This matches the official compiler's should_inject_context logic
        let should_inject_context = needs_context;
        let needs_component_wrapper = should_inject_context
            || uses_props_spread
            || has_class_state_fields
            || self.uses_store_subs;

        // Determine if we need $$props parameter
        // This matches the official compiler's should_inject_props logic
        let should_inject_props = should_inject_context
            || analysis_needs_props
            || analysis_uses_props
            || analysis_uses_rest_props
            || analysis_uses_slots
            || script_uses_props
            || has_class_state_fields
            || self.uses_store_subs;

        let props_param = if should_inject_props { ", $$props" } else { "" };

        // Combine module imports and instance imports (module imports first)
        let all_imports: Vec<String> = module_imports.into_iter().chain(hoisted_imports).collect();

        // Build hoisted imports section
        let imports_section = if all_imports.is_empty() {
            String::new()
        } else {
            all_imports.join("\n") + "\n"
        };

        // Build module script section (placed after imports, before component function)
        let module_section = if module_code.trim().is_empty() {
            String::new()
        } else {
            format!("{}\n", module_code)
        };

        // Build snippet functions
        let snippets_section = self.build_snippets();

        // Build async flag import if experimental.async is enabled
        let async_import = if self.use_async {
            "import 'svelte/internal/flags/async';\n"
        } else {
            ""
        };

        // Build CSS injection section if needed
        let (css_const_section, css_add_call) =
            if let Some((ref hash, ref code)) = self.injected_css {
                // Escape single quotes in CSS code for JS string
                let escaped_code = code.replace('\'', "\\'");
                let css_const = format!(
                    "const $$css = {{\n\thash: '{}',\n\tcode: '{}'\n}};\n\n",
                    hash, escaped_code
                );
                let css_add = "\t$$renderer.global.css.add($$css);\n".to_string();
                (css_const, css_add)
            } else {
                (String::new(), String::new())
            };

        // Build the final output - handle empty body case
        let has_content = !script_code.is_empty() || !body_code.is_empty();

        let raw_output = if has_content {
            if needs_component_wrapper {
                // Build props declarations ($$sanitized_props, $$restProps) - inside wrapper
                let props_declarations = self.build_props_declarations(2);
                // Wrap in $$renderer.component() with proper destructuring
                let inner_script = transform_props_spread(&script_code);
                let mut each_counter: usize = 0;
                let inner_body = Self::build_parts(&self.output_parts, 2, &mut each_counter);
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(2);
                // Build $.bind_props() call (inside $$renderer.component())
                let bind_props_code = self.build_bind_props(2);

                // Add store subscription variable declaration and cleanup if needed
                let store_subs_decl = if self.uses_store_subs {
                    "\t\tvar $$store_subs;\n"
                } else {
                    ""
                };
                let store_subs_cleanup = if self.uses_store_subs {
                    "\n\t\tif ($$store_subs) $.unsubscribe_stores($$store_subs);\n"
                } else {
                    ""
                };

                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{
{css_add_call}	$$renderer.component(($$renderer) => {{
{props_declarations}{store_subs_decl}{inner_script}
{instance_snippets}{inner_body}{store_subs_cleanup}{bind_props_code}	}});
}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    props_declarations = props_declarations,
                    store_subs_decl = store_subs_decl,
                    inner_script = inner_script,
                    instance_snippets = instance_snippets,
                    inner_body = inner_body,
                    bind_props_code = bind_props_code,
                    store_subs_cleanup = store_subs_cleanup
                )
            } else {
                // Build props declarations ($$sanitized_props, $$restProps)
                let props_declarations = self.build_props_declarations(1);
                let script_section = if script_code.is_empty() {
                    String::new()
                } else {
                    format!("{}\n", script_code)
                };
                // Build instance-level snippets (cannot be hoisted)
                let instance_snippets = self.build_instance_snippets(1);
                // Build $.bind_props() call (at top level of component function)
                let bind_props_code = self.build_bind_props(1);

                // If the component uses component bindings, wrap the body in $$render_inner loop
                let body_section = if uses_component_bindings {
                    // Wrap body_code in $$settled/$$render_inner pattern
                    format!(
                        r#"	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {{
{body_code}	}}

	do {{
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	}} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
"#,
                        body_code = body_code.replace("\t", "\t\t") // Increase indentation
                    )
                } else {
                    body_code.clone()
                };

                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{
{css_add_call}{props_declarations}{script_section}{instance_snippets}{body_section}{bind_props_code}}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    props_declarations = props_declarations,
                    script_section = script_section,
                    instance_snippets = instance_snippets,
                    body_section = body_section,
                    bind_props_code = bind_props_code
                )
            }
        } else {
            // Empty body - use single line braces
            // Build $.bind_props() call even for empty body
            let bind_props_code = self.build_bind_props(1);
            if bind_props_code.is_empty() && css_add_call.is_empty() {
                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                )
            } else {
                format!(
                    r#"{async_import}import * as $ from 'svelte/internal/server';
{imports_section}{snippets_section}{css_const_section}{module_section}
export default function {component_name}($$renderer{props_param}) {{
{css_add_call}{bind_props_code}}}"#,
                    async_import = async_import,
                    imports_section = imports_section,
                    snippets_section = snippets_section,
                    css_const_section = css_const_section,
                    module_section = module_section,
                    component_name = self.component_name,
                    props_param = props_param,
                    css_add_call = css_add_call,
                    bind_props_code = bind_props_code
                )
            }
        };

        // Normalize the output through oxc parser/codegen
        match normalize_js(&raw_output) {
            Ok(normalized) => normalized,
            Err(_) => raw_output, // Fall back to raw output if parsing fails
        }
    }

    fn build_parts(parts: &[OutputPart], indent_level: usize, each_counter: &mut usize) -> String {
        let mut body_code = String::new();
        let mut current_html = String::new();
        let indent = "\t".repeat(indent_level);
        let mut textarea_body_count: usize = 0;

        let mut i = 0;
        while i < parts.len() {
            let part = &parts[i];
            match part {
                OutputPart::Html(html) => {
                    // Collapse consecutive spaces: if current_html ends with space and html is just a space
                    if !(current_html.ends_with(' ') && html == " ") {
                        current_html.push_str(html);
                    }
                }
                OutputPart::Expression(expr) => {
                    current_html.push_str(&format!("${{$.escape({})}}", expr));
                }
                OutputPart::RawExpression(expr) => {
                    // Raw expressions don't need escaping (e.g., $.attributes())
                    current_html.push_str(&format!("${{{}}}", expr));
                }
                OutputPart::HtmlExpression(expr) => {
                    current_html.push_str(&format!("${{$.html({})}}", expr));
                }
                OutputPart::ComponentWithBindings {
                    name,
                    props,
                    spreads,
                    bindings,
                    has_prior_content,
                    children: _, // TODO: Handle children for components with bindings
                    dynamic,
                } => {
                    // Component with bindings - just generate the component call with getter/setters.
                    // The $$settled/$$render_inner loop is handled at the component level in build().

                    // Flush any prior HTML content (with dynamic marker if needed)
                    if !current_html.is_empty() {
                        if *dynamic {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}<!---->`);\n",
                                indent, current_html
                            ));
                        } else {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                        }
                        current_html.clear();
                    } else if *dynamic {
                        // Even if no prior HTML, dynamic components need a marker
                        body_code.push_str(&format!("{}$$renderer.push(`<!---->`);\n", indent));
                    }

                    // Use optional chaining for dynamic components
                    let call_syntax = if *dynamic { "?." } else { "" };

                    // Generate component call - use $.spread_props if spreads exist
                    if !spreads.is_empty() {
                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, $.spread_props([\n",
                            indent, name, call_syntax
                        ));

                        // Add spread expressions first
                        for spread in spreads {
                            body_code.push_str(&format!("{}\t{},\n", indent, spread));
                        }

                        // Then add explicit props and bindings as an object
                        body_code.push_str(&format!("{}\t{{\n", indent));

                        for prop in props {
                            body_code.push_str(&format!("{}\t\t{},\n", indent, prop));
                        }

                        let binding_count = bindings.len();
                        for (idx, (prop_name, var_name)) in bindings.iter().enumerate() {
                            body_code.push_str(&format!("{}\t\tget {}() {{\n", indent, prop_name));
                            body_code.push_str(&format!("{}\t\t\treturn {};\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                            body_code.push_str(&format!(
                                "{}\t\tset {}($$value) {{\n",
                                indent, prop_name
                            ));
                            body_code
                                .push_str(&format!("{}\t\t\t{} = $$value;\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t\t$$settled = false;\n", indent));
                            if idx < binding_count - 1 {
                                body_code.push_str(&format!("{}\t\t}},\n\n", indent));
                            } else {
                                body_code.push_str(&format!("{}\t\t}}\n", indent));
                            }
                        }

                        body_code.push_str(&format!("{}\t}}\n", indent));
                        body_code.push_str(&format!("{}]));\n", indent));
                    } else {
                        // No spreads, use simple object literal
                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, {{\n",
                            indent, name, call_syntax
                        ));

                        // Regular props first
                        for prop in props {
                            body_code.push_str(&format!("{}\t{},\n", indent, prop));
                        }

                        // Generate getter/setter for each binding
                        let binding_count = bindings.len();
                        for (idx, (prop_name, var_name)) in bindings.iter().enumerate() {
                            body_code.push_str(&format!("{}\tget {}() {{\n", indent, prop_name));
                            body_code.push_str(&format!("{}\t\treturn {};\n", indent, var_name));
                            body_code.push_str(&format!("{}\t}},\n\n", indent));
                            body_code
                                .push_str(&format!("{}\tset {}($$value) {{\n", indent, prop_name));
                            body_code.push_str(&format!("{}\t\t{} = $$value;\n", indent, var_name));
                            body_code.push_str(&format!("{}\t\t$$settled = false;\n", indent));
                            if idx < binding_count - 1 {
                                // Trailing comma + blank line between binding pairs
                                body_code.push_str(&format!("{}\t}},\n\n", indent));
                            } else {
                                // Last binding - no trailing comma
                                body_code.push_str(&format!("{}\t}}\n", indent));
                            }
                        }

                        body_code.push_str(&format!("{}}});\n", indent));
                    }

                    // Add <!---->  marker for hydration boundary after binding component
                    // Add if there's content before OR content after this component
                    let has_more_content = parts[i + 1..]
                        .iter()
                        .any(|p| !matches!(p, OutputPart::Html(s) if s.trim().is_empty()));
                    if *has_prior_content || has_more_content {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::Component {
                    name,
                    props,
                    spreads,
                    has_prior_content,
                    children,
                    snippets,
                    slot_names,
                    dynamic,
                } => {
                    // Flush current HTML before the component call
                    // For dynamic components, add <!---->  marker before the call
                    if !current_html.is_empty() {
                        if *dynamic {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}<!---->`);\n",
                                indent, current_html
                            ));
                        } else {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                        }
                        current_html.clear();
                    } else if *dynamic {
                        // Even if no prior HTML, dynamic components need a marker
                        body_code.push_str(&format!("{}$$renderer.push(`<!---->`);\n", indent));
                    }

                    // Check if we have snippets or children
                    let has_snippets = !snippets.is_empty();
                    let has_children = children.is_some();
                    let has_spreads = !spreads.is_empty();

                    // Use optional chaining for dynamic components
                    let call_syntax = if *dynamic { "?." } else { "" };

                    if has_snippets || has_children {
                        // Separate snippets into:
                        // 1. True snippets (SnippetBlocks - need hoisting, passed as props)
                        // 2. Slot children (inline in $$slots, may have destructured params from let directives)
                        #[allow(clippy::type_complexity)]
                        let (true_snippets, slot_children): (
                            Vec<&(String, Vec<String>, Vec<OutputPart>, bool)>,
                            Vec<&(String, Vec<String>, Vec<OutputPart>, bool)>,
                        ) = snippets
                            .iter()
                            .partition(|(_, _, _, is_true_snippet)| *is_true_snippet);

                        let has_true_snippets = !true_snippets.is_empty();
                        let has_slot_children = !slot_children.is_empty();

                        // Wrap in a block if we have true snippets (need hoisting)
                        if has_true_snippets {
                            body_code.push_str(&format!("{}{{\n", indent));

                            // Generate snippet function declarations inside the block
                            for (snippet_name, params, body_parts, _) in &true_snippets {
                                let params_str = format!("$$renderer, {}", params.join(", "));
                                body_code.push_str(&format!(
                                    "{}\tfunction {}({}) {{\n",
                                    indent, snippet_name, params_str
                                ));
                                let snippet_body =
                                    Self::build_parts(body_parts, indent_level + 2, each_counter);
                                body_code.push_str(&snippet_body);
                                body_code.push_str(&format!("{}\t}}\n\n", indent));
                            }

                            // Component call with true snippets as props
                            body_code.push_str(&format!(
                                "{}\t{}{}($$renderer, {{ ",
                                indent, name, call_syntax
                            ));

                            // Collect all props including true snippet names
                            let mut all_props: Vec<String> = props.clone();
                            for (snippet_name, _, _, _) in &true_snippets {
                                all_props.push(snippet_name.to_string());
                            }

                            // Build $$slots object with:
                            // - true snippets as `name: true`
                            // - slot children as inline functions (with destructured params if they have let directives)
                            let mut slots_entries: Vec<String> = Vec::new();
                            for slot_name in slot_names {
                                let quoted_name = quote_prop_name(slot_name);
                                // Check if this slot is a slot child
                                if let Some((_, params, body_parts, _)) =
                                    slot_children.iter().find(|(n, _, _, _)| n == slot_name)
                                {
                                    // Inline function with optional destructured params
                                    let fn_body = Self::build_parts(body_parts, 0, each_counter);
                                    let fn_body_trimmed = fn_body.trim();
                                    if params.is_empty() {
                                        slots_entries.push(format!(
                                            "{}: ($$renderer) => {{\n{}\t\t\t}}",
                                            quoted_name, fn_body_trimmed
                                        ));
                                    } else {
                                        // Destructured params from let directives
                                        let params_str = format!("{{ {} }}", params.join(", "));
                                        slots_entries.push(format!(
                                            "{}: ($$renderer, {}) => {{\n{}\t\t\t}}",
                                            quoted_name, params_str, fn_body_trimmed
                                        ));
                                    }
                                } else {
                                    // True snippet marker
                                    slots_entries.push(format!("{}: true", quoted_name));
                                }
                            }

                            let slots_str = slots_entries.join(", ");

                            if all_props.is_empty() {
                                body_code.push_str(&format!("$$slots: {{ {} }} }});\n", slots_str));
                            } else {
                                body_code.push_str(&format!(
                                    "{}, $$slots: {{ {} }} }});\n",
                                    all_props.join(", "),
                                    slots_str
                                ));
                            }

                            // Close the block
                            body_code.push_str(&format!("{}}}\n", indent));
                        } else if has_slot_children && !has_children {
                            // Only named slot children (no default children, no true snippets)
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{\n",
                                indent, name, call_syntax
                            ));

                            // Props
                            for prop in props {
                                body_code.push_str(&format!("{}\t{},\n", indent, prop));
                            }

                            // $$slots with inline functions (with params for let directives)
                            body_code.push_str(&format!("{}\t$$slots: {{\n", indent));
                            for (slot_name, params, body_parts, _) in &slot_children {
                                let quoted_name = quote_prop_name(slot_name);
                                let fn_body =
                                    Self::build_parts(body_parts, indent_level + 3, each_counter);
                                if params.is_empty() {
                                    body_code.push_str(&format!(
                                        "{}\t\t{}: ($$renderer) => {{\n{}",
                                        indent, quoted_name, fn_body
                                    ));
                                } else {
                                    // Destructured params from let directives
                                    let params_str = format!("{{ {} }}", params.join(", "));
                                    body_code.push_str(&format!(
                                        "{}\t\t{}: ($$renderer, {}) => {{\n{}",
                                        indent, quoted_name, params_str, fn_body
                                    ));
                                }
                                body_code.push_str(&format!("{}\t\t}},\n", indent));
                            }
                            body_code.push_str(&format!("{}\t}}\n", indent));
                            body_code.push_str(&format!("{}}});\n", indent));
                        } else if let Some(children_parts) = children {
                            // Component with children (default slot) and possibly named slots
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{\n",
                                indent, name, call_syntax
                            ));

                            // Props
                            for prop in props {
                                body_code.push_str(&format!("{}\t{},\n", indent, prop));
                            }

                            // Children callback (default slot)
                            body_code
                                .push_str(&format!("{}\tchildren: ($$renderer) => {{\n", indent));
                            let children_code =
                                Self::build_parts(children_parts, indent_level + 2, each_counter);
                            body_code.push_str(&children_code);
                            body_code.push_str(&format!("{}\t}},\n", indent));

                            // $$slots with default: true and any named slot children
                            if has_slot_children {
                                body_code.push_str(&format!("{}\t$$slots: {{\n", indent));
                                body_code.push_str(&format!("{}\t\tdefault: true,\n", indent));
                                for (slot_name, params, body_parts, _) in &slot_children {
                                    let quoted_name = quote_prop_name(slot_name);
                                    let fn_body = Self::build_parts(
                                        body_parts,
                                        indent_level + 3,
                                        each_counter,
                                    );
                                    if params.is_empty() {
                                        body_code.push_str(&format!(
                                            "{}\t\t{}: ($$renderer) => {{\n{}",
                                            indent, quoted_name, fn_body
                                        ));
                                    } else {
                                        // Destructured params from let directives
                                        let params_str = format!("{{ {} }}", params.join(", "));
                                        body_code.push_str(&format!(
                                            "{}\t\t{}: ($$renderer, {}) => {{\n{}",
                                            indent, quoted_name, params_str, fn_body
                                        ));
                                    }
                                    body_code.push_str(&format!("{}\t\t}},\n", indent));
                                }
                                body_code.push_str(&format!("{}\t}}\n", indent));
                            } else {
                                // Only default slot
                                body_code.push_str(&format!(
                                    "{}\t$$slots: {{ default: true }}\n",
                                    indent
                                ));
                            }
                            body_code.push_str(&format!("{}}});\n", indent));
                        }
                    } else if has_spreads {
                        // Has spread attributes - use $.spread_props
                        let spread_args: Vec<String> = spreads.clone();
                        body_code.push_str(&format!(
                            "{}{}{}($$renderer, $.spread_props([{}]));\n",
                            indent,
                            name,
                            call_syntax,
                            spread_args.join(", ")
                        ));
                    } else {
                        // No children, no snippets, no spreads - simple call
                        if props.is_empty() {
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{}});\n",
                                indent, name, call_syntax
                            ));
                        } else {
                            body_code.push_str(&format!(
                                "{}{}{}($$renderer, {{ {} }});\n",
                                indent,
                                name,
                                call_syntax,
                                props.join(", ")
                            ));
                        }
                    }

                    // Check if there's content after this component
                    let has_content_after = parts[i + 1..].iter().any(|p| {
                        matches!(
                            p,
                            OutputPart::Html(h) if !h.trim().is_empty()
                        ) || matches!(
                            p,
                            OutputPart::Expression(_)
                                | OutputPart::RawExpression(_)
                                | OutputPart::HtmlExpression(_)
                                | OutputPart::Component { .. }
                                | OutputPart::EachBlock { .. }
                                | OutputPart::IfBlock { .. }
                                | OutputPart::AwaitBlock { .. }
                                | OutputPart::SvelteBoundary { .. }
                                | OutputPart::SvelteHead { .. }
                                | OutputPart::TitleElement { .. }
                                | OutputPart::RenderCall { .. }
                        )
                    });

                    // Add marker after component if:
                    // - There's content before (has_prior_content), OR
                    // - There's content after
                    // This matches the official Svelte compiler behavior when
                    // skip_hydration_boundaries is false (which is true when
                    // the fragment is NOT standalone)
                    if *has_prior_content || has_content_after {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::Comment => {
                    current_html.push_str("<!---->");
                }
                OutputPart::EachBlock {
                    iterable,
                    context_name,
                    index_name,
                    body,
                    fallback,
                } => {
                    // Generate unique array variable name: each_array, each_array_1, each_array_2, ...
                    let array_var = if *each_counter == 0 {
                        "each_array".to_string()
                    } else {
                        format!("each_array_{}", each_counter)
                    };

                    // Generate unique index variable name if not explicitly provided
                    // $$index, $$index_1, $$index_2, ...
                    let index_var = match index_name {
                        Some(name) => name.clone(),
                        None => {
                            if *each_counter == 0 {
                                "$$index".to_string()
                            } else {
                                format!("$$index_{}", each_counter)
                            }
                        }
                    };

                    // Increment counter for the next each block
                    *each_counter += 1;

                    if fallback.is_some() {
                        // For fallback case, flush current HTML WITHOUT marker first
                        if !current_html.is_empty() {
                            body_code.push_str(&format!(
                                "{}$$renderer.push(`{}`);\n",
                                indent, current_html
                            ));
                            current_html.clear();
                        }

                        body_code.push_str(&format!(
                            "{}const {} = $.ensure_array_like({});\n\n",
                            indent, array_var, iterable
                        ));

                        // If there's a fallback, wrap in if-else
                        body_code
                            .push_str(&format!("{}if ({}.length !== 0) {{\n", indent, array_var));
                        // Add block marker for non-empty case INSIDE the if
                        body_code
                            .push_str(&format!("{}\t$$renderer.push('<!--[-->');\n\n", indent));

                        // For loop (indented)
                        body_code.push_str(&format!(
                            "{}\tfor (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                            indent, index_var, array_var, index_var, index_var
                        ));

                        // Context variable (only if there's a context)
                        if let Some(ctx_name) = context_name {
                            body_code.push_str(&format!(
                                "{}\t\tlet {} = {}[{}];\n\n",
                                indent, ctx_name, array_var, index_var
                            ));
                        }

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 2, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close for loop
                        body_code.push_str(&format!("{}\t}}\n", indent));

                        // Else branch with fallback
                        body_code.push_str(&format!("{}}} else {{\n", indent));
                        // Add block marker for empty case (note the !)
                        body_code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));

                        // Fallback body
                        if let Some(fb) = fallback {
                            let fallback_code =
                                Self::build_parts(fb, indent_level + 1, each_counter);
                            body_code.push_str(&fallback_code);
                        }

                        body_code.push_str(&format!("{}}}\n\n", indent));
                    } else {
                        // No fallback - add opening marker to current_html before flushing
                        // This combines with any prior content like: `<ul><!--[-->`
                        current_html.push_str("<!--[-->");

                        // Flush current HTML (including the marker) before each block
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();

                        body_code.push_str(&format!(
                            "{}const {} = $.ensure_array_like({});\n\n",
                            indent, array_var, iterable
                        ));

                        // For loop
                        body_code.push_str(&format!(
                            "{}for (let {} = 0, $$length = {}.length; {} < $$length; {}++) {{\n",
                            indent, index_var, array_var, index_var, index_var
                        ));

                        // Context variable (only if there's a context)
                        if let Some(ctx_name) = context_name {
                            body_code.push_str(&format!(
                                "{}\tlet {} = {}[{}];\n\n",
                                indent, ctx_name, array_var, index_var
                            ));
                        }

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close for loop
                        body_code.push_str(&format!("{}}}\n\n", indent));
                    }

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::IfBlock {
                    test_expr,
                    consequent_body,
                    alternate_body,
                } => {
                    // Flush current HTML before if block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the if block with proper markers
                    let if_code = Self::build_if_statement(
                        test_expr,
                        consequent_body,
                        alternate_body,
                        indent_level,
                        each_counter,
                    );
                    body_code.push_str(&if_code);

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteElement {
                    tag_expr,
                    attrs_expr,
                    body,
                } => {
                    // Flush current HTML before svelte:element
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.element call with attributes and body callback
                    if body.is_empty() && attrs_expr.is_none() {
                        // No body and no attributes - simple form
                        body_code
                            .push_str(&format!("{}$.element($$renderer, {});\n", indent, tag_expr));
                    } else {
                        // Build $.element($$renderer, tag, attrs, () => { ... })
                        let attrs_arg = attrs_expr.as_deref().unwrap_or("void 0");

                        if body.is_empty() {
                            // No body, just attributes
                            body_code.push_str(&format!(
                                "{}$.element($$renderer, {}, {});\n",
                                indent, tag_expr, attrs_arg
                            ));
                        } else {
                            // Has body - use callback form
                            body_code.push_str(&format!(
                                "{}$.element($$renderer, {}, {}, () => {{\n",
                                indent, tag_expr, attrs_arg
                            ));

                            // Generate body content
                            let body_code_inner =
                                Self::build_parts(body, indent_level + 1, each_counter);
                            body_code.push_str(&body_code_inner);

                            body_code.push_str(&format!("{}}});\n", indent));
                        }
                    }
                }
                OutputPart::SelectElement {
                    attrs_obj,
                    body,
                    is_rich,
                    css_hash,
                } => {
                    // Flush current HTML before select element
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $$renderer.select() call with multiline formatting when css_hash is present
                    if css_hash.is_some() || *is_rich {
                        body_code.push_str(&format!(
                            "{}$$renderer.select(\n{}\t{},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_obj, indent
                        ));
                    } else {
                        body_code.push_str(&format!(
                            "{}$$renderer.select({}, ($$renderer) => {{\n",
                            indent, attrs_obj
                        ));
                    }

                    // Body
                    let body_code_inner = Self::build_parts(body, indent_level + 2, each_counter);
                    body_code.push_str(&body_code_inner);

                    // Close callback with optional css_hash, classes, styles, flags and is_rich arguments
                    // The full signature is: $$renderer.select(attrs, fn, css_hash, classes, styles, flags, is_rich)
                    // When intermediate arguments are undefined, they must be `void 0`
                    if *is_rich {
                        if let Some(hash) = css_hash {
                            // With css_hash: select(attrs, fn, 'hash', void 0, void 0, void 0, true)
                            body_code.push_str(&format!(
                                "{}\t}},\n{}\t'{}',\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                                indent, indent, hash, indent, indent, indent, indent, indent
                            ));
                        } else {
                            // Without css_hash: select(attrs, fn, void 0, void 0, void 0, void 0, true)
                            body_code.push_str(&format!(
                                "{}\t}},\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                                indent, indent, indent, indent, indent, indent, indent
                            ));
                        }
                    } else if let Some(hash) = css_hash {
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\t'{}'\n{});\n",
                            indent, indent, hash, indent
                        ));
                    } else {
                        body_code.push_str(&format!("{}}});\n", indent));
                    }
                }
                OutputPart::OptionElement {
                    attrs,
                    body,
                    is_rich,
                    direct_value,
                    css_hash,
                } => {
                    // Flush current HTML before option element
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);\n\n",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // Generate $$renderer.option() call
                    let attrs_str = attrs
                        .iter()
                        .map(|(k, v)| format!("{}: {}", k, v))
                        .collect::<Vec<_>>()
                        .join(", ");

                    // If we have a direct value (from synthetic_value_node), pass it directly
                    if let Some(value_expr) = direct_value {
                        body_code.push_str(&format!(
                            "{}$$renderer.option({{ {} }}, {});\n",
                            indent, attrs_str, value_expr
                        ));
                    } else if *is_rich {
                        // Build the $$renderer.option() call
                        // If is_rich, we need to pass 7 arguments: attrs, body, void 0, void 0, void 0, void 0, true
                        body_code.push_str(&format!(
                            "{}$$renderer.option(\n{}\t{{ {} }},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_str, indent
                        ));

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 2, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close callback with remaining args
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\tvoid 0,\n{}\ttrue\n{});\n",
                            indent, indent, indent, indent, indent, indent, indent
                        ));
                    } else if let Some(hash) = css_hash {
                        // Has CSS hash - pass as 3rd argument
                        body_code.push_str(&format!(
                            "{}$$renderer.option(\n{}\t{{ {} }},\n{}\t($$renderer) => {{\n",
                            indent, indent, attrs_str, indent
                        ));

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 2, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close callback with CSS hash
                        body_code.push_str(&format!(
                            "{}\t}},\n{}\t'{}'\n{});\n",
                            indent, indent, hash, indent
                        ));
                    } else {
                        body_code.push_str(&format!(
                            "{}$$renderer.option({{ {} }}, ($$renderer) => {{\n",
                            indent, attrs_str
                        ));

                        // Body
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);

                        // Close callback
                        body_code.push_str(&format!("{}}});\n", indent));
                    }
                }
                OutputPart::AwaitBlock {
                    promise,
                    then_param,
                    pending_body,
                    then_body,
                    catch_param,
                    catch_body,
                } => {
                    // Flush current HTML before await block
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.await call with proper callbacks
                    body_code.push_str(&format!("{}$.await(\n", indent));
                    body_code.push_str(&format!("{}\t$$renderer,\n", indent));
                    body_code.push_str(&format!("{}\t{},\n", indent, promise));

                    // Pending callback
                    if pending_body.is_empty() {
                        body_code.push_str(&format!("{}\t() => {{}},\n", indent));
                    } else {
                        body_code.push_str(&format!("{}\t() => {{\n", indent));
                        let pending_code =
                            Self::build_parts(pending_body, indent_level + 2, each_counter);
                        body_code.push_str(&pending_code);
                        body_code.push_str(&format!("{}\t}},\n", indent));
                    }

                    // Then callback
                    if then_body.is_empty() {
                        if then_param.is_empty() {
                            body_code.push_str(&format!("{}\t() => {{}}", indent));
                        } else {
                            body_code.push_str(&format!("{}\t({}) => {{}}", indent, then_param));
                        }
                    } else {
                        if then_param.is_empty() {
                            body_code.push_str(&format!("{}\t() => {{\n", indent));
                        } else {
                            body_code.push_str(&format!("{}\t({}) => {{\n", indent, then_param));
                        }
                        let then_code =
                            Self::build_parts(then_body, indent_level + 2, each_counter);
                        body_code.push_str(&then_code);
                        body_code.push_str(&format!("{}\t}}", indent));
                    }

                    // Catch callback (only if catch block exists)
                    if !catch_body.is_empty() || !catch_param.is_empty() {
                        body_code.push_str(",\n");
                        if catch_body.is_empty() {
                            if catch_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{}}", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{}}", indent, catch_param));
                            }
                        } else {
                            if catch_param.is_empty() {
                                body_code.push_str(&format!("{}\t() => {{\n", indent));
                            } else {
                                body_code
                                    .push_str(&format!("{}\t({}) => {{\n", indent, catch_param));
                            }
                            let catch_code =
                                Self::build_parts(catch_body, indent_level + 2, each_counter);
                            body_code.push_str(&catch_code);
                            body_code.push_str(&format!("{}\t}}", indent));
                        }
                    }

                    body_code.push('\n');
                    body_code.push_str(&format!("{});\n", indent));

                    // Add closing marker to the next push
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteBoundary { body, is_pending } => {
                    // Add boundary marker to current HTML and flush together
                    // Use <!--[!--> for pending state, <!--[--> for main content
                    // block_open = <!--[-->
                    // block_open_else = <!--[!-->
                    // block_close = <!--]-->
                    if *is_pending {
                        current_html.push_str("<!--[!-->");
                    } else {
                        current_html.push_str("<!--[-->");
                    }
                    body_code.push_str(&format!(
                        "{}$$renderer.push(`{}`);\n\n",
                        indent, current_html
                    ));
                    current_html.clear();

                    // Render the body in a block (always add block even if empty)
                    body_code.push_str(&format!("{}{{\n", indent));
                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }
                    body_code.push_str(&format!("{}}}\n\n", indent));

                    // Add closing marker to current_html to combine with subsequent content
                    current_html.push_str("<!--]-->");
                }
                OutputPart::SvelteHead { hash, body } => {
                    // Flush current HTML before head call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $.head('hash', $$renderer, ($$renderer) => { ... });
                    body_code.push_str(&format!(
                        "{}$.head('{}', $$renderer, ($$renderer) => {{\n",
                        indent, hash
                    ));

                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }

                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::TitleElement { body } => {
                    // Flush current HTML before title call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate $$renderer.title(($$renderer) => { ... });
                    body_code.push_str(&format!("{}$$renderer.title(($$renderer) => {{\n", indent));

                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }

                    body_code.push_str(&format!("{}}});\n", indent));
                }
                OutputPart::TextareaBody { value_expr } => {
                    // Flush current HTML before textarea body
                    if !current_html.is_empty() {
                        body_code.push_str(&format!(
                            "{}$$renderer.push(`{}`);\n\n",
                            indent, current_html
                        ));
                        current_html.clear();
                    }

                    // Generate unique variable name for each textarea body
                    // First one: $$body, subsequent: $$body_1, $$body_2, etc.
                    let var_name = if textarea_body_count == 0 {
                        "$$body".to_string()
                    } else {
                        format!("$$body_{}", textarea_body_count)
                    };
                    textarea_body_count += 1;

                    // Generate:
                    // const $$body = $.escape(expr);
                    //
                    // if ($$body) {
                    //     $$renderer.push(`${$$body}`);
                    // } else {}
                    body_code.push_str(&format!(
                        "{}const {} = $.escape({});\n\n",
                        indent, var_name, value_expr
                    ));
                    body_code.push_str(&format!(
                        "{}if ({}) {{\n{}\t$$renderer.push(`${{{}}}`);\n{}}} else {{}}\n\n",
                        indent, var_name, indent, var_name, indent
                    ));
                }
                OutputPart::RenderCall {
                    call_str,
                    skip_boundary,
                } => {
                    // Flush current HTML before render call
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the snippet function call
                    body_code.push_str(&format!("{}{};\n", indent, call_str));

                    // Add hydration boundary marker after render call only if not in a standalone context
                    // Official Svelte adds empty_comment after RenderTag unless skip_hydration_boundaries is true
                    if !skip_boundary {
                        current_html.push_str("<!---->");
                    }
                }
                OutputPart::ConstDeclaration(declaration) => {
                    // Flush current HTML before const declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the const declaration
                    body_code.push_str(&format!("{}const {};\n", indent, declaration));
                }
                OutputPart::BlockScope { body } => {
                    // Flush current HTML before block scope
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate the block scope
                    body_code.push_str(&format!("{}{{\n", indent));
                    if !body.is_empty() {
                        let body_code_inner =
                            Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_code_inner);
                    }
                    body_code.push_str(&format!("{}}}\n", indent));
                }
                OutputPart::HydrationAnchor => {
                    // Add <!> marker to current HTML (hydration anchor for Components/RenderTags/HtmlTags in select/optgroup)
                    current_html.push_str("<!>");
                }
                OutputPart::SnippetFunction { name, params, body } => {
                    // Flush current HTML before function declaration
                    if !current_html.is_empty() {
                        body_code
                            .push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
                        current_html.clear();
                    }

                    // Generate function declaration
                    let param_str = if params.is_empty() {
                        "$$renderer".to_string()
                    } else {
                        format!("$$renderer, {}", params.join(", "))
                    };

                    body_code.push_str(&format!("{}function {}({}) {{\n", indent, name, param_str));

                    // Generate body
                    if !body.is_empty() {
                        let body_inner = Self::build_parts(body, indent_level + 1, each_counter);
                        body_code.push_str(&body_inner);
                    }

                    body_code.push_str(&format!("{}}}\n\n", indent));
                }
            }
            i += 1;
        }

        // Flush remaining HTML
        if !current_html.is_empty() {
            body_code.push_str(&format!("{}$$renderer.push(`{}`);\n", indent, current_html));
        }

        body_code
    }

    /// Build an if statement with proper block markers.
    /// Following the official Svelte compiler, else-if chains are generated as nested if statements
    /// inside the else branch, each with their own block markers.
    fn build_if_statement(
        test_expr: &str,
        consequent_body: &[OutputPart],
        alternate_body: &Option<Vec<OutputPart>>,
        indent_level: usize,
        each_counter: &mut usize,
    ) -> String {
        let mut code = String::new();
        let indent = "\t".repeat(indent_level);

        // Start the if statement
        code.push_str(&format!("{}if ({}) {{\n", indent, test_expr));

        // Add opening marker for consequent (BLOCK_OPEN = <!--[-->)
        code.push_str(&format!("{}\t$$renderer.push('<!--[-->');\n", indent));

        // Generate consequent body
        let consequent_code = Self::build_parts(consequent_body, indent_level + 1, each_counter);
        code.push_str(&consequent_code);

        // Close consequent block
        code.push_str(&format!("{}}}", indent));

        // Handle alternate (else/else-if)
        if let Some(alt_body) = alternate_body {
            // Check if the alternate is another IfBlock (else-if chain)
            if alt_body.len() == 1
                && let OutputPart::IfBlock {
                    test_expr: nested_test,
                    consequent_body: nested_consequent,
                    alternate_body: nested_alternate,
                } = &alt_body[0]
            {
                // else-if case: wrap in else block with block_open_else marker and nested if
                code.push_str(" else {\n");

                // Add opening marker for else (BLOCK_OPEN_ELSE = <!--[!-->)
                code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n\n", indent));

                // Generate nested if statement with increased indentation
                let nested_if_code = Self::build_if_statement(
                    nested_test,
                    nested_consequent,
                    nested_alternate,
                    indent_level + 1,
                    each_counter,
                );
                code.push_str(&nested_if_code);
                code.push('\n');

                // Add closing marker for nested if
                code.push_str(&format!("\n{}\t$$renderer.push(`<!--]-->`);\n", indent));

                // Close else block
                code.push_str(&format!("{}}}", indent));

                return code;
            }

            // Regular else case (not else-if)
            code.push_str(" else {\n");

            // Add opening marker for else (BLOCK_OPEN_ELSE = <!--[!-->)
            code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));

            // Generate alternate body
            let alternate_code = Self::build_parts(alt_body, indent_level + 1, each_counter);
            code.push_str(&alternate_code);

            // Close else block
            code.push_str(&format!("{}}}", indent));
        } else {
            // No alternate - add empty else with BLOCK_OPEN_ELSE
            code.push_str(" else {\n");
            code.push_str(&format!("{}\t$$renderer.push('<!--[!-->');\n", indent));
            code.push_str(&format!("{}}}", indent));
        }

        code
    }

    /// Build snippet function definitions that can be hoisted to module level.
    fn build_snippets(&self) -> String {
        let hoisted: Vec<_> = self.snippets.iter().filter(|s| s.can_hoist).collect();
        if hoisted.is_empty() {
            return String::new();
        }

        let mut result = String::new();

        for snippet in hoisted {
            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!("function {}({}) {{\n", snippet.name, params));

            // Generate body - snippets have their own counter scope
            let mut snippet_counter: usize = 0;
            let body = Self::build_parts(&snippet.body_parts, 1, &mut snippet_counter);
            result.push_str(&body);

            result.push_str("}\n\n");
        }

        result
    }

    /// Build snippet function definitions that cannot be hoisted (instance-level).
    fn build_instance_snippets(&self, indent_level: usize) -> String {
        let instance: Vec<_> = self.snippets.iter().filter(|s| !s.can_hoist).collect();
        if instance.is_empty() {
            return String::new();
        }

        let indent = "\t".repeat(indent_level);
        let mut result = String::new();

        for snippet in instance {
            // Generate function signature
            let params = if snippet.params.is_empty() {
                "$$renderer".to_string()
            } else {
                format!("$$renderer, {}", snippet.params.join(", "))
            };

            result.push_str(&format!(
                "{}function {}({}) {{\n",
                indent, snippet.name, params
            ));

            // Generate body - snippets have their own counter scope
            let mut snippet_counter: usize = 0;
            let body =
                Self::build_parts(&snippet.body_parts, indent_level + 1, &mut snippet_counter);
            result.push_str(&body);

            result.push_str(&format!("{}}}\n\n", indent));
        }

        result
    }

    /// Build props declarations ($$sanitized_props, $$restProps) if needed.
    /// This is called at the start of the component body.
    fn build_props_declarations(&self, indent_level: usize) -> String {
        let analysis = match self.analysis {
            Some(a) => a,
            None => return String::new(),
        };

        let indent = "\t".repeat(indent_level);
        let mut result = String::new();

        // If uses_props or uses_rest_props, add $$sanitized_props
        if analysis.uses_props || analysis.uses_rest_props {
            result.push_str(&format!(
                "{}const $$sanitized_props = $.sanitize_props($$props);\n",
                indent
            ));
        }

        // If uses_rest_props, add $$restProps
        if analysis.uses_rest_props {
            // Collect named props to exclude from rest props
            let mut named_props: Vec<String> = Vec::new();

            // Add exports (using alias if available)
            for export in &analysis.exports {
                let name = export.alias.as_ref().unwrap_or(&export.name);
                named_props.push(name.clone());
            }

            // Add bindable props from bindings
            for binding in &analysis.root.bindings {
                if binding.kind == BindingKind::BindableProp {
                    let name = binding.prop_alias.as_ref().unwrap_or(&binding.name);
                    if !named_props.contains(name) {
                        named_props.push(name.clone());
                    }
                }
            }

            // Generate: const $$restProps = $.rest_props($$sanitized_props, ['prop1', 'prop2']);
            let props_array = named_props
                .iter()
                .map(|p| format!("'{}'", p))
                .collect::<Vec<_>>()
                .join(", ");
            result.push_str(&format!(
                "{}const $$restProps = $.rest_props($$sanitized_props, [{}]);\n",
                indent, props_array
            ));
        }

        result
    }

    /// Build the $.bind_props() call if there are bindable props or exports.
    /// This propagates values of bound props upwards if they're undefined in the parent and have a value.
    fn build_bind_props(&self, indent_level: usize) -> String {
        let analysis = match self.analysis {
            Some(a) => a,
            None => return String::new(),
        };

        let indent = "\t".repeat(indent_level);
        let mut props: Vec<String> = Vec::new();

        // Collect bindable props from the instance scope
        // binding.kind === 'bindable_prop' && !name.startsWith('$$')
        for binding in &analysis.root.bindings {
            if binding.kind == BindingKind::BindableProp && !binding.name.starts_with("$$") {
                // Use prop_alias if available, otherwise use name
                // b.init(binding.prop_alias ?? name, b.id(name))
                let prop_entry = if let Some(ref alias) = binding.prop_alias {
                    if alias != &binding.name {
                        format!("{}: {}", alias, binding.name)
                    } else {
                        binding.name.clone()
                    }
                } else {
                    binding.name.clone()
                };
                props.push(prop_entry);
            }
        }

        // Collect exports
        // for (const { name, alias } of analysis.exports)
        for export in &analysis.exports {
            let prop_entry = if let Some(ref alias) = export.alias {
                if alias != &export.name {
                    format!("{}: {}", alias, export.name)
                } else {
                    export.name.clone()
                }
            } else {
                export.name.clone()
            };
            props.push(prop_entry);
        }

        if props.is_empty() {
            return String::new();
        }

        // Generate: $.bind_props($$props, { name1, name2, ... });
        format!(
            "{}$.bind_props($$props, {{ {} }});\n",
            indent,
            props.join(", ")
        )
    }
}

/// Detect if script uses patterns that require $$renderer.component() wrapper with $$slots/$$events exclusion.
///
/// This detects two cases:
/// 1. `let props = $props()` - simple identifier assignment (needs `let { $$slots, $$events, ...props } = $$props`)
/// 2. `let { ...rest } = $props()` or `let { x, ...rest } = $props()` - ObjectPattern with RestElement
///
/// In both cases, we need to wrap in $$renderer.component() and inject $$slots, $$events exclusion.
fn detect_props_spread_pattern(script: &str) -> bool {
    for line in script.lines() {
        let trimmed = line.trim();
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && trimmed.contains("= $props()")
        {
            // Find the assignment `= $props()` part
            if let Some(props_idx) = trimmed.find("= $props()") {
                let left = &trimmed[..props_idx].trim();
                let pattern = left
                    .strip_prefix("let ")
                    .or_else(|| left.strip_prefix("const "))
                    .map(|s| s.trim())
                    .unwrap_or(left);

                // Case 1: Simple identifier (let props = $props())
                if !pattern.contains('{') && !pattern.contains('[') {
                    return true;
                }

                // Case 2: ObjectPattern with RestElement (let { ...rest } = $props())
                if pattern.starts_with('{') && pattern.contains("...") {
                    return true;
                }
            }
        }
    }
    false
}

/// Check if the script calls any imported function.
/// This triggers needs_context in the Svelte compiler.
/// NOTE: Currently disabled due to false positives. Needs AST-based approach.
#[allow(dead_code)]
fn check_calls_imported_function(script: &str, imports: &[String]) -> bool {
    // Extract imported identifiers from import statements
    let mut imported_names: Vec<String> = Vec::new();

    for import_line in imports {
        // Parse import { foo, bar } from 'module'
        // or import foo from 'module'
        // or import * as foo from 'module'

        let trimmed = import_line.trim();

        // Handle: import { foo, bar as baz } from 'module'
        if let Some(start) = trimmed.find('{') {
            if let Some(end) = trimmed.find('}') {
                let names_part = &trimmed[start + 1..end];
                for name in names_part.split(',') {
                    let name = name.trim();
                    // Handle "foo as bar" -> use "bar"
                    if let Some(as_idx) = name.find(" as ") {
                        imported_names.push(name[as_idx + 4..].trim().to_string());
                    } else {
                        imported_names.push(name.to_string());
                    }
                }
            }
        }
        // Handle: import foo from 'module'
        else if trimmed.starts_with("import ") && !trimmed.contains('*') {
            // Extract default import name
            let rest = &trimmed[7..]; // After "import "
            if let Some(from_idx) = rest.find(" from ") {
                let name = rest[..from_idx].trim();
                if !name.is_empty() && !name.starts_with('{') {
                    imported_names.push(name.to_string());
                }
            }
        }
        // Handle: import * as foo from 'module'
        else if let Some(star_idx) = trimmed.find("* as ") {
            let rest = &trimmed[star_idx + 5..];
            if let Some(from_idx) = rest.find(" from ") {
                let name = rest[..from_idx].trim();
                if !name.is_empty() {
                    imported_names.push(name.to_string());
                }
            }
        }
    }

    // Check if any imported name is called in the script
    for name in &imported_names {
        // Look for patterns like "name(" which indicate a function call
        let call_pattern = format!("{}(", name);
        if script.contains(&call_pattern) {
            return true;
        }
        // Also check for method calls like "name.method("
        let method_pattern = format!("{}.", name);
        if script.contains(&method_pattern) {
            return true;
        }
    }

    false
}

/// Check if the script uses the `new` operator.
/// This triggers needs_context in the Svelte compiler.
/// NOTE: Currently disabled due to false positives. Needs AST-based approach.
#[allow(dead_code)]
fn check_uses_new_operator(script: &str) -> bool {
    // Look for "new " followed by an identifier
    // Be careful not to match inside strings or comments
    let mut in_string = false;
    let mut string_char = ' ';
    let mut in_line_comment = false;
    let mut in_block_comment = false;
    let mut prev_char = ' ';

    let script_bytes = script.as_bytes();
    let len = script_bytes.len();
    let mut i = 0;

    while i < len {
        let c = script_bytes[i] as char;

        // Handle comments
        if !in_string {
            if !in_block_comment && c == '/' && i + 1 < len && script_bytes[i + 1] == b'/' {
                in_line_comment = true;
                i += 2;
                continue;
            }
            if !in_line_comment && c == '/' && i + 1 < len && script_bytes[i + 1] == b'*' {
                in_block_comment = true;
                i += 2;
                continue;
            }
            if in_line_comment && c == '\n' {
                in_line_comment = false;
                i += 1;
                continue;
            }
            if in_block_comment && c == '*' && i + 1 < len && script_bytes[i + 1] == b'/' {
                in_block_comment = false;
                i += 2;
                continue;
            }
        }

        if in_line_comment || in_block_comment {
            i += 1;
            continue;
        }

        // Handle strings
        if (c == '"' || c == '\'' || c == '`') && prev_char != '\\' {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            prev_char = c;
            i += 1;
            continue;
        }

        // Look for "new " pattern
        if i + 4 <= len && &script[i..i + 4] == "new " {
            // Check that this is not part of a larger identifier
            // (preceded by a non-identifier character)
            let before_ok = i == 0 || !is_identifier_char(script_bytes[i - 1] as char);
            if before_ok {
                return true;
            }
        }

        prev_char = c;
        i += 1;
    }

    false
}

/// Check if a character is valid in an identifier.
#[allow(dead_code)]
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Transform script code to use proper destructuring for props spread pattern.
///
/// Handles two cases:
/// 1. `let props = $$props` -> `let { $$slots, $$events, ...props } = $$props`
/// 2. `let { ...rest } = $$props` -> `let { $$slots, $$events, ...rest } = $$props`
/// 3. `let { x, y, ...rest } = $$props` -> `let { $$slots, $$events, x, y, ...rest } = $$props`
fn transform_props_spread(script: &str) -> String {
    let mut result = String::new();

    for line in script.lines() {
        let trimmed = line.trim();

        // Only transform direct $$props assignments (not property access like $$props['x'])
        // We check for "= $$props" followed by end of line, semicolon, or nothing
        // NOT followed by "[" which would indicate property access
        if (trimmed.starts_with("let ") || trimmed.starts_with("const "))
            && (trimmed.ends_with("= $$props")
                || trimmed.ends_with("= $$props;")
                || trimmed.contains("= $$props "))
        {
            // Find the assignment `= $$props` part (not default value `=`)
            if let Some(props_idx) = trimmed.find("= $$props") {
                let left = trimmed[..props_idx].trim();
                let pattern = if let Some(stripped) = left.strip_prefix("let ") {
                    stripped.trim()
                } else if let Some(stripped) = left.strip_prefix("const ") {
                    stripped.trim()
                } else {
                    left
                };

                // Case 1: Simple identifier (let props = $$props)
                if !pattern.starts_with('{') {
                    result.push_str(&format!(
                        "\t\tlet {{ $$slots, $$events, ...{} }} = $$props;\n",
                        pattern
                    ));
                    continue;
                }

                // Case 2 & 3: ObjectPattern with RestElement
                // Parse the pattern: { x, y, ...rest } or { ...rest }
                if pattern.starts_with('{') && pattern.ends_with('}') {
                    let inner = &pattern[1..pattern.len() - 1].trim();

                    // Check if there's a rest element
                    if let Some(rest_idx) = inner.find("...") {
                        // Extract the rest element name
                        let rest_part = &inner[rest_idx..];
                        let rest_name = rest_part.trim_start_matches("...").trim();

                        // Extract other properties (before the rest element)
                        let other_props = inner[..rest_idx].trim().trim_end_matches(',').trim();

                        // Preserve const vs let from original
                        let decl_keyword = if trimmed.starts_with("const ") {
                            "const"
                        } else {
                            "let"
                        };

                        if other_props.is_empty() {
                            // Case 2: Only rest element: { ...rest }
                            // Output: { $$slots, $$events, ...rest }
                            result.push_str(&format!(
                                "\t\t{} {{ $$slots, $$events, ...{} }} = $$props;\n",
                                decl_keyword, rest_name
                            ));
                        } else {
                            // Case 3: Props with rest element: { x, y, ...rest }
                            // JS implementation inserts $$slots, $$events BEFORE the rest element
                            // Output: { x, y, $$slots, $$events, ...rest }
                            result.push_str(&format!(
                                "\t\t{} {{ {}, $$slots, $$events, ...{} }} = $$props;\n",
                                decl_keyword, other_props, rest_name
                            ));
                        }
                        continue;
                    }
                }

                // Fallback: keep original line
                result.push_str(&format!("\t\t{}\n", trimmed));
                continue;
            }
        }

        if !trimmed.is_empty() {
            result.push_str(&format!("\t\t{}\n", trimmed));
        }
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Extract constant variable bindings from script content.
/// Extracts `const` declarations always, and `let` declarations only if they're
/// not exported and never reassigned in the full source.
fn extract_constant_vars(script: &str, full_source: &str) -> FxHashMap<String, String> {
    let mut constants = FxHashMap::default();
    let mut let_vars: Vec<String> = Vec::new();

    for line in script.lines() {
        let trimmed = line.trim();

        if trimmed.contains("$state") || trimmed.contains("$derived") || trimmed.contains("$props")
        {
            continue;
        }

        // Strip leading 'export' keyword if present
        let is_export = trimmed.starts_with("export ");
        let trimmed = if let Some(rest) = trimmed.strip_prefix("export ") {
            rest.trim_start()
        } else {
            trimmed
        };

        let (decl_start, is_const) = if trimmed.starts_with("const ") {
            (Some(6), true)
        } else if !is_export && trimmed.starts_with("let ") {
            (Some(4), false)
        } else {
            (None, false)
        };

        if let Some(start) = decl_start {
            let rest = &trimmed[start..];
            if let Some(eq_idx) = rest.find('=') {
                let name = rest[..eq_idx].trim();
                let value = rest[eq_idx + 1..].trim().trim_end_matches(';');

                // Handle string literals (single quotes, double quotes, and template literals)
                if (value.starts_with('\'') && value.ends_with('\''))
                    || (value.starts_with('"') && value.ends_with('"'))
                    || (value.starts_with('`') && value.ends_with('`') && !value.contains("${"))
                {
                    let content = &value[1..value.len() - 1];
                    constants.insert(name.to_string(), content.to_string());
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                } else if let Ok(n) = value.parse::<i64>() {
                    // Integer literals
                    constants.insert(name.to_string(), n.to_string());
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                } else if let Ok(n) = value.parse::<f64>()
                    && n.is_finite()
                {
                    // Float literals (not NaN/Infinity)
                    constants.insert(name.to_string(), n.to_string());
                    if !is_const {
                        let_vars.push(name.to_string());
                    }
                }
            }
        }
    }

    // Remove let variables that are reassigned in the full source (script + template)
    // Check for patterns like `name = `, `name +=`, `name++`, `bind:name`, etc.
    for var_name in &let_vars {
        // Check for bind:varname directive which makes the variable mutable
        let bind_pattern = format!("bind:{}", var_name);
        if full_source.contains(&bind_pattern) {
            constants.remove(var_name);
            continue;
        }

        let is_reassigned = full_source.lines().any(|line| {
            let trimmed = line.trim();
            // Skip the declaration line itself
            if trimmed.starts_with("let ")
                || trimmed.starts_with("const ")
                || trimmed.starts_with("export let ")
                || trimmed.starts_with("export const ")
            {
                return false;
            }
            // Check for assignment patterns: `varName = ...`, `varName += ...`, etc.
            // Search for the variable name in the line, ensuring it's a standalone identifier
            // (preceded by a non-word char or start of line, followed by assignment operator)
            let mut search_start = 0;
            while let Some(pos) = trimmed[search_start..].find(var_name.as_str()) {
                let abs_pos = search_start + pos;
                let after_pos = abs_pos + var_name.len();

                // Check that the character before is not a word character (or is start of line)
                let before_ok = abs_pos == 0 || {
                    let c = trimmed.as_bytes()[abs_pos - 1];
                    !c.is_ascii_alphanumeric() && c != b'_' && c != b'$'
                };

                // Check that the character after is not a word character
                let after_char_ok = after_pos >= trimmed.len() || {
                    let c = trimmed.as_bytes()[after_pos];
                    !c.is_ascii_alphanumeric() && c != b'_' && c != b'$'
                };

                if before_ok && after_char_ok && after_pos < trimmed.len() {
                    let rest = trimmed[after_pos..].trim_start();
                    // Assignment operators (but not == or =>)
                    if (rest.starts_with('=') && !rest.starts_with("==") && !rest.starts_with("=>"))
                        || rest.starts_with("+=")
                        || rest.starts_with("-=")
                        || rest.starts_with("*=")
                        || rest.starts_with("/=")
                    {
                        return true;
                    }
                    // Pre/post increment/decrement
                    if rest.starts_with("++") || rest.starts_with("--") {
                        return true;
                    }
                }

                search_start = abs_pos + 1;
                if search_start >= trimmed.len() {
                    break;
                }
            }
            false
        });

        if is_reassigned {
            constants.remove(var_name);
        }
    }

    constants
}

/// Result of constant folding.
enum ConstantFoldResult {
    Null,
    Constant(String),
    Dynamic,
}

/// Full constant folding with result type.
fn try_constant_fold_full(expr: &str) -> ConstantFoldResult {
    let trimmed = expr.trim();

    if trimmed == "null" || trimmed == "undefined" {
        return ConstantFoldResult::Null;
    }

    if let Ok(n) = trimmed.parse::<i64>() {
        return ConstantFoldResult::Constant(n.to_string());
    }
    if let Ok(n) = trimmed.parse::<f64>() {
        // Don't fold NaN or Infinity - they're global variables, not constants
        if n.is_finite() {
            return ConstantFoldResult::Constant(n.to_string());
        }
    }

    if (trimmed.starts_with('\'') && trimmed.ends_with('\''))
        || (trimmed.starts_with('"') && trimmed.ends_with('"'))
    {
        let content = &trimmed[1..trimmed.len() - 1];
        return ConstantFoldResult::Constant(content.to_string());
    }

    if let Some(idx) = trimmed.find("??") {
        let left = trimmed[..idx].trim();
        let right = trimmed[idx + 2..].trim();

        match try_constant_fold_full(left) {
            ConstantFoldResult::Null => {
                return try_constant_fold_full(right);
            }
            ConstantFoldResult::Constant(val) => {
                return ConstantFoldResult::Constant(val);
            }
            ConstantFoldResult::Dynamic => {}
        }
    }

    if trimmed.starts_with("Math.")
        && let Some(result) = eval_math_expr(trimmed)
    {
        return ConstantFoldResult::Constant(result);
    }

    ConstantFoldResult::Dynamic
}

fn eval_math_expr(expr: &str) -> Option<String> {
    if expr.starts_with("Math.max(") && expr.ends_with(')') {
        let inner = &expr[9..expr.len() - 1];
        return eval_math_max_min(inner);
    }
    if expr.starts_with("Math.min(") && expr.ends_with(')') {
        let inner = &expr[9..expr.len() - 1];
        return eval_math_max_min_op(inner, false);
    }
    None
}

fn eval_math_max_min(args: &str) -> Option<String> {
    let parts = split_args(args);
    if parts.len() != 2 {
        return None;
    }

    let a = parse_numeric_expr(&parts[0])?;
    let b = parse_numeric_expr(&parts[1])?;

    Some(a.max(b).to_string())
}

fn eval_math_max_min_op(args: &str, is_max: bool) -> Option<String> {
    let parts = split_args(args);
    if parts.len() != 2 {
        return None;
    }

    let a = parse_numeric_expr(&parts[0])?;
    let b = parse_numeric_expr(&parts[1])?;

    let result = if is_max { a.max(b) } else { a.min(b) };
    Some(result.to_string())
}

fn split_args(s: &str) -> Vec<String> {
    let mut parts = Vec::new();
    let mut current = String::new();
    let mut depth = 0;

    for c in s.chars() {
        match c {
            '(' => {
                depth += 1;
                current.push(c);
            }
            ')' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                parts.push(current.trim().to_string());
                current = String::new();
            }
            _ => current.push(c),
        }
    }
    if !current.is_empty() {
        parts.push(current.trim().to_string());
    }
    parts
}

fn parse_numeric_expr(s: &str) -> Option<i64> {
    let trimmed = s.trim();

    if let Ok(n) = trimmed.parse::<i64>() {
        return Some(n);
    }

    if trimmed.starts_with("Math.min(") && trimmed.ends_with(')') {
        let inner = &trimmed[9..trimmed.len() - 1];
        let parts = split_args(inner);
        if parts.len() == 2 {
            let a = parse_numeric_expr(&parts[0])?;
            let b = parse_numeric_expr(&parts[1])?;
            return Some(a.min(b));
        }
    }
    if trimmed.starts_with("Math.max(") && trimmed.ends_with(')') {
        let inner = &trimmed[9..trimmed.len() - 1];
        let parts = split_args(inner);
        if parts.len() == 2 {
            let a = parse_numeric_expr(&parts[0])?;
            let b = parse_numeric_expr(&parts[1])?;
            return Some(a.max(b));
        }
    }

    None
}

/// Extract import statements from script content.
/// If `strip_exports` is true, also strips `export { ... }` statements.
/// This should be true for instance scripts (where exports are handled via $.bind_props),
/// but false for module scripts (where exports should be emitted directly).
fn extract_imports_with_options(script: &str, strip_exports: bool) -> (Vec<String>, String) {
    let mut imports = Vec::new();
    let mut rest = String::new();

    for line in script.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("import ") || trimmed.starts_with("import{") {
            imports.push(trimmed.to_string());
        } else {
            rest.push_str(line);
            rest.push('\n');
        }
    }

    if rest.ends_with('\n') {
        rest.pop();
    }

    // Strip export statements without declarations (e.g., `export { name }`)
    // These should be removed for instance scripts (handled via $.bind_props)
    // but kept for module scripts (emitted directly)
    if strip_exports {
        let rest = strip_export_specifiers(&rest);
        (imports, rest)
    } else {
        (imports, rest)
    }
}

/// Extract import statements from script content (instance script version).
/// Strips `export { ... }` statements as they're handled via $.bind_props.
fn extract_imports(script: &str) -> (Vec<String>, String) {
    extract_imports_with_options(script, true)
}

/// Extract import statements from module script content.
/// Keeps `export { ... }` statements as they should be emitted directly.
fn extract_imports_module(script: &str) -> (Vec<String>, String) {
    extract_imports_with_options(script, false)
}

/// Strip `export { ... }` statements (exports without declarations) from script content.
/// These are handled by the compiler via analysis.exports and should not appear in the output.
///
/// Handles:
/// - Single-line: `export { name }`
/// - Multi-line: `export {\n  name\n}`
/// - With aliases: `export { name as alias }`
fn strip_export_specifiers(script: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let len = chars.len();
    let mut i = 0;

    while i < len {
        // Look for "export" keyword
        if i + 6 <= len {
            let potential: String = chars[i..i + 6].iter().collect();
            if potential == "export" {
                // Check if this is followed by whitespace/newline and then `{`
                // (not `export let`, `export const`, `export function`, etc.)
                let mut j = i + 6;

                // Skip whitespace
                while j < len && (chars[j] == ' ' || chars[j] == '\t' || chars[j] == '\n') {
                    j += 1;
                }

                if j < len && chars[j] == '{' {
                    // This is `export { ... }` - find the closing brace
                    let mut depth = 1;
                    let start = j + 1;
                    let mut end = start;

                    while end < len && depth > 0 {
                        match chars[end] {
                            '{' => depth += 1,
                            '}' => depth -= 1,
                            _ => {}
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }

                    // Skip past the closing brace and any trailing whitespace/newline
                    if end < len {
                        end += 1; // skip '}'
                    }

                    // Skip trailing whitespace and newline
                    while end < len && (chars[end] == ' ' || chars[end] == '\t') {
                        end += 1;
                    }
                    if end < len && chars[end] == '\n' {
                        end += 1;
                    }

                    // Skip this entire export block
                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Strip `export` keyword from function/const/class declarations.
/// In Svelte components, `export function foo()` is used to export a prop,
/// but in server-side output, the function should be a regular declaration.
/// The exported names are handled by `$.bind_props()` instead.
fn strip_export_from_declarations(script: &str) -> String {
    let mut result = String::new();
    for line in script.lines() {
        let trimmed = line.trim();
        // Strip "export " from function declarations
        if trimmed.starts_with("export function ")
            || trimmed.starts_with("export async function ")
            || trimmed.starts_with("export const ")
            || trimmed.starts_with("export class ")
        {
            // Preserve leading whitespace
            let indent = &line[..line.len() - trimmed.len()];
            let rest = trimmed.strip_prefix("export ").unwrap_or(trimmed);
            result.push_str(indent);
            result.push_str(rest);
        } else {
            result.push_str(line);
        }
        result.push('\n');
    }
    if result.ends_with('\n') && !script.ends_with('\n') {
        result.pop();
    }
    result
}

/// Transform script content for server-side rendering.
/// If `is_module` is true, export keywords are preserved (module-level exports are real ES exports).
fn transform_script_content(script: &str) -> String {
    transform_script_content_inner(script, false)
}

fn transform_script_content_module(script: &str) -> String {
    transform_script_content_inner(script, true)
}

fn transform_script_content_inner(script: &str, is_module: bool) -> String {
    let script = script.replace("$props()", "$$props");
    // Transform $state.eager(x) to just x on server (no reactivity needed)
    let script = transform_rune_call_multiline(&script, "$state.eager(");
    // Transform $effect.pending() - always false on server (effects don't run on server)
    let script = script.replace("$effect.pending()", "false");
    // Transform $effect.tracking() - always false on server (effects don't run on server)
    let script = script.replace("$effect.tracking()", "false");
    // Transform $props.id() to $.props_id($$renderer) on server
    let script = script.replace("$props.id()", "$.props_id($$renderer)");
    // Note: Order matters - check $state.raw before $state to avoid partial matches
    // $state.snapshot(x) in assignment context (= $state.snapshot(x)) -> unwrap to just x
    // $state.snapshot(x) in non-assignment context -> $.snapshot(x) (runtime call)
    let script = transform_state_snapshot_server(&script);
    let script = transform_rune_call_multiline(&script, "$state.raw(");
    // Transform array destructuring with $state() BEFORE generic $state() handling
    let script = transform_array_destructure_state(&script);
    let script = transform_rune_call_multiline(&script, "$state(");
    let script = transform_rune_call_multiline(&script, "$derived.by(");
    let script = transform_rune_call_multiline(&script, "$derived(");
    // Transform store assignments: $count += 1 → $.store_set(count, ... + 1)
    let script = transform_store_assignments(&script);
    // Transform export let declarations for legacy/non-runes mode
    // This must be done before other transformations to properly handle props.
    // Module-level `export let` are real ES exports, not component props,
    // so they should NOT be transformed to $.fallback($$props[...]).
    let script = if is_module {
        script
    } else {
        transform_export_let_declarations(&script)
    };
    // Strip `export` keyword from function/const/class declarations
    // In Svelte, `export function foo()` inside <script> means "export the prop",
    // but in server output the function should be a regular declaration inside the component.
    // Module-level exports are real ES exports and should be preserved.
    let script = if is_module {
        script
    } else {
        strip_export_from_declarations(&script)
    };

    let mut result = String::new();
    let lines: Vec<&str> = script.lines().collect();

    for line in lines {
        let trimmed = line.trim();

        if result.is_empty() && trimmed.is_empty() {
            continue;
        }

        let line = format_js_line(line);
        let line = add_statement_semicolon(&line);

        if line.starts_with('\t') {
            result.push_str(&line);
        } else if trimmed.is_empty() {
            // Empty line
        } else {
            result.push('\t');
            result.push_str(trimmed);
        }
        result.push('\n');
    }

    if result.ends_with('\n') {
        result.pop();
    }

    result
}

fn format_js_line(line: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = line.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        if c == '=' {
            let next = chars.get(i + 1).copied();
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };

            if next == Some('=')
                || next == Some('>')
                || prev == Some('=')
                || prev == Some('!')
                || prev == Some('<')
                || prev == Some('>')
                || prev == Some('+')
                || prev == Some('-')
                || prev == Some('*')
                || prev == Some('/')
                || prev == Some('%')
                || prev == Some('&')
                || prev == Some('|')
                || prev == Some('^')
                || prev == Some('?')
            // Handle ??= operator
            {
                result.push(c);
            } else {
                if prev != Some(' ') {
                    result.push(' ');
                }
                result.push(c);
                if next != Some(' ') && next.is_some() {
                    result.push(' ');
                }
            }
            i += 1;
            continue;
        }

        if c == '{' {
            let prev = if !result.is_empty() {
                result.chars().last()
            } else {
                None
            };
            if prev == Some(')') {
                result.push(' ');
            }
            result.push(c);
            i += 1;
            continue;
        }

        result.push(c);
        i += 1;
    }

    result
}

/// Transform array destructuring with $state() in server-side rendering.
/// Transforms `let [a, b] = $state([x, y])` to:
/// `let tmp = [x, y], $$array = $.to_array(tmp, 2), a = $$array[0], b = $$array[1]`
fn transform_array_destructure_state(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    // Match patterns like: let [a, b, ...] = $state(expr)
    // The pattern captures: the array pattern and the value inside $state()
    static ARRAY_DESTRUCT_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"(?m)^(\s*)(let|const)\s+\[([^\]]+)\]\s*=\s*\$state\(").unwrap()
    });

    let mut result = script.to_string();
    let mut offset = 0;

    for cap in ARRAY_DESTRUCT_RE.captures_iter(script) {
        let full_match = cap.get(0).unwrap();
        let indent = cap.get(1).unwrap().as_str();
        let _keyword = cap.get(2).unwrap().as_str(); // let or const
        let array_pattern = cap.get(3).unwrap().as_str();

        // Find the closing parenthesis of $state()
        let start_pos = full_match.end();
        let remaining = &script[start_pos..];
        if let Some(paren_end) = find_matching_paren_for_state(remaining) {
            // Extract the value inside $state()
            let value = &remaining[..paren_end].trim();

            // Parse the array pattern to get variable names and detect rest element
            let (vars, has_rest) = parse_array_pattern(array_pattern);

            // Build the transformed code
            let mut transformed = format!("{}let tmp = {},\n", indent, value);

            // Only add count argument if no rest element
            if has_rest {
                transformed.push_str(&format!("{}\t$$array = $.to_array(tmp)", indent));
            } else {
                transformed.push_str(&format!(
                    "{}\t$$array = $.to_array(tmp, {})",
                    indent,
                    vars.len()
                ));
            }

            // Add variable declarations
            for (i, var) in vars.iter().enumerate() {
                let var = var.trim();
                if var.starts_with("...") {
                    // Rest element: ...rest = $$array.slice(i)
                    let rest_name = var.trim_start_matches("...");
                    transformed.push_str(&format!(
                        ",\n{}\t{} = $$array.slice({})",
                        indent, rest_name, i
                    ));
                } else if var.contains('=') {
                    // Default value: name = default
                    // For simplicity, just use $$array[i] ?? default
                    let parts: Vec<&str> = var.splitn(2, '=').collect();
                    let name = parts[0].trim();
                    let default = parts.get(1).map(|s| s.trim()).unwrap_or("void 0");
                    transformed.push_str(&format!(
                        ",\n{}\t{} = $$array[{}] ?? {}",
                        indent, name, i, default
                    ));
                } else {
                    // Simple variable
                    transformed.push_str(&format!(",\n{}\t{} = $$array[{}]", indent, var, i));
                }
            }

            // Replace in result, accounting for offset changes
            let match_start = full_match.start() + offset;
            let match_end = start_pos + paren_end + offset;
            result = format!(
                "{}{}{}",
                &result[..match_start],
                transformed,
                &result[match_end + 1..] // +1 to skip the closing paren
            );

            // Update offset for next replacement
            let old_len = full_match.len() + paren_end + 1;
            let new_len = transformed.len();
            offset = offset + new_len - old_len;
        }
    }

    result
}

/// Parse an array pattern like "a, b, ...rest" into a list of variable names
/// Returns (variables, has_rest_element)
fn parse_array_pattern(pattern: &str) -> (Vec<&str>, bool) {
    let mut vars = Vec::new();
    let mut has_rest = false;
    let mut depth = 0;
    let mut start = 0;

    for (i, c) in pattern.char_indices() {
        match c {
            '[' | '(' | '{' => depth += 1,
            ']' | ')' | '}' => depth -= 1,
            ',' if depth == 0 => {
                let var = pattern[start..i].trim();
                if !var.is_empty() {
                    if var.starts_with("...") {
                        has_rest = true;
                    }
                    vars.push(var);
                }
                start = i + 1;
            }
            _ => {}
        }
    }

    // Don't forget the last element
    let var = pattern[start..].trim();
    if !var.is_empty() {
        if var.starts_with("...") {
            has_rest = true;
        }
        vars.push(var);
    }

    (vars, has_rest)
}

/// Find the matching closing parenthesis for $state(
/// Returns the index of ')' relative to the start of the input
fn find_matching_paren_for_state(s: &str) -> Option<usize> {
    let mut depth = 1;
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, c) in s.char_indices() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || s.as_bytes()[i - 1] != b'\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Simple rune call transformation for template expressions.
/// Transforms `$state.eager(x)` to `x` by finding matching closing paren.
/// Transform $state.snapshot() in server script content.
/// In assignment context (= $state.snapshot(x)), unwrap to just x.
/// In non-assignment context (standalone or expression), replace with $.snapshot(x).
fn transform_state_snapshot_server(script: &str) -> String {
    let prefix = "$state.snapshot(";
    let mut result = script.to_string();
    let mut search_from = 0;

    while let Some(pos) = result[search_from..].find(prefix) {
        let abs_pos = search_from + pos;
        let after_prefix = abs_pos + prefix.len();

        // Find matching closing paren
        if let Some(content_end) = find_matching_paren_for_state(&result[after_prefix..]) {
            let content = result[after_prefix..after_prefix + content_end].to_string();

            // Check if this is in assignment context: look backward for '='
            let before = result[..abs_pos].trim_end();
            let is_assignment = before.ends_with('=') && !before.ends_with("==");

            if is_assignment {
                // Unwrap: = $state.snapshot(x) -> = x
                let end = after_prefix + content_end + 1; // +1 for closing paren
                result = format!("{}{}{}", &result[..abs_pos], content, &result[end..]);
                search_from = abs_pos + content.len();
            } else {
                // Replace prefix: $state.snapshot( -> $.snapshot(
                result = format!(
                    "{}$.snapshot({}",
                    &result[..abs_pos],
                    &result[after_prefix..]
                );
                search_from = abs_pos + "$.snapshot(".len();
            }
        } else {
            search_from = abs_pos + prefix.len();
        }
    }

    result
}

fn transform_rune_call_simple(expr: &str, prefix: &str) -> String {
    let mut result = String::new();
    let mut i = 0;
    let bytes = expr.as_bytes();
    let prefix_bytes = prefix.as_bytes();
    let prefix_len = prefix_bytes.len();

    while i < bytes.len() {
        if i + prefix_len <= bytes.len() && &bytes[i..i + prefix_len] == prefix_bytes {
            // Found the prefix, find matching closing paren
            let start = i + prefix_len;
            let mut depth = 1;
            let mut end = start;
            while end < bytes.len() && depth > 0 {
                match bytes[end] {
                    b'(' => depth += 1,
                    b')' => depth -= 1,
                    b'\'' | b'"' | b'`' => {
                        let quote = bytes[end];
                        end += 1;
                        while end < bytes.len() && bytes[end] != quote {
                            if bytes[end] == b'\\' {
                                end += 1;
                            }
                            end += 1;
                        }
                    }
                    _ => {}
                }
                if depth > 0 {
                    end += 1;
                }
            }
            // Extract inner content (the argument)
            result.push_str(&expr[start..end]);
            i = end + 1; // skip past closing paren
        } else {
            result.push(expr.as_bytes()[i] as char);
            i += 1;
        }
    }
    result
}

fn transform_rune_call_multiline(script: &str, prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    // Check if this is $derived.by - needs special handling (IIFE)
    let is_derived_by = prefix == "$derived.by(";

    while i < chars.len() {
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == prefix {
                let mut depth = 1;
                let start = i + prefix_len;
                let mut end = start;
                let mut in_string = false;
                let mut string_char = ' ';

                while end < chars.len() && depth > 0 {
                    let c = chars[end];

                    if (c == '"' || c == '\'' || c == '`') && (end == 0 || chars[end - 1] != '\\') {
                        if !in_string {
                            in_string = true;
                            string_char = c;
                        } else if c == string_char {
                            in_string = false;
                        }
                    }

                    if !in_string {
                        match c {
                            '(' => depth += 1,
                            ')' => depth -= 1,
                            _ => {}
                        }
                    }
                    if depth > 0 {
                        end += 1;
                    }
                }

                let inner: String = chars[start..end].iter().collect();
                let trimmed_inner = inner.trim();

                if trimmed_inner.is_empty() {
                    // $state() with no arguments -> void 0
                    result.push_str("void 0");
                } else if is_derived_by {
                    // $derived.by(fn) -> (fn)() - wrap in IIFE to call the function
                    result.push('(');
                    result.push_str(&inner);
                    result.push_str(")()");
                } else {
                    result.push_str(&inner);
                }

                i = end + 1;
                continue;
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

fn add_statement_semicolon(line: &str) -> String {
    let trimmed = line.trim();

    if trimmed.is_empty() {
        return line.to_string();
    }

    if trimmed.ends_with(';')
        || trimmed.ends_with('{')
        || trimmed.ends_with('}')
        || trimmed.ends_with(',')
    {
        return line.to_string();
    }

    if (trimmed.starts_with("const ") || trimmed.starts_with("let ") || trimmed.starts_with("var "))
        && trimmed.ends_with(')')
    {
        return format!("{};", line);
    }

    line.to_string()
}

/// Transform class fields with $derived runes for server-side.
/// Output order matches official Svelte compiler:
/// 1. Non-$derived fields ($state, etc.)
/// 2. $derived fields (private field + getter/setter)
/// 3. Methods
fn transform_class_fields_server(script: &str) -> String {
    // Check for $derived, $derived.by, $state, or $state.raw patterns in class
    if !script.contains("class ")
        || (!script.contains("$derived(")
            && !script.contains("$derived.by(")
            && !script.contains("$state(")
            && !script.contains("$state.raw("))
    {
        return script.to_string();
    }

    let Some(class_pos) = script.find("class ") else {
        return script.to_string();
    };

    let after_class = &script[class_pos..];
    let Some(brace_pos) = after_class.find('{') else {
        return script.to_string();
    };

    let class_header = &after_class[..brace_pos + 1];

    let class_body_start = class_pos + brace_pos + 1;
    let mut brace_depth = 1;
    let mut class_body_end = class_body_start;

    for (i, c) in script[class_body_start..].char_indices() {
        match c {
            '{' => brace_depth += 1,
            '}' => {
                brace_depth -= 1;
                if brace_depth == 0 {
                    class_body_end = class_body_start + i;
                    break;
                }
            }
            _ => {}
        }
    }

    let class_body = &script[class_body_start..class_body_end];

    #[derive(Debug)]
    struct DerivedField {
        name: String,
        is_private: bool,
        value: String,
        is_derived_by: bool,
    }

    let mut derived_fields: Vec<DerivedField> = Vec::new();
    let mut field_lines: Vec<String> = Vec::new(); // Non-$derived fields
    let mut method_lines: Vec<String> = Vec::new(); // Methods
    let mut constructor_lines: Vec<String> = Vec::new();
    let mut in_constructor = false;
    let mut constructor_depth = 0;
    let mut in_method = false;
    let mut method_depth = 0;
    let mut current_method: Vec<String> = Vec::new();
    let mut has_state_fields = false; // Track if we've transformed any $state fields

    for line in class_body.lines() {
        let trimmed = line.trim();

        // Handle constructor
        if trimmed.contains("constructor(") {
            in_constructor = true;
            constructor_lines.push(trimmed.to_string());
            if trimmed.contains('{') {
                constructor_depth = 1;
            }
            continue;
        }

        if in_constructor {
            constructor_lines.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => constructor_depth += 1,
                    '}' => {
                        constructor_depth -= 1;
                        if constructor_depth == 0 {
                            in_constructor = false;
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        // Handle methods (including getters and setters)
        if in_method {
            current_method.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => method_depth += 1,
                    '}' => {
                        method_depth -= 1;
                        if method_depth == 0 {
                            in_method = false;
                            method_lines.append(&mut current_method);
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        // Detect method start: name(...) { or get name() { or set name(...)
        let is_method_start = (trimmed.contains('(') && trimmed.contains('{'))
            && !trimmed.contains('=')
            && !trimmed.starts_with("//")
            && !trimmed.starts_with("/*");

        if is_method_start {
            in_method = true;
            method_depth = 0;
            current_method.clear();
            current_method.push(trimmed.to_string());
            for c in trimmed.chars() {
                match c {
                    '{' => method_depth += 1,
                    '}' => {
                        method_depth -= 1;
                        if method_depth == 0 {
                            in_method = false;
                            method_lines.append(&mut current_method);
                        }
                    }
                    _ => {}
                }
            }
            continue;
        }

        // Handle $derived and $derived.by fields
        let is_derived_field = trimmed.contains("= $derived(")
            || trimmed.contains("=$derived(")
            || trimmed.contains("= $derived.by(")
            || trimmed.contains("=$derived.by(");
        if is_derived_field {
            let is_private = trimmed.starts_with('#');
            if let Some(eq_pos) = trimmed.find('=') {
                let name = trimmed[..eq_pos].trim().trim_start_matches('#').to_string();

                // Try $derived.by first (more specific pattern), then $derived
                let (derived_pattern, is_derived_by) = if trimmed.contains("$derived.by(") {
                    ("$derived.by(", true)
                } else {
                    ("$derived(", false)
                };

                if let Some(derived_pos) = trimmed.find(derived_pattern) {
                    let value_start = derived_pos + derived_pattern.len();
                    let after_paren = &trimmed[value_start..];

                    if let Some(value_end) = find_matching_paren_server(after_paren) {
                        let value = after_paren[..value_end].to_string();
                        derived_fields.push(DerivedField {
                            name,
                            is_private,
                            value,
                            is_derived_by,
                        });
                        continue;
                    }
                }
            }
        }

        // Handle $state and $state.raw fields
        let is_state_field = trimmed.contains("= $state(")
            || trimmed.contains("=$state(")
            || trimmed.contains("= $state.raw(")
            || trimmed.contains("=$state.raw(");
        if is_state_field && let Some(eq_pos) = trimmed.find('=') {
            // Try $state.raw first (more specific), then $state
            let (state_pattern, state_pos) = if let Some(pos) = trimmed.find("$state.raw(") {
                ("$state.raw(", pos)
            } else if let Some(pos) = trimmed.find("$state(") {
                ("$state(", pos)
            } else {
                continue;
            };
            let field_name = trimmed[..eq_pos].trim();
            let value_start = state_pos + state_pattern.len();
            let after_paren = &trimmed[value_start..];

            if let Some(value_end) = find_matching_paren_server(after_paren) {
                let value = after_paren[..value_end].trim();
                has_state_fields = true;
                if value.is_empty() {
                    // $state() with no argument -> just field declaration
                    field_lines.push(format!("{};", field_name));
                } else {
                    // $state(value) -> field = value
                    field_lines.push(format!("{} = {};", field_name, value));
                }
                continue;
            }
        }

        // Non-$derived, non-$state fields (regular fields)
        if !trimmed.is_empty() {
            field_lines.push(trimmed.to_string());
        }
    }

    if derived_fields.is_empty() && !has_state_fields {
        return script.to_string();
    }

    let mut new_class_body = String::new();

    // 1. Output non-$derived fields first
    for line in &field_lines {
        new_class_body.push_str(&format!("\t\t{}\n", line));
    }

    // 2. Output $derived fields (private field + getter/setter)
    for field in &derived_fields {
        // Sanitize the name to ensure it's a valid identifier for the private field
        // This handles numeric property names like "0", "1" which would be invalid as #0, #1
        let sanitized_name = sanitize_identifier(&field.name);
        let private_name = format!("#{}", sanitized_name);

        // If the value starts with '{', wrap it in parentheses to avoid
        // it being interpreted as a block statement instead of an object literal
        let value_str = field.value.trim();
        let wrapped_value = if value_str.starts_with('{') {
            format!("({})", value_str)
        } else {
            value_str.to_string()
        };

        // For $derived.by, the value is already a function
        // For $derived, we wrap it in an arrow function
        if field.is_derived_by {
            new_class_body.push_str(&format!(
                "\t\t{} = $.derived({});\n",
                private_name, wrapped_value
            ));
        } else {
            new_class_body.push_str(&format!(
                "\t\t{} = $.derived(() => {});\n",
                private_name, wrapped_value
            ));
        }

        if !field.is_private {
            new_class_body.push('\n');
            new_class_body.push_str(&format!(
                "\t\tget {}() {{\n\t\t\treturn this.{}();\n\t\t}}\n",
                field.name, private_name
            ));
            new_class_body.push('\n');
            new_class_body.push_str(&format!(
                "\t\tset {}($$value) {{\n\t\t\treturn this.{}($$value);\n\t\t}}\n",
                field.name, private_name
            ));
        }
    }

    // 3. Output constructor if present (before methods)
    if !constructor_lines.is_empty() {
        new_class_body.push('\n');
        for line in &constructor_lines {
            new_class_body.push_str(&format!("\t\t{}\n", line));
        }
    }

    // 4. Output methods (after constructor)
    for line in &method_lines {
        new_class_body.push('\n');
        new_class_body.push_str(&format!("\t\t{}\n", line));
    }

    let before_class = &script[..class_pos];
    let after_class_body = &script[class_body_end + 1..];

    format!(
        "{}{}\n{}\t}}{}",
        before_class, class_header, new_class_body, after_class_body
    )
}

fn find_matching_paren_server(s: &str) -> Option<usize> {
    let mut depth = 1;
    for (i, c) in s.char_indices() {
        match c {
            '(' | '{' | '[' => depth += 1,
            ')' | '}' | ']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

/// Remove $effect, $effect.pre, $effect.root, $inspect, and $inspect.trace blocks from script.
/// These are client-side only runes and should not appear in SSR output.
fn remove_effect_blocks(script: &str) -> String {
    let mut result = script.to_string();

    // List of effect-related runes to remove (order matters - check longer patterns first)
    let effect_runes = [
        "$effect.root(",
        "$effect.pre(",
        "$effect(",
        "$inspect.trace(",
        "$inspect(",
    ];

    for rune in effect_runes {
        result = remove_rune_statement(&result, rune);
    }

    result
}

/// Remove a complete statement containing a rune call.
/// For example: `$effect(() => { ... });` becomes empty.
fn remove_rune_statement(script: &str, rune_prefix: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = script.chars().collect();
    let prefix_chars: Vec<char> = rune_prefix.chars().collect();
    let prefix_len = prefix_chars.len();
    let mut i = 0;

    while i < chars.len() {
        // Check if we're at the start of a rune call
        if i + prefix_len <= chars.len() {
            let potential: String = chars[i..i + prefix_len].iter().collect();
            if potential == rune_prefix {
                // Check if this is preceded only by whitespace/newlines on the current line
                // (i.e., it's a statement, not part of an expression)
                let is_statement = is_statement_start(&result);

                if !is_statement && rune_prefix == "$effect.root(" {
                    // $effect.root() used as an expression (e.g., `const cleanup = $effect.root(...)`)
                    // Replace with `() => {}` on server (effects don't run on server)
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];
                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
                            if !in_string {
                                in_string = true;
                                string_char = c;
                            } else if c == string_char {
                                in_string = false;
                            }
                        }
                        if !in_string {
                            match c {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }
                    // Skip past the closing paren
                    end += 1;

                    // Replace with () => {}
                    result.push_str("() => {}");
                    i = end;
                    continue;
                }

                if is_statement {
                    // Find the matching closing paren
                    let start = i + prefix_len;
                    let mut depth = 1;
                    let mut end = start;
                    let mut in_string = false;
                    let mut string_char = ' ';

                    while end < chars.len() && depth > 0 {
                        let c = chars[end];

                        // Handle string literals
                        if (c == '"' || c == '\'' || c == '`')
                            && (end == 0 || chars[end - 1] != '\\')
                        {
                            if !in_string {
                                in_string = true;
                                string_char = c;
                            } else if c == string_char {
                                in_string = false;
                            }
                        }

                        if !in_string {
                            match c {
                                '(' => depth += 1,
                                ')' => depth -= 1,
                                _ => {}
                            }
                        }
                        if depth > 0 {
                            end += 1;
                        }
                    }

                    // Skip past the closing paren
                    end += 1;

                    // Handle method chaining like $inspect(...).with(...)
                    // If followed by .with(, skip that too
                    if end + 5 <= chars.len() {
                        let potential_with: String = chars[end..end + 5].iter().collect();
                        if potential_with == ".with" {
                            end += 5; // Skip ".with"
                            // Skip optional whitespace but not newlines
                            while end < chars.len() && (chars[end] == ' ' || chars[end] == '\t') {
                                end += 1;
                            }
                            // If there's an opening paren, find matching close
                            if end < chars.len() && chars[end] == '(' {
                                end += 1;
                                let mut with_depth = 1;
                                let mut with_in_string = false;
                                let mut with_string_char = ' ';

                                while end < chars.len() && with_depth > 0 {
                                    let c = chars[end];
                                    if (c == '"' || c == '\'' || c == '`')
                                        && (end == 0 || chars[end - 1] != '\\')
                                    {
                                        if !with_in_string {
                                            with_in_string = true;
                                            with_string_char = c;
                                        } else if c == with_string_char {
                                            with_in_string = false;
                                        }
                                    }
                                    if !with_in_string {
                                        match c {
                                            '(' => with_depth += 1,
                                            ')' => with_depth -= 1,
                                            _ => {}
                                        }
                                    }
                                    if with_depth > 0 {
                                        end += 1;
                                    }
                                }
                                // Skip past the closing paren of .with()
                                end += 1;
                            }
                        }
                    }

                    // Skip optional semicolon and trailing whitespace on the same line
                    while end < chars.len() && (chars[end] == ';' || chars[end] == ' ') {
                        end += 1;
                    }

                    // Skip trailing newline if present
                    if end < chars.len() && chars[end] == '\n' {
                        end += 1;
                    }

                    // For $inspect, output ;; as placeholder (matches official compiler)
                    // Note: OXC normalization will split this into separate lines, but
                    // test normalization should handle this by removing all semicolons
                    // Add a newline after ;; so subsequent $inspect statements are recognized
                    if rune_prefix.starts_with("$inspect") {
                        result.push_str(";;\n");
                    }
                    // Remove leading whitespace/tabs on this line from result
                    // (for $effect and similar that are completely removed)
                    if !rune_prefix.starts_with("$inspect") {
                        while result.ends_with(' ') || result.ends_with('\t') {
                            result.pop();
                        }
                    }

                    i = end;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Check if we're at the start of a statement (preceded only by whitespace on current line).
fn is_statement_start(preceding: &str) -> bool {
    // Check what's on the current line before this position
    if let Some(last_newline) = preceding.rfind('\n') {
        let line_content = &preceding[last_newline + 1..];
        line_content.chars().all(|c| c.is_whitespace())
    } else {
        // Start of file/string - check if all preceding is whitespace
        preceding.chars().all(|c| c.is_whitespace())
    }
}

/// Replace store identifier in an expression with $.store_get() call.
/// For example: `$store` becomes `$.store_get($$store_subs ??= {}, '$store', store)`.
/// This handles the identifier carefully to avoid replacing substrings.
fn replace_store_identifier(expr: &str, store_ref: &str, store_name: &str) -> String {
    let mut result = String::with_capacity(expr.len() * 2);
    let chars: Vec<char> = expr.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    while i < chars.len() {
        // Check if we're at the start of the store reference
        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                // Check if this is a complete identifier (not part of a larger identifier)
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                // Only replace if it's a standalone identifier
                if !prev_is_ident && !next_is_ident {
                    // Replace with $.store_get() call
                    result.push_str(&format!(
                        "$.store_get($$store_subs ??= {{}}, '{}', {})",
                        store_ref, store_name
                    ));
                    i += store_ref_len;
                    continue;
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Replace store identifier in script content with $.store_get() call.
/// Similar to replace_store_identifier but also skips when:
/// - The store is on the left side of an assignment (handled by transform_store_assignments)
/// - Already inside a $.store_set or $.store_get call
/// - Inside a string literal (single, double, or template)
fn replace_store_identifier_in_script(script: &str, store_ref: &str, store_name: &str) -> String {
    let mut result = String::with_capacity(script.len() * 2);
    let chars: Vec<char> = script.chars().collect();
    let store_ref_chars: Vec<char> = store_ref.chars().collect();
    let store_ref_len = store_ref_chars.len();
    let mut i = 0;

    // Track string literal state
    let mut in_string = false;
    let mut string_char = ' ';

    while i < chars.len() {
        let c = chars[i];

        // Handle string literal boundaries
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            result.push(c);
            i += 1;
            continue;
        }

        // Skip replacements inside string literals
        if in_string {
            result.push(c);
            i += 1;
            continue;
        }

        // Check if we're at the start of the store reference
        if i + store_ref_len <= chars.len() {
            let mut matches = true;
            for (j, ref_char) in store_ref_chars.iter().enumerate() {
                if chars[i + j] != *ref_char {
                    matches = false;
                    break;
                }
            }

            if matches {
                // Check if this is a complete identifier (not part of a larger identifier)
                let prev_is_ident = if i > 0 {
                    is_js_identifier_char(chars[i - 1])
                } else {
                    false
                };
                let next_is_ident = if i + store_ref_len < chars.len() {
                    is_js_identifier_char(chars[i + store_ref_len])
                } else {
                    false
                };

                // Check if followed by an assignment operator (skip - handled by transform_store_assignments)
                let mut j = i + store_ref_len;
                while j < chars.len() && chars[j].is_whitespace() {
                    j += 1;
                }
                let is_assignment = j < chars.len()
                    && (chars[j] == '='
                        || (j + 1 < chars.len()
                            && chars[j + 1] == '='
                            && (chars[j] == '+'
                                || chars[j] == '-'
                                || chars[j] == '*'
                                || chars[j] == '/'
                                || chars[j] == '%'))
                        || (chars[j] == '+' && j + 1 < chars.len() && chars[j + 1] == '+')
                        || (chars[j] == '-' && j + 1 < chars.len() && chars[j + 1] == '-'));

                // Skip if it's an assignment - these are handled by transform_store_assignments
                // Exception: != and == are not assignments
                let is_comparison = j < chars.len()
                    && chars[j] == '='
                    && ((j + 1 < chars.len() && chars[j + 1] == '=')
                        || (i > 0
                            && (chars[i - 1] == '!'
                                || chars[i - 1] == '='
                                || chars[i - 1] == '<'
                                || chars[i - 1] == '>')));

                // Only replace if it's a standalone identifier and not an assignment target
                if !prev_is_ident && !next_is_ident && (!is_assignment || is_comparison) {
                    // Check if we're already inside a $.store_set or $.store_get call
                    let preceding: String = result.chars().collect();
                    let is_in_store_call =
                        preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(");

                    if !is_in_store_call {
                        // Replace with $.store_get() call
                        result.push_str(&format!(
                            "$.store_get($$store_subs ??= {{}}, '{}', {})",
                            store_ref, store_name
                        ));
                        i += store_ref_len;
                        continue;
                    }
                }
            }
        }

        result.push(chars[i]);
        i += 1;
    }

    result
}

/// Check if a character is a valid JavaScript identifier character.
fn is_js_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// Transform store assignments in script content for server-side rendering.
/// Handles patterns like:
/// - `$count = value` → `$.store_set(count, value)`
/// - `$count += 1` → `$.store_set(count, $.store_get(...) + 1)`
/// - `$count++` → `$.store_set(count, $.store_get(...) + 1)`
fn transform_store_assignments(script: &str) -> String {
    use regex::Regex;
    use std::sync::LazyLock;

    // Match store assignment patterns: $store = value, $store += value, etc.
    static STORE_ASSIGN_RE: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"\$([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+\+|--|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=|>>=|>>>=|\?\?=|&&=|\|\|=|=)\s*").unwrap()
    });

    // Match prefix increment/decrement: ++$store, --$store
    static PREFIX_OP_RE: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"(\+\+|--)\$([a-zA-Z_][a-zA-Z0-9_]*)").unwrap());

    let mut result = script.to_string();

    // Handle prefix increment/decrement: ++$store, --$store
    result = PREFIX_OP_RE
        .replace_all(&result, |caps: &regex::Captures| {
            let op = &caps[1];
            let store_name = &caps[2];
            let operator = if op == "++" { "+" } else { "-" };
            format!(
                "$.store_set({}, $.store_get($$store_subs ??= {{}}, '${0}', {0}) {} 1)",
                store_name, operator
            )
        })
        .to_string();

    // Handle postfix increment/decrement and compound assignments
    // We need to be careful not to match inside $.store_set calls we just created
    let mut new_result = String::new();
    let mut last_end = 0;

    for cap in STORE_ASSIGN_RE.captures_iter(&result) {
        let full_match = cap.get(0).unwrap();
        let start = full_match.start();
        let end = full_match.end();

        // Skip if this match overlaps with a previous replacement
        if start < last_end {
            continue;
        }

        // Skip if we're inside a $.store_set call
        let preceding = &result[..start];
        if preceding.ends_with("$.store_set(") || preceding.ends_with("$.store_get(") {
            continue;
        }

        // Skip if preceded by $ (this is $$array or similar internal variable, not a store)
        if preceding.ends_with('$') {
            continue;
        }

        // Append everything before this match
        new_result.push_str(&result[last_end..start]);

        let store_name = &cap[1];
        let operator = &cap[2];

        match operator {
            "++" | "--" => {
                // Postfix: $count++ or $count--
                let op = if operator == "++" { "+" } else { "-" };
                new_result.push_str(&format!(
                    "$.store_set({}, $.store_get($$store_subs ??= {{}}, '${0}', {0}) {} 1)",
                    store_name, op
                ));
            }
            "=" => {
                // Simple assignment: $count = value
                // We need to find the value after the = and before ; or end of statement
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!("$.store_set({}, {})", store_name, value));
                last_end = end + value_end;
                continue;
            }
            _ => {
                // Compound assignment: $count += value, $count -= value, etc.
                // Extract the base operator (remove =)
                let base_op = &operator[..operator.len() - 1];
                let rest = &result[end..];
                let value_end = find_statement_end(rest);
                let value = rest[..value_end].trim();
                new_result.push_str(&format!(
                    "$.store_set({}, $.store_get($$store_subs ??= {{}}, '${0}', {0}) {} {})",
                    store_name, base_op, value
                ));
                last_end = end + value_end;
                continue;
            }
        }

        last_end = end;
    }

    // Append remaining content
    new_result.push_str(&result[last_end..]);

    new_result
}

/// Find the end of a statement value (before ; or end of line).
fn find_statement_end(s: &str) -> usize {
    let mut depth = 0;
    let chars: Vec<char> = s.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            ';' | '\n' if depth == 0 => return i,
            _ => {}
        }
    }

    s.len()
}

/// Transform `export let` declarations for server-side rendering (legacy/non-runes mode).
///
/// This converts:
/// - `export let foo;` → `let foo = $$props['foo'];`
/// - `export let foo = 0;` → `let foo = $.fallback($$props['foo'], 0);`
///
/// This is used for Svelte 4 style components that use `export let` for props.
fn transform_export_let_declarations(script: &str) -> String {
    let mut result = String::new();
    let mut lines = script.lines().peekable();

    while let Some(line) = lines.next() {
        let trimmed = line.trim();

        // Check for `export let` or `export var` declaration
        if trimmed.starts_with("export let ") || trimmed.starts_with("export var ") {
            // Parse the declaration - both "export let " and "export var " are 11 chars
            let rest = &trimmed[11..];

            // Handle multi-line declarations by collecting until we hit a semicolon
            let mut full_declaration = rest.to_string();
            while !full_declaration.contains(';') && lines.peek().is_some() {
                if let Some(next_line) = lines.next() {
                    full_declaration.push(' ');
                    full_declaration.push_str(next_line.trim());
                }
            }

            // Remove trailing semicolon if present
            let declaration = full_declaration.trim_end_matches(';').trim();

            // Parse declarations (may be comma-separated: `export let a, b = 1, c;`)
            let transformed = transform_single_export_let(declaration);
            result.push_str(&transformed);
            result.push('\n');
        } else {
            result.push_str(line);
            result.push('\n');
        }
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Transform a single `export let` declaration (after removing the `export let` prefix).
///
/// Input: `foo` or `foo = 0` or `foo, bar = 1`
/// Output: `let foo = $$props['foo'];` or `let foo = $.fallback($$props['foo'], 0);`
fn transform_single_export_let(declaration: &str) -> String {
    let mut result = String::new();

    // Split by comma (handling nested structures like objects/arrays)
    let declarators = split_declarators(declaration);

    for declarator in declarators {
        let declarator = declarator.trim();
        if declarator.is_empty() {
            continue;
        }

        // Check if there's a default value
        if let Some(eq_pos) = find_assignment_in_declarator(declarator) {
            let name = declarator[..eq_pos].trim();
            let default_value = declarator[eq_pos + 1..].trim();

            // Use $.fallback for default values
            // Simple values are passed directly, complex ones as thunks
            let transformed_default = if is_simple_default_value(default_value) {
                format!(
                    "let {} = $.fallback($$props['{}'], {});",
                    name, name, default_value
                )
            } else {
                // Complex defaults need thunks
                format!(
                    "let {} = $.fallback($$props['{}'], () => ({}), true);",
                    name, name, default_value
                )
            };
            result.push_str(&transformed_default);
        } else {
            // No default value
            let name = declarator.trim();
            result.push_str(&format!("let {} = $$props['{}'];", name, name));
        }
        result.push('\n');
    }

    // Remove trailing newline
    if result.ends_with('\n') {
        result.pop();
    }

    result
}

/// Split declarators by comma, respecting nested structures.
fn split_declarators(declaration: &str) -> Vec<String> {
    let mut result = Vec::new();
    let mut current = String::new();
    let mut depth = 0;
    let chars: Vec<char> = declaration.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            current.push(c);
            continue;
        }

        if in_string {
            current.push(c);
            continue;
        }

        match c {
            '(' | '[' | '{' => {
                depth += 1;
                current.push(c);
            }
            ')' | ']' | '}' => {
                depth -= 1;
                current.push(c);
            }
            ',' if depth == 0 => {
                result.push(current.trim().to_string());
                current = String::new();
            }
            _ => current.push(c),
        }
    }

    if !current.trim().is_empty() {
        result.push(current.trim().to_string());
    }

    result
}

/// Find the position of the assignment operator in a declarator.
/// Returns None if there's no assignment, or Some(pos) where pos is the index of '='.
fn find_assignment_in_declarator(declarator: &str) -> Option<usize> {
    let mut depth = 0;
    let chars: Vec<char> = declarator.chars().collect();
    let mut in_string = false;
    let mut string_char = ' ';

    for (i, &c) in chars.iter().enumerate() {
        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 => {
                // Make sure it's not ==, ===, =>, etc.
                let prev = if i > 0 {
                    chars.get(i - 1).copied()
                } else {
                    None
                };
                let next = chars.get(i + 1).copied();
                if prev != Some('=')
                    && prev != Some('!')
                    && prev != Some('<')
                    && prev != Some('>')
                    && next != Some('=')
                    && next != Some('>')
                {
                    return Some(i);
                }
            }
            _ => {}
        }
    }

    None
}

/// Check if a default value is "simple" (can be passed directly to $.fallback).
///
/// According to the official Svelte compiler's `is_simple_expression()`, simple expressions are:
/// - Literals (numbers, strings, booleans, null, undefined)
/// - Identifiers
/// - Arrow/function expressions
/// - Conditional expressions (if all parts are simple)
/// - Binary expressions (like string concatenations: 'a' + 'b')
/// - Logical expressions (&&, ||, ??)
fn is_simple_default_value(value: &str) -> bool {
    is_simple_expression_string(value.trim())
}

/// Recursively check if a string represents a simple expression.
fn is_simple_expression_string(trimmed: &str) -> bool {
    // Numbers
    if trimmed.parse::<f64>().is_ok() {
        return true;
    }

    // Booleans and special values
    if matches!(trimmed, "true" | "false" | "null" | "undefined" | "void 0") {
        return true;
    }

    // Simple identifier (variable reference)
    if is_simple_identifier(trimmed) {
        return true;
    }

    // String literals (simple check - complete string)
    if is_string_literal(trimmed) {
        return true;
    }

    // Note: Empty array/object literals are NOT simple - they create new references
    // each time, so they need lazy initialization with () => [] or () => {}.
    // This matches the official Svelte compiler behavior.

    // Arrow functions at top level: () => expr, (x) => expr, x => expr
    // An arrow function starts with either:
    // 1. An identifier followed by =>: x => ...
    // 2. A parenthesized parameter list: () => ..., (x) => ..., (x, y) => ...
    if is_arrow_function(trimmed) {
        return true;
    }

    // Binary expressions (like 'a' + 'b')
    // Split by binary operators and check each part
    if let Some((left, right)) = split_binary_expression(trimmed) {
        return is_simple_expression_string(left.trim())
            && is_simple_expression_string(right.trim());
    }

    // Logical expressions (a && b, a || b, a ?? b)
    if let Some((left, right)) = split_logical_expression(trimmed) {
        return is_simple_expression_string(left.trim())
            && is_simple_expression_string(right.trim());
    }

    // Conditional expressions (a ? b : c)
    if let Some((test, cons, alt)) = split_conditional_expression(trimmed) {
        return is_simple_expression_string(test.trim())
            && is_simple_expression_string(cons.trim())
            && is_simple_expression_string(alt.trim());
    }

    false
}

/// Check if a string is a valid JavaScript identifier.
fn is_simple_identifier(s: &str) -> bool {
    if s.is_empty() {
        return false;
    }
    let mut chars = s.chars();
    let first = chars.next().unwrap();
    if !first.is_ascii_alphabetic() && first != '_' && first != '$' {
        return false;
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}

/// Check if a string represents an arrow function at the top level.
///
/// Arrow functions can be:
/// - `x => expr`
/// - `() => expr`
/// - `(x) => expr`
/// - `(x, y) => expr`
/// - `async x => expr`
/// - `async () => expr`
fn is_arrow_function(s: &str) -> bool {
    let s = s.trim();

    // Handle async prefix
    let s = s.strip_prefix("async").map(|s| s.trim_start()).unwrap_or(s);

    // Case 1: identifier => ...
    if let Some(arrow_pos) = find_arrow_at_depth_zero(s) {
        let before_arrow = s[..arrow_pos].trim();
        // Check if what's before => is a simple identifier or parenthesized params
        if is_simple_identifier(before_arrow) {
            return true;
        }
        // Check for parenthesized params like () or (x) or (x, y)
        if before_arrow.starts_with('(') && before_arrow.ends_with(')') {
            return true;
        }
    }
    false
}

/// Find the position of => at depth 0 (not inside parentheses/brackets/strings)
fn find_arrow_at_depth_zero(s: &str) -> Option<usize> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for i in 0..chars.len().saturating_sub(1) {
        let c = chars[i];

        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '=' if depth == 0 && chars.get(i + 1) == Some(&'>') => {
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

/// Check if a string is a string literal.
fn is_string_literal(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.len() < 2 {
        return false;
    }

    // Check for each quote type
    for quote in &['"', '\'', '`'] {
        if trimmed.starts_with(*quote) && trimmed.ends_with(*quote) {
            // Verify the string is properly escaped (no unescaped quotes inside)
            let inner = &trimmed[1..trimmed.len() - 1];
            let chars: Vec<char> = inner.chars().collect();
            let mut i = 0;
            while i < chars.len() {
                if chars[i] == '\\' && i + 1 < chars.len() {
                    i += 2; // Skip escaped character
                } else if chars[i] == *quote {
                    return false; // Unescaped quote inside
                } else {
                    i += 1;
                }
            }
            return true;
        }
    }
    false
}

/// Split a binary expression by +, -, *, /
/// Returns None if not a binary expression, or Some((left, right))
fn split_binary_expression(s: &str) -> Option<(&str, &str)> {
    // Find the rightmost binary operator at depth 0
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    // Scan from right to left to handle left-associativity correctly
    for i in (0..chars.len()).rev() {
        let c = chars[i];

        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            ')' | ']' | '}' => depth += 1,
            '(' | '[' | '{' => depth -= 1,
            '+' if depth == 0 => {
                // Make sure it's not ++ or +=
                let prev = if i > 0 { Some(chars[i - 1]) } else { None };
                let next = chars.get(i + 1).copied();
                if prev != Some('+') && next != Some('+') && next != Some('=') {
                    return Some((&s[..i], &s[i + 1..]));
                }
            }
            _ => {}
        }
    }
    None
}

/// Split a logical expression by &&, ||, ??
fn split_logical_expression(s: &str) -> Option<(&str, &str)> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';

    for i in (0..chars.len().saturating_sub(1)).rev() {
        let c = chars[i];
        let next = chars[i + 1];

        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            ')' | ']' | '}' => depth += 1,
            '(' | '[' | '{' => depth -= 1,
            '&' if next == '&' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            '|' if next == '|' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            '?' if next == '?' && depth == 0 => {
                return Some((&s[..i], &s[i + 2..]));
            }
            _ => {}
        }
    }
    None
}

/// Split a conditional expression by ? and :
fn split_conditional_expression(s: &str) -> Option<(&str, &str, &str)> {
    let chars: Vec<char> = s.chars().collect();
    let mut depth = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut question_pos = None;

    for i in 0..chars.len() {
        let c = chars[i];

        // Handle string literals
        if (c == '"' || c == '\'' || c == '`') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
            continue;
        }

        if in_string {
            continue;
        }

        match c {
            '(' | '[' | '{' => depth += 1,
            ')' | ']' | '}' => depth -= 1,
            '?' if depth == 0 && chars.get(i + 1) != Some(&'?') => {
                if question_pos.is_none() {
                    question_pos = Some(i);
                }
            }
            ':' if depth == 0 && question_pos.is_some() => {
                let q = question_pos.unwrap();
                return Some((&s[..q], &s[q + 1..i], &s[i + 1..]));
            }
            _ => {}
        }
    }
    None
}
