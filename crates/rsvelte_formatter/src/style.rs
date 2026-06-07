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

use crate::error::FormatError;
use crate::options::FormatOptions;

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
    let dedented = dedent(body);
    let formatted = formatter(&dedented, &lang).map_err(FormatError::StyleFormat)?;

    // `oxfmt` formats the body as a standalone file: base indent 0, with no
    // surrounding newlines. Inside `<style>` each line must sit one level
    // deeper than the tag and on its own lines, so re-indent before splicing
    // it back into the content span (which excludes the `<style>`/`</style>`
    // tags). Without this the formatted CSS is glued onto the open tag
    // (`<style>.foo {`) with no indentation.
    let tag_indent = leading_indent(source, css.start);
    let body_indent = format!("{tag_indent}{}", indent_unit(options));
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
fn dedent(s: &str) -> String {
    let min_indent = s
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.len() - l.trim_start().len())
        .min()
        .unwrap_or(0);
    s.lines()
        .map(|l| {
            if l.trim().is_empty() {
                ""
            } else {
                &l[min_indent..]
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// Prefix every non-empty line of `s` with `indent`, dropping any trailing
/// newline (the splice adds its own surrounding newlines).
fn reindent(s: &str, indent: &str) -> String {
    s.trim_end_matches('\n')
        .lines()
        .map(|line| {
            if line.is_empty() {
                String::new()
            } else {
                format!("{indent}{line}")
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
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
