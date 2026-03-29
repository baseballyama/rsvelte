//! Template processing for svelte2tsx.
//!
//! Converts Svelte template AST nodes into TSX expressions for type checking
//! by modifying the source in-place using MagicString.
//!
//! Each template node type has a corresponding handler that overwrites the
//! original source range with the appropriate TypeScript/TSX code.

#[allow(unused_imports)]
use crate::ast::template::{
    AttachTag, Attribute, AttributeNode, AttributeValue, AttributeValuePart, AwaitBlock,
    BindDirective, ClassDirective, Comment, Component, ConstTag, DebugTag, EachBlock,
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, LetDirective, OnDirective, RegularElement,
    RenderTag, SlotElement, SnippetBlock, SpreadAttribute, StyleDirective, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement, TemplateNode, Text, TitleElement, TransitionDirective,
    UseDirective,
};

use super::magic_string::MagicString;
use super::svelte2tsx::{Svelte2TsxOptions, SvelteVersion};

// =============================================================================
// TemplateNode position helpers
// =============================================================================

/// Extension trait for getting start/end positions from TemplateNode.
trait TemplateNodeExt {
    fn start(&self) -> u32;
    fn end(&self) -> u32;
}

impl TemplateNodeExt for TemplateNode {
    fn start(&self) -> u32 {
        match self {
            TemplateNode::Text(n) => n.start,
            TemplateNode::Comment(n) => n.start,
            TemplateNode::TitleElement(n) => n.start,
            TemplateNode::SlotElement(n) => n.start,
            TemplateNode::SvelteBody(n)
            | TemplateNode::SvelteDocument(n)
            | TemplateNode::SvelteFragment(n)
            | TemplateNode::SvelteBoundary(n)
            | TemplateNode::SvelteHead(n)
            | TemplateNode::SvelteOptions(n)
            | TemplateNode::SvelteSelf(n)
            | TemplateNode::SvelteWindow(n) => n.start,
            TemplateNode::ExpressionTag(n) => n.start,
            TemplateNode::HtmlTag(n) => n.start,
            TemplateNode::ConstTag(n) => n.start,
            TemplateNode::DebugTag(n) => n.start,
            TemplateNode::RenderTag(n) => n.start,
            TemplateNode::AttachTag(n) => n.start,
            TemplateNode::IfBlock(n) => n.start,
            TemplateNode::EachBlock(n) => n.start,
            TemplateNode::AwaitBlock(n) => n.start,
            TemplateNode::KeyBlock(n) => n.start,
            TemplateNode::SnippetBlock(n) => n.start,
            TemplateNode::RegularElement(n) => n.start,
            TemplateNode::Component(n) => n.start,
            TemplateNode::SvelteComponent(n) => n.start,
            TemplateNode::SvelteElement(n) => n.start,
        }
    }

    fn end(&self) -> u32 {
        match self {
            TemplateNode::Text(n) => n.end,
            TemplateNode::Comment(n) => n.end,
            TemplateNode::TitleElement(n) => n.end,
            TemplateNode::SlotElement(n) => n.end,
            TemplateNode::SvelteBody(n)
            | TemplateNode::SvelteDocument(n)
            | TemplateNode::SvelteFragment(n)
            | TemplateNode::SvelteBoundary(n)
            | TemplateNode::SvelteHead(n)
            | TemplateNode::SvelteOptions(n)
            | TemplateNode::SvelteSelf(n)
            | TemplateNode::SvelteWindow(n) => n.end,
            TemplateNode::ExpressionTag(n) => n.end,
            TemplateNode::HtmlTag(n) => n.end,
            TemplateNode::ConstTag(n) => n.end,
            TemplateNode::DebugTag(n) => n.end,
            TemplateNode::RenderTag(n) => n.end,
            TemplateNode::AttachTag(n) => n.end,
            TemplateNode::IfBlock(n) => n.end,
            TemplateNode::EachBlock(n) => n.end,
            TemplateNode::AwaitBlock(n) => n.end,
            TemplateNode::KeyBlock(n) => n.end,
            TemplateNode::SnippetBlock(n) => n.end,
            TemplateNode::RegularElement(n) => n.end,
            TemplateNode::Component(n) => n.end,
            TemplateNode::SvelteComponent(n) => n.end,
            TemplateNode::SvelteElement(n) => n.end,
        }
    }
}

// =============================================================================
// Helpers
// =============================================================================

/// Get the expression source text range from an Expression.
fn get_expression_range(expr: &crate::ast::js::Expression) -> Option<(u32, u32)> {
    let start = expr.start()?;
    let end = expr.end()?;
    Some((start, end))
}

/// Get the expression source text from the original source.
fn get_expression_text<'a>(expr: &crate::ast::js::Expression, source: &'a str) -> &'a str {
    if let Some((start, end)) = get_expression_range(expr) {
        &source[start as usize..end as usize]
    } else {
        ""
    }
}

/// Generate a reversed component constructor variable name.
/// Component → $$_tnenopmoC0C (always ends with 'C' for Constructor)
fn reversed_component_name(name: &str, index: u32) -> String {
    let reversed: String = name.chars().rev().collect();
    format!("$$_{}{}C", reversed, index)
}

/// Generate a reversed component instance variable name.
/// Component → $$_tnenopmoC0 (no suffix)
fn reversed_component_instance_name(name: &str, index: u32) -> String {
    let reversed: String = name.chars().rev().collect();
    format!("$$_{}{}", reversed, index)
}

/// Counter for generating unique variable names.
struct Counter {
    value: u32,
}

impl Counter {
    fn new() -> Self {
        Self { value: 0 }
    }
    fn next(&mut self) -> u32 {
        let v = self.value;
        self.value += 1;
        v
    }
}

// =============================================================================
// Main entry point
// =============================================================================

/// Process the template fragment by modifying the MagicString in-place.
///
/// Walks the fragment's nodes and overwrites template node ranges with TSX
/// equivalents. The MagicString is modified directly.
pub fn process_template_inplace(
    fragment: &Fragment,
    source: &str,
    _options: &Svelte2TsxOptions,
    str: &mut MagicString,
) {
    let mut counter = Counter::new();
    process_fragment_inplace(fragment, source, _options, str, &mut counter);

    // Blank out any trailing whitespace-only content after the last template node.
    // This prevents stray newlines from the source appearing between the template
    // output and the appended async wrapper closing `};`.
    if let Some(last_node) = fragment.nodes.last() {
        let last_end = last_node.end() as usize;
        if last_end < source.len() {
            let trailing = &source[last_end..];
            if !trailing.is_empty() && trailing.chars().all(|c| c.is_whitespace()) {
                str.overwrite(last_end as u32, source.len() as u32, "");
            }
        }
    }
}

/// Process a fragment's child nodes in-place.
fn process_fragment_inplace(
    fragment: &Fragment,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    for node in &fragment.nodes {
        process_node_inplace(node, source, options, str, counter);
    }
}

