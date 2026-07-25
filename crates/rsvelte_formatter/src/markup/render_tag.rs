use oxc_formatter::JsFormatOptions;

use super::util::indent_str;

pub(super) fn render_one_line(tag_name: &str, attrs: &[String], self_closing: bool) -> String {
    let mut out = String::with_capacity(tag_name.len() + 16);
    out.push('<');
    out.push_str(tag_name);
    for a in attrs {
        out.push(' ');
        out.push_str(a);
    }
    if self_closing {
        out.push_str(" />");
    } else {
        out.push('>');
    }
    out
}

pub(super) fn render_multi_line(
    tag_name: &str,
    attrs: &[String],
    self_closing: bool,
    depth: usize,
    js_opts: &JsFormatOptions,
    hug_open: bool,
    bracket_same_line: bool,
) -> String {
    let inner_indent = indent_str(depth + 1, js_opts);
    let outer_indent = indent_str(depth, js_opts);
    let mut out = String::with_capacity(tag_name.len() + attrs.len() * 16);
    out.push('<');
    out.push_str(tag_name);
    for a in attrs {
        out.push('\n');
        out.push_str(&inner_indent);
        // A multi-line attribute value (arrow handler, `bind:` getter/setter,
        // …) is formatted at column 0 by the delegated expression formatter;
        // re-indent its continuation lines to the attribute column so they
        // align under the attribute instead of collapsing to column 0 (#692).
        // `skip_first` leaves the value's first line alone — the attribute
        // indent was already emitted before it.
        //
        // A quoted string value (`style="…\n…"` / `class="…"`) is HTML text, not
        // formatter output: its interior whitespace is literal, so it's emitted
        // verbatim and must NOT be re-indented. (A wrapped interpolation inside
        // such a value already had its continuation lines re-indented to the
        // attribute column by `render_attribute_value_sequence`.)
        if is_string_value_attr(a) {
            out.push_str(a);
        } else if is_verbatim_interpolation_value(a) {
            // Interior whitespace between interpolations is literal HTML the oracle
            // keeps verbatim; re-indenting it would double-count the source indent.
            out.push_str(a);
        } else if a.starts_with("/*") {
            // Block comment sourced verbatim from the open-tag region: its
            // interior lines already carry the original source indentation
            // (tabs/spaces from the author). Adding `inner_indent` on top would
            // double-indent every continuation line, producing mixed
            // spaces+tabs (#A). Emit verbatim — the leading `inner_indent` was
            // already pushed above.
            out.push_str(a);
        } else {
            // For expression-led attributes that also contain raw HTML text
            // continuation lines (tab-indented), re-indent only the JS expression
            // part and keep the raw text verbatim.
            out.push_str(&reindent_attr_with_raw_text(a, &inner_indent));
        }
    }
    if hug_open && !self_closing && !attrs.is_empty() {
        // Whitespace-sensitive inline content: glue the `>` to the last
        // attribute line so no significant whitespace is injected before the
        // content (#798). The collapse pass (`try_hug_mixed`) later decides
        // whether to keep it glued or move it to a new indented line, depending
        // on whether the resulting line would overflow the print width.
        out.push('>');
    } else if hug_open && !self_closing {
        // No attributes but the element still needs the `>` on the
        // content's line (overflow hug): emit `<tagname\n{inner_indent}>`.
        out.push('\n');
        out.push_str(&inner_indent);
        out.push('>');
    } else if bracket_same_line && !attrs.is_empty() {
        // `bracketSameLine`: keep the closer glued to the last attribute line
        // instead of dropping it to its own line. Self-closing keeps the space
        // (` />`); a normal tag's `>` sits flush after the last attribute.
        if self_closing {
            out.push_str(" />");
        } else {
            out.push('>');
        }
    } else {
        out.push('\n');
        out.push_str(&outer_indent);
        if self_closing {
            out.push_str("/>");
        } else {
            out.push('>');
        }
    }
    out
}

/// Whether a rendered attribute's value is a *literal* quoted string
/// (`style="…"` / `class="a {x}"`) whose interior whitespace is HTML text and
/// must be kept verbatim — as opposed to a quoted single expression
/// (`pos="{expr}"`), whose formatted multi-line value still needs re-indenting.
/// The value part (after the first `=`) must start with `"` but not `"{`.
fn is_string_value_attr(a: &str) -> bool {
    match a.split_once('=') {
        Some((_, value)) => value.starts_with('"') && !value.starts_with("\"{"),
        None => false,
    }
}

/// Whether an interpolation-led string value (`name="{…}…"`) has newlines that
/// are *all* literal HTML text (brace-depth 0, between interpolations) rather
/// than a wrapped `{expr}` continuation — so it can be emitted verbatim to
/// preserve source whitespace. False for no-newline values or any newline inside
/// `{…}` (brace-depth > 0), which take the re-indent path.
fn is_verbatim_interpolation_value(a: &str) -> bool {
    let Some((_, value)) = a.split_once('=') else {
        return false;
    };
    if !value.starts_with("\"{") {
        return false;
    }
    let mut depth: i32 = 0;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    let mut saw_newline_at_depth0 = false;
    for &b in value.as_bytes() {
        match quote {
            // Inside a JS string literal: only its own *unescaped* closing
            // delimiter ends it; braces/newlines there are not structural.
            Some(q) => {
                if escaped {
                    escaped = false;
                } else if b == b'\\' {
                    escaped = true;
                } else if b == q {
                    quote = None;
                }
            }
            None => match b {
                b'\'' | b'"' | b'`' if depth > 0 => quote = Some(b),
                b'{' => depth += 1,
                b'}' => depth -= 1,
                // Inside `{…}` a newline is a wrapped continuation (re-indent);
                // at depth 0 it is literal text (verbatim).
                b'\n' if depth > 0 => return false,
                b'\n' => saw_newline_at_depth0 = true,
                _ => {}
            },
        }
    }
    saw_newline_at_depth0
}

/// Re-indent an expression-led attribute (`class="{expr}\nraw-text…"`).
///
/// OXC always formats JS with spaces (never tabs). When an attribute starts with
/// a JS expression (`"{`) but also has continuation lines that start with a tab
/// (`\n\t`), those tab-indented lines are raw HTML attribute text — not formatted
/// JS — and must be kept verbatim. Split the attribute at the first `\n\t` and
/// re-indent only the expression part; append the raw text as-is.
///
/// Falls back to `reindent(a, prefix, true)` when no `\n\t` is found (pure JS
/// attribute — the normal path).
fn reindent_attr_with_raw_text(a: &str, prefix: &str) -> String {
    // Find the first occurrence of a newline followed by a tab — this marks the
    // boundary between formatted JS and raw source text.
    if let Some(split_pos) = a.find("\n\t") {
        let js_part = &a[..split_pos];
        let raw_part = &a[split_pos..]; // starts with "\n\t…"
        let reindented_js = crate::reindent::reindent(js_part, prefix, true);
        format!("{reindented_js}{raw_part}")
    } else {
        crate::reindent::reindent(a, prefix, true)
    }
}
