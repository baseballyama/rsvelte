//! Instance/module `<script>` scanning — import extraction and top-level-await
//! detection. Mirrors `svelte2tsx/nodes/Scripts.ts` plus the scanning half of
//! `processInstanceScriptContent.ts`.

use super::super::svelte2tsx::slice_src;
use super::super::utils::lexical::contains_word;
use oxc_ast::ast as oxc;
use oxc_ast_visit::{Visit, walk};
use oxc_syntax::scope::ScopeFlags;

/// Find the start of `</script>` tag by scanning backwards from the script end position.
pub fn find_script_close_tag_start(source: &str, script_end: u32) -> u32 {
    let bytes = source.as_bytes();
    let end = script_end as usize;
    let needle = b"</script>";
    let needle_len = needle.len();

    if end < needle_len {
        return script_end;
    }

    let mut i = end;
    while i >= needle_len {
        i -= 1;
        if i + needle_len <= end
            && bytes[i..i + needle_len]
                .iter()
                .zip(needle.iter())
                .all(|(a, b)| a.to_ascii_lowercase() == *b)
        {
            return u32::try_from(i).expect("script offset fits in u32");
        }
    }

    script_end
}

/// A leading comment that travels with its import when the import is hoisted.
/// Positions are relative to the script content.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LiftedComment {
    pub(crate) start: u32,
    pub(crate) end: u32,
    /// `/* … */` rather than `// …` — upstream `handleFirstInstanceImport`
    /// anchors its newline before a leading block comment but after a line one.
    pub(crate) block: bool,
    /// A line break follows the comment (TS `CommentRange.hasTrailingNewLine`).
    pub(crate) has_trailing_newline: bool,
}

/// An import declaration to hoist above `$$render()`, together with
/// the leading comments `moveNode` relocates alongside it. All positions are
/// relative to the script content (i.e. `Script::content_offset`).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LiftedImport {
    pub(crate) comments: Vec<LiftedComment>,
    pub(crate) start: u32,
    pub(crate) end: u32,
    /// A blank line separates the import from the preceding token (upstream
    /// `isNewGroup`), so `moveNode` prefixes the hoisted chunk with a newline.
    pub(crate) new_group: bool,
    /// The import was declared inside a TypeScript namespace/module body.
    pub(crate) nested: bool,
}

/// Find import declarations in an instance script, each with the
/// leading comment ranges the JS reference's `moveNode` hoists alongside it.
pub fn find_instance_imports(
    script: &crate::ast::template::Script,
    source: &str,
    program: &oxc_ast::ast::Program,
) -> Vec<LiftedImport> {
    let content_start = script.content_offset as usize;
    let script_source = slice_src(source, script.start as usize, script.end as usize);
    let close_tag_offset = script_source
        .rfind("</script>")
        .or_else(|| script_source.rfind("</Script>"))
        .unwrap_or(script_source.len());
    let content_end = script.start as usize + close_tag_offset;
    let raw_content = &source[content_start..content_end];

    // Fast path: an `import` substring is required for any import
    // declaration to exist. Skip the OXC parse entirely for the majority
    // of scripts that have no imports.
    if !contains_word(raw_content.as_bytes(), b"import") {
        return Vec::new();
    }

    let mut collector = InstanceImportCollector::new(raw_content, &program.comments);
    for stmt in &program.body {
        collector.push_statement(stmt);
    }
    collector.finish()
}

pub struct InstanceImportCollector<'a> {
    bytes: &'a [u8],
    comments: &'a [oxc_ast::ast::Comment],
    comment_cursor: usize,
    imports: Vec<LiftedImport>,
}

impl<'a> InstanceImportCollector<'a> {
    pub(crate) const fn new(content: &'a str, comments: &'a [oxc_ast::ast::Comment]) -> Self {
        Self {
            bytes: content.as_bytes(),
            comments,
            comment_cursor: 0,
            imports: Vec::new(),
        }
    }

    // Parser comments are source-ordered. Keep a monotonic cursor over them to
    // compute each import's leading-comment region the way TS
    // `getLeadingCommentRanges(node.getFullText())` does — including a TRAILING
    // line comment on the PREVIOUS statement's line (it is leading trivia of the
    // following import and moves up with it). The parser already tokenised
    // strings/regex correctly, so `// …` inside a string is never misread.
    pub(crate) fn push_statement(&mut self, stmt: &oxc_ast::ast::Statement) {
        self.push_statement_at_depth(stmt, false);
    }

