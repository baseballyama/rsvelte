//! CSS code generation.
//!
//! Generates scoped CSS stylesheets with selector scoping.
//! Preserves original whitespace from source using AST positions.

use memchr::{memchr, memmem};
use std::fmt::Write as _;

use super::super::phase1_parse::parse_css;
use super::{CssOutput, TransformError};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase2_analyze::types::DomStructure;
use rustc_hash::FxHashSet;
use serde_json::Value;

/// Context for CSS transformation containing analysis data and options
#[derive(Clone)]
struct CssContext<'a> {
    /// Element names used in the template
    used_elements: &'a FxHashSet<String>,
    /// Class names used in the template
    used_classes: &'a FxHashSet<String>,
    /// IDs used in the template
    used_ids: &'a FxHashSet<String>,
    /// Whether there are dynamic elements (svelte:element)
    has_dynamic_elements: bool,
    /// Whether there are dynamic class expressions
    has_dynamic_classes: bool,
    /// Whether any element has a dynamically-valued `id` (so `#id` selectors
    /// cannot be pruned — a dynamic id can resolve to any value at runtime)
    has_dynamic_ids: bool,
    /// Whether template has control flow (if/each/await/snippet/slot)
    has_control_flow: bool,
    /// Whether template has opaque elements (slots/snippets/render tags) or
    /// non-exhaustive await blocks that prevent reliable sibling analysis
    has_opaque_sibling_boundaries: bool,
    /// DOM structure for advanced selector matching
    dom_structure: &'a DomStructure,
    /// Stack of parent rule preludes for resolving NestingSelector (&) in nested CSS rules.
    /// Each entry is a reference to the prelude Value of an ancestor rule.
    /// Used to determine unused status of compound selectors containing &.
    /// Uses RefCell for interior mutability so we can push/pop while passing &CssContext.
    parent_preludes: std::cell::RefCell<Vec<&'a Value>>,
    /// Start offsets of the `:is()` / `:where()` / `:has()` arguments that were
    /// found unreachable — upstream's `metadata.used` on an argument
    /// `ComplexSelector`. `None` until the marking walk has run; the printer then
    /// reads the same decision the warning did, instead of recomputing it.
    unused_branches: std::cell::RefCell<Option<FxHashSet<u32>>>,
    /// Whether we're in dev mode (affects empty rule handling)
    dev: bool,
    /// Whether to minify the output (for injected CSS in SSR)
    minify: bool,
}

/// A CSS unused selector warning.
pub struct CssUnusedWarning {
    /// The selector text that is unused
    pub selector_text: String,
    /// Start position in source
    pub start: u32,
    /// End position in source
    pub end: u32,
}

/// Collect CSS unused selector warnings.
///
/// This walks the CSS AST and uses the same unused detection logic as
/// the CSS transform phase to identify selectors that don't match any
/// template elements.
///
/// Corresponds to `warn_unused()` in Svelte's `css-warn.js`.
pub fn collect_css_unused_warnings(
    analysis: &ComponentAnalysis,
    ast: Option<&crate::ast::css::StyleSheet>,
    source: &str,
) -> Vec<CssUnusedWarning> {
    let mut warnings = Vec::new();

    if !analysis.css.has_css || analysis.css.hash.is_empty() {
        return warnings;
    }

    let ctx = CssContext {
        used_elements: &analysis.css.used_elements,
        used_classes: &analysis.css.used_classes,
        used_ids: &analysis.css.used_ids,
        has_dynamic_elements: analysis.css.has_dynamic_elements,
        has_dynamic_classes: analysis.css.has_dynamic_classes,
        has_dynamic_ids: analysis.css.has_dynamic_ids,
        has_control_flow: analysis.css.has_control_flow,
        has_opaque_sibling_boundaries: analysis.css.has_opaque_elements,
        dom_structure: &analysis.css.dom_structure,
        parent_preludes: std::cell::RefCell::new(Vec::new()),
        unused_branches: std::cell::RefCell::new(None),
        dev: false,
        minify: false,
    };

    // Prefer the phase-1-parsed stylesheet's recorded content span over a
    // textual scan: a `<style>` substring inside a `<script>` string literal
    // would otherwise be mistaken for the real stylesheet (see
    // `render_stylesheet_internal`).
    let extracted;
    let resolved: Option<(&str, usize, Option<&[Value]>)> = match ast {
        Some(ss) => Some((
            ss.content.styles.as_str(),
            ss.content.start as usize,
            (!ss.children.is_empty()).then_some(ss.children.as_slice()),
        )),
        None => match extract_css_content(source) {
            Some((c, s)) => {
                extracted = c;
                Some((extracted.as_str(), s, None))
            }
            None => None,
        },
    };

    if let Some((css_content, css_start, ast_children)) = resolved {
        let reparsed;
        let children: &[Value] = match ast_children {
            Some(c) => c,
            None => {
                reparsed = parse_css(css_content, css_start);
                &reparsed
            }
        };
        collect_unused_warnings_from_nodes(
            children,
            css_content,
            css_start,
            &ctx,
            &mut warnings,
            false,
        );
    }

    warnings
}

/// Walk into :is() / :where() pseudo-classes in a complex selector and report
/// individual unused alternatives.
///
/// For example, `x :is(y, .unused)` - if the overall selector is used but `.unused`
/// inside :is() doesn't match any DOM element, report it.
/// Clone `complex` and replace the simple selector at `children[ri].selectors[si]`
/// (a `:is()` / `:where()` pseudo-class) with `branch_selectors` — the simple
/// selectors of one of its single-compound argument branches. The rest of the
/// compound (combinators, sibling/descendant relations, other simple selectors)
/// is preserved, so the result can be reachability-checked as if that branch
/// had been written in place of the `:is()`.
fn substitute_is_branch(
    complex: &Value,
    ri: usize,
    si: usize,
    branch_selectors: &[Value],
) -> Value {
    let mut synth = complex.clone();
    if let Some(children) = synth.get_mut("children").and_then(|c| c.as_array_mut())
        && let Some(rel) = children.get_mut(ri)
        && let Some(sels) = rel.get_mut("selectors").and_then(|s| s.as_array_mut())
        && si < sels.len()
    {
        sels.splice(si..si + 1, branch_selectors.iter().cloned());
    }
    synth
}

/// Record an argument `ComplexSelector` as unreachable, keyed by its start
/// offset — upstream's `metadata.used = false` on that node.
fn mark_branch_unused(inner_complex: &Value, ctx: &CssContext) {
    let Some(start) = inner_complex.get("start").and_then(|s| s.as_u64()) else {
        return;
    };
    ctx.unused_branches
        .borrow_mut()
        .get_or_insert_with(FxHashSet::default)
        .insert(start as u32);
}

/// Run the unused walk purely for its marking side effect, so the printer and
/// the warnings answer "is this argument used?" from one computation.
fn mark_unused_functional_branches<'a>(
    nodes: &'a [Value],
    css_source: &str,
    css_start: usize,
    ctx: &CssContext<'a>,
) {
    ctx.unused_branches
        .borrow_mut()
        .get_or_insert_with(FxHashSet::default);
    let mut discarded = Vec::new();
    collect_unused_warnings_from_nodes(nodes, css_source, css_start, ctx, &mut discarded, false);
}

fn collect_is_where_unused_warnings(
    complex_selector: &Value,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext,
    warnings: &mut Vec<CssUnusedWarning>,
) {
    let rel_selectors = match complex_selector.get("children").and_then(|c| c.as_array()) {
        Some(rs) => rs,
        None => return,
    };

    for (ri, rel) in rel_selectors.iter().enumerate() {
        let selectors = match rel.get("selectors").and_then(|s| s.as_array()) {
            Some(s) => s,
            None => continue,
        };

        for (si, sel) in selectors.iter().enumerate() {
            let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
            let sel_name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");

            if sel_type == "PseudoClassSelector"
                && (sel_name == "is" || sel_name == "where" || sel_name == "has")
                && let Some(args) = sel.get("args")
                && !args.is_null()
                && let Some(children) = args.get("children").and_then(|c| c.as_array())
            {
                // A `:has()` argument is matched against the subject's subtree, not
                // substituted into the enclosing chain, and upstream's `css-warn.js`
                // never recurses into it — so it is marked but never reported.
                if sel_name == "has" {
                    let flags = has_argument_unused_flags(rel_selectors, ri, selectors, sel, ctx);
                    for (bi, inner_complex) in children.iter().enumerate() {
                        let unused = flags.as_ref().is_some_and(|f| f.get(bi) == Some(&true))
                            || is_functional_branch_unused(inner_complex, None, ctx);
                        if unused {
                            mark_branch_unused(inner_complex, ctx);
                        }
                    }
                    continue;
                }

                for inner_complex in children {
                    // Skip multi-part selectors (with combinators like `html *`).
                    // These could reference elements outside the component and
                    // the official compiler assumes they match (can't determine
                    // unused for cross-component selectors).
                    let inner_parts = inner_complex
                        .get("children")
                        .and_then(|c| c.as_array())
                        .map(|a| a.len())
                        .unwrap_or(0);
                    if inner_parts > 1 {
                        continue;
                    }

                    // Evaluate the branch IN THE CONTEXT of the surrounding
                    // compound, not in isolation: substitute the branch's
                    // simple selectors in place of the `:is()` / `:where()` in
                    // the parent complex selector and check whether the whole
                    // substituted selector is reachable. This catches branches
                    // that are unreachable only because of a combinator — e.g.
                    // for `:is(.a, .b) + .c` where `.c` never immediately
                    // follows `.a`, the `.a` branch is unused even though a
                    // bare `.a` element exists. Mirrors upstream marking each
                    // `:is` argument's `metadata.used` during the real walk.
                    let branch_selectors = inner_complex
                        .get("children")
                        .and_then(|c| c.as_array())
                        .and_then(|a| a.first())
                        .and_then(|r| r.get("selectors"))
                        .and_then(|s| s.as_array());

                    let unused = match branch_selectors {
                        // A branch that resolves its own `&` is matched from
                        // the document root, not below the parent: upstream's
                        // `get_relative_selectors` prepends the parent only
                        // when no `&` is present.
                        Some(bs) => match branch_alternatives(bs, ctx) {
                            Some(alternatives) => without_parent_preludes(ctx, || {
                                alternatives.iter().all(|bs| {
                                    let synth = substitute_is_branch(complex_selector, ri, si, bs);
                                    is_complex_selector_unused(&synth, ctx)
                                })
                            }),
                            None => {
                                let synth = substitute_is_branch(complex_selector, ri, si, bs);
                                is_complex_selector_unused(&synth, ctx)
                            }
                        },
                        // Empty branch (e.g. `:is()`) — fall back to the
                        // isolated check.
                        None => is_complex_selector_unused(inner_complex, ctx),
                    };

                    if unused {
                        mark_branch_unused(inner_complex, ctx);
                        let start = inner_complex
                            .get("start")
                            .and_then(|s| s.as_u64())
                            .unwrap_or(0) as u32;
                        let end = inner_complex
                            .get("end")
                            .and_then(|e| e.as_u64())
                            .unwrap_or(0) as u32;
                        let text = get_complex_selector_text(inner_complex, css_source, css_start);
                        warnings.push(CssUnusedWarning {
                            selector_text: text,
                            start,
                            end,
                        });
                    }
                }
            }
        }
    }
}

/// Recursively collect unused selector warnings from CSS AST nodes.
fn collect_unused_warnings_from_nodes<'a>(
    nodes: &'a [Value],
    css_source: &str,
    css_start: usize,
    ctx: &CssContext<'a>,
    warnings: &mut Vec<CssUnusedWarning>,
    in_global_block: bool,
) {
    for node in nodes {
        if let Some(node_type) = node.get("type").and_then(|t| t.as_str()) {
            match node_type {
                "Rule" => {
                    // Check if this rule creates a :global block context for its children
                    let this_creates_global_block = selector_contains_global_block(node);
                    let children_in_global_block = in_global_block || this_creates_global_block;

                    // Check the selector list (prelude) for unused complex selectors.
                    // Skip if we're inside a parent's :global block (selectors there are always used).
                    // But still check the current rule's own selector even if it contains :global
                    // (e.g., `.unused :global { ... }` should warn about `.unused :global`).
                    if !in_global_block
                        && let Some(prelude) = node.get("prelude")
                        && let Some(complex_selectors) =
                            prelude.get("children").and_then(|c| c.as_array())
                    {
                        // Do NOT push the current rule's prelude before checking its own
                        // selectors. parent_preludes should only contain ancestor preludes.
                        // The NestingSelector (&) in the current selector refers to the
                        // parent rule, not the current rule.
                        for complex_selector in complex_selectors {
                            let is_unused = is_complex_selector_unused(complex_selector, ctx);
                            if is_unused {
                                let start = complex_selector
                                    .get("start")
                                    .and_then(|s| s.as_u64())
                                    .unwrap_or(0)
                                    as u32;
                                let end = complex_selector
                                    .get("end")
                                    .and_then(|e| e.as_u64())
                                    .unwrap_or(0) as u32;
                                let text = get_complex_selector_text(
                                    complex_selector,
                                    css_source,
                                    css_start,
                                );
                                warnings.push(CssUnusedWarning {
                                    selector_text: text,
                                    start,
                                    end,
                                });
                            }

                            // Walk into :is() / :where() pseudo-classes and check
                            // individual complex selectors inside them.
                            // Only if the parent complex selector is USED (not already reported).
                            if !is_unused {
                                collect_is_where_unused_warnings(
                                    complex_selector,
                                    css_source,
                                    css_start,
                                    ctx,
                                    warnings,
                                );
                            }
                        }
                    }

                    // Recursively check nested rules
                    if let Some(block) = node.get("block")
                        && let Some(children) = block.get("children").and_then(|c| c.as_array())
                    {
                        // Push parent prelude for nested context
                        if let Some(prelude) = node.get("prelude") {
                            ctx.parent_preludes.borrow_mut().push(prelude);
                        }
                        collect_unused_warnings_from_nodes(
                            children,
                            css_source,
                            css_start,
                            ctx,
                            warnings,
                            children_in_global_block,
                        );
                        if node.get("prelude").is_some() {
                            ctx.parent_preludes.borrow_mut().pop();
                        }
                    }
                }
                "Atrule" => {
                    if let Some(block) = node.get("block")
                        && let Some(children) = block.get("children").and_then(|c| c.as_array())
                    {
                        // Check if this is @keyframes or @page - selectors inside these are not checked
                        // @page contains declarations and margin at-rules, not selectors
                        let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");
                        let skip_children = name == "keyframes"
                            || name == "-webkit-keyframes"
                            || name == "-moz-keyframes"
                            || name == "-o-keyframes"
                            || name == "page";

                        if !skip_children {
                            collect_unused_warnings_from_nodes(
                                children,
                                css_source,
                                css_start,
                                ctx,
                                warnings,
                                in_global_block,
                            );
                        }
                    }
                }
                _ => {}
            }
        }
    }
}

/// Render the stylesheet for a component.
///
/// `preparsed` is the phase-1-parsed `<style>` AST (`Root.css`). When present
/// and its content offset matches, its `children` are reused directly, avoiding
/// a full re-parse of the stylesheet here.
pub fn render_stylesheet(
    analysis: &ComponentAnalysis,
    ast: Option<&crate::ast::css::StyleSheet>,
    source: &str,
    options: &CompileOptions,
) -> Result<CssOutput, TransformError> {
    render_stylesheet_internal(analysis, ast, source, options, false, true)
}

pub(crate) fn render_stylesheet_with_sourcemap_content(
    analysis: &ComponentAnalysis,
    ast: Option<&crate::ast::css::StyleSheet>,
    source: &str,
    options: &CompileOptions,
    include_sourcemap_content: bool,
) -> Result<CssOutput, TransformError> {
    render_stylesheet_internal(
        analysis,
        ast,
        source,
        options,
        false,
        include_sourcemap_content,
    )
}

/// Render the stylesheet for a component with optional minification.
/// Used for injected CSS in SSR which should be minified.
pub fn render_stylesheet_minified(
    analysis: &ComponentAnalysis,
    ast: Option<&crate::ast::css::StyleSheet>,
    source: &str,
    options: &CompileOptions,
) -> Result<CssOutput, TransformError> {
    render_stylesheet_internal(analysis, ast, source, options, true, true)
}

/// Internal implementation of render_stylesheet with minification option.
fn render_stylesheet_internal(
    analysis: &ComponentAnalysis,
    ast: Option<&crate::ast::css::StyleSheet>,
    source: &str,
    options: &CompileOptions,
    minify: bool,
    include_sourcemap_content: bool,
) -> Result<CssOutput, TransformError> {
    if !analysis.css.has_css || analysis.css.hash.is_empty() {
        return Ok(CssOutput {
            code: String::new(),
            map: None,
        });
    }

    let hash = &analysis.css.hash;
    let selector = format!(".{}", hash);

    // Create context for unused selector detection
    let ctx = CssContext {
        used_elements: &analysis.css.used_elements,
        used_classes: &analysis.css.used_classes,
        used_ids: &analysis.css.used_ids,
        has_dynamic_elements: analysis.css.has_dynamic_elements,
        has_dynamic_classes: analysis.css.has_dynamic_classes,
        has_dynamic_ids: analysis.css.has_dynamic_ids,
        has_control_flow: analysis.css.has_control_flow,
        has_opaque_sibling_boundaries: analysis.css.has_opaque_elements,
        dom_structure: &analysis.css.dom_structure,
        parent_preludes: std::cell::RefCell::new(Vec::new()),
        unused_branches: std::cell::RefCell::new(None),
        dev: options.dev,
        minify,
    };

    // Determine the CSS content and its start offset. Prefer the phase-1-parsed
    // stylesheet's recorded content span: the AST captured the *real* `<style>`
    // block from a structural parse, where the script body is opaque raw text.
    // The textual `extract_css_content` scan must NOT be used when an AST exists
    // because a `<style>` substring can legitimately appear inside a `<script>`
    // string literal (e.g. a docs page rendering a Svelte code sample), which
    // the scan would wrongly latch onto instead of the actual stylesheet.
    let extracted;
    let (css_content, css_start): (&str, usize) = match ast {
        Some(ss) => (ss.content.styles.as_str(), ss.content.start as usize),
        None => match extract_css_content(source) {
            Some((c, s)) => {
                extracted = c;
                (extracted.as_str(), s)
            }
            None => {
                return Ok(CssOutput {
                    code: String::new(),
                    map: None,
                });
            }
        },
    };

    {
        // Reuse the phase-1-parsed stylesheet's children when present, avoiding a
        // redundant full re-parse (the transform profile showed this re-parse at
        // ~60% inclusive on CSS-heavy input). `parse_css` here is the *same*
        // function phase 1 used, so the trees are byte-identical; fall back to a
        // re-parse only when no AST children are available (e.g. a deferred parse
        // or comment-only `<style>` block).
        let reparsed;
        let children: &[Value] = match ast {
            Some(ss) if !ss.children.is_empty() => &ss.children,
            _ => {
                reparsed = parse_css(css_content, css_start);
                &reparsed
            }
        };

        mark_unused_functional_branches(children, css_content, css_start, &ctx);

        // Collect keyframe names for animation value replacement
        let keyframes = collect_keyframe_names(children);

        // Transform the CSS
        let mut writer = transform_css(children, &selector, hash, css_content, css_start, &ctx);
        if let Some(stylesheet) = ast {
            for comment in &stylesheet.comments {
                if let Some(start) = comment.get("start").and_then(Value::as_u64) {
                    writer.mark(start as usize);
                }
                if let Some(end) = comment.get("end").and_then(Value::as_u64) {
                    writer.mark(end as usize);
                }
            }
        }

        // Post-process: replace animation keyframe references. Upstream inserts
        // the prefix with `prependRight`, which splits the chunk it lands in and
        // maps both halves, so the copies are shifted rather than dropped.
        if !keyframes.is_empty() {
            let (text, insertions) = replace_animation_keyframes(&writer.text, hash, &keyframes);
            writer.text = text;
            writer.apply_insertions(&insertions);
        }

        // Generate CSS source map
        let map = generate_css_sourcemap(source, &writer, options, include_sourcemap_content);

        Ok(CssOutput {
            code: writer.text,
            map,
        })
    }
}

/// Generate a source map for the CSS output.
///
/// Mirrors what MagicString's `generateMap` produces for the edit stream
/// `css/index.js` applies: a segment at the start of every copied run, at the
/// start of every line inside one, and at every `addSourcemapLocation` — which
/// the `_` visitor calls on every visited node's `start` and `end`. Inserted
/// text is a chunk intro/outro and carries no segment at all.
fn generate_css_sourcemap(
    source: &str,
    writer: &CssWriter,
    options: &CompileOptions,
    include_sourcemap_content: bool,
) -> Option<String> {
    use super::js_ast::codegen::{
        SourceMapping, build_line_starts, encode_vlq_mappings, generate_sourcemap_json,
        get_source_name, offset_to_line_col_utf16,
    };

    let css_output_filename = options.css_output_filename.as_deref();
    let filename = options.filename.as_deref();

    // Compute source name relative to output
    let source_name = if let (Some(css_out), Some(input)) = (css_output_filename, filename) {
        get_source_name(Some(input), Some(css_out), "input.svelte")
    } else if let Some(input) = filename {
        get_source_name(Some(input), None, "input.svelte")
    } else {
        "input.svelte".to_string()
    };

    // `file: options.cssOutputFilename || options.filename` (`css/index.js`),
    // which MagicString reduces to its basename.
    let file_name = css_output_filename
        .or(filename)
        .and_then(|f| f.split(['/', '\\']).next_back())
        .unwrap_or("input.svelte.css")
        .to_string();

    let source_line_starts = build_line_starts(source);
    let code = writer.text.as_bytes();
    let mut mappings: Vec<SourceMapping> = Vec::new();
    let mut gen_line = 0u32;
    let mut gen_col = 0u32;
    let mut cursor = 0usize;

    let advance = |from: usize, to: usize, gen_line: &mut u32, gen_col: &mut u32| {
        for c in writer.text[from..to].chars() {
            if c == '\n' {
                *gen_line += 1;
                *gen_col = 0;
            } else {
                *gen_col += c.len_utf16() as u32;
            }
        }
    };

    for &(gen_start, src_start, len) in &writer.copies {
        let gen_start = gen_start as usize;
        advance(cursor, gen_start, &mut gen_line, &mut gen_col);
        cursor = gen_start + len as usize;

        let (mut line, mut column) =
            offset_to_line_col_utf16(source, &source_line_starts, src_start as usize);
        let mut first = true;
        let mut offset = src_start;
        for c in source[offset as usize..(src_start + len) as usize].chars() {
            if c == '\n' {
                line += 1;
                column = 0;
                gen_line += 1;
                gen_col = 0;
                first = true;
                offset += c.len_utf8() as u32;
                continue;
            }
            if first || writer.marks.contains(&offset) {
                mappings.push(SourceMapping {
                    gen_line,
                    gen_col,
                    source: 0,
                    orig_line: line as u32,
                    orig_col: column as u32,
                    name: None,
                });
            }
            column += c.len_utf16();
            gen_col += c.len_utf16() as u32;
            first = false;
            offset += c.len_utf8() as u32;
        }
    }
    advance(cursor, code.len(), &mut gen_line, &mut gen_col);

    let mut mappings_str = encode_vlq_mappings(&mappings);
    let output_line_count = writer.text.matches('\n').count();
    let mapped_lines = mappings_str.matches(';').count();
    for _ in mapped_lines..output_line_count {
        mappings_str.push(';');
    }

    Some(generate_sourcemap_json(
        Some(&file_name),
        &source_name,
        include_sourcemap_content.then_some(source),
        &mappings_str,
        &[],
    ))
}

fn collect_keyframe_names(children: &[Value]) -> FxHashSet<String> {
    let mut keyframes = FxHashSet::default();
    for child in children {
        collect_keyframe_names_from_node(child, &mut keyframes, false);
    }
    keyframes
}

/// Recursively collect keyframe names from a node.
/// Skips keyframes defined inside :global{} blocks since they are global and not scoped.
fn collect_keyframe_names_from_node(
    node: &Value,
    keyframes: &mut FxHashSet<String>,
    in_global_block: bool,
) {
    let node_type = node.get("type").and_then(|t| t.as_str());
    match node_type {
        Some("Atrule") => {
            let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");
            if matches!(
                name,
                "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
            ) && let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
            {
                let keyframe_name = prelude.trim();
                // Don't collect keyframes that start with -global- or are inside :global{} blocks
                if !keyframe_name.starts_with("-global-") && !in_global_block {
                    keyframes.insert(keyframe_name.to_string());
                }
            }
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    collect_keyframe_names_from_node(child, keyframes, in_global_block);
                }
            }
        }
        Some("Rule") => {
            // Check if this rule is a :global {} block
            let is_global = is_global_block(node);
            let child_in_global = in_global_block || is_global;

            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(|c| c.as_array())
            {
                for child in children {
                    collect_keyframe_names_from_node(child, keyframes, child_in_global);
                }
            }
        }
        _ => {}
    }
}

/// Check if a character is a CSS name boundary (whitespace, comma, semicolon, or closing brace)
fn is_css_name_boundary(c: char) -> bool {
    c.is_whitespace() || c == ',' || c == ';' || c == '}'
}

/// Replace animation keyframe name references in the CSS output
/// This follows the official Svelte implementation approach: scan through animation property
/// values and prefix any tokens that match defined keyframe names.
/// Returns the rewritten text and, in ascending order, every `(offset in the
/// input text, inserted byte length)` — upstream inserts the prefix with
/// `prependRight`, so the rest of the stylesheet keeps its mapping.
fn replace_animation_keyframes(
    css: &str,
    hash: &str,
    keyframes: &FxHashSet<String>,
) -> (String, Vec<(u32, u32)>) {
    let mut result = String::with_capacity(css.len() + keyframes.len() * hash.len() * 2);
    let chars: Vec<char> = css.chars().collect();
    let mut insertions: Vec<(u32, u32)> = Vec::new();
    let mut inserted = 0usize;
    let mut i = 0;

    while i < chars.len() {
        // Skip comments entirely: the official compiler only renames keyframe
        // references inside real Declaration nodes, so declarations that ended up
        // inside `/* (unused) ... */` / `/* (empty) ... */` comments (or ordinary
        // source comments) must keep their original animation names.
        if chars[i] == '/' && i + 1 < chars.len() && chars[i + 1] == '*' {
            result.push(chars[i]);
            result.push(chars[i + 1]);
            i += 2;
            while i < chars.len() {
                if chars[i] == '*' && i + 1 < chars.len() && chars[i + 1] == '/' {
                    result.push(chars[i]);
                    result.push(chars[i + 1]);
                    i += 2;
                    break;
                }
                result.push(chars[i]);
                i += 1;
            }
            continue;
        }

        // Look for animation or animation-name property
        let remaining: String = chars[i..].iter().collect();
        let lower = remaining.to_lowercase();

        // Check for animation properties (including vendor prefixes)
        let property_match = if lower.starts_with("animation-name") {
            Some(("animation-name", 14))
        } else if lower.starts_with("animation") && !lower.starts_with("animation-") {
            Some(("animation", 9))
        } else if lower.starts_with("-webkit-animation-name") {
            Some(("-webkit-animation-name", 22))
        } else if lower.starts_with("-webkit-animation") && !lower.starts_with("-webkit-animation-")
        {
            Some(("-webkit-animation", 17))
        } else if lower.starts_with("-moz-animation-name") {
            Some(("-moz-animation-name", 19))
        } else if lower.starts_with("-moz-animation") && !lower.starts_with("-moz-animation-") {
            Some(("-moz-animation", 14))
        } else if lower.starts_with("-o-animation-name") {
            Some(("-o-animation-name", 17))
        } else if lower.starts_with("-o-animation") && !lower.starts_with("-o-animation-") {
            Some(("-o-animation", 12))
        } else {
            None
        };

        if let Some((_, prop_len)) = property_match {
            // Copy property name
            for j in 0..prop_len {
                result.push(chars[i + j]);
            }
            i += prop_len;

            // Skip whitespace and colon
            while i < chars.len() && (chars[i].is_whitespace() || chars[i] == ':') {
                result.push(chars[i]);
                i += 1;
            }

            // Now scan the value, looking for keyframe names
            let mut name = String::new();
            let mut name_start = result.len();

            while i < chars.len() {
                let c = chars[i];

                if is_css_name_boundary(c) {
                    // Check if the accumulated name is a keyframe
                    if !name.is_empty() && keyframes.contains(&name) {
                        // Insert prefix before the name
                        let prefix = format!("{}-", hash);
                        result.insert_str(name_start, &prefix);
                        insertions.push(((name_start - inserted) as u32, prefix.len() as u32));
                        inserted += prefix.len();
                    }
                    name.clear();

                    result.push(c);
                    i += 1;

                    // Check for end of declaration
                    if c == ';' || c == '}' {
                        break;
                    }

                    // Update name_start for next potential name
                    name_start = result.len();
                } else {
                    name.push(c);
                    result.push(c);
                    i += 1;
                }
            }

            // Handle name at end of value (before EOF or without terminator)
            if !name.is_empty() && keyframes.contains(&name) {
                let prefix = format!("{}-", hash);
                result.insert_str(name_start, &prefix);
                insertions.push(((name_start - inserted) as u32, prefix.len() as u32));
                inserted += prefix.len();
            }
        } else {
            result.push(chars[i]);
            i += 1;
        }
    }

    (result, insertions)
}

/// Extract CSS content from source (finds the <style> block)
/// Returns (css_content, start_position_in_source)
fn extract_css_content(source: &str) -> Option<(String, usize)> {
    let bytes = source.as_bytes();
    // A `<style`/`</style` prefix is only the real stylesheet tag when the next
    // byte terminates the tag name — otherwise `<style-foo>` (a custom element)
    // would be misread as the stylesheet.
    let is_term = |b: Option<&u8>| {
        matches!(
            b,
            None | Some(b'>')
                | Some(b'/')
                | Some(b' ')
                | Some(b'\t')
                | Some(b'\n')
                | Some(b'\r')
                | Some(0x0c)
        )
    };
    // Exact `<style` open tag (reject `<style-foo`, `<styles`, …).
    let mut at = 0;
    let style_start = loop {
        let p = at + memmem::find(&bytes[at..], b"<style")?;
        if is_term(bytes.get(p + 6)) {
            break p;
        }
        at = p + 6;
    };
    let content_start = memchr(b'>', &bytes[style_start..])? + style_start + 1;
    // Exact `</style` close tag, searched from the content start (the tag may
    // have whitespace before its `>`, e.g. `</style   >`).
    let mut at = content_start;
    let style_end = loop {
        let p = at + memmem::find(&bytes[at..], b"</style")?;
        if is_term(bytes.get(p + 7)) {
            break p;
        }
        at = p + 7;
    };

    if content_start >= style_end {
        return None;
    }

    let css_content = source[content_start..style_end].to_string();
    Some((css_content, content_start))
}

/// Transform CSS by adding scoping to selectors while preserving whitespace
/// The generated CSS plus what MagicString would need to map it: which runs are
/// copied straight out of the source, and which source offsets carry an
/// `addSourcemapLocation` (`css/index.js`'s `_` visitor marks every visited
/// node's `start` and `end`). Text that is not `copy`d is an insertion, which
/// MagicString stores as a chunk intro/outro and never maps.
#[derive(Default)]
struct CssWriter {
    text: String,
    /// `(generated offset, source offset, length)`, in generated order.
    copies: Vec<(u32, u32, u32)>,
    marks: FxHashSet<u32>,
}

impl CssWriter {
    /// Emit text that has no source of its own.
    fn push_str(&mut self, text: &str) {
        self.text.push_str(text);
    }

    fn push(&mut self, ch: char) {
        self.text.push(ch);
    }

    /// Emit `text`, which is `source[src_start..src_start + text.len()]`.
    fn copy(&mut self, src_start: usize, text: &str) {
        if text.is_empty() {
            return;
        }
        let gen_start = self.text.len() as u32;
        let src_start = src_start as u32;
        let len = text.len() as u32;
        // MagicString only splits a chunk at an edit, so two runs that are
        // adjacent in both the source and the output are one chunk and carry
        // one segment, not two.
        match self.copies.last_mut() {
            Some((previous_gen, previous_src, prev_len))
                if *previous_gen + *prev_len == gen_start
                    && *previous_src + *prev_len == src_start =>
            {
                *prev_len += len;
            }
            _ => self.copies.push((gen_start, src_start, len)),
        }
        self.text.push_str(text);
    }

    fn mark(&mut self, offset: usize) {
        self.marks.insert(offset as u32);
    }

    /// Drop the whitespace already emitted, mirroring upstream's
    /// `remove_preceding_whitespace(node.start)` — which walks back over the
    /// source rather than over a gap, so it can also cut into the tail of the
    /// node before it. `\s` in JS is White_Space plus U+FEFF.
    fn trim_preceding_whitespace(&mut self) {
        let trimmed = self
            .text
            .trim_end_matches(|c: char| c.is_whitespace() || c == '\u{feff}')
            .len();
        if trimmed == self.text.len() {
            return;
        }
        self.text.truncate(trimmed);
        let end = trimmed as u32;
        while let Some(&(gen_start, _, len)) = self.copies.last() {
            if gen_start >= end {
                self.copies.pop();
            } else {
                if gen_start + len > end {
                    self.copies.last_mut().unwrap().2 = end - gen_start;
                }
                break;
            }
        }
    }
}

impl std::fmt::Write for CssWriter {
    fn write_str(&mut self, s: &str) -> std::fmt::Result {
        self.text.push_str(s);
        Ok(())
    }
}

