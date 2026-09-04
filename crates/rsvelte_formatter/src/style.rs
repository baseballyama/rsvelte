//! `<style>` block formatting.
//!
//! `rsvelte_formatter` exposes a callback on
//! [`crate::FormatOptions::style_formatter`] that receives the body and the lang
//! (`css` / `scss` / `less` / ...). The `rsvelte-fmt` CLI uses the in-process
//! [`crate::native_style_formatter`] by default and swaps in a standalone
//! `oxfmt --stdin-filepath style.<lang>` callback under `--no-native-css`.
//!
//! When no callback is set the style body is left verbatim.

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::template::{Fragment, TemplateNode};

use crate::error::FormatError;
use crate::options::FormatOptions;
use crate::width::{VisualWidth, tab_width};

/// Format the content of `<style>` elements that appear *inside* the markup
/// (e.g. a nested `<div><style>…</style></div>` or a `<style>` in
/// `<svelte:head>`) — the top-level component `<style>` is hoisted into
/// `root.css` and handled by [`collect_style_edit`]. Each nested style's raw CSS
/// is formatted through the same callback and re-indented to the element's depth.
pub fn collect_nested_style_edits(
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
                walk_nested_style(source, &e.fragment, d, options, edits)?;
            }
            TemplateNode::Component(c) => {
                walk_nested_style(source, &c.fragment, d, options, edits)?;
            }
            TemplateNode::TitleElement(t) => {
                walk_nested_style(source, &t.fragment, d, options, edits)?;
            }
            TemplateNode::SlotElement(s) => {
                walk_nested_style(source, &s.fragment, d, options, edits)?;
            }
            TemplateNode::SvelteHead(s)
            | TemplateNode::SvelteBody(s)
            | TemplateNode::SvelteDocument(s)
            | TemplateNode::SvelteFragment(s)
            | TemplateNode::SvelteBoundary(s)
            | TemplateNode::SvelteOptions(s)
            | TemplateNode::SvelteSelf(s)
            | TemplateNode::SvelteWindow(s) => {
                walk_nested_style(source, &s.fragment, d, options, edits)?;
            }
            TemplateNode::SvelteComponent(c) => {
                walk_nested_style(source, &c.fragment, d, options, edits)?;
            }
            TemplateNode::SvelteElement(e) => {
                walk_nested_style(source, &e.fragment, d, options, edits)?;
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
                walk_nested_style(source, &blk.fragment, d, options, edits)?;
            }
            TemplateNode::SnippetBlock(blk) => {
                walk_nested_style(source, &blk.body, d, options, edits)?;
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
    // `svelteIndentScriptAndStyle` (default true): when disabled the body sits at
    // the tag's own indent with no extra level.
    let body_indent = if options.indent_script_and_style {
        format!("{tag_indent}{unit}")
    } else {
        tag_indent.clone()
    };
    let width = css_width(options, &body_indent);
    let dedented = dedent(body, &unit);
    let css_output = formatter(&dedented, "css", width).map_err(FormatError::StyleFormat)?;
    let reindented =
        restore_comment_adjacent_selector_indent(body, reindent(&css_output, &body_indent));
    let spliced = format!("\n{reindented}\n{tag_indent}");
    edits.push((
        start + crate::source_offset(open_end),
        start + crate::source_offset(close_start),
        spliced,
    ));
    Ok(())
}

/// Push one edit replacing the `<style>` body with the formatter
/// callback's output. No-op when no callback is configured.
pub fn collect_style_edit(
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

    // Indented-syntax preprocessor dialects (sass, stylus) are not brace-based
    // CSS — oxfmt cannot parse them and the oxfmt / prettier-plugin-svelte
    // oracle leaves their bodies byte-for-byte verbatim. Emit no edit so the
    // raw body is preserved exactly. Brace-based dialects (scss, less, postcss)
    // fall through to the formatter callback below, which oxfmt formats.
    if matches!(
        lang.to_ascii_lowercase().as_str(),
        "sass" | "stylus" | "styl"
    ) {
        return Ok(());
    }

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
    // `svelteIndentScriptAndStyle` (default true): when disabled the body sits at
    // the tag's own indent (column 0 for a top-level `<style>`).
    let body_indent = if options.indent_script_and_style {
        format!("{tag_indent}{}", indent_unit(options))
    } else {
        tag_indent.to_string()
    };
    let width = css_width(options, &body_indent);
    let dedented = dedent(body, &indent_unit(options));
    let css_output = formatter(&dedented, &lang, width).map_err(FormatError::StyleFormat)?;
    let reindented =
        restore_comment_adjacent_selector_indent(body, reindent(&css_output, &body_indent));
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
    full.saturating_sub(body_indent.visual_width(tab_width(options)))
        .max(20)
}

