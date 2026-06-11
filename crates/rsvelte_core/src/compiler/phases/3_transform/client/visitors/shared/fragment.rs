//! Fragment processing utilities for client-side transformation.
//!
//! Corresponds to fragment.js in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js`.

use crate::ast::template::{
    Attribute, ExpressionTag, Fragment, RegularElement, TemplateNode, Text,
};
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::build_template_chunk;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;
use std::borrow::Cow;

/// NON_STATIC_PROPERTIES - properties that cannot be set statically
const NON_STATIC_PROPERTIES: &[&str] = &["autofocus", "muted", "defaultValue", "defaultChecked"];

/// Check if a property cannot be set statically.
fn cannot_be_set_statically(name: &str) -> bool {
    NON_STATIC_PROPERTIES.contains(&name)
}

/// Check if node is a custom element.
fn is_custom_element_node(node: &RegularElement) -> bool {
    node.name.contains('-')
        || node.attributes.iter().any(|attr| {
            if let Attribute::Attribute(a) = attr {
                a.name == "is"
            } else {
                false
            }
        })
}

/// Check if attribute is an event attribute.
fn is_event_attribute(attr: &Attribute) -> bool {
    if let Attribute::Attribute(a) = attr {
        a.name.starts_with("on")
    } else {
        false
    }
}

/// Check if attribute is a text attribute (single text value).
fn is_text_attribute(attr: &Attribute) -> bool {
    if let Attribute::Attribute(a) = attr {
        match &a.value {
            crate::ast::template::AttributeValue::Sequence(parts) => {
                parts.len() == 1
                    && matches!(parts[0], crate::ast::template::AttributeValuePart::Text(_))
            }
            _ => false,
        }
    } else {
        false
    }
}