/// Emit a transformed selector, mapping the parts that came straight out of the
/// source. Upstream inserts the scoping modifier with `appendLeft` /
/// `prependRight`, so everything around it is an unedited chunk; when the two
/// cannot be lined up by skipping modifiers alone — a `:global(…)` was removed,
/// an unused branch was commented out — the prelude is emitted unmapped rather
/// than mapped wrongly.
fn emit_selector(
    output: &mut CssWriter,
    produced: &str,
    css_source: &str,
    css_start: usize,
    prelude_start: usize,
    prelude_end: usize,
    modifier: &str,
) {
    let (from, to) = (
        prelude_start.saturating_sub(css_start),
        prelude_end.saturating_sub(css_start),
    );
    if to > css_source.len() || from >= to || !produced.is_ascii() {
        output.push_str(produced);
        return;
    }
    let src = &css_source.as_bytes()[from..to];
    if !src.is_ascii() {
        output.push_str(produced);
        return;
    }
    let where_modifier = format!(":where({modifier})");
    let emitted = produced.as_bytes();
    let mut runs: Vec<(usize, usize, usize)> = Vec::new();
    let (mut i, mut j) = (0usize, 0usize);
    let mut open_globals = 0usize;
    'emitted: while j < emitted.len() {
        // `prependRight` / `appendRight` / `appendLeft` insertions carry no
        // segment of their own, so they only move the generated cursor.
        for inserted in [
            where_modifier.as_bytes(),
            modifier.as_bytes(),
            b"/* (unused) ".as_slice(),
            b"*/".as_slice(),
        ] {
            if !inserted.is_empty()
                && emitted[j..].starts_with(inserted)
                && !src[i..].starts_with(inserted)
            {
                j += inserted.len();
                continue 'emitted;
            }
        }
        // `:global(…)` and a bare `:global` are `remove`d from the source, so
        // what follows them is still an unedited chunk and keeps its position.
        {
            let mut k = i;
            if !emitted[j].is_ascii_whitespace() {
                while k < src.len() && src[k].is_ascii_whitespace() {
                    k += 1;
                }
            }
            let global_open = b":global(".as_slice();
            let global_bare = b":global".as_slice();
            if src[k..].starts_with(global_open) && !emitted[j..].starts_with(global_open) {
                i = k + global_open.len();
                open_globals += 1;
                continue;
            }
            if open_globals > 0 && src.get(k) == Some(&b')') && emitted[j] != b')' {
                i = k + 1;
                open_globals -= 1;
                continue;
            }
            if src[k..].starts_with(global_bare) && !emitted[j..].starts_with(global_bare) {
                i = k + global_bare.len();
                continue;
            }
        }
        // The separator before a pruned selector goes through `overwrite`,
        // which keeps the chunk it replaces — so the replacement's first byte
        // carries that separator's position.
        if emitted[j..].starts_with(b" /* (unused) ") && i < src.len() && src[i] == b',' {
            runs.push((j, i, 1));
            j += " /* (unused) ".len();
            i += 1;
            while i < src.len() && src[i].is_ascii_whitespace() {
                i += 1;
            }
            continue;
        }
        if i < src.len() && src[i] == emitted[j] {
            match runs.last_mut() {
                Some((run_gen, run_src, len)) if *run_gen + *len == j && *run_src + *len == i => {
                    *len += 1;
                }
                _ => runs.push((j, i, 1)),
            }
            i += 1;
            j += 1;
            continue;
        }
        output.push_str(produced);
        return;
    }
    let mut cursor = 0;
    for (run_gen, run_src, len) in runs {
        output.push_str(&produced[cursor..run_gen]);
        output.copy(prelude_start + run_src, &produced[run_gen..run_gen + len]);
        cursor = run_gen + len;
    }
    output.push_str(&produced[cursor..]);
}

fn mark_node(output: &mut CssWriter, node: &Value) {
    if let Some(start) = node.get("start").and_then(|s| s.as_u64()) {
        output.mark(start as usize);
    }
    if let Some(end) = node.get("end").and_then(|e| e.as_u64()) {
        output.mark(end as usize);
    }
}

/// Mark every node of a subtree the CSS walk enters. `PseudoClassSelector`
/// only recurses for `is` / `where` / `has` / `not` (`css/index.js`), so the
/// arguments of anything else — `:global(…)` above all — are never visited.
fn mark_tree(output: &mut CssWriter, node: &Value) {
    match node {
        Value::Object(map) => {
            if map.contains_key("start") && map.contains_key("type") {
                mark_node(output, node);
                let name = map.get("name").and_then(|n| n.as_str());
                match map.get("type").and_then(|t| t.as_str()) {
                    Some("PseudoClassSelector")
                        if !matches!(name, Some("is" | "where" | "has" | "not")) =>
                    {
                        return;
                    }
                    // The Atrule visitor returns before `next()` for keyframes,
                    // so nothing inside one is ever visited.
                    Some("Atrule")
                        if matches!(
                            name,
                            Some(
                                "keyframes"
                                    | "-webkit-keyframes"
                                    | "-moz-keyframes"
                                    | "-o-keyframes"
                            )
                        ) =>
                    {
                        return;
                    }
                    _ => {}
                }
            }
            for value in map.values() {
                mark_tree(output, value);
            }
        }
        Value::Array(items) => {
            for item in items {
                mark_tree(output, item);
            }
        }
        _ => {}
    }
}

/// A block copied through verbatim still has its declarations visited.
fn mark_block(output: &mut CssWriter, block: &Value) {
    mark_node(output, block);
    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        for child in children {
            mark_node(output, child);
        }
    }
}

fn transform_css<'a>(
    children: &'a [Value],
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext<'a>,
) -> CssWriter {
    let mut output = CssWriter::default();
    let mut specificity_bumped = false;
    let mut last_end = css_start;

    for child in children {
        transform_node_preserving(
            child,
            selector,
            hash,
            css_source,
            css_start,
            &mut output,
            &mut specificity_bumped,
            &mut last_end,
            ctx,
            false, // top-level rules are not nested
        );
    }

    // Add any trailing content. This also covers stylesheets without any
    // rules (e.g. a comment-only <style> block), which the official compiler
    // preserves verbatim: it only removes the content outside
    // `ast.content.start..ast.content.end`. In minify mode upstream applies
    // `remove_preceding_whitespace(ast.content.end)`, so trailing comments
    // survive with only the final whitespace run dropped.
    {
        let trailing_start = last_end - css_start;
        if trailing_start < css_source.len() {
            let gap = &css_source[trailing_start..];
            output.copy(last_end, if ctx.minify { gap.trim_end() } else { gap });
        }
    }

    output
}

/// Transform a CSS node while preserving whitespace
fn transform_node_preserving<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut CssWriter,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext<'a>,
    parent_has_local_selectors: bool,
) {
    match node.get("type").and_then(|t| t.as_str()) {
        Some("Rule") => {
            transform_rule_preserving(
                node,
                selector,
                hash,
                css_source,
                css_start,
                output,
                specificity_bumped,
                last_end,
                ctx,
                parent_has_local_selectors,
                false, // not in a global block
                false, // not in a bare global block
            );
        }
        Some("Atrule") => {
            transform_atrule_preserving(
                node,
                selector,
                hash,
                css_source,
                css_start,
                output,
                specificity_bumped,
                last_end,
                ctx,
            );
        }
        _ => {}
    }
}

/// Check if a rule is empty (no declarations, and any nested rules are either unused or empty).
/// This follows the official Svelte implementation's is_empty() function.
fn is_rule_empty<'a>(rule: &'a Value, ctx: &CssContext<'a>, is_in_global_block: bool) -> bool {
    let block = match rule.get("block") {
        Some(b) => b,
        None => return true,
    };

    let children = match block.get("children").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return true,
    };

    // Check if this rule contains :global (without arguments), which creates a global block context
    let this_is_global_block = is_in_global_block || selector_contains_global_block(rule);

    for child in children {
        let child_type = child.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match child_type {
            "Declaration" => return false, // Has a declaration, not empty
            "Rule" => {
                // Push the PARENT rule's prelude for NestingSelector resolution
                // so that check_selector_unused on the child rule can resolve & correctly.
                // The parent rule is the current `rule` parameter.
                let rule_prelude = rule.get("prelude");
                if let Some(rp) = rule_prelude {
                    ctx.parent_preludes.borrow_mut().push(rp);
                }

                // Check if the nested rule is used
                let is_used = if let Some(prelude) = child.get("prelude") {
                    check_selector_unused(prelude, ctx) == UnusedStatus::Used
                } else {
                    true
                };

                // If it's used (or we're in a global block) AND not empty, then parent is not empty
                let is_empty = is_rule_empty(child, ctx, this_is_global_block);

                // Pop the parent rule's prelude
                if rule_prelude.is_some() {
                    ctx.parent_preludes.borrow_mut().pop();
                }

                if (is_used || this_is_global_block) && !is_empty {
                    return false;
                }
            }
            "Atrule" => {
                // Mirrors upstream: `if (child.block === null || child.block.children.length > 0) return false;`
                // i.e. a blockless at-rule (like @import) or an at-rule with
                // block content makes the rule non-empty.
                let block_is_null = child.get("block").is_none_or(|b| b.is_null());
                if block_is_null
                    || child
                        .get("block")
                        .and_then(|b| b.get("children"))
                        .and_then(|c| c.as_array())
                        .is_some_and(|atrule_children| !atrule_children.is_empty())
                {
                    return false;
                }
            }
            _ => {}
        }
    }

    true
}

/// Check if a rule is a :global block (selector is just `:global` without arguments)
fn is_global_block(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
        && children.len() == 1
        && let Some(complex) = children.first()
        && let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array())
        && relative_selectors.len() == 1
        && let Some(rel) = relative_selectors.first()
        && let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array())
        && selectors.len() == 1
        && let Some(sel) = selectors.first()
    {
        return sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            && sel.get("args").is_none();
    }
    false
}

/// Check if a rule starts with :global (with or without arguments)
/// This includes both `:global { ... }` and `:global(.x) { ... }`
fn is_global_selector_rule(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
        && !children.is_empty()
    {
        // Check each complex selector - if ANY starts with :global, this is a global block
        for complex in children {
            if let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array())
                && !relative_selectors.is_empty()
                && let Some(rel) = relative_selectors.first()
                && let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array())
                && !selectors.is_empty()
                && let Some(sel) = selectors.first()
                && sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            {
                return true;
            }
        }
    }
    false
}

/// Check if a rule's selector contains `:global` without arguments anywhere
/// This handles cases like `p :global { ... }` where :global is not the first selector
fn selector_contains_global_block(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
    {
        for complex in children {
            if let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array()) {
                for rel in relative_selectors {
                    if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
                        for sel in selectors {
                            if sel.get("type").and_then(|t| t.as_str())
                                == Some("PseudoClassSelector")
                                && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                                && sel.get("args").is_none()
                            {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    false
}

/// Check if a block contains nested rules or at-rules (not just declarations).
/// At-rules count too: an `@media` nested inside a rule can contain rules whose
/// selectors need transformation, and a nested `@keyframes` prelude needs hash
/// prefixing, so the block cannot simply be copied verbatim from source.
/// Upstream's Declaration visitor handles `animation` / `animation-name` (after
/// `remove_css_prefix`) in its FIRST branch, so those declarations are never
/// minified and keep the whitespace around them.
fn is_animation_declaration(property: &str) -> bool {
    let lower = property.to_ascii_lowercase();
    let bare = lower
        .strip_prefix("-webkit-")
        .or_else(|| lower.strip_prefix("-moz-"))
        .or_else(|| lower.strip_prefix("-o-"))
        .or_else(|| lower.strip_prefix("-ms-"))
        .unwrap_or(&lower);
    bare == "animation" || bare == "animation-name"
}

/// Emit a declaration the way upstream's minifier does: the whitespace run that
/// starts immediately after `property.length + 1` bytes is dropped, so
/// `color : red` (space before the colon) is left alone and custom properties
/// are skipped entirely.
fn push_minified_declaration(output: &mut CssWriter, decl_text: &str, property: &str) {
    if property.starts_with("--") {
        output.push_str(decl_text);
        return;
    }
    let start = property.len() + 1;
    if start > decl_text.len() || !decl_text.is_char_boundary(start) {
        output.push_str(decl_text);
        return;
    }
    let rest = &decl_text[start..];
    let value = rest.trim_start_matches(|c: char| c.is_whitespace() || c == '\u{feff}');
    output.push_str(&decl_text[..start]);
    output.push_str(value);
}

fn has_nested_rules(block: &Value) -> bool {
    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        children.iter().any(|child| {
            matches!(
                child.get("type").and_then(|t| t.as_str()),
                Some("Rule") | Some("Atrule")
            )
        })
    } else {
        false
    }
}

/// Check if a rule has local selectors (i.e., selectors that need scoping)
/// A rule has local selectors if any of its complex selectors is NOT entirely global/global-like
fn rule_has_local_selectors(node: &Value) -> bool {
    if let Some(prelude) = node.get("prelude")
        && let Some(children) = prelude.get("children").and_then(|c| c.as_array())
    {
        for complex in children {
            if !is_complex_selector_global_like(complex) {
                return true;
            }
        }
    }
    false
}

/// Check if a complex selector is entirely global or global-like
/// This means all its relative selectors are either :global() or global-like (:root, :host, etc.)
fn is_complex_selector_global_like(complex: &Value) -> bool {
    if let Some(relative_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        for rel in relative_selectors {
            if !is_relative_selector_global_like(rel) {
                return false;
            }
        }
        true
    } else {
        true // Empty selector list is considered global-like
    }
}

/// Check if a relative selector is global or global-like
fn is_relative_selector_global_like(rel: &Value) -> bool {
    if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
        if selectors.is_empty() {
            return true;
        }

        // Check if the first selector is :global
        let first = &selectors[0];
        let first_type = first.get("type").and_then(|t| t.as_str()).unwrap_or("");
        let first_name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");

        // :global() is global
        if first_type == "PseudoClassSelector" && first_name == "global" {
            return true;
        }

        // :host is global-like
        if first_type == "PseudoClassSelector" && first_name == "host" {
            return true;
        }

        // Check for :root (without :has)
        let has_root = selectors.iter().any(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("root")
        });
        let has_has = selectors.iter().any(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("has")
        });
        if has_root && !has_has {
            return true;
        }

        // Check if all selectors are pseudo and first is view-transition*
        let all_pseudo = selectors.iter().all(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
            sel_type == "PseudoClassSelector" || sel_type == "PseudoElementSelector"
        });
        if all_pseudo && first_type == "PseudoElementSelector" {
            let view_transition_names = [
                "view-transition",
                "view-transition-group",
                "view-transition-old",
                "view-transition-new",
                "view-transition-image-pair",
            ];
            if view_transition_names.contains(&first_name) {
                return true;
            }
        }

        false
    } else {
        true
    }
}

/// Result of checking if a selector is unused
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum UnusedStatus {
    /// Selector is used (matches elements)
    Used,
    /// Selector is unused (doesn't match any elements)
    Unused,
    /// Selector absolutely cannot match (e.g., sibling combinator with impossible relationship)
    NoMatch,
}

/// Check if a selector is unused (cannot match any element in the template)
/// Returns UnusedStatus to distinguish between unused and no-match cases
fn check_selector_unused(prelude: &Value, ctx: &CssContext) -> UnusedStatus {
    // Note: We no longer bail out early for has_dynamic_classes/has_dynamic_elements.
    // Instead, we check each selector individually. This allows us to prune selectors
    // that reference classes/elements that never appear in the template (static or dynamic),
    // while keeping selectors for classes that appear in dynamic expressions.

    // Check each complex selector in the selector list
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        let mut has_no_match = false;
        let mut all_unused = true;

        for complex in children {
            match check_complex_selector_unused(complex, ctx) {
                UnusedStatus::Used => {
                    all_unused = false;
                }
                UnusedStatus::NoMatch => {
                    has_no_match = true;
                }
                UnusedStatus::Unused => {
                    // Keep checking
                }
            }
        }

        // If all selectors are either unused or no-match, and at least one is no-match
        if all_unused && has_no_match {
            UnusedStatus::NoMatch
        } else if all_unused {
            UnusedStatus::Unused
        } else {
            UnusedStatus::Used
        }
    } else {
        UnusedStatus::Used
    }
}

/// Check if a complex selector is unused
/// Returns UnusedStatus to distinguish between unused and no-match cases
fn check_complex_selector_unused(complex: &Value, ctx: &CssContext) -> UnusedStatus {
    let reachable = reachable_complex_selector(complex);
    let complex = reachable.as_ref().unwrap_or(complex);
    let unused = is_complex_selector_unused_impl(complex, ctx);
    if unused {
        // Check if it's a no-match case (sibling combinator that absolutely cannot match)
        let no_match = is_sibling_combinator_no_match(complex, ctx);
        if no_match {
            UnusedStatus::NoMatch
        } else {
            UnusedStatus::Unused
        }
    } else {
        UnusedStatus::Used
    }
}

/// Check if a complex selector is unused
/// A complex selector is unused if it doesn't match any element in the template.
/// Index of the leftmost relative selector upstream's backward walk reaches.
///
/// `apply_combinator`'s `default:` arm returns `true` *without* recursing, so a
/// combinator it does not handle — `||`, and anything outside `' ' > + ~` —
/// halts the walk: everything to its left is never visited, and so is neither
/// marked `scoped` nor consulted for `used`.
fn first_reachable_relative_selector(rel_selectors: &[Value]) -> usize {
    truncate_trailing_globals(rel_selectors)
        .iter()
        .rposition(|rel| {
            rel.get("combinator")
                .and_then(|combinator| combinator.get("name"))
                .and_then(|name| name.as_str())
                .is_some_and(|name| !matches!(name, " " | ">" | "+" | "~"))
        })
        .unwrap_or(0)
}

/// The part of a complex selector upstream's backward walk actually visits, or
/// `None` when that is the whole thing.
fn reachable_complex_selector(complex: &Value) -> Option<Value> {
    let children = complex.get("children").and_then(|c| c.as_array())?;
    let from = first_reachable_relative_selector(children);
    if from == 0 || from >= children.len() {
        return None;
    }
    let mut visited: Vec<Value> = children[from..].to_vec();
    // The halting combinator itself is never applied, so drop it rather than let
    // a downstream check try to satisfy it.
    if let Some(first) = visited.first_mut().and_then(|rel| rel.as_object_mut()) {
        first.remove("combinator");
    }
    let mut reachable = complex.clone();
    reachable
        .as_object_mut()?
        .insert("children".to_string(), Value::Array(visited));
    Some(reachable)
}

fn is_complex_selector_unused(complex: &Value, ctx: &CssContext) -> bool {
    match reachable_complex_selector(complex) {
        Some(reachable) => is_complex_selector_unused_impl(&reachable, ctx),
        None => is_complex_selector_unused_impl(complex, ctx),
    }
}

/// Implementation of complex selector unused check
fn is_complex_selector_unused_impl(complex: &Value, ctx: &CssContext) -> bool {
    // A nested selector whose NestingSelector (`&`) resolves to a GLOBAL parent is
    // always kept, mirroring upstream's `relative_selector_might_apply_to_node`
    // NestingSelector branch: it matches when the parent complex selector
    // `is_global(...)`, so the `&`-anchored selector could apply to elements
    // outside the component and must not be pruned against this component's local
    // DOM. Covers `&[data-x]`, `&.foo`, `& .foo` nested under
    // `:global(:where(.x)) { ... }`. This must run BEFORE the zero-elements bail
    // below (the `<Text data-placement={…}>` in the corpus renders no scopeable
    // element in this component, yet the global-anchored rule must survive). A
    // nested selector with no `&` (an implicit descendant like `.foo`) stays
    // scoped and is pruned normally; a `&` under a SCOPED parent likewise.
    if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array())
        && nesting_resolves_to_global_parent(rel_selectors, ctx)
    {
        return false;
    }

    // A non-global selector can never match when the component renders no
    // scopeable elements. Mirrors upstream `prune()`, which only sets
    // `metadata.used` while iterating over `elements`; with zero elements every
    // non-global-like selector is reported unused (e.g. a `<style>`-only file).
    if !ctx.has_dynamic_elements
        && ctx.dom_structure.elements.is_empty()
        && !is_complex_selector_global_like(complex)
    {
        return true;
    }

    // Get the relative selectors (like "div > span" has multiple relative selectors)
    if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        // Check for :host > element pattern FIRST (before the global-like check)
        // because :host > span can be unused if span is not a root child
        if is_host_child_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // When a selector contains :global(), we still need to check the NON-global parts.
        // For example, `:global(.foo) :is(.unused)` should be marked as unused if `.unused`
        // doesn't exist in the template, even though `:global(.foo)` exists.
        // Skip checking relative selectors that ARE :global(), but DO check others.

        // Check if the first selector is :host without children (global-like)
        let first_is_host_only = rel_selectors.len() == 1
            && rel_selectors.first().is_some_and(|rel| {
                rel.get("selectors")
                    .and_then(|s| s.as_array())
                    .is_some_and(|arr| {
                        arr.len() == 1
                            && arr.first().is_some_and(|s| {
                                s.get("type").and_then(|t| t.as_str())
                                    == Some("PseudoClassSelector")
                                    && s.get("name").and_then(|n| n.as_str()) == Some("host")
                            })
                    })
            });

        if first_is_host_only {
            return false; // :host by itself is always used
        }

        // Check for sibling combinator patterns (+ and ~)
        if is_sibling_combinator_unused(rel_selectors, ctx) {
            return true;
        }

        // Check for descendant/child selectors that don't match the DOM structure
        if is_descendant_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // Structural walk for general descendant/child chains (attribute /
        // class / id compounds included), mirroring upstream css-prune's
        // BACKWARD apply_selector over the component's own element tree.
        if is_structural_descendant_chain_unused(rel_selectors, ctx) {
            return true;
        }

        // A compound must be satisfied by ONE element; testing each simple
        // selector for existence separately keeps `.a.b` alive when `.a` and
        // `.b` sit on different elements.
        if is_structural_compound_unused(rel_selectors, ctx) {
            return true;
        }

        // :has() unused detection - check if :has() arguments can match within the subject element's subtree
        // This is guarded inside is_has_selector_unused by has_opaque_sibling_boundaries check
        if is_has_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // Check if any parent prelude in the nesting chain is itself unused.
        // If a parent rule doesn't match any DOM element, all children are unused too.
        // For example, `.a { .unused { .c { ... } } }` - if `.unused` doesn't match,
        // then `.c` inside it is also unused regardless of whether `.c` exists.
        if is_parent_chain_unused(ctx) {
            return true;
        }

        // ...and, more precisely, whether the enclosing selectors match an
        // *ancestor* of a match rather than merely existing somewhere.
        if is_nested_selector_unused_against_ancestors(rel_selectors, ctx) {
            return true;
        }

        // NestingSelector (&) compound check: When a relative selector contains & combined
        // with other simple selectors (e.g., &.b inside .a {}), the compound meaning is that
        // the element must satisfy BOTH the parent rule's constraints AND the current ones.
        // For example, &.b inside .a {} means .a.b - an element with both classes.
        if is_nesting_compound_unused(rel_selectors, ctx) {
            return true;
        }

        // Pure nesting selector check: When a selector consists entirely of NestingSelectors
        // with descendant combinators (e.g., `& &` or `& & &`), the resolved selector
        // requires the parent chain to appear multiple times in the ancestor chain.
        // For example, `& &` inside `.c` inside `& .b` inside `.a` resolves to
        // `.a .b .c .a .b .c` - which requires a nested `.a .b .c` structure.
        if is_pure_nesting_selector_unused(rel_selectors, ctx) {
            return true;
        }

        // Original simple check: if any simple selector refers to something that doesn't exist
        // Track whether we've seen a bare :global - all selectors after it are global-like
        let mut after_bare_global = false;
        for rel in rel_selectors {
            // Check each simple selector in this relative selector
            if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
                // Check if this relative selector starts with bare :global (no args)
                let starts_with_bare_global = selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                        && s.get("args").is_none()
                });

                // If starts with bare :global, mark all subsequent selectors as global
                // and skip this selector entirely (including modifiers like :global.x)
                if starts_with_bare_global {
                    after_bare_global = true;
                    continue;
                }

                // Skip selectors that come after a bare :global - they're global-like
                if after_bare_global {
                    continue;
                }

                // Skip :host pseudo-classes (they're global-like)
                let starts_with_host = selectors.first().is_some_and(|s| {
                    let sel_type = s.get("type").and_then(|t| t.as_str());
                    if sel_type == Some("PseudoClassSelector") {
                        let name = s.get("name").and_then(|n| n.as_str());
                        name == Some("host")
                    } else {
                        false
                    }
                });

                if starts_with_host {
                    continue;
                }

                // Skip relative selectors containing :root (they're global-like)
                // :root.foo, .foo:root, :root.unknown should all be kept
                // unless :root is combined with :has (which needs to check inner selectors)
                let has_root = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("root")
                });
                let has_has = selectors.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("has")
                });

                // Upstream `truncate` drops every simple selector except `:has`
                // from a `:root` compound, so `.x` in `:root.x:has(.a)` is
                // unscoped and must not prune the rule on its own.
                if has_root {
                    if has_has {
                        let has_only: Vec<Value> = selectors
                            .iter()
                            .filter(|s| {
                                s.get("type").and_then(|t| t.as_str())
                                    == Some("PseudoClassSelector")
                                    && s.get("name").and_then(|n| n.as_str()) == Some("has")
                            })
                            .cloned()
                            .collect();
                        if has_only.iter().any(|s| is_simple_selector_unused(s, ctx)) {
                            return true;
                        }
                    }
                    continue;
                }

                // Skip relative selectors that are entirely :global() (but still check others)
                // This handles :global(.foo) - with args
                let is_entirely_global = selectors.len() == 1
                    && selectors.first().is_some_and(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n| n.as_str()) == Some("global")
                    });

                if is_entirely_global {
                    continue;
                }

                for sel in selectors {
                    // Skip :global() selectors themselves, but check other selectors
                    let is_global_selector = sel.get("type").and_then(|t| t.as_str())
                        == Some("PseudoClassSelector")
                        && sel.get("name").and_then(|n| n.as_str()) == Some("global");

                    if is_global_selector {
                        continue;
                    }

                    if is_simple_selector_unused(sel, ctx) {
                        return true;
                    }
                }
            }
        }
    }
    false
}

/// Check if a :host > element selector is unused
/// Check if any parent prelude in the nesting chain is unused.
///
/// When we're inside nested CSS rules, each parent prelude adds constraints.
/// If any parent's subject selector doesn't match any DOM element, then all
/// children are also unused. For example, `.unused { .c { ... } }` - if no
/// element has class `.unused`, then `.c` inside it is unused regardless.
///
/// For preludes with multiple complex selectors (comma-separated, e.g., `.b, .unused`),
/// each alternative is checked independently. The parent is unused only if
/// NONE of the alternatives match any DOM element.
fn is_parent_chain_unused(ctx: &CssContext) -> bool {
    let parent_preludes = ctx.parent_preludes.borrow();
    if parent_preludes.is_empty() {
        return false;
    }

    // Check each parent prelude's subject selector against DOM elements
    for pp in parent_preludes.iter() {
        let complex_selectors = match pp.get("children").and_then(|c| c.as_array()) {
            Some(cs) => cs,
            None => continue,
        };

        // For each complex selector in the prelude (alternatives),
        // check if ANY of them matches a DOM element
        let any_alternative_matches = complex_selectors.iter().any(|complex| {
            let mut classes: Vec<String> = Vec::new();
            let mut ids: Vec<String> = Vec::new();
            let mut elements: Vec<String> = Vec::new();

            if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array())
                && let Some(last_rel) = rel_selectors.last()
                && let Some(selectors) = last_rel.get("selectors").and_then(|s| s.as_array())
            {
                for sel in selectors {
                    let sel_type = sel.get("type").and_then(|t| t.as_str());
                    match sel_type {
                        Some("ClassSelector") => {
                            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                                classes.push(decode_css_escape(name));
                            }
                        }
                        Some("IdSelector") => {
                            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                                ids.push(decode_css_escape(name));
                            }
                        }
                        Some("TypeSelector") => {
                            if let Some(name) = sel.get("name").and_then(|n| n.as_str())
                                && name != "*"
                            {
                                elements.push(decode_css_escape(name));
                            }
                        }
                        Some("PseudoClassSelector") => {
                            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
                            // :global(...) always matches
                            if name == "global" {
                                return true;
                            }
                            // Other pseudo-classes like :hover, :focus don't constrain matching
                        }
                        Some("NestingSelector") => {
                            // & - matches whatever the parent matches, can't determine unused
                            return true;
                        }
                        _ => {}
                    }
                }
            }

            // If no constraints were extracted, can't determine unused - assume matches
            if classes.is_empty() && ids.is_empty() && elements.is_empty() {
                return true;
            }

            // Skip check if dynamic values could match
            if ctx.has_dynamic_classes && !classes.is_empty() {
                return true;
            }
            if ctx.has_dynamic_elements && !elements.is_empty() {
                return true;
            }

            // Check if any DOM element matches this alternative's constraints
            ctx.dom_structure.elements.iter().any(|elem| {
                let classes_match = classes.iter().all(|c| elem.classes.contains(c.as_str()));
                let ids_match = ids.iter().all(|id| elem.id.as_deref() == Some(id.as_str()));
                let elements_match = elements.iter().all(|tag| {
                    if elem.is_dynamic_tag {
                        true
                    } else {
                        elem.tag_name.eq_ignore_ascii_case(tag)
                    }
                });
                classes_match && ids_match && elements_match
            })
        });

        if !any_alternative_matches {
            return true;
        }
    }

    false
}

/// Returns `true` when a nested rule without an explicit `&` cannot match,
/// because no element satisfying it has an ancestor chain satisfying the
/// enclosing rules.
///
/// Upstream `get_relative_selectors` prepends an implicit `&` + descendant
/// combinator to such a selector, so `.grand { .foo > .a { … } }` resolves to
/// `.grand .foo > .a` and `apply_selector` walks the real ancestor chain.
/// [`is_parent_chain_unused`] only asks whether each enclosing selector matches
/// *some* element, which keeps the rule alive when `.grand` exists elsewhere in
/// the component.
fn is_nested_selector_unused_against_ancestors(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if ctx.dom_structure.elements.is_empty() || !structural_ancestry_is_lexical(ctx) {
        return false;
    }
    let parent_preludes = ctx.parent_preludes.borrow();
    let Some(chains) = build_parent_chains(&parent_preludes, parent_preludes.len()) else {
        return false;
    };

    if !level_is_structurally_evaluable(rel_selectors) {
        // An explicit `&` is not prepended to but substituted into the level.
        if let Some(resolved) = resolve_explicit_nesting_chains(rel_selectors, &chains) {
            return resolved
                .iter()
                .all(|chain| is_structural_descendant_chain_unused(chain, ctx));
        }
        if let Some(conjunctions) = resolve_subject_nesting_conjunctions(rel_selectors, &chains) {
            return conjunctions
                .iter()
                .all(|chains| is_structural_chain_conjunction_unused(chains, ctx));
        }
        return false;
    }

    chains.iter().all(|prefix| {
        let mut chain = prefix.clone();
        chain.push(with_descendant_head(&rel_selectors[0]));
        chain.extend(rel_selectors[1..].iter().cloned());
        is_structural_descendant_chain_unused(&chain, ctx)
    })
}

/// True when `rel` is a compound that means exactly `&` — a lone
/// NestingSelector, or a single-branch `:is(&)` / `:where(&)` around one.
fn compound_is_nesting_only(rel: &Value) -> bool {
    let Some(sels) = rel.get("selectors").and_then(|s| s.as_array()) else {
        return false;
    };
    if sels.len() != 1 {
        return false;
    }
    let sel = &sels[0];
    match sel.get("type").and_then(|t| t.as_str()) {
        Some("NestingSelector") => true,
        Some("PseudoClassSelector") => {
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            if name != "is" && name != "where" {
                return false;
            }
            sel.get("args")
                .and_then(|a| a.get("children"))
                .and_then(|c| c.as_array())
                .is_some_and(|branches| {
                    branches.len() == 1
                        && branches[0]
                            .get("children")
                            .and_then(|c| c.as_array())
                            .is_some_and(|rels| {
                                rels.len() == 1 && compound_is_nesting_only(&rels[0])
                            })
                })
        }
        _ => false,
    }
}

fn combinator_name(rel: &Value) -> &str {
    rel.get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ")
}

/// Substitute each `&` compound of a nesting level with every alternative parent
/// chain, mirroring upstream `apply_selector`'s `NestingSelector` case: an
/// explicit `&` is resolved *in place* against `parent.prelude` rather than
/// prepended, so `.a { & .b { … } }` requires an `.a` **ancestor** of `.b`.
/// `None` for anything the structural walker cannot model.
///
/// Splicing a multi-compound parent into the middle of a chain would impose an
/// order upstream does not: in `a { span { a:hover & { … } } }` the `&` is a
/// constraint on the subject itself, so one `<a>` can satisfy both the parent's
/// ancestor link and `a:hover`, where the spliced form demands two nested ones.
/// Only a head `&` is order-free, so anywhere else the parent must be a single
/// compound.
fn resolve_explicit_nesting_chains(
    rel_selectors: &[Value],
    parent_chains: &[Vec<Value>],
) -> Option<Vec<Vec<Value>>> {
    let mut has_nesting = false;
    let multi_compound_parent = parent_chains.iter().any(|chain| chain.len() > 1);
    for (i, rel) in rel_selectors.iter().enumerate() {
        if i > 0 && !matches!(combinator_name(rel), " " | ">") {
            return None;
        }
        if compound_is_nesting_only(rel) {
            if i > 0 && multi_compound_parent {
                return None;
            }
            has_nesting = true;
        } else if !level_is_structurally_evaluable(std::slice::from_ref(rel)) {
            return None;
        }
    }
    if !has_nesting {
        return None;
    }

    let mut out = Vec::with_capacity(parent_chains.len());
    for parent in parent_chains {
        if parent
            .iter()
            .skip(1)
            .any(|rel| !matches!(combinator_name(rel), " " | ">"))
        {
            return None;
        }
        let mut chain: Vec<Value> = Vec::new();
        for rel in rel_selectors {
            if !compound_is_nesting_only(rel) {
                chain.push(rel.clone());
                continue;
            }
            let combinator = rel.get("combinator").cloned();
            for (j, parent_rel) in parent.iter().enumerate() {
                let mut cloned = parent_rel.clone();
                if j == 0
                    && let Value::Object(map) = &mut cloned
                {
                    match &combinator {
                        Some(c) => {
                            map.insert("combinator".to_string(), c.clone());
                        }
                        None => {
                            map.remove("combinator");
                        }
                    }
                }
                chain.push(cloned);
            }
        }
        if chain.len() < 2 {
            return None;
        }
        out.push(chain);
    }
    (!out.is_empty()).then_some(out)
}

