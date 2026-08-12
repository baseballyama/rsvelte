use oxc_formatter::format_program;
use oxc_parser::Parser;
use oxc_span::SourceType;

use super::formatter_parse_options;
use crate::error::FormatError;
use crate::options::FormatOptions;
use crate::width::{VisualWidth, tab_width};

/// Format the body of a `{@const <decl>}` tag — the `<decl>` is the body of a
/// `const` variable declaration (`<binding>[: Type] = <init>`).
///
/// The body is parsed as `const <decl>;` (TypeScript when `options.typescript`)
/// so a type annotation parses, then the `const ` prefix and trailing `;` are
/// sliced back off, leaving the formatted declaration body. Width handling
/// mirrors [`format_content_expression`]: the body is formatted at indent 0 and
/// the wrap width narrowed by the markup `depth`, then continuation lines are
/// re-indented to that depth.
pub(super) fn format_const_declaration(
    decl_source: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let allocator = crate::scratch::acquire();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("const {decl_source};");
    let parser_ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    let indent_width = options.js.indent_width.value() as usize;
    let lead = depth * indent_width;
    let full_width = options.js.line_width.value() as usize;

    // Format the wrapped `const <decl>;` at `narrowed` columns and strip the
    // `const ` / `;` affixes back off, recovering the declaration body.
    let format_at = |narrowed: usize| -> Result<String, FormatError> {
        let line_width =
            oxc_formatter_core::LineWidth::try_from(crate::formatter_width(narrowed.max(1)))
                .unwrap_or(options.js.line_width);
        let mut js = options.js.clone();
        js.line_width = line_width;
        let formatted = format_program(allocator, &parser_ret.program, js, None)
            .print()
            .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
            .into_code();
        let s = formatted.trim_end();
        let s = s.strip_prefix("const ").unwrap_or(s);
        let s = s.strip_suffix(';').unwrap_or(s);
        Ok(s.trim_end().to_string())
    };

    // The JS formatter measures the body as `const <body>;` at indent 0. Two
    // different real-render columns apply, so a single narrowing can't be exact
    // for both:
    //   - The FIRST line is rendered `{@const <body-line-1>}` at column `lead`,
    //     i.e. `+2` wider than the JS `const <body-line-1>` (`{@const ` = 8 vs
    //     `const ` = 6; the `}`/`;` delta is 0). So its break decision wants
    //     `full - lead - 2`.
    //   - Every CONTINUATION line is re-indented to `lead` and carries no
    //     `{@const` prefix, so it fits iff `lead + <js line> <= full`, wanting
    //     `full - lead`.
    // Format at `full - lead` first so a multi-line body's continuation lines
    // (ternary branches, call args, …) get their true budget and aren't broken
    // one column too early. If the result is single-line and the real
    // `{@const <body>}` tag overflows the print width, re-format at
    // `full - lead - 2` — the tighter width that forces the break at exactly the
    // point prettier picks. This keeps single-line consts identical to the old
    // uniform `full - lead - 2` narrowing while relaxing the over-narrowing that
    // used to hit deeply-nested continuation lines.
    let formatted = format_at(full_width.saturating_sub(lead))?;
    // `{@const ` (8) + body + `}` (1) at column `lead`.
    let formatted = if !formatted.contains('\n')
        && lead + 9 + formatted.visual_width(tab_width(options)) > full_width
    {
        format_at(full_width.saturating_sub(lead + 2))?
    } else {
        formatted
    };

    if !formatted.contains('\n') {
        return Ok(formatted);
    }
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(lead)
    };
    Ok(crate::reindent::reindent(&formatted, &prefix, true))
}

/// Format the body of a `{let x = e}` / `{const x = e}` declaration tag.
///
/// The body already includes the keyword (`let`/`const`) and the full
/// declaration, e.g. `let count = $state(0)` or
/// `const label = 'count'`. Parse it as `<body>;` and format with OXC
/// (which normalises quote style, spacing, etc.), then strip the trailing `;`.
/// Width handling mirrors [`format_const_declaration`].
pub(super) fn format_declaration_tag_body(
    body: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let allocator = crate::scratch::acquire();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    // Append `;` so OXC parses it as a complete statement.
    let wrapped = format!("{body};");
    let parser_ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        // Parse failed (e.g. TS-only syntax on JS path, or something unusual).
        // Return the source body unchanged rather than garbling it.
        return Ok(body.to_string());
    }

    let indent_width = options.js.indent_width.value() as usize;
    let lead = depth * indent_width;
    let full_width = options.js.line_width.value() as usize;
    // The emitted tag is `{<body>}` (1 + body_len + 1 = overhead 2).
    // The JS formatter sees the statement `<body>;` and measures its length
    // as `body_len + 1 (;)`. The real overhead is `{ }` = 2, so we subtract
    // `lead + 2 - 1 = lead + 1` to make OXC's break threshold match the
    // rendered column.
    let narrowed = full_width.saturating_sub(lead + 1);
    let line_width =
        oxc_formatter_core::LineWidth::try_from(crate::formatter_width(narrowed.max(1)))
            .unwrap_or(options.js.line_width);

    let mut js = options.js.clone();
    js.line_width = line_width;
    let formatted = format_program(allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // Strip the trailing `;\n` added by OXC.
    let s = formatted.trim_end().trim_end_matches(';').trim_end();

    if !s.contains('\n') {
        return Ok(s.to_string());
    }
    // Multi-line declaration (L9 case: `let a = $state(0),\n  b = $derived(a * 2)`).
    // Re-indent continuation lines to the tag's depth.
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(lead)
    };
    Ok(crate::reindent::reindent(s, &prefix, true))
}

