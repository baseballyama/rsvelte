//! Instance/module `<script>` scanning — import extraction and top-level-await
//! detection. Mirrors `svelte2tsx/nodes/Scripts.ts` plus the scanning half of
//! `processInstanceScriptContent.ts`.

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

/// A run of adjacent top-level import declarations that
/// `moveAllInstanceImports` hoists as one chunk. Positions are relative to the
/// script content.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ImportGroup {
    /// TS `pos` of the first import: the end of the previous statement, or 0.
    pub(crate) pos: u32,
    pub(crate) end: u32,
}

/// Group the instance script's top-level imports the way
/// `moveAllInstanceImports` walks `tsAst.statements`: any other statement
/// closes the current group. Nested imports (namespace bodies) are not moved.
pub fn instance_import_groups(program: &oxc::Program) -> Vec<ImportGroup> {
    use oxc_span::GetSpan;

    // TypeScript has no directive node, so a prologue string is the statement
    // whose end the first import's `pos` sits at.
    let mut previous_end = program.directives.last().map_or(0, |d| d.span.end);
    let mut groups = Vec::new();
    let mut pending: Option<ImportGroup> = None;
    for statement in &program.body {
        let span = statement.span();
        if matches!(statement, oxc::Statement::ImportDeclaration(_)) {
            match &mut pending {
                Some(group) => group.end = span.end,
                None => {
                    pending = Some(ImportGroup {
                        pos: previous_end,
                        end: span.end,
                    });
                }
            }
        } else if let Some(group) = pending.take() {
            groups.push(group);
        }
        previous_end = span.end;
    }
    groups.extend(pending);
    groups
}

/// End of the last top-level import (`getTopLevelImports(...)` sorted by end).
pub fn last_top_level_import_end(program: &oxc::Program) -> Option<u32> {
    program
        .body
        .iter()
        .filter_map(|statement| match statement {
            oxc::Statement::ImportDeclaration(import) => Some(import.span.end),
            _ => None,
        })
        .max()
}

/// `nextLineOrNonWhitespace`: skip single-line whitespace, then at most one
/// line break.
pub fn next_line_or_non_whitespace(text: &str, pos: u32) -> u32 {
    let mut index = pos as usize;
    while let Some(ch) = text.get(index..).and_then(|rest| rest.chars().next()) {
        if !is_white_space_single_line(ch) {
            break;
        }
        index += ch.len_utf8();
    }
    let bytes = text.as_bytes();
    if bytes.get(index) == Some(&b'\r') {
        index += 1;
    }
    if bytes.get(index) == Some(&b'\n') {
        index += 1;
    }
    u32::try_from(index).expect("script offset fits in u32")
}

/// `ts.isWhiteSpaceSingleLine`.
const fn is_white_space_single_line(ch: char) -> bool {
    matches!(
        ch,
        ' ' | '\t' | '\u{000B}' | '\u{000C}' | '\u{0085}' | '\u{00A0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200B}' | '\u{202F}' | '\u{205F}' | '\u{3000}' | '\u{FEFF}'
    )
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
    use super::next_line_or_non_whitespace;

    #[test]
    fn next_line_or_non_whitespace_takes_at_most_one_line_break() {
        assert_eq!(next_line_or_non_whitespace("  \t\nx", 0), 4);
        assert_eq!(next_line_or_non_whitespace(" \r\n\nx", 0), 3);
        assert_eq!(next_line_or_non_whitespace("\u{00A0}x", 0), 2);
        assert_eq!(next_line_or_non_whitespace("x\n", 0), 0);
        assert_eq!(next_line_or_non_whitespace("ab", 2), 2);
    }
}
