use oxc_allocator::Allocator;
use oxc_formatter::Formatter;
use oxc_parser::Parser;
use oxc_span::SourceType;
use svelte_compiler_rust::ast::template::Script;

use crate::error::FormatError;
use crate::options::FormatOptions;

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

    let parser_ret = Parser::new(&allocator, body, source_type).parse();
    if !parser_ret.errors.is_empty() {
        return Err(FormatError::ScriptParse(format!("{:?}", parser_ret.errors)));
    }

    let formatted = Formatter::new(&allocator, options.js.clone()).build(&parser_ret.program);

    // oxc_formatter emits trailing newline; preserve original surrounding
    // whitespace by sandwiching with a leading "\n\t" and trailing "\n"
    // — refined later, this is the verbatim-fallback indent.
    let wrapped = format!("\n\t{}", formatted.replace('\n', "\n\t").trim_end());
    let with_trailing_nl = format!("{wrapped}\n");

    Ok(Some((body_start as u32, body_end as u32, with_trailing_nl)))
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
