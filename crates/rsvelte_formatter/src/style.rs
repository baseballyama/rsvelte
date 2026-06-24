//! `<style>` block formatting.
//!
//! `rsvelte_formatter` doesn't ship its own CSS engine. Instead it
//! exposes a callback on [`crate::FormatOptions::style_formatter`] that
//! receives the body and the lang (`css` / `scss` / `less` / ...). The
//! `rsvelte-fmt` CLI wires this up to spawn
//! `oxfmt --stdin-filepath style.<lang>`, so CSS formatting goes through
//! the same engine `oxfmt` uses for standalone files.
//!
//! When no callback is set the style body is left verbatim.

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::template::{Fragment, TemplateNode};
use unicode_width::UnicodeWidthStr;

use crate::error::FormatError;
use crate::options::FormatOptions;

/// Format the content of `<style>` elements that appear *inside* the markup
/// (e.g. a nested `<div><style>…</style></div>` or a `<style>` in
/// `<svelte:head>`) — the top-level component `<style>` is hoisted into
/// `root.css` and handled by [`collect_style_edit`]. Each nested style's raw CSS
/// is formatted through the same callback and re-indented to the element's depth.
pub(crate) fn collect_nested_style_edits(
    source: &str,
    fragment: &Fragment,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    if options.style_formatter.is_none() {
        return Ok(());
    }
    walk_nested_style(source, fragment, 0, options, edits)
}

fn walk_nested_style(
    source: &str,
    fragment: &Fragment,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    for node in &fragment.nodes {
        let d = depth + 1;
        match node {
            TemplateNode::RegularElement(e) if e.name.as_str() == "style" => {
                format_nested_style(source, e.start, e.end, depth, options, edits)?;
            }
            TemplateNode::RegularElement(e) if e.name.as_str() == "script" => {
                if let Some(edit) =
                    crate::script::format_nested_script(source, e.start, e.end, depth, options)?
                {
                    edits.push(edit);
                }
            }
            TemplateNode::RegularElement(e) => {
                walk_nested_style(source, &e.fragment, d, options, edits)?
            }
            TemplateNode::Component(c) => {
                walk_nested_style(source, &c.fragment, d, options, edits)?
            }
            TemplateNode::TitleElement(t) => {
                walk_nested_style(source, &t.fragment, d, options, edits)?
            }
            TemplateNode::SlotElement(s) => {
                walk_nested_style(source, &s.fragment, d, options, edits)?
            }
            TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteBoundary(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => {
                walk_nested_style(source, &s.fragment, d, options, edits)?
            }
            TemplateNode::SvelteComponent(c) => {
                walk_nested_style(source, &c.fragment, d, options, edits)?
            }
            TemplateNode::SvelteElement(e) => {
                walk_nested_style(source, &e.fragment, d, options, edits)?
            }
            TemplateNode::IfBlock(blk) => {
                walk_nested_style(source, &blk.consequent, d, options, edits)?;
                if let Some(alt) = &blk.alternate {
                    walk_nested_style(source, alt, d, options, edits)?;
                }
            }
            TemplateNode::EachBlock(blk) => {
                walk_nested_style(source, &blk.body, d, options, edits)?;
                if let Some(fb) = &blk.fallback {
                    walk_nested_style(source, fb, d, options, edits)?;
                }
            }
            TemplateNode::AwaitBlock(blk) => {
                for f in [&blk.pending, &blk.then, &blk.catch].into_iter().flatten() {
                    walk_nested_style(source, f, d, options, edits)?;
                }
            }
            TemplateNode::KeyBlock(blk) => {
                walk_nested_style(source, &blk.fragment, d, options, edits)?
            }
            TemplateNode::SnippetBlock(blk) => {
                walk_nested_style(source, &blk.body, d, options, edits)?
            }
            _ => {}
        }
    }
    Ok(())
}

fn format_nested_style(
    source: &str,
    start: u32,
    end: u32,
    depth: usize,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let Some(formatter) = &options.style_formatter else {
        return Ok(());
    };
    let block = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("nested <style> span out of bounds".into()))?;
    let Some(open_end) = block.find('>').map(|i| i + 1) else {
        return Ok(());
    };
    let Some(close_start) = block.rfind("</style") else {
        return Ok(());
    };
    if close_start < open_end {
        return Ok(());
    }
    let body = &block[open_end..close_start];
    if body.trim().is_empty() {
        return Ok(());
    }
    // The element renders at `depth` levels of the configured indent unit (the
    // indent pass normalizes the tag's own indentation to that), so derive the
    // body indent from the depth — not the source whitespace (which may be tabs).
    let unit = indent_unit(options);
    let tag_indent = unit.repeat(depth);
    let body_indent = format!("{tag_indent}{unit}");
    let width = css_width(options, &body_indent);
    let dedented = dedent(body);
    let formatted = formatter(&dedented, "css", width).map_err(FormatError::StyleFormat)?;
    let reindented = reindent(&formatted, &body_indent);
    let spliced = format!("\n{reindented}\n{tag_indent}");
    edits.push((start + open_end as u32, start + close_start as u32, spliced));
    Ok(())
}