/// The multi-compound-parent case [`resolve_explicit_nesting_chains`] refuses:
/// a lone trailing `&`. Upstream matches it as a second constraint on the
/// subject, so the parent chain and the enclosing prefix are two chains that
/// must be satisfied by the *same* element rather than one spliced chain.
/// Returns, per parent alternative, the chains that must hold together.
fn resolve_subject_nesting_conjunctions(
    rel_selectors: &[Value],
    parent_chains: &[Vec<Value>],
) -> Option<Vec<Vec<Vec<Value>>>> {
    let last = rel_selectors.len().checked_sub(1)?;
    if last == 0 || !compound_is_nesting_only(&rel_selectors[last]) {
        return None;
    }
    for (i, rel) in rel_selectors.iter().enumerate() {
        if i > 0 && !matches!(combinator_name(rel), " " | ">") {
            return None;
        }
        if i < last && !level_is_structurally_evaluable(std::slice::from_ref(rel)) {
            return None;
        }
    }

    let subject_combinator = rel_selectors[last].get("combinator").cloned();
    let mut out = Vec::with_capacity(parent_chains.len());
    for parent in parent_chains {
        if parent
            .iter()
            .skip(1)
            .any(|rel| !matches!(combinator_name(rel), " " | ">"))
        {
            return None;
        }
        let subject = parent.last()?;
        let mut prefix_chain: Vec<Value> = rel_selectors[..last].to_vec();
        let mut tail = subject.clone();
        if let Value::Object(map) = &mut tail {
            match &subject_combinator {
                Some(c) => {
                    map.insert("combinator".to_string(), c.clone());
                }
                None => {
                    map.remove("combinator");
                }
            }
        }
        prefix_chain.push(tail);
        out.push(vec![parent.clone(), prefix_chain]);
    }
    (!out.is_empty()).then_some(out)
}

/// Returns `true` when no single element is the subject of *every* chain.
fn is_structural_chain_conjunction_unused(chains: &[Vec<Value>], ctx: &CssContext) -> bool {
    if chains.is_empty()
        || ctx.has_dynamic_elements
        || ctx.dom_structure.elements.is_empty()
        || !structural_ancestry_is_lexical(ctx)
    {
        return false;
    }
    for chain in chains {
        if chain.is_empty() {
            return false;
        }
        for rel in chain.iter().skip(1) {
            if !matches!(combinator_name(rel), " " | ">") {
                return false;
            }
        }
        for rel in chain {
            let Some(sels) = rel.get("selectors").and_then(|s| s.as_array()) else {
                return false;
            };
            if sels.is_empty() || !sels.iter().all(structural_simple_selector_is_evaluable) {
                return false;
            }
        }
    }
    for (idx, el) in ctx.dom_structure.elements.iter().enumerate() {
        let satisfies_all = chains.iter().all(|chain| {
            let subject = &chain[chain.len() - 1];
            structural_element_matches_compound(el, subject)
                && structural_ancestors_satisfy_links(chain, chain.len() - 1, idx, ctx)
        });
        if satisfies_all {
            return false;
        }
    }
    true
}

/// Returns `true` when `rel_selectors` contains a NestingSelector (`&`) and the
/// immediate parent rule's prelude is explicitly `:global(...)`. Mirrors upstream
/// `is_global`'s NestingSelector recursion into the owner rule: a `&` anchored to
/// a `:global(...)` parent is a potential global match (it can apply to elements
/// outside the component) and its rule must be kept.
///
/// Note this is intentionally NARROWER than `is_complex_selector_global_like`:
/// `:root` / `:host` / `view-transition` parents are "global-like" but upstream's
/// `is_global` returns `false` for them (they are unscopeable, not global), so a
/// `&`-nested selector under `:root { … }` must still be pruned normally.
fn nesting_resolves_to_global_parent(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    let has_nesting = rel_selectors.iter().any(|rel| {
        rel.get("selectors")
            .and_then(|s| s.as_array())
            .is_some_and(|arr| {
                arr.iter()
                    .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"))
            })
    });
    if !has_nesting {
        return false;
    }

    // `:has(...)` and sibling combinators (`+` / `~`) prune against the
    // component's OWN DOM subtree / siblings, which is knowable even when the
    // `&` subject is global — upstream still prunes `&:has(.unused)` / `& + .x`
    // under a `:global(...)` parent. Let those fall through to the normal
    // `is_has_selector_unused` / `is_sibling_combinator_unused` checks by not
    // force-keeping here. (Plain `&[attr]` / `&.class` / `& .desc` have no such
    // component-local test and are kept.)
    for rel in rel_selectors {
        if let Some(comb) = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            && (comb == "+" || comb == "~")
        {
            return false;
        }
        if rel
            .get("selectors")
            .and_then(|s| s.as_array())
            .is_some_and(|arr| {
                arr.iter().any(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("has")
                })
            })
        {
            return false;
        }
    }

    let parent_preludes = ctx.parent_preludes.borrow();
    let Some(parent) = parent_preludes.last() else {
        return false;
    };
    // The parent is global for `&`-anchoring only if it has a complex selector
    // whose every relative selector is a `:global(...)` pseudo-class.
    parent
        .get("children")
        .and_then(|c| c.as_array())
        .is_some_and(|complexes| {
            complexes.iter().any(|complex| {
                complex
                    .get("children")
                    .and_then(|c| c.as_array())
                    .is_some_and(|rels| {
                        !rels.is_empty() && rels.iter().all(relative_selector_is_global_pseudo)
                    })
            })
        })
}

/// `true` if the relative selector contains a `:global` pseudo-class (with or
/// without args) — i.e. it is explicitly global, as opposed to merely
/// "global-like" (`:root` / `:host` / view-transition pseudo-elements).
fn relative_selector_is_global_pseudo(rel: &Value) -> bool {
    rel.get("selectors")
        .and_then(|s| s.as_array())
        .is_some_and(|arr| {
            arr.iter().any(|s| {
                s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                    && s.get("name").and_then(|n| n.as_str()) == Some("global")
            })
        })
}

/// Check if a nested rule's selector with NestingSelector (&) compound is unused.
///
/// When a relative selector contains NestingSelector (&) combined with other simple selectors
/// (e.g., `&.b`), the compound meaning is that the element must satisfy BOTH the parent rule's
/// constraints AND the current ones. For example, `&.b` inside `.a {}` means `.a.b` - an element
/// with both classes `.a` and `.b`.
///
/// This function checks if the parent_preludes in the context, combined with the non-nesting
/// selectors, can match any DOM element.
fn is_nesting_compound_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    // Only applies when we have parent preludes (i.e., we're inside a nested rule)
    let parent_preludes = ctx.parent_preludes.borrow();
    if parent_preludes.is_empty() {
        return false;
    }

    // Look for relative selectors that contain NestingSelector combined with other selectors
    for rel in rel_selectors {
        if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
            let has_nesting = selectors
                .iter()
                .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

            if !has_nesting || selectors.len() < 2 {
                // No NestingSelector, or NestingSelector alone (no compound)
                continue;
            }

            // Collect class requirements from non-nesting selectors in this compound
            let mut required_classes: Vec<String> = Vec::new();
            let mut required_ids: Vec<String> = Vec::new();
            let mut required_elements: Vec<String> = Vec::new();

            for sel in selectors {
                let sel_type = sel.get("type").and_then(|t| t.as_str());
                match sel_type {
                    Some("ClassSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                            required_classes.push(decode_css_escape(name));
                        }
                    }
                    Some("IdSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                            required_ids.push(decode_css_escape(name));
                        }
                    }
                    Some("TypeSelector") => {
                        if let Some(name) = sel.get("name").and_then(|n| n.as_str())
                            && name != "*"
                        {
                            required_elements.push(decode_css_escape(name));
                        }
                    }
                    _ => {}
                }
            }

            // If we have no concrete requirements beyond &, can't determine unused
            if required_classes.is_empty()
                && required_ids.is_empty()
                && required_elements.is_empty()
            {
                continue;
            }

            // Collect class/id/element requirements from the IMMEDIATE parent prelude only.
            // The NestingSelector (&) refers to the immediate parent rule's selector.
            // The subject element of the parent rule is what the & expands to, and the
            // compound selector requires that SAME element to also match the current constraints.
            // We only check the immediate parent because constraints from higher-up ancestors
            // apply to different elements in the DOM chain, not the same element.
            let mut parent_classes: Vec<String> = Vec::new();
            let mut parent_ids: Vec<String> = Vec::new();
            let mut parent_elements: Vec<String> = Vec::new();

            if let Some(immediate_parent) = parent_preludes.last() {
                extract_selector_constraints(
                    immediate_parent,
                    &mut parent_classes,
                    &mut parent_ids,
                    &mut parent_elements,
                );
            }

            // Combined: the element must satisfy both parent constraints and current constraints
            let all_required_classes: Vec<&str> = parent_classes
                .iter()
                .chain(required_classes.iter())
                .map(|s| s.as_str())
                .collect();
            let all_required_ids: Vec<&str> = parent_ids
                .iter()
                .chain(required_ids.iter())
                .map(|s| s.as_str())
                .collect();
            let all_required_elements: Vec<&str> = parent_elements
                .iter()
                .chain(required_elements.iter())
                .map(|s| s.as_str())
                .collect();

            // If dynamic classes exist, we can't be sure about class constraints
            if ctx.has_dynamic_classes && !all_required_classes.is_empty() {
                continue;
            }

            // If dynamic elements exist, we can't be sure about element constraints
            if ctx.has_dynamic_elements && !all_required_elements.is_empty() {
                continue;
            }

            // Check if any DOM element satisfies ALL the combined constraints
            let any_element_matches = ctx.dom_structure.elements.iter().any(|elem| {
                // Check all required classes are present on the element. A class may
                // be carried statically (`class="..."`), via a `class:NAME` directive,
                // or potentially via a spread (`{...rest}`), which could set anything.
                let classes_match = all_required_classes.iter().all(|c| {
                    elem.has_spread
                        || elem.classes.contains(*c)
                        || elem.class_directive_names.contains(*c)
                });

                // Check all required ids match
                let ids_match = all_required_ids
                    .iter()
                    .all(|id| elem.id.as_deref() == Some(*id));

                // Check all required element types match
                let elements_match = all_required_elements.iter().all(|tag| {
                    if elem.is_dynamic_tag {
                        true // Dynamic tag could be anything
                    } else {
                        elem.tag_name.eq_ignore_ascii_case(tag)
                    }
                });

                classes_match && ids_match && elements_match
            });

            if !any_element_matches {
                return true;
            }
        }
    }

    false
}

/// Check if a "pure nesting" selector (all relative selectors are NestingSelectors
/// with descendant combinators, like `& &`) is unused.
///
/// When `& &` appears inside a nesting context, it resolves to the full parent chain
/// repeated with a descendant combinator. For example, `& &` inside `.c` inside `& .b`
/// inside `.a` resolves to `.a .b .c .a .b .c`. This requires the parent chain to appear
/// as both the subject and an ancestor, which is often impossible in the actual DOM.
///
/// This function checks whether any DOM element matching the parent chain's subject
/// has ancestors that also match the full parent chain.
fn is_pure_nesting_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    let parent_preludes = ctx.parent_preludes.borrow();
    if parent_preludes.is_empty() {
        return false;
    }

    // Check if this is a "pure nesting" selector: all relative selectors contain
    // only NestingSelector, with descendant combinators between them
    if rel_selectors.len() < 2 {
        return false;
    }

    let all_nesting = rel_selectors.iter().all(|rel| {
        if let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) {
            selectors.len() == 1
                && selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector")
                })
        } else {
            false
        }
    });

    if !all_nesting {
        return false;
    }

    // All combinators must be descendant (space) combinators
    let all_descendant = rel_selectors.iter().skip(1).all(|rel| {
        let comb = rel.get("combinator");
        match comb {
            None => true, // No combinator = implicit descendant
            Some(c) => c.get("name").and_then(|n| n.as_str()).unwrap_or(" ") == " ",
        }
    });

    if !all_descendant {
        return false;
    }

    // Collect the full parent chain constraints: walk all parent preludes to build
    // the chain of class/id/element requirements at each level
    // For `.a { & .b { .c { & & {} } } }`, the chain is: [.a, .b, .c]
    // The `& &` means we need .a .b .c .a .b .c in the DOM

    // Collect subject constraints from each parent prelude level
    let mut chain_classes: Vec<Vec<String>> = Vec::new();

    for pp in parent_preludes.iter() {
        let mut classes = Vec::new();
        let mut ids = Vec::new();
        let mut elements = Vec::new();
        extract_selector_constraints(pp, &mut classes, &mut ids, &mut elements);
        chain_classes.push(classes);
    }

    // For the `& &` pattern, we need the full chain to appear twice in the DOM.
    // Check if any DOM element matching the deepest parent's constraints has an
    // ancestor chain that can accommodate the full chain repeated.

    // Simple heuristic: collect ALL unique class requirements from the chain
    // and check if there's a DOM element whose ancestor chain includes all
    // these classes at the required nesting depth.
    // For simplicity, check if the total chain depth * (number of & selectors)
    // exceeds the maximum DOM depth of matching elements.
    let chain_depth = parent_preludes.len();
    let nesting_count = rel_selectors.len(); // number of & selectors

    // Total required depth: chain_depth * nesting_count
    // (each & expands to the full parent chain)
    let required_depth = chain_depth * nesting_count;

    // Find the maximum depth any matching element can have
    // An element's depth is the number of ancestors it has
    for elem in &ctx.dom_structure.elements {
        // Check if this element could be the subject (matches the deepest constraint)
        let empty_vec = Vec::new();
        let deepest_classes = chain_classes.last().unwrap_or(&empty_vec);
        let matches_deepest = deepest_classes.is_empty()
            || deepest_classes
                .iter()
                .all(|c| elem.classes.contains(c.as_str()));

        if !matches_deepest {
            continue;
        }

        // Count ancestors
        let mut depth = 0;
        let mut current_idx = elem.parent_idx;
        while let Some(idx) = current_idx {
            if idx < ctx.dom_structure.elements.len() {
                depth += 1;
                current_idx = ctx.dom_structure.elements[idx].parent_idx;
            } else {
                break;
            }
        }

        // If the element's depth (plus 1 for the element itself) is enough
        // to accommodate the required chain, it's potentially used
        if depth + 1 >= required_depth {
            return false;
        }
    }

    // No element has enough depth to accommodate the repeated nesting chain
    true
}

/// Extract class, id, and element constraints from a CSS prelude (selector list).
/// This extracts the simple selector requirements from the LAST relative selector
/// of each complex selector in the prelude (the "subject" of the selector).
fn extract_selector_constraints(
    prelude: &Value,
    classes: &mut Vec<String>,
    ids: &mut Vec<String>,
    elements: &mut Vec<String>,
) {
    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        for complex in children {
            if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
                // The last relative selector is the "subject" - the element the rule applies to
                // For `.a .b .c`, the subject is `.c`
                // For a simple selector like `.a`, the subject is `.a`
                if let Some(last_rel) = rel_selectors.last()
                    && let Some(selectors) = last_rel.get("selectors").and_then(|s| s.as_array())
                {
                    for sel in selectors {
                        let sel_type = sel.get("type").and_then(|t| t.as_str());
                        match sel_type {
                            Some("ClassSelector") => {
                                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                                    classes.push(decode_css_escape(name));
                                }
                            }
                            Some("IdSelector") => {
                                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                                    ids.push(decode_css_escape(name));
                                }
                            }
                            Some("TypeSelector") => {
                                if let Some(name) = sel.get("name").and_then(|n| n.as_str())
                                    && name != "*"
                                {
                                    elements.push(decode_css_escape(name));
                                }
                            }
                            _ => {}
                        }
                    }
                }
            }
        }
    }
}

/// This is true when the element after :host > is not a direct child of the component root
fn is_host_child_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 {
        return false;
    }

    // Check if first selector is :host
    let first = &rel_selectors[0];
    let first_is_host = first
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|arr| arr.first())
        .is_some_and(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("host")
        });

    // A `:root` compound without `:has` is global-like exactly like `:host`:
    // upstream never matches it against an element, so a `>` link out of it can
    // only be satisfied when the subject is a root child.
    let first_is_root = !first_is_host
        && first
            .get("selectors")
            .and_then(|s| s.as_array())
            .is_some_and(|arr| {
                let named = |n: &str| {
                    arr.iter().any(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n2| n2.as_str()) == Some(n)
                    })
                };
                named("root") && !named("has")
            });

    if !first_is_host && !first_is_root {
        return false;
    }
    if first_is_root && (ctx.has_dynamic_elements || !structural_ancestry_is_lexical(ctx)) {
        return false;
    }

    // Check if second selector uses child combinator (>)
    let second = &rel_selectors[1];
    let combinator = second
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    if combinator != ">" {
        return false;
    }

    // Get the element type from the second selector
    if let Some(selectors) = second.get("selectors").and_then(|s| s.as_array()) {
        for sel in selectors {
            let sel_type = sel.get("type").and_then(|t| t.as_str());
            if sel_type == Some("TypeSelector") {
                if let Some(tag_name) = sel.get("name").and_then(|n| n.as_str()) {
                    // Universal selector might match
                    if tag_name == "*" {
                        return false;
                    }
                    // Check if this element is a root child in the DOM structure
                    let is_root_child =
                        ctx.dom_structure.elements.iter().any(|el| {
                            el.is_root_child && el.tag_name.eq_ignore_ascii_case(tag_name)
                        });
                    if !is_root_child {
                        return true;
                    }
                }
            } else if sel_type == Some("ClassSelector")
                && let Some(class_name) = sel.get("name").and_then(|n| n.as_str())
            {
                // Check if any root child has this class
                let is_root_child_with_class = ctx
                    .dom_structure
                    .elements
                    .iter()
                    .any(|el| el.is_root_child && el.classes.contains(class_name));
                if !is_root_child_with_class {
                    return true;
                }
            }
        }
    }

    false
}

/// Check if a sibling combinator selector has no possible match
/// This is stricter than "unused" - it means the selector absolutely cannot match
/// due to mutually exclusive control flow branches
fn is_sibling_combinator_no_match(complex: &Value, ctx: &CssContext) -> bool {
    if let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) {
        is_sibling_combinator_no_match_impl(rel_selectors, ctx)
    } else {
        false
    }
}

/// Implementation of no-match check for sibling combinators
fn visit_possible_siblings(
    ctx: &CssContext,
    element_idx: usize,
    forward: bool,
    general: bool,
    mut visitor: impl FnMut(usize) -> bool,
) -> bool {
    let relations = |idx: usize| {
        let element = &ctx.dom_structure.elements[idx];
        match (forward, general) {
            (true, true) => &element.possible_next_general,
            (true, false) => &element.possible_next_adjacent,
            (false, true) => &element.possible_prev_general,
            (false, false) => &element.possible_prev_adjacent,
        }
    };

    if general && ctx.dom_structure.general_siblings_linked {
        let mut current = relations(element_idx).first().map(|(idx, _)| *idx);
        while let Some(idx) = current {
            if visitor(idx) {
                return true;
            }
            current = relations(idx).first().map(|(next, _)| *next);
        }
        false
    } else {
        relations(element_idx).iter().any(|(idx, _)| visitor(*idx))
    }
}

/// Whether Phase 2's sibling walk stopped short of this element's real siblings.
/// It reports that per element; the component-wide "has an opaque block anywhere"
/// flag does not, and a `{#if}` / `{#each}` / `{#await}` / `{#key}` branch is not
/// a stop at all — an inexhaustive branch demotes a sibling to "probable".
fn siblings_may_be_incomplete(
    el: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
) -> bool {
    el.sibling_walk_incomplete || el.prev_is_opaque_boundary || el.prev_has_opaque_boundary
}

fn is_sibling_combinator_no_match_impl(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Check if this uses sibling combinators
    let mut sibling_combinator_found = false;
    for rel in rel_selectors.iter().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            sibling_combinator_found = true;
            break;
        }
    }

    if !sibling_combinator_found {
        return false;
    }

    // For simple sibling patterns like .a + .b, check if elements are in mutually exclusive branches
    if rel_selectors.len() == 2 {
        let before = &rel_selectors[0];
        let after = &rel_selectors[1];

        let combinator = after
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator != "+" && combinator != "~" {
            return false;
        }

        let before_info = extract_selector_info(before);
        let after_info = extract_selector_info(after);

        // Find all elements matching 'before' and check their possible siblings
        let mut found_before_element = false;
        let mut found_any_match = false;

        for (el_idx, el) in ctx.dom_structure.elements.iter().enumerate() {
            if selector_matches_element(&before_info, el) {
                found_before_element = true;
                found_any_match =
                    visit_possible_siblings(ctx, el_idx, true, combinator == "~", |sibling_idx| {
                        ctx.dom_structure
                            .elements
                            .get(sibling_idx)
                            .is_some_and(|sibling| selector_matches_element(&after_info, sibling))
                    });

                if found_any_match {
                    break;
                }
            }
        }

        // Return true (no match) only if we found elements matching 'before' but none of their siblings match 'after'
        return found_before_element && !found_any_match;
    }

    false
}

/// True if a relative selector is an "outer global" tail per upstream `truncate`
/// (css-prune.js:207-231): global-like (`:host`/`:root`/view-transition), a bare
/// `:global` (no args), or a `:global(...)` whose compound stays global (every
/// simple selector is a pseudo-class/element).
fn relative_selector_is_outer_global(rel: &Value) -> bool {
    if is_global_like(rel) {
        return true;
    }
    let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) else {
        return false;
    };
    let Some(first) = selectors.first() else {
        return false;
    };
    let first_is_global = first.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
        && first.get("name").and_then(|n| n.as_str()) == Some("global");
    if !first_is_global {
        return false;
    }
    if first.get("args").is_none() {
        return true; // bare :global
    }
    // `:global(...)` stays global only if every simple selector is pseudo.
    selectors.iter().all(|s| {
        matches!(
            s.get("type").and_then(|t| t.as_str()),
            Some("PseudoClassSelector") | Some("PseudoElementSelector")
        )
    })
}

/// Discard trailing global relative selectors (mirrors css-prune.js `truncate`).
/// Returns the prefix up to and including the last non-global relative selector;
/// if every selector is global, returns the input unchanged.
fn truncate_trailing_globals(rel_selectors: &[Value]) -> &[Value] {
    let mut last_kept = None;
    for (i, rel) in rel_selectors.iter().enumerate() {
        if !relative_selector_is_outer_global(rel) {
            last_kept = Some(i);
        }
    }
    match last_kept {
        Some(i) => &rel_selectors[..=i],
        None => rel_selectors,
    }
}

/// Check if a sibling combinator selector is unused
/// A + B or A ~ B is unused if no parent element has children that satisfy the relationship
fn is_sibling_combinator_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    // Upstream prunes via `get_relative_selectors` → `truncate`, which drops
    // trailing `:global(...)` selectors before matching. `& + :global(&)`
    // reduces to `[&]`, which resolves to the (used) parent prelude — the `+` is
    // never tested.
    let rel_selectors = truncate_trailing_globals(rel_selectors);
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Check if the first selector is :global() - this affects how we check siblings
    let first_is_global = rel_selectors.first().is_some_and(|rel| {
        rel.get("selectors")
            .and_then(|s| s.as_array())
            .and_then(|arr| arr.first())
            .is_some_and(|sel| {
                sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                    && sel.get("name").and_then(|n| n.as_str()) == Some("global")
            })
    });

    // For :global(X) + Y patterns, check if Y exists in the template
    if first_is_global && rel_selectors.len() == 2 {
        let second = &rel_selectors[1];
        let combinator = second
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            let second_info = extract_selector_info(second);

            // If it's a universal selector, it matches anything
            if second_info.is_universal {
                return false;
            }

            // Resolve the inner `:global(X)` compound. A multi-relative chain
            // like `:global(.a .z)` becomes a `Chain` so the `.a` ancestor of a
            // candidate `.z` sibling is verified (rather than left unresolved,
            // which over-prunes even when the ancestor really exists).
            let inner_matcher = resolve_global_inner_matcher(&rel_selectors[0], ctx);
            if matches!(inner_matcher, SiblingMatcher::Unresolvable) {
                return false;
            }

            // `:global(X) + Y` is used when some Y is preceded by a node X could
            // be: a real previous sibling matching X, an opaque boundary, or a
            // root-level Y (X may be injected by the parent). The opaque and root
            // predicates alone are insufficient because await/snippet fragments
            // mark their elements opaque yet can hold a real X sibling.
            let matches = ctx
                .dom_structure
                .elements
                .iter()
                .enumerate()
                .any(|(el_idx, el)| {
                    if !selector_matches_element(&second_info, el) {
                        return false;
                    }
                    let opaque = if combinator == "+" {
                        el.prev_is_opaque_boundary
                    } else {
                        el.prev_has_opaque_boundary
                    };
                    if opaque || el.is_root_child {
                        return true;
                    }
                    visit_possible_siblings(ctx, el_idx, false, combinator == "~", |sibling_idx| {
                        matcher_matches_at(&inner_matcher, sibling_idx, ctx)
                    })
                });

            return !matches;
        }
        return false;
    }

    // For other :global() patterns, skip the unused check (too complex)
    if first_is_global {
        return false;
    }

    // Check if this selector uses sibling combinators
    let mut sibling_combinator_found = false;
    let mut sibling_pairs: Vec<(usize, &str)> = Vec::new(); // (index, combinator)

    for (i, rel) in rel_selectors.iter().enumerate().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");

        if combinator == "+" || combinator == "~" {
            sibling_combinator_found = true;
            sibling_pairs.push((i, combinator));
        }
    }

    if !sibling_combinator_found {
        return false;
    }

    // Handle single sibling combinator pair
    if sibling_pairs.len() == 1 {
        let (sibling_idx, combinator) = sibling_pairs[0];

        // Get the selector before the sibling combinator
        let before = &rel_selectors[sibling_idx - 1];
        // Get the selector after the sibling combinator
        let after = &rel_selectors[sibling_idx];

        // Extract selector info for before and after, resolving any `&` against
        // the parent rule (so `.a { & + & }` matches on `.a + .a`).
        let before_info = extract_selector_info_resolving_nesting(before, ctx);
        let after_info = extract_selector_info_resolving_nesting(after, ctx);

        // If we have a parent context (e.g., .foo > A + B) and no control flow,
        // use the structural children_idx approach. When control flow is present,
        // children_idx may not include elements inside {#if}/{#each} blocks,
        // so we fall through to the Phase 2 sibling relationship data instead.
        if !ctx.has_control_flow && sibling_idx >= 2 {
            // Check the combinator before the sibling pattern
            let parent_combinator = rel_selectors[sibling_idx - 1]
                .get("combinator")
                .and_then(|c| c.get("name"))
                .and_then(|n| n.as_str())
                .unwrap_or(" ");

            if parent_combinator == ">" {
                // Direct child context
                // Get the parent selector
                let parent_rel = &rel_selectors[sibling_idx - 2];
                let parent_info = extract_selector_info(parent_rel);

                // Find matching parent elements
                for el in &ctx.dom_structure.elements {
                    if selector_matches_element(&parent_info, el) {
                        // Check if this parent has children that satisfy the sibling relationship
                        if has_sibling_match(ctx, el, &before_info, &after_info, combinator) {
                            return false; // Found a match, not unused
                        }
                    }
                }
                // No parent found with matching sibling children
                return true;
            }
        }

        // Use the sibling relationship data from Phase 2 control flow analysis.
        // Check BACKWARD from 'after' elements, matching the official compiler's approach.
        // The official compiler's prune() checks each element with direction=BACKWARD,
        // so we check: does any element matching 'after' have 'before' as a prev sibling?

        // Resolve `&` operands to ancestor-aware matchers so a multi-relative
        // parent (`.foo > .a { & + & }`) verifies the `.foo` ancestor instead of
        // matching nothing; single-relative parents keep the `Info` path.
        let before_m = resolve_sibling_matcher(before, ctx);
        let after_m = resolve_sibling_matcher(after, ctx);
        if matches!(before_m, SiblingMatcher::Unresolvable)
            || matches!(after_m, SiblingMatcher::Unresolvable)
        {
            return false;
        }

        // Find all elements that match 'after' selector
        let mut found_after_element = false;
        let mut any_after_has_incomplete_siblings = false;
        for (el_idx, el) in ctx.dom_structure.elements.iter().enumerate() {
            if matcher_matches_at(&after_m, el_idx, ctx) {
                found_after_element = true;
                if visit_possible_siblings(ctx, el_idx, false, combinator == "~", |sibling_idx| {
                    matcher_matches_at(&before_m, sibling_idx, ctx)
                }) {
                    return false;
                }

                // If this element has empty sibling lists AND there are opaque boundaries,
                // Phase 2 may not have complete sibling data for this element
                // (e.g., it's inside a snippet that breaks sibling walking)
                if ctx.has_opaque_sibling_boundaries
                    && siblings_may_be_incomplete(el)
                    && el.possible_prev_adjacent.is_empty()
                    && el.possible_prev_general.is_empty()
                    && el.possible_next_adjacent.is_empty()
                    && el.possible_next_general.is_empty()
                {
                    any_after_has_incomplete_siblings = true;
                }
            }
        }

        // If no elements match 'after', check 'before' direction too
        if !found_after_element {
            // Also check forward: do any 'before' elements have 'after' as next sibling?
            let mut found_before_element = false;
            for (el_idx, el) in ctx.dom_structure.elements.iter().enumerate() {
                if matcher_matches_at(&before_m, el_idx, ctx) {
                    found_before_element = true;
                    if visit_possible_siblings(
                        ctx,
                        el_idx,
                        true,
                        combinator == "~",
                        |sibling_idx| matcher_matches_at(&after_m, sibling_idx, ctx),
                    ) {
                        return false;
                    }
                    // Check for incomplete siblings
                    if ctx.has_opaque_sibling_boundaries
                        && siblings_may_be_incomplete(el)
                        && el.possible_prev_adjacent.is_empty()
                        && el.possible_prev_general.is_empty()
                        && el.possible_next_adjacent.is_empty()
                        && el.possible_next_general.is_empty()
                    {
                        any_after_has_incomplete_siblings = true;
                    }
                }
            }
            if !found_before_element {
                // Neither element exists in template at all - can't be siblings
                // But be conservative with opaque boundaries
                if ctx.has_opaque_sibling_boundaries {
                    return false;
                }
                return true;
            }
        }

        // No matching sibling relationship found from Phase 2 data
        // If there are opaque boundaries and some elements have incomplete sibling data,
        // be conservative (the elements might be siblings across opaque content)
        if ctx.has_opaque_sibling_boundaries && any_after_has_incomplete_siblings {
            return false;
        }

        return true;
    }

    // If there are opaque sibling boundaries (slots, snippets, render tags),
    // be conservative with multi-sibling chains - the Phase 2 data may be incomplete.
    if ctx.has_opaque_sibling_boundaries {
        return false;
    }

    // For complex cases with multiple sibling combinators (e.g., .g + .h + .i + .j),
    // check each consecutive sibling pair. If ANY pair is impossible, the whole chain is unused.
    // Walk through pairs: for N relative selectors with sibling combinators between them,
    // check if each adjacent pair (A + B, B + C, C + D, ...) has valid sibling relationships.
    for pair in sibling_pairs.windows(2) {
        let (_idx_a, _comb_a) = pair[0];
        let (idx_b, comb_b) = pair[1];

        // Check the pair: the "before" element for this pair is the selector at idx_b - 1,
        // and the "after" element is at idx_b
        let before = &rel_selectors[idx_b - 1];
        let after = &rel_selectors[idx_b];
        let before_info = extract_selector_info_resolving_nesting(before, ctx);
        let after_info = extract_selector_info_resolving_nesting(after, ctx);

        // Check if any element matching 'after' has 'before' as a possible previous sibling
        let mut found_match = false;
        for (el_idx, el) in ctx.dom_structure.elements.iter().enumerate() {
            if selector_matches_element(&after_info, el) {
                found_match =
                    visit_possible_siblings(ctx, el_idx, false, comb_b == "~", |sibling_idx| {
                        ctx.dom_structure
                            .elements
                            .get(sibling_idx)
                            .is_some_and(|sibling| selector_matches_element(&before_info, sibling))
                    });
                if found_match {
                    break;
                }
            }
        }

        if !found_match {
            return true; // This pair is impossible, so the whole chain is unused
        }
    }

    // Also check the first pair in the chain
    if !sibling_pairs.is_empty() {
        let (first_idx, first_comb) = sibling_pairs[0];
        let before = &rel_selectors[first_idx - 1];
        let after = &rel_selectors[first_idx];
        let before_info = extract_selector_info_resolving_nesting(before, ctx);
        let after_info = extract_selector_info_resolving_nesting(after, ctx);

        let mut found_match = false;
        for (el_idx, el) in ctx.dom_structure.elements.iter().enumerate() {
            if selector_matches_element(&after_info, el) {
                found_match =
                    visit_possible_siblings(ctx, el_idx, false, first_comb == "~", |sibling_idx| {
                        ctx.dom_structure
                            .elements
                            .get(sibling_idx)
                            .is_some_and(|sibling| selector_matches_element(&before_info, sibling))
                    });
                if found_match {
                    break;
                }
            }
        }

        if !found_match {
            return true;
        }
    }

    false
}