/// Dispatch a template node to its in-place handler.
fn process_node_inplace(
    node: &TemplateNode,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    match node {
        TemplateNode::Text(text) => handle_text(text, source, str),
        TemplateNode::Comment(comment) => handle_comment(comment, str),
        TemplateNode::ExpressionTag(expr) => handle_expression_tag(expr, source, str),
        TemplateNode::HtmlTag(html) => handle_html_tag(html, source, str),
        TemplateNode::ConstTag(tag) => handle_const_tag(tag, source, str),
        TemplateNode::DebugTag(tag) => handle_debug_tag(tag, source, str),
        TemplateNode::RenderTag(tag) => handle_render_tag(tag, source, str),
        TemplateNode::AttachTag(tag) => handle_attach_tag(tag, str),
        TemplateNode::IfBlock(block) => handle_if_block(block, source, options, str, counter),
        TemplateNode::EachBlock(block) => handle_each_block(block, source, options, str, counter),
        TemplateNode::AwaitBlock(block) => handle_await_block(block, source, options, str, counter),
        TemplateNode::KeyBlock(block) => handle_key_block(block, source, options, str, counter),
        TemplateNode::SnippetBlock(block) => {
            handle_snippet_block(block, source, options, str, counter)
        }
        TemplateNode::RegularElement(el) => {
            handle_regular_element(el, source, options, str, counter)
        }
        TemplateNode::Component(comp) => handle_component(comp, source, options, str, counter),
        TemplateNode::SvelteComponent(comp) => {
            handle_svelte_component(comp, source, options, str, counter)
        }
        TemplateNode::SvelteElement(el) => {
            handle_svelte_dynamic_element(el, source, options, str, counter)
        }
        TemplateNode::TitleElement(el) => handle_title_element(el, source, options, str, counter),
        TemplateNode::SlotElement(el) => handle_slot_element(el, source, options, str, counter),
        TemplateNode::SvelteOptions(el) => {
            // <svelte:options> is blanked out in TSX output
            if el.start < el.end {
                str.overwrite(el.start, el.end, "");
            }
        }
        TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            handle_svelte_special_element(el, source, options, str, counter)
        }
    }
}

// =============================================================================
// Text and Comments
// =============================================================================

/// Handle a text node.
///
/// Text nodes in svelte2tsx have their non-whitespace characters removed
/// (replaced with empty). Whitespace characters are kept as-is.
/// If the result is empty but the original text had content, at least 1
/// space is preserved (to prevent hover artifacts in the language server).
fn handle_text(text: &Text, source: &str, str: &mut MagicString) {
    if text.start >= text.end {
        return;
    }
    let raw = &source[text.start as usize..text.end as usize];
    // Remove non-whitespace, keep whitespace
    let mut replacement: String = raw.chars().filter(|c| c.is_whitespace()).collect();
    if replacement.is_empty() && !raw.is_empty() {
        // Minimum of 1 space
        replacement = " ".to_string();
    }
    str.overwrite(text.start, text.end, &replacement);
}

/// Handle an HTML comment node.
///
/// Comments are blanked out in the TSX output.
fn handle_comment(comment: &Comment, str: &mut MagicString) {
    if comment.start >= comment.end {
        return;
    }
    str.overwrite(comment.start, comment.end, "");
}

// =============================================================================
// Expression Tags
// =============================================================================

/// Handle an expression tag: `{expression}`.
///
/// Overwrites `{` with empty and `}` with `;` so the expression is preserved
/// as a statement: `{count}` → `count;`
fn handle_expression_tag(expr: &ExpressionTag, _source: &str, str: &mut MagicString) {
    if expr.start >= expr.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&expr.expression) {
        // Overwrite the opening `{` (everything before the expression)
        if expr.start < expr_start {
            str.overwrite(expr.start, expr_start, "");
        }
        // Overwrite the closing `}` (everything after the expression) with `;`
        if expr_end < expr.end {
            str.overwrite(expr_end, expr.end, ";");
        }
    } else {
        // Fallback: overwrite the whole thing with a space
        str.overwrite(expr.start, expr.end, " ");
    }
}

/// Handle an HTML tag: `{@html expression}`.
///
/// The expression needs type checking even though it's raw HTML.
fn handle_html_tag(html: &HtmlTag, _source: &str, str: &mut MagicString) {
    if html.start >= html.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&html.expression) {
        // Overwrite `{@html ` prefix
        if html.start < expr_start {
            str.overwrite(html.start, expr_start, "");
        }
        // Overwrite closing `}` with `;`
        if expr_end < html.end {
            str.overwrite(expr_end, html.end, ";");
        }
    } else {
        str.overwrite(html.start, html.end, " ");
    }
}

/// Handle a const tag: `{@const declaration}`.
///
/// The const declaration is emitted as a regular `const` statement.
fn handle_const_tag(tag: &ConstTag, _source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }

    if let Some((decl_start, decl_end)) = get_expression_range(&tag.declaration) {
        // Overwrite `{@const ` prefix with `const `
        if tag.start < decl_start {
            str.overwrite(tag.start, decl_start, "const ");
        }
        // Overwrite closing `}` with `;`
        if decl_end < tag.end {
            str.overwrite(decl_end, tag.end, ";");
        }
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}

/// Handle a debug tag: `{@debug identifiers}`.
///
/// `{@debug myfile}` → `;myfile;`
/// `{@debug a, b}` → `;a;b;`
fn handle_debug_tag(tag: &DebugTag, source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }
    // Build the replacement: each identifier as a statement
    let mut replacement = String::new();
    replacement.push(';');
    for ident in &tag.identifiers {
        let text = get_expression_text(ident, source);
        replacement.push_str(text);
        replacement.push(';');
    }
    str.overwrite(tag.start, tag.end, &replacement);
}

/// Handle a render tag: `{@render snippet(args)}`.
///
/// `{@render foo(1)}` → `;__sveltets_2_ensureSnippet(foo(1));`
fn handle_render_tag(tag: &RenderTag, source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }

    if let Some((expr_start, expr_end)) = get_expression_range(&tag.expression) {
        let expr_text = &source[expr_start as usize..expr_end as usize];
        let replacement = format!(";__sveltets_2_ensureSnippet({});", expr_text);
        str.overwrite(tag.start, tag.end, &replacement);
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}

/// Handle an attach tag: `{@attach expression}`.
fn handle_attach_tag(tag: &AttachTag, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }
    // Attach tags are removed in TSX output
    str.overwrite(tag.start, tag.end, "");
}

// =============================================================================
// Block Nodes
// =============================================================================

/// Handle an if block: `{#if condition}...{:else if}...{:else}...{/if}`.
///
/// Generates: `if(show){...} else {...}`
fn handle_if_block(
    block: &IfBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if block.start >= block.end {
        return;
    }

    let test_text = get_expression_text(&block.test, source);

    // Find the start of the consequent content
    let consequent_start = if !block.consequent.nodes.is_empty() {
        block.consequent.nodes[0].start()
    } else {
        // No children - find the `>` or `}` after the test
        block.end
    };

    // Overwrite `{#if condition}` with `if(condition){`
    str.overwrite(block.start, consequent_start, &format!("if({})", test_text));
    // Insert opening brace
    str.append_left(consequent_start, "{");

    // Process children
    process_fragment_inplace(&block.consequent, source, options, str, counter);

    // Handle alternate
    if let Some(ref alternate) = block.alternate {
        // Find the {:else} or {:else if} tag position
        // The alternate fragment starts after the {:else} tag
        let alternate_start = if !alternate.nodes.is_empty() {
            alternate.nodes[0].start()
        } else {
            block.end
        };

        // Check if the alternate is an elseif
        let has_elseif =
            alternate.nodes.len() == 1 && matches!(alternate.nodes[0], TemplateNode::IfBlock(_));

        if has_elseif {
            // Find the {:else if ...} tag range
            // We need to find where the consequent ends and the alternate starts
            let consequent_end = if !block.consequent.nodes.is_empty() {
                block.consequent.nodes.last().unwrap().end()
            } else {
                block.start
            };

            // Overwrite `{:else if` with `} else `
            str.overwrite(consequent_end, alternate_start, "} else ");

            // Process the elseif block (which will handle its own if()/else)
            process_fragment_inplace(alternate, source, options, str, counter);

            // No closing `}` needed since the inner if block handles `{/if}`
        } else {
            // Find where the consequent content ends
            let consequent_end = if !block.consequent.nodes.is_empty() {
                block.consequent.nodes.last().unwrap().end()
            } else {
                block.start
            };

            // Overwrite {:else} with `} else {`
            str.overwrite(consequent_end, alternate_start, "} else {");

            // Process alternate children
            process_fragment_inplace(alternate, source, options, str, counter);

            // Overwrite `{/if}` with `}`
            let alternate_end = if !alternate.nodes.is_empty() {
                alternate.nodes.last().unwrap().end()
            } else {
                alternate_start
            };
            if alternate_end < block.end {
                str.overwrite(alternate_end, block.end, "}");
            }
        }
    } else {
        // No alternate - just close with `}`
        let consequent_end = if !block.consequent.nodes.is_empty() {
            block.consequent.nodes.last().unwrap().end()
        } else {
            consequent_start
        };
        if consequent_end < block.end {
            str.overwrite(consequent_end, block.end, "}");
        }
    }
}

