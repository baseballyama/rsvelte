//! Script-content extraction and OXC re-parsing.

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

use crate::ast::template::Script;

use super::super::svelte2tsx::slice_src;

/// Extract the raw script content from the source and parse it with OXC,
/// then invoke the callback with the parsed program.
///
/// This approach avoids lifetime issues since the OXC allocator and parsed
/// program are created and consumed within the closure scope.
pub(super) fn with_parsed_script<F>(script: &Script, source: &str, f: F)
where
    F: FnOnce(&oxc::Program, &str),
{
    let content_start = script.content_offset as usize;
    // Find the end of script content: from content_offset to the start of </script>
    let script_source = slice_src(source, script.start as usize, script.end as usize);
    let close_tag_offset = script_source
        .rfind("</script>")
        .or_else(|| script_source.rfind("</Script>"))
        .unwrap_or(script_source.len());
    let content_end = script.start as usize + close_tag_offset;
    let raw_content = &source[content_start..content_end];

    let allocator = Allocator::default();
    // Always use TypeScript source type. TypeScript is a superset of JavaScript,
    // so TS parsing handles both TS syntax (like `import type`, type annotations)
    // and regular JS correctly, even when the script doesn't have `lang="ts"`.
    let source_type = SourceType::ts();
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    f(&result.program, raw_content);
}
