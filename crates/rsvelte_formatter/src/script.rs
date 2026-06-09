use oxc_allocator::Allocator;
use oxc_formatter::{JsFormatOptions, format_program};
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_span::SourceType;
use rsvelte_core::ast::template::Script;

use crate::error::FormatError;
use crate::options::FormatOptions;

/// The single indent unit (one nesting level) implied by `JsFormatOptions`.
/// Used to outdent the formatter output by one level when splicing into
/// `<script>…</script>` — keeps the body's outer indent consistent with
/// what the formatter generates internally.
fn indent_unit(opts: &JsFormatOptions) -> String {
    if opts.indent_style.is_tab() {
        "\t".to_string()
    } else {
        " ".repeat(opts.indent_width.value() as usize)
    }
}

/// `oxc_formatter` requires the parser to drop `ParenthesizedExpression`
/// nodes — otherwise it hits an "Already disabled `preserveParens`"
/// `unreachable!()` while walking the AST.
fn formatter_parse_options() -> OxcParseOptions {
    OxcParseOptions {
        preserve_parens: false,
        ..OxcParseOptions::default()
    }
}

/// Format a `<script>` body. Returns `(splice_start, splice_end, formatted_body)`
/// in source-byte offsets, or `None` if the body is empty / whitespace-only.
pub(crate) fn format_script(
    source: &str,
    script: &Script,
    options: &FormatOptions,
) -> Result<Option<(u32, u32, String)>, FormatError> {
    let (body_start, body_end) = body_span(source, script)?;
    let body = &source[body_start..body_end];

    if body.trim().is_empty() {
        // A whitespace-only body (e.g. `<script>\n\t\n</script>`) collapses to a
        // single newline so the close tag sits on its own line, matching oxfmt /
        // prettier. A truly empty body (`<script></script>`) is left as-is.
        if body.is_empty() {
            return Ok(None);
        }
        return Ok(Some((body_start as u32, body_end as u32, "\n".to_string())));
    }

    let allocator = Allocator::default();
    let source_type = if script.is_typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let mut parser_ret = Parser::new(&allocator, body, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() && !script.is_typescript {
        // oxfmt parses `<script>` content leniently — TS is a superset of JS, so
        // TS-only syntax in a script without `lang="ts"` (common in docs) still
        // formats. Fall back to the TS parser when the JS parse fails. Valid JS
        // never reaches here, so its output is unchanged.
        parser_ret = Parser::new(&allocator, body, SourceType::ts())
            .with_options(formatter_parse_options())
            .parse();
    }
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    // Format the body one indent level narrower than the configured width.
    // The body is formatted at indent 0 here but then nested one level under
    // `<script>` (`reindent_body` below), so a line that is exactly
    // `printWidth` wide at indent 0 would overflow once indented. oxfmt formats
    // the body already nested, so narrowing the width here matches its wrap
    // decisions and keeps `<script>` bodies identical to oxfmt.
    let mut js = options.js.clone();
    let nested_width = js
        .line_width
        .value()
        .saturating_sub(js.indent_width.value() as u16);
    js.line_width = oxc_formatter_core::LineWidth::try_from(nested_width).unwrap_or(js.line_width);
    let formatted = format_program(&allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    // oxc_formatter emits a trailing newline. Add one indent level to
    // every non-empty line so the body is nested under `<script>` using
    // the same indent unit (tab vs N-space) that the formatter used
    // internally. Lines that fall *inside* a multi-line template literal
    // are skipped — their whitespace is part of the string value, so
    // re-indenting them would both mutate the runtime string and make
    // formatting non-idempotent (every pass adds another level) (#686).
    let unit = indent_unit(&options.js);
    let body_indented = crate::reindent::reindent(formatted.trim_end(), &unit, false);
    let wrapped = format!("\n{body_indented}\n");

    Ok(Some((body_start as u32, body_end as u32, wrapped)))
}

/// Format a `<script>` element nested in the markup (e.g. inside
/// `<svelte:head>`) — these aren't hoisted into `root.instance` / `root.module`,
/// so they'd otherwise be left verbatim. `depth` is the element's nesting depth;
/// its body renders at `depth + 1` levels of indent. Returns the splice edit, or
/// `None` when the body is empty / unparseable.
pub(crate) fn format_nested_script(
    source: &str,
    start: u32,
    end: u32,
    depth: usize,
    options: &FormatOptions,
) -> Result<Option<(u32, u32, String)>, FormatError> {
    let block = source
        .get(start as usize..end as usize)
        .ok_or_else(|| FormatError::Parse("nested <script> span out of bounds".into()))?;
    let Some(open_end) = block.find('>').map(|i| i + 1) else {
        return Ok(None);
    };
    let Some(close_start) = block.rfind("</script") else {
        return Ok(None);
    };
    if close_start < open_end {
        return Ok(None);
    }
    let body = &block[open_end..close_start];
    if body.trim().is_empty() {
        return Ok(None);
    }
    let is_ts =
        block[..open_end].contains("lang=\"ts\"") || block[..open_end].contains("lang='ts'");

    let allocator = Allocator::default();
    let source_type = if is_ts {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let mut parser_ret = Parser::new(&allocator, body, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() && !is_ts {
        // Fall back to the TS parser (superset of JS) — matches oxfmt's lenient
        // parse of a `<script>` without `lang="ts"` that uses TS-only syntax.
        parser_ret = Parser::new(&allocator, body, SourceType::ts())
            .with_options(formatter_parse_options())
            .parse();
    }
    if !parser_ret.errors.is_empty() {
        // Can't parse → leave the nested script untouched.
        return Ok(None);
    }

    let unit = indent_unit(&options.js);
    let body_indent = unit.repeat(depth + 1);
    // Narrow the width by the final nesting so wrap decisions match the indented
    // result (mirrors `format_script`'s one-level narrowing, generalised).
    let mut js = options.js.clone();
    let narrow = (body_indent.len() as u16).min(js.line_width.value().saturating_sub(1));
    let nested_width = js.line_width.value().saturating_sub(narrow);
    js.line_width = oxc_formatter_core::LineWidth::try_from(nested_width).unwrap_or(js.line_width);
    let formatted = format_program(&allocator, &parser_ret.program, js, None)
        .print()
        .map_err(|e| FormatError::ScriptParse(format!("{e:?}")))?
        .into_code();

    let reindented = crate::reindent::reindent(formatted.trim_end(), &body_indent, false);
    let tag_indent = unit.repeat(depth);
    let spliced = format!("\n{reindented}\n{tag_indent}");
    Ok(Some((
        start + open_end as u32,
        start + close_start as u32,
        spliced,
    )))
}

/// Normalize whitespace in a `<script …>` / `<style …>` opening tag: collapse
/// runs of whitespace (outside attribute-value quotes) to a single space and
/// drop space before the closing `>` (`<script  module>` → `<script module>`).
/// Returns the edit only when it changes something.
pub(crate) fn format_open_tag(source: &str, start: u32, end: u32) -> Option<(u32, u32, String)> {
    let block = source.get(start as usize..end as usize)?;
    let tag_end_rel = block.find('>')? + 1;
    let tag = &block[..tag_end_rel];
    let normalized = normalize_open_tag(tag);
    if normalized == tag {
        return None;
    }
    Some((start, start + tag_end_rel as u32, normalized))
}

fn normalize_open_tag(tag: &str) -> String {
    let mut out = String::with_capacity(tag.len());
    let mut quote: Option<char> = None;
    let mut pending_space = false;
    for c in tag.chars() {
        if let Some(q) = quote {
            out.push(c);
            if c == q {
                quote = None;
            }
            continue;
        }
        if c == '"' || c == '\'' {
            if pending_space {
                out.push(' ');
                pending_space = false;
            }
            out.push(c);
            quote = Some(c);
        } else if c.is_whitespace() {
            pending_space = true;
        } else {
            if pending_space && c != '>' {
                out.push(' ');
            }
            pending_space = false;
            out.push(c);
        }
    }
    out
}

/// Compute the byte range of the script BODY (between the opening tag's
/// `>` and the closing `</script>`). Falls back to scanning the source
/// slice when `Script.raw_content` is empty (eager-parse path).
fn body_span(source: &str, script: &Script) -> Result<(usize, usize), FormatError> {
    let block = source
        .get(script.start as usize..script.end as usize)
        .ok_or_else(|| FormatError::Parse("script span out of bounds".into()))?;

    // Find the '>' that terminates the opening <script ...> tag, skipping any
    // '>' that appears inside a quoted attribute value. A naive `find('>')`
    // mis-slices tags like `<script lang="ts" generics="T extends Map<K, V>">`
    // (the `generics` value contains a literal `>`), starting the body
    // mid-attribute and corrupting the parse (#946).
    let body_start_rel = find_open_tag_end(block)
        .ok_or_else(|| FormatError::Parse("script opening tag missing '>'".into()))?
        + 1;

    let body_end_rel = block
        .rfind("</script")
        .ok_or_else(|| FormatError::Parse("script closing tag missing".into()))?;

    Ok((
        script.start as usize + body_start_rel,
        script.start as usize + body_end_rel,
    ))
}

/// Byte offset (relative to `block`) of the `>` that closes the opening tag,
/// ignoring any `>` inside a single- or double-quoted attribute value. Quotes
/// and `>` are ASCII, so the returned byte index is always a char boundary.
fn find_open_tag_end(block: &str) -> Option<usize> {
    let mut quote: Option<u8> = None;
    for (i, b) in block.bytes().enumerate() {
        match quote {
            Some(q) => {
                if b == q {
                    quote = None;
                }
            }
            None => match b {
                b'"' | b'\'' => quote = Some(b),
                b'>' => return Some(i),
                _ => {}
            },
        }
    }
    None
}