/// Handle an each block: `{#each items as item, i (key)}...{:else}...{/each}`.
///
/// Generates: `for(let item of __sveltets_2_ensureArray(items)){let i = 1;key;...}`
fn handle_each_block(
    block: &EachBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);
    let context_text = block
        .context
        .as_ref()
        .map(|c| get_expression_text(c, source).to_string())
        .unwrap_or_else(|| "__item".to_string());

    let body_start = if !block.body.nodes.is_empty() {
        block.body.nodes[0].start()
    } else {
        block.end
    };

    // Build the for loop header
    let mut header = format!(
        "for(let {} of __sveltets_2_ensureArray({})){{",
        context_text, expr_text
    );

    // Add index variable if present
    if let Some(ref index) = block.index {
        header.push_str(&format!("let {} = 1;", index));
    }

    // Add key expression if present
    if let Some(ref key) = block.key {
        let key_text = get_expression_text(key, source);
        header.push_str(key_text);
        header.push(';');
    }

    // Overwrite `{#each items as item, i (key)}` with the for loop header
    str.overwrite(block.start, body_start, &header);

    // Process body children
    process_fragment_inplace(&block.body, source, options, str, counter);

    // Handle fallback ({:else}...{/each})
    let body_end = if !block.body.nodes.is_empty() {
        block.body.nodes.last().unwrap().end()
    } else {
        body_start
    };

    if let Some(ref fallback) = block.fallback {
        let fallback_start = if !fallback.nodes.is_empty() {
            fallback.nodes[0].start()
        } else {
            block.end
        };

        // Overwrite {:else} with `}`
        str.overwrite(body_end, fallback_start, "}");

        // Process fallback
        process_fragment_inplace(fallback, source, options, str, counter);

        let fallback_end = if !fallback.nodes.is_empty() {
            fallback.nodes.last().unwrap().end()
        } else {
            fallback_start
        };

        if fallback_end < block.end {
            str.overwrite(fallback_end, block.end, "");
        }
    } else {
        // Close the for loop
        if body_end < block.end {
            str.overwrite(body_end, block.end, "}");
        }
    }
}

/// Handle an await block: `{#await promise}...{:then value}...{:catch error}...{/await}`.
fn handle_await_block(
    block: &AwaitBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);

    // For now, emit the expression and process all branches
    // The pending branch is wrapped in a block, then/catch follow
    let pending_start = if let Some(ref pending) = block.pending {
        if !pending.nodes.is_empty() {
            pending.nodes[0].start()
        } else {
            block.end
        }
    } else {
        block.end
    };

    // Overwrite the opening tag with the expression
    str.overwrite(block.start, pending_start, &format!("{{{}; ", expr_text));

    // Process pending
    if let Some(ref pending) = block.pending {
        process_fragment_inplace(pending, source, options, str, counter);
    }

    // Process then
    if let Some(ref then) = block.then {
        let then_start = if !then.nodes.is_empty() {
            then.nodes[0].start()
        } else {
            block.end
        };

        // Find where the previous section ends
        let prev_end = if let Some(ref pending) = block.pending {
            if !pending.nodes.is_empty() {
                pending.nodes.last().unwrap().end()
            } else {
                pending_start
            }
        } else {
            pending_start
        };

        let value_text = block
            .value
            .as_ref()
            .map(|v| get_expression_text(v, source).to_string())
            .unwrap_or_default();

        if !value_text.is_empty() {
            str.overwrite(
                prev_end,
                then_start,
                &format!("}} let {} = await {}; {{", value_text, expr_text),
            );
        } else {
            str.overwrite(prev_end, then_start, "} {");
        }

        process_fragment_inplace(then, source, options, str, counter);
    }

    // Process catch
    if let Some(ref catch) = block.catch {
        let catch_start = if !catch.nodes.is_empty() {
            catch.nodes[0].start()
        } else {
            block.end
        };

        // Find where the previous section ends
        let prev_end = if let Some(ref then) = block.then {
            if !then.nodes.is_empty() {
                then.nodes.last().unwrap().end()
            } else {
                catch_start
            }
        } else if let Some(ref pending) = block.pending {
            if !pending.nodes.is_empty() {
                pending.nodes.last().unwrap().end()
            } else {
                catch_start
            }
        } else {
            catch_start
        };

        let error_text = block
            .error
            .as_ref()
            .map(|e| get_expression_text(e, source).to_string())
            .unwrap_or_default();

        if !error_text.is_empty() {
            str.overwrite(
                prev_end,
                catch_start,
                &format!("}} catch({}) {{", error_text),
            );
        } else {
            str.overwrite(prev_end, catch_start, "} catch {");
        }

        process_fragment_inplace(catch, source, options, str, counter);
    }

    // Close
    let last_end = if let Some(ref catch) = block.catch {
        if !catch.nodes.is_empty() {
            catch.nodes.last().unwrap().end()
        } else {
            block.end
        }
    } else if let Some(ref then) = block.then {
        if !then.nodes.is_empty() {
            then.nodes.last().unwrap().end()
        } else {
            block.end
        }
    } else if let Some(ref pending) = block.pending {
        if !pending.nodes.is_empty() {
            pending.nodes.last().unwrap().end()
        } else {
            block.end
        }
    } else {
        block.end
    };

    if last_end < block.end {
        str.overwrite(last_end, block.end, "}");
    }
}

/// Handle a key block: `{#key expression}...{/key}`.
fn handle_key_block(
    block: &KeyBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if block.start >= block.end {
        return;
    }

    let expr_text = get_expression_text(&block.expression, source);

    let content_start = if !block.fragment.nodes.is_empty() {
        block.fragment.nodes[0].start()
    } else {
        block.end
    };

    // Overwrite `{#key expression}` with `{expr; `
    str.overwrite(block.start, content_start, &format!("{{{};", expr_text));

    // Process children
    process_fragment_inplace(&block.fragment, source, options, str, counter);

    let content_end = if !block.fragment.nodes.is_empty() {
        block.fragment.nodes.last().unwrap().end()
    } else {
        content_start
    };

    if content_end < block.end {
        str.overwrite(content_end, block.end, "}");
    }
}