/// Extract selector information from a relative selector
#[derive(Debug)]
struct SelectorInfo {
    tag_name: Option<String>,
    classes: Vec<String>,
    id: Option<String>,
    is_universal: bool,
    /// `:is(...)` / `:where(...)` argument groups present in this compound. Each
    /// group is the set of branch selectors; the group is satisfied when **any**
    /// branch matches the element (an OR set), mirroring CSS `:is()` semantics.
    /// A multi-part branch (one containing combinators) is recorded as a
    /// universal branch so it conservatively matches, matching upstream's
    /// treatment of complex `:is()` arguments as used.
    is_groups: Vec<Vec<SelectorInfo>>,
}

/// Extract the [`SelectorInfo`] of the subject compound inside a leading
/// `:global(X)` relative selector (the `X`). Returns an empty (matches-nothing)
/// info when the relative selector is not a single-argument `:global(...)`.
fn global_inner_selector_info(rel: &Value) -> SelectorInfo {
    let empty = || SelectorInfo {
        tag_name: None,
        classes: Vec::new(),
        id: None,
        is_universal: false,
        is_groups: Vec::new(),
    };
    let Some(first) = rel
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|a| a.first())
    else {
        return empty();
    };
    if first.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector")
        || first.get("name").and_then(|n| n.as_str()) != Some("global")
    {
        return empty();
    }
    // `:global(X)` — take X's compound, but only when X is a single relative
    // selector. A descendant/child chain (`:global(.a .z)`) carries an ancestor
    // constraint this compound-only matcher can't verify, so returning empty
    // leaves the sibling test to fall back on the opaque-boundary / root-child
    // predicates rather than matching `.z` while ignoring its required `.a`
    // ancestor.
    if let Some(complex) = first
        .get("args")
        .and_then(|a| a.get("children"))
        .and_then(|c| c.as_array())
        .and_then(|c| c.first())
        && let Some(rels) = complex.get("children").and_then(|c| c.as_array())
        && rels.len() == 1
        && let Some(sels) = rels[0].get("selectors").and_then(|s| s.as_array())
    {
        return extract_selector_info_from_selectors(sels);
    }
    empty()
}

/// A resolved sibling operand for the `+` / `~` prune check: either a compound
/// matched directly against an element, or a set of alternative descendant/
/// child/sibling ancestor-chains (subject last, one per comma branch or
/// `:is()`/`:where()` alternative) verified structurally against an element's
/// ancestors, matching if any alternative does. The `Chain` variant lets
/// `:global(.a .z) + .b`, `.foo > .a { & + & }` and `.x, .y { & + & }` honour
/// the ancestor constraint (`.a` above `.z`, `.foo` above `.a`, either `.x` or
/// `.y` above) instead of bailing to unresolved on the multi-relative or
/// multi-branch chain.
enum SiblingMatcher {
    Info(SelectorInfo),
    Chain(Vec<Vec<Value>>),
    /// A chain whose ancestor constraint cannot be verified because the lexical
    /// parent walk does not model the real ancestry. Dropping to the
    /// compound-only `Info` would silently discard the constraint and let the
    /// rule be pruned, so callers must bail conservatively instead.
    Unresolvable,
}

fn matcher_matches_at(matcher: &SiblingMatcher, idx: usize, ctx: &CssContext) -> bool {
    let Some(el) = ctx.dom_structure.elements.get(idx) else {
        return false;
    };
    match matcher {
        SiblingMatcher::Info(info) => selector_matches_element(info, el),
        SiblingMatcher::Chain(chains) => chains.iter().any(|rels| {
            structural_element_matches_compound(el, &rels[rels.len() - 1])
                && structural_ancestors_satisfy_links(rels, rels.len() - 1, idx, ctx)
        }),
        // Callers bail before matching; `true` keeps the conservative direction.
        SiblingMatcher::Unresolvable => true,
    }
}

/// The inner complex selector's relative-selector list for a single-argument
/// `:global(X)` relative selector, or `None`.
fn global_inner_complex_rels(rel: &Value) -> Option<&Vec<Value>> {
    let first = rel
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|a| a.first())?;
    if first.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector")
        || first.get("name").and_then(|n| n.as_str()) != Some("global")
    {
        return None;
    }
    let complex = first
        .get("args")
        .and_then(|a| a.get("children"))
        .and_then(|c| c.as_array())
        .and_then(|c| c.first())?;
    complex.get("children").and_then(|c| c.as_array())
}

/// True when the structural ancestor walk models the real DOM ancestry.
/// `{#snippet}` bodies are handled by `effective_parents` (which follows the
/// `{@render}` sites), but `<selectedcontent>` mirrors the selected option's
/// subtree and is still unreachable from `parent_idx`.
fn structural_ancestry_is_lexical(ctx: &CssContext) -> bool {
    !ctx.dom_structure
        .elements
        .iter()
        .any(|el| el.tag_name.eq_ignore_ascii_case("selectedcontent"))
}

/// The DOM parents of `el_idx`: its lexical parent, unless that parent lies
/// outside the element's `{#snippet}` body, in which case the union of the
/// parents of every `{@render}` site of that snippet (upstream
/// `get_ancestor_elements` breaking the path walk at a `SnippetBlock`).
/// `None` when a snippet's render sites are unknown, in which case callers must
/// stay conservative rather than treat the ancestor set as empty.
fn effective_parents(ctx: &CssContext, el_idx: usize) -> Option<Vec<usize>> {
    let el = &ctx.dom_structure.elements[el_idx];
    let mut out = Vec::new();
    let mut seen: FxHashSet<&str> = FxHashSet::default();
    expand_effective_parents(
        ctx,
        el.parent_idx,
        el.snippet_name.as_deref(),
        &mut seen,
        &mut out,
    )?;
    out.sort_unstable();
    out.dedup();
    Some(out)
}

fn expand_effective_parents<'a>(
    ctx: &'a CssContext,
    parent_idx: Option<usize>,
    snippet: Option<&'a str>,
    seen: &mut FxHashSet<&'a str>,
    out: &mut Vec<usize>,
) -> Option<()> {
    if let Some(p) = parent_idx
        && ctx.dom_structure.elements[p].snippet_name.as_deref() == snippet
    {
        out.push(p);
        return Some(());
    }
    // The lexical walk left the snippet body (or hit the root): continue from
    // wherever the snippet is rendered.
    let Some(name) = snippet else { return Some(()) };
    if !seen.insert(name) {
        return Some(());
    }
    let sites = ctx.dom_structure.snippet_render_sites.get(name)?;
    for site in sites {
        expand_effective_parents(
            ctx,
            site.parent_idx,
            site.snippet_name.as_deref(),
            seen,
            out,
        )?;
    }
    Some(())
}

/// True when a descendant/child chain (subject last) can be evaluated by the
/// structural ancestor matcher: at least two links, only ` `/`>` combinators and
/// only evaluable simple selectors (no `:global`/`&`/functional pseudo).
fn chain_is_structurally_evaluable(rels: &[Value]) -> bool {
    if rels.len() < 2 {
        return false;
    }
    for rel in rels.iter().skip(1) {
        let comb = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");
        if comb != " " && comb != ">" {
            return false;
        }
    }
    rels.iter().all(|rel| {
        rel.get("selectors")
            .and_then(|s| s.as_array())
            .is_some_and(|sels| {
                !sels.is_empty() && sels.iter().all(structural_simple_selector_is_evaluable)
            })
    })
}

/// Resolve a leading `:global(X)` relative selector into a [`SiblingMatcher`]:
/// a `Chain` when `X` is a structurally-evaluable descendant/child chain (so the
/// `.a` ancestor of `:global(.a .z)` is verified), `Unresolvable` when that
/// chain's ancestors are not lexical, otherwise the single-compound `Info`.
fn resolve_global_inner_matcher(rel: &Value, ctx: &CssContext) -> SiblingMatcher {
    if let Some(rels) = global_inner_complex_rels(rel)
        && chain_is_structurally_evaluable(rels)
    {
        if !structural_ancestry_is_lexical(ctx) {
            return SiblingMatcher::Unresolvable;
        }
        return SiblingMatcher::Chain(vec![rels.clone()]);
    }
    SiblingMatcher::Info(global_inner_selector_info(rel))
}

/// True when a single nesting level's compounds can be evaluated by the
/// structural ancestor matcher: only ` `/`>`/`+`/`~` combinators (the head
/// compound may carry a null combinator) and only evaluable simple selectors (no
/// `:global`/`&`/functional pseudo). Unlike [`chain_is_structurally_evaluable`]
/// this accepts a single-compound level (a bare `.grand`).
fn level_is_structurally_evaluable(rels: &[Value]) -> bool {
    if rels.is_empty() {
        return false;
    }
    for rel in rels.iter().skip(1) {
        let comb = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");
        if comb != " " && comb != ">" && comb != "+" && comb != "~" {
            return false;
        }
    }
    rels.iter().all(|rel| {
        rel.get("selectors")
            .and_then(|s| s.as_array())
            .is_some_and(|sels| {
                !sels.is_empty() && sels.iter().all(structural_simple_selector_is_evaluable)
            })
    })
}

/// The complex-selector list of a bare `:is(...)`/`:where(...)` compound (a
/// single simple selector, no combinator on the head besides the implicit
/// null), mirroring [`global_inner_complex_rels`]'s `args` shape. `None` for
/// anything else, including a compound that mixes `:is()` with other simple
/// selectors — upstream only expands a *bare* functional-pseudo compound.
fn functional_pseudo_selector_list(rel: &Value) -> Option<&Vec<Value>> {
    let sels = rel.get("selectors").and_then(|s| s.as_array())?;
    if sels.len() != 1 {
        return None;
    }
    let sel = &sels[0];
    if sel.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector") {
        return None;
    }
    let name = sel.get("name").and_then(|n| n.as_str())?;
    if name != "is" && name != "where" {
        return None;
    }
    sel.get("args")
        .and_then(|a| a.get("children"))
        .and_then(|c| c.as_array())
}

/// Expand a single nesting level's relative-selector list into every
/// structurally-evaluable alternative, recursing into a bare `:is()`/`:where()`
/// head so `& :is(.a, .b) { … }` and `.foo, .bar { & + & { … } }` both
/// contribute one branch per inner complex selector, mirroring upstream's
/// per-branch `NestingSelector` OR recursion instead of bailing on the first
/// unevaluable shape.
fn collect_relative_selector_branches(rels: &[Value], out: &mut Vec<Vec<Value>>) {
    // Upstream links a nested rule to its parent through `get_relative_selectors`,
    // which drops the parent's trailing `:global(...)` before matching.
    let rels = truncate_trailing_globals(rels);
    if level_is_structurally_evaluable(rels) {
        out.push(rels.to_vec());
        return;
    }
    if rels.len() == 1
        && let Some(inner_complexes) = functional_pseudo_selector_list(&rels[0])
    {
        for complex in inner_complexes {
            if let Some(inner_rels) = complex.get("children").and_then(|c| c.as_array()) {
                collect_relative_selector_branches(inner_rels, out);
            }
        }
    }
}

/// Expand every comma branch of a nesting level's prelude into its
/// structurally-evaluable alternatives, mirroring upstream `apply_selector`'s
/// `NestingSelector` case, which iterates `parent.prelude.children` (every
/// comma branch) and ORs the match across all of them instead of requiring a
/// single complex selector.
fn collect_level_branches(prelude: &Value, out: &mut Vec<Vec<Value>>) {
    let Some(children) = prelude.get("children").and_then(|c| c.as_array()) else {
        return;
    };
    for complex in children {
        if let Some(rels) = complex.get("children").and_then(|c| c.as_array()) {
            collect_relative_selector_branches(rels, out);
        }
    }
}

/// Clone a relative selector, forcing a null/absent combinator on its head to a
/// descendant combinator. Mirrors upstream `get_relative_selectors`, which links
/// a nested rule's prelude to its parent by prepending an implicit `&` +
/// descendant combinator before recursing up.
fn with_descendant_head(rel: &Value) -> Value {
    let mut cloned = rel.clone();
    let is_null = cloned
        .get("combinator")
        .map(|c| c.is_null())
        .unwrap_or(true);
    if is_null && let Value::Object(map) = &mut cloned {
        map.insert(
            "combinator".to_string(),
            serde_json::json!({ "type": "Combinator", "name": " " }),
        );
    }
    cloned
}

/// Build every alternative ancestor chain (subject last) for nesting levels
/// `preludes[..level]`, mirroring upstream `get_relative_selectors` +
/// `NestingSelector` resolution: each enclosing rule contributes its prelude,
/// OR-ing across every comma branch and `:is()`/`:where()` alternative
/// ([`collect_level_branches`]) and linking each to the level below by an
/// implicit descendant combinator, so `.grand { .foo > .a { … } }` resolves `&`
/// to `.grand .foo > .a` and `.x, .y { & + & { … } }` yields one chain per
/// branch instead of bailing on the comma list. Returns `None` only when a
/// level contributes zero evaluable branches at all.
fn build_parent_chains(preludes: &[&Value], level: usize) -> Option<Vec<Vec<Value>>> {
    if level == 0 {
        return None;
    }
    let mut own_branches = Vec::new();
    collect_level_branches(preludes[level - 1], &mut own_branches);
    if own_branches.is_empty() {
        return None;
    }
    if level == 1 {
        return Some(own_branches);
    }
    let lower_chains = build_parent_chains(preludes, level - 1)?;
    let mut chains = Vec::with_capacity(lower_chains.len() * own_branches.len());
    for lower in &lower_chains {
        for branch in &own_branches {
            let mut chain = lower.clone();
            chain.push(with_descendant_head(&branch[0]));
            chain.extend(branch[1..].iter().cloned());
            chains.push(chain);
        }
    }
    Some(chains)
}

/// If `rel` is a bare `&` (a single NestingSelector), resolve it against the
/// full stack of enclosing rule preludes into every alternative descendant/
/// sibling chain (subject last) so `.foo > .a { & + & }`,
/// `.grand { .foo > .a { & + & } }` and `.x, .y { & + & }` verify every
/// ancestor level and comma branch, not just the immediate single-branch
/// parent. Chains that resolve to a single compound (no ancestor constraint —
/// handled by [`extract_selector_info_resolving_nesting`]) are dropped;
/// returns `None` when every branch is dropped or unevaluable.
fn resolve_bare_nesting_chains(rel: &Value, ctx: &CssContext) -> Option<Vec<Vec<Value>>> {
    let sels = rel.get("selectors").and_then(|s| s.as_array())?;
    if sels.len() != 1 || sels[0].get("type").and_then(|t| t.as_str()) != Some("NestingSelector") {
        return None;
    }
    let parent_preludes = ctx.parent_preludes.borrow();
    let chains: Vec<Vec<Value>> = build_parent_chains(&parent_preludes, parent_preludes.len())?
        .into_iter()
        .filter(|chain| chain.len() >= 2)
        .collect();
    if chains.is_empty() {
        None
    } else {
        Some(chains)
    }
}

/// Resolve a sibling operand relative selector into a [`SiblingMatcher`],
/// preferring an ancestor-aware `Chain` for a bare `&` with a multi-relative
/// parent (`Unresolvable` when that chain's ancestors are not lexical), else the
/// existing compound `Info`.
fn resolve_sibling_matcher(rel: &Value, ctx: &CssContext) -> SiblingMatcher {
    if let Some(chains) = resolve_bare_nesting_chains(rel, ctx) {
        if !structural_ancestry_is_lexical(ctx) {
            return SiblingMatcher::Unresolvable;
        }
        return SiblingMatcher::Chain(chains);
    }
    SiblingMatcher::Info(extract_selector_info_resolving_nesting(rel, ctx))
}

fn extract_selector_info(rel_selector: &Value) -> SelectorInfo {
    if let Some(selectors) = rel_selector.get("selectors").and_then(|s| s.as_array()) {
        extract_selector_info_from_selectors(selectors)
    } else {
        SelectorInfo {
            tag_name: None,
            classes: Vec::new(),
            id: None,
            is_universal: false,
            is_groups: Vec::new(),
        }
    }
}

/// Build a [`SelectorInfo`] for a relative selector, resolving a `&`
/// (NestingSelector) against the immediate parent rule's prelude. Mirrors
/// upstream `relative_selector_might_apply_to_node`'s NestingSelector branch:
/// the element must also satisfy one of the parent rule's compounds, added as an
/// `:is(...)`-style OR-group (so `.a { & + & }` resolves each `&` to `.a`).
/// Without this, a bare `&` yields an empty (matches-nothing) info and a nested
/// sibling rule like `& + &` is wrongly pruned. Only single-relative parent
/// selectors are resolved: a chain like `.foo > .a` carries an ancestor
/// constraint this compound-only matcher can't verify, so leaving `&` empty lets
/// the rule prune (matching the official `(empty)`) instead of over-keeping it.
fn extract_selector_info_resolving_nesting(rel: &Value, ctx: &CssContext) -> SelectorInfo {
    let mut info = extract_selector_info(rel);

    let has_nesting = rel
        .get("selectors")
        .and_then(|s| s.as_array())
        .is_some_and(|arr| {
            arr.iter()
                .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"))
        });
    if !has_nesting {
        return info;
    }

    let parent_preludes = ctx.parent_preludes.borrow();
    let Some(parent) = parent_preludes.last() else {
        return info;
    };

    let mut branches: Vec<SelectorInfo> = Vec::new();
    if let Some(children) = parent.get("children").and_then(|c| c.as_array()) {
        for complex in children {
            if let Some(rels) = complex.get("children").and_then(|c| c.as_array())
                && rels.len() == 1
                && let Some(sels) = rels[0].get("selectors").and_then(|s| s.as_array())
            {
                branches.push(extract_selector_info_from_selectors(sels));
            }
        }
    }
    if !branches.is_empty() {
        info.is_groups.push(branches);
    }
    info
}

/// Build `:is(...)` / `:where(...)` OR-groups from a compound's simple selectors.
/// Each returned group is the set of branch [`SelectorInfo`]s; the group is
/// satisfied when any branch matches (see [`selector_matches_element`]).
fn extract_is_groups(selectors: &[Value]) -> Vec<Vec<SelectorInfo>> {
    let mut groups = Vec::new();
    for sel in selectors {
        if sel.get("type").and_then(|t| t.as_str()) != Some("PseudoClassSelector") {
            continue;
        }
        let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
        if name != "is" && name != "where" {
            continue;
        }
        let Some(children) = sel
            .get("args")
            .and_then(|a| a.get("children"))
            .and_then(|c| c.as_array())
        else {
            continue;
        };
        let mut branches: Vec<SelectorInfo> = Vec::new();
        for branch in children {
            let rels = branch.get("children").and_then(|c| c.as_array());
            match rels {
                // Single compound (no combinator): match against its constraints.
                Some(rs) if rs.len() == 1 => {
                    if let Some(inner) = rs[0].get("selectors").and_then(|s| s.as_array()) {
                        branches.push(extract_selector_info_from_selectors(inner));
                    }
                }
                // Multi-part or empty branch: conservatively treat as matching,
                // mirroring upstream marking complex `:is()` args as used.
                _ => branches.push(SelectorInfo {
                    tag_name: None,
                    classes: Vec::new(),
                    id: None,
                    is_universal: true,
                    is_groups: Vec::new(),
                }),
            }
        }
        if !branches.is_empty() {
            groups.push(branches);
        }
    }
    groups
}

/// `true` when the extracted selector info carries at least one concrete
/// constraint (tag/class/id/universal). Selectors made up purely of
/// pseudo-classes / pseudo-elements (e.g. `:focus-visible`) have no constraints
/// and can potentially match any element.
fn selector_info_has_constraints(info: &SelectorInfo) -> bool {
    info.tag_name.is_some() || !info.classes.is_empty() || info.id.is_some() || info.is_universal
}

fn selector_matches_element(
    info: &SelectorInfo,
    el: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
) -> bool {
    // Universal selector matches everything
    if info.is_universal {
        return true;
    }

    // Check tag name (dynamic tags match any type selector)
    if let Some(ref tag) = info.tag_name
        && !el.is_dynamic_tag
        && !el.tag_name.eq_ignore_ascii_case(tag)
    {
        return false;
    }

    // Check classes. An element whose `class` value can't be fully resolved at
    // compile time — an interpolated expression we couldn't enumerate (so the
    // attribute name lands in `dynamic_attribute_names`) or a spread that may
    // inject arbitrary classes — matches *any* class selector. This mirrors
    // upstream `attribute_matches`, which returns `true` as soon as a class
    // chunk's possible values are indeterminate (css-prune.js), so e.g.
    // `class="wx-icon {expr}"` still satisfies a `.wx-icon` sibling selector.
    let class_is_indeterminate = el.has_spread || el.dynamic_attribute_names.contains("class");
    if !class_is_indeterminate {
        for class in &info.classes {
            if !el.classes.contains(class) {
                return false;
            }
        }
    }

    // Check ID
    if let Some(ref id) = info.id
        && el.id.as_ref() != Some(id)
    {
        return false;
    }

    // Check `:is()` / `:where()` groups: each group must have at least one
    // branch that matches the element (OR within a group, AND across groups).
    for group in &info.is_groups {
        if !group
            .iter()
            .any(|branch| selector_matches_element(branch, el))
        {
            return false;
        }
    }

    // If no selector specified, it matches nothing specific
    info.tag_name.is_some()
        || !info.classes.is_empty()
        || info.id.is_some()
        || info.is_universal
        || !info.is_groups.is_empty()
}

fn has_sibling_match(
    ctx: &CssContext,
    parent: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
    before: &SelectorInfo,
    after: &SelectorInfo,
    combinator: &str,
) -> bool {
    // Get children elements
    let children: Vec<_> = parent
        .children_idx
        .iter()
        .filter_map(|&idx| ctx.dom_structure.elements.get(idx))
        .collect();

    has_sibling_match_in_list(ctx, &children, before, after, combinator)
}

fn has_sibling_match_in_list(
    _ctx: &CssContext,
    children: &[&crate::compiler::phases::phase2_analyze::types::CssDomElement],
    before: &SelectorInfo,
    after: &SelectorInfo,
    combinator: &str,
) -> bool {
    match combinator {
        "+" => {
            // Adjacent sibling: A immediately followed by B
            for i in 0..children.len().saturating_sub(1) {
                if selector_matches_element(before, children[i])
                    && selector_matches_element(after, children[i + 1])
                {
                    return true;
                }
            }
        }
        "~" => {
            // General sibling: A followed by B (not necessarily immediately)
            for (i, first) in children.iter().enumerate() {
                if selector_matches_element(before, first) {
                    for second in children.iter().skip(i + 1) {
                        if selector_matches_element(after, second) {
                            return true;
                        }
                    }
                }
            }
        }
        _ => {}
    }

    false
}

/// Check if a descendant selector is unused based on DOM structure.
fn is_descendant_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }

    // Don't prune if there are dynamic elements - they could match any type selector
    if ctx.has_dynamic_elements {
        return false;
    }

    // Check if this uses only descendant/child combinators (not sibling combinators)
    // If any sibling combinator (~, +) is present, skip this check
    for rel in rel_selectors.iter().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");
        if combinator == "~" || combinator == "+" {
            return false; // Skip sibling combinators
        }
    }

    // Skip if first selector is :host, :global, etc.
    let first = &rel_selectors[0];
    let first_is_special = first
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|arr| arr.first())
        .is_some_and(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str());
            if sel_type == Some("PseudoClassSelector") {
                let name = s.get("name").and_then(|n| n.as_str());
                matches!(name, Some("host") | Some("global") | Some("root"))
            } else {
                false
            }
        });

    if first_is_special {
        return false;
    }

    // For a chain like `a > b > c > d`, every relative selector must contribute
    // a usable constraint (TypeSelector or :not()-like universal pseudo). Bail
    // out as soon as we encounter a link we can't reason about, so we stay
    // conservative (e.g. compound selectors like `a.foo b` are already pruned
    // by the simple-selector pass when `.foo` isn't used).
    let owned_tags: Vec<Option<String>> =
        rel_selectors.iter().map(get_type_selector_name).collect();
    for (i, rel) in rel_selectors.iter().enumerate() {
        if owned_tags[i].is_none() && !is_universal_pseudo_selector(rel) {
            return false;
        }
    }

    // Pick start: every element whose tag matches the first link. When the
    // first link is a universal pseudo (`:not(...)`-shaped), accept any tag.
    let first_tag = owned_tags[0].as_deref();
    let first_universal = matches!(first_tag, Some("*") | None);
    let start_indices: Vec<usize> = ctx
        .dom_structure
        .elements
        .iter()
        .enumerate()
        .filter(|(_, el)| {
            if first_universal {
                true
            } else {
                first_tag.is_some_and(|t| t.eq_ignore_ascii_case(&el.tag_name))
            }
        })
        .map(|(i, _)| i)
        .collect();

    if start_indices.is_empty() {
        // No element matches the first link — the simple-selector pass already
        // marks this as unused; don't double-flag here.
        return false;
    }

    // Walk every (combinator, tag) link from idx=1 onward, gathering the
    // candidate descendants at each step. If any opaque ancestor is hit, bail.
    fn walk(
        ctx: &CssContext,
        current: &[usize],
        chain: &[(&str, &str)], // (combinator, "" for universal)
        idx: usize,
    ) -> Option<bool> {
        if idx == chain.len() {
            return Some(true);
        }
        let (combinator, tag) = chain[idx];
        let mut next: Vec<usize> = Vec::new();
        for &cur in current {
            // Opaque content makes the chain unverifiable from this anchor.
            if ctx.dom_structure.elements[cur].has_opaque_content {
                return None;
            }
            if has_opaque_ancestor(ctx, cur) {
                return None;
            }
            collect_chain_candidates(ctx, cur, combinator, tag, &mut next);
        }
        if next.is_empty() {
            return Some(false);
        }
        // Deduplicate to bound the recursion.
        next.sort_unstable();
        next.dedup();
        walk(ctx, &next, chain, idx + 1)
    }

    // Pre-compute the (combinator, tag) chain for idx>=1 in owned form.
    let owned_chain: Vec<(&str, &str)> = (1..rel_selectors.len())
        .map(|i| {
            let combinator = rel_selectors[i]
                .get("combinator")
                .and_then(|c| c.get("name"))
                .and_then(|n| n.as_str())
                .unwrap_or(" ");
            let tag = match owned_tags[i].as_deref() {
                Some("*") | None => "*",
                Some(t) => t,
            };
            (combinator, tag)
        })
        .collect();

    match walk(ctx, &start_indices, &owned_chain, 0) {
        Some(true) => false, // chain matches → not unused
        Some(false) => true, // chain cannot match → unused
        None => false,       // opaque element → stay conservative
    }
}

/// Push every element under `parent_idx` that satisfies the next chain link
/// (`combinator` + `tag`, with `tag == "*"` meaning universal).
fn collect_chain_candidates(
    ctx: &CssContext,
    parent_idx: usize,
    combinator: &str,
    tag: &str,
    out: &mut Vec<usize>,
) {
    let universal = tag == "*";
    let total_elements = ctx.dom_structure.elements.len();
    // Snapshot the child indices so we can recurse without re-borrowing
    // `ctx.dom_structure.elements` later in the loop.
    let children: Vec<usize> = ctx.dom_structure.elements[parent_idx].children_idx.to_vec();
    let parent_tag_is_selectedcontent =
        ctx.dom_structure.elements[parent_idx].tag_name == "selectedcontent";

    let consider = |out: &mut Vec<usize>, child_idx: usize| {
        if child_idx >= total_elements {
            return;
        }
        let child = &ctx.dom_structure.elements[child_idx];
        if universal || child.tag_name.eq_ignore_ascii_case(tag) {
            out.push(child_idx);
        }
    };

    if combinator == ">" {
        for child_idx in &children {
            consider(out, *child_idx);
        }
        if parent_tag_is_selectedcontent {
            for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
                collect_chain_candidates(ctx, option_idx, combinator, tag, out);
            }
        }
    } else {
        // Descendant combinator (including the implicit " ").
        for &child_idx in &children {
            consider(out, child_idx);
            // Recurse into grandchildren.
            collect_chain_candidates(ctx, child_idx, combinator, tag, out);
        }
        if parent_tag_is_selectedcontent {
            for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
                collect_chain_candidates(ctx, option_idx, combinator, tag, out);
            }
        }
    }
}

/// Structural unused-check for descendant/child chains whose links may be any
/// compound of type / universal / class / id / attribute / bare pseudo
/// selectors. Mirrors upstream css-prune's BACKWARD `apply_selector` +
/// `apply_combinator` over the component's own element tree: the selector is
/// used only if some element matches the subject AND its ancestor chain
/// satisfies every remaining link. Conservative: bails (keeps the selector)
/// on sibling combinators, `:global`, functional pseudo-classes, nesting
/// selectors, or any shape it cannot evaluate against `CssDomElement`.
fn is_structural_descendant_chain_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    if rel_selectors.len() < 2 || ctx.dom_structure.elements.is_empty() {
        return false;
    }
    if !structural_ancestry_is_lexical(ctx) {
        return false;
    }
    for rel in rel_selectors.iter().skip(1) {
        let combinator = rel
            .get("combinator")
            .and_then(|c| c.get("name"))
            .and_then(|n| n.as_str())
            .unwrap_or(" ");
        if combinator != " " && combinator != ">" {
            return false;
        }
    }
    for rel in rel_selectors {
        let Some(sels) = rel.get("selectors").and_then(|s| s.as_array()) else {
            return false;
        };
        if sels.is_empty() || !sels.iter().all(structural_simple_selector_is_evaluable) {
            return false;
        }
    }

    let subject = &rel_selectors[rel_selectors.len() - 1];
    for (idx, el) in ctx.dom_structure.elements.iter().enumerate() {
        if structural_element_matches_compound(el, subject)
            && structural_ancestors_satisfy_links(rel_selectors, rel_selectors.len() - 1, idx, ctx)
        {
            return false;
        }
    }
    true
}

/// Returns `true` when a lone compound selector matches no element. Only
/// applies to compounds carrying at least two constraints — a single constraint
/// is already decided by [`is_simple_selector_unused`], whose per-name
/// deoptimizations this walker deliberately does not reproduce.
fn is_structural_compound_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    // No `has_dynamic_elements` bail: upstream lets a `<svelte:element>` off only the
    // type-selector test, and `structural_element_matches_compound` already does that
    // per element — a component-wide bail would forgive its classes and ids as well.
    if rel_selectors.len() != 1
        || ctx.dom_structure.elements.is_empty()
        || !structural_ancestry_is_lexical(ctx)
    {
        return false;
    }
    let rel = &rel_selectors[0];
    let Some(sels) = rel.get("selectors").and_then(|s| s.as_array()) else {
        return false;
    };
    if sels.len() < 2 || !sels.iter().all(structural_simple_selector_is_evaluable) {
        return false;
    }
    if sels
        .iter()
        .filter(|s| structural_simple_selector_constrains(s))
        .count()
        < 2
    {
        return false;
    }
    !ctx.dom_structure
        .elements
        .iter()
        .any(|el| structural_element_matches_compound(el, rel))
}

/// Whether a simple selector narrows which elements a compound can match.
fn structural_simple_selector_constrains(sel: &Value) -> bool {
    let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
    match sel.get("type").and_then(|t| t.as_str()) {
        Some("TypeSelector") => name != "*",
        Some("ClassSelector") | Some("IdSelector") | Some("AttributeSelector") => true,
        Some("PseudoClassSelector") => {
            matches!(name, "is" | "where") && functional_pseudo_branches(sel).is_some()
        }
        _ => false,
    }
}

fn structural_ancestors_satisfy_links(
    rels: &[Value],
    link_idx: usize,
    el_idx: usize,
    ctx: &CssContext,
) -> bool {
    if link_idx == 0 {
        return true;
    }
    let combinator = rels[link_idx]
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");
    let prev = &rels[link_idx - 1];
    let elements = &ctx.dom_structure.elements;
    if combinator == ">" {
        let Some(parents) = effective_parents(ctx, el_idx) else {
            return true;
        };
        parents.into_iter().any(|p| {
            structural_element_matches_compound(&elements[p], prev)
                && structural_ancestors_satisfy_links(rels, link_idx - 1, p, ctx)
        })
    } else if combinator == "+" || combinator == "~" {
        // A sibling link searches the previous-sibling relation, not ancestry —
        // `visit_possible_siblings` already models the `+`/`~` adjacency/generality
        // distinction the compound-only `SelectorInfo` matcher relies on elsewhere.
        visit_possible_siblings(ctx, el_idx, false, combinator == "~", |sibling_idx| {
            structural_element_matches_compound(&elements[sibling_idx], prev)
                && structural_ancestors_satisfy_links(rels, link_idx - 1, sibling_idx, ctx)
        })
    } else {
        let Some(mut queue) = effective_parents(ctx, el_idx) else {
            return true;
        };
        let mut visited: FxHashSet<usize> = queue.iter().copied().collect();
        while let Some(p) = queue.pop() {
            if structural_element_matches_compound(&elements[p], prev)
                && structural_ancestors_satisfy_links(rels, link_idx - 1, p, ctx)
            {
                return true;
            }
            let Some(nexts) = effective_parents(ctx, p) else {
                return true;
            };
            for next in nexts {
                if visited.insert(next) {
                    queue.push(next);
                }
            }
        }
        false
    }
}