/// Recursively check if any child nodes contain dynamic content or special attributes.
fn has_dynamic_children(nodes: &[TemplateNode]) -> bool {
    for node in nodes {
        match node {
            TemplateNode::ExpressionTag(_) => return true,
            TemplateNode::HtmlTag(_) => return true,
            TemplateNode::RenderTag(_) => return true,
            TemplateNode::IfBlock(_) => return true,
            TemplateNode::EachBlock(_) => return true,
            TemplateNode::AwaitBlock(_) => return true,
            TemplateNode::KeyBlock(_) => return true,
            TemplateNode::SnippetBlock(_) => return true,
            TemplateNode::Component(_) => return true,
            TemplateNode::SvelteComponent(_) => return true,
            TemplateNode::SvelteElement(_) => return true,
            TemplateNode::SvelteSelf(_) => return true,
            TemplateNode::SvelteBoundary(_) => return true,
            TemplateNode::SlotElement(_) => return true,
            TemplateNode::RegularElement(elem) => {
                // Check if this child element has special attributes that need runtime handling
                if is_custom_element_node(elem) {
                    return true;
                }

                // Check if this is a select/optgroup/option with rich content
                if is_customizable_select_element(elem) {
                    return true;
                }

                // <selectedcontent> elements need runtime handling ($.selectedcontent())
                if elem.name == "selectedcontent" {
                    return true;
                }

                // Check for attributes and directives that need runtime handling
                // Any directive (bind:, on:, use:, class:, style:, transition:, animate:)
                // makes the element non-static
                for attr in &elem.attributes {
                    match attr {
                        Attribute::Attribute(a) => {
                            if cannot_be_set_statically(&a.name) {
                                return true;
                            }
                            // Event attributes make it non-static
                            if a.name.starts_with("on") {
                                return true;
                            }
                            // option value needs special handling
                            if elem.name == "option" && a.name == "value" {
                                return true;
                            }
                            // Dynamic attribute values (containing expressions) make it non-static
                            if !matches!(a.value, crate::ast::template::AttributeValue::True(_))
                                && !is_text_attribute(attr)
                            {
                                return true;
                            }
                        }
                        // All directives require runtime handling
                        Attribute::BindDirective(_)
                        | Attribute::OnDirective(_)
                        | Attribute::ClassDirective(_)
                        | Attribute::StyleDirective(_)
                        | Attribute::TransitionDirective(_)
                        | Attribute::AnimateDirective(_)
                        | Attribute::UseDirective(_)
                        | Attribute::LetDirective(_)
                        | Attribute::SpreadAttribute(_)
                        | Attribute::AttachTag(_) => {
                            return true;
                        }
                    }
                }

                // Recursively check children
                if has_dynamic_children(&elem.fragment.nodes) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Check if a node is a static element.
///
/// A static element is one that can be rendered in the template without
/// needing any runtime updates.
pub fn is_static_element(node: &TemplateNode, _state: &ComponentClientTransformState) -> bool {
    match node {
        TemplateNode::RegularElement(elem) => {
            // Dynamic fragment means we can't be static
            if elem.fragment.metadata.dynamic {
                return false;
            }

            // Check if any child is an ExpressionTag (which means dynamic content)
            // This is a workaround for metadata.dynamic not being set correctly in Phase 2
            if has_dynamic_children(&elem.fragment.nodes) {
                return false;
            }

            // Custom elements are not static (we set attributes through properties)
            if is_custom_element_node(elem) {
                return false;
            }

            // Customizable select elements (select/optgroup/option with rich content)
            // are not static because they need $.customizable_select() handling
            if is_customizable_select_element(elem) {
                return false;
            }

            // <selectedcontent> elements are not static because they need
            // $.selectedcontent() runtime handling
            if elem.name == "selectedcontent" {
                return false;
            }

            // Check each attribute
            for attribute in &elem.attributes {
                match attribute {
                    Attribute::Attribute(attr) => {
                        // Event attributes make it non-static
                        if is_event_attribute(attribute) {
                            return false;
                        }

                        // Some properties cannot be set statically
                        if cannot_be_set_statically(&attr.name) {
                            return false;
                        }

                        // dir attribute needs runtime handling
                        if attr.name == "dir" {
                            return false;
                        }

                        // Special handling for input/textarea value and checked
                        if (elem.name == "input" || elem.name == "textarea")
                            && (attr.name == "value" || attr.name == "checked")
                        {
                            return false;
                        }

                        // option value needs runtime handling
                        if elem.name == "option" && attr.name == "value" {
                            return false;
                        }

                        // img loading needs to be applied after appending to DOM
                        if elem.name == "img" && attr.name == "loading" {
                            return false;
                        }

                        // Must be a text attribute or boolean
                        if !matches!(attr.value, crate::ast::template::AttributeValue::True(_))
                            && !is_text_attribute(attribute)
                        {
                            return false;
                        }
                    }
                    // Non-attribute directives make it non-static
                    _ => return false,
                }
            }

            true
        }
        _ => false,
    }
}

/// Processes an array of template nodes, joining sibling text/expression nodes
/// (e.g. `{a} b {c}`) into a single update function. Along the way it creates
/// corresponding template node references these updates are applied to.
///
/// # Arguments
///
/// * `nodes` - The child nodes to process
/// * `initial` - Function to generate anchor expression (argument: is_text)
/// * `is_element` - Whether parent is an element
/// * `context` - Component context
///
/// Corresponds to `process_children` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/fragment.js`.
pub fn process_children<F>(
    nodes: &[Cow<'_, TemplateNode>],
    initial: F,
    is_element: bool,
    context: &mut ComponentContext,
) where
    F: FnMut(bool) -> JsExpr,
{
    let within_bound_contenteditable = false; // TODO: implement bound_contenteditable tracking

    // After the first flush, `prev` always returns a cached `JsExpr` clone.
    // Express the two states as an enum so we don't `Box::new` a new
    // closure on every flush (each child of every element used to allocate
    // a fresh Box and pay dynamic-dispatch cost on every call).
    enum SiblingPrev<F: FnMut(bool) -> JsExpr> {
        Initial(F),
        Reuse(JsExpr),
    }
    impl<F: FnMut(bool) -> JsExpr> SiblingPrev<F> {
        #[inline]
        fn call(&mut self, is_text: bool) -> JsExpr {
            match self {
                SiblingPrev::Initial(f) => f(is_text),
                SiblingPrev::Reuse(e) => e.clone(),
            }
        }
    }

    let mut prev: SiblingPrev<F> = SiblingPrev::Initial(initial);
    let mut skipped = 0usize;

    // Sequence of Text/ExpressionTag nodes — pre-allocate for the common
    // case (≤8 contiguous text/expression nodes per fragment) so we don't
    // pay the Vec growth-and-reallocate cost on every push.
    let mut sequence: Vec<TextOrExpr> = Vec::with_capacity(8);

    // SAFETY: Extract a reference to the arena that outlives the closures.
    // The arena uses UnsafeCell internally and only appends, so holding a
    // shared reference while mutating other parts of context is safe.
    let arena_ref: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena =
        unsafe { &*(&context.arena as *const _) };

    // Helper: get node with proper sibling navigation
    let get_node = |is_text: bool, prev_fn: &mut SiblingPrev<F>, skip_count: usize| -> JsExpr {
        if skip_count == 0 {
            return prev_fn.call(is_text);
        }

        // `$.sibling(...)` takes at most 3 args. Pre-allocate with that
        // capacity so the two subsequent pushes never grow the Vec.
        let prev_expr = prev_fn.call(false);
        let mut args = Vec::with_capacity(3);
        args.push(prev_expr);

        if is_text || skip_count != 1 {
            args.push(b::number(skip_count as f64));
        }

        if is_text {
            args.push(b::boolean(true));
        }

        b::call(arena_ref, b::member_path(arena_ref, "$.sibling"), args)
    };

    // Helper: flush a single node
    let flush_node = |is_text: bool,
                      name: &str,
                      _loc: Option<&str>,
                      prev_fn: &mut SiblingPrev<F>,
                      skip_count: &mut usize,
                      ctx: &mut ComponentContext|
     -> JsExpr {
        let expression = get_node(is_text, prev_fn, *skip_count);
        let id: JsExpr;

        if let JsExpr::Identifier(_) = expression {
            id = expression.clone();
        } else {
            // Generate a unique identifier
            let id_name = ctx.state.memoizer.generate_id(name);
            id = b::id(&id_name);
            ctx.state
                .init
                .push(b::var_decl(arena_ref, &id_name, Some(expression)));
        }

        // Update prev to return this id (no allocation — enum variant swap).
        *prev_fn = SiblingPrev::Reuse(id.clone());
        *skip_count = 1; // the next node is `$.sibling(id)`

        id
    };

    // Helper: flush a sequence of Text/ExpressionTag nodes
    let flush_sequence = |seq: Vec<TextOrExpr>,
                          prev_fn: &mut SiblingPrev<F>,
                          skip_count: &mut usize,
                          ctx: &mut ComponentContext| {
        // If all nodes are text, just push to template
        if seq.iter().all(|n| matches!(n, TextOrExpr::Text(_))) {
            *skip_count += 1;
            let text_nodes: Vec<Text> = seq
                .into_iter()
                .filter_map(|n| {
                    if let TextOrExpr::Text(t) = n {
                        Some(t)
                    } else {
                        None
                    }
                })
                .collect();
            ctx.state.template.push_text(text_nodes);
            return;
        }

        // Mixed text/expression sequence - push placeholder
        ctx.state.template.push_text(vec![Text {
            data: " ".into(),
            raw: " ".into(),
            start: 0,
            end: 0,
        }]);

        let result = build_template_chunk(&seq, ctx);

        // Store extra blocker indices from expressions that were evaluated to literals
        // but still reference blocker_map variables. These need to be included in the
        // template_effect's blockers argument.
        for idx in &result.blocker_indices {
            if !ctx.state.extra_blocker_indices.contains(idx) {
                ctx.state.extra_blocker_indices.push(*idx);
            }
        }

        // is_text is true when the sequence has exactly one element.
        // This is for standalone `{expression}` - in case no text node
        // was created during SSR (empty expression), we need special handling.
        // For multiple expressions like `{a}{b}`, is_text should be false.
        let is_text = seq.len() == 1;
        let id = flush_node(is_text, "text", None, prev_fn, skip_count, ctx);

        let update = b::stmt(
            arena_ref,
            b::call(
                arena_ref,
                b::member_path(arena_ref, "$.set_text"),
                vec![id.clone(), result.value.clone()],
            ),
        );

        if result.has_state && !within_bound_contenteditable {
            ctx.state.update.push(update);
        } else {
            ctx.state.init.push(b::stmt(
                arena_ref,
                b::assign(
                    arena_ref,
                    b::member(arena_ref, id, "nodeValue"),
                    result.value,
                ),
            ));
        }
    };

    // Main loop
    for cow_node in nodes.iter() {
        let node = cow_node.as_ref();
        match node {
            TemplateNode::Text(text) => {
                sequence.push(TextOrExpr::Text(text.clone()));
            }
            TemplateNode::ExpressionTag(expr) => {
                sequence.push(TextOrExpr::Expr((**expr).clone()));
            }
            // ConstTag / DeclarationTag don't produce DOM nodes - just visit
            // them to add declarations. Mirrors upstream's `{@const}`/`{let}`
            // / `{const}` skip-from-template behaviour (Svelte 5.56.0 #18282
            // makes the new declaration tag types share the same template
            // bypass).
            TemplateNode::ConstTag(_) | TemplateNode::DeclarationTag(_) => {
                // Flush any pending sequence
                if !sequence.is_empty() {
                    flush_sequence(sequence, &mut prev, &mut skipped, context);
                    sequence = Vec::with_capacity(8);
                }

                // Visit the tag to generate its declarations
                // This doesn't need a DOM node or sibling navigation
                context.visit_node(node, None);
            }
            _ => {
                // Flush any pending sequence
                if !sequence.is_empty() {
                    flush_sequence(sequence, &mut prev, &mut skipped, context);
                    sequence = Vec::with_capacity(8);
                }

                if is_static_element(node, &context.state) {
                    // Push the static element to the template
                    let css_hash = &context.state.analysis.css.hash;
                    let preserve_comments = context.state.options.preserve_comments;
                    let had_lone_script = push_static_element_to_template(
                        node,
                        &mut context.state.template,
                        &context.state.metadata.namespace,
                        css_hash,
                        preserve_comments,
                    );

                    // When a static element has a lone <script> child, the official
                    // Svelte compiler's clean_nodes adds a Comment node. The
                    // RegularElement visitor then calls process_children which calls
                    // flush_node for the Comment, consuming a "node" name from the
                    // memoizer. Since we bypass the full visitor for static elements,
                    // we must consume the name here to keep the counter in sync.
                    if had_lone_script {
                        context.state.memoizer.generate_id("node");
                    }

                    skipped += 1;
                } else if let TemplateNode::EachBlock(each) = node {
                    // Special case: single EachBlock in element can be controlled
                    if nodes.len() == 1 && is_element && !each.metadata.expression.is_async() {
                        // Mark as controlled via state flag (since we can't mutate the node)
                        context.state.is_controlled_each = true;
                        // Visit without changing node - the each_block visitor will check the flag
                        let result = context.visit_node(node, None);
                        // Add the result to init if it's a statement or block
                        match result {
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                                context.state.init.push(stmt);
                            }
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                                context.state.init.push(JsStatement::Block(block));
                            }
                            _ => {}
                        }
                    } else {
                        let name = "node";
                        let id = flush_node(false, name, None, &mut prev, &mut skipped, context);
                        // Save original node and temporarily replace it
                        let saved_node = std::mem::replace(&mut context.state.node, id);
                        let result = context.visit_node(node, None);
                        // Add the result to init if it's a statement or block
                        match result {
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                                context.state.init.push(stmt);
                            }
                            crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                                context.state.init.push(JsStatement::Block(block));
                            }
                            _ => {}
                        }
                        context.state.node = saved_node;
                    }
                } else if let TemplateNode::HtmlTag(html_tag) = node
                    && nodes.len() == 1
                    && is_element
                    && !html_tag.metadata.expression.is_async()
                {
                    // Svelte 5.53.8 (upstream `0206a2019`): when `{@html ...}` is
                    // the only child of an element AND the expression is NOT async,
                    // set is_controlled so the visitor emits
                    // `$.html(parent, thunk, true, ...)` without a wrapper comment
                    // anchor. The visitor uses the parent node directly, so
                    // there's no flush_node call. Async expressions keep the
                    // wrapper because $.async() needs to skip sibling nodes up to
                    // the wrapper.
                    let saved = context.state.is_controlled_html;
                    context.state.is_controlled_html = true;
                    let result = context.visit_node(node, None);
                    context.state.is_controlled_html = saved;
                    match result {
                        crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                            context.state.init.push(stmt);
                        }
                        crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                            context.state.init.push(JsStatement::Block(block));
                        }
                        _ => {}
                    }
                } else {
                    // Get node name for identifier
                    let name = if let TemplateNode::RegularElement(elem) = node {
                        elem.name.as_str()
                    } else {
                        "node"
                    };

                    let id = flush_node(false, name, None, &mut prev, &mut skipped, context);
                    // Save original node and temporarily replace it
                    let saved_node = std::mem::replace(&mut context.state.node, id);
                    let result = context.visit_node(node, None);
                    // Add the result to init if it's a statement or block
                    match result {
                        crate::compiler::phases::phase3_transform::client::types::TransformResult::Statement(stmt) => {
                            context.state.init.push(stmt);
                        }
                        crate::compiler::phases::phase3_transform::client::types::TransformResult::Block(block) => {
                            context.state.init.push(JsStatement::Block(block));
                        }
                        _ => {}
                    }
                    context.state.node = saved_node;
                }
            }
        }
    }

    // Flush any remaining sequence
    if !sequence.is_empty() {
        flush_sequence(sequence, &mut prev, &mut skipped, context);
    }

    // If there are trailing static text nodes/elements, traverse to the last one
    if skipped > 1 {
        skipped -= 1;
        let mut args = vec![];
        if skipped != 1 {
            args.push(b::number(skipped as f64));
        }
        context.state.init.push(b::stmt(
            &context.arena,
            b::call(
                &context.arena,
                b::member_path(&context.arena, "$.next"),
                args,
            ),
        ));
    }
}