/// Handle a snippet block: `{#snippet name(params)}...{/snippet}`.
///
/// Generates:
/// ```text
/// const name = (params): ReturnType<import('svelte').Snippet> => { async () => {
///   ...
/// };return __sveltets_2_any(0)};
/// ```
fn handle_snippet_block(
    block: &SnippetBlock,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if block.start >= block.end {
        return;
    }

    let name_text = get_expression_text(&block.expression, source);

    // Build parameters string
    let params_text = if !block.parameters.is_empty() {
        block
            .parameters
            .iter()
            .map(|p| get_expression_text(p, source))
            .collect::<Vec<_>>()
            .join(", ")
    } else {
        String::new()
    };

    let body_start = if !block.body.nodes.is_empty() {
        block.body.nodes[0].start()
    } else {
        block.end
    };

    // Overwrite `{#snippet name(params)}` with function declaration
    let header = format!(
        "const {} = ({}): ReturnType<import('svelte').Snippet> => {{ async () => {{",
        name_text, params_text
    );
    str.overwrite(block.start, body_start, &header);

    // Process body
    process_fragment_inplace(&block.body, source, options, str, counter);

    let body_end = if !block.body.nodes.is_empty() {
        block.body.nodes.last().unwrap().end()
    } else {
        body_start
    };

    // Overwrite `{/snippet}` with closing
    if body_end < block.end {
        str.overwrite(body_end, block.end, "};return __sveltets_2_any(0)};");
    }
}

// =============================================================================
// Element Nodes
// =============================================================================

/// Handle a regular HTML element.
///
/// Generates `{ svelteHTML.createElement("tagName", { ...attributes }); children }`.
///
/// The opening tag `<h1 class="foo">` is overwritten with
/// `{ svelteHTML.createElement("h1", {"class":\`foo\`,});`
/// and the closing tag `</h1>` is overwritten with ` }`.
fn handle_regular_element(
    el: &RegularElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if el.start >= el.end {
        return;
    }

    // Find the end of the opening tag (after the `>`)
    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // Build attribute string
    let mut attrs_str = build_attributes_string(&el.attributes, source);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior.
    // The JS MagicString preserves whitespace between tag name and first attribute,
    // plus the attribute handling adds an additional space. We replicate this by
    // counting the original whitespace and using it as the leading padding.
    if !el.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces(&el.name, el.start, source);
        // Replace the default leading space with the original whitespace
        // The extra_spaces count represents spaces from the source; the JS svelte2tsx
        // preserves these spaces plus adds its own leading space.
        if extra_spaces > 1 {
            let mut padded = " ".repeat(extra_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    // Overwrite the entire opening tag.
    // Leading space preserves approximate column positions (matching JS svelte2tsx).
    let opener = format!(
        " {{ svelteHTML.createElement(\"{}\", {{{}}});",
        el.name, attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // Process children
    process_fragment_inplace(&el.fragment, source, options, str, counter);

    // Find and overwrite the closing tag
    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        // Non-self-closing: preserve space before closing brace
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        // Self-closing element: close block without leading space
        str.append_left(el.end, "}");
    }
}

/// Handle a Svelte component: `<Component ...>`.
///
/// Supports:
/// - `on:` directives → instance variable + `.$on()` calls
/// - `let:` directives → instance variable + `$$slot_def` destructuring
/// - Svelte 5 `children` prop when component has children
/// - Named slots via `slot="name"` on children
/// - Component name in closing tag for non-self-closing components
fn handle_component(
    comp: &Component,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if comp.start >= comp.end {
        return;
    }

    let idx = counter.next();
    let ctor_var = reversed_component_name(&comp.name, idx);

    // Find the end of the opening tag
    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Collect on: directives and let: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();
    let let_directives = get_let_directives(&comp.attributes);
    let has_lets = !let_directives.is_empty();

    // Check if component has meaningful children
    let has_children = has_component_slot_children(&comp.fragment, source);

    // Check if any children have named slots with let: directives
    let children_have_named_slots = has_named_slot_children(&comp.fragment, source);

    // An instance variable is needed when:
    // - there are on: directives
    // - there are let: directives on the component
    // - there are children with slot="name" that have let: directives
    let needs_instance = has_events || has_lets || children_have_named_slots;

    // Check if Svelte 5 children prop is needed
    let is_svelte5 = matches!(options.version, SvelteVersion::V5);

    // Build attribute/props string (excluding on: and let: directives)
    let mut attrs_str = build_component_props_string(&comp.attributes, source);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !comp.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces(&comp.name, comp.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    // Add children prop for Svelte 5 if component has children
    let children_prop = if is_svelte5 && has_children {
        "children:() => { return __sveltets_2_any(0); },"
    } else {
        ""
    };

    // Build the replacement for the opening tag
    let inst_var = reversed_component_instance_name(&comp.name, idx);
    let opener = if needs_instance {
        let on_calls = if has_events {
            build_on_calls(&inst_var, &on_directives, source)
        } else {
            String::new()
        };
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); const {} = new {}({{ target: __sveltets_2_any(), props: {{{}{}}}}});{}",
            ctor_var, comp.name, inst_var, ctor_var, attrs_str, children_prop, on_calls
        )
    } else {
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{{}{}}}}});",
            ctor_var, comp.name, ctor_var, attrs_str, children_prop
        )
    };
    str.overwrite(comp.start, opening_tag_end, &opener);

    // Handle children with slot awareness
    if has_lets || children_have_named_slots {
        // Process children with slot scoping
        process_component_children_with_slots(
            comp,
            &inst_var,
            &let_directives,
            source,
            options,
            str,
            counter,
        );
    } else {
        // Simple children processing (no slot scoping needed)
        process_fragment_inplace(&comp.fragment, source, options, str, counter);
    }

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    let is_self_closing = closing_tag_start >= comp.end;

    if !is_self_closing {
        // Non-self-closing: output component name before closing brace
        // A space before the name matches JS svelte2tsx output
        str.overwrite(closing_tag_start, comp.end, &format!(" {}}}", comp.name));
    } else {
        str.append_left(comp.end, "}");
    }
}

/// Check if a component's fragment has meaningful children for slot purposes.
///
/// Returns true if the component has any non-text children, or text children
/// with non-whitespace content.
fn has_component_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                // Check if text has non-whitespace content
                if text.start < text.end {
                    let content = &source[text.start as usize..text.end as usize];
                    if content.chars().any(|c| !c.is_whitespace()) {
                        return true;
                    }
                }
            }
            _ => return true,
        }
    }
    false
}

