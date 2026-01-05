//! Visitor pattern for template transformation.
//!
//! This module provides a trait-based visitor pattern for walking
//! the template AST and generating code. The pattern separates
//! traversal logic from transformation logic.

#![allow(dead_code)]

use crate::ast::template::{
    AwaitBlock, Component, EachBlock, ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock,
    RegularElement, RenderTag, SnippetBlock, SvelteDynamicElement, TemplateNode, Text,
};

use super::TransformError;

/// Result type for visitor operations.
pub type VisitorResult = Result<(), TransformError>;

/// Context passed to visitor methods.
///
/// Contains information about the current traversal state.
#[derive(Debug, Clone)]
pub struct VisitorContext {
    /// Whether the current node is at root level
    pub is_root_level: bool,
    /// Depth of nesting (0 = root)
    pub depth: usize,
    /// Index of current node within parent
    pub sibling_index: usize,
    /// Total siblings at this level
    pub sibling_count: usize,
}

impl Default for VisitorContext {
    fn default() -> Self {
        Self {
            is_root_level: true,
            depth: 0,
            sibling_index: 0,
            sibling_count: 0,
        }
    }
}

impl VisitorContext {
    /// Create a new root context.
    pub fn root() -> Self {
        Self::default()
    }

    /// Create a child context.
    pub fn child(&self) -> Self {
        Self {
            is_root_level: false,
            depth: self.depth + 1,
            sibling_index: 0,
            sibling_count: 0,
        }
    }

    /// Create a sibling context with the given index and count.
    pub fn with_sibling(&self, index: usize, count: usize) -> Self {
        Self {
            sibling_index: index,
            sibling_count: count,
            ..*self
        }
    }
}

