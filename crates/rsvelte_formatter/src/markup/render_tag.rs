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

/// Where a rendered attribute's newlines sit relative to `{…}` brace depth.
/// Inside braces a newline is a wrapped continuation of formatted JS; at depth 0
/// it is literal HTML text between interpolations.
struct ValueNewlines {
    /// Byte offset (within the scanned value) of the first depth-0 newline whose
    /// line carries a leading tab — see [`reindent_attr_with_raw_text`].
    first_tabbed_at_depth0: Option<usize>,
    any_at_depth0: bool,
    any_inside_braces: bool,
}

fn scan_value_newlines(value: &str) -> ValueNewlines {
    let mut depth: i32 = 0;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    let mut out = ValueNewlines {
        first_tabbed_at_depth0: None,
        any_at_depth0: false,
        any_inside_braces: false,
    };
    let bytes = value.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
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
                b'\n' if depth > 0 => out.any_inside_braces = true,
                b'\n' => {
                    out.any_at_depth0 = true;
                    if out.first_tabbed_at_depth0.is_none() && bytes.get(i + 1) == Some(&b'\t') {
                        out.first_tabbed_at_depth0 = Some(i);
                    }
                }
                _ => {}
            },
        }
    }
    out
}

/// Splits a rendered attribute into its value part and that value's offset,
/// so brace-depth offsets can be mapped back onto the whole attribute.
fn attr_value(a: &str) -> (usize, &str) {
    match a.split_once('=') {
        Some((name, value)) => (name.len() + 1, value),
        None => (0, a),
    }
}

/// Whether an interpolation-led string value (`name="{…}…"`) has newlines that
/// are *all* literal HTML text (brace-depth 0, between interpolations) rather
/// than a wrapped `{expr}` continuation — so it can be emitted verbatim to
/// preserve source whitespace. False for no-newline values or any newline inside
/// `{…}` (brace-depth > 0), which take the re-indent path.
fn is_verbatim_interpolation_value(a: &str) -> bool {
    let (_, value) = attr_value(a);
    if !value.starts_with("\"{") {
        return false;
    }
    let scan = scan_value_newlines(value);
    !scan.any_inside_braces && scan.any_at_depth0
}

/// Re-indent an expression-led attribute (`class="{expr}\nraw-text…"`).
///
/// Raw HTML text the author wrote between interpolations keeps its original
/// source indentation, so re-indenting it would double-count that indent. It is
/// recognised by a tab-indented line sitting at brace depth 0: depth 0 is
/// outside every `{…}`, and formatted JS is only ever tab-indented under
/// `useTabs` — where it is also always inside braces. Requiring both signals
/// keeps the tab-indented continuation lines of a multi-line attribute value out
/// of the raw-text branch, which used to strand them at column 0 (#2058).
fn reindent_attr_with_raw_text(a: &str, prefix: &str) -> String {
    let (value_offset, value) = attr_value(a);
    match scan_value_newlines(value).first_tabbed_at_depth0 {
        Some(pos) => {
            let split_pos = value_offset + pos;
            let reindented_js = crate::reindent::reindent(&a[..split_pos], prefix, true);
            format!("{reindented_js}{}", &a[split_pos..])
        }
        None => crate::reindent::reindent(a, prefix, true),
    }
}