/// Check if any children have `slot="name"` attributes (named slots).
fn has_named_slot_children(fragment: &Fragment, source: &str) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::RegularElement(el) => {
                if get_slot_attr_value(&el.attributes, source).is_some() {
                    return true;
                }
            }
            TemplateNode::Component(comp) => {
                if get_slot_attr_value(&comp.attributes, source).is_some() {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// Process component children with slot awareness.
///
/// This handles:
/// - Default slot wrapping with `let:` destructuring
/// - Named slot wrapping with `slot="name"` children
fn process_component_children_with_slots(
    comp: &Component,
    inst_var: &str,
    let_directives: &[&LetDirective],
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    let has_lets = !let_directives.is_empty();

    // Build the default slot destructuring if needed
    let let_destructure = build_let_destructure_string(let_directives, source);

    // Group children into default slot and named slots
    // For each child, determine if it belongs to a named slot or the default slot
    // Named slot children get their own $$slot_def blocks
    // Default slot children are wrapped in a single block with the component's let: destructuring

    // We need to track which children are named slots and process them specially.
    // The approach: iterate over children, and for each named-slot child, emit
    // a separate $$slot_def block. Non-named-slot children are part of the default slot.
    //
    // The default slot block is opened before the first default slot child and closed
    // after the last one (or before the first named slot child).

    let mut default_slot_opened = false;
    let mut prev_end: Option<u32> = None;

    // If there are let: directives, we need to open the default slot block
    // before any children (including text nodes).
    if has_lets {
        // We'll open the default slot block at the position of the first child
        // or immediately after the opening tag
        let block_open = format!(
            "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
            let_destructure, inst_var
        );

        // Find where to insert the block open
        if let Some(first_node) = comp.fragment.nodes.first() {
            let first_start = first_node.start();
            // Insert the block opening before the first child
            str.append_left(first_start, &block_open);
        }
        default_slot_opened = true;
    }

    for (i, node) in comp.fragment.nodes.iter().enumerate() {
        let is_named_slot = match node {
            TemplateNode::RegularElement(el) => {
                get_slot_attr_value(&el.attributes, source).is_some()
            }
            TemplateNode::Component(child_comp) => {
                get_slot_attr_value(&child_comp.attributes, source).is_some()
            }
            _ => false,
        };

        if is_named_slot {
            // Close the default slot block if it's open, before this named slot child
            if default_slot_opened && has_lets {
                // Close the default slot block before this named slot
                str.append_left(node.start(), "}");
                default_slot_opened = false;
            }

            // Process the named slot child
            match node {
                TemplateNode::RegularElement(el) => {
                    handle_named_slot_element(el, inst_var, source, options, str, counter);
                }
                TemplateNode::Component(child_comp) => {
                    handle_named_slot_component(
                        child_comp, inst_var, source, options, str, counter,
                    );
                }
                _ => {
                    process_node_inplace(node, source, options, str, counter);
                }
            }

            // Re-open default slot block after this named slot child if needed
            if has_lets {
                // Check if there are more non-named-slot children after this
                let has_more_default = comp.fragment.nodes[i + 1..].iter().any(|n| match n {
                    TemplateNode::RegularElement(el) => {
                        get_slot_attr_value(&el.attributes, source).is_none()
                    }
                    TemplateNode::Component(c) => {
                        get_slot_attr_value(&c.attributes, source).is_none()
                    }
                    TemplateNode::Text(_) => true,
                    _ => true,
                });

                // Don't re-open if there are no more default slot children
                // Actually, we should re-open for any remaining children
                // We'll handle this below
            }
        } else {
            // Default slot child - process normally
            // If the default slot block was closed for a named slot, re-open it
            if has_lets && !default_slot_opened {
                let block_open = format!(
                    "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def.default;$$_$$;",
                    let_destructure, inst_var
                );
                str.append_left(node.start(), &block_open);
                default_slot_opened = true;
            }
            process_node_inplace(node, source, options, str, counter);
        }

        prev_end = Some(node.end());
    }

    // Close the default slot block if still open
    if default_slot_opened && has_lets {
        // Find the position to close: after the last node, before the closing tag
        if let Some(end) = prev_end {
            let closing_tag_start = find_closing_tag_start(source, comp.end);
            if closing_tag_start < comp.end {
                str.append_left(closing_tag_start, "}");
            } else {
                str.append_left(end, "}");
            }
        }
    }
}

/// Handle a regular element child with `slot="name"` attribute inside a component.
///
/// Wraps the element in a `$$slot_def["name"]` destructuring block.
fn handle_named_slot_element(
    el: &RegularElement,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    let slot_name = get_slot_attr_value(&el.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&el.attributes);
    let let_destructure =
        build_let_destructure_string(&let_directives.iter().copied().collect::<Vec<_>>(), source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Build attributes string excluding `slot` and `let:` directives
    let attrs_str = build_named_slot_element_attrs(&el.attributes, source);

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // Build the let variable expressions (for class: directives referencing let vars)
    let let_var_exprs = build_let_var_expressions(&let_directives, source);

    let opener = format!(
        "{}{{ svelteHTML.createElement(\"{}\", {{{}}});{}",
        block_open, el.name, attrs_str, let_var_exprs
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    process_fragment_inplace(&el.fragment, source, options, str, counter);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }}");
    } else {
        str.append_left(el.end, " }}");
    }
}

/// Handle a component child with `slot="name"` attribute inside a parent component.
fn handle_named_slot_component(
    comp: &Component,
    inst_var: &str,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    let slot_name = get_slot_attr_value(&comp.attributes, source).unwrap_or_default();
    let let_directives = get_let_directives(&comp.attributes);
    let let_destructure =
        build_let_destructure_string(&let_directives.iter().copied().collect::<Vec<_>>(), source);

    // Build the slot def block opener
    let block_open = format!(
        "{{const {{/*\u{03A9}ignore_start\u{03A9}*/$$_$$/*\u{03A9}ignore_end\u{03A9}*/,{}}} = {}.$$slot_def[\"{}\"];$$_$$;",
        let_destructure, inst_var, slot_name
    );

    // Insert the block opener before the component
    str.append_left(comp.start, &block_open);

    // Process the component normally (but without the slot/let: attributes affecting it)
    handle_component(comp, source, options, str, counter);

    // Close the named slot block
    str.append_left(comp.end, "}");
}

/// Build attribute string for a named slot element, excluding `slot` and `let:` directives.
fn build_named_slot_element_attrs(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                if node.name == "slot" {
                    continue;
                }
                if let Some(s) = format_attribute_node(node, source) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                parts.push(format_bind_directive(bind, source));
            }
            Attribute::OnDirective(on) => {
                parts.push(format_on_directive(on, source));
            }
            Attribute::ClassDirective(class) => {
                // For named slots, class directives using let vars become just the var name
                parts.push(format_class_directive(class, source));
            }
            Attribute::StyleDirective(style) => {
                parts.push(format_style_directive(style, source));
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            // Skip let: directives and animate
            Attribute::AnimateDirective(_) | Attribute::LetDirective(_) => {}
            Attribute::AttachTag(_) => {}
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        result
    } else {
        format!(" {}", result)
    }
}

/// Build expression statements for let: directive variables.
///
/// For `let:slotvar={newvar}`, the class:newvar directive may reference `newvar`,
/// which needs to appear as a statement `newvar;` after the element opener.
fn build_let_var_expressions(let_directives: &[&LetDirective], source: &str) -> String {
    let mut result = String::new();
    for let_dir in let_directives {
        if let Some(ref expr) = let_dir.expression {
            let expr_text = get_expression_text(expr, source);
            result.push_str(expr_text);
            result.push(';');
        } else {
            // The shorthand let:name doesn't produce an expression
        }
    }
    result
}

/// Handle `<svelte:component this={expr}>`.
fn handle_svelte_component(
    comp: &SvelteComponentElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if comp.start >= comp.end {
        return;
    }

    let expr_text = get_expression_text(&comp.expression, source);
    let idx = counter.next();
    // Use "svelte:component" as the name for variable naming, with ':' replaced by '_'
    let scomp_name = "svelte:component".replace(':', "_");

    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Collect on: directives
    let on_directives = get_on_directives(&comp.attributes);
    let has_events = !on_directives.is_empty();

    // Build attribute/props string (excluding on: directives)
    let mut attrs_str = build_component_props_string(&comp.attributes, source);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !comp.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces("svelte:component", comp.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    let ctor_var = reversed_component_name(&scomp_name, idx);
    let opener = if has_events {
        let inst_var = reversed_component_instance_name(&scomp_name, idx);
        let on_calls = build_on_calls(&inst_var, &on_directives, source);
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); const {} = new {}({{ target: __sveltets_2_any(), props: {{{}}}}});{}",
            ctor_var, expr_text, inst_var, ctor_var, attrs_str, on_calls
        )
    } else {
        format!(
            " {{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{{}}}}});",
            ctor_var, expr_text, ctor_var, attrs_str
        )
    };
    str.overwrite(comp.start, opening_tag_end, &opener);

    process_fragment_inplace(&comp.fragment, source, options, str, counter);

    let closing_tag_start = find_closing_tag_start(source, comp.end);
    if closing_tag_start < comp.end {
        str.overwrite(closing_tag_start, comp.end, "}");
    } else {
        str.append_left(comp.end, "}");
    }
}

