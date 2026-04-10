//! Client-side transformation types and context.
//!
//! This module contains the core type definitions for the client-side
//! transformation phase (Phase 3).
//!
#![allow(clippy::collapsible_if)]
//! Corresponds to `ComponentContext` and `ComponentClientTransformState` in
//! `svelte/packages/svelte/src/compiler/phases/3-transform/types.js`.

use crate::ast::arena::ParseArena;
use crate::ast::template::TemplateNode;
use crate::compiler::phases::phase2_analyze::scope::{Binding, Scope, ScopeRoot};
use crate::compiler::phases::phase2_analyze::types::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::client::transform_template::Template;
use crate::compiler::phases::phase3_transform::js_ast::arena::JsArena;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use im::{HashMap as ImHashMap, HashSet as ImHashSet};
use indexmap::IndexSet;
use rustc_hash::{FxHashMap, FxHashSet};
use std::cell::{Cell, RefCell};
use std::rc::Rc;

/// Component transformation context.
///
/// This contains all the state and methods needed during the
/// transformation process. Corresponds to `ComponentContext` in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/types.js`.
#[derive(Debug)]
pub struct ComponentContext<'a> {
    /// The current transformation state
    pub state: ComponentClientTransformState<'a>,

    /// Arena allocator for JavaScript AST expressions and statements.
    /// Uses interior mutability (UnsafeCell) so allocation only needs `&self`.
    pub arena: JsArena,

    /// The path of nodes being visited (for parent access)
    pub path: Vec<&'a TemplateNode>,

    /// Visit a node and return the transformed expression/statement
    pub visit:
        fn(&mut Self, &TemplateNode, Option<&ComponentClientTransformState<'a>>) -> TransformResult,
}

impl<'a> ComponentContext<'a> {
    /// Create a new component context.
    pub fn new(
        state: ComponentClientTransformState<'a>,
        visit: fn(
            &mut Self,
            &TemplateNode,
            Option<&ComponentClientTransformState<'a>>,
        ) -> TransformResult,
    ) -> Self {
        Self {
            state,
            arena: JsArena::new(),
            path: Vec::new(),
            visit,
        }
    }

    /// Push a node onto the path stack.
    pub fn push_path(&mut self, node: &'a TemplateNode) {
        self.path.push(node);
    }