fn dedent(s: &str, unit: &str) -> String {
    let cont = comment_continuation_flags(s);
    let lines: Vec<&str> = s.lines().collect();
    let mut min_indent = usize::MAX;
    for (l, &c) in lines.iter().zip(&cont) {
        if !c && !l.trim().is_empty() {
            min_indent = min_indent.min(leading_ascii_ws(l));
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
            out.push(normalize_leading_tabs(
                l.get(min_indent..).unwrap_or(l),
                unit,
            ));
        }
    }
    out.join("\n")
}

/// Byte length of a line's leading indentation, counting only ASCII space and
/// tab. A multi-byte Unicode whitespace char (e.g. U+00A0) never contributes,
/// so the returned offset always lands on a char boundary — slicing at it can't
/// split a code point (`str::trim_start` would strip such chars and yield a
/// byte length that slices mid-character).
fn leading_ascii_ws(l: &str) -> usize {
    l.bytes().take_while(|&b| b == b' ' || b == b'\t').count()
}

/// Re-express a line's leading tabs as the configured indent unit. The CSS
/// engine prints code with that unit, so a leading tab reaching here was passed
/// through verbatim from the source — a rejected body returned unchanged, or a
/// comment's own leading whitespace inside a declaration value. Prepending the
/// block indent to it would emit spaces and tabs on one line, which honours
/// neither `useTabs` setting.
fn normalize_leading_tabs(line: &str, unit: &str) -> String {
    let ws = leading_ascii_ws(line);
    if !line.as_bytes()[..ws].contains(&b'\t') {
        return line.to_string();
    }
    let mut out = String::with_capacity(line.len());
    for &b in &line.as_bytes()[..ws] {
        if b == b'\t' {
            out.push_str(unit);
        } else {
            out.push(' ');
        }
    }
    out.push_str(&line[ws..]);
    out
}

/// prettier-plugin-svelte keeps the source indentation from a block comment
/// between comma-separated selectors through the selector that opens the rule.
/// The standalone CSS printer normalizes those lines, so restore only that
/// lexical prelude after formatting. Matching by content occurrence prevents a
/// repeated selector in an earlier rule from receiving the later rule's indent.
fn restore_comment_adjacent_selector_indent(source: &str, formatted: String) -> String {
    let lines: Vec<&str> = source.lines().collect();
    let mut preserve = vec![false; lines.len()];
    let bytes = source.as_bytes();
    let mut line = 0;
    let mut quote = None;
    let mut escaped = false;
    let mut in_comment = false;
    let mut paren_depth = 0_u32;
    let mut bracket_depth = 0_u32;
    let mut first_code = None;
    let mut comma_line = None;
    let mut comment_line = None;
    let mut i = 0;

    while i < bytes.len() {
        let byte = bytes[i];
        if byte == b'\n' {
            line += 1;
        }

        if in_comment {
            if byte == b'*' && bytes.get(i + 1) == Some(&b'/') {
                in_comment = false;
                i += 2;
            } else {
                i += 1;
            }
            continue;
        }

        if let Some(delimiter) = quote {
            if escaped {
                escaped = false;
            } else if byte == b'\\' {
                escaped = true;
            } else if byte == delimiter {
                quote = None;
            }
            i += 1;
            continue;
        }

        if byte == b'/' && bytes.get(i + 1) == Some(&b'*') {
            if comma_line.is_some() && comment_line.is_none() {
                comment_line = Some(line);
            }
            in_comment = true;
            i += 2;
            continue;
        }

        if !byte.is_ascii_whitespace() && first_code.is_none() {
            first_code = Some(byte);
        }

        match byte {
            b'\'' | b'"' => quote = Some(byte),
            b'(' => paren_depth += 1,
            b')' => paren_depth = paren_depth.saturating_sub(1),
            b'[' => bracket_depth += 1,
            b']' => bracket_depth = bracket_depth.saturating_sub(1),
            b',' if paren_depth == 0 && bracket_depth == 0 => comma_line = Some(line),
            b'{' if paren_depth == 0 && bracket_depth == 0 => {
                if first_code != Some(b'@')
                    && let (Some(comma), Some(comment)) = (comma_line, comment_line)
                {
                    let start = if comment > comma {
                        comment
                    } else {
                        comment + 1
                    };
                    for keep in preserve.iter_mut().take(line + 1).skip(start) {
                        *keep = true;
                    }
                }
                first_code = None;
                comma_line = None;
                comment_line = None;
            }
            b'}' | b';' if paren_depth == 0 && bracket_depth == 0 => {
                first_code = None;
                comma_line = None;
                comment_line = None;
            }
            _ => {}
        }
        i += 1;
    }

    let mut source_occurrences = std::collections::HashMap::new();
    let preserved: Vec<(&str, usize, &str)> = lines
        .iter()
        .enumerate()
        .filter_map(|(index, line)| {
            let content = line.trim_start();
            let occurrence = source_occurrences.entry(content).or_insert(0_usize);
            let current = *occurrence;
            *occurrence += 1;
            preserve[index].then_some((content, current, &line[..leading_ascii_ws(line)]))
        })
        .collect();
    if preserved.is_empty() {
        return formatted;
    }

    let mut restored = String::with_capacity(formatted.len());
    let mut formatted_occurrences = std::collections::HashMap::new();
    for line in formatted.split_inclusive('\n') {
        let without_lf = line.strip_suffix('\n').unwrap_or(line);
        let content = without_lf.strip_suffix('\r').unwrap_or(without_lf);
        let newline = &line[content.len()..];
        let trimmed = content.trim_start();
        let occurrence = formatted_occurrences.entry(trimmed).or_insert(0_usize);
        let current = *occurrence;
        *occurrence += 1;
        if let Some((_, _, indent)) = preserved
            .iter()
            .find(|(selector, ordinal, _)| trimmed == *selector && current == *ordinal)
        {
            restored.push_str(indent);
            restored.push_str(trimmed);
            restored.push_str(newline);
        } else {
            restored.push_str(line);
        }
    }
    restored
}