/// Handle `<svelte:element this={tag}>`.
fn handle_svelte_dynamic_element(
    el: &SvelteDynamicElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if el.start >= el.end {
        return;
    }

    let tag_text = get_expression_text(&el.tag, source);
    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let attrs_str = build_attributes_string(&el.attributes, source);

    let opener = format!(
        " {{ svelteHTML.createElement({}, {{{}}});",
        tag_text, attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    process_fragment_inplace(&el.fragment, source, options, str, counter);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        str.append_left(el.end, " }");
    }
}

/// Handle `<title>` element.
fn handle_title_element(
    el: &TitleElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let attrs_str = build_attributes_string(&el.attributes, source);

    let opener = format!(
        " {{ svelteHTML.createElement(\"title\", {{{}}});",
        attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    process_fragment_inplace(&el.fragment, source, options, str, counter);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        str.append_left(el.end, " }");
    }
}

/// Handle `<slot>` element.
///
/// Generates `{ __sveltets_createSlot("name", { attrs }); fallback_children }`.
///
/// The slot name is determined by the `name` attribute (default: "default").
/// Other attributes become slot props. `bind:this` gets special handling.
fn handle_slot_element(
    el: &SlotElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);

    // Extract the slot name from attributes (default: "default")
    let slot_name = get_slot_name(&el.attributes, source);

    // Check for bind:this directive
    let bind_this_expr = get_bind_this_expr(&el.attributes, source);

    // Build slot props string (excluding `name` attribute and `bind:this`)
    let slot_props = build_slot_props_string(&el.attributes, source);

    // Build the slot call
    let opener = if bind_this_expr.is_some() {
        format!(
            " {{ const $$_slot{} = __sveltets_createSlot(\"{}\", {{{}}});",
            counter.next(),
            slot_name,
            slot_props
        )
    } else {
        format!(
            " {{ __sveltets_createSlot(\"{}\", {{{}}});",
            slot_name, slot_props
        )
    };
    str.overwrite(el.start, opening_tag_end, &opener);

    // Process fallback children
    process_fragment_inplace(&el.fragment, source, options, str, counter);

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        if let Some(ref bind_expr) = bind_this_expr {
            // For bind:this, assign the slot variable: `s = $$_slot0;}
            str.overwrite(
                closing_tag_start,
                el.end,
                &format!(
                    "{} = $$_slot{};}}",
                    bind_expr,
                    counter.value.saturating_sub(1) // use the counter value from the opener
                ),
            );
        } else {
            str.overwrite(closing_tag_start, el.end, " }");
        }
    } else {
        // Self-closing slot
        if let Some(ref bind_expr) = bind_this_expr {
            let slot_idx = counter.value.saturating_sub(1);
            str.overwrite(
                el.end - 2, // rewrite the `/>` portion
                el.end,
                &format!("{} = $$_slot{};}}", bind_expr, slot_idx),
            );
        } else {
            // Self-closing without bind:this - just close the block
            // The `/>` is part of the opening tag which was already overwritten
            str.append_left(el.end, "}");
        }
    }
}

/// Handle Svelte special elements (svelte:body, svelte:window, etc.).
fn handle_svelte_special_element(
    el: &SvelteElement,
    source: &str,
    options: &Svelte2TsxOptions,
    str: &mut MagicString,
    counter: &mut Counter,
) {
    if el.start >= el.end {
        return;
    }

    let opening_tag_end = find_opening_tag_end(source, el.start, el.end);
    let mut attrs_str = build_attributes_string(&el.attributes, source);

    // Add extra whitespace to match JS svelte2tsx position-preserving behavior
    if !el.attributes.is_empty() && !attrs_str.is_empty() {
        let extra_spaces = count_tag_to_attr_spaces(&el.name, el.start, source);
        if extra_spaces >= 1 {
            let total_spaces = extra_spaces + 1;
            let mut padded = " ".repeat(total_spaces);
            padded.push_str(attrs_str.trim_start());
            attrs_str = padded;
        }
    }

    let opener = format!(
        " {{ svelteHTML.createElement(\"{}\", {{{}}});",
        el.name, attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    process_fragment_inplace(&el.fragment, source, options, str, counter);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        str.append_left(el.end, "}");
    }
}

// =============================================================================
// Attribute Handling
// =============================================================================

/// Build the attributes string for TSX output.
///
/// Returns the inner content for `{ ... }` in createElement or component props.
fn build_attributes_string(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                if let Some(s) = format_attribute_node(node, source) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                parts.push(format_bind_directive(bind, source));
            }
            Attribute::OnDirective(on) => {
                parts.push(format_on_directive(on, source));
            }
            Attribute::ClassDirective(class) => {
                parts.push(format_class_directive(class, source));
            }
            Attribute::StyleDirective(style) => {
                parts.push(format_style_directive(style, source));
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            Attribute::AnimateDirective(_) | Attribute::LetDirective(_) => {
                // These don't produce TSX output
            }
            Attribute::AttachTag(_) => {
                // Attach tags on elements don't produce TSX attribute output
            }
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        result
    } else {
        // Add leading space: `{ "attr":val,}` (not `{"attr":val,}`)
        // Note: JS svelte2tsx may produce variable whitespace due to MagicString
        // position arithmetic, but a single space is the most common case.
        format!(" {}", result)
    }
}

/// Build the attributes/props string for a component, excluding `on:` directives.
///
/// `on:` directives on components become `.$on()` calls instead of props,
/// so they are filtered out here.
///
/// When `on:` directives are present but filtered out, a space is added inside
/// the empty braces to match the JS svelte2tsx output: `props: { }`.
fn build_component_props_string(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();
    let mut has_on_directives = false;
    let mut let_count = 0u32;

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // Skip the `slot` attribute on components (it's for named slot targeting)
                if node.name == "slot" {
                    continue;
                }
                if let Some(s) = format_attribute_node(node, source) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                parts.push(format_bind_directive(bind, source));
            }
            Attribute::OnDirective(_) => {
                // Excluded from component props - handled as $on() calls
                has_on_directives = true;
            }
            Attribute::ClassDirective(class) => {
                parts.push(format_class_directive(class, source));
            }
            Attribute::StyleDirective(style) => {
                parts.push(format_style_directive(style, source));
            }
            Attribute::TransitionDirective(transition) => {
                if let Some(s) = format_transition_directive(transition, source) {
                    parts.push(s);
                }
            }
            Attribute::UseDirective(use_dir) => {
                if let Some(s) = format_use_directive(use_dir, source) {
                    parts.push(s);
                }
            }
            Attribute::LetDirective(_) => {
                // Let directives don't produce props but add a space to match
                // JS svelte2tsx whitespace behavior
                let_count += 1;
            }
            Attribute::AnimateDirective(_) => {
                // Animate directives don't produce TSX output
            }
            Attribute::AttachTag(_) => {
                // Attach tags on elements don't produce TSX attribute output
            }
        }
    }

    let result = parts.join("");
    let let_spaces = " ".repeat(let_count as usize);
    if result.is_empty() {
        if has_on_directives && let_count == 0 {
            // When only on: directives were filtered out, add a space inside the
            // empty braces to match JS svelte2tsx output: `props: { }`
            " ".to_string()
        } else if let_count > 0 {
            // Each let: directive adds a space to match JS svelte2tsx whitespace
            let_spaces
        } else {
            result
        }
    } else {
        // Add let: directive spaces before the regular props
        format!(" {}{}", let_spaces, result)
    }
}

