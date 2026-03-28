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
    ExpressionTag, Fragment, HtmlTag, IfBlock, KeyBlock, OnDirective, RegularElement, RenderTag,
    SlotElement, SnippetBlock, SpreadAttribute, StyleDirective, SvelteComponentElement,
    SvelteDynamicElement, SvelteElement, TemplateNode, Text, TitleElement, TransitionDirective,
    UseDirective,
};

use super::magic_string::MagicString;
use super::svelte2tsx::Svelte2TsxOptions;

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

/// Generate a reversed component variable name.
/// Component → $$_tnenopmoC0C
fn reversed_component_name(name: &str, index: u32) -> String {
    let reversed: String = name.chars().rev().collect();
    let first_char = name.chars().next().unwrap_or('C');
    format!("$$_{}{}{}", reversed, index, first_char)
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
        TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteOptions(el)
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
/// (replaced with spaces). At least 1 space is preserved if text existed.
fn handle_text(text: &Text, _source: &str, str: &mut MagicString) {
    if text.start >= text.end {
        return;
    }
    // Overwrite the text node with a single space
    // (text nodes don't affect types but we need to maintain position)
    let replacement = " ";
    str.overwrite(text.start, text.end, replacement);
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
        // Overwrite `{@const ` prefix with empty
        if tag.start < decl_start {
            str.overwrite(tag.start, decl_start, "");
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
fn handle_debug_tag(tag: &DebugTag, _source: &str, str: &mut MagicString) {
    if tag.start >= tag.end {
        return;
    }
    // Debug tags are replaced with empty (they don't affect types)
    str.overwrite(tag.start, tag.end, "");
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
    let attrs_str = build_attributes_string(&el.attributes, source);

    // Overwrite the entire opening tag
    let opener = format!(
        "{{ svelteHTML.createElement(\"{}\", {{{}}});",
        el.name, attrs_str
    );
    str.overwrite(el.start, opening_tag_end, &opener);

    // Process children
    process_fragment_inplace(&el.fragment, source, options, str, counter);

    // Find and overwrite the closing tag
    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        // Self-closing element - append closing brace
        // The opening tag end already includes `/>`, so just append
        str.append_left(el.end, " }");
    }
}

/// Handle a Svelte component: `<Component ...>`.
///
/// Generates:
/// ```text
/// { const $$_tnenopmoC0C = __sveltets_2_ensureComponent(Component);
///   new $$_tnenopmoC0C({ target: __sveltets_2_any(), props: {"prop":val,}});}
/// ```
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
    let var_name = reversed_component_name(&comp.name, idx);

    // Find the end of the opening tag
    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);

    // Build attribute/props string
    let attrs_str = build_attributes_string(&comp.attributes, source);

    // Build the replacement for the opening tag
    let opener = format!(
        "{{ const {} = __sveltets_2_ensureComponent({}); new {}({{ target: __sveltets_2_any(), props: {{{}}}}});",
        var_name, comp.name, var_name, attrs_str
    );
    str.overwrite(comp.start, opening_tag_end, &opener);

    // Process children (slot content)
    process_fragment_inplace(&comp.fragment, source, options, str, counter);

    // Handle closing tag
    let closing_tag_start = find_closing_tag_start(source, comp.end);
    if closing_tag_start < comp.end {
        str.overwrite(closing_tag_start, comp.end, "}");
    } else {
        str.append_left(comp.end, "}");
    }
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

    let opening_tag_end = find_opening_tag_end(source, comp.start, comp.end);
    let attrs_str = build_attributes_string(&comp.attributes, source);

    let opener = format!(
        "{{ const $$_scomp{} = __sveltets_2_ensureComponent({}); new $$_scomp{}({{ target: __sveltets_2_any(), props: {{{}}}}});",
        idx, expr_text, idx, attrs_str
    );
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
        "{{ svelteHTML.createElement({}, {{{}}});",
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

    let opener = format!("{{ svelteHTML.createElement(\"title\", {{{}}});", attrs_str);
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
    let attrs_str = build_attributes_string(&el.attributes, source);

    let opener = format!("{{ svelteHTML.createElement(\"slot\", {{{}}});", attrs_str);
    str.overwrite(el.start, opening_tag_end, &opener);

    process_fragment_inplace(&el.fragment, source, options, str, counter);

    let closing_tag_start = find_closing_tag_start(source, el.end);
    if closing_tag_start < el.end {
        str.overwrite(closing_tag_start, el.end, " }");
    } else {
        str.append_left(el.end, " }");
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
    let attrs_str = build_attributes_string(&el.attributes, source);

    let opener = format!(
        "{{ svelteHTML.createElement(\"{}\", {{{}}});",
        el.name, attrs_str
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

    parts.join("")
}

/// Format a regular attribute: `name="value"` → `"name":\`value\`,`
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
            Some(format!("\"{}\":{},", name, expr_text))
        }
        AttributeValue::Sequence(parts) => {
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
        assert_eq!(reversed_component_name("Foo", 1), "$$_ooF1F");
    }
}