    fn push_statement_at_depth(&mut self, stmt: &oxc_ast::ast::Statement, nested: bool) {
        use oxc_ast::ast as oxc;

        match stmt {
            oxc::Statement::ImportDeclaration(import) => self.push_import(import, nested),
            oxc::Statement::TSNamespaceDeclaration(namespace) => {
                self.push_namespace_body(&namespace.body);
            }
            oxc::Statement::TSExternalModuleDeclaration(module) => {
                if let Some(body) = &module.body {
                    self.push_statements(&body.body);
                }
            }
            oxc::Statement::TSGlobalDeclaration(global) => {
                self.push_statements(&global.body.body);
            }
            oxc::Statement::ExportDeclaration(export) => match &export.declaration {
                oxc::Declaration::TSNamespaceDeclaration(namespace) => {
                    self.push_namespace_body(&namespace.body);
                }
                oxc::Declaration::TSExternalModuleDeclaration(module) => {
                    if let Some(body) = &module.body {
                        self.push_statements(&body.body);
                    }
                }
                oxc::Declaration::TSGlobalDeclaration(global) => {
                    self.push_statements(&global.body.body);
                }
                _ => {}
            },
            _ => {}
        }
    }

    fn push_statements(&mut self, statements: &[oxc_ast::ast::Statement]) {
        for statement in statements {
            self.push_statement_at_depth(statement, true);
        }
    }

    fn push_namespace_body(&mut self, body: &oxc_ast::ast::TSNamespaceDeclarationBody<'_>) {
        use oxc_ast::ast as oxc;

        match body {
            oxc::TSNamespaceDeclarationBody::TSNamespaceDeclaration(namespace) => {
                self.push_namespace_body(&namespace.body);
            }
            oxc::TSNamespaceDeclarationBody::TSModuleBlock(block) => {
                self.push_statements(&block.body);
            }
        }
    }

    fn push_import(&mut self, import: &oxc_ast::ast::ImportDeclaration, nested: bool) {
        let start = import.span.start;
        let end = import.span.end;
        while self.comment_cursor < self.comments.len()
            && self.comments[self.comment_cursor].span.end <= start
        {
            self.comment_cursor += 1;
        }

        let (first_comment, trivia_start) = scan_back_leading_comments(
            self.bytes,
            start as usize,
            self.comments,
            self.comment_cursor,
        );
        let comments: Vec<LiftedComment> = self.comments[first_comment..self.comment_cursor]
            .iter()
            .map(|comment| LiftedComment {
                start: comment.span.start,
                end: comment.span.end,
                block: comment.is_block(),
                has_trailing_newline: comment_has_trailing_newline(
                    self.bytes,
                    comment.span.end as usize,
                ),
            })
            .collect();
        let new_group = counts_as_new_group(self.bytes, trivia_start, start as usize, &comments);

        self.imports.push(LiftedImport {
            comments,
            start,
            end,
            new_group,
            nested,
        });
    }

    pub(crate) fn finish(self) -> Vec<LiftedImport> {
        self.imports
    }
}

/// TS `CommentRange.hasTrailingNewLine`: a line break follows the comment, with
/// only spaces / tabs in between.
fn comment_has_trailing_newline(bytes: &[u8], end: usize) -> bool {
    bytes[end..]
        .iter()
        .find(|byte| !matches!(byte, b' ' | b'\t'))
        .is_some_and(|byte| matches!(byte, b'\n' | b'\r'))
}

/// Upstream `isNewGroup`: two or more line breaks in the import's leading
/// trivia. Line breaks *inside* a comment are part of the comment token and are
/// not counted, mirroring the TS scanner's `NewLineTrivia`.
fn counts_as_new_group(
    bytes: &[u8],
    trivia_start: usize,
    import_start: usize,
    comments: &[LiftedComment],
) -> bool {
    let mut line_breaks = 0usize;
    let mut position = trivia_start;
    while position < import_start {
        if let Some(comment) = comments
            .iter()
            .find(|comment| comment.start as usize == position)
        {
            position = comment.end as usize;
            continue;
        }
        if bytes[position] == b'\n'
            || (bytes[position] == b'\r' && bytes.get(position + 1) != Some(&b'\n'))
        {
            line_breaks += 1;
            if line_breaks >= 2 {
                return true;
            }
        }
        position += 1;
    }
    false
}