/// Push one edit replacing the `<style>` body with the formatter
/// callback's output. No-op when no callback is configured.
pub(crate) fn collect_style_edit(
    source: &str,
    css: &StyleSheet,
    options: &FormatOptions,
    edits: &mut Vec<(u32, u32, String)>,
) -> Result<(), FormatError> {
    let Some(formatter) = &options.style_formatter else {
        return Ok(());
    };
    let body = css.content.styles.as_str();
    if body.trim().is_empty() {
        return Ok(());
    }
    let lang = detect_lang(css);

    // Strip the block's existing indentation before handing the body to the
    // formatter. oxfmt normalizes declaration indentation but preserves the
    // interior of multi-line tokens (block comments, multi-line strings)
    // verbatim — so if we re-indent those lines below without first removing
    // the indentation a previous run already added, every pass adds another
    // level and idempotency breaks. Dedenting makes the formatter input
    // identical across runs.
    // `oxfmt` formats the body as a standalone file: base indent 0, with no
    // surrounding newlines. Inside `<style>` each line must sit one level
    // deeper than the tag and on its own lines, so re-indent before splicing
    // it back into the content span (which excludes the `<style>`/`</style>`
    // tags). Without this the formatted CSS is glued onto the open tag
    // (`<style>.foo {`) with no indentation.
    let tag_indent = leading_indent(source, css.start);
    let body_indent = format!("{tag_indent}{}", indent_unit(options));
    let width = css_width(options, &body_indent);
    let dedented = dedent(body);
    let formatted = formatter(&dedented, &lang, width).map_err(FormatError::StyleFormat)?;
    let reindented = reindent(&formatted, &body_indent);
    let spliced = format!("\n{reindented}\n{tag_indent}");

    edits.push((css.content.start, css.content.end, spliced));
    Ok(())
}

/// Leading whitespace of the line containing `pos`, but only when everything
/// before `pos` on that line is whitespace (the `<style>` tag starts its own
/// line, as it virtually always does). Otherwise assume no indent.
fn leading_indent(source: &str, pos: u32) -> &str {
    let pos = pos as usize;
    let line_start = source[..pos].rfind('\n').map_or(0, |i| i + 1);
    let seg = &source[line_start..pos];
    if seg.bytes().all(|b| b == b' ' || b == b'\t') {
        seg
    } else {
        ""
    }
}

/// One indent level as configured (a tab, or N spaces).
fn indent_unit(options: &FormatOptions) -> String {
    if options.js.indent_style.is_tab() {
        "\t".to_string()
    } else {
        " ".repeat(options.js.indent_width.value() as usize)
    }
}