/// Helper enum for Text or ExpressionTag sequences.
///
/// Same large-enum-variant trade-off as `AttributeValuePart`: this enum is
/// short-lived and lives in tiny vectors, so the size disparity isn't worth
/// boxing.
#[derive(Debug, Clone)]
#[allow(clippy::large_enum_variant)]
pub enum TextOrExpr {
    Text(Text),
    Expr(ExpressionTag),
}

/// Push a static element and its children to the template.
/// Returns true if the element contained a lone <script> child (which adds a <!> comment
/// to match the official Svelte compiler's clean_nodes behavior).
fn push_static_element_to_template(
    node: &TemplateNode,
    template: &mut Template,
    namespace: &str,
    css_hash: &str,
    preserve_comments: bool,
) -> bool {
    push_static_element_to_template_inner(
        node,
        template,
        namespace,
        css_hash,
        preserve_comments,
        false,
    )
}

/// Inner implementation with preserve_whitespace tracking.
/// Returns true if a lone <script> child was encountered (and a <!> comment was added).
fn push_static_element_to_template_inner(
    node: &TemplateNode,
    template: &mut Template,
    namespace: &str,
    css_hash: &str,
    preserve_comments: bool,
    preserve_whitespace: bool,
) -> bool {
    match node {
        TemplateNode::RegularElement(elem) => {
            // Determine if this is an HTML element (not SVG/MathML)
            let is_html = namespace == "html" && elem.name != "svg";
            // Avoid allocation when name is already lowercase (common case for HTML)
            let name_str = elem.name.as_str();
            let needs_lowercase = is_html && name_str.bytes().any(|b| b.is_ascii_uppercase());
            let elem_name = if needs_lowercase {
                name_str.to_lowercase()
            } else {
                name_str.to_string()
            };

            // Push the element opening tag
            template.push_element(elem_name.clone(), elem.start, is_html);

            // `<video>` and authored custom elements need `importNode` cloning.
            // The dynamic path sets this in `visit_regular_element`; this static
            // builder must mirror it so a fully-static `<video>` still flips the
            // TEMPLATE_USE_IMPORT_NODE bit. (Synthetic wrappers like
            // `<svelte-css-wrapper>` are pushed via the component visitors, not
            // here, so they correctly stay un-flagged.)
            if elem.name == "video" || is_custom_element_node(elem) {
                template.needs_import_node = true;
            }

            // Handle <noscript> - it's rendered empty (children are stripped)
            // This matches the behavior in visit_regular_element
            if elem.name == "noscript" {
                template.pop_element();
                return false;
            }

            // Determine child namespace for recursion
            let child_namespace = determine_namespace_for_children(elem, namespace);

            // Track if a class attribute was found (for CSS hash handling)
            let is_scoped = elem.metadata.scoped;
            let mut has_class_attr = false;

            // Add attributes
            for attr in &elem.attributes {
                if let Attribute::Attribute(a) = attr {
                    let mut value = match &a.value {
                        crate::ast::template::AttributeValue::True(_) => Some(String::new()),
                        crate::ast::template::AttributeValue::Sequence(parts) => {
                            let mut val = String::new();
                            for part in parts {
                                if let crate::ast::template::AttributeValuePart::Text(t) = part {
                                    val.push_str(&t.data);
                                }
                            }
                            Some(val)
                        }
                        _ => None,
                    };

                    // Track class attribute for CSS hash handling
                    if a.name == "class" {
                        has_class_attr = true;

                        // Append CSS hash to class attribute if element is scoped
                        if is_scoped && !css_hash.is_empty() {
                            if let Some(ref mut v) = value {
                                if v.is_empty() {
                                    *v = css_hash.to_string();
                                } else {
                                    v.push(' ');
                                    v.push_str(css_hash);
                                }
                            } else {
                                // class=true (boolean) - replace with hash
                                value = Some(css_hash.to_string());
                            }
                        }
                    }

                    // Skip empty class attributes (matches official compiler behavior)
                    if a.name == "class" && value.as_deref() == Some("") {
                        continue;
                    }
                    // Lowercase attribute names for HTML elements (matches official compiler)
                    // Avoid allocation when name is already lowercase (common case)
                    let a_name_str = a.name.as_str();
                    let attr_name = if is_html && a_name_str.bytes().any(|b| b.is_ascii_uppercase())
                    {
                        a_name_str.to_lowercase()
                    } else {
                        a_name_str.to_string()
                    };
                    template.set_prop(attr_name, value);
                }
            }

            // If element is scoped but has no class attribute, add class with just the hash
            if is_scoped && !has_class_attr && !css_hash.is_empty() {
                template.set_prop("class".to_string(), Some(css_hash.to_string()));
            }

            // Recursively add children (skip comments if not preserving,
            // trim leading/trailing whitespace-only text nodes)
            let children = &elem.fragment.nodes;

            // Preserve whitespace for <script>, <pre>, and <textarea> elements,
            // matching the official compiler behavior
            let preserve_ws =
                elem.name == "script" || elem.name == "pre" || elem.name == "textarea";

            let effective_preserve_ws = preserve_ws || preserve_whitespace;
            if effective_preserve_ws {
                // For script/pre/textarea elements, add all children without whitespace trimming
                let mut is_first = true;
                for child in children.iter() {
                    if !preserve_comments && matches!(child, TemplateNode::Comment(_)) {
                        continue;
                    }
                    // Strip leading newline from first text child of <pre>
                    // to prevent browsers from stripping it (which would break hydration)
                    if is_first
                        && elem.name == "pre"
                        && let TemplateNode::Text(text) = child
                        && (text.data.as_str() == "\n" || text.data.as_str() == "\r\n")
                    {
                        is_first = false;
                        continue;
                    }
                    is_first = false;
                    push_static_element_to_template_inner(
                        child,
                        template,
                        &child_namespace,
                        css_hash,
                        preserve_comments,
                        effective_preserve_ws,
                    );
                }
            } else {
                // Find start index (skip leading whitespace-only text and comments)
                let start = children
                    .iter()
                    .position(|n| {
                        if !preserve_comments && matches!(n, TemplateNode::Comment(_)) {
                            return false;
                        }
                        if let TemplateNode::Text(t) = n {
                            !is_svelte_whitespace_only(&t.data)
                        } else {
                            true
                        }
                    })
                    .unwrap_or(children.len());

                // Find end index (skip trailing whitespace-only text and comments)
                let end = children
                    .iter()
                    .rposition(|n| {
                        if !preserve_comments && matches!(n, TemplateNode::Comment(_)) {
                            return false;
                        }
                        if let TemplateNode::Text(t) = n {
                            !is_svelte_whitespace_only(&t.data)
                        } else {
                            true
                        }
                    })
                    .map(|i| i + 1)
                    .unwrap_or(0);

                let raw_range = &children[start..end.max(start)];
                // Pre-pass: when comments are being removed, merge consecutive text
                // nodes that are only separated by removed comments. This avoids
                // double-spacing where each side independently collapses to a single
                // space.
                let merged_range: Vec<TemplateNode> = if preserve_comments {
                    raw_range.to_vec()
                } else {
                    let mut out: Vec<TemplateNode> = Vec::with_capacity(raw_range.len());
                    let mut pending_text: Option<crate::ast::template::Text> = None;
                    for child in raw_range.iter() {
                        match child {
                            TemplateNode::Comment(_) => {
                                // Skip — but keep pending_text alive so the next text
                                // will merge with it.
                            }
                            TemplateNode::Text(t) => {
                                if let Some(prev) = pending_text.take() {
                                    // Merge: combine prev.data + t.data (and raw)
                                    let mut merged = prev.clone();
                                    let mut new_data = prev.data.to_string();
                                    new_data.push_str(&t.data);
                                    merged.data = compact_str::CompactString::new(&new_data);
                                    let mut new_raw = prev.raw.to_string();
                                    new_raw.push_str(&t.raw);
                                    merged.raw = compact_str::CompactString::new(&new_raw);
                                    pending_text = Some(merged);
                                } else {
                                    pending_text = Some(t.clone());
                                }
                            }
                            other => {
                                if let Some(t) = pending_text.take() {
                                    out.push(TemplateNode::Text(t));
                                }
                                out.push(other.clone());
                            }
                        }
                    }
                    if let Some(t) = pending_text.take() {
                        out.push(TemplateNode::Text(t));
                    }
                    out
                };
                let range: &[TemplateNode] = &merged_range;
                // Collect non-comment children indices for boundary trimming
                let meaningful_indices: Vec<usize> = range
                    .iter()
                    .enumerate()
                    .filter(|(_, c)| preserve_comments || !matches!(c, TemplateNode::Comment(_)))
                    .map(|(i, _)| i)
                    .collect();

                let first_meaningful = meaningful_indices.first().copied();
                let last_meaningful = meaningful_indices.last().copied();

                for (i, child) in range.iter().enumerate() {
                    if !preserve_comments && matches!(child, TemplateNode::Comment(_)) {
                        continue;
                    }
                    // Trim/collapse whitespace from text nodes to match clean_nodes behavior
                    if let TemplateNode::Text(text) = child {
                        let ws = |c: char| c == ' ' || c == '\t' || c == '\n' || c == '\r';
                        let mut data = text.data.to_string();
                        let mut raw = text.raw.to_string();
                        if Some(i) == first_meaningful {
                            // First text: trim leading whitespace entirely
                            let trimmed = data.trim_start_matches(ws);
                            if trimmed.len() < data.len() {
                                let start = data.len() - trimmed.len();
                                data.drain(..start);
                            }
                            let trimmed = raw.trim_start_matches(ws);
                            if trimmed.len() < raw.len() {
                                let start = raw.len() - trimmed.len();
                                raw.drain(..start);
                            }
                        } else {
                            // Non-first text: collapse leading whitespace to single space
                            let trimmed_data = data.trim_start_matches(ws);
                            if trimmed_data.len() < data.len() && !trimmed_data.is_empty() {
                                let start = data.len() - trimmed_data.len();
                                data.drain(..start);
                                data.insert(0, ' ');
                            } else if trimmed_data.is_empty() && !data.is_empty() {
                                data.clear();
                                data.push(' ');
                            }
                            let trimmed_raw = raw.trim_start_matches(ws);
                            if trimmed_raw.len() < raw.len() && !trimmed_raw.is_empty() {
                                let start = raw.len() - trimmed_raw.len();
                                raw.drain(..start);
                                raw.insert(0, ' ');
                            } else if trimmed_raw.is_empty() && !raw.is_empty() {
                                raw.clear();
                                raw.push(' ');
                            }
                        }
                        if Some(i) == last_meaningful {
                            // Last text: trim trailing whitespace entirely
                            let trimmed = data.trim_end_matches(ws);
                            data.truncate(trimmed.len());
                            let trimmed = raw.trim_end_matches(ws);
                            raw.truncate(trimmed.len());
                        } else {
                            // Non-last text: collapse trailing whitespace to single space
                            let trimmed_data = data.trim_end_matches(ws);
                            if trimmed_data.len() < data.len() && !trimmed_data.is_empty() {
                                let new_len = trimmed_data.len();
                                data.truncate(new_len);
                                data.push(' ');
                            } else if trimmed_data.is_empty() && !data.is_empty() {
                                data.clear();
                                data.push(' ');
                            }
                            let trimmed_raw = raw.trim_end_matches(ws);
                            if trimmed_raw.len() < raw.len() && !trimmed_raw.is_empty() {
                                let new_len = trimmed_raw.len();
                                raw.truncate(new_len);
                                raw.push(' ');
                            } else if trimmed_raw.is_empty() && !raw.is_empty() {
                                raw.clear();
                                raw.push(' ');
                            }
                        }
                        // Skip whitespace-only text that would collapse to just space
                        // in SVG namespace (can_remove_entirely logic)
                        if !data.is_empty()
                            && !(data == " "
                                && (child_namespace == "svg"
                                    || matches!(
                                        elem_name.as_str(),
                                        "select"
                                            | "tr"
                                            | "table"
                                            | "tbody"
                                            | "thead"
                                            | "tfoot"
                                            | "colgroup"
                                            | "datalist"
                                    )))
                        {
                            let mut trimmed = text.clone();
                            trimmed.data = compact_str::CompactString::new(&data);
                            trimmed.raw = compact_str::CompactString::new(&raw);
                            push_static_element_to_template_inner(
                                &TemplateNode::Text(trimmed),
                                template,
                                &child_namespace,
                                css_hash,
                                preserve_comments,
                                false,
                            );
                        }
                    } else {
                        push_static_element_to_template_inner(
                            child,
                            template,
                            &child_namespace,
                            css_hash,
                            preserve_comments,
                            false,
                        );
                    }
                }
            }

            // Special case: if the only meaningful child is a lone <script> element,
            // add a comment anchor after it. This matches clean_nodes behavior in the
            // official compiler (lines 264-274 of utils.js) to ensure run_scripts
            // logic can call node.replaceWith() on the script tag.
            // Avoid collecting into a Vec - count and check inline.
            let mut meaningful_count = 0usize;
            let mut lone_script = false;
            for n in &elem.fragment.nodes {
                let dominated = matches!(n, TemplateNode::Text(t) if is_svelte_whitespace_only(&t.data))
                    || matches!(n, TemplateNode::Comment(_));
                if !dominated {
                    meaningful_count += 1;
                    if meaningful_count == 1 {
                        lone_script = matches!(n, TemplateNode::RegularElement(child_el) if child_el.name.as_str() == "script");
                    } else {
                        lone_script = false;
                    }
                }
            }
            let has_lone_script = meaningful_count == 1 && lone_script;
            if has_lone_script {
                template.push_comment(Some(String::new()));
            }

            // Close the element
            template.pop_element();

            return has_lone_script;
        }
        TemplateNode::Text(text) => {
            template.push_text(vec![text.clone()]);
        }
        TemplateNode::Comment(comment) if preserve_comments => {
            template.push_comment(Some(comment.data.to_string()));
        }
        _ => {}
    }
    false
}