/// Walk backwards from `pos` over leading trivia (whitespace + comments),
/// returning the index of the earliest reachable parser-discovered comment and
/// the start of the whole trivia region (TS `node.getFullStart()`).
fn scan_back_leading_comments(
    bytes: &[u8],
    pos: usize,
    comments: &[oxc_ast::ast::Comment],
    comment_cursor: usize,
) -> (usize, usize) {
    let mut cstart = u32::try_from(pos).expect("script offset fits in u32");
    let mut comment_index = comment_cursor;
    let mut first_comment = comment_cursor;
    let trivia_start = loop {
        // Skip whitespace backward.
        let mut p = cstart as usize;
        while p > 0 && matches!(bytes[p - 1], b' ' | b'\t' | b'\n' | b'\r') {
            p -= 1;
        }

        while comment_index > 0 && comments[comment_index - 1].span.end as usize > p {
            comment_index -= 1;
        }
        if comment_index > 0 && comments[comment_index - 1].span.end as usize == p {
            let cs = comments[comment_index - 1].span.start;
            if cs >= cstart {
                break p;
            }
            cstart = cs;
            comment_index -= 1;
            first_comment = comment_index;
        } else {
            break p;
        }
    };
    (first_comment, trivia_start)
}

/// Detect whether the instance script has a top-level `await`.
///
/// Port of `processInstanceScriptContent.ts`: an `AwaitExpression` counts when
/// no enclosing node is a `Block` or function-like (`ts.isBlock(node) ||
/// ts.isFunctionLike(node)` pushes a scope). oxc's unambiguous parse also reads
/// an ambiguous `await (x)` as an `AwaitExpression` once the file turns out to
/// be ESM, including through an `await` elsewhere or `export as namespace`,
/// where TypeScript parses a call unless the file is an external module.
pub fn detect_top_level_await(content: &str, program: &oxc::Program) -> bool {
    if !contains_word(content.as_bytes(), b"await") {
        return false;
    }
    let mut finder = TopLevelAwaitFinder {
        source: content,
        is_external_module: program.body.iter().any(is_external_module_indicator),
        depth: 0,
        found: false,
        found_if_external_module: false,
    };
    finder.visit_program(program);
    finder.found || (finder.found_if_external_module && finder.is_external_module)
}

/// `isAnExternalModuleIndicatorNode` over a top-level statement.
fn is_external_module_indicator(statement: &oxc::Statement) -> bool {
    match statement {
        oxc::Statement::TSImportEqualsDeclaration(decl) => matches!(
            decl.module_reference,
            oxc::TSModuleReference::ExternalModuleReference(_)
        ),
        _ => statement.as_module_declaration().is_some_and(|decl| {
            !matches!(
                decl,
                oxc::ModuleDeclaration::TSNamespaceExportDeclaration(_)
            )
        }),
    }
}

struct TopLevelAwaitFinder<'s> {
    source: &'s str,
    /// Only `import.meta` can still turn this on once the walk has started.
    is_external_module: bool,
    depth: u32,
    found: bool,
    found_if_external_module: bool,
}

impl TopLevelAwaitFinder<'_> {
    fn nested(&mut self, walk: impl FnOnce(&mut Self)) {
        if self.found {
            return;
        }
        self.depth += 1;
        walk(self);
        self.depth -= 1;
    }
}

impl<'a> Visit<'a> for TopLevelAwaitFinder<'_> {
    fn visit_await_expression(&mut self, it: &oxc::AwaitExpression<'a>) {
        if self.depth == 0 {
            if ts_parses_as_await_expression(self.source, it.span.start as usize + "await".len()) {
                self.found = true;
                return;
            }
            self.found_if_external_module = true;
        }
        walk::walk_await_expression(self, it);
    }

    fn visit_import_meta(&mut self, _: &oxc::ImportMeta) {
        self.is_external_module = true;
    }

    // TypeScript has no `Block` node for a `case` clause, a namespace body or
    // a class body, so only these nest a scope.
    fn visit_block_statement(&mut self, it: &oxc::BlockStatement<'a>) {
        self.nested(|v| walk::walk_block_statement(v, it));
    }

    fn visit_static_block(&mut self, it: &oxc::StaticBlock<'a>) {
        self.nested(|v| walk::walk_static_block(v, it));
    }

    fn visit_function(&mut self, it: &oxc::Function<'a>, flags: ScopeFlags) {
        self.nested(|v| walk::walk_function(v, it, flags));
    }

    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        self.nested(|v| walk::walk_arrow_function_expression(v, it));
    }

    // A TypeScript method / accessor / constructor node owns its decorators and
    // computed name, which oxc hangs outside the `Function`.
    fn visit_method_definition(&mut self, it: &oxc::MethodDefinition<'a>) {
        self.nested(|v| walk::walk_method_definition(v, it));
    }

    fn visit_object_property(&mut self, it: &oxc::ObjectProperty<'a>) {
        if it.method || it.kind != oxc::PropertyKind::Init {
            self.nested(|v| walk::walk_object_property(v, it));
        } else {
            walk::walk_object_property(self, it);
        }
    }
}