/// Remove the common leading-whitespace prefix shared by every non-blank
/// line. Blank lines are emptied. Used to canonicalize a `<style>` body before
/// formatting so re-runs feed the formatter identical input regardless of the
/// indentation a previous pass added (idempotency).
///
/// Lines that sit *inside* a multi-line `/* … */` comment are left verbatim:
/// their leading whitespace is part of the comment token, which oxfmt (like
/// prettier) preserves byte-for-byte, so dedenting them would permanently
/// strip indentation the oracle keeps.
/// The print width to format a `<style>` body at: the global print width minus
/// the body's indentation (visual width), floored so a deeply nested block still
/// gets a usable width.
fn css_width(options: &FormatOptions, body_indent: &str) -> usize {
    let full = options.js.line_width.value() as usize;
    full.saturating_sub(UnicodeWidthStr::width(body_indent))
        .max(20)
}

fn dedent(s: &str) -> String {
    let cont = comment_continuation_flags(s);
    let lines: Vec<&str> = s.lines().collect();
    let mut min_indent = usize::MAX;
    for (l, &c) in lines.iter().zip(&cont) {
        if !c && !l.trim().is_empty() {
            min_indent = min_indent.min(l.len() - l.trim_start().len());
        }
    }
    let min_indent = if min_indent == usize::MAX {
        0
    } else {
        min_indent
    };
    let mut out = Vec::with_capacity(lines.len());
    for (l, &c) in lines.iter().zip(&cont) {
        if c {
            out.push((*l).to_string());
        } else if l.trim().is_empty() {
            out.push(String::new());
        } else {
            out.push(l[min_indent..].to_string());
        }
    }
    out.join("\n")
}

/// Prefix every non-empty line of `s` with `indent`, dropping any trailing
/// newline (the splice adds its own surrounding newlines). Lines inside a
/// multi-line `/* … */` comment are left verbatim (the inverse of `dedent`).
///
/// Exposed for the `rsvelte-fmt` CLI: its batched `<style>` path collects raw
/// bodies during the format pass (returning a placeholder) and formats them in
/// one oxfmt call afterwards, so it must re-indent the formatted CSS with the
/// *same* routine the single-file/stdin path uses here to stay byte-identical.
pub fn reindent(s: &str, indent: &str) -> String {
    let trimmed = s.trim_end_matches('\n');
    let cont = comment_continuation_flags(trimmed);
    let mut out = Vec::new();
    for (line, &c) in trimmed.lines().zip(&cont) {
        if c || line.is_empty() {
            out.push(line.to_string());
        } else {
            out.push(format!("{indent}{line}"));
        }
    }
    out.join("\n")
}

/// For each line, whether it *starts* already inside a `/* … */` block comment
/// — i.e. it is a continuation line whose leading whitespace belongs to the
/// comment token. The line that opens the comment is not a continuation (its
/// `/*` sits at a code position that should be re-indented normally).
fn comment_continuation_flags(s: &str) -> Vec<bool> {
    let mut flags = Vec::new();
    let mut in_comment = false;
    for line in s.lines() {
        flags.push(in_comment);
        let bytes = line.as_bytes();
        let mut i = 0;
        while i + 1 < bytes.len() {
            if !in_comment && bytes[i] == b'/' && bytes[i + 1] == b'*' {
                in_comment = true;
                i += 2;
            } else if in_comment && bytes[i] == b'*' && bytes[i + 1] == b'/' {
                in_comment = false;
                i += 2;
            } else {
                i += 1;
            }
        }
    }
    flags
}

/// Read the `<style lang="...">` attribute out of the JSON-encoded
/// attribute list. Defaults to `"css"`.
fn detect_lang(css: &StyleSheet) -> String {
    for attr in &css.attributes {
        let name = attr.get("name").and_then(|v| v.as_str());
        if name == Some("lang") {
            // Value is either a string ("scss"), `true` (boolean attr),
            // or a sequence of value parts. Handle the common literal
            // string case.
            if let Some(value) = attr.get("value") {
                if let Some(s) = value.as_str() {
                    return s.to_string();
                }
                if let Some(arr) = value.as_array() {
                    for part in arr {
                        if let Some(t) = part.get("data").and_then(|v| v.as_str()) {
                            return t.to_string();
                        }
                        if let Some(t) = part.get("raw").and_then(|v| v.as_str()) {
                            return t.to_string();
                        }
                    }
                }
            }
        }
    }
    "css".to_string()
}