/// Trait for visiting template nodes.
///
/// Implement this trait to define custom behavior when walking the template AST.
/// The default implementations do nothing, so you only need to implement the
/// methods for nodes you care about.
pub trait TemplateVisitor {
    /// Called before visiting a fragment's children.
    fn enter_fragment(&mut self, _fragment: &Fragment, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting a fragment's children.
    fn exit_fragment(&mut self, _fragment: &Fragment, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Visit a text node.
    fn visit_text(&mut self, _text: &Text, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting an element's children.
    fn enter_element(&mut self, _element: &RegularElement, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting an element's children.
    fn exit_element(&mut self, _element: &RegularElement, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Visit an expression tag.
    fn visit_expression_tag(
        &mut self,
        _tag: &ExpressionTag,
        _ctx: &VisitorContext,
    ) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting a component's children.
    fn enter_component(&mut self, _component: &Component, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting a component's children.
    fn exit_component(&mut self, _component: &Component, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting an if block.
    fn enter_if_block(&mut self, _block: &IfBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting an if block.
    fn exit_if_block(&mut self, _block: &IfBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting an each block.
    fn enter_each_block(&mut self, _block: &EachBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting an each block.
    fn exit_each_block(&mut self, _block: &EachBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting an await block.
    fn enter_await_block(&mut self, _block: &AwaitBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting an await block.
    fn exit_await_block(&mut self, _block: &AwaitBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting a key block.
    fn enter_key_block(&mut self, _block: &KeyBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting a key block.
    fn exit_key_block(&mut self, _block: &KeyBlock, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting a snippet block.
    fn enter_snippet_block(
        &mut self,
        _block: &SnippetBlock,
        _ctx: &VisitorContext,
    ) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting a snippet block.
    fn exit_snippet_block(
        &mut self,
        _block: &SnippetBlock,
        _ctx: &VisitorContext,
    ) -> VisitorResult {
        Ok(())
    }

    /// Visit a render tag.
    fn visit_render_tag(&mut self, _tag: &RenderTag, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Visit an HTML tag.
    fn visit_html_tag(&mut self, _tag: &HtmlTag, _ctx: &VisitorContext) -> VisitorResult {
        Ok(())
    }

    /// Called before visiting a svelte:element.
    fn enter_svelte_element(
        &mut self,
        _element: &SvelteDynamicElement,
        _ctx: &VisitorContext,
    ) -> VisitorResult {
        Ok(())
    }

    /// Called after visiting a svelte:element.
    fn exit_svelte_element(
        &mut self,
        _element: &SvelteDynamicElement,
        _ctx: &VisitorContext,
    ) -> VisitorResult {
        Ok(())
    }
}

/// Walk a fragment and its children, calling visitor methods.
pub fn walk_fragment<V: TemplateVisitor>(
    visitor: &mut V,
    fragment: &Fragment,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_fragment(fragment, ctx)?;

    let child_count = fragment.nodes.len();
    for (i, node) in fragment.nodes.iter().enumerate() {
        let child_ctx = ctx.child().with_sibling(i, child_count);
        walk_node(visitor, node, &child_ctx)?;
    }

    visitor.exit_fragment(fragment, ctx)?;
    Ok(())
}

/// Walk a single template node.
pub fn walk_node<V: TemplateVisitor>(
    visitor: &mut V,
    node: &TemplateNode,
    ctx: &VisitorContext,
) -> VisitorResult {
    match node {
        TemplateNode::Text(text) => visitor.visit_text(text, ctx),
        TemplateNode::RegularElement(element) => walk_element(visitor, element, ctx),
        TemplateNode::ExpressionTag(tag) => visitor.visit_expression_tag(tag, ctx),
        TemplateNode::Component(component) => walk_component(visitor, component, ctx),
        TemplateNode::IfBlock(block) => walk_if_block(visitor, block, ctx),
        TemplateNode::EachBlock(block) => walk_each_block(visitor, block, ctx),
        TemplateNode::AwaitBlock(block) => walk_await_block(visitor, block, ctx),
        TemplateNode::KeyBlock(block) => walk_key_block(visitor, block, ctx),
        TemplateNode::SnippetBlock(block) => walk_snippet_block(visitor, block, ctx),
        TemplateNode::RenderTag(tag) => visitor.visit_render_tag(tag, ctx),
        TemplateNode::HtmlTag(tag) => visitor.visit_html_tag(tag, ctx),
        TemplateNode::SvelteElement(element) => walk_svelte_element(visitor, element, ctx),
        _ => Ok(()),
    }
}

/// Walk an element and its children.
pub fn walk_element<V: TemplateVisitor>(
    visitor: &mut V,
    element: &RegularElement,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_element(element, ctx)?;
    walk_fragment(visitor, &element.fragment, &ctx.child())?;
    visitor.exit_element(element, ctx)?;
    Ok(())
}

/// Walk a component and its children.
pub fn walk_component<V: TemplateVisitor>(
    visitor: &mut V,
    component: &Component,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_component(component, ctx)?;
    walk_fragment(visitor, &component.fragment, &ctx.child())?;
    visitor.exit_component(component, ctx)?;
    Ok(())
}

/// Walk an if block.
pub fn walk_if_block<V: TemplateVisitor>(
    visitor: &mut V,
    block: &IfBlock,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_if_block(block, ctx)?;
    walk_fragment(visitor, &block.consequent, &ctx.child())?;
    if let Some(ref alternate) = block.alternate {
        walk_fragment(visitor, alternate, &ctx.child())?;
    }
    visitor.exit_if_block(block, ctx)?;
    Ok(())
}

/// Walk an each block.
pub fn walk_each_block<V: TemplateVisitor>(
    visitor: &mut V,
    block: &EachBlock,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_each_block(block, ctx)?;
    walk_fragment(visitor, &block.body, &ctx.child())?;
    if let Some(ref fallback) = block.fallback {
        walk_fragment(visitor, fallback, &ctx.child())?;
    }
    visitor.exit_each_block(block, ctx)?;
    Ok(())
}

/// Walk an await block.
pub fn walk_await_block<V: TemplateVisitor>(
    visitor: &mut V,
    block: &AwaitBlock,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_await_block(block, ctx)?;
    if let Some(ref pending) = block.pending {
        walk_fragment(visitor, pending, &ctx.child())?;
    }
    if let Some(ref then) = block.then {
        walk_fragment(visitor, then, &ctx.child())?;
    }
    if let Some(ref catch) = block.catch {
        walk_fragment(visitor, catch, &ctx.child())?;
    }
    visitor.exit_await_block(block, ctx)?;
    Ok(())
}

/// Walk a key block.
pub fn walk_key_block<V: TemplateVisitor>(
    visitor: &mut V,
    block: &KeyBlock,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_key_block(block, ctx)?;
    walk_fragment(visitor, &block.fragment, &ctx.child())?;
    visitor.exit_key_block(block, ctx)?;
    Ok(())
}

/// Walk a snippet block.
pub fn walk_snippet_block<V: TemplateVisitor>(
    visitor: &mut V,
    block: &SnippetBlock,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_snippet_block(block, ctx)?;
    walk_fragment(visitor, &block.body, &ctx.child())?;
    visitor.exit_snippet_block(block, ctx)?;
    Ok(())
}

/// Walk a svelte:element.
pub fn walk_svelte_element<V: TemplateVisitor>(
    visitor: &mut V,
    element: &SvelteDynamicElement,
    ctx: &VisitorContext,
) -> VisitorResult {
    visitor.enter_svelte_element(element, ctx)?;
    walk_fragment(visitor, &element.fragment, &ctx.child())?;
    visitor.exit_svelte_element(element, ctx)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A simple visitor that counts nodes.
    struct NodeCounter {
        text_count: usize,
        element_count: usize,
        expression_count: usize,
    }

    impl NodeCounter {
        fn new() -> Self {
            Self {
                text_count: 0,
                element_count: 0,
                expression_count: 0,
            }
        }
    }

    impl TemplateVisitor for NodeCounter {
        fn visit_text(&mut self, _text: &Text, _ctx: &VisitorContext) -> VisitorResult {
            self.text_count += 1;
            Ok(())
        }

        fn enter_element(
            &mut self,
            _element: &RegularElement,
            _ctx: &VisitorContext,
        ) -> VisitorResult {
            self.element_count += 1;
            Ok(())
        }

        fn visit_expression_tag(
            &mut self,
            _tag: &ExpressionTag,
            _ctx: &VisitorContext,
        ) -> VisitorResult {
            self.expression_count += 1;
            Ok(())
        }
    }

    #[test]
    fn test_visitor_context() {
        let ctx = VisitorContext::root();
        assert!(ctx.is_root_level);
        assert_eq!(ctx.depth, 0);

        let child = ctx.child();
        assert!(!child.is_root_level);
        assert_eq!(child.depth, 1);

        let sibling = child.with_sibling(2, 5);
        assert_eq!(sibling.sibling_index, 2);
        assert_eq!(sibling.sibling_count, 5);
    }
}