fn structural_simple_selector_is_evaluable(sel: &Value) -> bool {
    match sel.get("type").and_then(|t| t.as_str()) {
        Some("TypeSelector") | Some("ClassSelector") | Some("IdSelector") => {
            sel.get("name").and_then(|n| n.as_str()).is_some()
        }
        Some("AttributeSelector") => {
            // Only the parsed shape (separate name/matcher/value); the legacy
            // raw shape stuffs the whole content into `name`.
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            !name.is_empty()
                && !name.contains('=')
                && !name.contains('[')
                && !name.contains('\\')
                && !sel
                    .get("value")
                    .and_then(|v| v.as_str())
                    .is_some_and(|v| v.contains('\\'))
        }
        Some("PseudoClassSelector") => {
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            // `:global` scoping and the global-like `:host`/`:root` (which
            // match outside the component tree) are not evaluable here.
            if matches!(name, "global" | "host" | "root") {
                return false;
            }
            if sel.get("args").map(|a| a.is_null()).unwrap_or(true) {
                return true;
            }
            match name {
                // Upstream leaves `:not(...)` contents unscoped and never lets
                // them reject an element, so it constrains nothing.
                "not" => true,
                "is" | "where" => functional_pseudo_branches(sel).is_some_and(|branches| {
                    branches.iter().all(|branch| {
                        functional_branch_compound(branch).is_none_or(|rel| {
                            rel.get("selectors")
                                .and_then(|s| s.as_array())
                                .is_some_and(|sels| {
                                    !sels.is_empty()
                                        && sels.iter().all(structural_simple_selector_is_evaluable)
                                })
                        })
                    })
                }),
                // `:has(...)` can reject on its own and this walker cannot look
                // downwards; upstream `break`s out of the switch for every other
                // pseudo-class, so it constrains nothing and must not stop the
                // rest of the chain from being evaluated.
                "has" => false,
                _ => true,
            }
        }
        Some("PseudoElementSelector") => true,
        _ => false,
    }
}

fn structural_element_matches_compound(
    el: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
    rel: &Value,
) -> bool {
    let Some(sels) = rel.get("selectors").and_then(|s| s.as_array()) else {
        return false;
    };
    sels.iter().all(|sel| {
        let raw = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
        // A template's class/id/tag carries the character an escape stands for.
        let decoded;
        let name = if raw.contains('\\') {
            decoded = decode_css_escape(raw);
            decoded.as_str()
        } else {
            raw
        };
        match sel.get("type").and_then(|t| t.as_str()) {
            Some("TypeSelector") => {
                name == "*" || el.is_dynamic_tag || el.tag_name.eq_ignore_ascii_case(name)
            }
            Some("ClassSelector") => {
                el.has_spread
                    || el
                        .dynamic_attribute_names
                        .iter()
                        .any(|n| n.eq_ignore_ascii_case("class"))
                    || el.has_class_directive && el.class_directive_names.contains(name)
                    || el.classes.contains(name)
            }
            Some("IdSelector") => {
                el.has_spread
                    || el
                        .dynamic_attribute_names
                        .iter()
                        .any(|n| n.eq_ignore_ascii_case("id"))
                    || el.id.as_deref() == Some(name)
            }
            Some("AttributeSelector") => {
                let matcher = sel
                    .get("matcher")
                    .and_then(|m| if m.is_null() { None } else { m.as_str() });
                let value = sel
                    .get("value")
                    .and_then(|v| if v.is_null() { None } else { v.as_str() });
                let flags = sel
                    .get("flags")
                    .and_then(|f| if f.is_null() { None } else { f.as_str() });
                structural_element_matches_attribute(el, name, matcher, value, flags)
            }
            // A `:is()` / `:where()` compound matches when any argument branch
            // does; upstream assumes a multi-part branch matches. Everything
            // else (`:hover`, `:not(...)`, pseudo-elements) constrains nothing.
            Some("PseudoClassSelector") => match functional_pseudo_branches(sel) {
                Some(branches) if matches!(name, "is" | "where") => branches.iter().any(|branch| {
                    functional_branch_compound(branch)
                        .is_none_or(|r| structural_element_matches_compound(el, r))
                }),
                _ => true,
            },
            Some("PseudoElementSelector") => true,
            _ => false,
        }
    })
}

/// The argument selector list of a functional pseudo-class, or `None` when it
/// takes no arguments.
fn functional_pseudo_branches(sel: &Value) -> Option<&Vec<Value>> {
    sel.get("args")
        .and_then(|a| a.get("children"))
        .and_then(|c| c.as_array())
}

/// The single compound of an argument branch. `None` for a multi-part branch,
/// which upstream assumes matches rather than resolving.
fn functional_branch_compound(complex: &Value) -> Option<&Value> {
    let rels = complex.get("children").and_then(|c| c.as_array())?;
    (rels.len() == 1).then(|| &rels[0])
}

fn structural_element_matches_attribute(
    el: &crate::compiler::phases::phase2_analyze::types::CssDomElement,
    attr_name: &str,
    matcher: Option<&str>,
    value: Option<&str>,
    flags: Option<&str>,
) -> bool {
    // An unknown tag name does not add attributes — upstream matches a
    // `<svelte:element>` against its declared attribute list like any other.
    if el.has_spread {
        return true;
    }
    if is_whitelisted_attribute(&el.tag_name, attr_name) {
        return true;
    }
    if el
        .dynamic_attribute_names
        .iter()
        .any(|n| n.eq_ignore_ascii_case(attr_name))
    {
        return true;
    }
    if attr_name.eq_ignore_ascii_case("class") && el.has_class_directive {
        return true;
    }
    if attr_name.eq_ignore_ascii_case("style") && el.has_style_directive {
        return true;
    }

    let operator = matcher.unwrap_or("");
    let expected_value = value.map(unquote_css_value);
    let has_explicit_case_flag: i8 = match flags {
        Some(f) if f.contains('i') || f.contains('I') => 1,
        Some(f) if f.contains('s') || f.contains('S') => -1,
        _ => 0,
    };

    for (name, attr_val) in &el.static_attributes {
        if name.eq_ignore_ascii_case(attr_name) {
            if operator.is_empty() {
                return true;
            }
            let case_insensitive = if has_explicit_case_flag != 0 {
                has_explicit_case_flag == 1
            } else {
                is_html_case_insensitive_attribute(attr_name)
            };
            let actual = attr_val.as_deref().unwrap_or("");
            if let Some(ref expected) = expected_value
                && test_attribute_value(operator, expected, actual, case_insensitive)
            {
                return true;
            }
        }
    }
    false
}

/// Get the type selector name from a relative selector
fn get_type_selector_name(rel_selector: &Value) -> Option<String> {
    rel_selector
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|arr| {
            arr.iter().find_map(|sel| {
                if sel.get("type").and_then(|t| t.as_str()) == Some("TypeSelector") {
                    sel.get("name").and_then(|n| n.as_str()).map(String::from)
                } else {
                    None
                }
            })
        })
}

/// Check if any ancestor of the given element has opaque content
/// (render tags, slots, components that can inject unknown children)
fn has_opaque_ancestor(ctx: &CssContext, element_idx: usize) -> bool {
    let mut current = element_idx;
    while let Some(parent) = ctx.dom_structure.elements[current].parent_idx {
        if ctx.dom_structure.elements[parent].has_opaque_content {
            return true;
        }
        current = parent;
    }
    false
}

/// For a <selectedcontent> element, find <option> elements in the ancestor <select>.
/// <selectedcontent> clones the content of the selected <option>, so descendants of
/// <option> elements should also be considered as potential descendants.
fn find_option_elements_for_selectedcontent(ctx: &CssContext, sc_idx: usize) -> Vec<usize> {
    let mut options = Vec::new();

    // Walk up to find the ancestor <select>
    let mut current = sc_idx;
    let mut select_idx = None;
    while let Some(parent) = ctx.dom_structure.elements[current].parent_idx {
        if ctx.dom_structure.elements[parent].tag_name == "select" {
            select_idx = Some(parent);
            break;
        }
        current = parent;
    }

    if let Some(select_idx) = select_idx {
        // Find all <option> descendants of <select>
        collect_option_descendants(ctx, select_idx, &mut options);
    }

    options
}

/// Recursively collect <option> element indices from descendants
fn collect_option_descendants(ctx: &CssContext, parent_idx: usize, options: &mut Vec<usize>) {
    let element = &ctx.dom_structure.elements[parent_idx];
    for &child_idx in &element.children_idx {
        if child_idx < ctx.dom_structure.elements.len() {
            let child = &ctx.dom_structure.elements[child_idx];
            if child.tag_name == "option" {
                options.push(child_idx);
            }
            collect_option_descendants(ctx, child_idx, options);
        }
    }
}

/// Check if a relative selector is a universal pseudo-class (like :not())
/// that implicitly matches any element type
fn is_universal_pseudo_selector(rel_selector: &Value) -> bool {
    if let Some(selectors) = rel_selector.get("selectors").and_then(|s| s.as_array()) {
        // Must have at least one selector
        if selectors.is_empty() {
            return false;
        }

        // Check if all selectors are pseudo-classes/elements (no type selector)
        let all_pseudo = selectors.iter().all(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
            sel_type == "PseudoClassSelector" || sel_type == "PseudoElementSelector"
        });

        if all_pseudo {
            // Check if the first is :not, :is, :where (which match any element)
            let first = &selectors[0];
            if first.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector") {
                let name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");
                return matches!(name, "not" | "is" | "where" | "has");
            }
        }
    }
    false
}

/// Decode CSS escape sequences in an identifier.
/// CSS escapes: \XX (1-6 hex digits, optionally followed by whitespace)
/// or \c (any character escaped)
fn decode_css_escape(name: &str) -> String {
    if !name.contains('\\') {
        return name.to_string();
    }

    let mut result = String::new();
    let mut chars = name.chars().peekable();

    while let Some(c) = chars.next() {
        if c == '\\' {
            // Check if next char is a hex digit
            if let Some(&next) = chars.peek() {
                if next.is_ascii_hexdigit() {
                    // Read up to 6 hex digits
                    let mut hex_str = String::new();
                    while hex_str.len() < 6 {
                        if let Some(&h) = chars.peek() {
                            if h.is_ascii_hexdigit() {
                                hex_str.push(chars.next().unwrap());
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }

                    // Parse hex and convert to char
                    if let Ok(code) = u32::from_str_radix(&hex_str, 16)
                        && let Some(decoded) = char::from_u32(code)
                    {
                        result.push(decoded);
                    }

                    // Consume optional single whitespace after hex escape
                    if let Some(&ws) = chars.peek()
                        && (ws == ' ' || ws == '\t' || ws == '\n')
                    {
                        chars.next();
                    }
                } else if next == '\n' {
                    // \newline is a line continuation (skip it)
                    chars.next();
                } else {
                    // \c escapes the character c
                    result.push(chars.next().unwrap());
                }
            }
        } else {
            result.push(c);
        }
    }

    result
}

/// Check if a selector with :has() is unused by checking if the :has() argument
/// can match within the subject element's subtree.
/// For example, `x:has(> z)` is unused if no `x` element has a direct child `z`.
fn is_has_selector_unused(rel_selectors: &[Value], ctx: &CssContext) -> bool {
    for (ri, rel) in rel_selectors.iter().enumerate() {
        let Some(selectors) = rel.get("selectors").and_then(|s| s.as_array()) else {
            continue;
        };
        for sel in selectors {
            if !is_has_pseudo(sel) {
                continue;
            }
            if let Some(flags) = has_argument_unused_flags(rel_selectors, ri, selectors, sel, ctx)
                && flags.iter().all(|&unused| unused)
            {
                return true;
            }
        }
    }

    false
}

fn is_has_pseudo(sel: &Value) -> bool {
    sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
        && sel.get("name").and_then(|n| n.as_str()) == Some("has")
}

/// Whether each argument of one `:has()` can match inside the subtree of an
/// element the enclosing compound could apply to — upstream marks exactly those
/// arguments' `metadata.used`. `None` when the subject cannot be resolved, in
/// which case nothing may be concluded about any argument.
///
/// `ri` is the index of the `:has()`'s relative selector in `rel_selectors`, so
/// the candidates can be narrowed by the combinators that precede it: `.a :has(.b)`
/// asks for a `.b` under an element that is itself under an `.a`, not for a `.b`
/// anywhere.
fn has_argument_unused_flags(
    rel_selectors: &[Value],
    ri: usize,
    selectors: &[Value],
    sel: &Value,
    ctx: &CssContext,
) -> Option<Vec<bool>> {
    if ctx.dom_structure.elements.is_empty() {
        return None;
    }

    let has_children = sel
        .get("args")?
        .get("children")
        .and_then(|c| c.as_array())
        .filter(|c| !c.is_empty())?;

    // `&` inside the argument refers to the parent CSS rule, not to an element,
    // so it cannot be resolved through the DOM structure.
    let has_nesting_in_args = has_children.iter().any(|complex| {
        complex
            .get("children")
            .and_then(|c| c.as_array())
            .is_some_and(|rels| {
                rels.iter().any(|rel| {
                    rel.get("selectors")
                        .and_then(|s| s.as_array())
                        .is_some_and(|sels| {
                            sels.iter().any(|s| {
                                s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector")
                            })
                        })
                })
            })
    });
    if has_nesting_in_args {
        return None;
    }

    // The subject is the compound the `:has()` sits in, `:has()` itself excluded.
    let subject_info = extract_selector_info_from_selectors(selectors);

    let subject_is_root = selectors.iter().any(|s| {
        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
            && s.get("name").and_then(|n| n.as_str()) == Some("root")
    });
    let subject_is_global = selectors.iter().any(|s| {
        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
            && s.get("name").and_then(|n| n.as_str()) == Some("global")
            && s.get("args").is_some()
    });

    // For `:root:has()` / `:global(.foo):has()` the subject is the document root
    // or an element outside the component, so the argument is only required to
    // exist somewhere.
    if subject_is_root || subject_is_global {
        return Some(
            has_children
                .iter()
                .map(|has_complex| is_has_argument_unused_globally(has_complex, ctx))
                .collect(),
        );
    }

    let subject_less = subject_info.tag_name.is_none()
        && subject_info.classes.is_empty()
        && subject_info.id.is_none()
        && !subject_info.is_universal;

    if subject_less {
        // A subject-less `:has(...)` is `*:has(...)`: upstream still requires the
        // argument to match INSIDE some element's subtree, so an existence check
        // over the whole component is too weak — unless the subject may be an
        // element outside this component, which is upstream's `include_self`.
        if enclosing_rule_is_global_or_root(ctx) {
            return Some(
                has_children
                    .iter()
                    .map(|has_complex| is_has_argument_unused_globally(has_complex, ctx))
                    .collect(),
            );
        }
        let candidates: Vec<usize> = (0..ctx.dom_structure.elements.len())
            .filter(|&i| structural_ancestors_satisfy_links(rel_selectors, ri, i, ctx))
            .collect();
        return Some(
            has_children
                .iter()
                .map(|has_complex| is_has_argument_unused(has_complex, &candidates, ctx))
                .collect(),
        );
    }

    let subject_elements: Vec<usize> = ctx
        .dom_structure
        .elements
        .iter()
        .enumerate()
        .filter(|(i, el)| {
            selector_matches_element(&subject_info, el)
                && structural_ancestors_satisfy_links(rel_selectors, ri, *i, ctx)
        })
        .map(|(i, _)| i)
        .collect();

    if subject_elements.is_empty() {
        // The subject itself never applies; that verdict belongs to the ordinary
        // compound checks, not to this one.
        return None;
    }

    Some(
        has_children
            .iter()
            .map(|has_complex| is_has_argument_unused(has_complex, &subject_elements, ctx))
            .collect(),
    )
}

/// Upstream `include_self`: the subject of a `:has(...)` may be an element
/// outside this component when any enclosing rule is `:global(...)` or `:root`,
/// in which case the argument is checked against the element itself as well as
/// its subtree.
fn enclosing_rule_is_global_or_root(ctx: &CssContext) -> bool {
    ctx.parent_preludes.borrow().iter().any(|prelude| {
        prelude
            .get("children")
            .and_then(|c| c.as_array())
            .is_some_and(|complexes| {
                complexes.iter().any(|complex| {
                    complex
                        .get("children")
                        .and_then(|c| c.as_array())
                        .is_some_and(|rels| {
                            rels.iter().any(|rel| {
                                relative_selector_is_global_pseudo(rel)
                                    || rel.get("selectors").and_then(|s| s.as_array()).is_some_and(
                                        |sels| {
                                            sels.iter().any(|s| {
                                                s.get("type").and_then(|t| t.as_str())
                                                    == Some("PseudoClassSelector")
                                                    && s.get("name").and_then(|n| n.as_str())
                                                        == Some("root")
                                            })
                                        },
                                    )
                            })
                        })
                })
            })
    })
}

/// Check if a :has() argument is unused when the subject is :root or :global
/// (i.e., the entire template is the scope).
/// For descendant/child :has() arguments, check if the element exists anywhere.
/// For sibling :has() arguments, check if sibling relationships exist.
fn is_has_argument_unused_globally(has_complex: &Value, ctx: &CssContext) -> bool {
    let Some(rel_selectors) = has_complex.get("children").and_then(|c| c.as_array()) else {
        return false;
    };

    if rel_selectors.is_empty() {
        return false;
    }

    // If any relative selector contains a NestingSelector (&), we can't resolve it
    // through the DOM structure. Be conservative and treat as potentially used.
    for rel in rel_selectors {
        if let Some(sels) = rel.get("selectors").and_then(|s| s.as_array())
            && sels
                .iter()
                .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"))
        {
            return false;
        }
    }

    let first = &rel_selectors[0];
    let combinator = first
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    let first_info = extract_selector_info(first);

    // Handle :global() arguments - always potentially used
    if let Some(selectors) = first.get("selectors").and_then(|s| s.as_array()) {
        let is_global = selectors.first().is_some_and(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("global")
        });
        if is_global {
            return false;
        }
    }

    // Arguments without any concrete constraint (e.g. `:has(:focus-visible)`)
    // can match any element; the official matcher skips plain pseudo-classes and
    // treats the selector as a possible match.
    if !selector_info_has_constraints(&first_info) {
        return false;
    }

    // For descendant/child selectors from :root/:global context,
    // the element just needs to exist anywhere in the template
    match combinator {
        " " | ">" => {
            // Check if any element in the template matches
            let matches = ctx
                .dom_structure
                .elements
                .iter()
                .any(|el| selector_matches_element(&first_info, el));
            if !matches {
                return true;
            }
            // If there are more parts, we'd need to check them too,
            // but for simple single-selector :has(), this is enough
            false
        }
        "+" | "~" => {
            // For sibling selectors from :root/:global context,
            // check if any root-level element has matching siblings
            for (el_idx, el) in ctx.dom_structure.elements.iter().enumerate() {
                if !el.is_root_child {
                    continue;
                }
                if visit_possible_siblings(ctx, el_idx, true, combinator == "~", |sibling_idx| {
                    ctx.dom_structure
                        .elements
                        .get(sibling_idx)
                        .is_some_and(|sibling| selector_matches_element(&first_info, sibling))
                }) {
                    return false;
                }
            }
            true
        }
        _ => false,
    }
}

/// Check if a :has() argument is unused relative to the subject elements.
/// Returns true if the argument cannot match within any subject element's context.
fn is_has_argument_unused(
    has_complex: &Value,
    subject_elements: &[usize],
    ctx: &CssContext,
) -> bool {
    let Some(rel_selectors) = has_complex.get("children").and_then(|c| c.as_array()) else {
        return false;
    };

    if rel_selectors.is_empty() {
        return false;
    }

    // Get the first relative selector and its combinator
    let first = &rel_selectors[0];
    let combinator = first
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" "); // default is descendant

    let first_info = extract_selector_info(first);

    // For simple single-selector :has() arguments (like :has(> z) or :has(+ c))
    // we can check against the DOM structure

    // Handle :global() arguments - these are always considered used
    if let Some(selectors) = first.get("selectors").and_then(|s| s.as_array()) {
        let is_global = selectors.first().is_some_and(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("global")
        });
        if is_global {
            return false; // :global() is always potentially used
        }
    }

    // A `:has()` nested inside the argument has its own subject set — the
    // elements this argument could match — so it has to be resolved against
    // those. `selector_info_has_constraints` sees no tag/class/id in
    // `:has(:has(.b))` and would otherwise call the argument a possible match.
    if rel_selectors.len() == 1
        && let Some(nested) = nested_has_arguments(first)
    {
        let Some(candidates) =
            elements_matching_relative(first, &first_info, subject_elements, ctx)
        else {
            return false;
        };
        if candidates.is_empty() {
            return true;
        }
        return nested
            .iter()
            .all(|arg| is_has_argument_unused(arg, &candidates, ctx));
    }

    // Arguments without any concrete constraint (e.g. `:has(:focus-visible)`)
    // can match any element; the official matcher skips plain pseudo-classes and
    // treats the selector as a possible match.
    if !selector_info_has_constraints(&first_info) {
        return false;
    }

    // If there are multiple relative selectors (like > h > i), handle that too
    if rel_selectors.len() > 1 {
        // For multi-part :has() like :has(> h > i), check the first part,
        // then recursively check remaining parts within matched elements
        return is_multi_part_has_unused(rel_selectors, subject_elements, ctx);
    }

    match combinator {
        ">" => {
            // :has(> z) - check if any subject element has a direct child matching z
            // With opaque boundaries, render tags/slots could inject children, so be conservative
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &child_idx in &subject.children_idx {
                    if let Some(child) = ctx.dom_structure.elements.get(child_idx)
                        && selector_matches_element(&first_info, child)
                    {
                        return false; // Found a match
                    }
                }
            }
            true // No match found
        }
        "+" => {
            // :has(+ c) - CSS spec: x:has(+ c) matches x if x has a following adjacent sibling c
            // This checks siblings of x, not descendants, so opaque content inside x doesn't matter
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                if visit_possible_siblings(ctx, subject_idx, true, false, |sibling_idx| {
                    ctx.dom_structure
                        .elements
                        .get(sibling_idx)
                        .is_some_and(|sibling| selector_matches_element(&first_info, sibling))
                }) {
                    return false;
                }
                // If opaque boundaries exist and this element has incomplete sibling data,
                // be conservative - elements from render tags/slots could be siblings
                if ctx.has_opaque_sibling_boundaries
                    && subject.possible_next_adjacent.is_empty()
                    && subject.possible_next_general.is_empty()
                    && subject.possible_prev_adjacent.is_empty()
                    && subject.possible_prev_general.is_empty()
                {
                    return false; // Conservative: sibling data may be incomplete
                }
            }
            true // No match found
        }
        "~" => {
            // :has(~ c) - check if any subject element has a following general sibling matching c
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                if visit_possible_siblings(ctx, subject_idx, true, true, |sibling_idx| {
                    ctx.dom_structure
                        .elements
                        .get(sibling_idx)
                        .is_some_and(|sibling| selector_matches_element(&first_info, sibling))
                }) {
                    return false;
                }
                // If opaque boundaries exist and this element has incomplete sibling data,
                // be conservative
                if ctx.has_opaque_sibling_boundaries
                    && subject.possible_next_adjacent.is_empty()
                    && subject.possible_next_general.is_empty()
                    && subject.possible_prev_adjacent.is_empty()
                    && subject.possible_prev_general.is_empty()
                {
                    return false; // Conservative: sibling data may be incomplete
                }
            }
            true // No match found
        }
        " " => {
            // :has(z) - descendant selector, check if any subject has z in subtree
            // With opaque boundaries, render tags/slots could inject descendants, so be conservative
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                if has_matching_descendant(subject_idx, &first_info, ctx) {
                    return false; // Found a match
                }
            }
            true // No match found
        }
        _ => false, // Unknown combinator, be conservative
    }
}

/// The argument list of a `:has()` sitting inside one compound, when there is
/// exactly one — several would each constrain the same element and this shape
/// cannot express the conjunction.
fn nested_has_arguments(rel: &Value) -> Option<&Vec<Value>> {
    let selectors = rel.get("selectors")?.as_array()?;
    let mut found = None;
    for sel in selectors {
        if !is_has_pseudo(sel) {
            continue;
        }
        if found.is_some() {
            return None;
        }
        found = sel
            .get("args")
            .and_then(|a| a.get("children"))
            .and_then(|c| c.as_array())
            .filter(|c| !c.is_empty());
        found?;
    }
    found
}

/// The elements one relative selector of a `:has()` argument can match, given
/// the subjects it is measured from. `None` when the answer cannot be trusted
/// (an unhandled combinator, or content this component does not see).
fn elements_matching_relative(
    rel: &Value,
    info: &SelectorInfo,
    subject_elements: &[usize],
    ctx: &CssContext,
) -> Option<Vec<usize>> {
    let combinator = rel
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");
    // `selector_matches_element` answers "matches nothing" for a compound with
    // no tag/class/id, but here that compound is the bare `:has()` whose
    // argument is checked separately — every reachable element is a candidate.
    let universal = SelectorInfo {
        tag_name: None,
        classes: Vec::new(),
        id: None,
        is_universal: true,
        is_groups: Vec::new(),
    };
    let info = if selector_info_has_constraints(info) || !info.is_groups.is_empty() {
        info
    } else {
        &universal
    };
    let mut matched = Vec::new();
    match combinator {
        ">" => {
            if ctx.has_opaque_sibling_boundaries {
                return None;
            }
            for &subject_idx in subject_elements {
                for &child_idx in &ctx.dom_structure.elements[subject_idx].children_idx {
                    if let Some(child) = ctx.dom_structure.elements.get(child_idx)
                        && selector_matches_element(info, child)
                    {
                        matched.push(child_idx);
                    }
                }
            }
        }
        " " => {
            if ctx.has_opaque_sibling_boundaries {
                return None;
            }
            for &subject_idx in subject_elements {
                collect_matching_descendants(subject_idx, info, ctx, &mut matched);
            }
        }
        _ => return None,
    }
    Some(matched)
}

/// Check if a multi-part :has() argument (like > h > i) is unused
fn is_multi_part_has_unused(
    rel_selectors: &[Value],
    subject_elements: &[usize],
    ctx: &CssContext,
) -> bool {
    if rel_selectors.is_empty() {
        return false;
    }

    let first = &rel_selectors[0];
    let combinator = first
        .get("combinator")
        .and_then(|c| c.get("name"))
        .and_then(|n| n.as_str())
        .unwrap_or(" ");

    let first_info = extract_selector_info(first);

    // Find elements that match the first part relative to the subject
    let mut matched_elements: Vec<usize> = Vec::new();

    match combinator {
        ">" => {
            // Direct child - opaque boundaries could inject children
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &child_idx in &subject.children_idx {
                    if let Some(child) = ctx.dom_structure.elements.get(child_idx)
                        && selector_matches_element(&first_info, child)
                    {
                        matched_elements.push(child_idx);
                    }
                }
            }
        }
        "+" => {
            // Adjacent sibling of subject
            for &subject_idx in subject_elements {
                let subject = &ctx.dom_structure.elements[subject_idx];
                for &(sibling_idx, _) in &subject.possible_next_adjacent {
                    if let Some(sibling) = ctx.dom_structure.elements.get(sibling_idx)
                        && selector_matches_element(&first_info, sibling)
                    {
                        matched_elements.push(sibling_idx);
                    }
                }
            }
        }
        " " => {
            // Descendant - opaque boundaries could inject descendants
            if ctx.has_opaque_sibling_boundaries {
                return false;
            }
            for &subject_idx in subject_elements {
                collect_matching_descendants(subject_idx, &first_info, ctx, &mut matched_elements);
            }
        }
        _ => return false, // Be conservative
    }

    if matched_elements.is_empty() {
        return true;
    }

    // Recursively check remaining selectors with matched elements as new subjects
    if rel_selectors.len() > 1 {
        return is_multi_part_has_unused(&rel_selectors[1..], &matched_elements, ctx);
    }

    false
}

/// Check if an element has a matching descendant
fn has_matching_descendant(parent_idx: usize, info: &SelectorInfo, ctx: &CssContext) -> bool {
    let parent = &ctx.dom_structure.elements[parent_idx];
    for &child_idx in &parent.children_idx {
        if let Some(child) = ctx.dom_structure.elements.get(child_idx) {
            if selector_matches_element(info, child) {
                return true;
            }
            if has_matching_descendant(child_idx, info, ctx) {
                return true;
            }
        }
    }

    // Special handling for <selectedcontent>: also check <option> descendants in parent <select>
    if parent.tag_name == "selectedcontent" {
        for option_idx in find_option_elements_for_selectedcontent(ctx, parent_idx) {
            if has_matching_descendant(option_idx, info, ctx) {
                return true;
            }
        }
    }

    false
}

/// Collect all matching descendants
fn collect_matching_descendants(
    parent_idx: usize,
    info: &SelectorInfo,
    ctx: &CssContext,
    results: &mut Vec<usize>,
) {
    let parent = &ctx.dom_structure.elements[parent_idx];
    for &child_idx in &parent.children_idx {
        if let Some(child) = ctx.dom_structure.elements.get(child_idx) {
            if selector_matches_element(info, child) {
                results.push(child_idx);
            }
            collect_matching_descendants(child_idx, info, ctx, results);
        }
    }
}

/// Extract SelectorInfo from a set of simple selectors (not the relative selector)
fn extract_selector_info_from_selectors(selectors: &[Value]) -> SelectorInfo {
    let mut info = SelectorInfo {
        tag_name: None,
        classes: Vec::new(),
        id: None,
        is_universal: false,
        is_groups: extract_is_groups(selectors),
    };

    for sel in selectors {
        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
        match sel_type {
            "TypeSelector" => {
                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                    if name == "*" {
                        info.is_universal = true;
                    } else {
                        info.tag_name = Some(name.to_string());
                    }
                }
            }
            "ClassSelector" => {
                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                    info.classes.push(decode_css_escape(name));
                }
            }
            "IdSelector" => {
                if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                    info.id = Some(decode_css_escape(name));
                }
            }
            // `:is()` / `:where()` handled via is_groups; skip other pseudo-classes
            // (`:has()`, `:not()`, etc.).
            _ => {}
        }
    }

    info
}

/// Check if a simple selector is unused
fn is_simple_selector_unused(sel: &Value, ctx: &CssContext) -> bool {
    let sel_type = sel.get("type").and_then(|t| t.as_str());
    match sel_type {
        Some("TypeSelector") => {
            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                // Don't prune if there are dynamic elements
                if ctx.has_dynamic_elements {
                    return false;
                }
                // Universal selector always matches
                if name == "*" {
                    return false;
                }
                // Decode CSS escape sequences for comparison
                let decoded = decode_css_escape(name);
                return !ctx
                    .used_elements
                    .iter()
                    .any(|used| used.eq_ignore_ascii_case(&decoded));
            }
        }
        Some("ClassSelector") => {
            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                // If there are dynamic classes that we can't statically analyze,
                // we must assume any class selector could potentially match
                if ctx.has_dynamic_classes {
                    return false;
                }
                // Check if this class appears in used_classes
                // If it does, it's potentially used (from static or dynamic expressions)
                // If it doesn't, it's unused (never referenced anywhere)
                let decoded = decode_css_escape(name);
                return !ctx.used_classes.contains(&decoded);
            }
        }
        Some("IdSelector") => {
            if let Some(name) = sel.get("name").and_then(|n| n.as_str()) {
                // If any element has a dynamically-valued id, it could resolve to
                // any value at runtime, so any #id selector is potentially used.
                if ctx.has_dynamic_ids {
                    return false;
                }
                // Decode CSS escape sequences for comparison
                let decoded = decode_css_escape(name);
                return !ctx.used_ids.contains(&decoded);
            }
        }
        Some("PseudoClassSelector") => {
            // Check for :is()/:has() where ALL inner selectors are unused
            // Note: :not() is handled differently - even if the inner selector doesn't exist,
            // :not(X) matches "all elements that are NOT X", so it's always potentially used
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            if (name == "is" || name == "where" || name == "has")
                && let Some(args) = sel.get("args")
                && let Some(children) = args.get("children").and_then(|c| c.as_array())
            {
                // Check if ALL selectors inside are definitely unused
                // Only mark as unused if ALL inner selectors are simple class/id
                // selectors that definitely don't exist in the template
                let all_unused = children
                    .iter()
                    .all(|child| is_is_inner_selector_unused(child, ctx));
                if all_unused && !children.is_empty() {
                    return true;
                }
            }
            // :not() is always potentially used (matches everything except the inner selector)
            // Other pseudo-classes need more complex analysis, consider them potentially used
            return false;
        }
        Some("PseudoElementSelector") => {
            // Pseudo elements need more complex analysis, consider them potentially used
            return false;
        }
        Some("AttributeSelector") => {
            // Try new format (separate name, matcher, value, flags fields)
            let attr_name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            let matcher = sel
                .get("matcher")
                .and_then(|m| if m.is_null() { None } else { m.as_str() });
            let value = sel
                .get("value")
                .and_then(|v| if v.is_null() { None } else { v.as_str() });
            let flags = sel
                .get("flags")
                .and_then(|f| if f.is_null() { None } else { f.as_str() });

            if matcher.is_some() || attr_name.contains('=') || attr_name.contains('[') {
                // Use new format if matcher is present, or fall back to old raw parsing
                if matcher.is_some() {
                    return is_attribute_selector_unused_parsed(
                        attr_name, matcher, value, flags, ctx,
                    );
                }
                // Old format: raw content between [ and ]
                return is_attribute_selector_unused(attr_name, ctx);
            }
            // Just [attr] with no operator - use parsed format
            return is_attribute_selector_unused_parsed(attr_name, None, None, None, ctx);
        }
        _ => {}
    }
    false
}