/// Format a snippet header `name<…>(params)` by wrapping it as a function
/// signature (`function name<…>(params) {}`) and formatting with normal,
/// width-driven breaking (NOT the single-line `Expand::Never` path the block
/// headers use). The width is narrowed by the markup depth and the
/// `{#snippet ` prefix so breaks land where prettier-plugin-svelte puts them.
pub(super) fn format_snippet_header_source(
    header_src: &str,
    options: &FormatOptions,
    depth: usize,
) -> Result<String, FormatError> {
    let allocator = crate::scratch::acquire();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("function {header_src} {{}}");
    let parser_ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    let indent_width = options.js.indent_width.value() as usize;
    // The final snippet line looks like:
    //   `{depth_indent}{#snippet name<…>(params)}`
    // totalling `depth*indent + 10 + header_len + 1` columns.  The oxc-formatted
    // wrapper is `function name<…>(params) {}`, where `function ` (9) and ` {}` (3)
    // surround the header_len chars.  So oxc must not break when
    //   9 + header_len + 3  <=  narrowed
    //   header_len  <=  narrowed - 12
    // We want all headers that fit in the output to pass, i.e.
    //   header_len  <=  line_width - depth*indent - 11
    // Combining: narrowed - 12  >=  line_width - depth*indent - 11
    //            narrowed       >=  line_width - depth*indent + 1
    let base = (options.js.line_width.value() as usize).saturating_sub(depth * indent_width);
    let narrowed = base.saturating_add(1);

    let mut js = options.js.clone();
    js.line_width = oxc_formatter_core::LineWidth::try_from(crate::formatter_width(narrowed))
        .unwrap_or(options.js.line_width);
    // NOTE: do NOT set `expand = Never` — width-driven breaking is the point.

    let formatted = format_program(allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // Output: `function name<…>(params) {}` (params possibly multi-line).
    // Peel the leading `function ` and the trailing empty body ` {}`.
    let s = formatted.trim();
    let body = s.strip_prefix("function ").unwrap_or(s).trim_end();
    let header = body.strip_suffix("{}").unwrap_or(body).trim_end();

    if !header.contains('\n') {
        return Ok(header.to_string());
    }
    // Push continuation lines out to the snippet's markup depth (the first line
    // stays inline after `{#snippet `).
    let prefix = if options.js.indent_style.is_tab() {
        "\t".repeat(depth)
    } else {
        " ".repeat(depth * indent_width)
    };
    Ok(crate::reindent::reindent(header, &prefix, true))
}

/// Format a destructuring pattern. Patterns like `{a, b = 1}`,
/// `[a, ...rest]`, or `{ a: { b } }` aren't valid as bare expressions
/// (object literals can't carry default values), so we wrap them in a
/// `let PATTERN = $$;` declaration and parse the whole thing as a
/// Program. The formatted declaration is then sliced back down to just
/// the pattern body.
///
/// We force `line_width` to its maximum so nested patterns stay on one
/// line — multi-line patterns inside `{#each as ...}` would land
/// across the block header, which Svelte's parser then can't re-read.
pub fn format_pattern_source(
    pattern_source: &str,
    options: &FormatOptions,
) -> Result<String, FormatError> {
    const SENTINEL: &str = "__rsvelte_fmt_rhs__";
    let allocator = crate::scratch::acquire();
    let source_type = if options.typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let wrapped = format!("let {pattern_source} = {SENTINEL};");
    let parser_ret = Parser::new(allocator, &wrapped, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
    }

    // The parse above is the only thing OXC contributes here: it rejects a
    // malformed pattern. prettier-plugin-svelte preserves the original source
    // representation for patterns (string-key quotes kept as-is, computed keys
    // keep their internal whitespace), which OXC would normalise away
    // (double-quoting, stripping quotes from valid-identifier keys, hard-wrapping
    // multi-line), so the formatted program is never used — the source-based
    // `light_normalize_pattern` is more faithful to the oracle.
    Ok(light_normalize_pattern(pattern_source))
}

/// Conservative whitespace-only normalization used when the JS formatter
/// produces a multi-line pattern.
///
/// Mirrors Prettier's destructuring spacing rules: braces (`{` / `}`)
/// always carry one inner space when non-empty; brackets (`[` / `]`)
/// and parens carry none; commas and colons are followed by exactly
/// one space.
///
/// Template-literal `${…}` expressions are passed through verbatim (no inner
/// spaces inserted) to match `oxfmt`'s behaviour: `` [`leng${th}`] `` stays
/// `` [`leng${th}`] ``, not `` [`leng${ th }`] ``.
///
/// Computed object keys `[expr]` are passed through verbatim, preserving
/// the original source whitespace and string-quote style.
/// Return the UTF-8 byte sequence starting at byte offset `i` in `src`.
/// For ASCII bytes this is a 1-byte slice; for multi-byte sequences we read
/// the length from the leading byte.  Always returns at least one byte (the
/// leading byte) so callers can advance `i` by `seq.len()` safely.
#[inline]
fn utf8_seq_at(src: &str, i: usize) -> &str {
    let bytes = src.as_bytes();
    let b = bytes[i];
    let seq_len = if b < 0x80 {
        1
    } else if b & 0xF8 == 0xF0 {
        4
    } else if b & 0xF0 == 0xE0 {
        3
    } else {
        2 // 0xC0..0xDF or stray continuation byte
    };
    let end = (i + seq_len).min(src.len());
    // SAFETY: we computed seq_len from the UTF-8 leading byte so end is a
    // char boundary; if the source is valid UTF-8 (it came from a &str) this
    // is always safe.
    &src[i..end]
}

fn light_normalize_pattern(src: &str) -> String {
    let bytes = src.as_bytes();
    let mut out = String::with_capacity(src.len());
    // Track brace/bracket nesting to detect computed keys.
    // `brace_depth` counts `{` / `}` (object pattern levels).
    // `bracket_depth` counts `[` / `]` (array pattern levels).
    // A `[` that immediately follows `,` / `{` / ` ` (i.e., property position
    // in an object pattern) is a computed key and should be passed verbatim.
    let mut brace_depth: u32 = 0;
    let mut bracket_depth: u32 = 0;
    // Last non-whitespace byte emitted to `out`, used to detect computed keys.
    let mut last_non_ws: u8 = 0;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];

        // When inside a template literal string, pass chars through verbatim
        // until the matching close backtick (tracking `${…}` nesting).
        if b == b'`' {
            out.push('`');
            i += 1;
            let mut depth: u32 = 0; // nesting level of `${…}` expressions
            while i < bytes.len() {
                match bytes[i] {
                    b'`' if depth == 0 => {
                        out.push('`');
                        i += 1;
                        break; // end of this template literal
                    }
                    b'\\' => {
                        // Escape sequence — emit both bytes verbatim using
                        // char-boundary-safe slice rather than `as char`.
                        out.push('\\');
                        i += 1;
                        if i < bytes.len() {
                            let seq = utf8_seq_at(src, i);
                            out.push_str(seq);
                            i += seq.len();
                        }
                    }
                    b'$' if i + 1 < bytes.len() && bytes[i + 1] == b'{' => {
                        // Template expression `${…}` — emit both chars and
                        // recurse into the expression verbatim, tracking braces.
                        out.push('$');
                        out.push('{');
                        i += 2;
                        depth += 1;
                    }
                    b'{' if depth > 0 => {
                        out.push('{');
                        i += 1;
                        depth += 1;
                    }
                    b'}' if depth > 0 => {
                        out.push('}');
                        i += 1;
                        depth -= 1;
                    }
                    _ => {
                        // Verbatim passthrough — use char-boundary-safe slice.
                        let seq = utf8_seq_at(src, i);
                        out.push_str(seq);
                        i += seq.len();
                    }
                }
            }
            continue;
        }

        // Single- and double-quoted string literals: pass verbatim to preserve
        // the original quote style (the oracle does not normalize string quotes
        // in destructuring pattern keys: `{ 'prop-1': x }` stays single-quoted).
        if b == b'\'' || b == b'"' {
            let quote = b;
            out.push(quote as char);
            last_non_ws = quote;
            i += 1;
            while i < bytes.len() {
                match bytes[i] {
                    c if c == quote => {
                        out.push(quote as char);
                        i += 1;
                        break;
                    }
                    b'\\' => {
                        out.push('\\');
                        i += 1;
                        if i < bytes.len() {
                            let seq = utf8_seq_at(src, i);
                            out.push_str(seq);
                            i += seq.len();
                        }
                    }
                    _ => {
                        let seq = utf8_seq_at(src, i);
                        out.push_str(seq);
                        i += seq.len();
                    }
                }
            }
            continue;
        }

        // A `[` that appears in property position inside an object pattern
        // (i.e., after `{` or `,`) is a *computed key*. Its content should be
        // passed through verbatim to preserve the original whitespace and
        // string-quote style (e.g. `split('')` must not become `split("")`).
        if b == b'[' && brace_depth > 0 && bracket_depth == 0 && matches!(last_non_ws, b'{' | b',')
        {
            // Emit the `[` and copy until the matching `]`.
            out.push('[');
            i += 1;
            let mut depth: u32 = 1;
            while i < bytes.len() && depth > 0 {
                match bytes[i] {
                    b'[' => {
                        depth += 1;
                        out.push('[');
                        i += 1;
                    }
                    b']' => {
                        depth -= 1;
                        out.push(']');
                        i += 1;
                    }
                    b'\\' => {
                        out.push('\\');
                        i += 1;
                        if i < bytes.len() {
                            let seq = utf8_seq_at(src, i);
                            out.push_str(seq);
                            i += seq.len();
                        }
                    }
                    _ => {
                        let seq = utf8_seq_at(src, i);
                        out.push_str(seq);
                        i += seq.len();
                    }
                }
            }
            last_non_ws = b']';
            continue;
        }

        match b {
            b' ' | b'\t' | b'\n' | b'\r' => {
                // Drop existing whitespace; the rules below re-insert it.
            }
            b'{' => {
                brace_depth += 1;
                out.push('{');
                last_non_ws = b'{';
                // Peek past whitespace to see whether the brace is empty.
                let mut j = i + 1;
                while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                    j += 1;
                }
                if j < bytes.len() && bytes[j] != b'}' {
                    out.push(' ');
                }
            }
            b'}' => {
                brace_depth = brace_depth.saturating_sub(1);
                if !out.ends_with('{') && !out.ends_with(' ') {
                    out.push(' ');
                }
                out.push('}');
                last_non_ws = b'}';
            }
            b'[' => {
                bracket_depth += 1;
                out.push('[');
            }
            b']' => {
                bracket_depth = bracket_depth.saturating_sub(1);
                out.push(']');
            }
            b',' | b':' => {
                if out.ends_with(' ') {
                    out.pop();
                }
                out.push(b as char);
                last_non_ws = b;
                // Lookahead for next non-whitespace.
                let mut j = i + 1;
                while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                    j += 1;
                }
                if j < bytes.len() && !matches!(bytes[j], b'}' | b']' | b')') {
                    out.push(' ');
                }
            }
            b'=' => {
                // Default value assignment in destructuring pattern: `{ a = val }`.
                // Distinguish from compound/comparison operators by checking next char.
                // We emit spaces around `=` (but not `==`, `===`, `=>`, `!=`, `>=`, `<=`).
                let next = bytes.get(i + 1).copied().unwrap_or(0);
                if matches!(next, b'=' | b'>') {
                    // `==` / `===` / `=>` — emit as-is; no space manipulation.
                    out.push('=');
                } else {
                    // Plain `=` default value: ensure ` = ` spacing.
                    if !out.ends_with(' ') {
                        out.push(' ');
                    }
                    out.push('=');
                    // Lookahead for next non-whitespace.
                    let mut j = i + 1;
                    while j < bytes.len() && matches!(bytes[j], b' ' | b'\t' | b'\n' | b'\r') {
                        j += 1;
                    }
                    if j < bytes.len() {
                        out.push(' ');
                    }
                }
                last_non_ws = b'=';
            }
            other => {
                if other < 0x80 {
                    // ASCII: emit as a single char.
                    out.push(other as char);
                } else {
                    // Multi-byte UTF-8 sequence: determine length from the
                    // leading byte and copy the full sequence as a Rust char.
                    let seq_len = if other & 0xF8 == 0xF0 {
                        4
                    } else if other & 0xF0 == 0xE0 {
                        3
                    } else {
                        // 0xC0..0xDF two-byte sequence (or a stray continuation byte)
                        2
                    };
                    if let Some(slice) = src.get(i..i + seq_len) {
                        out.push_str(slice);
                        i += seq_len;
                    } else {
                        // Truncated sequence — emit best-effort.
                        out.push(other as char);
                    }
                }
                last_non_ws = other;
            }
        }
        i += 1;
    }
    out
}