/// Prefix every non-empty line of `s` with `indent`, dropping any trailing
/// newline (the splice adds its own surrounding newlines).
///
/// Lines inside a multi-line `/* … */` comment are left verbatim (the inverse of `dedent`).
///
/// Exposed for the `rsvelte-fmt` CLI: its batched `<style>` path collects raw
/// bodies during the format pass (returning a placeholder) and formats them in
/// one oxfmt call afterwards, so it must re-indent the formatted CSS with the
/// *same* routine the single-file/stdin path uses here to stay byte-identical.
#[must_use]
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

#[cfg(test)]
mod tests {
    use super::{dedent, restore_comment_adjacent_selector_indent};

    #[test]
    fn dedent_handles_multibyte_leading_whitespace() {
        // Line 1 has two ASCII spaces; line 2 has one space then U+00A0 (a
        // two-byte code point). The old measurement used `str::trim_start`,
        // which strips the U+00A0 as whitespace, so line 2's indent came back as
        // three bytes and min_indent as two — and `l[2..]` on line 2 sliced the
        // middle of U+00A0 and panicked. Counting only ASCII space/tab keeps
        // min_indent at one, a valid char boundary on both lines.
        let out = dedent("  a\n \u{a0}b", "  ");
        assert_eq!(out, " a\n\u{a0}b");
    }

    #[test]
    fn dedent_reexpresses_residual_tabs_as_the_indent_unit() {
        // `min_indent` is a byte count, so a tab-indented body loses exactly one
        // tab and the deeper levels keep theirs. Whatever the CSS engine passes
        // through verbatim then carries a tab into a space-indented block.
        assert_eq!(dedent("\ta {\n\t\tb: c;\n\t}", "  "), "a {\n  b: c;\n}");
        // With a tab unit the same input is unchanged.
        assert_eq!(dedent("\ta {\n\t\tb: c;\n\t}", "\t"), "a {\n\tb: c;\n}");
        // Space-indented input never reaches the conversion.
        assert_eq!(dedent("  a {\n    b: c;\n  }", "  "), "a {\n  b: c;\n}");
    }

    #[test]
    fn restores_source_indent_after_a_commented_selector_separator() {
        let source = "  .a,\n\t/* c */\n\t.b {\n    color: red;\n  }";
        let formatted = "  .a,\n  /* c */\n  .b {\n    color: red;\n  }".to_string();
        assert_eq!(
            restore_comment_adjacent_selector_indent(source, formatted),
            "  .a,\n\t/* c */\n\t.b {\n    color: red;\n  }"
        );
    }

    #[test]
    fn does_not_restore_declaration_comments_or_an_earlier_duplicate_selector() {
        let source =
            "  .b { color: red, /* value */ blue; }\n  .a,\n\t/* c */\n\t.b { color: red; }";
        let formatted =
            "  .b {\n    color: red, /* value */ blue;\n  }\n  .a,\n  /* c */\n  .b { color: red; }\n"
                .to_string();
        assert_eq!(
            restore_comment_adjacent_selector_indent(source, formatted),
            "  .b {\n    color: red, /* value */ blue;\n  }\n  .a,\n\t/* c */\n\t.b { color: red; }\n"
        );
    }
}