/// Whitelisted attribute selectors that should never be pruned for certain elements.
/// These are attributes that can be toggled by the browser/runtime.
/// Corresponds to `whitelist_attribute_selector` in css-prune.js.
fn is_whitelisted_attribute(element_tag: &str, attr_name: &str) -> bool {
    match element_tag.to_lowercase().as_str() {
        "details" => attr_name.eq_ignore_ascii_case("open"),
        "dialog" => attr_name.eq_ignore_ascii_case("open"),
        _ => false,
    }
}

/// HTML attributes whose enumerated values are case-insensitive per the HTML spec.
/// Corresponds to `case_insensitive_attributes` in css-prune.js.
fn is_html_case_insensitive_attribute(attr_name: &str) -> bool {
    matches!(
        attr_name.to_lowercase().as_str(),
        "accept-charset"
            | "autocapitalize"
            | "autocomplete"
            | "behavior"
            | "charset"
            | "crossorigin"
            | "decoding"
            | "dir"
            | "direction"
            | "draggable"
            | "enctype"
            | "enterkeyhint"
            | "fetchpriority"
            | "formenctype"
            | "formmethod"
            | "formtarget"
            | "hidden"
            | "http-equiv"
            | "inputmode"
            | "kind"
            | "loading"
            | "method"
            | "preload"
            | "referrerpolicy"
            | "rel"
            | "rev"
            | "role"
            | "rules"
            | "scope"
            | "shape"
            | "spellcheck"
            | "target"
            | "translate"
            | "type"
            | "valign"
            | "wrap"
    )
}

/// Check if a CSS attribute selector is unused using parsed fields.
fn is_attribute_selector_unused_parsed(
    attr_name: &str,
    matcher: Option<&str>,
    value: Option<&str>,
    flags: Option<&str>,
    ctx: &CssContext,
) -> bool {
    if attr_name.is_empty() {
        return false;
    }

    let operator = matcher.unwrap_or("");
    let expected_value = value.map(unquote_css_value);

    // Determine case sensitivity
    let has_explicit_case_flag: i8 = match flags {
        Some(f) if f.contains('i') || f.contains('I') => 1,
        Some(f) if f.contains('s') || f.contains('S') => -1,
        _ => 0,
    };

    for element in &ctx.dom_structure.elements {
        if element.has_spread {
            return false;
        }
        if is_whitelisted_attribute(&element.tag_name, attr_name) {
            return false;
        }
        if element
            .dynamic_attribute_names
            .iter()
            .any(|n| n.eq_ignore_ascii_case(attr_name))
        {
            return false;
        }
        if attr_name.eq_ignore_ascii_case("class") && element.has_class_directive {
            // Upstream's `attribute_matches` bails out on the directive for every
            // operator except `~=`, where a directive matches only its own name.
            if operator != "~=" {
                return false;
            }
            if let Some(expected) = expected_value.as_deref()
                && element.class_directive_names.contains(expected)
            {
                return false;
            }
        }
        if attr_name.eq_ignore_ascii_case("style") && element.has_style_directive {
            return false;
        }

        for (name, attr_val) in &element.static_attributes {
            if name.eq_ignore_ascii_case(attr_name) {
                if operator.is_empty() {
                    return false; // Just [attr] - attribute exists
                }

                let case_insensitive = if has_explicit_case_flag != 0 {
                    has_explicit_case_flag == 1
                } else {
                    is_html_case_insensitive_attribute(attr_name)
                };

                if let Some(attr_value) = attr_val {
                    if let Some(ref expected) = expected_value {
                        if test_attribute_value(operator, expected, attr_value, case_insensitive) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                // Upstream: `if (attribute.value === true) return operator === null`
                // — a valueless attribute is `true`, not `""`, so no operator matches it.
            }
        }
    }

    !ctx.dom_structure.elements.is_empty()
}

/// Check if a CSS attribute selector is unused by checking elements' static attributes.
/// The `raw` parameter is the content between `[` and `]` (e.g., `alt=""`, `data-active='true'`).
/// Returns true only when we can definitively determine no element matches.
fn is_attribute_selector_unused(raw: &str, ctx: &CssContext) -> bool {
    // Parse the raw attribute selector into name, operator, and value
    let (attr_name, operator, expected_value, has_explicit_case_flag) =
        parse_attribute_selector(raw);

    if attr_name.is_empty() {
        return false; // Can't parse, assume used
    }

    // If there are dynamic elements, any attribute could match
    if ctx.has_dynamic_elements {
        return false;
    }

    // If there's no operator, it's just `[attr]` - check if any element has the attribute
    // If there IS an operator, check if any element's attribute value matches
    for element in &ctx.dom_structure.elements {
        // If element has spread attributes, it could have any attribute
        if element.has_spread {
            return false;
        }

        // If element has dynamic tag, it could be any element with any attributes
        if element.is_dynamic_tag {
            return false;
        }

        // Check whitelisted attributes (like details[open], dialog[open])
        // These can be toggled by the browser, so should always be considered used
        if is_whitelisted_attribute(&element.tag_name, &attr_name) {
            return false;
        }

        // Check if this attribute has a dynamic value (expression, bind directive, etc.)
        if element
            .dynamic_attribute_names
            .iter()
            .any(|n| n.eq_ignore_ascii_case(&attr_name))
        {
            return false; // Dynamic value - could be anything
        }

        // Check class directives for [class] selector
        if attr_name.eq_ignore_ascii_case("class") && element.has_class_directive {
            if operator != "~=" {
                return false;
            }
            if let Some(expected) = expected_value.as_deref()
                && element.class_directive_names.contains(expected)
            {
                return false;
            }
        }

        // Check style directives for [style] selector
        if attr_name.eq_ignore_ascii_case("style") && element.has_style_directive {
            return false;
        }

        // Check static attributes
        for (name, value) in &element.static_attributes {
            if name.eq_ignore_ascii_case(&attr_name) {
                if operator.is_empty() {
                    // Just `[attr]` - attribute exists, so it matches
                    return false;
                }

                // Determine case sensitivity:
                // - If the selector has explicit `i` or `s` flag, use that
                // - Otherwise, check if this is an HTML case-insensitive attribute
                let case_insensitive = if has_explicit_case_flag != 0 {
                    has_explicit_case_flag == 1 // 1 = case-insensitive, -1 = case-sensitive
                } else {
                    is_html_case_insensitive_attribute(&attr_name)
                };

                // Attribute exists, check value
                if let Some(attr_value) = value {
                    if let Some(ref expected) = expected_value {
                        if test_attribute_value(&operator, expected, attr_value, case_insensitive) {
                            return false; // Found a match
                        }
                    } else {
                        // No expected value but has operator - shouldn't happen, be safe
                        return false;
                    }
                }
                // Upstream: `if (attribute.value === true) return operator === null`
                // — a valueless attribute is `true`, not `""`, so no operator matches it.
            }
        }
    }

    // No element matched - the attribute selector is unused
    // But only if we actually have DOM structure data
    !ctx.dom_structure.elements.is_empty()
}

/// Parse a CSS attribute selector raw content like `alt=""` or `data-active='true'` or `alt i`.
/// Returns (name, operator, value, explicit_case_flag).
/// explicit_case_flag: 1 = explicit case-insensitive (i flag), -1 = explicit case-sensitive (s flag), 0 = no flag
fn parse_attribute_selector(raw: &str) -> (String, String, Option<String>, i8) {
    let raw = raw.trim();

    // Check for case-insensitive flag at end (e.g., `attr="value" i`)
    let (raw, explicit_case_flag) = if raw.ends_with(" i") || raw.ends_with(" I") {
        (&raw[..raw.len() - 2], 1i8)
    } else if raw.ends_with(" s") || raw.ends_with(" S") {
        (&raw[..raw.len() - 2], -1i8)
    } else {
        (raw, 0i8)
    };

    // Find operator position
    let operators = ["~=", "|=", "^=", "$=", "*=", "="];
    for op in &operators {
        if let Some(pos) = raw.find(op) {
            let attr_name = raw[..pos].trim().to_string();
            let value_str = raw[pos + op.len()..].trim();
            let value = unquote_css_value(value_str);
            return (attr_name, op.to_string(), Some(value), explicit_case_flag);
        }
    }

    // No operator - just `[attr]`
    (
        raw.trim().to_string(),
        String::new(),
        None,
        explicit_case_flag,
    )
}

/// Remove quotes from a CSS attribute value.
fn unquote_css_value(s: &str) -> String {
    let s = s.trim();
    if (s.starts_with('"') && s.ends_with('"')) || (s.starts_with('\'') && s.ends_with('\'')) {
        s[1..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}

/// Test if an attribute value matches the expected value with the given operator.
fn test_attribute_value(
    operator: &str,
    expected: &str,
    actual: &str,
    case_insensitive: bool,
) -> bool {
    let (expected, actual) = if case_insensitive {
        (expected.to_lowercase(), actual.to_lowercase())
    } else {
        (expected.to_string(), actual.to_string())
    };

    match operator {
        "=" => actual == expected,
        // JS `"".split(/\s/)` is `[""]`, so `[a~=""]` matches an empty value.
        "~=" => actual.split(char::is_whitespace).any(|w| w == expected),
        "|=" => actual == expected || actual.starts_with(&format!("{}-", expected)),
        "^=" => actual.starts_with(&expected),
        "$=" => actual.ends_with(&expected),
        "*=" => actual.contains(&expected),
        _ => true, // Unknown operator, assume match
    }
}

/// Where a functional pseudo-class sits inside the complex selector that
/// encloses it, so one of its arguments can be checked for reachability with the
/// surrounding combinators rather than in isolation.
#[derive(Clone, Copy)]
struct BranchHost<'a> {
    complex: &'a Value,
    ri: usize,
    si: usize,
}

/// Whether one argument of an `:is()` / `:where()` / `:has()` is unused, which is
/// what upstream records as the argument `ComplexSelector`'s `metadata.used`.
///
/// A multi-part argument (`:is(a b)`) is assumed to match: it can reach outside
/// the component, which upstream's matcher cannot rule out either.
fn is_functional_branch_unused(
    complex: &Value,
    host: Option<BranchHost>,
    ctx: &CssContext,
) -> bool {
    let Some(rel_selectors) = complex.get("children").and_then(|c| c.as_array()) else {
        return false;
    };
    if rel_selectors.len() != 1 {
        return false;
    }
    let Some(rel) = rel_selectors.first() else {
        return false;
    };
    // A leading combinator (`:has(> .b)`) is relative to the subject, not to the
    // enclosing chain, so neither check below models it.
    if rel.get("combinator").is_some_and(|c| !c.is_null()) {
        return false;
    }

    match host {
        Some(host) => {
            let Some(branch) = rel.get("selectors").and_then(|s| s.as_array()) else {
                return false;
            };
            let synth = substitute_is_branch(host.complex, host.ri, host.si, branch);
            is_complex_selector_unused(&synth, ctx)
        }
        None => is_complex_selector_unused(complex, ctx),
    }
}

/// Check if a selector inside `:is()`/`:where()`/`:has()` is definitely unused,
/// judged on its own (no enclosing-chain context).
fn is_is_inner_selector_unused(complex: &Value, ctx: &CssContext) -> bool {
    is_functional_branch_unused(complex, None, ctx)
}

/// Read the marking walk's verdict for one argument. Falls back to the isolated
/// check only when the walk has not run (the printer always runs it first).
fn branch_is_marked_unused(complex: &Value, ctx: &CssContext) -> bool {
    match (&*ctx.unused_branches.borrow(), complex.get("start")) {
        (Some(marked), Some(start)) => start.as_u64().is_some_and(|s| marked.contains(&(s as u32))),
        (Some(_), None) => false,
        (None, _) => is_is_inner_selector_unused(complex, ctx),
    }
}

/// Transform a CSS rule while preserving whitespace from source
fn transform_rule_preserving<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut CssWriter,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext<'a>,
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
) {
    let node_start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let node_end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // Copy leading content from source, then mirror upstream's
    // `remove_preceding_whitespace(node.start)` so comments (and their own
    // leading whitespace) survive minification.
    if node_start > *last_end {
        let ws_start = (*last_end).saturating_sub(css_start);
        let ws_end = node_start.saturating_sub(css_start);
        if ws_end <= css_source.len() && ws_start < ws_end {
            output.copy(*last_end, &css_source[ws_start..ws_end]);
        }
    }
    if ctx.minify {
        output.trim_preceding_whitespace();
    }

    output.mark(node_start);
    output.mark(node_end);

    // Check if this is a top-level :global {} block
    // This is special - we comment out the :global wrapper but keep content unscoped
    if is_global_block(node) {
        transform_global_block(
            node,
            selector,
            hash,
            css_source,
            css_start,
            output,
            specificity_bumped,
            ctx,
        );
        *last_end = node_end;
        return;
    }

    // Check if the rule is empty (no declarations, or all nested rules are unused/empty)
    // In dev mode, keep empty rules (convenient to add styles via devtools).
    // NOTE: The empty check runs BEFORE the unused check, mirroring the official
    // Rule visitor in 3-transform/css/index.js (empty wins over unused).
    if !ctx.dev && is_rule_empty(node, ctx, is_in_global_block) {
        if ctx.minify {
            // In minify mode, just skip the rule entirely
            *last_end = node_end;
            return;
        }
        // Comment out empty rules
        output.push_str("/* (empty) ");

        // Get the original rule text
        let rule_start = node_start.saturating_sub(css_start);
        let rule_end = node_end.saturating_sub(css_start);
        if rule_end <= css_source.len() && rule_start < rule_end {
            let original = &css_source[rule_start..rule_end];
            // Escape any */ in the content
            if memchr::memmem::find(original.as_bytes(), b"*/").is_some() {
                let escaped = original.replace("*/", "*\\/");
                output.push_str(&escaped);
            } else {
                output.copy(node_start, original);
            }
        }

        output.push_str("*/");
        *last_end = node_end;
        return;
    }

    // Check if the rule is unused (selector doesn't match any template elements)
    // Skip unused check when inside a bare :global {} block (all selectors are global)
    if !is_in_bare_global_block && let Some(prelude) = node.get("prelude") {
        let unused_status = check_selector_unused(prelude, ctx);
        if unused_status != UnusedStatus::Used {
            if ctx.minify {
                // In minify mode, just skip the rule entirely
                *last_end = node_end;
                return;
            }
            // Both Unused and NoMatch use the same comment format: /* (unused) ... */
            output.push_str("/* (unused) ");

            // Get the original rule text
            let rule_start = node_start.saturating_sub(css_start);
            let rule_end = node_end.saturating_sub(css_start);
            if rule_end <= css_source.len() && rule_start < rule_end {
                let original = &css_source[rule_start..rule_end];
                // Escape any */ in the content
                if memchr::memmem::find(original.as_bytes(), b"*/").is_some() {
                    let escaped = original.replace("*/", "*\\/");
                    output.push_str(&escaped);
                } else {
                    output.copy(node_start, original);
                }
            }

            output.push_str("*/");

            *last_end = node_end;
            return;
        }
    }

    // Get the prelude (selector list)
    if let Some(prelude) = node.get("prelude") {
        mark_tree(output, prelude);
        // Transform selectors
        let transformed_selector = transform_selector_list(
            prelude,
            selector,
            hash,
            specificity_bumped,
            css_source,
            css_start,
            ctx,
            parent_has_local_selectors,
            is_in_global_block,
            is_in_bare_global_block,
        );
        let prelude_start = prelude.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let prelude_end_for_map = prelude.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
        emit_selector(
            output,
            &transformed_selector,
            css_source,
            css_start,
            prelude_start,
            prelude_end_for_map,
            selector,
        );

        // Get the block and process it
        if let Some(block) = node.get("block") {
            let prelude_end = prelude.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
            let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Preserve original whitespace between selector and block brace;
            // upstream never removes it, in minify mode either.
            let ws_start = prelude_end.saturating_sub(css_start);
            let ws_end = block_start.saturating_sub(css_start);
            if ws_end <= css_source.len() && ws_start < ws_end {
                output.copy(prelude_end, &css_source[ws_start..ws_end]);
            }

            // Check if block contains nested rules that need special handling
            if has_nested_rules(block) || ctx.minify {
                // Check if this rule contains :global - if so, nested rules are in a global block context.
                // This affects specificity bumping (uses direct class instead of :where()).
                let rule_starts_with_global = is_global_selector_rule(node);
                let rule_contains_global_block = selector_contains_global_block(node);
                let nested_in_global_block =
                    is_in_global_block || rule_starts_with_global || rule_contains_global_block;

                // Track bare :global blocks separately for unused detection.
                // Only bare :global {} (without arguments) bypasses unused detection for nested rules.
                // :global(.foo) {} with arguments still checks unused for nested selectors.
                let rule_is_bare_global = is_global_block(node);
                let nested_in_bare_global_block =
                    is_in_bare_global_block || rule_is_bare_global || rule_contains_global_block;

                // Check if this rule has local selectors for specificity bumping in nested rules
                // If the current rule has local selectors, or any parent had local selectors,
                // then nested rules should use :where() for specificity preservation
                let current_has_local = rule_has_local_selectors(node);
                let nested_parent_has_local = parent_has_local_selectors || current_has_local;

                // Push this rule's prelude for NestingSelector resolution in nested rules
                ctx.parent_preludes.borrow_mut().push(prelude);

                // Process the block recursively
                transform_block_with_nested_rules(
                    block,
                    selector,
                    hash,
                    css_source,
                    css_start,
                    output,
                    specificity_bumped,
                    ctx,
                    nested_in_global_block,
                    nested_parent_has_local,
                    nested_in_bare_global_block,
                );

                // Pop the prelude after processing
                ctx.parent_preludes.borrow_mut().pop();
            } else {
                // Copy the entire block from source (including braces and content)
                let blk_start = block_start.saturating_sub(css_start);
                let blk_end = block_end.saturating_sub(css_start);
                if blk_end <= css_source.len() && blk_start < blk_end {
                    mark_block(output, block);
                    output.copy(block_start, &css_source[blk_start..blk_end]);
                }
            }
        }
    }

    *last_end = node_end;
}

/// Transform a block that contains nested rules
fn transform_block_with_nested_rules<'a>(
    block: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut CssWriter,
    specificity_bumped: &mut bool,
    ctx: &CssContext<'a>,
    is_in_global_block: bool,
    parent_has_local_selectors: bool,
    is_in_bare_global_block: bool,
) {
    let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // Output the opening brace
    mark_node(output, block);
    output.copy_verbatim(css_source, css_start, block_start, "{");

    let mut last_end = block_start + 1; // After the '{'

    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        for child in children {
            let child_type = child.get("type").and_then(|t| t.as_str());
            let child_start = child.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let child_end = child.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Copy content before this child; the whitespace run immediately
            // before it is dropped per child kind below, so comments survive.
            if child_start > last_end {
                let ws_start = last_end.saturating_sub(css_start);
                let ws_end = child_start.saturating_sub(css_start);
                if ws_end <= css_source.len() && ws_start < ws_end {
                    output.push_str(&css_source[ws_start..ws_end]);
                }
            }

            match child_type {
                Some("Rule") => {
                    if is_global_block(child) {
                        // This is a :global { ... } block
                        // Comment out the :global { and } but keep inner content
                        if ctx.minify {
                            output.trim_preceding_whitespace();
                        }
                        transform_global_block(
                            child,
                            selector,
                            hash,
                            css_source,
                            css_start,
                            output,
                            specificity_bumped,
                            ctx,
                        );
                    } else {
                        // Regular nested rule
                        let mut local_last_end = child_start;
                        transform_rule_preserving(
                            child,
                            selector,
                            hash,
                            css_source,
                            css_start,
                            output,
                            specificity_bumped,
                            &mut local_last_end,
                            ctx,
                            parent_has_local_selectors, // use :where() only if parent has local selectors
                            is_in_global_block,         // pass through global block context
                            is_in_bare_global_block,    // pass through bare global block context
                        );
                    }
                }
                Some("Atrule") => {
                    transform_nested_atrule(
                        child,
                        selector,
                        hash,
                        css_source,
                        css_start,
                        output,
                        specificity_bumped,
                        ctx,
                        is_in_global_block,
                        parent_has_local_selectors,
                        is_in_bare_global_block,
                    );
                }
                Some("Declaration") => {
                    let decl_start = child_start.saturating_sub(css_start);
                    let decl_end = child_end.saturating_sub(css_start);
                    if decl_end <= css_source.len() && decl_start < decl_end {
                        let decl_text = &css_source[decl_start..decl_end];
                        let prop = child.get("property").and_then(|p| p.as_str()).unwrap_or("");
                        if ctx.minify && !is_animation_declaration(prop) {
                            output.trim_preceding_whitespace();
                            push_minified_declaration(output, decl_text, prop);
                        } else {
                            output.push_str(decl_text);
                        }
                    }
                }
                _ => {}
            }

            last_end = child_end;
        }
    }

    // Copy content before the closing brace, then mirror upstream's
    // `remove_preceding_whitespace(node.block.end - 1)` — which can cut into the
    // last declaration's own span, since that span ends at the `;` or `}`.
    if block_end > last_end {
        let ws_start = last_end.saturating_sub(css_start);
        let ws_end = (block_end - 1).saturating_sub(css_start); // -1 to exclude the '}'
        if ws_end <= css_source.len() && ws_start < ws_end {
            output.push_str(&css_source[ws_start..ws_end]);
        }
    }
    if ctx.minify {
        output.trim_preceding_whitespace();
    }

    output.copy_verbatim(css_source, css_start, block_end.saturating_sub(1), "}");
}

/// Transform an at-rule that is nested inside a rule's block (e.g. `@media`
/// inside `.foo { ... }`). Nested rules inside the at-rule body still need
/// selector transformation (scoping / unused pruning), and `@keyframes`
/// preludes still need hash prefixing — in the official compiler the css
/// visitors run irrespective of nesting depth.
#[allow(clippy::too_many_arguments)]
fn transform_nested_atrule<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut CssWriter,
    specificity_bumped: &mut bool,
    ctx: &CssContext<'a>,
    is_in_global_block: bool,
    parent_has_local_selectors: bool,
    is_in_bare_global_block: bool,
) {
    let node_start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let node_end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
    let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");

    mark_node(output, node);

    let src = |from: usize, to: usize| -> &str {
        let s = from.saturating_sub(css_start);
        let e = to.saturating_sub(css_start);
        if e <= css_source.len() && s < e {
            &css_source[s..e]
        } else {
            ""
        }
    };

    // @keyframes: prefix the keyframe name with the hash (or strip `-global-`),
    // then copy the body verbatim — upstream returns early without transforming
    // anything within a keyframes block.
    if matches!(
        name,
        "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
    ) {
        // Mirror the official Atrule visitor: skip the `@name` + 1, then spaces,
        // to find the prelude start in the source.
        let bytes = css_source.as_bytes();
        let mut p_start = node_start + name.len() + 1;
        while p_start.saturating_sub(css_start) < css_source.len()
            && bytes.get(p_start - css_start) == Some(&b' ')
        {
            p_start += 1;
        }

        output.copy(node_start, src(node_start, p_start));

        let prelude = node.get("prelude").and_then(|p| p.as_str()).unwrap_or("");
        if prelude.starts_with("-global-") {
            // Remove the `-global-` prefix
            output.copy(p_start + 8, src(p_start + 8, node_end));
        } else {
            if !is_in_bare_global_block {
                output.push_str(hash);
                output.push('-');
            }
            output.copy(p_start, src(p_start, node_end));
        }
        return;
    }

    // Blockless at-rules (e.g. @import) — copy verbatim.
    let block = node.get("block").filter(|b| !b.is_null());
    let Some(block) = block else {
        mark_tree(output, node);
        output.copy(node_start, src(node_start, node_end));
        return;
    };

    let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // `@media (...) {` — copied verbatim from source.
    mark_node(output, block);
    output.copy(node_start, src(node_start, block_start + 1));

    let mut last_end = block_start + 1;

    if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
        for child in children {
            let child_type = child.get("type").and_then(|t| t.as_str());
            let child_start = child.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let child_end = child.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

            // Copy content before this child; the whitespace run immediately
            // before it is dropped per child kind below, so comments survive.
            if child_start > last_end {
                output.push_str(src(last_end, child_start));
            }

            match child_type {
                Some("Rule") => {
                    if is_global_block(child) {
                        if ctx.minify {
                            output.trim_preceding_whitespace();
                        }
                        transform_global_block(
                            child,
                            selector,
                            hash,
                            css_source,
                            css_start,
                            output,
                            specificity_bumped,
                            ctx,
                        );
                    } else {
                        let mut local_last_end = child_start;
                        transform_rule_preserving(
                            child,
                            selector,
                            hash,
                            css_source,
                            css_start,
                            output,
                            specificity_bumped,
                            &mut local_last_end,
                            ctx,
                            parent_has_local_selectors,
                            is_in_global_block,
                            is_in_bare_global_block,
                        );
                    }
                }
                Some("Atrule") => {
                    transform_nested_atrule(
                        child,
                        selector,
                        hash,
                        css_source,
                        css_start,
                        output,
                        specificity_bumped,
                        ctx,
                        is_in_global_block,
                        parent_has_local_selectors,
                        is_in_bare_global_block,
                    );
                }
                Some("Declaration") => {
                    let prop = child.get("property").and_then(|p| p.as_str()).unwrap_or("");
                    let decl_text = src(child_start, child_end);
                    if ctx.minify && !is_animation_declaration(prop) {
                        output.trim_preceding_whitespace();
                        push_minified_declaration(output, decl_text, prop);
                    } else {
                        output.push_str(decl_text);
                    }
                }
                _ => {}
            }

            last_end = child_end;
        }
    }

    // Copy trailing content before the closing brace verbatim: upstream's
    // `remove_preceding_whitespace(node.block.end - 1)` lives in the Rule
    // visitor, so an at-rule's own closing brace keeps its whitespace.
    if block_end > last_end + 1 {
        output.push_str(src(last_end, block_end - 1));
    }

    output.copy_verbatim(css_source, css_start, block_end.saturating_sub(1), "}");
}

/// Transform a :global { ... } block by commenting out the :global wrapper
fn transform_global_block<'a>(
    node: &'a Value,
    _selector: &str,
    _hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut CssWriter,
    _specificity_bumped: &mut bool,
    _ctx: &CssContext<'a>,
) {
    // Get positions
    let prelude = node.get("prelude");
    let block = node.get("block");

    if let (Some(prelude), Some(block)) = (prelude, block) {
        let prelude_start = prelude.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

        if !_ctx.minify {
            // Comment out `:global {`. Upstream brackets it with `prependRight`
            // / `appendLeft`, so the wrapper text itself stays a mapped chunk.
            output.push_str("/* ");
            let selector_start = prelude_start.saturating_sub(css_start);
            let open_brace_end = (block_start + 1).saturating_sub(css_start); // Include the '{'
            if open_brace_end <= css_source.len() && selector_start < open_brace_end {
                // Upstream returns after `visit(node.block)` without calling
                // `next()`, so the prelude's own nodes are never visited and
                // carry no `addSourcemapLocation`.
                mark_node(output, node);
                mark_node(output, block);
                output.copy(prelude_start, &css_source[selector_start..open_brace_end]);
            }
            output.push_str("*/");
        }
        // In minify mode, just skip the :global { wrapper entirely

        // Process inner content
        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            let mut last_end = block_start + 1;

            for child in children {
                let child_start = child.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
                let child_end = child.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

                // Copy whitespace before child
                if child_start > last_end {
                    let ws_start = last_end.saturating_sub(css_start);
                    let ws_end = child_start.saturating_sub(css_start);
                    if ws_end <= css_source.len() && ws_start < ws_end {
                        output.copy(last_end, &css_source[ws_start..ws_end]);
                    }
                }

                // Upstream visits the block, so a minified `:global {}` body is
                // minified like any other; only the scoping is skipped.
                if _ctx.minify {
                    let mut local_last_end = child_start;
                    match child.get("type").and_then(|t| t.as_str()) {
                        Some("Rule") => transform_rule_preserving(
                            child,
                            _selector,
                            _hash,
                            css_source,
                            css_start,
                            output,
                            _specificity_bumped,
                            &mut local_last_end,
                            _ctx,
                            false,
                            true,
                            true,
                        ),
                        Some("Atrule") => transform_nested_atrule(
                            child,
                            _selector,
                            _hash,
                            css_source,
                            css_start,
                            output,
                            _specificity_bumped,
                            _ctx,
                            true,
                            false,
                            true,
                        ),
                        Some("Declaration") => {
                            let prop = child.get("property").and_then(|p| p.as_str()).unwrap_or("");
                            let from = child_start.saturating_sub(css_start);
                            let to = child_end.saturating_sub(css_start);
                            if to <= css_source.len() && from < to {
                                let decl_text = &css_source[from..to];
                                if is_animation_declaration(prop) {
                                    output.push_str(decl_text);
                                } else {
                                    output.trim_preceding_whitespace();
                                    push_minified_declaration(output, decl_text, prop);
                                }
                            }
                        }
                        _ => {}
                    }
                    last_end = child_end;
                    continue;
                }

                // Copy the child from source (don't scope - it's inside :global).
                // A `-global-` keyframes name is still stripped: upstream's
                // Atrule visitor runs at every depth, so nesting inside
                // `:global {}` does not exempt it.
                let child_start_idx = child_start.saturating_sub(css_start);
                let child_end_idx = child_end.saturating_sub(css_start);
                if child_end_idx <= css_source.len() && child_start_idx < child_end_idx {
                    let mut cuts = Vec::new();
                    collect_global_keyframe_prefixes(child, css_source, css_start, &mut cuts);
                    cuts.retain(|&c| c >= child_start_idx && c + 8 <= child_end_idx);
                    cuts.sort_unstable();
                    mark_tree(output, child);
                    let mut from = child_start_idx;
                    for cut in cuts {
                        output.copy(from + css_start, &css_source[from..cut]);
                        from = cut + 8;
                    }
                    output.copy(from + css_start, &css_source[from..child_end_idx]);
                }

                last_end = child_end;
            }

            // Copy whitespace before closing brace, then mirror the Rule
            // visitor's `remove_preceding_whitespace(node.block.end - 1)`.
            if block_end > last_end {
                let ws_start = last_end.saturating_sub(css_start);
                let ws_end = (block_end - 1).saturating_sub(css_start);
                if ws_end <= css_source.len() && ws_start < ws_end {
                    output.copy(last_end, &css_source[ws_start..ws_end]);
                }
            }
            if _ctx.minify {
                output.trim_preceding_whitespace();
            }
        }

        if !_ctx.minify {
            // Comment out `}`
            output.push_str("/*");
            output.copy_verbatim(css_source, css_start, block_end.saturating_sub(1), "}");
            output.push_str("*/");
        }
        // In minify mode, skip the closing } wrapper
    }
}

/// Offsets (relative to `css_source`) of every `-global-` prefix on a keyframes
/// name in `node`'s subtree, so a verbatim copy can still drop them.
fn collect_global_keyframe_prefixes(
    node: &Value,
    css_source: &str,
    css_start: usize,
    out: &mut Vec<usize>,
) {
    if node.get("type").and_then(|t| t.as_str()) == Some("Atrule") {
        let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");
        let prelude = node.get("prelude").and_then(|p| p.as_str()).unwrap_or("");
        if matches!(
            name,
            "keyframes" | "-webkit-keyframes" | "-moz-keyframes" | "-o-keyframes"
        ) && prelude.starts_with("-global-")
        {
            let start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let bytes = css_source.as_bytes();
            let mut p_start = start + name.len() + 1;
            while p_start.saturating_sub(css_start) < css_source.len()
                && bytes.get(p_start - css_start) == Some(&b' ')
            {
                p_start += 1;
            }
            out.push(p_start.saturating_sub(css_start));
            return;
        }
    }
    for key in ["block", "prelude"] {
        if let Some(child) = node.get(key).filter(|c| !c.is_null()) {
            collect_global_keyframe_prefixes(child, css_source, css_start, out);
        }
    }
    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        for child in children {
            collect_global_keyframe_prefixes(child, css_source, css_start, out);
        }
    }
}