    /// Pop a node from the path stack.
    pub fn pop_path(&mut self) -> Option<&'a TemplateNode> {
        self.path.pop()
    }

    /// Get the current parent node.
    pub fn current_parent(&self) -> Option<&'a TemplateNode> {
        self.path.last().copied()
    }

    /// Visit a template node and transform it.
    ///
    /// This is the main entry point for visiting nodes during transformation.
    /// When `state_override` is provided, it temporarily replaces the context's
    /// state for the duration of the visit, allowing child visitors to use
    /// the overridden state (e.g., with a different `node` anchor).
    pub fn visit_node(
        &mut self,
        node: &TemplateNode,
        _state_override: Option<&ComponentClientTransformState<'a>>,
    ) -> TransformResult {
        match node {
            TemplateNode::Component(comp) => self.visit_component(comp),
            TemplateNode::SvelteComponent(comp) => self.visit_svelte_component(comp),
            TemplateNode::SvelteSelf(self_node) => self.visit_svelte_self(self_node),
            TemplateNode::SvelteElement(elem) => self.visit_svelte_element(elem),
            TemplateNode::ExpressionTag(expr) => self.visit_expression_tag(expr),
            TemplateNode::RegularElement(elem) => self.visit_regular_element(elem),
            TemplateNode::Text(text) => self.visit_text(text),
            TemplateNode::IfBlock(if_block) => self.visit_if_block(if_block),
            TemplateNode::EachBlock(each_block) => self.visit_each_block(each_block),
            TemplateNode::AwaitBlock(await_block) => self.visit_await_block(await_block),
            TemplateNode::KeyBlock(key_block) => self.visit_key_block(key_block),
            TemplateNode::SnippetBlock(snippet) => self.visit_snippet_block(snippet),
            TemplateNode::RenderTag(render) => self.visit_render_tag(render),
            TemplateNode::HtmlTag(html) => self.visit_html_tag(html),
            TemplateNode::ConstTag(const_tag) => self.visit_const_tag(const_tag),
            TemplateNode::DebugTag(debug_tag) => self.visit_debug_tag(debug_tag),
            TemplateNode::SvelteBoundary(boundary) => self.visit_svelte_boundary(boundary),
            TemplateNode::SvelteHead(head) => self.visit_svelte_head(head),
            TemplateNode::SvelteBody(body) => self.visit_svelte_body(body),
            TemplateNode::SvelteWindow(window) => self.visit_svelte_window(window),
            TemplateNode::SvelteDocument(document) => self.visit_svelte_document(document),
            TemplateNode::TitleElement(title) => self.visit_title_element(title),
            TemplateNode::Comment(comment) => self.visit_comment(comment),
            TemplateNode::SvelteFragment(frag) => self.visit_svelte_fragment(frag),
            TemplateNode::SlotElement(slot) => self.visit_slot_element(slot),
            _ => TransformResult::None,
        }
    }

    // =========================================================================
    // Visitor methods for each node type
    // =========================================================================

    fn visit_component(&mut self, comp: &crate::ast::template::Component) -> TransformResult {
        // Use build_component from the shared utilities
        use crate::compiler::phases::phase3_transform::client::visitors::shared::component::{
            ComponentNode, build_component,
        };

        let component_name = comp.name.to_string();
        let stmt = build_component(ComponentNode::Component(comp.clone()), component_name, self);

        TransformResult::Statement(stmt)
    }

    fn visit_svelte_component(
        &mut self,
        comp: &crate::ast::template::SvelteComponentElement,
    ) -> TransformResult {
        // Use build_component from the shared utilities
        use crate::compiler::phases::phase3_transform::client::visitors::shared::component::{
            ComponentNode, build_component,
        };

        // For svelte:component, we use '$$component' as the component name
        let stmt = build_component(
            ComponentNode::SvelteComponent(comp.clone()),
            "$$component".to_string(),
            self,
        );

        TransformResult::Statement(stmt)
    }

    fn visit_svelte_self(
        &mut self,
        self_node: &crate::ast::template::SvelteElement,
    ) -> TransformResult {
        // Use build_component from the shared utilities
        use crate::compiler::phases::phase3_transform::client::visitors::shared::component::{
            ComponentNode, build_component,
        };

        // For svelte:self, we use the component's own name for self-reference
        let component_name = self.state.analysis.name.clone();
        let stmt = build_component(
            ComponentNode::SvelteSelf(self_node.clone()),
            component_name,
            self,
        );

        TransformResult::Statement(stmt)
    }

    fn visit_svelte_element(
        &mut self,
        elem: &crate::ast::template::SvelteDynamicElement,
    ) -> TransformResult {
        use crate::ast::template::{
            AnimateDirective, Attribute, BindDirective, ClassDirective, LetDirective, OnDirective,
            StyleDirective, TransitionDirective, UseDirective,
        };
        use crate::compiler::phases::phase3_transform::client::visitors::animate_directive::animate_directive;
        use crate::compiler::phases::phase3_transform::client::visitors::attach_tag::attach_tag;
        use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
        use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment as visit_fragment_impl;
        use crate::compiler::phases::phase3_transform::client::visitors::shared::element::build_attribute_effect;
        use crate::compiler::phases::phase3_transform::client::visitors::shared::element::build_set_class;
        use crate::compiler::phases::phase3_transform::client::visitors::transition_directive::transition_directive;
        use crate::compiler::phases::phase3_transform::client::visitors::use_directive::use_directive;
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        // Add a comment node to the template for the anchor
        self.state.template.push_comment(None);

        // Categorize attributes - pre-allocate based on attribute count
        let attr_count = elem.attributes.len();
        let mut attributes: Vec<&Attribute> = Vec::with_capacity(attr_count);
        let mut class_directives: Vec<&ClassDirective> = Vec::new();
        let mut style_directives: Vec<&StyleDirective> = Vec::new();
        let mut on_directives: Vec<OnDirective> = Vec::new();
        let mut transition_directives: Vec<TransitionDirective> = Vec::new();
        let mut use_directives: Vec<UseDirective> = Vec::new();
        let mut let_directives: Vec<LetDirective> = Vec::new();
        let mut bind_directives: Vec<BindDirective> = Vec::new();
        let mut animate_directives: Vec<AnimateDirective> = Vec::new();
        let mut attach_tags: Vec<crate::ast::template::AttachTag> = Vec::new();
        let mut dynamic_namespace: Option<crate::ast::template::AttributeValue> = None;

        for attribute in &elem.attributes {
            match attribute {
                Attribute::Attribute(attr_node) => {
                    // Check for xmlns attribute that is not a text attribute
                    if attr_node.name.as_str() == "xmlns" {
                        use crate::ast::template::{AttributeValue, AttributeValuePart};
                        let is_text = matches!(&attr_node.value, AttributeValue::Sequence(parts)
                            if parts.len() == 1 && matches!(parts.first(), Some(AttributeValuePart::Text(_))));
                        if !is_text {
                            dynamic_namespace = Some(attr_node.value.clone());
                        }
                    }
                    attributes.push(attribute);
                }
                Attribute::SpreadAttribute(_) => {
                    attributes.push(attribute);
                }
                Attribute::ClassDirective(dir) => {
                    class_directives.push(dir);
                }
                Attribute::StyleDirective(dir) => {
                    style_directives.push(dir);
                }
                Attribute::OnDirective(dir) => {
                    on_directives.push(dir.clone());
                }
                Attribute::TransitionDirective(dir) => {
                    transition_directives.push(dir.clone());
                }
                Attribute::UseDirective(dir) => {
                    use_directives.push(dir.clone());
                }
                Attribute::LetDirective(dir) => {
                    let_directives.push(dir.clone());
                }
                Attribute::BindDirective(dir) => {
                    bind_directives.push(dir.clone());
                }
                Attribute::AnimateDirective(dir) => {
                    animate_directives.push(dir.clone());
                }
                Attribute::AttachTag(tag) => {
                    attach_tags.push(tag.clone());
                }
            }
        }

        // Create a temporary inner state to collect statements for the callback
        // These will be wrapped in the callback function for $.element
        let element_id_name = self.state.memoizer.generate_id("$$element");
        let anchor_id_name = "$$anchor".to_string();
        let element_id = b::id(&element_id_name);

        // Store the current node and create inner state vectors
        let mut inner_init: Vec<JsStatement> = Vec::new();
        let mut inner_update: Vec<JsStatement> = Vec::new();
        let mut inner_after_update: Vec<JsStatement> = Vec::new();

        // Check if there are use directives (affects how we handle on: directives)
        let has_use = !use_directives.is_empty();

        // Process OnDirectives
        for on_directive in &on_directives {
            // Save current node and temporarily set to element_id
            let saved_node = self.state.node.clone();
            self.state.node = element_id.clone();

            if let TransformResult::Expression(event_call) = self.visit_on_directive(on_directive) {
                if has_use {
                    // If there's a use: directive, wrap in $.effect
                    inner_init.push(b::stmt(
                        &self.arena,
                        b::call(
                            &self.arena,
                            b::member_path(&self.arena, "$.effect"),
                            vec![b::thunk(&self.arena, event_call)],
                        ),
                    ));
                } else {
                    inner_after_update.push(b::stmt(&self.arena, event_call));
                }
            }

            // Restore node
            self.state.node = saved_node;
        }

        // Process TransitionDirectives
        for trans_directive in &transition_directives {
            // Save current state
            let saved_node = self.state.node.clone();
            let saved_init_len = self.state.init.len();
            let saved_after_update_len = self.state.after_update.len();

            // Temporarily set node to element_id
            self.state.node = element_id.clone();

            transition_directive(trans_directive, self);

            // Collect statements added by transition_directive
            inner_init.extend(self.state.init.drain(saved_init_len..));
            inner_after_update.extend(self.state.after_update.drain(saved_after_update_len..));

            // Restore node
            self.state.node = saved_node;
        }

        // Process UseDirectives (actions)
        for use_dir in &use_directives {
            // Save current state
            let saved_node = self.state.node.clone();

            // Temporarily set node to element_id
            self.state.node = element_id.clone();

            let stmt = use_directive(use_dir, self);
            inner_init.push(stmt);

            // Restore node
            self.state.node = saved_node;
        }

        // Process AnimateDirectives
        for anim_directive in &animate_directives {
            let saved_node = self.state.node.clone();
            let saved_init_len = self.state.init.len();
            let saved_after_update_len = self.state.after_update.len();

            self.state.node = element_id.clone();

            animate_directive(anim_directive, self);

            // Collect statements added by animate_directive
            inner_init.extend(self.state.init.drain(saved_init_len..));
            inner_after_update.extend(self.state.after_update.drain(saved_after_update_len..));

            self.state.node = saved_node;
        }

        // Process BindDirectives
        // In the official compiler, these go through the else branch: context.visit(attribute, inner_context.state)
        for bind_dir in &bind_directives {
            use crate::compiler::phases::phase3_transform::client::visitors::bind_directive::bind_directive;

            let saved_node = self.state.node.clone();
            let saved_init_len = self.state.init.len();
            let saved_after_update_len = self.state.after_update.len();

            self.state.node = element_id.clone();

            // For svelte:element, the parent is the element itself
            bind_directive(
                bind_dir,
                self,
                crate::compiler::phases::phase3_transform::utils::ParentRef::SvelteElement(elem),
            );

            // Collect statements added by bind_directive
            inner_init.extend(self.state.init.drain(saved_init_len..));
            inner_after_update.extend(self.state.after_update.drain(saved_after_update_len..));

            self.state.node = saved_node;
        }

        // Process AttachTags
        // In the official compiler, these go through the else branch: context.visit(attribute, inner_context.state)
        for attach in &attach_tags {
            let saved_node = self.state.node.clone();
            let saved_init_len = self.state.init.len();

            self.state.node = element_id.clone();

            attach_tag(attach, self);

            // Collect statements added by attach_tag
            inner_init.extend(self.state.init.drain(saved_init_len..));

            self.state.node = saved_node;
        }

        // Process attributes.
        // When there's exactly one attribute that is a static text "class" attribute,
        // use build_set_class instead of build_attribute_effect (matches official compiler).
        if !attributes.is_empty() || !class_directives.is_empty() || !style_directives.is_empty() {
            // Save current state
            let saved_node = self.state.node.clone();
            let saved_init_len = self.state.init.len();
            let saved_update_len = self.state.update.len();

            // Temporarily set node to element_id
            self.state.node = element_id.clone();

            // Determine which path to use for attributes, matching the official
            // SvelteElement.js (lines 76-94):
            // 1. Single text class attribute (no directives) -> fast $.set_class
            // 2. Single text class attribute + class directives -> build_set_class
            // 3. Any other attributes/directives -> build_attribute_effect
            let is_single_text_class = attributes.len() == 1
                && style_directives.is_empty()
                && matches!(&attributes[0], Attribute::Attribute(a)
                    if a.name.to_lowercase() == "class" && {
                        use crate::ast::template::AttributeValuePart;
                        matches!(&a.value, crate::ast::template::AttributeValue::Sequence(parts)
                            if parts.iter().all(|p| matches!(p, AttributeValuePart::Text(_))))
                    }
                );

            if is_single_text_class && class_directives.is_empty() {
                // Fast path: single static class attribute, no class directives
                // Build $.set_class call directly
                let css_hash = self.state.analysis.css.hash.clone();
                let is_scoped = elem.metadata.scoped && !css_hash.is_empty();

                if let Attribute::Attribute(attr) = &attributes[0] {
                    // Extract the text value
                    let mut text_value = String::new();
                    if let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value {
                        for part in parts {
                            if let crate::ast::template::AttributeValuePart::Text(t) = part {
                                text_value.push_str(&t.data);
                            }
                        }
                    }

                    // Concatenate CSS hash if scoped
                    let class_str = if is_scoped && !css_hash.is_empty() {
                        if text_value.is_empty() {
                            css_hash.clone()
                        } else {
                            format!("{} {}", text_value, css_hash)
                        }
                    } else {
                        text_value
                    };

                    // $.set_class(element_id, is_html ? 1 : 0, class_value)
                    let set_class_call = b::call(
                        &self.arena,
                        b::member_path(&self.arena, "$.set_class"),
                        vec![
                            b::id(&element_id_name),
                            b::number(0.0), // is_html=false for svelte:element
                            b::string(class_str),
                        ],
                    );
                    self.state.init.push(b::stmt(&self.arena, set_class_call));
                }
            } else if is_single_text_class {
                // Single text class attribute WITH class directives -> build_set_class
                // This matches the official SvelteElement.js line 82:
                //   build_set_class(node, element_id, attributes[0], class_directives, inner_context, false)
                let css_hash = self.state.analysis.css.hash.clone();
                // For svelte:element, is_scoped depends on element.metadata.scoped (set by CSS pruner).
                // Since SvelteDynamicElement has a dynamic tag, the CSS pruner can only match it when
                // the element has explicit class/attribute values that match CSS selectors.
                // Synthesized class attributes (start == u32::MAX, from class-directive-only elements)
                // should NOT be scoped because no CSS selector can match the empty class.
                let is_scoped = elem.metadata.scoped && !css_hash.is_empty();
                let class_attr_value = if let Attribute::Attribute(a) = &attributes[0] {
                    Some(&a.value)
                } else {
                    None
                };
                // Create a dummy RegularElement for the function signature (it's unused)
                let dummy_element = crate::ast::template::RegularElement {
                    start: 0,
                    end: 0,
                    name: "div".into(),
                    name_loc: None,
                    attributes: vec![],
                    fragment: Default::default(),
                    metadata: Default::default(),
                };
                build_set_class(
                    &dummy_element,
                    &element_id_name,
                    class_attr_value,
                    &class_directives,
                    self,
                    false, // is_html=false for svelte:element
                    &css_hash,
                    is_scoped,
                );
            } else if !attributes.is_empty() {
                // Multiple attributes or non-class attributes -> build_attribute_effect
                // Only pass the CSS hash when the element is scoped (matched by CSS selectors)
                let css_hash = if elem.metadata.scoped {
                    self.state.analysis.css.hash.clone()
                } else {
                    String::new()
                };
                build_attribute_effect(
                    &attributes,
                    &class_directives,
                    &style_directives,
                    self,
                    element_id.clone(),
                    &css_hash,
                    false, // should_remove_defaults - not needed for svelte:element
                    false, // ignore_hydration - not needed for svelte:element
                );
            } else if !class_directives.is_empty() {
                // Class directives only (no class attribute) on svelte:element
                // For svelte:element, the CSS hash should NOT be included when there's
                // no static class attribute - pass is_scoped=false to prevent hash injection.
                let css_hash = self.state.analysis.css.hash.clone();
                let dummy_element = crate::ast::template::RegularElement {
                    start: 0,
                    end: 0,
                    name: "div".into(),
                    name_loc: None,
                    attributes: vec![],
                    fragment: Default::default(),
                    metadata: Default::default(),
                };
                build_set_class(
                    &dummy_element,
                    &element_id_name,
                    None, // No class attribute
                    &class_directives,
                    self,
                    false, // is_html=false for svelte:element
                    &css_hash,
                    elem.metadata.scoped && !css_hash.is_empty(),
                );
            }

            // Move statements added to context.state to inner state
            inner_init.extend(self.state.init.drain(saved_init_len..));
            inner_update.extend(self.state.update.drain(saved_update_len..));

            // Restore node
            self.state.node = saved_node;
        } else {
            // No attributes, class directives, or style directives.
            // If the element is scoped, we still need to inject the CSS hash class.
            // The official compiler emits: $.set_class($$element, 0, 'svelte-xyz')
            let css_hash = self.state.analysis.css.hash.clone();
            if elem.metadata.scoped && !css_hash.is_empty() {
                let set_class_call = b::call(
                    &self.arena,
                    b::member_path(&self.arena, "$.set_class"),
                    vec![
                        b::id(&element_id_name),
                        b::number(0.0), // is_html=false for svelte:element
                        b::string(css_hash),
                    ],
                );
                inner_init.push(b::stmt(&self.arena, set_class_call));
            }
        }

        // Build the callback body from inner_init, inner_update, inner_after_update
        // (attributes, directives etc.), plus the fragment body (children)
        let mut callback_body: Vec<JsStatement> = Vec::new();
        callback_body.extend(inner_init);

        // Add template_effect if there are update statements from attributes/directives
        if !inner_update.is_empty() {
            // Use expression body form when there's exactly one expression statement
            // (matches official compiler's `() => expr` vs `() => { stmts }`)
            let callback = if inner_update.len() == 1 {
                if let JsStatement::Expression(ref expr_stmt) = inner_update[0] {
                    b::arrow(
                        &self.arena,
                        vec![],
                        self.arena.get_expr(expr_stmt.expression).clone(),
                    )
                } else {
                    b::arrow_block(vec![], inner_update)
                }
            } else {
                b::arrow_block(vec![], inner_update)
            };
            callback_body.push(b::stmt(
                &self.arena,
                b::call(
                    &self.arena,
                    b::member_path(&self.arena, "$.template_effect"),
                    vec![callback],
                ),
            ));
        }

        callback_body.extend(inner_after_update);

        // Process fragment (children) using the Fragment visitor
        // This matches the official compiler which visits node.fragment as a separate Fragment,
        // producing its own template block with $.text() / $.append() patterns.
        {
            // Determine the namespace for children using determine_namespace_for_children logic.
            // For SvelteElement, there's no `.name` property (it's dynamic via `this`), so
            // the foreignObject check doesn't apply. We check metadata.svg and metadata.mathml.
            // This matches the official compiler: determine_namespace_for_children(node, namespace)
            let child_namespace = if elem.metadata.svg {
                "svg".to_string()
            } else if elem.metadata.mathml {
                "mathml".to_string()
            } else {
                "html".to_string()
            };
            let saved_namespace = self.state.metadata.namespace.clone();
            let saved_svelte_element_child = self.state.metadata.svelte_element_child;
            self.state.metadata.namespace = child_namespace;
            self.state.metadata.svelte_element_child = true;

            let content_fragment = crate::ast::template::Fragment {
                nodes: elem.fragment.nodes.clone(),
                ..Default::default()
            };
            let fragment_block = visit_fragment_impl(&content_fragment, self, false);

            // Restore namespace and svelte_element_child flag
            self.state.metadata.namespace = saved_namespace;
            self.state.metadata.svelte_element_child = saved_svelte_element_child;

            // Add the fragment body to the callback
            callback_body.extend(fragment_block.body);
        }

        // Convert the tag expression, apply transforms, then wrap in thunk.
        // This matches the official compiler: `const get_tag = b.thunk(expression)`
        // where expression has been visited (transforms applied).
        //
        // For prop identifiers: convert → tag, transform → tag(), thunk → () => tag() → unthunk → tag
        // For let/const variables: convert → tag, transform → tag (no change), thunk → () => tag
        // For template literals: convert → `h${size}`, transform → `h${size()}`, thunk → () => `h${size()}`
        use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression;
        use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::expression_has_await;
        let tag_expr = convert_expression(&elem.tag, self);
        let tag_expr = apply_transforms_to_expression(&tag_expr, self);

        let has_await = elem.metadata.expression.has_await() || expression_has_await(&elem.tag);
        let has_blockers = elem.metadata.expression.has_blockers();

        // When has_await, use $.get($$tag) instead of the original tag expression
        let get_tag = if has_await {
            b::thunk(
                &self.arena,
                b::call(
                    &self.arena,
                    b::member_path(&self.arena, "$.get"),
                    vec![b::id("$$tag")],
                ),
            )
        } else {
            b::thunk(&self.arena, tag_expr.clone())
        };

        // Build $.element(...) call
        // $.element(anchor, get_tag, is_svg_or_mathml, callback, namespace, location)
        // Use metadata from Phase 2 analysis (set in svelte_element.rs visitor)
        let is_svg_or_mathml = b::boolean(elem.metadata.svg || elem.metadata.mathml);

        // Clone get_tag before moving it - needed for dev-mode validate calls
        let get_tag_for_validate = if self.state.dev {
            Some(get_tag.clone())
        } else {
            None
        };

        let mut element_args = vec![self.state.node.clone(), get_tag, is_svg_or_mathml];

        // Only add callback if there are statements in the body
        let has_callback = !callback_body.is_empty();
        let has_dynamic_ns = dynamic_namespace.is_some();

        if has_callback || has_dynamic_ns {
            if has_callback {
                let callback = b::arrow_block(
                    vec![
                        b::id_pattern(&element_id_name),
                        b::id_pattern(&anchor_id_name),
                    ],
                    callback_body,
                );
                element_args.push(callback);
            } else {
                // Need a placeholder for callback if only namespace is present
                // undefined is used as a falsy placeholder
                element_args.push(b::undefined(&self.arena));
            }
        }

        // Add namespace argument if dynamic_namespace is present
        if let Some(ns_value) = dynamic_namespace {
            use crate::compiler::phases::phase3_transform::client::visitors::shared::element::build_attribute_value;
            let ns_result = build_attribute_value(&ns_value, self, |expr, _| expr);
            element_args.push(b::thunk(&self.arena, ns_result.value));
        }

        // Dev mode: add location [line, column] as the last argument
        if self.state.dev {
            use crate::compiler::phases::phase3_transform::client::visitors::attribute::locate_in_source;
            let (line, col) = locate_in_source(&self.state.analysis.source, elem.start as usize);
            // Ensure we have enough arguments before the location
            // The function signature is: element(node, get_tag, is_svg_or_mathml, callback?, namespace?, location?)
            // We need to fill in missing optional args with void 0
            let current_len = element_args.len();
            // We need at least 5 args before location (node, tag, svg_or_mathml, callback, namespace)
            while element_args.len() < 5 {
                element_args.push(b::undefined(&self.arena));
            }
            // Restore length if we added too many
            let _ = current_len;
            element_args.push(b::array(vec![
                b::literal_number(line as f64),
                b::literal_number(col as f64),
            ]));
        }

        let element_call_stmt = b::stmt(
            &self.arena,
            b::call(
                &self.arena,
                b::member_path(&self.arena, "$.element"),
                element_args,
            ),
        );

        // Handle LetDirectives by wrapping in ExpressionStatements
        let mut statements = Vec::new();
        for _let_dir in &let_directives {
            // TODO: Implement LetDirective handling
        }

        // Dev mode: add validation calls (matches official SvelteElement.js lines 120-125)
        if let Some(get_tag_dev) = get_tag_for_validate {
            statements.push(b::stmt(
                &self.arena,
                b::call(
                    &self.arena,
                    b::member_path(&self.arena, "$.validate_dynamic_element_tag"),
                    vec![get_tag_dev.clone()],
                ),
            ));
            if !elem.fragment.nodes.is_empty() {
                statements.push(b::stmt(
                    &self.arena,
                    b::call(
                        &self.arena,
                        b::member_path(&self.arena, "$.validate_void_dynamic_element"),
                        vec![get_tag_dev],
                    ),
                ));
            }
        }

        statements.push(element_call_stmt);

        // If the tag expression has await or blockers, wrap in $.async()
        if has_await || has_blockers {
            let metadata = ExpressionMetadata::from_template_metadata(&elem.metadata.expression);
            let blockers_expr = if has_blockers {
                metadata.blockers()
            } else {
                b::array(vec![])
            };

            let async_values = if has_await {
                // Strip the top-level await since $.async handles the awaiting
                b::array(vec![b::thunk(
                    &self.arena,
                    b::strip_await(&self.arena, tag_expr),
                )])
            } else {
                b::undefined(&self.arena)
            };

            let node_name = match &self.state.node {
                JsExpr::Identifier(name) => name.clone(),
                _ => "node".into(),
            };
            let mut callback_params = vec![b::id_pattern(node_name.clone())];
            if has_await {
                callback_params.push(b::id_pattern("$$tag"));
            }

            let callback = b::arrow_block(callback_params, statements);

            self.state.init.push(b::stmt(
                &self.arena,
                b::call(
                    &self.arena,
                    b::member_path(&self.arena, "$.async"),
                    vec![
                        self.state.node.clone(),
                        blockers_expr,
                        async_values,
                        callback,
                    ],
                ),
            ));
        } else if statements.len() == 1 {
            self.state.init.push(statements.into_iter().next().unwrap());
        } else {
            // Wrap multiple statements in a block, matching the official compiler:
            // context.state.init.push(statements.length === 1 ? statements[0] : b.block(statements))
            self.state
                .init
                .push(JsStatement::Block(JsBlockStatement { body: statements }));
        }

        TransformResult::None
    }

    fn visit_expression_tag(
        &mut self,
        _expr: &crate::ast::template::ExpressionTag,
    ) -> TransformResult {
        // TODO: Implement {expression} transformation
        TransformResult::None
    }

    fn visit_regular_element(
        &mut self,
        elem: &crate::ast::template::RegularElement,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::regular_element::visit_regular_element;
        visit_regular_element(elem, self)
    }

    fn visit_text(&mut self, text: &crate::ast::template::Text) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::text::visit_text;
        visit_text(text, self)
    }

    fn visit_if_block(&mut self, if_block: &crate::ast::template::IfBlock) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::if_block::if_block as visit_if_block_impl;
        visit_if_block_impl(if_block, self);
        TransformResult::None
    }

    fn visit_each_block(&mut self, each: &crate::ast::template::EachBlock) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::each_block::each_block as visit_each_block_impl;
        visit_each_block_impl(each, self);
        TransformResult::None
    }

    fn visit_await_block(
        &mut self,
        await_block: &crate::ast::template::AwaitBlock,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::await_block::await_block as visit_await_block_impl;
        visit_await_block_impl(await_block, self);
        TransformResult::None
    }

    fn visit_key_block(&mut self, key: &crate::ast::template::KeyBlock) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::key_block::key_block as visit_key_block_impl;
        visit_key_block_impl(key, self)
    }

    fn visit_snippet_block(
        &mut self,
        snippet: &crate::ast::template::SnippetBlock,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::snippet_block::snippet_block as visit_snippet_block_impl;
        visit_snippet_block_impl(snippet, self);
        TransformResult::None
    }

    fn visit_render_tag(&mut self, render: &crate::ast::template::RenderTag) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::render_tag::render_tag as visit_render_tag_impl;
        let stmt = visit_render_tag_impl(render, self);
        TransformResult::Statement(stmt)
    }

    fn visit_html_tag(&mut self, html: &crate::ast::template::HtmlTag) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::html_tag::html_tag as visit_html_tag_impl;
        let stmt = visit_html_tag_impl(html, self);
        TransformResult::Statement(stmt)
    }

    fn visit_const_tag(&mut self, const_tag: &crate::ast::template::ConstTag) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::const_tag::const_tag as visit_const_tag_impl;
        visit_const_tag_impl(const_tag, self);
        TransformResult::None
    }

    fn visit_debug_tag(&mut self, debug_tag: &crate::ast::template::DebugTag) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::debug_tag::debug_tag as visit_debug_tag_impl;
        visit_debug_tag_impl(debug_tag, self);
        TransformResult::None
    }

    fn visit_svelte_boundary(
        &mut self,
        boundary: &crate::ast::template::SvelteElement,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::svelte_boundary::svelte_boundary as visit_svelte_boundary_impl;
        visit_svelte_boundary_impl(boundary, self);
        TransformResult::None
    }

    fn visit_svelte_head(&mut self, head: &crate::ast::template::SvelteElement) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::svelte_head::svelte_head as visit_svelte_head_impl;
        visit_svelte_head_impl(head, self);
        TransformResult::None
    }

    fn visit_title_element(
        &mut self,
        title: &crate::ast::template::TitleElement,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::title_element::title_element as visit_title_element_impl;
        visit_title_element_impl(title, self);
        TransformResult::None
    }

    fn visit_comment(&mut self, comment: &crate::ast::template::Comment) -> TransformResult {
        // We'll only get here if comments are not filtered out, which they are
        // unless preserveComments is true. The lone-script synthetic comment
        // also arrives here. Corresponds to Comment.js in the official compiler.
        self.state
            .template
            .push_comment(Some(comment.data.to_string()));
        TransformResult::None
    }

    /// Visit a SlotElement node.
    ///
    /// Corresponds to `SlotElement.js` in the official Svelte compiler:
    /// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/SlotElement.js`
    ///
    /// Generates: `$.slot($$anchor, $$props, name, props_expression, fallback)`
    fn visit_slot_element(&mut self, slot: &crate::ast::template::SlotElement) -> TransformResult {
        use crate::ast::template::Attribute;
        use crate::compiler::phases::phase3_transform::client::visitors::shared::element::build_attribute_value;
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        // Push a comment marker in the template (same as official: context.state.template.push_comment())
        self.state.template.push_comment(None);

        let mut props: Vec<JsObjectMember> = Vec::new();
        let mut spreads: Vec<JsExpr> = Vec::new();
        let mut lets: Vec<JsStatement> = Vec::new();
        let mut name = b::string("default".to_string());

        // Track let directive binding names for transform registration
        let mut let_binding_names: Vec<String> = Vec::new();

        // First pass: collect let directives to register transforms before processing attributes
        for attribute in &slot.attributes {
            if let Attribute::LetDirective(let_dir) = attribute {
                let prop_name = &let_dir.name;

                let is_simple = match &let_dir.expression {
                    None => true,
                    Some(expr) => expr.is_identifier_node(),
                };

                if is_simple {
                    let binding_name = match &let_dir.expression {
                        Some(expr) => expr.identifier_name().unwrap_or(prop_name).to_string(),
                        None => prop_name.to_string(),
                    };

                    let derived_fn = if self.state.analysis.runes {
                        "$.derived"
                    } else {
                        "$.derived_safe_equal"
                    };

                    lets.push(b::const_decl(
                        &self.arena,
                        &binding_name,
                        b::call(
                            &self.arena,
                            b::member_path(&self.arena, derived_fn),
                            vec![b::thunk(
                                &self.arena,
                                b::member(&self.arena, b::id("$$slotProps"), prop_name.to_string()),
                            )],
                        ),
                    ));

                    let_binding_names.push(binding_name);
                }
            }
        }

        // Let bindings first, they can be used on attributes
        for let_stmt in &lets {
            self.state.init.push(let_stmt.clone());
        }

        // Register transforms for let directive bindings ($.get(name) when reading)
        // Save existing transforms so we can restore them after
        let mut saved_transforms: Vec<(
            String,
            Option<crate::compiler::phases::phase3_transform::client::types::IdentifierTransform>,
        )> = Vec::new();

        for binding_name in &let_binding_names {
            let existing = self.state.transform.get(binding_name).cloned();
            saved_transforms.push((binding_name.clone(), existing));

            self.state.transform.insert(
                binding_name.clone(),
                crate::compiler::phases::phase3_transform::client::types::IdentifierTransform {
                    read: Some(|arena, node| {
                        b::call(arena, b::member_path(arena, "$.get"), vec![node])
                    }),
                    read_source: None,
                    assign: None,
                    mutate: None,
                    update: None,
                    skip_proxy: false,
                    is_defined: false,
                    is_reactive: true,
                    replacement_id: None,
                },
            );
        }

        // Memoizer: track sync and async memoized expressions
        // Each memoized entry gets an ID ($0, $1, ...) and is either sync or async
        struct SlotMemoEntry {
            expression: JsExpr,
            is_async: bool,
        }
        let mut memo_entries: Vec<SlotMemoEntry> = Vec::new();

        // Second pass: process non-let attributes with transforms registered
        for attribute in &slot.attributes {
            match attribute {
                Attribute::SpreadAttribute(spread) => {
                    let expression = crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression(
                        &spread.expression, self,
                    );
                    let transformed = crate::compiler::phases::phase3_transform::client::visitors::shared::utils::apply_transforms_to_expression(
                        &expression, self,
                    );
                    spreads.push(b::thunk(&self.arena, transformed));
                }
                Attribute::Attribute(attr) => {
                    // Use the memoizer callback: if expression has_call or has_await,
                    // memoize it and replace with $.get($N)
                    let memo_idx_start = memo_entries.len();
                    let arena_ref = unsafe { &*(&self.arena as *const _) };
                    let result = build_attribute_value(&attr.value, self, |value, metadata| {
                        let has_call = metadata.has_call();
                        let has_await = metadata.has_await();
                        if has_call || has_await {
                            // This expression needs memoization
                            // We'll track the index and expression, then replace with $.get($N)
                            let idx = memo_idx_start + memo_entries.len();
                            memo_entries.push(SlotMemoEntry {
                                expression: value,
                                is_async: has_await,
                            });
                            let param_id = b::id(format!("${idx}"));
                            b::call(
                                arena_ref,
                                b::member_path(arena_ref, "$.get"),
                                vec![param_id],
                            )
                        } else {
                            value
                        }
                    });

                    if attr.name.as_str() == "name" {
                        name = result.value;
                    } else if attr.name.as_str() != "slot" {
                        if result.has_state {
                            props.push(b::getter(
                                &self.arena,
                                attr.name.as_str(),
                                vec![b::return_value(&self.arena, result.value)],
                            ));
                        } else {
                            props.push(b::prop(&self.arena, attr.name.as_str(), result.value));
                        }
                    }
                }
                Attribute::LetDirective(_) => {
                    // Already processed in first pass
                }
                _ => {}
            }
        }

        // Build props expression
        let props_expression = if spreads.is_empty() {
            b::object(props)
        } else {
            let mut args = vec![b::object(props)];
            args.extend(spreads);
            b::call(
                &self.arena,
                b::member_path(&self.arena, "$.spread_props"),
                args,
            )
        };

        // Build fallback function
        let fallback = if slot.fragment.nodes.is_empty() {
            b::null()
        } else {
            // Visit the fragment to generate the fallback function body
            // This uses the Fragment visitor, matching the official: context.visit(node.fragment)
            use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment as visit_fragment_impl;

            let inner_fragment = crate::ast::template::Fragment {
                nodes: slot.fragment.nodes.clone(),
                ..Default::default()
            };
            let block = visit_fragment_impl(&inner_fragment, self, false);

            if block.body.is_empty() {
                b::null()
            } else {
                b::arrow_block(vec![b::id_pattern("$$anchor")], block.body)
            }
        };

        // Restore original transforms after visiting children
        for (name, saved) in &saved_transforms {
            if let Some(original_transform) = saved {
                self.state
                    .transform
                    .insert(name.clone(), original_transform.clone());
            } else {
                self.state.transform.remove(name);
            }
        }

        // Generate: $.slot(node, $$props, name, props_expression, fallback)
        let slot_call = b::call(
            &self.arena,
            b::member_path(&self.arena, "$.slot"),
            vec![
                self.state.node.clone(),
                b::id("$$props"),
                name,
                props_expression,
                fallback,
            ],
        );

        // Check if we have any async memoized entries
        let has_async = memo_entries.iter().any(|e| e.is_async);

        if has_async {
            // Build sync derived declarations
            let sync_entries: Vec<(usize, &SlotMemoEntry)> = memo_entries
                .iter()
                .enumerate()
                .filter(|(_, e)| !e.is_async)
                .collect();

            let async_entries: Vec<(usize, &SlotMemoEntry)> = memo_entries
                .iter()
                .enumerate()
                .filter(|(_, e)| e.is_async)
                .collect();

            // Build statements: derived declarations + slot call
            let mut statements: Vec<JsStatement> = Vec::new();

            // Add sync derived declarations: let $N = $.derived(() => expr)
            let derived_fn = if self.state.analysis.runes {
                "$.derived"
            } else {
                "$.derived_safe_equal"
            };
            for (idx, entry) in &sync_entries {
                statements.push(b::let_decl(
                    &self.arena,
                    format!("${idx}"),
                    Some(b::call(
                        &self.arena,
                        b::member_path(&self.arena, derived_fn),
                        vec![b::thunk(&self.arena, entry.expression.clone())],
                    )),
                ));
            }

            // Add the slot call
            statements.push(b::stmt(&self.arena, slot_call));

            // Build async_values array: [thunk1, thunk2]
            let async_values = b::array(
                async_entries
                    .iter()
                    .map(|(_, entry)| build_slot_async_thunk(&entry.expression, &self.arena))
                    .collect(),
            );

            // Build async callback params: (node, $async_id_0, $async_id_1, ...)
            let node_param_name = match &self.state.node {
                JsExpr::Identifier(name) => name.to_string(),
                _ => "node".to_string(),
            };
            let mut params: Vec<JsPattern> = vec![JsPattern::Identifier(node_param_name.into())];
            for (idx, _) in &async_entries {
                params.push(JsPattern::Identifier(format!("${idx}").into()));
            }

            // Generate: $.async(node, void 0, async_values, (node, $0) => { statements })
            let async_call = b::call(
                &self.arena,
                b::member_path(&self.arena, "$.async"),
                vec![
                    self.state.node.clone(),
                    b::undefined(&self.arena), // blockers
                    async_values,              // async_values
                    b::arrow_block(params, statements),
                ],
            );

            self.state.init.push(b::stmt(&self.arena, async_call));
        } else if !memo_entries.is_empty() {
            // Non-async case but with memoized entries:
            // Wrap in a block scope with derived declarations
            let derived_fn = if self.state.analysis.runes {
                "$.derived"
            } else {
                "$.derived_safe_equal"
            };
            let mut statements: Vec<JsStatement> = Vec::new();
            for (idx, entry) in memo_entries.iter().enumerate() {
                let deep_read_expr = if !self.state.analysis.runes {
                    // In legacy mode, add $.deep_read_state(deps) for reactive tracking
                    // followed by $.untrack(() => expr)
                    b::call(
                        &self.arena,
                        b::member_path(&self.arena, derived_fn),
                        vec![b::thunk(&self.arena, entry.expression.clone())],
                    )
                } else {
                    b::call(
                        &self.arena,
                        b::member_path(&self.arena, derived_fn),
                        vec![b::thunk(&self.arena, entry.expression.clone())],
                    )
                };
                statements.push(b::let_decl(
                    &self.arena,
                    format!("${idx}"),
                    Some(deep_read_expr),
                ));
            }
            statements.push(b::stmt(&self.arena, slot_call));
            // Wrap in block scope so $0, $1, etc. don't leak
            self.state.init.push(JsStatement::Block(
                crate::compiler::phases::phase3_transform::js_ast::nodes::JsBlockStatement::with_body(statements)
            ));
        } else {
            self.state.init.push(b::stmt(&self.arena, slot_call));
        }

        TransformResult::None
    }

    /// Visit a SvelteFragment node.
    ///
    /// Corresponds to `SvelteFragment.js` in the official Svelte compiler:
    /// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/SvelteFragment.js`
    ///
    /// SvelteFragment nodes (`<svelte:fragment>`) are wrappers that:
    /// 1. Define a named slot (via `slot="name"` attribute)
    /// 2. Provide `let:` directives that expose slot props to children
    /// 3. Their CHILDREN are what should be rendered in the slot
    ///
    /// The visitor processes let: directives (registering transforms and creating
    /// derived declarations), then visits the inner fragment children.
    fn visit_svelte_fragment(
        &mut self,
        frag: &crate::ast::template::SvelteElement,
    ) -> TransformResult {
        use crate::ast::template::Attribute;
        use crate::compiler::phases::phase3_transform::client::visitors::fragment::fragment as visit_fragment_impl;
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        // Process let: directives
        // This generates `const name = $.derived_safe_equal(() => $$slotProps.prop_name)`
        // and registers read transforms so the children can access the slot props
        let mut let_stmts: Vec<JsStatement> = Vec::new();
        let mut let_names: Vec<compact_str::CompactString> = Vec::new();
        // Save existing transforms that will be shadowed by let directives,
        // so we can restore them after visiting children.
        let mut saved_transforms: Vec<(String, Option<IdentifierTransform>)> = Vec::new();

        for attribute in &frag.attributes {
            if let Attribute::LetDirective(let_dir) = attribute {
                let prop_name = &let_dir.name;

                // Check if expression is an Identifier or null (simple case)
                let is_simple = match &let_dir.expression {
                    None => true,
                    Some(expr) => expr.is_identifier_node(),
                };

                if is_simple {
                    // Simple case: let:x or let:x={y}
                    let name = match &let_dir.expression {
                        Some(expr) => expr.identifier_name().unwrap_or(prop_name).to_string(),
                        None => prop_name.to_string(),
                    };

                    let_names.push(name.clone().into());

                    let derived_fn = if self.state.analysis.runes {
                        "$.derived"
                    } else {
                        "$.derived_safe_equal"
                    };

                    let_stmts.push(b::const_decl(
                        &self.arena,
                        &name,
                        b::call(
                            &self.arena,
                            b::member_path(&self.arena, derived_fn),
                            vec![b::thunk(
                                &self.arena,
                                b::member(&self.arena, b::id("$$slotProps"), prop_name.to_string()),
                            )],
                        ),
                    ));

                    // Save existing transform before overwriting
                    saved_transforms.push((name.clone(), self.state.transform.get(&name).cloned()));

                    // Register transform so children can read this variable via $.get()
                    self.state.transform.insert(
                        name.clone(),
                        IdentifierTransform {
                            read: Some(|arena, node| {
                                b::call(arena, b::member_path(arena, "$.get"), vec![node])
                            }),
                            read_source: None,
                            assign: None,
                            mutate: None,
                            update: None,
                            skip_proxy: false,
                            is_defined: false,
                            is_reactive: true,
                            replacement_id: None,
                        },
                    );
                } else {
                    // Destructured case: let:x={{y, z}} or let:x={[a, b]}
                    // Generates: const derived_name = $.derived(() => { let {y, z} = $$slotProps.x; return {y, z}; })
                    // And registers transforms: y -> $.get(derived_name).y, z -> $.get(derived_name).z
                    if let Some(expr) = &let_dir.expression {
                        {
                            let expr_type = expr.node_type().unwrap_or("");
                            // Extract binding names from the expression
                            let mut binding_names: Vec<compact_str::CompactString> = Vec::new();
                            let node = expr.as_node();
                            match &*node {
                                crate::ast::typed_expr::JsNode::ObjectExpression {
                                    properties,
                                    ..
                                } => {
                                    // Object destructuring: {y, z}
                                    for prop in self.state.parse_arena.get_js_children(*properties)
                                    {
                                        if let Some(key_id) = prop.key() {
                                            let key = self.state.parse_arena.get_js_node(key_id);
                                            if let Some(name) = key.name() {
                                                binding_names.push(name.into());
                                            }
                                        }
                                    }
                                }
                                crate::ast::typed_expr::JsNode::ArrayExpression {
                                    elements,
                                    ..
                                } => {
                                    for elem in elements.iter().flatten() {
                                        if let Some(name) = elem.name() {
                                            binding_names.push(name.into());
                                        }
                                    }
                                }
                                crate::ast::typed_expr::JsNode::Raw(val) => {
                                    if let Some(obj) = val.as_object() {
                                        let expr_type =
                                            obj.get("type").and_then(|t| t.as_str()).unwrap_or("");
                                        if expr_type == "ObjectExpression" {
                                            if let Some(serde_json::Value::Array(props)) =
                                                obj.get("properties")
                                            {
                                                for prop in props {
                                                    if let Some(name) = prop
                                                        .get("key")
                                                        .and_then(|k| k.get("name"))
                                                        .and_then(|n| n.as_str())
                                                    {
                                                        binding_names.push(name.into());
                                                    }
                                                }
                                            }
                                        } else if expr_type == "ArrayExpression" {
                                            if let Some(serde_json::Value::Array(elements)) =
                                                obj.get("elements")
                                            {
                                                for elem in elements {
                                                    if let Some(name) =
                                                        elem.get("name").and_then(|n| n.as_str())
                                                    {
                                                        binding_names.push(name.into());
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                _ => {}
                            }

                            if !binding_names.is_empty() {
                                // Generate unique name for the derived variable
                                let derived_name = self.state.memoizer.generate_id(prop_name);
                                let_names.push(derived_name.clone().into());
                                // Save existing transform for derived_name (if any) before it could be shadowed
                                saved_transforms.push((
                                    derived_name.clone(),
                                    self.state.transform.get(&derived_name).cloned(),
                                ));

                                // Register transforms for each binding:
                                // binding_name -> $.get(derived_name).binding_name
                                for binding_name in &binding_names {
                                    let derived_name_clone = derived_name.clone();
                                    let_names.push(binding_name.clone());
                                    // Save existing transform before overwriting
                                    saved_transforms.push((
                                        binding_name.to_string(),
                                        self.state.transform.get(binding_name.as_str()).cloned(),
                                    ));
                                    self.state.transform.insert(
                                        binding_name.to_string(),
                                        IdentifierTransform {
                                            read: Some(|arena, node| {
                                                // The node is the identifier (e.g., `num`)
                                                // We need to produce: $.get(derived_name).num
                                                // But we can't capture derived_name in a fn pointer.
                                                // Instead we use read_source which is checked
                                                // in apply_transforms_to_expression.
                                                b::call(
                                                    arena,
                                                    b::member_path(arena, "$.get"),
                                                    vec![node],
                                                )
                                            }),
                                            read_source: Some(derived_name_clone),
                                            assign: None,
                                            mutate: None,
                                            update: None,
                                            skip_proxy: false,
                                            is_defined: false,
                                            is_reactive: true,
                                            replacement_id: None,
                                        },
                                    );
                                }

                                // Build the destructuring pattern
                                let destructuring_pat = if expr_type == "ObjectExpression" {
                                    b::object_pattern(
                                        binding_names
                                            .iter()
                                            .map(|n| JsObjectPatternProperty::Property {
                                                key: JsPropertyKey::Identifier(n.clone()),
                                                value: b::id_pattern(n.clone()),
                                                computed: false,
                                                shorthand: true,
                                            })
                                            .collect(),
                                    )
                                } else {
                                    b::array_pattern(
                                        binding_names
                                            .iter()
                                            .map(|n| Some(b::id_pattern(n.clone())))
                                            .collect(),
                                    )
                                };

                                // Build the return object: { a, b }
                                let return_obj_expr = b::object(
                                    binding_names
                                        .iter()
                                        .map(|n| b::prop(&self.arena, n.clone(), b::id(n.clone())))
                                        .collect(),
                                );

                                // Generate: const derived_name = $.derived(() => {
                                //   let { y, z } = $$slotProps.prop_name;
                                //   return { y, z };
                                // })
                                // Note: destructured case always uses $.derived (not $.derived_safe_equal)
                                let inner_let = b::var_decl_pattern(
                                    &self.arena,
                                    JsVariableKind::Let,
                                    destructuring_pat,
                                    Some(b::member(
                                        &self.arena,
                                        b::id("$$slotProps"),
                                        prop_name.to_string(),
                                    )),
                                );
                                let inner_return = b::return_value(&self.arena, return_obj_expr);
                                let_stmts.push(b::const_decl(
                                    &self.arena,
                                    &derived_name,
                                    b::call(
                                        &self.arena,
                                        b::member_path(&self.arena, "$.derived"),
                                        vec![b::arrow_block(vec![], vec![inner_let, inner_return])],
                                    ),
                                ));
                            }
                        }
                    }
                }
            }
        }

        // Push the let directive statements to init
        for stmt in &let_stmts {
            self.state.init.push(stmt.clone());
        }

        // Visit the inner fragment and push its body statements to init
        // This mirrors: context.state.init.push(...context.visit(node.fragment).body);
        let inner_fragment = crate::ast::template::Fragment {
            nodes: frag.fragment.nodes.clone(),
            ..Default::default()
        };
        let block = visit_fragment_impl(&inner_fragment, self, false);
        self.state.init.extend(block.body);

        // Restore original transforms that were saved before let: directives
        for (name, saved) in &saved_transforms {
            if let Some(original_transform) = saved {
                self.state
                    .transform
                    .insert(name.clone(), original_transform.clone());
            } else {
                self.state.transform.remove(name);
            }
        }

        TransformResult::None
    }

    fn visit_svelte_body(&mut self, body: &crate::ast::template::SvelteElement) -> TransformResult {
        self.visit_special_element(body, "$.document.body");
        TransformResult::None
    }

    fn visit_svelte_window(
        &mut self,
        window: &crate::ast::template::SvelteElement,
    ) -> TransformResult {
        self.visit_special_element(window, "$.window");
        TransformResult::None
    }

    fn visit_svelte_document(
        &mut self,
        document: &crate::ast::template::SvelteElement,
    ) -> TransformResult {
        self.visit_special_element(document, "$.document");
        TransformResult::None
    }

    /// Visit a special element (svelte:body, svelte:window, svelte:document).
    ///
    /// These elements bind to global objects and have their attributes processed
    /// in a special way.
    fn visit_special_element(&mut self, element: &crate::ast::template::SvelteElement, id: &str) {
        use crate::ast::template::Attribute;
        use crate::compiler::phases::phase3_transform::client::visitors::attribute::is_event_attribute;
        use crate::compiler::phases::phase3_transform::client::visitors::shared::events::{
            build_event, convert_arrow_to_named_function,
        };
        use crate::compiler::phases::phase3_transform::client::visitors::use_directive::use_directive;
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        // Save the current node and set it to the special element's reference
        let old_node = std::mem::replace(&mut self.state.node, b::member_path(&self.arena, id));

        // Process all attributes on the element
        for attribute in &element.attributes {
            match attribute {
                Attribute::UseDirective(use_dir) => {
                    // Handle use: directives on special elements
                    let stmt = use_directive(use_dir, self);
                    self.state.init.push(stmt);
                }
                Attribute::OnDirective(on_dir) => {
                    // Handle on: directives on special elements
                    if let TransformResult::Expression(expr) = self.visit_on_directive(on_dir) {
                        self.state.init.push(b::stmt(&self.arena, expr));
                    }
                }
                Attribute::BindDirective(bind_dir) => {
                    // Handle bind: directives on special elements
                    self.visit_bind_directive(
                        bind_dir,
                        crate::compiler::phases::phase3_transform::utils::ParentRef::None,
                    );
                }
                Attribute::AttachTag(attach) => {
                    // Handle {@attach ...} directives on special elements like
                    // `<svelte:body {@attach swipe} />`. Mirrors RegularElement.js behavior.
                    crate::compiler::phases::phase3_transform::client::visitors::attach_tag::attach_tag(attach, self);
                }
                Attribute::Attribute(_attr_node) => {
                    // Handle event attributes like onclick={...} on special elements
                    if let Some(event_attr) = is_event_attribute(attribute) {
                        // Extract event name (remove "on" prefix)
                        let mut event_name = &event_attr.name[2..];
                        let mut capture = false;

                        // Check if this is a capture event (e.g., "clickcapture")
                        if event_name.ends_with("capture") && event_name.len() > 7 {
                            event_name = &event_name[..event_name.len() - 7];
                            capture = true;
                        }

                        // Extract and convert the handler expression
                        let saved_in_event = self.state.in_event_attribute_handler;
                        self.state.in_event_attribute_handler = true;
                        let handler = extract_event_handler(&event_attr.value, self);
                        self.state.in_event_attribute_handler = saved_in_event;

                        // Build the $.event() call
                        // For special elements, events are never delegated and always go to init
                        let passive = is_passive_event(event_name);
                        // In dev mode, convert arrow function handlers to named functions
                        // Only generate a name if handler is actually an arrow function
                        let handler =
                            if self.state.options.dev && matches!(handler, JsExpr::Arrow(_)) {
                                let name = self.state.memoizer.generate_id(event_name);
                                convert_arrow_to_named_function(handler, name.into())
                            } else {
                                handler
                            };
                        let event_call = build_event(
                            &self.arena,
                            event_name,
                            &self.state.node,
                            handler,
                            capture,
                            passive,
                            false,
                        );
                        self.state.init.push(b::stmt(&self.arena, event_call));
                    }
                }
                // Other directive types are not typically used on special elements
                _ => {}
            }
        }

        // Restore the original node
        self.state.node = old_node;
    }

    pub fn visit_on_directive(
        &mut self,
        on_directive: &crate::ast::template::OnDirective,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::on_directive::on_directive as visit_on_directive_impl;
        let expr = visit_on_directive_impl(on_directive, self);
        TransformResult::Expression(expr)
    }

    /// Visit a BindDirective node.
    ///
    /// This handles bind: directives like bind:value, bind:checked, bind:this, etc.
    pub fn visit_bind_directive(
        &mut self,
        bind_directive: &crate::ast::template::BindDirective,
        parent: crate::compiler::phases::phase3_transform::utils::ParentRef<'_>,
    ) -> TransformResult {
        use crate::compiler::phases::phase3_transform::client::visitors::bind_directive::bind_directive as visit_bind_directive_impl;
        visit_bind_directive_impl(bind_directive, self, parent)
    }
}

/// Extract an event handler from an attribute value.
///
/// This helper extracts the expression from an event attribute and builds
/// the appropriate event handler expression.
fn extract_event_handler(
    value: &crate::ast::template::AttributeValue,
    context: &mut ComponentContext,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::attribute::{
        build_event_handler, extract_expression_tag,
    };
    let expr_tag = extract_expression_tag(value);
    build_event_handler(expr_tag, context)
}

/// Check if an event is passive.
fn is_passive_event(name: &str) -> Option<bool> {
    crate::compiler::phases::phase3_transform::client::visitors::attribute::is_passive_event(name)
}

/// Result of visiting a node.
#[derive(Debug, Clone)]
pub enum TransformResult {
    /// An expression was produced
    Expression(JsExpr),
    /// A statement was produced
    Statement(JsStatement),
    /// A block statement was produced
    Block(JsBlockStatement),
    /// No output was produced
    None,
}

/// Compile options for transformation.
///
/// Corresponds to `ValidatedCompileOptions` in Svelte's types (simplified).
#[derive(Debug, Clone)]
pub struct TransformOptions {
    /// Development mode
    pub dev: bool,

    /// Fragments mode (html or tree)
    pub fragments: FragmentsMode,

    /// Whether to preserve whitespace
    pub preserve_whitespace: bool,

    /// Whether to preserve comments
    pub preserve_comments: bool,

    /// Whether experimental.async is enabled
    /// When true, Svelte 5 async features are enabled and legacy reactivity
    /// patterns should not be used even for non-runes components.
    pub experimental_async: bool,

    /// Whether HMR (Hot Module Replacement) is enabled.
    /// When true, components need fragment wrappers even in standalone mode
    /// because $.hmr() uses block/branch effects that need stable anchor nodes.
    pub hmr: bool,
}

impl Default for TransformOptions {
    fn default() -> Self {
        Self {
            dev: false,
            fragments: FragmentsMode::Html,
            preserve_whitespace: false,
            preserve_comments: false,
            experimental_async: false,
            hmr: false,
        }
    }
}

/// Fragments mode.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FragmentsMode {
    Html,
    Tree,
}

/// Async const declarations.
#[derive(Debug, Clone)]
pub struct AsyncConsts {
    pub id: JsExpr,
    pub thunks: Vec<JsExpr>,
}

/// Client-side transformation state.
///
/// Corresponds to `ComponentClientTransformState` in Svelte's types.
#[derive(Debug, Clone)]
pub struct ComponentClientTransformState<'a> {
    /// Parse-phase arena for resolving JsNodeId/IdRange in typed expressions.
    pub parse_arena: &'a ParseArena,

    /// Current scope
    pub scope: &'a Scope,

    /// Scopes mapped to their corresponding nodes (for each blocks, etc.)
    pub scopes: FxHashMap<String, &'a Scope>,

    /// Analysis results
    pub analysis: &'a ComponentAnalysis,

    /// Root scope with all bindings
    pub scope_root: &'a ScopeRoot,

    /// Compile options
    pub options: Rc<TransformOptions>,

    /// Hoisted statements (declarations that go at the top level)
    pub hoisted: Vec<JsStatement>,

    /// Template building state
    pub template: Template,

    /// Initialization statements (run once)
    pub init: Vec<JsStatement>,

    /// Update statements (run on state changes)
    pub update: Vec<JsStatement>,

    /// After-update statements (run after DOM updates)
    pub after_update: Vec<JsStatement>,

    /// Transformed {@const} declarations
    pub consts: Vec<JsStatement>,

    /// Transformed async {@const} declarations (if any)
    pub async_consts: Option<AsyncConsts>,

    /// Transformed let: directives
    pub let_directives: Vec<JsExpressionStatement>,

    /// Current node being processed (usually an anchor)
    pub node: JsExpr,

    /// Memoizer for expressions
    pub memoizer: Memoizer,

    /// Transform rules for identifiers (uses im::HashMap for O(1) clone)
    pub transform: ImHashMap<String, IdentifierTransform>,

    /// Delegated events (insertion-ordered to match official compiler's Set<string>)
    pub events: indexmap::IndexSet<String>,

    /// Metadata about the component
    pub metadata: ComponentMetadata,

    /// Whether we're inside a class constructor
    pub in_constructor: bool,

    /// Whether we're inside a $derived expression
    pub in_derived: bool,

    /// Whether we're in development mode (deprecated, use options.dev)
    pub dev: bool,

    /// State fields in class components (maps field name to field info)
    pub state_fields: FxHashMap<String, StateField>,

    /// Whether the current context belongs to the instance scope
    pub is_instance: bool,

    /// Imports that should be re-evaluated in legacy mode following a mutation
    pub legacy_reactive_imports: Vec<JsStatement>,

    /// Whether to preserve whitespace (deprecated, use options.preserve_whitespace)
    pub preserve_whitespace: bool,

    /// Snippets hoisted to the instance level (within the component function).
    /// These are snippets that reference instance-level state and can't be hoisted to module level.
    pub instance_level_snippets: Vec<JsStatement>,

    /// Snippets hoisted to the module level (outside the component function).
    /// These are snippets that don't reference instance-level state and can be safely hoisted.
    pub module_level_snippets: Vec<JsStatement>,

    /// Names of snippets declared in this component.
    /// Used to determine if an identifier reference should be treated as having state
    /// (snippet references need to be wrapped in getters when passed as props).
    /// Uses im::HashSet for O(1) clone.
    pub snippet_names: ImHashSet<String>,

    /// Flag indicating if we're in a direct assignment LHS (props.X = ...).
    /// This is used to skip rest_prop → $$props transformation for direct property assignments.
    pub in_direct_assignment_lhs: bool,

    /// Flag indicating if we're inside a bind directive expression.
    /// Used to skip coercive assignment transforms ($.assign_nullish, etc.) for bind setters.
    pub in_bind_directive: bool,

    /// Flag indicating if we're inside an event attribute handler (e.g., onclick={() => ...}).
    /// Used to track the event handler context so that the expression converter can skip
    /// coercive assignment transforms for the direct body of event handler arrow functions.
    /// Reference: AssignmentExpression.js lines 189-209 in the official Svelte compiler.
    pub in_event_attribute_handler: bool,

    /// Depth counter for tracking whether we're at the direct body level of an event
    /// handler arrow function. Set to 1 when processing the body expression of an
    /// event handler arrow, and 0 otherwise. Nested expressions reset this to 0.
    /// When this is 1 AND in_event_attribute_handler is true, coercive assignment
    /// transforms ($.assign) are skipped (matching Svelte's path-based check).
    pub event_handler_arrow_body_level: u32,

    /// Flag indicating if the current EachBlock should be treated as "controlled".
    /// A controlled each block is one that is the only child of a static element.
    /// This flag is set in fragment.rs process_children and checked in each_block.rs.
    pub is_controlled_each: bool,

    /// Local snippets for child processing (used when processing element children).
    /// In the JS version, this is `child_state.snippets`.
    /// When snippets are defined inside elements, they go here instead of init.
    pub snippets: Vec<JsStatement>,

    /// Nesting level for template nodes (elements, blocks, etc.).
    /// This is used by place_snippet_declaration to determine if a snippet is at root level.
    /// A value of 0 means we're at the component root, >0 means inside an element/block.
    pub template_nesting_level: usize,

    /// Whether we are inside a control flow block (if/each/await/key).
    /// Used for bind:this validation - bind:this only needs validation inside control flow blocks.
    pub in_control_flow_block: bool,

    /// Shared flag for tracking whether the each block index variable was accessed
    /// during body traversal. Uses `Rc<Cell<bool>>` for interior mutability since
    /// transform read callbacks are function pointers that can't capture mutable state.
    pub each_index_used: Rc<Cell<bool>>,

    /// The name of the current each block's index variable, if any.
    /// Used by apply_transforms_to_expression_with_shadowed to detect index accesses.
    pub each_index_name: Option<String>,

    /// Stack of ancestor each-block index entries: (index_name, index_used_flag).
    /// When inside a nested each block, this allows detecting when an ancestor's
    /// index variable is used in the nested body.
    pub ancestor_each_index_names: Vec<(String, Rc<Cell<bool>>)>,

    /// Shared flag for tracking whether the each block item variable was assigned or mutated
    /// during body traversal. This mirrors the official Svelte compiler's approach where
    /// `uses_index` is set to `true` inside the assign/mutate transform callbacks.
    pub each_item_assign_or_mutate: Rc<Cell<bool>>,

    /// The names of the current each block's item variables (from context pattern).
    /// For simple `{#each items as item}`, this is `["item"]`.
    /// For destructured patterns, this contains all declared names.
    /// Used by apply_transforms_to_expression_with_shadowed to detect item assigns/mutates.
    pub each_item_names: Vec<compact_str::CompactString>,

    /// Stack of each-block binding contexts.
    /// When inside an each block in legacy mode, this contains information needed
    /// to generate correct binding getters/setters with $.invalidate_inner_signals().
    /// Each entry represents a nested each block level.
    pub each_binding_context: Vec<EachBindingContext>,

    /// Local variable init expression types for scope-aware should_proxy() decisions.
    /// Maps variable name -> AST node type string of the init expression (e.g., "BinaryExpression").
    /// This is populated during block statement conversion for variables declared with
    /// `const`/`let`/`var` inside function bodies (arrow functions, function expressions),
    /// enabling should_proxy() to trace through local identifier references.
    /// Uses a Vec stack of HashMaps to support nested scopes.
    pub local_var_init_types: Vec<FxHashMap<String, String>>,

    /// Counter for generating unique `$$array` variable names across the entire component.
    /// Shared via `Rc<Cell<usize>>` so all child states use the same counter, matching the
    /// official compiler's `scope.root.conflicts` set where all `$$array` name generators
    /// share a single pool.
    pub destructure_array_counter: Rc<Cell<usize>>,

    /// Flag set during client transform when an `on:` directive without an expression
    /// (event forwarding/bubbling) is encountered. This mirrors the official compiler's
    /// behavior where `context.state.analysis.needs_props = true` is set in the client
    /// transform's OnDirective visitor (NOT in the analyze phase), so that only the client
    /// output gets $$props injected, not the server output.
    /// Uses `Rc<Cell<bool>>` so the flag is shared across all child states.
    pub needs_props_from_events: Rc<Cell<bool>>,

    /// Whether the component needs ownership mutation validation.
    /// Set to true when `validate_mutation()` or ownership binding validation is used.
    /// Uses `Rc<Cell<bool>>` so the flag is shared across all child states.
    pub needs_mutation_validation: Rc<Cell<bool>>,

    /// Binding names hidden from `get_binding()` in named slot contexts.
    pub hidden_let_bindings: FxHashSet<String>,

    /// Names of function parameters that shadow prop bindings.
    /// When a function parameter has the same name as a destructured prop,
    /// the parameter shadows the prop and should NOT be replaced with `$$props.x`.
    /// This is populated when entering function bodies and cleared when leaving.
    pub shadowed_prop_names: im::HashSet<String>,

    /// Mapping from variable names to their promise indices in $$promises.
    /// Populated during async body transformation, used by template visitors
    /// to determine which expressions need `$.async()` wrapping.
    /// e.g., if `condition` is assigned in the 2nd thunk (index 1), then
    /// `blocker_map["condition"] = 1`.
    /// Uses `Rc<RefCell<...>>` for shared ownership across nested states.
    pub blocker_map: Rc<std::cell::RefCell<rustc_hash::FxHashMap<String, usize>>>,

    /// Extra blocker indices accumulated from expressions that were evaluated to
    /// literals at compile time but still reference variables in the blocker_map.
    /// These are merged into the blocker detection in Fragment visitor.
    pub extra_blocker_indices: Vec<usize>,

    /// Whether the fragment is standalone (single Component or RenderTag that
    /// doesn't need a template wrapper). Set by Fragment visitor and consumed by
    /// component/render-tag visitors to know if `$.next()` is needed after `$.async()`.
    /// Corresponds to `context.state.is_standalone` in the official Svelte compiler.
    pub is_standalone: bool,

    /// Mapping from variable names to their blocker expressions for `{@const}` tag async tracking.
    /// When a `{@const}` declares a variable inside a `$.run()` group, the blocker expression
    /// (e.g., `promises[0]`, `promises_1[1]`) is recorded here so that subsequent `{@const}` tags
    /// that reference this variable can add wait thunks.
    /// This mirrors the official Svelte compiler's `binding.blocker` mechanism.
    /// Uses `Rc<RefCell<...>>` for shared ownership across nested fragment states.
    pub const_blocker_map: Rc<std::cell::RefCell<rustc_hash::FxHashMap<String, JsExpr>>>,
}

/// Context information for generating bindings inside each blocks.
///
/// In legacy mode, bindings inside each blocks need special handling:
/// - Getters use `$.get($$item).prop` instead of raw `item.prop`
/// - Setters include `$.invalidate_inner_signals()` to propagate changes
/// - The each callback gets extra `$$index` and `$$array` params
#[derive(Debug, Clone)]
pub struct EachBindingContext {
    /// The item parameter name (e.g., "item", "$$item")
    pub item_name: String,

    /// Whether the item is reactive (wrapped in $.get())
    pub item_reactive: bool,

    /// The collection expression string for invalidation
    /// e.g., "items()" for props, "$.get(a)" for state
    pub collection_expr: String,

    /// If a $$array parameter was generated (scope shadowing case)
    pub collection_id: Option<String>,

    /// The invalidation sequence expressions (for $.invalidate_inner_signals)
    /// These are the transitive dependency expressions collected in build_declarations
    pub invalidation_exprs: Vec<String>,

    /// The index parameter name (e.g., "$$index", "i")
    pub index_name: String,

    /// Whether the index is reactive (keyed each with index)
    pub index_reactive: bool,

    /// Whether this each block is in runes mode
    pub is_runes: bool,

    /// Flag set by bind_directive when it generates a binding that uses the each context.
    /// This is used by each_block to know that uses_index should be true.
    pub binding_used: Rc<Cell<bool>>,

    /// Map of destructured variable names to their update expressions.
    /// e.g., "f" -> "$.get($$item).name.first"
    /// Used by bind_directive to generate correct setters for destructured each variables.
    pub destructured_update_paths: FxHashMap<String, String>,

    /// Whether this each block contains a bind:group directive that references its item or index.
    /// When true, this each block's index ($$index_N) should be included in the bind:group indexes array.
    pub contains_group_binding: bool,

    /// The binding group name assigned to this each block (e.g., "binding_group", "binding_group_1").
    /// Set from EachBlock.metadata.binding_group_name during transform.
    /// Used by bind_directive to look up the correct group variable.
    pub binding_group_name: Option<String>,

    /// If the each block iterates over a store subscription, this contains the store name
    /// (e.g., "$items" for `{#each $items as item}`).
    /// Used by bind_directive to add `$.invalidate_store($$stores, '$items')` to setters.
    pub store_to_invalidate: Option<String>,

    /// Whether the each item binding was reassigned (e.g., via bind:value).
    /// When true, reads should use `$$array()[$$index]` instead of `$.get(item)`.
    /// This is a cached version of the EachItem binding's `reassigned` flag,
    /// used to avoid scope lookup confusion when a same-named outer variable exists.
    pub item_reassigned: bool,

    /// Whether the each block's context pattern is a simple Identifier (e.g., `item`)
    /// rather than a destructured pattern (e.g., `{ value }` or `[a, b]`).
    /// In the official compiler, `assign`/`mutate` transforms for destructured patterns
    /// do NOT set `uses_index = true`, while Identifier patterns do.
    /// This field controls whether `binding_used` should propagate to `uses_index`.
    pub context_is_identifier: bool,
}

impl<'a> ComponentClientTransformState<'a> {
    /// Create a new component client transform state.
    pub fn new(
        parse_arena: &'a ParseArena,
        scope: &'a Scope,
        scope_root: &'a ScopeRoot,
        analysis: &'a ComponentAnalysis,
        node: JsExpr,
        options: Rc<TransformOptions>,
    ) -> Self {
        let dev = options.dev;
        let preserve_whitespace = options.preserve_whitespace;
        Self {
            parse_arena,
            scope,
            scopes: FxHashMap::default(),
            analysis,
            scope_root,
            options,
            hoisted: Vec::new(),
            template: Template::new(),
            init: Vec::new(),
            update: Vec::new(),
            after_update: Vec::new(),
            consts: Vec::new(),
            async_consts: None,
            let_directives: Vec::new(),
            node,
            // Use memoizer with scope declarations to avoid variable name collisions
            memoizer: Memoizer::with_scope_declarations(scope, scope_root),
            transform: ImHashMap::new(),
            events: indexmap::IndexSet::default(),
            metadata: ComponentMetadata::default(),
            in_constructor: false,
            in_derived: false,
            dev,
            state_fields: FxHashMap::default(),
            is_instance: false,
            legacy_reactive_imports: Vec::new(),
            preserve_whitespace,
            instance_level_snippets: Vec::new(),
            module_level_snippets: Vec::new(),
            snippet_names: ImHashSet::new(),
            in_direct_assignment_lhs: false,
            in_bind_directive: false,
            in_event_attribute_handler: false,
            event_handler_arrow_body_level: 0,
            is_controlled_each: false,
            snippets: Vec::new(),
            template_nesting_level: 0,
            in_control_flow_block: false,
            each_index_used: Rc::new(Cell::new(false)),
            each_index_name: None,
            ancestor_each_index_names: Vec::new(),
            each_item_assign_or_mutate: Rc::new(Cell::new(false)),
            each_item_names: Vec::new(),
            each_binding_context: Vec::new(),
            local_var_init_types: Vec::new(),
            destructure_array_counter: Rc::new(Cell::new(0)),
            needs_props_from_events: Rc::new(Cell::new(false)),
            needs_mutation_validation: Rc::new(Cell::new(false)),
            hidden_let_bindings: FxHashSet::default(),
            shadowed_prop_names: im::HashSet::new(),
            blocker_map: Rc::new(std::cell::RefCell::new(rustc_hash::FxHashMap::default())),
            extra_blocker_indices: Vec::new(),
            is_standalone: false,
            const_blocker_map: Rc::new(std::cell::RefCell::new(rustc_hash::FxHashMap::default())),
        }
    }

    /// Generate a unique `$$array` name using the shared memoizer conflicts set.
    /// This matches the official Svelte compiler which uses `scope.root.unique('$$array')`.
    pub fn generate_array_name(&mut self) -> String {
        self.memoizer.generate_id("$$array")
    }

    /// Get a binding by name from the current scope or parent scopes.
    pub fn get_binding(&self, name: &str) -> Option<&Binding> {
        // First check current scope
        if let Some(&index) = self.scope.declarations.get(name) {
            return self.scope_root.bindings.get(index);
        }
        // Walk up the parent chain via Scope::parent indices, respecting lexical scoping.
        let mut parent_idx = self.scope.parent;
        while let Some(idx) = parent_idx {
            if let Some(scope) = self.scope_root.all_scopes.get(idx) {
                if let Some(&b_idx) = scope.declarations.get(name) {
                    return self.scope_root.bindings.get(b_idx);
                }
                parent_idx = scope.parent;
            } else {
                break;
            }
        }
        // Also check the root scope (instance module scope) if we haven't already
        if let Some(&index) = self.scope_root.scope.declarations.get(name) {
            return self.scope_root.bindings.get(index);
        }
        // Fall back to searching all scopes (handles cases where scope linkage is missing)
        let index = self.scope_root.find_binding_any_scope(name)?;
        self.scope_root.bindings.get(index)
    }

    /// Look up a local variable's init expression AST node type.
    /// Searches all active local scope frames (innermost first).
    pub fn get_local_var_init_type(&self, name: &str) -> Option<&str> {
        for frame in self.local_var_init_types.iter().rev() {
            if let Some(init_type) = frame.get(name) {
                return Some(init_type.as_str());
            }
        }
        None
    }

    /// Push a new local scope frame (e.g., entering an arrow/function body).
    pub fn push_local_scope(&mut self) {
        self.local_var_init_types.push(FxHashMap::default());
    }

    /// Pop the current local scope frame (e.g., leaving an arrow/function body).
    pub fn pop_local_scope(&mut self) {
        self.local_var_init_types.pop();
    }

    /// Register a local variable's init expression type in the current scope frame.
    pub fn register_local_var_init_type(&mut self, name: String, init_type: String) {
        if let Some(frame) = self.local_var_init_types.last_mut() {
            frame.insert(name, init_type);
        }
    }

    /// Get the blocker expressions for the given variable names.
    /// Returns a list of unique `$$promises[N]` expressions for variables
    /// that are blocked by async promises.
    pub fn get_blockers_for_names(&self, names: &[&str], arena: &JsArena) -> Vec<JsExpr> {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;
        let map = self.blocker_map.borrow();
        let mut indices: Vec<usize> = Vec::new();
        for name in names {
            if let Some(&idx) = map.get(*name)
                && !indices.contains(&idx)
            {
                indices.push(idx);
            }
        }
        indices.sort();
        indices
            .into_iter()
            .map(|idx| b::member_computed(arena, b::id("$$promises"), b::number(idx as f64)))
            .collect()
    }

    /// Get blocker expressions without deduplication.
    /// Each variable reference contributes its own blocker entry even if multiple
    /// variables map to the same promise index. This matches the official Svelte
    /// compiler's behavior for `run_after_blockers` arrays.
    pub fn get_blockers_for_names_with_duplicates(
        &self,
        names: &[&str],
        arena: &JsArena,
    ) -> Vec<JsExpr> {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;
        let map = self.blocker_map.borrow();
        let mut indices: Vec<usize> = Vec::new();
        for name in names {
            if let Some(&idx) = map.get(*name) {
                indices.push(idx);
            }
        }
        indices.sort();
        indices
            .into_iter()
            .map(|idx| b::member_computed(arena, b::id("$$promises"), b::number(idx as f64)))
            .collect()
    }

    /// Check if any of the given variable names are blocked by async promises.
    pub fn has_blockers_for_names(&self, names: &[&str]) -> bool {
        let map = self.blocker_map.borrow();
        names.iter().any(|name| map.contains_key(*name))
    }

    /// Get blocker expressions for all identifiers referenced in a JS expression.
    /// Walks the expression tree to find all identifier references and checks
    /// if any have blockers.
    pub fn get_blockers_for_expr(&self, expr: &JsExpr, arena: &JsArena) -> Vec<JsExpr> {
        let names = collect_identifiers_from_expr(expr, arena);
        let name_refs: Vec<&str> = names.iter().map(|s| s.as_str()).collect();
        self.get_blockers_for_names(&name_refs, arena)
    }

    /// Check if a JS expression references any blocked variables.
    pub fn has_blockers_for_expr(&self, expr: &JsExpr, arena: &JsArena) -> bool {
        let names = collect_identifiers_from_expr(expr, arena);
        let name_refs: Vec<&str> = names.iter().map(|s| s.as_str()).collect();
        self.has_blockers_for_names(&name_refs)
    }

    /// Get blocker expressions from the const_blocker_map for identifiers in a JS expression.
    /// Returns const-tag-level blocker expressions (e.g., `promises_1[0]`).
    pub fn get_const_blockers_for_expr(&self, expr: &JsExpr, arena: &JsArena) -> Vec<JsExpr> {
        let names = collect_identifiers_from_expr(expr, arena);
        let const_map = self.const_blocker_map.borrow();
        let mut exprs: Vec<JsExpr> = Vec::new();
        // Deduplicate by pointer identity from the map (same map value = same expression).
        let mut seen_ptrs: Vec<*const JsExpr> = Vec::new();
        for name in &names {
            if let Some(blocker_expr) = const_map.get(name.as_str()) {
                let ptr = blocker_expr as *const JsExpr;
                if !seen_ptrs.contains(&ptr) {
                    seen_ptrs.push(ptr);
                    exprs.push(blocker_expr.clone());
                }
            }
        }
        exprs
    }

    /// Get all blocker expressions (both instance-level and const-tag-level)
    /// for identifiers referenced in a JS expression.
    pub fn get_all_blockers_for_expr(&self, expr: &JsExpr, arena: &JsArena) -> Vec<JsExpr> {
        let mut blockers = self.get_blockers_for_expr(expr, arena);
        let names = collect_identifiers_from_expr(expr, arena);
        let const_map = self.const_blocker_map.borrow();
        // Deduplicate by pointer identity from the map (same map value = same expression).
        let mut seen_ptrs: Vec<*const JsExpr> = Vec::new();
        for name in &names {
            if let Some(blocker_expr) = const_map.get(name.as_str()) {
                let ptr = blocker_expr as *const JsExpr;
                if !seen_ptrs.contains(&ptr) {
                    seen_ptrs.push(ptr);
                    blockers.push(blocker_expr.clone());
                }
            }
        }
        blockers
    }
}

/// Collect all identifier names referenced in a JS expression.
/// Does not cross function boundaries (arrows, function expressions).
pub fn collect_identifiers_from_expr(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> Vec<compact_str::CompactString> {
    let mut names = Vec::new();
    collect_identifiers_recursive(expr, arena, &mut names);
    names
}

fn collect_identifiers_recursive(
    expr: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
    names: &mut Vec<compact_str::CompactString>,
) {
    use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
    match expr {
        JsExpr::Identifier(name) => {
            if !names.contains(name) {
                names.push(name.clone());
            }
        }
        JsExpr::Call(call) => {
            collect_identifiers_recursive(arena.get_expr(call.callee), arena, names);
            for arg in &call.arguments {
                collect_identifiers_recursive(arg, arena, names);
            }
        }
        JsExpr::Member(member) => {
            collect_identifiers_recursive(arena.get_expr(member.object), arena, names);
            if member.computed {
                if let JsMemberProperty::Expression(prop_expr) = &member.property {
                    collect_identifiers_recursive(arena.get_expr(*prop_expr), arena, names);
                }
            } else {
                // Also collect non-computed property names on $$props (e.g., $$props.name)
                // This is needed for blocker detection of props destructured after await
                if let JsExpr::Identifier(obj) = arena.get_expr(member.object) {
                    if obj == "$$props" {
                        if let JsMemberProperty::Identifier(prop_name) = &member.property {
                            if !names.contains(prop_name) {
                                names.push(prop_name.clone());
                            }
                        }
                    }
                }
            }
        }
        JsExpr::Binary(bin) => {
            collect_identifiers_recursive(arena.get_expr(bin.left), arena, names);
            collect_identifiers_recursive(arena.get_expr(bin.right), arena, names);
        }
        JsExpr::Logical(log) => {
            collect_identifiers_recursive(arena.get_expr(log.left), arena, names);
            collect_identifiers_recursive(arena.get_expr(log.right), arena, names);
        }
        JsExpr::Unary(un) => {
            collect_identifiers_recursive(arena.get_expr(un.argument), arena, names);
        }
        JsExpr::Conditional(cond) => {
            collect_identifiers_recursive(arena.get_expr(cond.test), arena, names);
            collect_identifiers_recursive(arena.get_expr(cond.consequent), arena, names);
            collect_identifiers_recursive(arena.get_expr(cond.alternate), arena, names);
        }
        JsExpr::TemplateLiteral(tl) => {
            for e in &tl.expressions {
                collect_identifiers_recursive(e, arena, names);
            }
        }
        JsExpr::Sequence(seq) => {
            for e in &seq.expressions {
                collect_identifiers_recursive(e, arena, names);
            }
        }
        JsExpr::Array(arr) => {
            for e in arr.elements.iter().flatten() {
                collect_identifiers_recursive(e, arena, names);
            }
        }
        JsExpr::Object(obj) => {
            for member in &obj.properties {
                match member {
                    JsObjectMember::Property(prop) => {
                        collect_identifiers_recursive(arena.get_expr(prop.value), arena, names);
                    }
                    JsObjectMember::SpreadElement(spread) => {
                        collect_identifiers_recursive(arena.get_expr(*spread), arena, names);
                    }
                }
            }
        }
        JsExpr::Assignment(assign) => {
            collect_identifiers_recursive(arena.get_expr(assign.right), arena, names);
        }
        JsExpr::Await(inner) => {
            collect_identifiers_recursive(arena.get_expr(*inner), arena, names);
        }
        JsExpr::Update(up) => {
            collect_identifiers_recursive(arena.get_expr(up.argument), arena, names);
        }
        JsExpr::Spread(inner) => {
            collect_identifiers_recursive(arena.get_expr(*inner), arena, names);
        }
        JsExpr::Void(inner) => {
            collect_identifiers_recursive(arena.get_expr(*inner), arena, names);
        }
        JsExpr::New(new_expr) => {
            collect_identifiers_recursive(arena.get_expr(new_expr.callee), arena, names);
            for arg in &new_expr.arguments {
                collect_identifiers_recursive(arg, arena, names);
            }
        }
        JsExpr::TaggedTemplate(tt) => {
            collect_identifiers_recursive(arena.get_expr(tt.tag), arena, names);
            for e in &tt.quasi.expressions {
                collect_identifiers_recursive(e, arena, names);
            }
        }
        JsExpr::Chain(chain) => {
            collect_identifiers_recursive(arena.get_expr(chain.expression), arena, names);
        }
        // Don't cross function boundaries
        JsExpr::Arrow(_) | JsExpr::Function(_) => {}
        // Literals, this, raw, class, yield don't contain identifier references we care about
        _ => {}
    }
}

/// Transform rule for an identifier.
#[derive(Debug, Clone)]
pub struct IdentifierTransform {
    /// How to read the identifier
    pub read: Option<fn(&JsArena, JsExpr) -> JsExpr>,

    /// Optional source variable for @const destructuring reads.
    ///
    /// When set, the read transform produces `$.get(read_source).identifier_name`
    /// instead of the normal `$.get(identifier_name)`. This is used for destructured
    /// `{@const}` declarations where multiple identifiers share a single derived value.
    ///
    /// For example, `{@const { x, y } = point}` generates a computed_const variable,
    /// and reads of `x` become `$.get(computed_const).x`.
    pub read_source: Option<String>,

    /// How to assign to the identifier
    ///
    /// Parameters:
    /// - arena: The JS arena allocator
    /// - identifier: The identifier being assigned to
    /// - value: The value being assigned
    /// - needs_proxy: Whether the value needs to be proxified
    #[allow(clippy::type_complexity)]
    pub assign: Option<fn(&JsArena, JsExpr, JsExpr, bool) -> JsExpr>,

    /// How to handle mutations to the identifier
    ///
    /// Parameters:
    /// - arena: The JS arena allocator
    /// - identifier: The identifier being mutated
    /// - mutation_expr: The mutation expression (e.g., `obj.prop = value`)
    pub mutate: Option<fn(&JsArena, JsExpr, JsExpr) -> JsExpr>,

    /// How to handle update expressions (++ or --)
    ///
    /// Parameters:
    /// - arena: The JS arena allocator
    /// - operator: The update operator (++ or --)
    /// - argument: The identifier being updated
    /// - prefix: Whether the operator is prefix (++x) or postfix (x++)
    #[allow(clippy::type_complexity)]
    pub update: Option<fn(&JsArena, JsUpdateOp, JsExpr, bool) -> JsExpr>,

    /// Whether to skip proxy wrapping for this variable (e.g., $state.raw)
    /// When true, needs_proxy will always be false for assignments
    pub skip_proxy: bool,

    /// Whether this identifier is guaranteed to be defined (non-null/undefined).
    /// Set to true for each block indices, which are always numbers.
    pub is_defined: bool,

    /// Whether this identifier represents reactive state that needs tracking.
    /// Set to false for non-reactive each block indices/items (unkeyed blocks).
    /// When false, expressions using this identifier don't need template_effect wrapping.
    pub is_reactive: bool,

    /// Optional replacement identifier name.
    ///
    /// When set, the identifier is replaced with this name before applying read/mutate transforms.
    /// Used for legacy reactive imports where `numbers` becomes `$$_import_numbers()`.
    /// The read transform is then applied to the replacement identifier.
    pub replacement_id: Option<String>,
}

/// Component metadata.
#[derive(Debug, Clone)]
pub struct ComponentMetadata {
    /// Namespace (html, svg, mathml)
    pub namespace: String,

    /// Whether the element is scoped
    pub scoped: bool,

    /// Whether we're inside a <svelte:element> child context.
    /// When true, infer_namespace should NOT re-evaluate from children,
    /// because the namespace is determined at runtime by $.element().
    pub svelte_element_child: bool,
}

impl Default for ComponentMetadata {
    fn default() -> Self {
        Self {
            namespace: "html".to_string(),
            scoped: false,
            svelte_element_child: false,
        }
    }
}

/// Template builder.
///
/// Accumulates HTML template parts during traversal.
#[derive(Debug, Default, Clone)]
pub struct TemplateBuilder {
    /// HTML parts being accumulated
    parts: Vec<String>,

    /// Element stack for tracking open elements
    element_stack: Vec<String>,
}

impl TemplateBuilder {
    /// Create a new template builder.
    pub fn new() -> Self {
        Self::default()
    }

    /// Push an opening element tag.
    pub fn push_element(&mut self, tag: &str, _start: u32) {
        self.parts.push(format!("<{}>", tag));
        self.element_stack.push(tag.to_string());
    }

    /// Pop the last opened element and close it.
    pub fn pop_element(&mut self) {
        if let Some(tag) = self.element_stack.pop() {
            self.parts.push(format!("</{}>", tag));
        }
    }

    /// Push a comment placeholder.
    pub fn push_comment(&mut self) {
        self.parts.push("<!---->".to_string());
    }

    /// Set a property on the current element.
    pub fn set_prop(&mut self, name: &str, value: &str) {
        // This should be called before the element is closed
        if !self.element_stack.is_empty()
            // Insert before the last '>'
            && let Some(last) = self.parts.last_mut()
            && last.ends_with('>')
        {
            last.pop(); // Remove the '>'
            last.push_str(&format!(" {}=\"{}\"", name, value));
            last.push('>');
        }
    }

    /// Get the combined HTML template string.
    pub fn get_html(&self) -> String {
        self.parts.join("")
    }

    /// Push raw HTML content.
    pub fn push_raw(&mut self, html: &str) {
        self.parts.push(html.to_string());
    }
}

/// A memoized expression entry.
#[derive(Debug, Clone)]
pub struct MemoEntry {
    /// The identifier that will replace this expression
    pub id: JsExpr,
    /// The original expression
    pub expression: JsExpr,
}

/// Memoizer for expressions.
///
/// A utility for extracting complex expressions (such as call expressions)
/// from templates and replacing them with `$0`, `$1` etc.
///
/// Corresponds to `Memoizer` class in
/// `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js`.
#[derive(Debug, Default, Clone)]
pub struct Memoizer {
    /// Counter for generating unique memoization variable names
    counter: usize,

    /// Map from expression hash to memoized variable name
    memos: FxHashMap<String, String>,

    /// Shared set of conflicting names to avoid collisions across all scopes.
    /// Uses Rc<RefCell<...>> so that parent and child memoizers share the SAME
    /// conflicts set, matching the official Svelte compiler's single shared
    /// `ScopeRoot.conflicts` set.
    conflicts: Rc<RefCell<FxHashSet<String>>>,

    /// Shared suffix tracker to avoid O(n) scanning. Shared with parent.
    next_suffix: Rc<RefCell<FxHashMap<String, u32>>>,

    /// Synchronous memoized expressions
    sync: Vec<MemoEntry>,

    /// Asynchronous memoized expressions
    async_entries: Vec<MemoEntry>,
}

impl Memoizer {
    /// Create a new memoizer.
    pub fn new() -> Self {
        Self {
            counter: 0,
            memos: FxHashMap::default(),
            conflicts: Rc::new(RefCell::new(FxHashSet::default())),
            next_suffix: Rc::new(RefCell::new(FxHashMap::default())),
            sync: Vec::new(),
            async_entries: Vec::new(),
        }
    }

    /// Create a new memoizer with scope declarations pre-registered as conflicts.
    ///
    /// This ensures that generated variable names don't collide with existing
    /// declarations in the scope.
    ///
    /// # Arguments
    ///
    /// * `scope` - The scope to extract declarations from
    /// * `scope_root` - The scope root containing all bindings
    ///
    /// # Returns
    ///
    /// A new memoizer with scope declarations added to conflicts.
    pub fn with_scope_declarations(
        _scope: &crate::compiler::phases::phase2_analyze::scope::Scope,
        scope_root: &crate::compiler::phases::phase2_analyze::scope::ScopeRoot,
    ) -> Self {
        // Share the conflicts set from ScopeRoot directly via Rc::clone
        // (avoids cloning the entire FxHashSet). This mirrors scope.root.conflicts
        // in the official Svelte compiler.
        Self {
            counter: 0,
            memos: FxHashMap::default(),
            conflicts: Rc::clone(&scope_root.conflicts),
            sync: Vec::new(),
            async_entries: Vec::new(),
            next_suffix: Rc::new(RefCell::new(FxHashMap::default())),
        }
    }

    /// Create a new memoizer that SHARES the conflicts set with a parent.
    ///
    /// This matches the official Svelte compiler where `scope.root.unique()` uses
    /// a single shared `ScopeRoot.conflicts` set across all scopes.
    pub fn with_parent_conflicts(parent: &Memoizer) -> Self {
        Self {
            counter: 0,
            memos: FxHashMap::default(),
            conflicts: Rc::clone(&parent.conflicts),
            next_suffix: Rc::clone(&parent.next_suffix),
            sync: Vec::new(),
            async_entries: Vec::new(),
        }
    }

    /// Add an expression to be memoized for component props.
    ///
    /// Corresponds to `Memoizer.add()` in the official Svelte compiler.
    /// When expressions are memoized, they get wrapped in `$.derived()` and
    /// the getter returns `$.get($N)` instead of the original expression.
    ///
    /// # Arguments
    ///
    /// * `expression` - The expression to memoize
    /// * `has_call` - Whether the expression contains a function call
    /// * `has_await` - Whether the expression contains await
    /// * `memoize_if_state` - If true, memoize when expression has state
    /// * `has_state` - Whether the expression references reactive state
    ///
    /// # Returns
    ///
    /// Returns the memoized identifier if memoization is needed, or the original expression.
    pub fn add(
        &mut self,
        expression: JsExpr,
        has_call: bool,
        has_await: bool,
        memoize_if_state: bool,
        has_state: bool,
    ) -> JsExpr {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        // Determine if we need to memoize
        // This matches the official Svelte logic:
        // should_memoize = has_call || has_await || (memoize_if_state && has_state)
        let should_memoize = has_call || has_await || (memoize_if_state && has_state);

        if !should_memoize {
            return expression;
        }

        // Calculate the index for this memoized expression
        // Sync expressions come first, then async expressions
        let idx = if has_await {
            self.sync.len() + self.async_entries.len()
        } else {
            self.sync.len()
        };

        // Create the identifier with the correct name ($0, $1, etc.)
        let name = format!("${}", idx);
        let id = b::id(&name);

        let entry = MemoEntry {
            id: id.clone(),
            expression,
        };

        if has_await {
            self.async_entries.push(entry);
        } else {
            self.sync.push(entry);
        }

        id
    }

    /// Generate the `let $N = $.derived(...)` statements for memoized expressions.
    ///
    /// Corresponds to `Memoizer.deriveds()` in the official Svelte compiler.
    ///
    /// # Arguments
    ///
    /// * `runes` - Whether to use runes mode ($.derived vs $.derived_safe_equal)
    ///
    /// # Returns
    ///
    /// Returns a vector of `let $N = $.derived(() => expr)` statements.
    pub fn deriveds(
        &self,
        arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
        runes: bool,
    ) -> Vec<JsStatement> {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        self.sync
            .iter()
            .map(|memo| {
                let derived_fn = if runes {
                    "$.derived"
                } else {
                    "$.derived_safe_equal"
                };
                // Extract the identifier name from the JsExpr::Identifier
                let name = match &memo.id {
                    JsExpr::Identifier(n) => n.clone(),
                    _ => "$memo".into(),
                };
                b::let_decl(
                    arena,
                    name.clone(),
                    Some(b::call(
                        arena,
                        b::member_path(arena, derived_fn),
                        vec![b::thunk(arena, memo.expression.clone())],
                    )),
                )
            })
            .collect()
    }

    /// Check if there are any sync memoized expressions that need to be output.
    pub fn has_deriveds(&self) -> bool {
        !self.sync.is_empty()
    }

    /// Add an expression to be memoized for template effects.
    ///
    /// Corresponds to `Memoizer.add()` in the official Svelte compiler.
    ///
    /// # Arguments
    ///
    /// * `expression` - The expression to memoize
    /// * `has_call` - Whether the expression contains a function call
    /// * `has_await` - Whether the expression contains await
    /// * `memoize_if_state` - Whether to memoize if the expression has state
    /// * `has_state` - Whether the expression references reactive state
    ///
    /// # Returns
    ///
    /// Returns an identifier ($0, $1, etc.) that will be used as the parameter
    /// in the template_effect. If no memoization is needed, returns the original expression.
    pub fn add_memoized(
        &mut self,
        expression: JsExpr,
        has_call: bool,
        has_await: bool,
        memoize_if_state: bool,
        has_state: bool,
    ) -> JsExpr {
        let should_memoize = has_call || has_await || (memoize_if_state && has_state);

        if !should_memoize {
            return expression;
        }

        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        // Calculate the index for this memoized expression
        // Sync expressions come first, then async expressions
        let idx = if has_await {
            self.sync.len() + self.async_entries.len()
        } else {
            self.sync.len()
        };

        // Create the parameter identifier immediately with the correct name
        let name = format!("${}", idx);
        let id = b::id(&name);

        let entry = MemoEntry {
            id: id.clone(),
            expression,
        };

        if has_await {
            self.async_entries.push(entry);
        } else {
            self.sync.push(entry);
        }

        id
    }

    /// Get the parameter identifiers for the template_effect arrow function.
    ///
    /// Returns the list of parameter identifiers ($0, $1, etc.) that will be
    /// used in the arrow function parameters.
    pub fn get_params(&self) -> Vec<JsExpr> {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        (0..self.sync.len() + self.async_entries.len())
            .map(|i| b::id(format!("${}", i)))
            .collect()
    }

    /// Apply memoization - this is kept for compatibility but now just returns the params.
    pub fn apply(&mut self) -> Vec<JsExpr> {
        self.get_params()
    }

    /// Get the sync values array for template_effect.
    ///
    /// Returns an array of thunked expressions: `[() => expr1, () => expr2]`
    /// Returns `None` if there are no sync expressions.
    pub fn sync_values(&self, arena: &JsArena) -> Option<JsExpr> {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        if self.sync.is_empty() {
            return None;
        }

        let thunks: Vec<JsExpr> = self
            .sync
            .iter()
            .map(|memo| b::thunk(arena, memo.expression.clone()))
            .collect();

        Some(b::array(thunks))
    }

    /// Get the async values array.
    ///
    /// Returns an array of thunked async expressions with `$.save()` wrapping applied.
    /// The `$.save()` wrapping is handled internally by `async_thunk()`.
    ///
    /// Returns `None` if there are no async expressions.
    pub fn async_values(&self, arena: &JsArena) -> Option<JsExpr> {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;

        if self.async_entries.is_empty() {
            return None;
        }

        let thunks: Vec<JsExpr> = self
            .async_entries
            .iter()
            .map(|memo| b::async_thunk(arena, memo.expression.clone()))
            .collect();

        Some(b::array(thunks))
    }

    /// Check if there are any memoized expressions.
    pub fn has_memoized(&self) -> bool {
        !self.sync.is_empty() || !self.async_entries.is_empty()
    }

    /// Get all memoized expressions (both sync and async) for blocker scanning.
    pub fn all_expressions(&self) -> Vec<JsExpr> {
        let mut exprs = Vec::new();
        for entry in &self.sync {
            exprs.push(entry.expression.clone());
        }
        for entry in &self.async_entries {
            exprs.push(entry.expression.clone());
        }
        exprs
    }

    /// Check if there are any async memoized expressions.
    pub fn has_async(&self) -> bool {
        !self.async_entries.is_empty()
    }

    /// Get the async parameter identifiers for the $.async() arrow function.
    ///
    /// Returns the list of async parameter identifiers ($0, $1, etc.) that will
    /// be passed as parameters to the arrow function in $.async() calls.
    pub fn async_ids(&self) -> Vec<JsExpr> {
        self.async_entries.iter().map(|e| e.id.clone()).collect()
    }

    /// Clear all memoized expressions (but keep conflicts).
    pub fn clear_memoized(&mut self) {
        self.sync.clear();
        self.async_entries.clear();
    }

    /// Generate a unique identifier with a given base name.
    ///
    /// # Arguments
    ///
    /// * `base` - The base name for the identifier (e.g., "text", "div", "fragment")
    ///
    /// # Returns
    ///
    /// A unique identifier like "text", "text_2", "text_3", etc.
    /// Add a name to the conflicts set without generating a new one.
    /// Used to seed the memoizer with names already generated elsewhere (e.g., script pre-transform).
    pub fn add_conflict(&self, name: &str) {
        self.conflicts.borrow_mut().insert(name.to_string());
    }

    pub fn generate_id(&mut self, base: &str) -> String {
        let sanitized = if is_valid_identifier(base) {
            base
        } else {
            return self.generate_id_slow(base);
        };

        let mut conflicts = self.conflicts.borrow_mut();
        let mut next_suffix = self.next_suffix.borrow_mut();

        if !conflicts.contains(sanitized) {
            let owned = sanitized.to_string();
            conflicts.insert(owned.clone());
            return owned;
        }

        let start_n = next_suffix.get(sanitized).copied().unwrap_or(1);
        let mut name = String::with_capacity(sanitized.len() + 4);
        let mut n = start_n;
        loop {
            name.clear();
            name.push_str(sanitized);
            name.push('_');
            if n < 10 {
                name.push((b'0' + n as u8) as char);
            } else {
                use std::fmt::Write;
                let _ = write!(name, "{}", n);
            }
            if !conflicts.contains(name.as_str()) {
                break;
            }
            n += 1;
        }

        conflicts.insert(name.clone());
        next_suffix.insert(sanitized.to_string(), n + 1);
        name
    }

    fn generate_id_slow(&mut self, base: &str) -> String {
        let sanitized = sanitize_identifier(base);

        let mut conflicts = self.conflicts.borrow_mut();
        let mut next_suffix = self.next_suffix.borrow_mut();

        if !conflicts.contains(sanitized.as_str()) {
            conflicts.insert(sanitized.clone());
            return sanitized;
        }

        let start_n = next_suffix.get(sanitized.as_str()).copied().unwrap_or(1);
        let mut n = start_n;
        let mut name = String::with_capacity(sanitized.len() + 4);
        loop {
            name.clear();
            name.push_str(&sanitized);
            name.push('_');
            if n < 10 {
                name.push((b'0' + n as u8) as char);
            } else {
                use std::fmt::Write;
                let _ = write!(name, "{}", n);
            }
            if !conflicts.contains(name.as_str()) {
                break;
            }
            n += 1;
        }

        conflicts.insert(name.clone());
        next_suffix.insert(sanitized, n + 1);
        name
    }

    /// Reset the memoizer state.
    pub fn reset(&mut self) {
        self.counter = 0;
        self.memos.clear();
        self.conflicts.borrow_mut().clear();
        self.next_suffix.borrow_mut().clear();
        self.sync.clear();
        self.async_entries.clear();
    }

    /// Merge conflicts from another memoizer.
    /// With shared Rc<RefCell<...>> conflicts, this is a no-op.
    pub fn merge_conflicts(&mut self, _other: &Memoizer) {
        // No-op: conflicts are shared via Rc<RefCell<...>>
    }
}

/// Check if a string is already a valid JavaScript identifier.
#[inline]
fn is_valid_identifier(name: &str) -> bool {
    if name.is_empty() {
        return false;
    }
    let mut chars = name.bytes();
    let first = chars.next().unwrap();
    if !first.is_ascii_alphabetic() && first != b'_' && first != b'$' {
        return false;
    }
    chars.all(|c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
}

/// Sanitize a string to be a valid JavaScript identifier.
///
/// - Replaces hyphens and other invalid characters with underscores
/// - Ensures the identifier starts with a valid character
/// - Returns a valid JavaScript identifier
fn sanitize_identifier(name: &str) -> String {
    let mut result = String::with_capacity(name.len());

    for (i, c) in name.chars().enumerate() {
        if c.is_ascii_alphabetic() || c == '_' || c == '$' {
            result.push(c);
        } else if c.is_ascii_digit() {
            if i == 0 {
                // Can't start with a digit, prefix with underscore
                result.push('_');
            }
            result.push(c);
        } else {
            // Replace invalid characters (like '-') with underscore
            result.push('_');
        }
    }

    // If result is empty or starts with invalid char, prefix with underscore
    if result.is_empty() {
        return "_".to_string();
    }

    result
}

// Bit flags for ExpressionMetadata
// NOTE: Bits 0-4 are intentionally aligned with ast::template::ExpressionMetadata
// to allow direct flag copy via from_template_metadata.
const FLAG_HAS_STATE: u8 = 1 << 0;
const FLAG_HAS_CALL: u8 = 1 << 1;
const FLAG_HAS_AWAIT: u8 = 1 << 2;
const FLAG_HAS_MEMBER_EXPRESSION: u8 = 1 << 3;
const FLAG_HAS_ASSIGNMENT: u8 = 1 << 4;
const FLAG_DYNAMIC: u8 = 1 << 5;

/// Expression metadata for analysis.
///
/// Tracks dependencies, side effects, and other properties
/// needed for transformation.
/// Uses bit-packing for boolean flags to reduce memory footprint.
#[derive(Debug, Clone, Default)]
pub struct ExpressionMetadata {
    /// Bit-packed flags for has_call, has_await, has_state, has_member_expression, has_assignment, dynamic
    flags: u8,

    /// Blocking dependencies (for async expressions)
    pub blockers: Vec<JsExpr>,

    /// Binding indices referenced by this expression (from phase 2 analysis).
    /// Used in legacy mode by `build_expression` to determine which bindings
    /// need to be read for dependency tracking (matching the official Svelte
    /// compiler's `metadata.references`).
    /// Uses IndexSet to preserve insertion order (matching JavaScript Set behavior).
    pub references: IndexSet<usize>,
}

impl ExpressionMetadata {
    /// Create a new expression metadata.
    pub fn new() -> Self {
        Self::default()
    }

    /// Create ExpressionMetadata from the template's ExpressionMetadata.
    /// This is a helper to convert from phase 2 metadata to phase 3 metadata.
    /// Uses direct flag byte copy (bits 0-4 are aligned between the two types).
    #[inline]
    pub fn from_template_metadata(meta: &crate::ast::template::ExpressionMetadata) -> Self {
        // Copy bits 0-4 directly (STATE, CALL, AWAIT, MEMBER_EXPRESSION, ASSIGNMENT).
        // Bit 5 (DYNAMIC) is not present in the template metadata, so it stays 0.
        let flags = meta.raw_flags() & 0x1F; // mask to bits 0-4
        Self {
            flags,
            blockers: Vec::new(),
            references: meta.references.clone(),
        }
    }

    /// Whether the expression contains a call
    #[inline]
    pub fn has_call(&self) -> bool {
        self.flags & FLAG_HAS_CALL != 0
    }

    /// Set whether the expression contains a call
    #[inline]
    pub fn set_has_call(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_CALL;
        } else {
            self.flags &= !FLAG_HAS_CALL;
        }
    }

    /// Whether the expression contains await
    #[inline]
    pub fn has_await(&self) -> bool {
        self.flags & FLAG_HAS_AWAIT != 0
    }

    /// Set whether the expression contains await
    #[inline]
    pub fn set_has_await(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_AWAIT;
        } else {
            self.flags &= !FLAG_HAS_AWAIT;
        }
    }

    /// Whether the expression references reactive state
    #[inline]
    pub fn has_state(&self) -> bool {
        self.flags & FLAG_HAS_STATE != 0
    }

    /// Set whether the expression references reactive state
    #[inline]
    pub fn set_has_state(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_STATE;
        } else {
            self.flags &= !FLAG_HAS_STATE;
        }
    }

    /// Whether the expression contains a member expression
    #[inline]
    pub fn has_member_expression(&self) -> bool {
        self.flags & FLAG_HAS_MEMBER_EXPRESSION != 0
    }

    /// Set whether the expression contains a member expression
    #[inline]
    pub fn set_has_member_expression(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_MEMBER_EXPRESSION;
        } else {
            self.flags &= !FLAG_HAS_MEMBER_EXPRESSION;
        }
    }

    /// Whether the expression contains an assignment
    #[inline]
    pub fn has_assignment(&self) -> bool {
        self.flags & FLAG_HAS_ASSIGNMENT != 0
    }

    /// Set whether the expression contains an assignment
    #[inline]
    pub fn set_has_assignment(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_HAS_ASSIGNMENT;
        } else {
            self.flags &= !FLAG_HAS_ASSIGNMENT;
        }
    }

    /// Whether the expression is dynamic (needs reactive tracking)
    #[inline]
    pub fn dynamic(&self) -> bool {
        self.flags & FLAG_DYNAMIC != 0
    }

    /// Set whether the expression is dynamic
    #[inline]
    pub fn set_dynamic(&mut self, v: bool) {
        if v {
            self.flags |= FLAG_DYNAMIC;
        } else {
            self.flags &= !FLAG_DYNAMIC;
        }
    }

    /// Check if the expression has any blocking dependencies.
    pub fn has_blockers(&self) -> bool {
        !self.blockers.is_empty()
    }

    /// Check if the expression is async (has await or blockers).
    pub fn is_async(&self) -> bool {
        self.has_await() || self.has_blockers()
    }

    /// Get the blocking dependencies as a JS array expression.
    pub fn blockers(&self) -> JsExpr {
        use crate::compiler::phases::phase3_transform::js_ast::builders as b;
        b::array(self.blockers.clone())
    }
}