/// Collect references to all `on:` directives from an attribute list.
fn get_on_directives(attributes: &[Attribute]) -> Vec<&OnDirective> {
    attributes
        .iter()
        .filter_map(|attr| match attr {
            Attribute::OnDirective(on) => Some(on),
            _ => None,
        })
        .collect()
}

/// Build `.$on()` call strings for a set of on directives.
///
/// Each directive becomes `inst.$on("eventName", handler);`
/// If no handler expression, uses `() => {}`.
fn build_on_calls(inst_var: &str, on_directives: &[&OnDirective], source: &str) -> String {
    let mut calls = String::new();
    for on in on_directives {
        let handler = if let Some(ref expr) = on.expression {
            get_expression_text(expr, source).to_string()
        } else {
            "() => {}".to_string()
        };
        calls.push_str(&format!("{}.$on(\"{}\", {});", inst_var, on.name, handler));
    }
    calls
}

/// Format a regular attribute: `name="value"` → `"name":\`value\`,`
///
/// Shorthand attributes like `{propB}` (where name equals expression text)
/// produce `propB,` instead of `"propB":propB,`.
fn format_attribute_node(node: &AttributeNode, source: &str) -> Option<String> {
    let name = &node.name;

    match &node.value {
        AttributeValue::True(_) => {
            // Boolean attribute: `disabled` → `"disabled":true,`
            Some(format!("\"{}\":true,", name))
        }
        AttributeValue::Expression(expr) => {
            // Expression value: `name={expr}` → `"name":expr,`
            let expr_text = get_expression_text(&expr.expression, source);
            // Check for shorthand: `{propB}` where name equals expression text
            if name.as_str() == expr_text {
                Some(format!("{},", name))
            } else {
                Some(format!("\"{}\":{},", name, expr_text))
            }
        }
        AttributeValue::Sequence(parts) => {
            // Special case: if the sequence is a single expression like `e="{b}"`,
            // output `"e":b,` (just the expression value) instead of `"e":\`${b}\`,`
            if parts.len() == 1 {
                if let AttributeValuePart::ExpressionTag(expr) = &parts[0] {
                    let expr_text = get_expression_text(&expr.expression, source);
                    return Some(format!("\"{}\":{},", name, expr_text));
                }
            }

            // Text or mixed content: `name="text {expr} text"` → `"name":\`text ${expr} text\`,`
            let mut value_parts = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Escape backtick characters in the text
                        let escaped = text.raw.replace('`', "\\`").replace('$', "\\$");
                        value_parts.push(escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let expr_text = get_expression_text(&expr.expression, source);
                        value_parts.push(format!("${{{}}}", expr_text));
                    }
                }
            }
            Some(format!("\"{}\":`{}`,", name, value_parts.join("")))
        }
    }
}

/// Format a spread attribute: `{...props}` → `...props,`
fn format_spread_attribute(spread: &SpreadAttribute, source: &str) -> Option<String> {
    let expr_text = get_expression_text(&spread.expression, source);
    Some(format!("...{},", expr_text))
}

/// Format a bind directive: `bind:name={expr}` → `"bind:name":expr,`
fn format_bind_directive(bind: &BindDirective, source: &str) -> String {
    let expr_text = get_expression_text(&bind.expression, source);
    format!("\"bind:{}\":{},", bind.name, expr_text)
}

/// Format an on directive: `on:click={handler}` → `"on:click":handler,`
fn format_on_directive(on: &OnDirective, source: &str) -> String {
    if let Some(ref expr) = on.expression {
        let expr_text = get_expression_text(expr, source);
        format!("\"on:{}\":{},", on.name, expr_text)
    } else {
        // Event forwarding: `on:click` → `"on:click":undefined,`
        format!("\"on:{}\":undefined,", on.name)
    }
}

/// Format a class directive: `class:active={expr}` → `"class:active":expr,`
fn format_class_directive(class: &ClassDirective, source: &str) -> String {
    let expr_text = get_expression_text(&class.expression, source);
    format!("\"class:{}\":{},", class.name, expr_text)
}

/// Format a style directive: `style:color={expr}` → `"style:color":expr,`
fn format_style_directive(style: &StyleDirective, source: &str) -> String {
    match &style.value {
        AttributeValue::True(_) => {
            // Shorthand: `style:color` → `"style:color":color,`
            format!("\"style:{}\":{},", style.name, style.name)
        }
        AttributeValue::Expression(expr) => {
            let expr_text = get_expression_text(&expr.expression, source);
            format!("\"style:{}\":{},", style.name, expr_text)
        }
        AttributeValue::Sequence(parts) => {
            let mut value_parts = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        let escaped = text.raw.replace('`', "\\`").replace('$', "\\$");
                        value_parts.push(escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let expr_text = get_expression_text(&expr.expression, source);
                        value_parts.push(format!("${{{}}}", expr_text));
                    }
                }
            }
            format!("\"style:{}\":`{}`,", style.name, value_parts.join(""))
        }
    }
}

/// Format a transition directive: `transition:fade={params}` → `__sveltets_2_ensureTransition(fade)(element, params);`
fn format_transition_directive(transition: &TransitionDirective, source: &str) -> Option<String> {
    if let Some(ref expr) = transition.expression {
        let expr_text = get_expression_text(expr, source);
        Some(format!(
            "__sveltets_2_ensureTransition({})(svelteHTML.mapElementTag('{}'), {}),",
            transition.name, "", expr_text
        ))
    } else {
        Some(format!(
            "__sveltets_2_ensureTransition({})(svelteHTML.mapElementTag('{}'), {{}}),",
            transition.name, ""
        ))
    }
}

/// Format a use directive: `use:action={params}` → `__sveltets_2_ensureAction(action)(element, params);`
fn format_use_directive(use_dir: &UseDirective, source: &str) -> Option<String> {
    if let Some(ref expr) = use_dir.expression {
        let expr_text = get_expression_text(expr, source);
        Some(format!(
            "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {}),",
            use_dir.name, "", expr_text
        ))
    } else {
        Some(format!(
            "__sveltets_2_ensureAction({})(svelteHTML.mapElementTag('{}'), {{}}),",
            use_dir.name, ""
        ))
    }
}

/// Count the number of whitespace characters between the tag name and the
/// first attribute in the opening tag source. This preserves whitespace
/// that the JS svelte2tsx would keep via MagicString in-place editing.
///
/// For `<Test b="6" />`, returns 1 (the space between `Test` and `b`).
/// For `<div class="foo">`, returns 1.
/// For `<Component\n  prop>`, returns 3 (newline + 2 spaces).
fn count_tag_to_attr_spaces(tag_name: &str, el_start: u32, source: &str) -> usize {
    let name_end = el_start as usize + 1 + tag_name.len(); // +1 for '<'
    let bytes = source.as_bytes();
    let mut count = 0;
    let mut i = name_end;
    let end = source.len();
    while i < end {
        let ch = bytes[i];
        if ch == b' ' || ch == b'\t' || ch == b'\n' || ch == b'\r' {
            count += 1;
            i += 1;
        } else {
            break;
        }
    }
    count
}

// =============================================================================
// Slot Helpers
// =============================================================================