/// Outside an await context TypeScript reads `await` as an `AwaitExpression`
/// only when the next token is an identifier, keyword or numeric / string
/// literal on the same line (`nextTokenIsIdentifierOrKeywordOrLiteralOnSameLine`);
/// otherwise `await (x)` is a call to an identifier named `await`.
fn ts_parses_as_await_expression(source: &str, after_await: usize) -> bool {
    const LINE_BREAKS: [char; 4] = ['\n', '\r', '\u{2028}', '\u{2029}'];
    let mut rest = &source[after_await..];
    let mut line_break = false;
    loop {
        if let Some(comment) = rest.strip_prefix("//") {
            rest = &comment[comment.find(LINE_BREAKS).unwrap_or(comment.len())..];
            continue;
        }
        if let Some(comment) = rest.strip_prefix("/*") {
            let Some(end) = comment.find("*/") else {
                return false;
            };
            line_break |= comment[..end].contains(LINE_BREAKS);
            rest = &comment[end + 2..];
            continue;
        }
        let Some(c) = rest.chars().next() else {
            return false;
        };
        if LINE_BREAKS.contains(&c) {
            line_break = true;
        } else if !(c.is_whitespace() || matches!(c, '\u{200B}' | '\u{FEFF}')) {
            return !line_break
                && match c {
                    '.' => rest[1..].starts_with(|d: char| d.is_ascii_digit()),
                    '_' | '$' | '\\' | '#' | '\'' | '"' => true,
                    // oxc accepted an operand here, so a non-ASCII start is an
                    // identifier.
                    c => c.is_ascii_alphanumeric() || !c.is_ascii(),
                };
        }
        rest = &rest[c.len_utf8()..];
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_ast::ast::Comment;
    use oxc_span::Span;
    use std::fmt::Write as _;

    fn comment(source: &str, text: &str) -> Comment {
        let start = source.find(text).unwrap() as u32;
        Comment {
            span: Span::new(start, start + text.len() as u32),
            ..Comment::default()
        }
    }

    #[test]
    fn comment_cursor_keeps_contiguous_leading_trivia() {
        let source = "const value = 1; // trailing\n/* block */\nimport value from './value';";
        let comments = [
            comment(source, "// trailing"),
            comment(source, "/* block */"),
        ];
        let import_start = source.find("import value").unwrap();

        assert_eq!(
            scan_back_leading_comments(source.as_bytes(), import_start, &comments, comments.len())
                .0,
            0
        );
    }

    #[test]
    fn comment_cursor_scales_across_ordered_imports() {
        const IMPORTS: usize = 1_024;
        let mut source = String::with_capacity(IMPORTS * 40);
        let mut comments = Vec::with_capacity(IMPORTS);
        let mut import_starts = Vec::with_capacity(IMPORTS);
        for index in 0..IMPORTS {
            let comment_start = source.len() as u32;
            write!(source, "// import {index}").unwrap();
            comments.push(Comment {
                span: Span::new(comment_start, source.len() as u32),
                ..Comment::default()
            });
            source.push('\n');
            import_starts.push(source.len());
            writeln!(source, "import v{index} from './m';").unwrap();
        }

        let mut comment_cursor = 0;
        for (index, &import_start) in import_starts.iter().enumerate() {
            while comment_cursor < comments.len()
                && comments[comment_cursor].span.end <= import_start as u32
            {
                comment_cursor += 1;
            }
            assert_eq!(
                scan_back_leading_comments(
                    source.as_bytes(),
                    import_start,
                    &comments,
                    comment_cursor,
                )
                .0,
                index
            );
        }
    }
}