/// State field in a class component.
///
/// Represents a field declared with $state, $derived, or similar runes.
#[derive(Debug, Clone)]
pub struct StateField {
    /// The AST node where this field is declared
    pub node: JsAssignmentExpression,

    /// The key used to access this field (private or public identifier)
    pub key: JsExpr,

    /// The type of state field ($state, $derived, etc.)
    pub field_type: String,
}

/// Build an async thunk for a memoized slot expression.
///
/// Optimizes `async () => await expr` patterns:
/// - `async () => await func()` → `func` (if func is a simple identifier call with no args)
/// - Other cases: `async () => expr` or the stripped await argument
fn build_slot_async_thunk(
    expression: &JsExpr,
    arena: &crate::compiler::phases::phase3_transform::js_ast::arena::JsArena,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

    match expression {
        JsExpr::Await(inner) => {
            // Strip the await and optimize
            match arena.get_expr(*inner) {
                JsExpr::Call(call) if call.arguments.is_empty() => {
                    if let JsExpr::Identifier(_) = arena.get_expr(call.callee) {
                        // `async () => await func()` → `func`
                        arena.get_expr(call.callee).clone()
                    } else {
                        // `async () => await complex()` → `() => complex()`
                        b::thunk(arena, arena.get_expr(*inner).clone())
                    }
                }
                _ => {
                    // For simple expressions like `await 'hello'`, create `() => 'hello'`
                    b::thunk(arena, arena.get_expr(*inner).clone())
                }
            }
        }
        _ => {
            // Not an await expression, wrap as async thunk
            b::async_thunk(arena, expression.clone())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_template_builder() {
        let mut builder = TemplateBuilder::new();
        builder.push_element("div", 0);
        builder.push_comment();
        builder.pop_element();

        let html = builder.get_html();
        assert_eq!(html, "<div><!----></div>");
    }

    #[test]
    fn test_memoizer_simple_expression() {
        let mut memoizer = Memoizer::new();
        let expr = JsExpr::Literal(JsLiteral::String("test".into()));

        // No memoization needed for simple expressions with no flags
        // add(expression, has_call, has_await, memoize_if_state, has_state)
        let result = memoizer.add(expr.clone(), false, false, false, false);

        // Should return the same expression for simple cases (no memoization)
        match result {
            JsExpr::Literal(JsLiteral::String(s)) => assert_eq!(s, "test"),
            _ => panic!("Expected string literal"),
        }
    }

    #[test]
    fn test_memoizer_memoize_if_state() {
        let mut memoizer = Memoizer::new();
        let expr = JsExpr::Literal(JsLiteral::String("test".into()));

        // memoize_if_state=true but has_state=false should NOT memoize
        let result = memoizer.add(expr.clone(), false, false, true, false);
        match result {
            JsExpr::Literal(JsLiteral::String(s)) => assert_eq!(s, "test"),
            _ => panic!("Expected string literal, got {:?}", result),
        }

        // memoize_if_state=true AND has_state=true SHOULD memoize
        let result = memoizer.add(expr.clone(), false, false, true, true);
        match result {
            JsExpr::Identifier(name) => assert_eq!(name, "$0"),
            _ => panic!("Expected identifier $0, got {:?}", result),
        }

        // Check that deriveds() produces the correct output
        let arena = crate::compiler::phases::phase3_transform::js_ast::arena::JsArena::new();
        let deriveds = memoizer.deriveds(&arena, true);
        assert_eq!(deriveds.len(), 1);
    }

    #[test]
    fn test_memoizer_has_call() {
        let mut memoizer = Memoizer::new();
        let expr = JsExpr::Literal(JsLiteral::String("test".into()));

        // has_call=true should always memoize, regardless of other flags
        let result = memoizer.add(expr.clone(), true, false, false, false);
        match result {
            JsExpr::Identifier(name) => assert_eq!(name, "$0"),
            _ => panic!("Expected identifier $0, got {:?}", result),
        }
    }

    #[test]
    fn test_memoizer_with_parent_conflicts() {
        // Create parent memoizer and generate some ids
        let mut parent = Memoizer::new();
        let id1 = parent.generate_id("consequent");
        assert_eq!(id1, "consequent");

        // Create child memoizer inheriting parent's conflicts
        let mut child = Memoizer::with_parent_conflicts(&parent);

        // Child should avoid conflicts with parent
        let id2 = child.generate_id("consequent");
        assert_eq!(id2, "consequent_1");

        // And should track its own conflicts too
        let id3 = child.generate_id("consequent");
        assert_eq!(id3, "consequent_2");
    }

    #[test]
    fn test_memoizer_shared_conflicts() {
        // Create parent and generate an id
        let mut parent = Memoizer::new();
        let _ = parent.generate_id("fragment");

        // Create child sharing parent's conflicts (shared Rc)
        let mut child = Memoizer::with_parent_conflicts(&parent);
        let _ = child.generate_id("alternate");

        // Parent automatically sees child's conflicts (shared Rc)
        let id = parent.generate_id("alternate");
        assert_eq!(id, "alternate_1");
    }

    #[test]
    fn test_memoizer_nested_blocks_scenario() {
        // Simulates nested IfBlocks:
        // Outer IfBlock: uses "consequent"
        // Inner IfBlock: should use "consequent_1"

        let mut outer = Memoizer::new();
        let outer_id = outer.generate_id("consequent");
        assert_eq!(outer_id, "consequent");

        // Nested fragment creates child memoizer
        let mut inner = Memoizer::with_parent_conflicts(&outer);
        let inner_id = inner.generate_id("consequent");
        assert_eq!(inner_id, "consequent_1");

        // Inner nested fragment
        let mut innermost = Memoizer::with_parent_conflicts(&inner);
        let innermost_id = innermost.generate_id("consequent");
        assert_eq!(innermost_id, "consequent_2");
    }
}