/// Transform an at-rule while preserving whitespace
fn transform_atrule_preserving<'a>(
    node: &'a Value,
    selector: &str,
    hash: &str,
    css_source: &str,
    css_start: usize,
    output: &mut CssWriter,
    specificity_bumped: &mut bool,
    last_end: &mut usize,
    ctx: &CssContext<'a>,
) {
    let node_start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let node_end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

    // Copy leading whitespace from source. Upstream's
    // `remove_preceding_whitespace(node.start)` lives in the Rule visitor only,
    // so an at-rule keeps the whitespace in front of it even when minifying.
    if node_start > *last_end {
        let ws_start = (*last_end).saturating_sub(css_start);
        let ws_end = node_start.saturating_sub(css_start);
        if ws_end <= css_source.len() && ws_start < ws_end {
            output.copy_verbatim(
                css_source,
                css_start,
                *last_end,
                &css_source[ws_start..ws_end],
            );
        }
    }

    mark_node(output, node);
    let name = node.get("name").and_then(|n| n.as_str()).unwrap_or("");

    // Handle keyframes - need special handling for name prefixing
    if name == "keyframes"
        || name == "-webkit-keyframes"
        || name == "-moz-keyframes"
        || name == "-o-keyframes"
    {
        let prelude = node.get("prelude").and_then(|p| p.as_str()).unwrap_or("");

        // Mirror the official Atrule visitor: the prelude starts after `@name`
        // plus any spaces, and the hash goes in as a `prependRight` insertion so
        // everything around it stays a mapped chunk.
        let mut p_start = node_start + name.len() + 1;
        while p_start
            .checked_sub(css_start)
            .is_some_and(|off| css_source.as_bytes().get(off) == Some(&b' '))
        {
            p_start += 1;
        }
        // Everything but the inserted hash is copied through: the official
        // Atrule visitor returns before `next()`, so nothing inside a keyframes
        // block is transformed or gets an `addSourcemapLocation`.
        let src = |from: usize, to: usize| -> &str {
            let s = from.saturating_sub(css_start);
            let e = to.saturating_sub(css_start);
            if e <= css_source.len() && s < e {
                &css_source[s..e]
            } else {
                ""
            }
        };
        output.copy(node_start, src(node_start, p_start));
        if prelude.starts_with("-global-") {
            output.copy(p_start + 8, src(p_start + 8, node_end));
        } else {
            let _ = write!(output, "{}-", hash);
            output.copy(p_start, src(p_start, node_end));
        }

        *last_end = node_end;
        return;
    }

    // Check if block exists and is not null
    let block = node.get("block").filter(|b| !b.is_null());

    // For at-rules without nested selectors (font-face, charset, import, page, namespace),
    // copy the entire rule from source
    let is_passthrough = matches!(
        name,
        "font-face" | "charset" | "import" | "page" | "namespace"
    );

    if is_passthrough {
        // Upstream's Declaration visitor runs at every depth, so an `@font-face`
        // body is minified like any other block.
        if ctx.minify && block.is_some() {
            transform_nested_atrule(
                node,
                selector,
                hash,
                css_source,
                css_start,
                output,
                specificity_bumped,
                ctx,
                false,
                false,
                false,
            );
            *last_end = node_end;
            return;
        }
        // Copy the entire at-rule from source
        let src_start = node_start.saturating_sub(css_start);
        let src_end = node_end.saturating_sub(css_start);
        if src_end <= css_source.len() && src_start < src_end {
            mark_tree(output, node);
            output.copy(node_start, &css_source[src_start..src_end]);
        }
        *last_end = node_end;
        return;
    }

    // Handle media, supports, layer, etc. - need to transform nested rules
    let mut header = String::from("@");
    header.push_str(name);

    if let Some(prelude) = node.get("prelude").and_then(|p| p.as_str())
        && !prelude.is_empty()
    {
        header.push(' ');
        header.push_str(prelude);
    }

    if let Some(block) = block {
        let block_start = block.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;

        header.push_str(" {");
        mark_node(output, block);
        output.copy_verbatim(css_source, css_start, node_start, &header);

        if let Some(children) = block.get("children").and_then(|c| c.as_array()) {
            let mut inner_last_end = block_start + 1; // after '{'
            for child in children {
                transform_node_preserving(
                    child,
                    selector,
                    hash,
                    css_source,
                    css_start,
                    output,
                    specificity_bumped,
                    &mut inner_last_end,
                    ctx,
                    false, // rules inside at-rules are not nested (they start fresh)
                );
            }
            // Copy trailing content in block. An at-rule's closing brace keeps
            // its whitespace: only the Rule visitor trims upstream.
            let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
            if inner_last_end < block_end {
                let trail_start = inner_last_end.saturating_sub(css_start);
                let trail_end = (block_end - 1).saturating_sub(css_start); // -1 to exclude closing brace
                if trail_end <= css_source.len() && trail_start < trail_end {
                    output.push_str(&css_source[trail_start..trail_end]);
                }
            }
        }

        let block_end = block.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
        output.copy_verbatim(css_source, css_start, block_end.saturating_sub(1), "}");
    } else {
        output.push_str(&header);
        output.push(';');
    }

    *last_end = node_end;
}

/// Transform a selector list
/// Marks unused selectors inline with /* (unused) SELECTOR*/ comments.
fn transform_selector_list(
    prelude: &Value,
    selector: &str,
    _hash: &str,
    specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext,
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
) -> String {
    let mut result = String::new();

    if let Some(children) = prelude.get("children").and_then(|c| c.as_array()) {
        // Minified mode: delegate to specialized function
        if ctx.minify {
            return transform_selector_list_minified(
                children,
                selector,
                specificity_bumped,
                css_source,
                css_start,
                ctx,
                parent_has_local_selectors,
                is_in_global_block,
                is_in_bare_global_block,
            );
        }

        // Determine the separator style based on the original source
        // If the prelude spans multiple lines, use newline-based separators
        let prelude_start = prelude.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let prelude_end = prelude.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

        let sep_start = prelude_start.saturating_sub(css_start);
        let sep_end = prelude_end.saturating_sub(css_start);
        let use_newlines = if sep_end <= css_source.len() && sep_start < sep_end {
            css_source[sep_start..sep_end].contains('\n')
        } else {
            false
        };

        let separator = if use_newlines { ",\n" } else { ", " };

        let mut all_unused = true;
        let mut unused_buffer = String::new();
        let mut has_output = false;
        // Track the end position of the last processed selector for source preservation
        let mut last_selector_end: Option<usize> = None;
        // Track end position of last unused selector for proper whitespace preservation
        let mut last_unused_end: Option<usize> = None;

        for complex_selector in children.iter() {
            let sel_start = complex_selector
                .get("start")
                .and_then(|s| s.as_u64())
                .unwrap_or(0) as usize;
            let sel_end = complex_selector
                .get("end")
                .and_then(|e| e.as_u64())
                .unwrap_or(0) as usize;

            // Check if this individual selector is unused
            // Skip unused check when inside a bare :global {} block
            let is_unused =
                !is_in_bare_global_block && is_complex_selector_unused(complex_selector, ctx);

            if !is_unused {
                all_unused = false;
            }

            if is_unused {
                // Buffer unused selector, stripping bare :global modifiers
                let selector_text =
                    strip_bare_global_from_text(complex_selector, css_source, css_start);
                if !unused_buffer.is_empty() {
                    unused_buffer.push_str(", ");
                }
                unused_buffer.push_str(&selector_text);
                last_unused_end = Some(sel_end);
            } else {
                // This selector is used
                // First, flush any buffered unused selectors
                if !unused_buffer.is_empty() {
                    if has_output {
                        // Between used selectors: <used> /* (unused) <selectors>*/, <next used>
                        result.push_str(" /* (unused) ");
                        result.push_str(&unused_buffer);
                        result.push_str("*/");
                        // Preserve original whitespace after the unused selector
                        if let Some(unused_end) = last_unused_end {
                            let between_start = unused_end.saturating_sub(css_start);
                            let between_end = sel_start.saturating_sub(css_start);
                            if between_end <= css_source.len() && between_start < between_end {
                                let between = &css_source[between_start..between_end];
                                result.push_str(between);
                            } else {
                                result.push_str(separator);
                            }
                        } else {
                            result.push_str(separator);
                        }
                    } else {
                        // Before first used selector: /* (unused) <selectors>,*/ <used>.
                        // The comma moves inside the comment; the original
                        // whitespace after it (e.g. a newline + indent) is kept.
                        result.push_str("/* (unused) ");
                        result.push_str(&unused_buffer);
                        result.push_str(",*/");
                        let mut wrote_between = false;
                        if let Some(unused_end) = last_unused_end {
                            let between_start = unused_end.saturating_sub(css_start);
                            let between_end = sel_start.saturating_sub(css_start);
                            if between_end <= css_source.len() && between_start < between_end {
                                let between = &css_source[between_start..between_end];
                                let after_comma = match between.find(',') {
                                    Some(i) => &between[i + 1..],
                                    None => between,
                                };
                                if !after_comma.is_empty() {
                                    result.push_str(after_comma);
                                    wrote_between = true;
                                }
                            }
                        }
                        if !wrote_between {
                            result.push(' ');
                        }
                    }
                    unused_buffer.clear();
                    last_unused_end = None;
                }
                // Output separator if not first (only when no unused prefix was flushed)
                else if has_output {
                    // Preserve the original text between selectors (including comments)
                    if let Some(prev_end) = last_selector_end {
                        let between_start = prev_end.saturating_sub(css_start);
                        let between_end = sel_start.saturating_sub(css_start);
                        if between_end <= css_source.len() && between_start < between_end {
                            let between = &css_source[between_start..between_end];
                            // The between text should contain a comma - preserve it with comments
                            result.push_str(between);
                        } else {
                            result.push_str(separator);
                        }
                    } else {
                        result.push_str(separator);
                    }
                }
                // Output the transformed selector
                result.push_str(&transform_complex_selector(
                    complex_selector,
                    selector,
                    specificity_bumped,
                    css_source,
                    css_start,
                    parent_has_local_selectors,
                    is_in_global_block,
                    is_in_bare_global_block,
                    Some(ctx),
                ));
                has_output = true;
                last_selector_end = Some(sel_end);
            }
        }

        // Flush any remaining buffered unused selectors at the end
        if !unused_buffer.is_empty() {
            if all_unused {
                // All selectors are unused - wrap entire thing
                result.push_str("/* (unused) ");
                result.push_str(&unused_buffer);
                result.push_str("*/");
            } else {
                // Some trailing unused selectors
                result.push_str(" /* (unused) ");
                result.push_str(&unused_buffer);
                result.push_str("*/");
            }
        }

        // Preserve any trailing content after the last selector but within the prelude
        // (e.g., comments after the last selector like `.bar /* comment */ {`)
        if let Some(last_end) = last_selector_end {
            let trailing_start = last_end.saturating_sub(css_start);
            let trailing_end = prelude_end.saturating_sub(css_start);
            if trailing_end <= css_source.len() && trailing_start < trailing_end {
                let trailing = &css_source[trailing_start..trailing_end];
                // Only append if there's meaningful content (comments), not just whitespace
                if memchr::memmem::find(trailing.as_bytes(), b"/*").is_some() {
                    result.push_str(trailing);
                }
            }
        }
    } else {
        // Fallback: just get the raw selector text
        result = get_selector_text(prelude);
    }

    result
}

/// Minified version of selector list transformation.
/// Removes unused selectors entirely (no comments), matching the official Svelte
/// MagicString-based pruning algorithm.
fn transform_selector_list_minified(
    children: &[Value],
    selector: &str,
    specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
    ctx: &CssContext,
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
) -> String {
    // Collect which selectors are used
    let used: Vec<bool> = children
        .iter()
        .map(|cs| is_in_bare_global_block || !is_complex_selector_unused(cs, ctx))
        .collect();

    // Replicate the official Svelte pruning algorithm.
    let mut removals: Vec<(usize, usize)> = Vec::new();
    let first_start = children[0]
        .get("start")
        .and_then(|s| s.as_u64())
        .unwrap_or(0) as usize;

    let mut pruning = false;
    let mut prune_start = first_start;
    let mut last = first_start;
    let mut has_previous_used = false;

    for (i, cs) in children.iter().enumerate() {
        let sel_start = cs.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
        let sel_end = cs.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

        if used[i] == pruning {
            if pruning {
                // Find the comma before this selector in the original source
                let src_offset = sel_start.saturating_sub(css_start);
                let mut j = src_offset;
                while j > 0 && css_source.as_bytes().get(j - 1) != Some(&b',') {
                    j -= 1;
                }
                let comma_pos = j + css_start - 1;

                if has_previous_used {
                    removals.push((prune_start, comma_pos));
                } else {
                    removals.push((prune_start, comma_pos + 1));
                }
            } else {
                prune_start = if i == 0 { sel_start } else { last };
            }
            pruning = !pruning;
        }

        if !pruning && used[i] {
            has_previous_used = true;
        }
        last = sel_end;
    }

    if pruning {
        removals.push((prune_start, last));
    }

    // Collect transformed used selectors with their original positions
    let mut used_selectors: Vec<(String, usize, usize)> = Vec::new();
    for (i, cs) in children.iter().enumerate() {
        if used[i] {
            let transformed = transform_complex_selector(
                cs,
                selector,
                specificity_bumped,
                css_source,
                css_start,
                parent_has_local_selectors,
                is_in_global_block,
                is_in_bare_global_block,
                Some(ctx),
            );
            let sel_start = cs.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
            let sel_end = cs.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
            used_selectors.push((transformed, sel_start, sel_end));
        }
    }

    if used_selectors.is_empty() {
        return String::new();
    }

    let mut result = String::new();

    // Handle text before the first used selector (if leading unused selectors were removed)
    if !used[0] {
        let first_used_start = used_selectors[0].1;
        let mut removal_end = first_start;
        for &(_, re) in &removals {
            if re <= first_used_start {
                removal_end = re;
            }
        }
        let between_start = removal_end.saturating_sub(css_start);
        let between_end = first_used_start.saturating_sub(css_start);
        if between_end <= css_source.len() && between_start < between_end {
            result.push_str(&css_source[between_start..between_end]);
        }
    }

    result.push_str(&used_selectors[0].0);

    // Handle subsequent used selectors
    for w in used_selectors.windows(2) {
        let prev_end = w[0].2;
        let curr_start = w[1].1;

        let mut kept_text = String::new();
        let mut pos = prev_end;
        for &(rs, re) in &removals {
            if rs >= prev_end && rs <= curr_start {
                if rs > pos {
                    let s = pos.saturating_sub(css_start);
                    let e = rs.saturating_sub(css_start);
                    if e <= css_source.len() && s < e {
                        kept_text.push_str(&css_source[s..e]);
                    }
                }
                pos = re.max(pos);
            }
        }
        if pos < curr_start {
            let s = pos.saturating_sub(css_start);
            let e = curr_start.saturating_sub(css_start);
            if e <= css_source.len() && s < e {
                kept_text.push_str(&css_source[s..e]);
            }
        }
        result.push_str(&kept_text);
        result.push_str(&w[1].0);
    }

    result
}

/// Check if a relative selector is "global-like" (should not be scoped)
/// This includes :host, :root (without :has), and ::view-transition* pseudo elements
fn is_global_like(relative_selector: &Value) -> bool {
    if let Some(selectors) = relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
    {
        if selectors.is_empty() {
            return false;
        }

        let first = &selectors[0];
        let first_type = first.get("type").and_then(|t| t.as_str()).unwrap_or("");
        let first_name = first.get("name").and_then(|n| n.as_str()).unwrap_or("");

        // :host is global-like (regardless of other selectors in the same relative selector)
        if first_type == "PseudoClassSelector" && first_name == "host" {
            return true;
        }

        // Check if all selectors are pseudo-classes or pseudo-elements
        let all_pseudo = selectors.iter().all(|s| {
            let sel_type = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
            sel_type == "PseudoClassSelector" || sel_type == "PseudoElementSelector"
        });

        if all_pseudo {
            // ::view-transition* pseudo elements are global-like
            if first_type == "PseudoElementSelector" {
                let view_transition_names = [
                    "view-transition",
                    "view-transition-group",
                    "view-transition-old",
                    "view-transition-new",
                    "view-transition-image-pair",
                ];
                if view_transition_names.contains(&first_name) {
                    return true;
                }
            }
        }

        // :root is global-like (unless it contains :has)
        let has_root = selectors.iter().any(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("root")
        });
        let has_has = selectors.iter().any(|s| {
            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                && s.get("name").and_then(|n| n.as_str()) == Some("has")
        });

        if has_root && !has_has {
            return true;
        }
    }
    false
}

/// Transform a complex selector (sequence of relative selectors)
/// Append the verbatim source text *inside* a `:global(...)` pseudo-class to
/// `out`, i.e. everything between the opening `(` and the closing `)`.
///
/// This mirrors upstream `remove_global_pseudo_class` (css/index.js), which
/// `code.remove(selector.start, selector.start + ':global('.length)` and
/// `code.remove(selector.end - 1, selector.end)` — keeping every byte of the
/// argument span untouched, including any whitespace/newlines that sit between
/// the parentheses and the inner selector list. Slicing the `args` SelectorList
/// node's own `start..end` instead would drop that inner padding (the AST span
/// is tight around the selectors), so a multi-line
/// `:global(\n    .a,\n    .b\n)` would lose its indentation.
fn push_global_args_text(
    out: &mut String,
    global_sel: &Value,
    args: &Value,
    css_source: &str,
    css_start: usize,
) {
    let sel_start = global_sel
        .get("start")
        .and_then(|s| s.as_u64())
        .unwrap_or(0) as usize;
    let sel_end = global_sel.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
    // Inner content spans `:global(`.end ..= the byte before the closing `)`.
    let inner_start = sel_start + ":global(".len();
    let inner_end = sel_end.saturating_sub(1); // drop the trailing ')'
    let src_start = inner_start.saturating_sub(css_start);
    let src_end = inner_end.saturating_sub(css_start);
    if inner_start < inner_end && src_end <= css_source.len() && src_start < src_end {
        out.push_str(&css_source[src_start..src_end]);
    } else {
        // Fallback to the reconstructed args text (e.g. synthetic nodes without
        // a reliable source span).
        out.push_str(&get_selector_text(args));
    }
}

fn transform_complex_selector(
    node: &Value,
    selector: &str,
    _specificity_bumped: &mut bool,
    css_source: &str,
    css_start: usize,
    parent_has_local_selectors: bool,
    is_in_global_block: bool,
    is_in_bare_global_block: bool,
    ctx: Option<&CssContext>,
) -> String {
    // If inside a bare :global {} block, output selectors without any scoping
    if is_in_bare_global_block {
        return get_complex_selector_text(node, css_source, css_start);
    }

    let mut result = String::new();
    // Each complex selector resets specificity bumping - first element gets direct class
    // For nested rules, start with bumped=true to use :where() for specificity preservation
    // EXCEPT when we're inside a :global() block - then start fresh (bumped=false)
    // Also, if parent rule doesn't have local selectors (like :root), don't bump
    let mut local_specificity_bumped = parent_has_local_selectors && !is_in_global_block;
    // Track if we've seen a :global() selector - elements AFTER :global() should use direct class
    let mut seen_global = false;
    // Track if the previous selector was scoped - for specificity bumping decisions
    let mut _previous_was_scoped = false;

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        // Pre-scan: check if ANY RelativeSelector in this ComplexSelector has :global()
        // If so, we use direct class (not :where()) for :is()/:not()/:has() content
        // Also use direct class if we're inside a :global() block
        let has_global_anywhere = is_in_global_block
            || children.iter().any(|rs| {
                if let Some(selectors) = rs.get("selectors").and_then(|s| s.as_array()) {
                    selectors.iter().any(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n| n.as_str()) == Some("global")
                    })
                } else {
                    false
                }
            });

        let first_reachable = first_reachable_relative_selector(children);

        let complex_bumps_specificity =
            children
                .iter()
                .skip(first_reachable)
                .any(|relative_selector| {
                    if is_global_like(relative_selector) {
                        return false;
                    }
                    let scoped = relative_selector
                        .get("metadata")
                        .and_then(|metadata| metadata.get("scoped"))
                        .and_then(|scoped| scoped.as_bool())
                        .unwrap_or(true);
                    scoped
                        && relative_selector
                            .get("selectors")
                            .and_then(|selectors| selectors.as_array())
                            .is_some_and(|selectors| {
                                selectors.iter().any(|selector| {
                                    let ty = selector.get("type").and_then(|ty| ty.as_str());
                                    !matches!(
                                        ty,
                                        Some(
                                            "PseudoClassSelector"
                                                | "PseudoElementSelector"
                                                | "NestingSelector"
                                        )
                                    )
                                })
                            })
                });

        // Track if the next relative selector should be treated as global
        // (after a bare :global modifier)
        let mut next_is_global = false;
        // Source span of the last compound emitted through the ordinary path, so
        // the combinator gap can be copied verbatim from the stylesheet.
        let mut prev_rel_span: Option<(usize, usize)> = None;

        for (rel_index, relative_selector) in children.iter().enumerate() {
            // Left of a combinator upstream cannot apply, nothing is scoped.
            let is_reachable = rel_index >= first_reachable;
            // Check if this relative selector starts with bare :global (no args)
            let starts_with_bare_global = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
                .and_then(|arr| arr.first())
                .is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                        && s.get("args").is_none()
                });

            let selectors_count = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
                .map(|a| a.len())
                .unwrap_or(0);

            // Bare :global with no other selectors - skip entirely and mark next as global
            let is_bare_global_only = starts_with_bare_global && selectors_count == 1;

            // Bare :global with modifiers (e.g., :global.x, :global:is(...)) -
            // remove :global, eat space combinator, output the rest without scoping
            let is_global_modifier = starts_with_bare_global && selectors_count > 1;

            if is_bare_global_only {
                // Upstream (css/index.js:286-310): a standalone bare `:global`
                // (args === null) at the start of a *nested* rule (combinator
                // === null) becomes `&` — `div { :global x { … } }` →
                // `div { & x { … } }`. The trailing parts stay unscoped (latched
                // via `next_is_global`). Non-empty `parent_preludes` ⇒ nested.
                if result.is_empty() && ctx.is_some_and(|c| !c.parent_preludes.borrow().is_empty())
                {
                    result.push('&');
                }
                // Mark that this AND every subsequent relative selector in this
                // complex selector is global/unscoped (css-analyze.js:208-211
                // sets `is_global_like` on all selectors after the bare `:global`).
                next_is_global = true;
                continue;
            }

            // Handle :global modifier pattern: :global.x, :global:is(...)
            // These eat the space combinator and output modifiers without scoping
            if is_global_modifier {
                // Check if this is in a nested context (no combinator and first selector)
                let combinator_name = relative_selector
                    .get("combinator")
                    .and_then(|c| c.get("name"))
                    .and_then(|n| n.as_str());

                // In nested context (:global.x with no combinator), prepend &
                // This handles: div { :global.x { ... } } -> div { &.x { ... } }
                if combinator_name.is_none() && result.is_empty() {
                    result.push('&');
                }
                // Don't output the space combinator - the modifiers attach directly
                // to the previous selector (e.g., "div :global.x" -> "div.x")
                if let Some(selectors) = relative_selector
                    .get("selectors")
                    .and_then(|s| s.as_array())
                {
                    for sel in selectors {
                        // Skip the :global pseudo-class itself
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                            && sel.get("args").is_none()
                        {
                            continue;
                        }
                        // Output the modifier without scoping (it's global)
                        result.push_str(&format_simple_selector_with_scope(
                            sel,
                            "", // empty = no scoping
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            false,
                            false,
                        ));
                    }
                }
                // After a :global modifier, don't bump specificity
                _previous_was_scoped = false;
                next_is_global = false;
                continue;
            }

            // If this selector follows a bare :global, output it without scoping
            if next_is_global {
                // Output combinator - always output space even when result is empty,
                // because the space replaces where :global was removed
                if let Some(combinator) = relative_selector.get("combinator")
                    && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                {
                    if name == " " {
                        result.push(' ');
                    } else {
                        let _ = write!(result, " {} ", name);
                    }
                }
                // Output selectors without scoping
                if let Some(selectors) = relative_selector
                    .get("selectors")
                    .and_then(|s| s.as_array())
                {
                    for sel in selectors {
                        result.push_str(&format_simple_selector_with_scope(
                            sel,
                            "", // empty = no scoping
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            false,
                            false,
                        ));
                    }
                }
                _previous_was_scoped = false;
                // Do NOT reset `next_is_global` here: once a standalone bare
                // `:global` is seen, EVERY following relative selector in this
                // complex selector is global/unscoped (upstream marks them all
                // `is_global_like`). The comma operator splits selector lists
                // into separate `transform_complex_selector` calls, so the latch
                // correctly resets per complex selector.
                continue;
            }

            next_is_global = false;

            // Get combinator
            if let Some(combinator) = relative_selector.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                && (name != " " || !result.is_empty())
            {
                if let Some(text) = (!result.is_empty())
                    .then(|| {
                        source_combinator_text(
                            prev_rel_span,
                            relative_selector,
                            name,
                            css_source,
                            css_start,
                        )
                    })
                    .flatten()
                {
                    result.push_str(&text);
                } else if name == " " {
                    result.push(' ');
                } else if result.is_empty() {
                    // First combinator at start (e.g., "> nav" as a nested selector)
                    // Don't add leading space
                    match leading_combinator_text(
                        node,
                        relative_selector,
                        name,
                        css_source,
                        css_start,
                    ) {
                        Some(text) => result.push_str(&text),
                        None => {
                            let _ = write!(result, "{} ", name);
                        }
                    }
                } else {
                    let _ = write!(result, " {} ", name);
                }
                // A combinator by itself must NOT bump specificity. Upstream tracks
                // the bump solely through actual modifier application (`specificity.bumped`
                // becomes true only when a scope class is emitted for a compound). Every
                // real scoped compound below already sets `local_specificity_bumped = true`,
                // so it persists across the combinator on its own. Forcing a bump here
                // was wrong when the PREVIOUS relative selector was a skipped standalone
                // `:where(...)` / `:is(...)` (which emits no modifier): e.g.
                // `:where(.a) > :where(.b)` must scope `.b` with the DIRECT class
                // (`:where(.b.svelte)`), not `:where(.b:where(.svelte))`, because no
                // bump has happened yet. See upstream css/index.js ComplexSelector.
            }

            // Get selectors
            if let Some(selectors) = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                // Check if the entire relative selector is :global (i.e., starts with :global)
                let is_entirely_global = selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                });

                // Check if any selector contains :global() - for partial global handling
                let has_partial_global = !is_entirely_global
                    && selectors.iter().any(|s| {
                        s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && s.get("name").and_then(|n| n.as_str()) == Some("global")
                    });

                // Check if this is a global-like selector (:host, :root, ::view-transition*)
                let is_selector_global_like = is_global_like(relative_selector);

                if is_selector_global_like {
                    // Global-like selectors are output as-is, no scoping
                    for sel in selectors {
                        result.push_str(&format_simple_selector_with_scope(
                            sel,
                            "", // empty selector means no scoping
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            false,
                            false,
                        ));
                    }
                    // Global-like selectors don't count as scoped and don't bump specificity
                    // The next scoped selector should get the direct class
                    _previous_was_scoped = false;
                } else if is_entirely_global {
                    // Handle :global selector - extract :global() content without scoping,
                    // but scope subsequent selectors like :is() with direct class
                    for sel in selectors {
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            // Extract the content inside :global() from source
                            if let Some(args) = sel.get("args") {
                                push_global_args_text(
                                    &mut result,
                                    sel,
                                    args,
                                    css_source,
                                    css_start,
                                );
                            }
                        } else {
                            // For non-:global() selectors like :is(x) following :global(.foo),
                            // pass the scoping class with use_direct_class=true
                            result.push_str(&format_simple_selector_with_scope(
                                sel,
                                selector,
                                css_source,
                                Some(css_start),
                                0,
                                ctx,
                                true, // Use direct class, not :where()
                                local_specificity_bumped,
                            ));
                        }
                    }
                    // Mark that we've passed a :global() selector
                    seen_global = true;
                    // :global() selectors don't count as scoped
                    _previous_was_scoped = false;
                } else if has_partial_global {
                    // Handle partial :global() - scope non-global parts, unwrap :global() parts
                    let needs_scoping = is_reachable
                        && relative_selector
                            .get("metadata")
                            .and_then(|m| m.get("scoped"))
                            .and_then(|s| s.as_bool())
                            .unwrap_or(true);

                    // Check if this contains a NestingSelector - if so, skip scoping
                    // (the & inherits scoping from parent rule)
                    let has_nesting = selectors
                        .iter()
                        .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

                    // Find the last non-pseudo, non-global, non-nesting selector for scoping
                    let mut last_non_pseudo_idx = None;
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        let is_global_pseudo = sel_type == "PseudoClassSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global");
                        if sel_type != "PseudoElementSelector"
                            && sel_type != "PseudoClassSelector"
                            && sel_type != "NestingSelector"
                            && !is_global_pseudo
                        {
                            last_non_pseudo_idx = Some(idx);
                        }
                    }

                    let mut selector_parts = String::new();
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

                        if sel_type == "PseudoClassSelector"
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            // Extract the content inside :global() from source
                            if let Some(args) = sel.get("args") {
                                push_global_args_text(
                                    &mut selector_parts,
                                    sel,
                                    args,
                                    css_source,
                                    css_start,
                                );
                            }
                        } else {
                            selector_parts.push_str(&format_simple_selector_with_scope(
                                sel,
                                selector,
                                css_source,
                                Some(css_start),
                                0,
                                ctx,
                                has_global_anywhere, // Use direct class if any part has :global()
                                local_specificity_bumped,
                            ));

                            // Add scoping after the last non-pseudo selector
                            // Skip if has nesting selector - it inherits scoping from parent
                            if needs_scoping && !has_nesting && Some(idx) == last_non_pseudo_idx {
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                append_modifier(&mut selector_parts, &modifier);
                                local_specificity_bumped = true;
                            }
                        }
                    }

                    result.push_str(&selector_parts);
                    // Mark that this selector was scoped (if scoping was applied)
                    _previous_was_scoped = needs_scoping && !has_nesting;
                } else {
                    // Regular scoped selector
                    let needs_scoping = is_reachable
                        && relative_selector
                            .get("metadata")
                            .and_then(|m| m.get("scoped"))
                            .and_then(|s| s.as_bool())
                            .unwrap_or(true); // Default to scoping

                    // Check if this relative selector contains a NestingSelector (&)
                    // If so, skip adding scoping - the & refers to the parent rule which already has scoping
                    let has_nesting_selector = selectors
                        .iter()
                        .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

                    // Build the selector parts
                    let mut selector_parts = String::new();
                    let mut last_non_pseudo_idx = None;

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        // NestingSelector also counts as non-pseudo for determining where to add scoping
                        if sel_type != "PseudoElementSelector"
                            && sel_type != "PseudoClassSelector"
                            && sel_type != "NestingSelector"
                        {
                            last_non_pseudo_idx = Some(idx);
                        }
                    }

                    // If all selectors are pseudo-classes/elements (or nesting selectors), add scoping class first
                    // Following the official Svelte implementation:
                    // - For :root and :host, do NOT add scoping (they are global-like)
                    // - For :is, the scoping is handled internally
                    // - For other pseudo-classes like :has, :not, :hover, etc., prepend the scoping class
                    // Also skip if we have a NestingSelector - it inherits scoping from parent
                    if needs_scoping && last_non_pseudo_idx.is_none() && !has_nesting_selector {
                        // Check if first selector is one that should not have scoping added before it.
                        // Mirrors upstream Svelte's "skip standalone :is/:where/& selectors" branch
                        // which only triggers when `relative_selector.selectors.length === 1`, plus
                        // the unconditional :root / :host exemptions and the :is internal-scoping
                        // case which rsvelte already collapses here.
                        let first_is_global_like = selectors.first().is_some_and(|s| {
                            if s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            {
                                let name = s.get("name").and_then(|n| n.as_str()).unwrap_or("");
                                if name == "host" || name == "root" {
                                    return true;
                                }
                                if name == "is" && selectors.len() == 1 {
                                    return true;
                                }
                                // Standalone :where(...) handles scoping internally
                                // (mirrors upstream `continue` for length===1 + :where)
                                if name == "where" && selectors.len() == 1 {
                                    return true;
                                }
                                false
                            } else {
                                false
                            }
                        });

                        if !first_is_global_like {
                            // After :global(), use direct class (not :where())
                            let should_use_where = local_specificity_bumped && !seen_global;
                            let modifier = get_modifier(selector, &should_use_where);
                            append_modifier(&mut selector_parts, &modifier);
                            local_specificity_bumped = true;
                            seen_global = false;
                        }
                    }

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

                        // Handle universal selector
                        if sel_type == "TypeSelector" && is_bare_universal(sel) {
                            if needs_scoping {
                                // Replace * with the scoping selector
                                let modifier = get_modifier(selector, &local_specificity_bumped);
                                append_modifier(&mut selector_parts, &modifier);
                                local_specificity_bumped = true;
                            } else {
                                selector_parts.push('*');
                            }
                            continue;
                        }

                        // When a relative selector has a NestingSelector (&) and
                        // specificity hasn't been bumped yet, pseudo-class arguments
                        // like :has() should use direct class because the & inherits
                        // scoping from parent and doesn't add its own scope - so the
                        // :has() content is the first scoping point.
                        let effective_use_direct = has_global_anywhere
                            || (has_nesting_selector && !local_specificity_bumped);

                        // Upstream sets `specificity.bumped = true` for the WHOLE compound
                        // BEFORE recursing into its pseudo-class args (`:is/:where/:has/
                        // :not`) — see css/index.js ComplexSelector, which reaches the
                        // `specificity.bumped = true` line for every scoped compound EXCEPT
                        // a standalone length-1 `:is()/:where()` (which `continue`s) and
                        // nesting compounds. The bump happens even when no textual `.svelte`
                        // modifier is emitted (e.g. `:root:has(h1)` — `:root` is exempt yet
                        // still bumps, so the inner `h1` is `:where(.svelte)`). It also
                        // covers a pseudo appearing before the compound's textual scoping
                        // point, e.g. `nav:has(a).primary` →
                        // `nav:has(a:where(.svelte)).primary.svelte`, not `:has(a.svelte)`.
                        // Standalone `:is()/:where()` compounds keep the raw prior state so
                        // the first inner selector still gets the direct class.
                        let is_standalone_is_where = selectors.len() == 1
                            && selectors.first().is_some_and(|s| {
                                s.get("type").and_then(|t| t.as_str())
                                    == Some("PseudoClassSelector")
                                    && matches!(
                                        s.get("name").and_then(|n| n.as_str()),
                                        Some("is") | Some("where")
                                    )
                            });
                        let compound_bumps =
                            needs_scoping && !has_nesting_selector && !is_standalone_is_where;
                        let outer_bumped_for_recursion =
                            local_specificity_bumped || compound_bumps || complex_bumps_specificity;

                        selector_parts.push_str(&format_simple_selector_with_scope(
                            sel,
                            selector,
                            css_source,
                            Some(css_start),
                            0,
                            ctx,
                            effective_use_direct,
                            outer_bumped_for_recursion,
                        ));

                        // Add scoping after the last non-pseudo selector
                        // If we're after a :global(), use direct class (not :where()) for the first scoped selector
                        // Skip if this relative selector contains a NestingSelector - it inherits scoping from parent
                        if needs_scoping
                            && Some(idx) == last_non_pseudo_idx
                            && !has_nesting_selector
                        {
                            let should_use_where = local_specificity_bumped && !seen_global;
                            let modifier = get_modifier(selector, &should_use_where);
                            append_modifier(&mut selector_parts, &modifier);
                            local_specificity_bumped = true;
                            // After using direct class following :global(), subsequent selectors should use :where()
                            seen_global = false;
                        }
                    }

                    result.push_str(&selector_parts);
                    // Mark that this selector was scoped (unless it's a nesting selector)
                    _previous_was_scoped = needs_scoping && !has_nesting_selector;
                }
            }

            prev_rel_span = compound_start(relative_selector)
                .zip(relative_selector.get("end").and_then(|e| e.as_u64()))
                .map(|(s, e)| (s, e as usize));
        }
    }

    result
}

