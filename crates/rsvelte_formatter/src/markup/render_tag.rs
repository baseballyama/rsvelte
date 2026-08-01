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
            // lines, re-indent only the JS continuation lines and keep the raw
            // text verbatim.
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
/// The value part (after the `name=`) must start with `"` but not `"{`.
fn is_string_value_attr(a: &str) -> bool {
    let (offset, value) = attr_value(a);
    offset > 0 && value.starts_with('"') && !value.starts_with("\"{")
}

/// Where a rendered attribute's newlines sit relative to `{…}` brace depth.
/// Inside braces a newline is a wrapped continuation of formatted JS; at depth 0
/// it is literal HTML text between interpolations.
struct ValueNewlines {
    /// Byte offsets (within the scanned value) of every depth-0 newline — the
    /// boundaries at which [`reindent_attr_with_raw_text`] splits.
    at_depth0: Vec<usize>,
    any_inside_braces: bool,
}

fn scan_value_newlines(value: &str) -> ValueNewlines {
    let mut depth: i32 = 0;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    let mut out = ValueNewlines {
        at_depth0: Vec::new(),
        any_inside_braces: false,
    };
    for (i, &b) in value.as_bytes().iter().enumerate() {
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
                b'\n' => out.at_depth0.push(i),
                _ => {}
            },
        }
    }
    out
}

/// Splits a rendered attribute into its value part and that value's offset,
/// so brace-depth offsets can be mapped back onto the whole attribute.
///
/// The `=` only separates a name from a value when everything before it *is* an
/// attribute name; otherwise the whole rendering is the value. Without that
/// guard a JS operator (`{@attach x != null && …}`) would be read as the
/// separator and the expression's own text scanned as if it were markup.
fn attr_value(a: &str) -> (usize, &str) {
    match a.split_once('=') {
        Some((name, value))
            if !name.is_empty()
                && !name.contains([
                    ' ', '\t', '\n', '{', '}', '"', '\'', '(', '!', '<', '>', '=',
                ]) =>
        {
            (name.len() + 1, value)
        }
        _ => (0, a),
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
    !scan.any_inside_braces && !scan.at_depth0.is_empty()
}

/// Re-indent an expression-led attribute (`class="{expr}\nraw-text…"`).
///
/// A line that *begins* at brace depth 0 is literal HTML text between
/// interpolations — the oracle prints regular attribute text verbatim, so its
/// author-written indentation is kept as-is. A line that begins inside `{…}` is
/// an `oxc_formatter` continuation produced at column 0 and must gain the
/// attribute indent. Splitting at *every* depth-0 newline (not just the first)
/// is what lets a second wrapping interpolation after raw text be re-indented
/// too (#2120): each segment holds one depth-0 line plus that line's own
/// brace-interior continuations, and `skip_first` leaves the depth-0 line alone.
fn reindent_attr_with_raw_text(a: &str, prefix: &str) -> String {
    let (value_offset, value) = attr_value(a);
    let boundaries = scan_value_newlines(value).at_depth0;
    if boundaries.is_empty() {
        return crate::reindent::reindent(a, prefix, true);
    }
    let mut out = String::with_capacity(a.len() + prefix.len() * (boundaries.len() + 1));
    let mut start = 0;
    for pos in boundaries {
        // The newline itself closes the segment it terminates.
        let end = value_offset + pos + 1;
        out.push_str(&crate::reindent::reindent(&a[start..end], prefix, true));
        start = end;
    }
    out.push_str(&crate::reindent::reindent(&a[start..], prefix, true));
    out
}

#[cfg(test)]
mod tests {
    use super::{attr_value, reindent_attr_with_raw_text};

    #[test]
    fn attr_value_splits_only_on_a_real_name_separator() {
        assert_eq!(attr_value("class=\"a {x}\""), (6, "\"a {x}\""));
        // A JS operator inside a brace-led attribute is not the separator.
        assert_eq!(
            attr_value("{@attach x != null && f(x)}"),
            (0, "{@attach x != null && f(x)}")
        );
        assert_eq!(attr_value("{...rest}"), (0, "{...rest}"));
    }

    #[test]
    fn every_expression_run_after_raw_text_is_reindented() {
        // Two wrapped interpolations separated by raw text: both sets of
        // continuation lines gain the prefix, both raw-text lines keep their
        // source indentation (#2120).
        let a = "title=\"{a\n  ? b\n  : c}\n\traw\n\t{d\n  ? e\n  : f}\"";
        assert_eq!(
            reindent_attr_with_raw_text(a, "  "),
            "title=\"{a\n    ? b\n    : c}\n\traw\n\t{d\n    ? e\n    : f}\""
        );
    }
}
