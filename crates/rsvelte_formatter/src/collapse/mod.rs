//! Collapse pure-text elements onto one line when they fit.
//!
//! prettier-plugin-svelte reflows an element whose content is only text onto a
//! single line if the result fits within `printWidth` — e.g. a `<button>` or
//! `<p>` whose body sits on its own indented line in the source collapses to
//! `<button> click me! </button>` / `<p>hello</p>`. Whether the leading/trailing
//! whitespace survives as a single space depends on the element's CSS display:
//! block / list-item elements trim it, everything else (inline, inline-block,
//! table-cell, …) keeps one space.
//!
//! This runs as a post-pass over the already-formatted output (re-parsed so node
//! offsets and widths are exact). Elements with tag/expression/block children
//! are left to the whitespace-sensitive indent pass — only pure-text content is
//! reflowed here. Long text that would overflow stays multi-line (fill wrapping
//! is handled upstream by leaving the source breaks).

use rsvelte_core::ast::template::{Fragment, Root, TemplateNode};
use rsvelte_core::{ParseOptions, parse};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::options::FormatOptions;

mod breaks;
mod children_port;
mod collect;
mod doc_build;
mod fill;
mod hug;
mod open_tag;
mod pre;
mod state;
mod util;

use breaks::*;
use children_port::*;
use collect::*;
use doc_build::*;
use fill::*;
use hug::*;
use open_tag::*;
use pre::*;
use state::*;
use util::*;

pub(crate) use util::template_node_span;

/// Conservative necessary condition for [`collapse_pure_text_elements`] to make
/// any edit: some element (recursively) that a collapse pass could reflow. Three
/// shapes qualify — an element with a non-blank direct `Text` or `ExpressionTag`
/// child (the pure-text / interpolation collapse target), an element carrying
/// attributes whose children include another element (the children-port
/// re-asserts the wrapped-open-tag `>` placement for those), or an element whose
/// body is entirely blank `Text` (the whitespace-only-body normalization,
/// #1721/#1729, edits those even though no child is a non-blank hit). Liberal by design:
/// a false positive only runs collapse for nothing, whereas a false negative
/// would drop a real edit — so it over-approximates. Computed on the source tree,
/// which is structurally identical to the formatted output for these shapes
/// (formatting never adds/removes elements or turns text into elements).
pub(crate) fn fragment_has_collapse_candidate(fragment: &Fragment) -> bool {
    fragment.nodes.iter().any(|n| {
        // Prose/interpolation/raw-html reflow applies at ANY fragment level —
        // top-level text and `{@html}` runs are collapse targets too, not just
        // element bodies.
        match n {
            TemplateNode::Text(t) => {
                if !crate::is_blank_text(t.data.as_ref()) {
                    return true;
                }
            }
            TemplateNode::ExpressionTag(_)
            | TemplateNode::HtmlTag(_)
            | TemplateNode::RenderTag(_) => return true,
            _ => {}
        }
        if let Some((child, has_attrs)) = element_container(n) {
            let direct_hit = child
                .nodes
                .iter()
                .any(|cn| has_attrs && element_container(cn).is_some());
            let blank_only_body = !child.nodes.is_empty()
                && child.nodes.iter().all(
                    |cn| matches!(cn, TemplateNode::Text(t) if crate::is_blank_text(t.data.as_ref())),
                );
            if direct_hit || blank_only_body {
                return true;
            }
        }
        child_fragments(n)
            .iter()
            .any(|f| fragment_has_collapse_candidate(f))
    })
}