use crate::compiler::phases::phase3_transform::client::transform_template::template::Template;
use crate::compiler::phases::phase3_transform::utils::determine_namespace_for_children;

/// Checks if a <select>, <optgroup>, or <option> element has rich content that requires
/// special hydration handling with `$.customizable_select()`.
///
/// Rich content is anything beyond simple text, expressions, and comments for <option>,
/// anything beyond <option> children for <optgroup>,
/// or anything beyond <option>, <optgroup>, and empty text for <select>.
/// Control flow blocks are recursively checked - they only count as rich content if they
/// contain rich content themselves.
fn is_customizable_select_element(node: &RegularElement) -> bool {
    if node.name == "select" || node.name == "optgroup" || node.name == "option" {
        let node_name = node.name.as_str();
        return has_matching_descendant(&node.fragment, &|child| {
            match child {
                TemplateNode::RegularElement(elem) => {
                    if node_name == "select" && elem.name != "option" && elem.name != "optgroup" {
                        return true;
                    }
                    if node_name == "optgroup" && elem.name != "option" {
                        return true;
                    }
                    if node_name == "option" {
                        return true;
                    }
                    false
                }
                TemplateNode::Text(text) => {
                    // Text nodes directly in <select> or <optgroup> are rich content
                    // (only if non-empty after trim)
                    (node_name == "select" || node_name == "optgroup")
                        && !is_svelte_whitespace_only(&text.data)
                }
                _ => {
                    // Any non-RegularElement, non-Text node is rich content
                    // This includes Component, RenderTag, HtmlTag, etc.
                    true
                }
            }
        });
    }
    false
}