/// Extract the slot name from a `<slot>` element's attributes.
/// Returns "default" if no `name` attribute is present.
fn get_slot_name(attributes: &[Attribute], source: &str) -> String {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr {
            if node.name == "name" {
                match &node.value {
                    AttributeValue::Sequence(parts) => {
                        // name="header" → parts is a single Text
                        let mut name = String::new();
                        for part in parts {
                            if let AttributeValuePart::Text(text) = part {
                                name.push_str(&text.raw);
                            }
                        }
                        if !name.is_empty() {
                            return name;
                        }
                    }
                    AttributeValue::Expression(expr) => {
                        // name={expr} - use the expression text
                        return get_expression_text(&expr.expression, source).to_string();
                    }
                    _ => {}
                }
            }
        }
    }
    "default".to_string()
}

/// Get the `bind:this` expression text from a slot element's attributes.
fn get_bind_this_expr<'a>(attributes: &'a [Attribute], source: &'a str) -> Option<String> {
    for attr in attributes {
        if let Attribute::BindDirective(bind) = attr {
            if bind.name == "this" {
                return Some(get_expression_text(&bind.expression, source).to_string());
            }
        }
    }
    None
}

/// Build the props string for a `<slot>` element.
///
/// Excludes the `name` attribute and `bind:this` directive.
/// Format matches `__sveltets_createSlot("name", { props })`.
fn build_slot_props_string(attributes: &[Attribute], source: &str) -> String {
    let mut parts: Vec<String> = Vec::new();

    for attr in attributes {
        match attr {
            Attribute::Attribute(node) => {
                // Skip the `name` attribute - it determines the slot name, not a prop
                if node.name == "name" {
                    continue;
                }
                if let Some(s) = format_attribute_node(node, source) {
                    parts.push(s);
                }
            }
            Attribute::SpreadAttribute(spread) => {
                if let Some(s) = format_spread_attribute(spread, source) {
                    parts.push(s);
                }
            }
            Attribute::BindDirective(bind) => {
                // Skip bind:this on slot elements
                if bind.name == "this" {
                    continue;
                }
                parts.push(format_bind_directive(bind, source));
            }
            _ => {
                // Other directives are not typical on slot elements
            }
        }
    }

    let result = parts.join("");
    if result.is_empty() {
        // Empty props: `{ }` with a space
        " ".to_string()
    } else {
        format!(" {}", result)
    }
}

/// Collect `let:` directives from an attribute list.
fn get_let_directives(attributes: &[Attribute]) -> Vec<&LetDirective> {
    attributes
        .iter()
        .filter_map(|attr| match attr {
            Attribute::LetDirective(let_dir) => Some(let_dir),
            _ => None,
        })
        .collect()
}

/// Build the `let:` destructuring string for slot definitions.
///
/// Given `let:name={n} let:thing let:whatever={{ bla }}`, produces:
/// `name:n,thing,whatever:{ bla },`
fn build_let_destructure_string(let_directives: &[&LetDirective], source: &str) -> String {
    let mut parts = Vec::new();
    for let_dir in let_directives {
        if let Some(ref expr) = let_dir.expression {
            let expr_text = get_expression_text(expr, source);
            parts.push(format!("{}:{},", let_dir.name, expr_text));
        } else {
            // Shorthand: `let:thing` → `thing,`
            parts.push(format!("{},", let_dir.name));
        }
    }
    parts.join("")
}

/// Check if a component has meaningful children (non-whitespace content).
fn has_meaningful_children(fragment: &Fragment) -> bool {
    for node in &fragment.nodes {
        match node {
            TemplateNode::Text(text) => {
                // Check if text contains non-whitespace
                if text.start < text.end {
                    return true;
                }
            }
            _ => return true,
        }
    }
    false
}

/// Get the `slot` attribute value from a regular element's attributes.
/// Returns None if no `slot` attribute is present.
fn get_slot_attr_value(attributes: &[Attribute], source: &str) -> Option<String> {
    for attr in attributes {
        if let Attribute::Attribute(node) = attr {
            if node.name == "slot" {
                match &node.value {
                    AttributeValue::Sequence(parts) => {
                        let mut name = String::new();
                        for part in parts {
                            if let AttributeValuePart::Text(text) = part {
                                name.push_str(&text.raw);
                            }
                        }
                        if !name.is_empty() {
                            return Some(name);
                        }
                    }
                    AttributeValue::Expression(expr) => {
                        return Some(get_expression_text(&expr.expression, source).to_string());
                    }
                    _ => {}
                }
            }
        }
    }
    None
}

/// Count the number of `let:` directives in an attribute list.
fn count_let_directives(attributes: &[Attribute]) -> usize {
    attributes
        .iter()
        .filter(|attr| matches!(attr, Attribute::LetDirective(_)))
        .count()
}

// =============================================================================
// Source Position Helpers
// =============================================================================

/// Find the end of the opening tag (position after the closing `>`).
///
/// Scans from `start` looking for the first `>` that is not inside a string
/// or expression. Returns the position after the `>`.
fn find_opening_tag_end(source: &str, start: u32, element_end: u32) -> u32 {
    let bytes = source.as_bytes();
    let start = start as usize;
    let end = element_end as usize;
    let mut i = start;
    let mut in_string = None::<u8>; // tracks quote char
    let mut brace_depth = 0u32;

    while i < end {
        let ch = bytes[i];

        match in_string {
            Some(quote) => {
                if ch == quote && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                }
            }
            None => {
                if ch == b'"' || ch == b'\'' || ch == b'`' {
                    in_string = Some(ch);
                } else if ch == b'{' {
                    brace_depth += 1;
                } else if ch == b'}' {
                    brace_depth = brace_depth.saturating_sub(1);
                } else if ch == b'>' && brace_depth == 0 {
                    return (i + 1) as u32;
                }
            }
        }
        i += 1;
    }

    // Fallback: return element end
    element_end
}

/// Find the start of the closing tag.
///
/// Scans backwards from `end` looking for `</`.
fn find_closing_tag_start(source: &str, end: u32) -> u32 {
    let bytes = source.as_bytes();
    let end = end as usize;

    // Check if this is a self-closing tag (ends with `/>`)
    if end >= 2 && bytes[end - 2] == b'/' && bytes[end - 1] == b'>' {
        return end as u32; // Return end to signal self-closing
    }

    // Scan backwards for `</`
    let mut i = end;
    while i >= 2 {
        i -= 1;
        if bytes[i] == b'<' && i + 1 < end && bytes[i + 1] == b'/' {
            return i as u32;
        }
    }

    end as u32
}

// =============================================================================
// Legacy string-based API (kept for backward compatibility during migration)
// =============================================================================

/// Process a template fragment and generate TSX output (string-based, legacy).
///
/// This is kept temporarily for backward compatibility. New code should use
/// `process_template_inplace`.
pub fn process_template(fragment: &Fragment, source: &str, options: &Svelte2TsxOptions) -> String {
    let mut str = MagicString::new(source);
    process_template_inplace(fragment, source, options, &mut str);
    str.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Fragment;

    #[test]
    fn test_process_empty_template() {
        let fragment = Fragment::default();
        let options = Svelte2TsxOptions::default();
        let mut str = MagicString::new("");
        process_template_inplace(&fragment, "", &options, &mut str);
        assert_eq!(str.to_string(), "");
    }

    #[test]
    fn test_reversed_component_name() {
        assert_eq!(reversed_component_name("Component", 0), "$$_tnenopmoC0C");
        assert_eq!(reversed_component_name("Foo", 1), "$$_ooF1C");
        assert_eq!(reversed_component_name("Button", 0), "$$_nottuB0C");
    }

    #[test]
    fn test_reversed_component_instance_name() {
        assert_eq!(
            reversed_component_instance_name("Component", 0),
            "$$_tnenopmoC0"
        );
        assert_eq!(reversed_component_instance_name("Button", 0), "$$_nottuB0");
    }
}
