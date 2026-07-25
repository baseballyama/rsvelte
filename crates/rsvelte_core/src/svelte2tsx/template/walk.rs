//! Template walk: fragment iteration and per-node handler dispatch.

use super::ctx::Counter;
use super::{
    handle_attach_tag, handle_await_block, handle_comment, handle_component, handle_const_tag,
    handle_debug_tag, handle_declaration_tag, handle_each_block, handle_expression_tag,
    handle_html_tag, handle_if_block, handle_key_block, handle_regular_element, handle_render_tag,
    handle_slot_element, handle_snippet_block, handle_svelte_component,
    handle_svelte_dynamic_element, handle_svelte_self, handle_svelte_special_element, handle_text,
    handle_title_element,
};
use crate::ast::template::{Fragment, TemplateNode};
use crate::svelte2tsx::magic_string::MagicString;
use crate::svelte2tsx::svelte2tsx::Svelte2TsxOptions;

/// Process a fragment's child nodes in-place.
///
/// `depth` is the current nesting depth: how many ancestor element / component
/// nodes surround this fragment.  Blocks (if/each/await/key/snippet) do NOT
/// increment the depth; only `RegularElement` and component nodes do.
pub(super) fn process_fragment_inplace(
    fragment: &Fragment,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    for node in &fragment.nodes {
        process_node_inplace(node, source, options, str, counter, depth);
    }
}

/// Dispatch a template node to its in-place handler.
pub(super) fn process_node_inplace(
    node: &TemplateNode,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
    depth: u32,
) {
    match node {
        TemplateNode::Text(text) => handle_text(text, source, str),
        TemplateNode::Comment(comment) => handle_comment(comment, str),
        TemplateNode::ExpressionTag(expr) => handle_expression_tag(expr, source, str),
        TemplateNode::HtmlTag(html) => handle_html_tag(html, source, str),
        TemplateNode::ConstTag(tag) => handle_const_tag(tag, source, str),
        TemplateNode::DeclarationTag(tag) => handle_declaration_tag(tag, source, str),
        TemplateNode::DebugTag(tag) => handle_debug_tag(tag, source, str),
        TemplateNode::RenderTag(tag) => handle_render_tag(tag, source, str),
        TemplateNode::AttachTag(tag) => handle_attach_tag(tag, str),
        // Control-flow blocks do NOT increment depth (mirrors official computeDepth which
        // only counts ancestor Element/InlineComponent nodes, not block nodes or root).
        TemplateNode::IfBlock(block) => {
            handle_if_block(block, source, options, str, counter, depth)
        }
        TemplateNode::EachBlock(block) => {
            handle_each_block(block, source, options, str, counter, depth)
        }
        TemplateNode::AwaitBlock(block) => {
            handle_await_block(block, source, options, str, counter, depth)
        }
        TemplateNode::KeyBlock(block) => {
            handle_key_block(block, source, options, str, counter, depth)
        }
        TemplateNode::SnippetBlock(block) => {
            handle_snippet_block(block, source, options, str, counter, depth)
        }
        // Elements and components DO increment depth for their children.
        TemplateNode::RegularElement(el) => {
            handle_regular_element(el, source, options, str, counter, depth)
        }
        TemplateNode::Component(comp) => {
            handle_component(comp, source, options, str, counter, depth)
        }
        TemplateNode::SvelteComponent(comp) => {
            handle_svelte_component(comp, source, options, str, counter, depth)
        }
        TemplateNode::SvelteElement(el) => {
            handle_svelte_dynamic_element(el, source, options, str, counter, depth)
        }
        TemplateNode::TitleElement(el) => {
            handle_title_element(el, source, options, str, counter, depth)
        }
        TemplateNode::SlotElement(el) => {
            handle_slot_element(el, source, options, str, counter, depth)
        }
        TemplateNode::SvelteSelf(el) => {
            handle_svelte_self(el, source, options, str, counter, depth)
        }
        TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteWindow(el) => {
            handle_svelte_special_element(el, source, options, str, counter, depth)
        }
    }
}
