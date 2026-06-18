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
    // Always parse as TypeScript: oxfmt's `.svelte` mode via `prettier-plugin-svelte`
    // uses `babel-ts` (TypeScript parser) for ALL `<script>` blocks regardless of
    // `lang="ts"`. TypeScript is a superset of JS so valid JS parses identically,
    // but the TypeScript source-type flag changes two cosmetic formatting behaviors:
    //   1. Numeric-looking string keys like `{ '1': 'one' }` are preserved as `"1"`
    //      rather than being unquoted to `1` (see `can_remove_number_quotes_by_file_type`).
    //   2. TypeScript class property declarations keep their quotes.
    // Both of these match the oracle, so using `SourceType::ts()` unconditionally
    // aligns rsvelte-fmt with oxfmt's `.svelte` behaviour (#D).
    let source_type = SourceType::ts();

    let parser_ret = Parser::new(&allocator, body, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
        return Err(FormatError::ScriptParse(format!(
            "{:?}",
            parser_ret.diagnostics
        )));
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
    let allocator = Allocator::default();
    // Same reasoning as format_script: always use TS source type so that
    // numeric-looking string property keys are preserved (oracle uses babel-ts).
    let source_type = SourceType::ts();
    let parser_ret = Parser::new(&allocator, body, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.diagnostics.is_empty() {
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

/// Normalize a `<script …>` / `<style …>` opening tag:
/// - Collapse runs of whitespace (outside attribute-value quotes) to a single
///   space and drop space before the closing `>`.
/// - Normalize attribute value quotes to double-quotes: single-quoted values
///   become double-quoted, and unquoted values receive double-quotes
///   (`<script context=module>` → `<script context="module">`,
///   `<script lang='ts'>` → `<script lang="ts">`).
///
/// Returns the edit only when it changes something.
pub(crate) fn format_open_tag(
    source: &str,
    start: u32,
    end: u32,
    options: &FormatOptions,
) -> Option<(u32, u32, String)> {
    let block = source.get(start as usize..end as usize)?;
    let tag_end_rel = find_open_tag_end(block)? + 1;
    let tag = &block[..tag_end_rel];
    let normalized = normalize_open_tag(tag);
    let line_width = options.js.line_width.value() as usize;
    let indent_width = options.js.indent_width.value() as usize;
    let result = if normalized.len() > line_width {
        // The normalized flat tag overflows the print width — wrap each
        // attribute onto its own line at one level of indent (the top-level
        // `<script>` / `<style>` block is always at depth 0).
        wrap_script_open_tag(&normalized, indent_width).unwrap_or(normalized)
    } else {
        normalized
    };
    if result == tag {
        return None;
    }
    Some((start, start + tag_end_rel as u32, result))
}

/// Reformat a flat normalized open tag (e.g. `<script lang="ts" generics="T extends ...">`)
/// as a multi-line form with each attribute on its own line at `indent_width` spaces:
///
/// ```text
/// <script
///   lang="ts"
///   generics="T extends ..."
/// >
/// ```
///
/// Returns `None` when the tag can't be parsed (e.g. no attributes).
fn wrap_script_open_tag(tag: &str, indent_width: usize) -> Option<String> {
    // Strip the leading `<` and trailing `>`.
    let inner = tag.strip_prefix('<')?.strip_suffix('>')?;
    // Split tag name from attributes. Tag name is everything up to the first space.
    let (tag_name, rest) = if let Some(sp) = inner.find(' ') {
        (&inner[..sp], inner[sp + 1..].trim())
    } else {
        // No attributes — nothing to wrap.
        return None;
    };
    // Parse attributes from the flat string. All values are double-quoted after
    // normalize_open_tag, so we scan respecting quoted spans.
    let mut attrs: Vec<String> = Vec::new();
    let bytes = rest.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        // Skip leading whitespace.
        while i < len && bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        if i >= len {
            break;
        }
        // Collect attribute name (up to `=` or whitespace).
        let name_start = i;
        while i < len && bytes[i] != b'=' && !bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        if i <= name_start {
            break;
        }
        let name = &rest[name_start..i];
        if i >= len || bytes[i] != b'=' {
            // Boolean attribute.
            attrs.push(name.to_string());
            continue;
        }
        // Consume `=`.
        i += 1;
        if i >= len {
            attrs.push(name.to_string());
            break;
        }
        // Collect value (must be double-quoted after normalize_open_tag).
        if bytes[i] != b'"' {
            // Unexpected format — bail out.
            return None;
        }
        i += 1; // skip opening `"`
        let val_start = i;
        while i < len && bytes[i] != b'"' {
            i += 1;
        }
        let val = &rest[val_start..i];
        if i < len {
            i += 1; // skip closing `"`
        }
        attrs.push(format!("{}=\"{}\"", name, val));
    }
    if attrs.is_empty() {
        return None;
    }
    let indent = " ".repeat(indent_width);
    let mut out = format!("<{tag_name}");
    for attr in &attrs {
        out.push('\n');
        out.push_str(&indent);
        out.push_str(attr);
    }
    out.push_str("\n>");
    Some(out)
}

/// Normalize whitespace and quote styles in a `<script …>` / `<style …>` open
/// tag. All attribute values are emitted with double-quotes.
fn normalize_open_tag(tag: &str) -> String {
    let mut out = String::with_capacity(tag.len() + 4);
    let bytes = tag.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut pending_space = false;

    // Emit everything up to and including the tag name (e.g. `<script`).
    // The tag name runs until the first whitespace or `>`.
    while i < len && !bytes[i].is_ascii_whitespace() && bytes[i] != b'>' {
        out.push(bytes[i] as char);
        i += 1;
    }

    // Parse attributes.
    loop {
        // Skip whitespace between attributes.
        let ws_start = i;
        while i < len && bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        if i > ws_start {
            pending_space = true;
        }

        if i >= len {
            break;
        }
        let b = bytes[i];
        if b == b'>' {
            // Closing `>` — no space before it.
            out.push('>');
            break;
        }

        // Attribute name.
        if pending_space {
            out.push(' ');
            pending_space = false;
        }

        let name_start = i;
        while i < len && bytes[i] != b'=' && !bytes[i].is_ascii_whitespace() && bytes[i] != b'>' {
            i += 1;
        }
        let name = &tag[name_start..i];
        out.push_str(name);

        if i >= len || bytes[i] != b'=' {
            // Boolean attribute (no `=`).
            continue;
        }
        // Consume `=`.
        out.push('=');
        i += 1;

        if i >= len {
            break;
        }

        match bytes[i] {
            b'"' => {
                // Already double-quoted — copy verbatim including closing `"`.
                // Slice the value as `&str` (the `"` delimiters are ASCII, so the
                // bounds are valid UTF-8 boundaries) rather than pushing bytes as
                // chars, which would mojibake multi-byte values.
                out.push('"');
                i += 1;
                let val_start = i;
                while i < len && bytes[i] != b'"' {
                    i += 1;
                }
                out.push_str(&tag[val_start..i]);
                out.push('"');
                if i < len {
                    i += 1; // consume closing `"`
                }
            }
            b'\'' => {
                // Single-quoted → convert to double-quoted, escaping any `"`.
                out.push('"');
                i += 1;
                let val_start = i;
                while i < len && bytes[i] != b'\'' {
                    i += 1;
                }
                for c in tag[val_start..i].chars() {
                    if c == '"' {
                        out.push_str("&quot;");
                    } else {
                        out.push(c);
                    }
                }
                out.push('"');
                if i < len {
                    i += 1; // consume closing `'`
                }
            }
            _ => {
                // Unquoted value — collect until whitespace or `>`, then wrap.
                let val_start = i;
                while i < len && !bytes[i].is_ascii_whitespace() && bytes[i] != b'>' {
                    i += 1;
                }
                let val = &tag[val_start..i];
                out.push('"');
                // Escape any `"` inside the value (rare but possible).
                for c in val.chars() {
                    if c == '"' {
                        out.push_str("&quot;");
                    } else {
                        out.push(c);
                    }
                }
                out.push('"');
            }
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