pub(crate) fn collapse_pure_text_elements(
    out: &str,
    options: &FormatOptions,
    has_collapse_candidate: bool,
) -> Result<String, FormatError> {
    // Cheap gate: skip the whole re-parse-driven collapse pass when the output
    // provably has nothing to collapse — no structural collapse candidate, no
    // `<pre>`/`<textarea>` to reformat, and no line exceeding the print width to
    // break. Ordered cheapest-first (`&&` short-circuits): the bool is free, the
    // substring checks are cheap, and the per-line width scan runs only for the
    // candidate-free minority. Conservative — see [`fragment_has_collapse_candidate`].
    if !has_collapse_candidate
        && !out.contains("<pre")
        && !out.contains("<textarea")
        && !out
            .lines()
            .any(|l| UnicodeWidthStr::width(l) > options.js.line_width.value() as usize)
    {
        return Ok(out.to_string());
    }
    // Collapse is a best-effort post-pass over the already-formatted output. If
    // that output can't be re-parsed, skip collapse and return it as-is rather
    // than failing the whole format — the JS formatter can legitimately emit
    // markup that rsvelte's (Svelte-faithful) parser rejects but the oxfmt oracle
    // accepts, e.g. stripping the parens off `{(/regex/).test(x)}` to a `{/…}`
    // expression that looks like a block close.
    // Re-parse the formatted output in the same dialect the document was formatted
    // in. A TS document (incl. one that reached TS via the formatter's force-TS
    // fallback) emits TS, so a JS-only re-parse would fail and silently skip
    // collapse; forcing TS here keeps collapse working for those files. The same
    // applies to a non-CSS `<style lang>` body, which the main parse skips rather
    // than aborting on — the re-parse must skip it too or collapse never runs.
    let parse_opts = ParseOptions {
        force_typescript: options.typescript,
        skip_non_css_lang_style: true,
        // Collapse inspects only markup structure (element/text shapes and node
        // spans), never expression `loc` objects — skip building them.
        skip_expression_loc: true,
        // Collapse never reads `<script>` / `<style>` bodies nor typed template
        // expressions (only their source spans, which survive on the lazy
        // variant), so defer the oxc script/CSS parse the re-parse never uses.
        defer_script_parse: true,
        ..ParseOptions::default()
    };
    // The children-port helpers rebuild elements without carrying `FormatOptions`;
    // expose `bracketSameLine` to them for this pass so a wrapped open tag glues
    // its `>` to the last attribute (matching prettier-plugin-svelte).
    let _bracket_same_line_guard =
        crate::children::enter_bracket_same_line(options.bracket_same_line);
    let Ok(root) = parse(out, &rsvelte_core::Allocator::default(), parse_opts) else {
        return Ok(out.to_string());
    };
    let line_width = options.js.line_width.value() as usize;

    // `tree` always reflects `result`. Each pass re-parses ONLY after it actually
    // edits the text — a pass that makes no edits leaves the string (and thus its
    // AST) unchanged, so the next pass reuses the same tree instead of paying for
    // a redundant full re-parse. The re-parse is the dominant cost of this whole
    // post-pass, so skipping the no-op ones keeps the common case to a single
    // extra parse (or zero, when nothing collapses).
    let mut edits: Vec<(u32, u32, String)> = Vec::new();
    collect(out, &root.fragment, line_width, false, options, &mut edits);
    let mut result = out.to_string();
    // `root` stays the immutable ORIGINAL (pre-collapse) tree — reused by the
    // children-port whitespace map instead of re-parsing `out`. `tree` tracks
    // `result`'s current AST: `None` means it still equals `root` (no edit yet),
    // `Some(t)` an owned re-parse after an editing pass.
    let mut tree: Option<Root> = None;
    if !edits.is_empty() {
        result = apply_edits(&result, edits);
        let Ok(t) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts) else {
            return Ok(result);
        };
        tree = Some(t);
    }

    // 1.6-th pass: run a targeted `try_collapse` sweep on inline pure-text
    // elements that were revealed by pass 1's block restructuring. Example: a
    // `<li><a href="…"\n  class="…">text</a\n></li>` whose `<a>` was not visited
    // in pass 1 because `try_break_block_multiline_content` owned the `<li>` edit.
    // After the `<li>` is re-broken, the `<a>` may need its multi-line open tag
    // hugged (`>text</a\n>` → `\n  >text</a\n>`).
    let mut edits1c: Vec<(u32, u32, String)> = Vec::new();
    collect_try_collapse_only(
        &result,
        &tree.as_ref().unwrap_or(&root).fragment,
        line_width,
        options,
        &mut edits1c,
    );
    if !edits1c.is_empty() {
        result = apply_edits(&result, edits1c);
        let Ok(t) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts) else {
            return Ok(result);
        };
        tree = Some(t);
    }

    // 1.7-th pass: targeted `try_hug_mixed` sweep for elements whose `indent`
    // now ends with `>` (non-ws prefix). Pass 1 may have hugged a container
    // element (e.g. `<defs\n    >`), causing a child element (e.g. `<clipPath>`)
    // to gain a `    >` prefix. That child's hug was blocked by the parent-edit
    // ownership in pass 1; this targeted pass applies it without re-running the
    // full layout suite (which would disturb already-correct prose wrapping).
    let mut edits1d: Vec<(u32, u32, String)> = Vec::new();
    collect_hug_mixed_non_ws_prefix(
        &result,
        &tree.as_ref().unwrap_or(&root).fragment,
        line_width,
        options,
        &mut edits1d,
    );
    if !edits1d.is_empty() {
        result = apply_edits(&result, edits1d);
        let Ok(t) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts) else {
            return Ok(result);
        };
        tree = Some(t);
    }

    // 1.8-th pass: break block-display elements that land at a non-ws `>` prefix.
    // Pass 1 may produce a Component hug like `<Component\n  ><div>…</div>…`
    // where the `<div>` is now at a `  >` prefix and overflows the line width.
    // `try_break_block_overflow` normally requires a pure-whitespace indent, so
    // this targeted sweep extracts the ws portion from `  >` and re-applies the
    // block-break logic.
    let mut edits1e: Vec<(u32, u32, String)> = Vec::new();
    collect_break_block_non_ws_prefix(
        &result,
        &tree.as_ref().unwrap_or(&root).fragment,
        line_width,
        &mut edits1e,
    );
    if !edits1e.is_empty() {
        result = apply_edits(&result, edits1e);
        let Ok(t) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts) else {
            return Ok(result);
        };
        tree = Some(t);
    }

    // 1.9-th pass: break the open tag of inline/component elements that appear on
    // an overflowing line with non-whitespace text before them. Example:
    //   `      Explore … of <span class="font-medium …">`  (>80 cols)
    // → `      Explore … of <span\n        class="font-medium …"\n      >`
    // Only fires for elements whose open tag is currently single-line and whose
    // content has leading whitespace (hug_start=false), to avoid disturbing the
    // already-correct hug layouts from earlier passes.
    let mut edits1f: Vec<(u32, u32, String)> = Vec::new();
    collect_break_inline_open_tag(
        &result,
        &tree.as_ref().unwrap_or(&root).fragment,
        line_width,
        &mut edits1f,
    );
    if !edits1f.is_empty() {
        result = apply_edits(&result, edits1f);
        let Ok(t) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts) else {
            return Ok(result);
        };
        tree = Some(t);
    }

    // 1.95-th pass: re-collapse broken open tags whose single-line form now fits
    // at their current column. Undoes incorrect pass-1 breaks that were caused
    // by a long preceding line; after pass 1.9 has broken inline elements to
    // shorten those lines, the previously-broken sibling open tag may now fit.
    let mut edits1g: Vec<(u32, u32, String)> = Vec::new();
    collect_recollapse_open_tag(
        &result,
        &tree.as_ref().unwrap_or(&root).fragment,
        line_width,
        &mut edits1g,
    );
    if !edits1g.is_empty() {
        result = apply_edits(&result, edits1g);
        let Ok(t) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts) else {
            return Ok(result);
        };
        tree = Some(t);
    }

    // Second pass: the hug/break edits above may leave a long expression mustache
    // on an overflowing line (a hugged element's trailing `{a.b().c()}`).
    // Member-chain-break those in place — this can't run in the first pass
    // because the hug edit that creates the overflowing line owns the element and
    // suppresses recursion into it.
    let mut edits2: Vec<(u32, u32, String)> = Vec::new();
    collect_content_tag_breaks(
        &result,
        &tree.as_ref().unwrap_or(&root).fragment,
        line_width,
        options,
        &mut edits2,
    );
    // `tree` is the AST of `result` unless this last pass edited the text.
    let mut tree_is_current = true;
    if !edits2.is_empty() {
        // `tree` borrows `result` (its parse source); drop it before reassigning
        // `result`. It is never read past here in this branch — `tree_is_current`
        // is now false, so the read below falls to the re-parsed AST.
        tree = None;
        result = apply_edits(&result, edits2);
        tree_is_current = false;
    }

    // Final children-port pass: re-assert the faithful prettier-plugin-svelte
    // layout (`children.rs`) for its gated shapes. The earlier breaking passes
    // (1.6–2) operate on the re-parsed output without knowing which elements the
    // children port owns, so they can re-break an already-correct (intentionally
    // overflowing) prose line — e.g. break an inline `<a>`'s open tag on a 93-col
    // line that the port deliberately keeps whole. Running the port LAST gives it
    // the final word: it rebuilds each element from the AST and emits a corrected
    // edit (or a no-op when the layout is already right). It only needs to
    // re-parse when the pass above actually rewrote the text — otherwise `tree`
    // still describes `result` exactly, and a fresh parse would rebuild an
    // identical AST.
    let reparsed = (!tree_is_current)
        .then(|| parse(&result, &rsvelte_core::Allocator::default(), parse_opts).ok())
        .flatten();
    if let Some(root_cp) = reparsed
        .as_ref()
        .or(tree_is_current.then(|| tree.as_ref().unwrap_or(&root)))
    {
        // Build the intermediate→original text map so the port classifies text
        // whitespace from the pre-collapse source (`out`). Only needed when
        // collapse actually rewrote the text; otherwise the intermediate IS the
        // original. The original tree is `root` (the first parse), reused here so
        // no extra parse of `out` is paid.
        let mut orig_map = std::collections::HashMap::new();
        if result.as_str() != out {
            build_orig_text_map(
                &root_cp.fragment.nodes,
                out,
                &root.fragment.nodes,
                &mut orig_map,
            );
        }
        let mut edits_cp: Vec<(u32, u32, String)> = Vec::new();
        with_orig_text(orig_map, || {
            collect_children_port_only(
                &result,
                &root_cp.fragment,
                line_width,
                options,
                &mut edits_cp,
            );
        });
        if !edits_cp.is_empty() {
            result = apply_edits(&result, edits_cp);
        }
    }

    // Third pass: `<pre>` / `<textarea>` whose content contains a block. rsvelte
    // otherwise leaves their whole subtree verbatim, but oxfmt formats the block
    // bodies (space-indented) + embedded JS while keeping element-direct
    // whitespace as raw tabs. Re-format those subtrees with that hybrid rule.
    // This pass only ever touches `<pre>`/`<textarea>`, so skip its re-parse
    // entirely unless one is present in the output.
    if (result.contains("<pre") || result.contains("<textarea"))
        && let Ok(root3) = parse(&result, &rsvelte_core::Allocator::default(), parse_opts)
    {
        let mut edits3: Vec<(u32, u32, String)> = Vec::new();
        collect_pre_block_reformats(&result, &root3.fragment, 0, options, &mut edits3);
        if !edits3.is_empty() {
            result = apply_edits(&result, edits3);
        }
    }
    Ok(result)
}

#[cfg(test)]
mod tests;