fn compound_start(relative_selector: &Value) -> Option<usize> {
    relative_selector
        .get("selectors")
        .and_then(|s| s.as_array())
        .and_then(|a| a.first())
        .and_then(|s| s.get("start"))
        .and_then(|s| s.as_u64())
        .map(|s| s as usize)
}

/// The source text between a complex selector's start and its first compound —
/// a nested rule's leading combinator, which the in-place rewrite leaves alone.
fn leading_combinator_text(
    node: &Value,
    relative_selector: &Value,
    name: &str,
    css_source: &str,
    css_start: usize,
) -> Option<String> {
    let from = (node.get("start").and_then(|s| s.as_u64())? as usize).checked_sub(css_start)?;
    let to = compound_start(relative_selector)?.checked_sub(css_start)?;
    if to <= from || to > css_source.len() {
        return None;
    }
    let text = css_source.get(from..to)?;
    if !is_combinator_run(text.trim(), name) {
        return None;
    }
    Some(text.to_string())
}

/// A gap that is nothing but combinator tokens ending in the one the AST kept.
/// `>>` / `>>>` are read one token at a time upstream, keeping only the last.
fn is_combinator_run(trimmed: &str, name: &str) -> bool {
    !trimmed.is_empty()
        && trimmed
            .bytes()
            .all(|b| matches!(b, b'>' | b'+' | b'~' | b'|'))
        && trimmed.ends_with(name.trim())
}

/// Upstream rewrites the stylesheet in place, so the author's whitespace between
/// two compounds — including line breaks — survives into the output.
fn source_combinator_text(
    prev_rel_span: Option<(usize, usize)>,
    relative_selector: &Value,
    name: &str,
    css_source: &str,
    css_start: usize,
) -> Option<String> {
    let (prev_start, prev_end) = prev_rel_span?;
    let start = compound_start(relative_selector)?;
    let mut from = prev_end.checked_sub(css_start)?;
    let to = start.checked_sub(css_start)?;
    if to <= from || to > css_source.len() {
        return None;
    }
    // Our identifier spans stop before the whitespace that terminates a CSS hex
    // escape, where upstream's swallow it; that character belongs to the compound.
    if ends_with_css_hex_escape(css_source.get(prev_start.checked_sub(css_start)?..from)?)
        && css_source[from..to].starts_with([' ', '\t', '\n', '\r'])
    {
        from += 1;
    }
    let text = css_source.get(from..to)?;
    // A gap holding anything but the combinator (a comment, a synthesized node's
    // stale span) falls back to the canonical spelling. `>>` / `>>>` are a run of
    // combinator tokens that upstream's regex reads one at a time, keeping only
    // the last — but its in-place rewrite leaves the whole run in the output.
    let trimmed = text.trim();
    if text.is_empty() || (trimmed != name.trim() && !is_combinator_run(trimmed, name)) {
        return None;
    }
    Some(text.to_string())
}

/// Check if a string ends with a CSS hex escape sequence that would require a space
/// separator before appending a class/id selector.
///
/// CSS escape sequences like `\31\32\33` (representing "123") consume up to 6 hex digits
/// after the backslash. If followed by another hex digit or a character that could be
/// confused as part of the escape (like `.` which starts a class), the browser may
/// misparse. The official Svelte compiler adds a space in this situation.
///
/// For example: `#\31\32\33` + `.svelte-hash` would be misread; it needs to be
/// `#\31\32\33 .svelte-hash`.
fn ends_with_css_hex_escape(text: &str) -> bool {
    // Walk FORWARD through the string, tracking escape sequences.
    // Return true if the string ends with hex digits that are part of a CSS escape
    // (i.e., \HH where HH are hex digits and the escape has consumed fewer than 6 digits
    // without a whitespace terminator).
    //
    // All tokens we test (`\\`, hex digits 0-9/a-f/A-F, space/tab/newline)
    // are ASCII, so byte indexing is UTF-8 safe and avoids allocating a
    // `Vec<char>` on every CSS selector emission. The single-char-escape
    // branch advances by exactly one *byte*: a non-hex char after `\\`
    // could be a multi-byte UTF-8 sequence in pathological CSS, but this
    // function only checks whether the *tail* of the string is a hex
    // escape — over-skipping into a multi-byte sequence's leading byte
    // just falls through the loop normally and produces the correct
    // `false` answer.
    let bytes = text.as_bytes();
    let len = bytes.len();
    if len < 2 {
        return false;
    }

    let mut i = 0;
    while i < len {
        if bytes[i] == b'\\' && i + 1 < len {
            i += 1; // skip backslash
            if bytes[i].is_ascii_hexdigit() {
                // Hex escape: consume up to 6 hex digits
                let mut hex_count = 0;
                while i < len && hex_count < 6 && bytes[i].is_ascii_hexdigit() {
                    i += 1;
                    hex_count += 1;
                }
                // If we've reached the end of the string, the escape is unterminated
                if i == len {
                    return true;
                }
                // Consume optional single whitespace terminator
                if matches!(bytes[i], b' ' | b'\t' | b'\n') {
                    i += 1;
                }
                // Otherwise the escape is fully terminated, continue
            } else {
                // Single-char escape (e.g., \. or \@) - skip the escaped char
                i += 1;
            }
        } else {
            i += 1;
        }
    }
    false
}

/// Get the modifier for specificity bumping
fn get_modifier(selector: &str, specificity_bumped: &bool) -> String {
    if *specificity_bumped {
        format!(":where({})", selector)
    } else {
        selector.to_string()
    }
}

/// Append a CSS scope modifier to a selector string, adding a space separator
/// if needed to avoid CSS escape sequence ambiguity.
fn append_modifier(target: &mut String, modifier: &str) {
    // If the modifier starts with . or # (direct class/id, not :where()),
    // and the target ends with a CSS hex escape, we need a space separator.
    if !modifier.is_empty()
        && (modifier.starts_with('.') || modifier.starts_with('#'))
        && ends_with_css_hex_escape(target)
    {
        target.push(' ');
    }
    target.push_str(modifier);
}

/// Format a simple selector
/// Whether a `TypeSelector` is the bare universal selector `*`.
///
/// A namespaced universal — `svg|*`, `*|*` — is not: the scoping class is
/// appended to it rather than replacing it, or the `svg|` prefix would be lost.
fn is_bare_universal(sel: &Value) -> bool {
    sel.get("name").and_then(|n| n.as_str()) == Some("*")
        && sel.get("namespace").is_none_or(Value::is_null)
}

fn format_simple_selector(sel: &Value) -> String {
    format_simple_selector_with_scope(sel, "", "", None, 0, None, false, false)
}

/// The source text of a pseudo-class selector, arguments included.
///
/// The parser ends the node after the name, so an argument list has to be
/// scanned for — the same shape `PseudoElementSelector` already needed.
fn pseudo_source_text(sel: &Value, css_source: &str, css_start: Option<usize>) -> Option<String> {
    let css_start = css_start?;
    let start = sel.get("start").and_then(|s| s.as_u64())? as usize;
    let end = sel.get("end").and_then(|e| e.as_u64())? as usize;
    let src_start = start.checked_sub(css_start)?;
    let mut src_end = end.checked_sub(css_start)?;

    if let Some(remaining) = css_source.get(src_end..)
        && remaining.starts_with('(')
    {
        let mut depth = 0usize;
        for (i, c) in remaining.char_indices() {
            match c {
                '(' => depth += 1,
                ')' => {
                    depth -= 1;
                    if depth == 0 {
                        src_end += i + 1;
                        break;
                    }
                }
                _ => {}
            }
        }
    }

    (src_start < src_end)
        .then(|| css_source.get(src_start..src_end))??
        .to_string()
        .into()
}

/// Format a simple selector with optional scoping for inner selectors
/// `use_direct_class` - When true, use direct class (e.g., .svelte-xyz) instead of :where() inside :is()/:not()/:has()
/// `outer_specificity_bumped` - When true, the outer selector has already been scoped (specificity bumped),
///   so inner :has()/:is()/:not() selectors should use :where() for scoping
fn format_simple_selector_with_scope(
    sel: &Value,
    selector: &str,
    css_source: &str,
    css_start: Option<usize>,
    _depth: usize,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
    outer_specificity_bumped: bool,
) -> String {
    let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");

    match sel_type {
        "TypeSelector" | "ClassSelector" | "IdSelector" => {
            // Read these back from the source: it preserves Unicode escape sequences
            // with their terminating whitespace, and the `ns|` prefix that `name`
            // drops because matching is done on the local name alone.
            let prefix = match sel_type {
                "ClassSelector" => ".",
                "IdSelector" => "#",
                _ => "",
            };

            // Try to extract from original source first (preserves escape sequences)
            if let (Some(start), Some(end), Some(css_start)) = (
                sel.get("start").and_then(|s| s.as_u64()),
                sel.get("end").and_then(|e| e.as_u64()),
                css_start,
            ) {
                let start = start as usize;
                let end = end as usize;
                let src_start = start.saturating_sub(css_start);
                let src_end = end.saturating_sub(css_start);

                if src_end <= css_source.len() && src_start < src_end {
                    return css_source[src_start..src_end].to_string();
                }
            }

            // Fallback: reconstruct from name (may lose escape sequence whitespace)
            format!(
                "{}{}",
                prefix,
                sel.get("name").and_then(|n| n.as_str()).unwrap_or("")
            )
        }
        "AttributeSelector" => {
            // Upstream never rewrites the brackets, so the author's spacing
            // (`[ data-k ]`) survives; `name`/`matcher`/`value` cannot carry it.
            if let (Some(start), Some(end), Some(css_start)) = (
                sel.get("start").and_then(|s| s.as_u64()),
                sel.get("end").and_then(|e| e.as_u64()),
                css_start,
            ) {
                let src_start = (start as usize).saturating_sub(css_start);
                let src_end = (end as usize).saturating_sub(css_start);
                if src_end <= css_source.len()
                    && src_start < src_end
                    && css_source[src_start..src_end].starts_with('[')
                    && css_source[src_start..src_end].ends_with(']')
                {
                    return css_source[src_start..src_end].to_string();
                }
            }

            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            let matcher = sel.get("matcher").and_then(|m| m.as_str());
            let value = sel.get("value").and_then(|v| v.as_str());
            let flags = sel.get("flags").and_then(|f| f.as_str());

            let mut result = format!("[{}", name);
            if let (Some(m), Some(v)) = (matcher, value) {
                result.push_str(m);
                result.push_str(v);
            }
            if let Some(f) = flags {
                result.push(' ');
                result.push_str(f);
            }
            result.push(']');
            result
        }
        "PseudoClassSelector" => {
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");

            // Handle :is(), :not(), :has(), :where() - these take selector lists as
            // arguments and need to scope their inner selectors. Mirrors upstream
            // Svelte's `PseudoClassSelector` visitor which calls `context.next()`
            // for is/where/has/not so the inner SelectorList gets scoped.
            if let Some(args) = sel.get("args") {
                if (name == "is" || name == "not" || name == "has" || name == "where")
                    && !selector.is_empty()
                {
                    // Transform the inner selector list with appropriate scoping
                    // Per the official Svelte compiler, inner selectors inherit the
                    // specificity state from the outer context. When the outer selector
                    // has already been scoped (specificity bumped), ALL inner selectors
                    // should use :where() for scoping.
                    let inner = transform_is_not_args(
                        args,
                        sel,
                        selector,
                        css_source,
                        css_start,
                        name,
                        ctx,
                        use_direct_class,
                        outer_specificity_bumped,
                    );
                    format!(":{}({})", name, inner)
                } else if let Some(text) = pseudo_source_text(sel, css_source, css_start) {
                    // Upstream descends only into `is`/`where`/`has`/`not`; every
                    // other pseudo-class is left exactly as written. Rebuilding it
                    // from the AST loses whatever the source spelled: a selector
                    // list inside `:nth-child(2n of .a, .b)` came back as `.a.b`,
                    // because a `SelectorList`'s children concatenate without the
                    // separator that only the source still carries.
                    text
                } else {
                    format!(":{}({})", name, get_selector_text(args))
                }
            } else if let Some(text) = pseudo_source_text(sel, css_source, css_start) {
                // Same reason, for the argument-less form — plus the escapes. The
                // parser decodes `\31 st-child` to `1st-child`, so reconstructing
                // from `name` emits an identifier that no longer starts with an
                // escape and no longer means what it did.
                text
            } else {
                format!(":{}", name)
            }
        }
        "PseudoElementSelector" => {
            // For pseudo elements, use source preservation to extract the original text
            // including any arguments like ::view-transition-group(foo)
            // The parser sets end position to after the name, so we need to scan for arguments
            if let (Some(start), Some(end), Some(css_start)) = (
                sel.get("start").and_then(|s| s.as_u64()),
                sel.get("end").and_then(|e| e.as_u64()),
                css_start,
            ) {
                let start = start as usize;
                let mut end = end as usize;
                let src_start = start.saturating_sub(css_start);

                // Check if there are arguments in parentheses after the name
                let mut src_end = end.saturating_sub(css_start);
                if src_end < css_source.len() {
                    let remaining = &css_source[src_end..];
                    if remaining.starts_with('(') {
                        // Find the matching closing parenthesis
                        let mut depth = 0;
                        for (i, c) in remaining.char_indices() {
                            if c == '(' {
                                depth += 1;
                            } else if c == ')' {
                                depth -= 1;
                                if depth == 0 {
                                    end = end + i + 1; // Include the closing paren
                                    src_end = end.saturating_sub(css_start);
                                    break;
                                }
                            }
                        }
                    }
                }

                if src_end <= css_source.len() && src_start < src_end {
                    return css_source[src_start..src_end].to_string();
                }
            }

            // Fallback: reconstruct from name only (may lose arguments)
            let name = sel.get("name").and_then(|n| n.as_str()).unwrap_or("");
            format!("::{}", name)
        }
        "NestingSelector" => "&".to_string(),
        "Nth" => {
            // `:nth-child(3)` / `:nth-of-type(2n+1)` etc. The argument is
            // stored verbatim on the `Nth` node (e.g. `"3"`, `"2n+1"`).
            // Without this arm the value got dropped during scoping and
            // selectors like `.foo:nth-child(3)` were emitted as
            // `.foo.svelte-xxx:nth-child()`.
            sel.get("value")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string()
        }
        _ => String::new(),
    }
}

/// Transform the arguments of :is(), :not(), or :has() with optional :where() scoping
/// Also handles partial unused marking - individual selectors that don't match
/// any elements are commented out as /* (unused) selector*/
/// When `use_direct_class` is true, use direct class (e.g., .svelte-xyz) instead of :where()
/// When `outer_specificity_bumped` is true, the outer selector already has scoping applied,
/// so inner selectors should use :where() for scoping (overrides use_direct_class).
///
/// Note: For :not(), we never mark inner selectors as unused because :not(X) means
/// "everything that is NOT X", which is always potentially matching something.
#[allow(
    clippy::too_many_arguments,
    reason = "mirrors the upstream visitor's state"
)]
fn transform_is_not_args(
    args: &Value,
    pseudo: &Value,
    selector: &str,
    css_source: &str,
    css_start: Option<usize>,
    pseudo_name: &str,
    ctx: Option<&CssContext>,
    use_direct_class: bool,
    outer_specificity_bumped: bool,
) -> String {
    // args should be a SelectorList
    let Some(children) = args.get("children").and_then(|c| c.as_array()) else {
        return get_selector_text(args);
    };
    if children.is_empty() {
        return get_selector_text(args);
    }

    let mut used = Vec::with_capacity(children.len());
    let mut texts = Vec::with_capacity(children.len());

    for complex_selector in children.iter() {
        // :not(X) means "everything except X", so even when X matches nothing the
        // selector still applies; upstream marks every `:not` argument used.
        let is_unused = if pseudo_name == "not" {
            false
        } else {
            ctx.is_some_and(|c| branch_is_marked_unused(complex_selector, c))
        };

        used.push(!is_unused);
        texts.push(if is_unused {
            css_start
                .map(|cs| get_complex_selector_text(complex_selector, css_source, cs))
                .unwrap_or_else(|| get_selector_text(complex_selector))
        } else {
            transform_is_not_complex_selector(
                complex_selector,
                selector,
                css_source,
                pseudo_name,
                ctx,
                use_direct_class,
                outer_specificity_bumped,
            )
        });
    }

    match arg_list_source_spans(pseudo, children, css_source, css_start) {
        Some(spans) => splice_arg_list(css_source, &spans, &used, &texts),
        None => join_arg_list(&used, &texts),
    }
}

/// Source byte offsets of an argument list: `(open_paren + 1, close_paren)` plus
/// one `(start, end)` per argument. `None` when the recorded spans do not line up
/// with `css_source`, in which case the caller rebuilds the list from the AST.
fn arg_list_source_spans(
    pseudo: &Value,
    children: &[Value],
    css_source: &str,
    css_start: Option<usize>,
) -> Option<(usize, usize, Vec<(usize, usize)>)> {
    let css_start = css_start?;
    let rel = |v: &Value, key: &str| -> Option<usize> {
        let abs = v.get(key).and_then(serde_json::Value::as_u64)? as usize;
        abs.checked_sub(css_start)
    };

    let p_start = rel(pseudo, "start")?;
    let p_end = rel(pseudo, "end")?;
    if p_end > css_source.len() || p_start >= p_end {
        return None;
    }
    if !css_source.is_char_boundary(p_start) || !css_source.is_char_boundary(p_end) {
        return None;
    }
    let open = css_source[p_start..p_end].find('(')? + p_start;
    let close = p_end - 1;
    if css_source.as_bytes().get(close) != Some(&b')') || open + 1 > close {
        return None;
    }

    let mut spans = Vec::with_capacity(children.len());
    let mut cursor = open + 1;
    for child in children {
        let start = rel(child, "start")?;
        let end = rel(child, "end")?;
        if start < cursor || end < start || end > close {
            return None;
        }
        if !css_source.is_char_boundary(start) || !css_source.is_char_boundary(end) {
            return None;
        }
        spans.push((start, end));
        cursor = end;
    }

    Some((open + 1, close, spans))
}

/// Port of upstream's `SelectorList` visitor (`3-transform/css/index.js`), which
/// edits a copy of the source rather than rebuilding the list — so whatever the
/// source had between arguments (comments included) survives.
fn splice_arg_list(
    css_source: &str,
    spans: &(usize, usize, Vec<(usize, usize)>),
    used: &[bool],
    texts: &[String],
) -> String {
    let (region_start, region_end, children) = spans;
    let mut out = String::new();
    out.push_str(&css_source[*region_start..children[0].0]);

    let mut pruning = false;
    let mut has_previous_used = false;

    for i in 0..children.len() {
        if i > 0 {
            let gap = &css_source[children[i - 1].1..children[i].0];
            if used[i] == pruning {
                if pruning {
                    // Upstream scans back from the argument's start for the `,`
                    // and closes the comment on the side the previous run needs.
                    let comma = gap
                        .rfind(',')
                        .map_or(0, |c| c + usize::from(!has_previous_used));
                    out.push_str(&gap[..comma]);
                    out.push_str("*/");
                    out.push_str(&gap[comma..]);
                } else {
                    // `overwrite(last, selector.start, ' /* (unused) ')`
                    out.push_str(" /* (unused) ");
                }
            } else {
                out.push_str(gap);
            }
        } else if !used[0] {
            out.push_str("/* (unused) ");
        }

        if used[i] == pruning {
            pruning = !pruning;
        }
        out.push_str(&texts[i]);
        if !pruning && used[i] {
            has_previous_used = true;
        }
    }

    if pruning {
        out.push_str("*/");
    }
    out.push_str(&css_source[children[children.len() - 1].1..*region_end]);
    out
}

/// Rebuild an argument list from the AST, for the rare case where the recorded
/// spans cannot be resolved against `css_source`.
fn join_arg_list(used: &[bool], texts: &[String]) -> String {
    let mut result = String::new();
    for i in 0..texts.len() {
        if i > 0 {
            result.push(' ');
        }
        if used[i] {
            result.push_str(&texts[i]);
            if i + 1 < texts.len() && used[i + 1] {
                result.push(',');
            }
        } else {
            result.push_str("/* (unused) ");
            result.push_str(&texts[i]);
            if i + 1 < texts.len() {
                result.push(',');
            }
            result.push_str("*/");
        }
    }
    result
}

/// Transform a complex selector inside :is()/:not()/:has() with optional :where() scoping
/// When `use_direct_class` is true, use direct class (e.g., .svelte-xyz) instead of :where()
/// When `outer_specificity_bumped` is true, the outer selector already has scoping,
/// so inner selectors should use :where() (overrides use_direct_class).
fn transform_is_not_complex_selector(
    node: &Value,
    selector: &str,
    css_source: &str,
    pseudo_name: &str,
    ctx: Option<&CssContext>,
    _use_direct_class: bool,
    outer_specificity_bumped: bool,
) -> String {
    let mut result = String::new();

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        // For :not(), only scope if there are multiple relative selectors (complex selector with combinators)
        // For :is() and :has(), always scope
        let is_simple_selector = children.len() == 1;
        let should_scope = if pseudo_name == "not" {
            // :not() with simple selector: don't scope the inside
            // :not() with complex selector: scope with :where()
            !is_simple_selector
        } else {
            // :is() and :has() always scope their content
            true
        };

        // Per the official Svelte compiler, inner selectors inherit the specificity state
        // from the outer context. When the outer selector has already been scoped
        // (specificity bumped), ALL inner selectors should use :where() for scoping.
        // When not bumped, the FIRST inner scoped selector is itself the first scoping
        // point, so it gets the direct class (`.svelte-hash`) — mirroring upstream's
        // `modifier = selector; if (specificity.bumped) modifier = :where(modifier)`
        // where `specificity.bumped` is still false. Subsequent relative selectors then
        // switch to `:where()` (handled by the `inner_use_direct_class = false` reset at
        // the end of each iteration). This matters for standalone `:where(.foo)` /
        // `:is(.foo)` at the top of a rule: `:where(.foo.svelte-hash)`, not
        // `:where(.foo:where(.svelte-hash))`.
        let mut inner_use_direct_class = if outer_specificity_bumped {
            false // outer already bumped, so inner always uses :where()
        } else {
            // Not yet bumped: first inner scoped selector gets the direct class.
            // (`use_direct_class` from a :global context also resolves to direct here.)
            true
        };

        for relative_selector in children {
            // Get combinator
            if let Some(combinator) = relative_selector.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
                && (name != " " || !result.is_empty())
            {
                if name == " " {
                    result.push(' ');
                } else if result.is_empty() {
                    // First combinator at start of :has() argument (e.g., :has(> y))
                    // Preserve original source whitespace between combinator and selector
                    if let Some(comb_end) = combinator.get("end").and_then(|e| e.as_u64()) {
                        let comb_end = comb_end as usize;
                        // Get the gap between combinator end and first selector start
                        if let Some(selectors) = relative_selector
                            .get("selectors")
                            .and_then(|s| s.as_array())
                        {
                            if let Some(first_sel) = selectors.first() {
                                if let Some(sel_start) =
                                    first_sel.get("start").and_then(|s| s.as_u64())
                                {
                                    let sel_start = sel_start as usize;
                                    result.push_str(name);
                                    // Add whitespace matching the original source
                                    if sel_start > comb_end {
                                        for _ in 0..(sel_start - comb_end) {
                                            result.push(' ');
                                        }
                                    }
                                } else {
                                    result.push_str(name);
                                }
                            } else {
                                result.push_str(name);
                            }
                        } else {
                            result.push_str(name);
                        }
                    } else {
                        result.push_str(name);
                    }
                } else {
                    let _ = write!(result, " {} ", name);
                }
            }

            // Get selectors in this relative selector
            if let Some(selectors) = relative_selector
                .get("selectors")
                .and_then(|s| s.as_array())
            {
                // Check if this is a :global() selector
                let is_global = selectors.first().is_some_and(|s| {
                    s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                        && s.get("name").and_then(|n| n.as_str()) == Some("global")
                });

                // Check if any selector in this relative selector is a NestingSelector
                let has_nesting = selectors
                    .iter()
                    .any(|s| s.get("type").and_then(|t| t.as_str()) == Some("NestingSelector"));

                if is_global {
                    // Handle :global() - extract inner content without scoping
                    for sel in selectors {
                        if sel.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                            && sel.get("name").and_then(|n| n.as_str()) == Some("global")
                        {
                            if let Some(global_args) = sel.get("args") {
                                result.push_str(&get_selector_text(global_args));
                            }
                        } else {
                            result.push_str(&format_simple_selector(sel));
                        }
                    }
                } else if has_nesting {
                    // NestingSelector (&) inherits scoping from the parent rule.
                    // Don't add any additional scoping - just output the selectors as-is.
                    for sel in selectors {
                        result.push_str(&format_simple_selector(sel));
                    }
                } else if should_scope {
                    // Add :where() scoping for complex selectors
                    let mut selector_parts = String::new();
                    let mut last_non_pseudo_idx = None;

                    // Find the last non-pseudo selector
                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        if sel_type != "PseudoElementSelector" && sel_type != "PseudoClassSelector"
                        {
                            last_non_pseudo_idx = Some(idx);
                        }
                    }

                    // Pure-pseudo relative selectors (e.g. `:focus-visible` inside
                    // `:has(...)`) get the scoping modifier PREPENDED, mirroring the
                    // upstream printer which calls `prependRight(selector.start,
                    // modifier)` when it reaches `i === 0` and every selector was a
                    // pseudo. `:root` / `:host` are exempt, as are standalone
                    // `:is(...)` / `:where(...)` which scope their content internally.
                    if last_non_pseudo_idx.is_none() && !selector.is_empty() {
                        let skip = selectors.first().is_some_and(|s| {
                            let t = s.get("type").and_then(|t| t.as_str()).unwrap_or("");
                            let n = s.get("name").and_then(|n| n.as_str()).unwrap_or("");
                            t == "PseudoClassSelector"
                                && (n == "root"
                                    || n == "host"
                                    || ((n == "is" || n == "where") && selectors.len() == 1))
                        });
                        if !skip {
                            if inner_use_direct_class {
                                selector_parts.push_str(selector);
                            } else {
                                let _ = write!(selector_parts, ":where({})", selector);
                            }
                        }
                    }

                    for (idx, sel) in selectors.iter().enumerate() {
                        let sel_type = sel.get("type").and_then(|t| t.as_str()).unwrap_or("");
                        let is_universal = sel_type == "TypeSelector" && is_bare_universal(sel);

                        // If this is a universal selector (*) that will be replaced by :where(),
                        // don't output the * - just output the :where() directly
                        if is_universal && Some(idx) == last_non_pseudo_idx && !selector.is_empty()
                        {
                            // Replace * with just :where(selector)
                            if inner_use_direct_class {
                                selector_parts.push_str(selector);
                            } else {
                                let _ = write!(selector_parts, ":where({})", selector);
                            }
                            continue;
                        }

                        selector_parts.push_str(&format_simple_selector_with_scope(
                            sel,
                            selector,
                            css_source,
                            None,
                            1,
                            ctx,
                            inner_use_direct_class,
                            !inner_use_direct_class, // if inner_use_direct_class=false, specificity is already bumped
                        ));

                        // Add scoping after the last non-pseudo selector
                        // Use :where() to preserve specificity, unless inner_use_direct_class is true
                        if Some(idx) == last_non_pseudo_idx && !selector.is_empty() {
                            if inner_use_direct_class {
                                selector_parts.push_str(selector);
                            } else {
                                let _ = write!(selector_parts, ":where({})", selector);
                            }
                        }
                    }

                    result.push_str(&selector_parts);
                } else {
                    // For :not() with simple selector, just output without scoping
                    for sel in selectors {
                        result.push_str(&format_simple_selector(sel));
                    }
                }
            }
            // After the first scoped relative selector, switch to :where() for subsequent ones
            if should_scope {
                inner_use_direct_class = false;
            }
        }
    }

    result
}

/// Get raw selector text from a node
/// Get the original source text for a complex selector
/// Strip bare :global (no args) from a complex selector text for use in unused comments.
/// E.g., "unused :global" -> "unused", "div :global y" -> "div y"
fn strip_bare_global_from_text(
    complex_selector: &Value,
    css_source: &str,
    css_start: usize,
) -> String {
    // Get the raw text
    let raw = get_complex_selector_text(complex_selector, css_source, css_start);

    // Check if this complex selector has any bare :global relative selectors
    if let Some(children) = complex_selector.get("children").and_then(|c| c.as_array()) {
        let has_bare_global = children.iter().any(|rel| {
            rel.get("selectors")
                .and_then(|s| s.as_array())
                .is_some_and(|arr| {
                    arr.len() == 1
                        && arr.first().is_some_and(|s| {
                            s.get("type").and_then(|t| t.as_str()) == Some("PseudoClassSelector")
                                && s.get("name").and_then(|n| n.as_str()) == Some("global")
                                && s.get("args").is_none()
                        })
                })
        });

        if has_bare_global {
            // Strip " :global" and ":global " patterns
            if memchr::memmem::find(raw.as_bytes(), b":global").is_some() {
                let mut result = raw.replace(" :global", "");
                result = result.replace(":global ", "");
                result = result.replace(":global", "");
                return result.trim().to_string();
            }
        }
    }

    raw
}

fn get_complex_selector_text(node: &Value, css_source: &str, css_start: usize) -> String {
    let start = node.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
    let end = node.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;
    let src_start = start.saturating_sub(css_start);
    let src_end = end.saturating_sub(css_start);
    if src_end <= css_source.len() && src_start < src_end {
        css_source[src_start..src_end].to_string()
    } else {
        get_selector_text(node)
    }
}

fn get_selector_text(node: &Value) -> String {
    // Handle Raw type (used for pseudo element arguments like ::view-transition-group(foo))
    if node.get("type").and_then(|t| t.as_str()) == Some("Raw") {
        return node
            .get("value")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
    }

    if let Some(children) = node.get("children").and_then(|c| c.as_array()) {
        let mut result = String::new();
        for child in children {
            // Check if this is a RelativeSelector with a combinator
            if let Some(combinator) = child.get("combinator")
                && let Some(name) = combinator.get("name").and_then(|n| n.as_str())
            {
                if result.is_empty() {
                    // Leading combinator in a relative selector list (e.g.
                    // `:has(> [open])`): the `>` / `+` / `~` is significant and
                    // must be preserved. A leading descendant combinator (" ")
                    // is implicit and emitted as nothing.
                    if name != " " {
                        let _ = write!(result, "{} ", name);
                    }
                } else if name == " " {
                    // Add combinator (space for descendant, or the actual combinator)
                    result.push(' ');
                } else {
                    let _ = write!(result, " {} ", name);
                }
            }

            // Add the selectors from this relative selector or child
            if let Some(selectors) = child.get("selectors").and_then(|s| s.as_array()) {
                for sel in selectors {
                    result.push_str(&format_simple_selector(sel));
                }
            } else {
                result.push_str(&get_selector_text(child));
            }
        }
        result
    } else if let Some(selectors) = node.get("selectors").and_then(|s| s.as_array()) {
        let mut result = String::new();
        for sel in selectors {
            result.push_str(&format_simple_selector(sel));
        }
        result
    } else {
        format_simple_selector(node)
    }
}

/// Generate a raw hash string (matches Svelte's hash() function in utils.js).
/// This is the base hash without the "svelte-" prefix.
pub fn generate_raw_hash(source: &str) -> String {
    // UTF-16 code units, not code points: upstream walks the string with
    // `charCodeAt(i)`, so an astral character contributes its two surrogates
    // separately. Iterating Rust `char`s feeds one scalar instead and diverges
    // on any CSS holding a non-BMP character — `.a🙂b` scoped to `svelte-liey9s`
    // where upstream said `svelte-1pwkicr`, and the scoping class has to agree
    // byte-for-byte or nothing the selector was rewritten for still matches.
    let units: Vec<u16> = source
        .chars()
        .filter(|&c| c != '\r')
        .flat_map(|c| {
            let mut buf = [0u16; 2];
            c.encode_utf16(&mut buf).to_vec()
        })
        .collect();
    let mut hash: i32 = 5381;
    for unit in units.into_iter().rev() {
        hash = ((hash << 5).wrapping_sub(hash)) ^ i32::from(unit);
    }

    // Convert to unsigned and then to base-36
    let hash_unsigned = hash as u32;
    to_base36(hash_unsigned)
}

/// Generate a hash for CSS scoping (matches Svelte's algorithm).
pub fn generate_css_hash(source: &str) -> String {
    format!("svelte-{}", generate_raw_hash(source))
}

/// Convert a number to base-36 string
fn to_base36(mut n: u32) -> String {
    if n == 0 {
        return "0".to_string();
    }

    const DIGITS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    let mut result = Vec::new();

    while n > 0 {
        result.push(DIGITS[(n % 36) as usize]);
        n /= 36;
    }

    result.reverse();
    String::from_utf8(result).unwrap()
}