/// Check if a fragment has any descendant that would be considered "rich content"
/// for the purposes of `is_customizable_select_element`.
///
/// This is equivalent to the old `find_descendants` but avoids allocating a Vec
/// and cloning TemplateNodes. Instead, it calls a predicate on each descendant
/// and returns true as soon as the predicate returns true.
fn has_matching_descendant<F>(fragment: &Fragment, predicate: &F) -> bool
where
    F: Fn(&TemplateNode) -> bool,
{
    has_matching_descendant_recursive(&fragment.nodes, predicate)
}

fn has_matching_descendant_recursive<F>(nodes: &[TemplateNode], predicate: &F) -> bool
where
    F: Fn(&TemplateNode) -> bool,
{
    for node in nodes {
        match node {
            // Skip these types - they don't contribute to rich content detection
            TemplateNode::SnippetBlock(_)
            | TemplateNode::DebugTag(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ExpressionTag(_) => {}

            // Text nodes: check if non-whitespace
            TemplateNode::Text(text) => {
                if !is_svelte_whitespace_only(&text.data) && predicate(node) {
                    return true;
                }
            }

            // Control flow blocks: recurse into their content
            TemplateNode::IfBlock(if_block) => {
                if has_matching_descendant_recursive(&if_block.consequent.nodes, predicate) {
                    return true;
                }
                if let Some(alternate) = &if_block.alternate
                    && has_matching_descendant_recursive(&alternate.nodes, predicate)
                {
                    return true;
                }
            }

            TemplateNode::EachBlock(each_block) => {
                if has_matching_descendant_recursive(&each_block.body.nodes, predicate) {
                    return true;
                }
                if let Some(fallback) = &each_block.fallback
                    && has_matching_descendant_recursive(&fallback.nodes, predicate)
                {
                    return true;
                }
            }

            TemplateNode::KeyBlock(key_block) => {
                if has_matching_descendant_recursive(&key_block.fragment.nodes, predicate) {
                    return true;
                }
            }

            TemplateNode::AwaitBlock(await_block) => {
                if let Some(pending) = &await_block.pending
                    && has_matching_descendant_recursive(&pending.nodes, predicate)
                {
                    return true;
                }
                if let Some(then) = &await_block.then
                    && has_matching_descendant_recursive(&then.nodes, predicate)
                {
                    return true;
                }
                if let Some(catch) = &await_block.catch
                    && has_matching_descendant_recursive(&catch.nodes, predicate)
                {
                    return true;
                }
            }

            TemplateNode::SvelteBoundary(boundary) => {
                if has_matching_descendant_recursive(&boundary.fragment.nodes, predicate) {
                    return true;
                }
            }

            // All other nodes (RegularElement, Component, RenderTag, HtmlTag, etc.)
            _ => {
                if predicate(node) {
                    return true;
                }
            }
        }
    }
    false
}
