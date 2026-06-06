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
        return Ok(None);
    }

    let allocator = Allocator::default();
    let source_type = if script.is_typescript {
        SourceType::ts()
    } else {
        SourceType::default()
    };

    let parser_ret = Parser::new(&allocator, body, source_type)
        .with_options(formatter_parse_options())
        .parse();
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    let formatted = format_program(&allocator, &parser_ret.program, options.js.clone(), None)
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
    let body_indented = reindent_body(formatted.trim_end(), &unit);
    let wrapped = format!("\n{body_indented}\n");

    Ok(Some((body_start as u32, body_end as u32, wrapped)))
}

/// One level of the scanner stack used by [`reindent_body`]. We only need
/// to know whether a line begins inside template-literal *quasi* text (raw
/// string content) versus ordinary code — the latter is re-indented, the
/// former is left verbatim.
enum Frame {
    /// Inside `` `…` `` quasi text (between backticks, outside `${}`).
    Template,
    /// Inside a `${ … }` substitution. The `u32` is the `{`-nesting depth
    /// within the substitution, so the matching `}` is recognised.
    Subst(u32),
}

/// Add `unit` to the start of every line of `formatted`, **except** lines
/// that begin inside multi-line template-literal quasi text. Such lines'
/// leading whitespace is significant (part of the string value) and
/// `oxc_formatter` preserves it verbatim, so re-indenting them would mutate
/// the string and break idempotency.
///
/// The scanner tracks template-literal / `${}` nesting plus string and
/// comment context so backticks, `${`, and braces inside strings or
/// comments aren't misread.
fn reindent_body(formatted: &str, unit: &str) -> String {
    let chars: Vec<char> = formatted.chars().collect();
    let n = chars.len();
    let mut out = String::with_capacity(formatted.len() + 16);
    let mut stack: Vec<Frame> = Vec::new();
    let mut line_comment = false;
    let mut block_comment = false;
    let mut string: Option<char> = None;
    let mut at_line_start = true;
    let mut i = 0;

    while i < n {
        let c = chars[i];

        if at_line_start {
            let in_quasi = matches!(stack.last(), Some(Frame::Template));
            if c != '\n' && !in_quasi {
                out.push_str(unit);
            }
            at_line_start = false;
        }

        // Line comment: runs to end of line.
        if line_comment {
            out.push(c);
            i += 1;
            if c == '\n' {
                line_comment = false;
                at_line_start = true;
            }
            continue;
        }

        // Block comment: runs to `*/`. Interior lines are still re-indented
        // (code context), matching `oxc_formatter`'s own re-alignment.
        if block_comment {
            if c == '*' && chars.get(i + 1) == Some(&'/') {
                out.push('*');
                out.push('/');
                i += 2;
                block_comment = false;
                continue;
            }
            out.push(c);
            i += 1;
            if c == '\n' {
                at_line_start = true;
            }
            continue;
        }

        // Regular string: consumes its own escapes; can't span lines in
        // well-formed formatter output.
        if let Some(q) = string {
            out.push(c);
            if c == '\\' {
                if i + 1 < n {
                    out.push(chars[i + 1]);
                    i += 2;
                } else {
                    i += 1;
                }
                continue;
            }
            i += 1;
            if c == q {
                string = None;
            }
            continue;
        }

        if matches!(stack.last(), Some(Frame::Template)) {
            // Inside template-literal quasi text.
            match c {
                '`' => {
                    stack.pop();
                    out.push(c);
                    i += 1;
                }
                '\\' => {
                    out.push(c);
                    if i + 1 < n {
                        out.push(chars[i + 1]);
                        i += 2;
                    } else {
                        i += 1;
                    }
                }
                '$' if chars.get(i + 1) == Some(&'{') => {
                    stack.push(Frame::Subst(0));
                    out.push('$');
                    out.push('{');
                    i += 2;
                }
                '\n' => {
                    out.push(c);
                    at_line_start = true;
                    i += 1;
                }
                _ => {
                    out.push(c);
                    i += 1;
                }
            }
        } else {
            // Ordinary code context (top level or inside `${ … }`).
            match c {
                '`' => {
                    stack.push(Frame::Template);
                    out.push(c);
                    i += 1;
                }
                '\'' | '"' => {
                    string = Some(c);
                    out.push(c);
                    i += 1;
                }
                '/' if chars.get(i + 1) == Some(&'/') => {
                    line_comment = true;
                    out.push('/');
                    out.push('/');
                    i += 2;
                }
                '/' if chars.get(i + 1) == Some(&'*') => {
                    block_comment = true;
                    out.push('/');
                    out.push('*');
                    i += 2;
                }
                '{' => {
                    if let Some(Frame::Subst(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    out.push(c);
                    i += 1;
                }
                '}' => {
                    if matches!(stack.last(), Some(Frame::Subst(0))) {
                        stack.pop();
                    } else if let Some(Frame::Subst(d)) = stack.last_mut() {
                        *d -= 1;
                    }
                    out.push(c);
                    i += 1;
                }
                '\n' => {
                    out.push(c);
                    at_line_start = true;
                    i += 1;
                }
                _ => {
                    out.push(c);
                    i += 1;
                }
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

    // Find the first '>' that terminates the opening <script ...> tag.
    // (Attribute values can't contain a literal '>' without quoting, but
    // a string like `class=">"` would defeat naive scanning — punted to
    // a follow-up; today's CSS/markup verbatim path doesn't exercise it.)
    let body_start_rel = block
        .find('>')
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
