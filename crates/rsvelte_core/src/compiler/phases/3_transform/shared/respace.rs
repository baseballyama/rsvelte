//! Blank-line normalization post-pass ("respace").
//!
//! The official Svelte compiler prints its output through esrap, which does
//! NOT preserve the blank lines of the input — it regenerates them with a
//! fixed set of rules (see `esrap/src/languages/ts/index.js`, `body()` /
//! `flush_comments_until` / the `_` universal visitor). rsvelte's
//! string-based codegen instead splices statements straight from source,
//! preserving the author's blank lines. The result compiles identically but
//! differs from the official output purely in blank lines.
//!
//! This module re-derives esrap's blank-line layout on the *final generated
//! text*:
//!
//! * For every statement list (Program body, `BlockStatement` body, function
//!   bodies, `ClassBody` members, `static {}` blocks — esrap routes all of
//!   these through the same `body()` helper) consecutive statements are
//!   separated by exactly one blank line ("margin") iff
//!   `current.multiline || previous.multiline || current.type !== previous.type`
//!   where the type is the ESTree node type (`VariableDeclaration` regardless
//!   of `var`/`let`/`const`, `ExpressionStatement`, …) and `multiline` means
//!   the statement's rendered text — *including its leading comments*, which
//!   esrap flushes into the statement's own render context — spans more than
//!   one line. Otherwise a single newline separates them.
//! * `EmptyStatement` nodes are skipped by esrap's `body()`.
//! * No blank line directly after the `{` opening a statement list, before
//!   its closing `}`, or before the first / after the last statement of the
//!   program.
//! * Comments on the same line as the previous statement's end are trailing
//!   comments of that statement (esrap's `flush_trailing_comments`); comments
//!   on later lines are leading comments of the next statement. Blank lines
//!   *between* a statement's leading comments and the statement itself are
//!   collapsed to a single newline (esrap's `flush_comments_until` emits one
//!   `newline()` per comment, never a margin, when flushing with
//!   `from === null`).
//! * Dangling comments after the last statement of a non-empty list are
//!   preceded by exactly one blank line (`flush_comments_until` with a
//!   non-null `from`: `margin() + newline()` when the comment starts on a
//!   later line than the last statement's end).
//! * `SwitchStatement` does NOT use `body()`: esrap always emits a margin
//!   between cases (regardless of multiline-ness or type) and never emits a
//!   margin between the statements of a case's consequent.
//!
//! The pass is intentionally conservative: it only rewrites gaps that consist
//! purely of whitespace **and already contain a newline**, it keeps every
//! statement's text verbatim, and it never reindents (the indentation of the
//! following line is preserved as-is). If the input fails to parse (some
//! intentionally non-standard generated async code), the text is returned
//! unchanged.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

thread_local! {
    static RESPACE_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Re-derive esrap's blank-line layout for a piece of generated JS.
///
/// Returns the input unchanged when it does not parse as an ES module or
/// when no adjustment is needed.
pub fn respace(js: &str) -> String {
    if js.is_empty() {
        return js.to_string();
    }

    RESPACE_ALLOCATOR.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());

        let result = {
            let parsed = Parser::new(&allocator, js, SourceType::mjs()).parse();

            if parsed.panicked || !parsed.errors.is_empty() {
                js.to_string()
            } else {
                let comments: Vec<(u32, u32)> = parsed
                    .program
                    .comments
                    .iter()
                    .map(|c| (c.span.start, c.span.end))
                    .collect();

                let mut respacer = Respacer {
                    text: js,
                    line_starts: build_line_starts(js),
                    comments,
                    edits: Vec::new(),
                };
                respacer.visit_program(&parsed.program);
                respacer.apply()
            }
        };

        let mut allocator = allocator;
        allocator.reset();
        *cell.borrow_mut() = allocator;

        result
    })
}

fn build_line_starts(text: &str) -> Vec<u32> {
    let mut starts = vec![0u32];
    for (i, b) in text.bytes().enumerate() {
        if b == b'\n' {
            starts.push(i as u32 + 1);
        }
    }
    starts
}

/// How a statement list is laid out by esrap.
#[derive(Clone, Copy, PartialEq)]
enum ListKind {
    /// Program body: no surrounding braces; nothing before the first unit,
    /// a single trailing newline after the last.
    Program,
    /// `{ ... }` of a block / function body / class body / static block:
    /// margins follow the `body()` rule.
    Braced,
    /// The cases of a `switch` statement: a margin between every pair.
    Cases,
    /// The consequent statements of a single `switch` case: never a margin.
    Consequent,
}

/// One "unit" of a statement list: the statement plus its leading comments
/// (and same-line trailing comments, which extend `end` but not `stmt_end`).
struct Unit {
    /// Start of the unit (first leading comment, or the statement itself).
    start: u32,
    /// End of the statement proper (esrap's `multiline` ignores trailing comments).
    stmt_end: u32,
    /// End of the unit including same-line trailing comments.
    end: u32,
    /// ESTree node type, for esrap's `current.type !== previous.type` check.
    ty: &'static str,
    /// Whether the rendered unit (leading comments + statement) spans >1 line.
    multiline: bool,
}

struct Edit {
    start: u32,
    end: u32,
    replacement: String,
}

struct Respacer<'t> {
    text: &'t str,
    line_starts: Vec<u32>,
    /// All comment spans, sorted by start offset.
    comments: Vec<(u32, u32)>,
    edits: Vec<Edit>,
}

impl<'t> Respacer<'t> {
    fn line_of(&self, offset: u32) -> usize {
        self.line_starts.partition_point(|&s| s <= offset) - 1
    }

    /// Comments fully contained in `[lo, hi)`.
    fn comments_in(&self, lo: u32, hi: u32) -> &[(u32, u32)] {
        let from = self.comments.partition_point(|&(s, _)| s < lo);
        let to = self.comments.partition_point(|&(s, _)| s < hi);
        let slice = &self.comments[from..to];
        // Drop comments that extend past `hi` (cannot happen for well-formed
        // gaps, but keeps the slice safe to use as unit boundaries).
        let mut end = slice.len();
        while end > 0 && slice[end - 1].1 > hi {
            end -= 1;
        }
        &slice[..end]
    }

    fn slice(&self, start: u32, end: u32) -> &'t str {
        &self.text[start as usize..end as usize]
    }

    /// Queue `replacement` for the pure-whitespace gap `[start, end)` if the
    /// gap is indeed pure whitespace and the replacement differs.
    fn push_edit(&mut self, start: u32, end: u32, replacement: String) {
        if start > end {
            return;
        }
        let original = self.slice(start, end);
        if !original.bytes().all(|b| b.is_ascii_whitespace()) {
            return;
        }
        if original == replacement {
            return;
        }
        self.edits.push(Edit {
            start,
            end,
            replacement,
        });
    }

    /// Rewrite a whitespace gap to `newlines` + the gap's existing trailing
    /// indentation. Only fires when the gap is pure whitespace that already
    /// contains a newline (we never join or split lines, only adjust how many
    /// blank lines separate them).
    fn normalize_gap(&mut self, start: u32, end: u32, margin: bool) {
        let gap = self.slice(start, end);
        if gap.is_empty() || !gap.bytes().all(|b| b.is_ascii_whitespace()) || !gap.contains('\n') {
            return;
        }
        let indent = &gap[gap.rfind('\n').unwrap() + 1..];
        let mut replacement = String::with_capacity(2 + indent.len());
        replacement.push('\n');
        if margin {
            replacement.push('\n');
        }
        replacement.push_str(indent);
        self.push_edit(start, end, replacement);
    }

    /// Process one statement list. `items` are `(start, end, estree_type)`
    /// triples in source order (EmptyStatement already filtered out).
    /// `open_bound` is the offset just after the construct that opens the
    /// list (`{`, `:` of a switch case, or 0 for the program); `close_bound`
    /// is the offset of the closing `}` / the start of the next switch case /
    /// the text length for the program.
    fn process_list(
        &mut self,
        items: &[(u32, u32, &'static str)],
        open_bound: u32,
        close_bound: u32,
        kind: ListKind,
    ) {
        if items.is_empty() {
            return;
        }

        // ---- Build units (absorb trailing + leading comments). ----
        let mut units: Vec<Unit> = Vec::with_capacity(items.len());

        for (i, &(item_start, item_end, ty)) in items.iter().enumerate() {
            // Same-line comments after the previous statement are trailing
            // comments of the previous unit (esrap `flush_trailing_comments`).
            if i > 0 {
                let prev = units.last_mut().unwrap();
                let prev_line = {
                    let line_starts = &self.line_starts;
                    line_starts.partition_point(|&s| s <= prev.stmt_end.saturating_sub(1)) - 1
                };
                let trailing: Vec<(u32, u32)> = self.comments_in(prev.end, item_start).to_vec();
                for (c_start, c_end) in trailing {
                    if self.line_of(c_start) == prev_line {
                        prev.end = c_end;
                    } else {
                        break;
                    }
                }
            }

            let lead_lo = if i == 0 {
                open_bound
            } else {
                units.last().unwrap().end
            };
            let leading: Vec<(u32, u32)> = self.comments_in(lead_lo, item_start).to_vec();
            let unit_start = leading.first().map(|&(s, _)| s).unwrap_or(item_start);

            // esrap's `flush_comments_until` (from === null) puts exactly one
            // newline between consecutive leading comments and between the
            // last comment and the statement — collapse blank lines there.
            if kind != ListKind::Cases {
                for w in leading.windows(2) {
                    self.normalize_gap(w[0].1, w[1].0, false);
                }
                if let Some(&(_, last_comment_end)) = leading.last() {
                    self.normalize_gap(last_comment_end, item_start, false);
                }
            }

            let multiline = self.line_of(unit_start) != self.line_of(item_end.saturating_sub(1));

            units.push(Unit {
                start: unit_start,
                stmt_end: item_end,
                end: item_end,
                ty,
                multiline,
            });
        }

        // Trailing comments of the last unit (bounded by the list's close).
        {
            let last = units.last_mut().unwrap();
            let prev_line = {
                let line_starts = &self.line_starts;
                line_starts.partition_point(|&s| s <= last.stmt_end.saturating_sub(1)) - 1
            };
            let trailing: Vec<(u32, u32)> = self.comments_in(last.end, close_bound).to_vec();
            for (c_start, c_end) in trailing {
                if self.line_of(c_start) == prev_line {
                    last.end = c_end;
                } else {
                    break;
                }
            }
        }

        // ---- Opening gap. ----
        let first_start = units[0].start;
        if kind == ListKind::Program {
            // esrap output never starts with whitespace.
            if open_bound < first_start {
                self.push_edit(open_bound, first_start, String::new());
            }
        } else {
            // No blank line directly after `{` (or after a case's `:`).
            self.normalize_gap(open_bound, first_start, false);
        }

        // ---- Gaps between units. ----
        for i in 1..units.len() {
            let margin = match kind {
                ListKind::Cases => true,
                ListKind::Consequent => false,
                ListKind::Program | ListKind::Braced => {
                    units[i - 1].multiline || units[i].multiline || units[i - 1].ty != units[i].ty
                }
            };
            self.normalize_gap(units[i - 1].end, units[i].start, margin);
        }

        // ---- Dangling comments + closing gap. ----
        let last_end = units.last().unwrap().end;
        let dangling: Vec<(u32, u32)> = self.comments_in(last_end, close_bound).to_vec();

        match kind {
            ListKind::Consequent => {
                // Handled by the enclosing switch (next case / closing `}`).
            }
            ListKind::Cases if !dangling.is_empty() => {
                // esrap leaves comments after the last case to be flushed by
                // whatever node comes next — leave the text alone.
            }
            _ => {
                if let (Some(&(first_c, _)), Some(&(_, last_c_end))) =
                    (dangling.first(), dangling.last())
                {
                    // One blank line before dangling comments
                    // (`flush_comments_until` with non-null `from`).
                    self.normalize_gap(last_end, first_c, true);
                    for w in dangling.windows(2) {
                        self.normalize_gap(w[0].1, w[1].0, false);
                    }
                    self.close_list(last_c_end, close_bound, kind);
                } else {
                    self.close_list(last_end, close_bound, kind);
                }
            }
        }
    }

    fn close_list(&mut self, content_end: u32, close_bound: u32, kind: ListKind) {
        if kind == ListKind::Program {
            // Exactly one trailing newline at the end of the program (when
            // the tail is whitespace that already contains a newline).
            let gap = self.slice(content_end, close_bound);
            if !gap.is_empty() && gap.bytes().all(|b| b.is_ascii_whitespace()) && gap.contains('\n')
            {
                self.push_edit(content_end, close_bound, "\n".to_string());
            }
        } else {
            // No blank line before the closing `}`.
            self.normalize_gap(content_end, close_bound, false);
        }
    }

    /// Process a braced statement-list container whose span starts at `{`
    /// and ends just after `}`.
    fn process_braced(&mut self, span: oxc_span::Span, items: &[(u32, u32, &'static str)]) {
        let bytes = self.text.as_bytes();
        let (start, end) = (span.start as usize, span.end as usize);
        if end == 0 || end > bytes.len() || start >= bytes.len() {
            return;
        }
        if bytes[start] != b'{' || bytes[end - 1] != b'}' {
            return;
        }
        self.process_list(items, span.start + 1, span.end - 1, ListKind::Braced);
    }

    fn apply(mut self) -> String {
        if self.edits.is_empty() {
            return self.text.to_string();
        }
        self.edits.sort_by_key(|e| e.start);

        let mut out = String::with_capacity(self.text.len());
        let mut cursor = 0usize;
        for edit in &self.edits {
            let (start, end) = (edit.start as usize, edit.end as usize);
            if start < cursor {
                // Overlapping edit (should not happen) — skip defensively.
                continue;
            }
            out.push_str(&self.text[cursor..start]);
            out.push_str(&edit.replacement);
            cursor = end;
        }
        out.push_str(&self.text[cursor..]);
        out
    }
}

/// ESTree node type of a statement, as esrap compares them
/// (`child.type !== prev_type`).
fn stmt_type(stmt: &Statement) -> Option<&'static str> {
    Some(match stmt {
        Statement::BlockStatement(_) => "BlockStatement",
        Statement::BreakStatement(_) => "BreakStatement",
        Statement::ContinueStatement(_) => "ContinueStatement",
        Statement::DebuggerStatement(_) => "DebuggerStatement",
        Statement::DoWhileStatement(_) => "DoWhileStatement",
        // esrap's `body()` skips EmptyStatement entirely.
        Statement::EmptyStatement(_) => return None,
        Statement::ExpressionStatement(_) => "ExpressionStatement",
        Statement::ForInStatement(_) => "ForInStatement",
        Statement::ForOfStatement(_) => "ForOfStatement",
        Statement::ForStatement(_) => "ForStatement",
        Statement::IfStatement(_) => "IfStatement",
        Statement::LabeledStatement(_) => "LabeledStatement",
        Statement::ReturnStatement(_) => "ReturnStatement",
        Statement::SwitchStatement(_) => "SwitchStatement",
        Statement::ThrowStatement(_) => "ThrowStatement",
        Statement::TryStatement(_) => "TryStatement",
        Statement::WhileStatement(_) => "WhileStatement",
        Statement::WithStatement(_) => "WithStatement",
        Statement::VariableDeclaration(_) => "VariableDeclaration",
        Statement::FunctionDeclaration(_) => "FunctionDeclaration",
        Statement::ClassDeclaration(_) => "ClassDeclaration",
        Statement::ImportDeclaration(_) => "ImportDeclaration",
        Statement::ExportAllDeclaration(_) => "ExportAllDeclaration",
        Statement::ExportDefaultDeclaration(_) => "ExportDefaultDeclaration",
        Statement::ExportNamedDeclaration(_) => "ExportNamedDeclaration",
        // TS-only statements cannot appear in the generated JS we parse
        // (SourceType::mjs()), but keep the match exhaustive.
        Statement::TSTypeAliasDeclaration(_) => "TSTypeAliasDeclaration",
        Statement::TSInterfaceDeclaration(_) => "TSInterfaceDeclaration",
        Statement::TSEnumDeclaration(_) => "TSEnumDeclaration",
        Statement::TSModuleDeclaration(_) => "TSModuleDeclaration",
        Statement::TSGlobalDeclaration(_) => "TSGlobalDeclaration",
        Statement::TSImportEqualsDeclaration(_) => "TSImportEqualsDeclaration",
        Statement::TSExportAssignment(_) => "TSExportAssignment",
        Statement::TSNamespaceExportDeclaration(_) => "TSNamespaceExportDeclaration",
    })
}

fn class_element_type(element: &ClassElement) -> &'static str {
    match element {
        ClassElement::StaticBlock(_) => "StaticBlock",
        ClassElement::MethodDefinition(_) => "MethodDefinition",
        ClassElement::PropertyDefinition(_) => "PropertyDefinition",
        ClassElement::AccessorProperty(_) => "AccessorProperty",
        ClassElement::TSIndexSignature(_) => "TSIndexSignature",
    }
}

/// Collect `(start, end, type)` items for a directive prologue + statement
/// list. ESTree represents directives as `ExpressionStatement`s in the body.
fn statement_items(
    directives: &[Directive],
    statements: &[Statement],
) -> Vec<(u32, u32, &'static str)> {
    let mut items = Vec::with_capacity(directives.len() + statements.len());
    for directive in directives {
        items.push((
            directive.span.start,
            directive.span.end,
            "ExpressionStatement",
        ));
    }
    for stmt in statements {
        if let Some(ty) = stmt_type(stmt) {
            let span = stmt.span();
            items.push((span.start, span.end, ty));
        }
    }
    items
}

impl<'a> Visit<'a> for Respacer<'_> {
    fn visit_program(&mut self, it: &Program<'a>) {
        let items = statement_items(&it.directives, &it.body);
        self.process_list(&items, 0, self.text.len() as u32, ListKind::Program);
        walk::walk_program(self, it);
    }

    fn visit_block_statement(&mut self, it: &BlockStatement<'a>) {
        let items = statement_items(&[], &it.body);
        self.process_braced(it.span, &items);
        walk::walk_block_statement(self, it);
    }

    fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
        // Concise arrow bodies (`x => y`) reuse FunctionBody without braces;
        // only braced bodies are statement lists (`process_braced` verifies
        // the `{` / `}` bytes).
        let items = statement_items(&it.directives, &it.statements);
        self.process_braced(it.span, &items);
        walk::walk_function_body(self, it);
    }

    fn visit_static_block(&mut self, it: &StaticBlock<'a>) {
        // The span starts at the `static` keyword; locate the opening `{`.
        let rel = self.text[it.span.start as usize..it.span.end as usize].find('{');
        if let Some(rel) = rel {
            let open = it.span.start + rel as u32;
            let bytes = self.text.as_bytes();
            if it.span.end >= 1 && bytes[it.span.end as usize - 1] == b'}' {
                let items = statement_items(&[], &it.body);
                self.process_list(&items, open + 1, it.span.end - 1, ListKind::Braced);
            }
        }
        walk::walk_static_block(self, it);
    }

    fn visit_class_body(&mut self, it: &ClassBody<'a>) {
        let items: Vec<(u32, u32, &'static str)> = it
            .body
            .iter()
            .map(|element| {
                let span = element.span();
                (span.start, span.end, class_element_type(element))
            })
            .collect();
        self.process_braced(it.span, &items);
        walk::walk_class_body(self, it);
    }

    fn visit_switch_statement(&mut self, it: &SwitchStatement<'a>) {
        let bytes = self.text.as_bytes();
        let close = it.span.end.wrapping_sub(1);
        let has_close_brace = (close as usize) < bytes.len() && bytes[close as usize] == b'}';

        if has_close_brace && !it.cases.is_empty() {
            // esrap always separates switch cases with a margin and never
            // separates the statements of a consequent with one.
            let case_items: Vec<(u32, u32, &'static str)> = it
                .cases
                .iter()
                .map(|case| (case.span.start, case.span.end, "SwitchCase"))
                .collect();

            // Locate the `{` after the discriminant (`switch (expr) {`).
            let disc_end = it.discriminant.span().end as usize;
            if let Some(rel) = self.text[disc_end..it.cases[0].span.start as usize].find('{') {
                let open = (disc_end + rel) as u32;
                self.process_list(&case_items, open + 1, close, ListKind::Cases);
            }

            for (i, case) in it.cases.iter().enumerate() {
                let items = statement_items(&[], &case.consequent);
                if items.is_empty() {
                    continue;
                }
                // Locate the `:` that opens the consequent.
                let scan_from = case
                    .test
                    .as_ref()
                    .map(|t| t.span().end)
                    .unwrap_or(case.span.start) as usize;
                let scan_to = items[0].0 as usize;
                if scan_to <= scan_from {
                    continue;
                }
                if let Some(rel) = self.text[scan_from..scan_to].find(':') {
                    let open = (scan_from + rel) as u32 + 1;
                    let close_bound = it
                        .cases
                        .get(i + 1)
                        .map(|next| next.span.start)
                        .unwrap_or(close);
                    self.process_list(&items, open, close_bound, ListKind::Consequent);
                }
            }
        }

        walk::walk_switch_statement(self, it);
    }
}

#[cfg(test)]
mod tests {
    use super::respace;

    #[test]
    fn removes_blank_between_same_type_single_line() {
        let input = "let a = 1;\n\nlet b = 2;\n";
        assert_eq!(respace(input), "let a = 1;\nlet b = 2;\n");
    }

    #[test]
    fn adds_margin_between_different_types() {
        let input = "let a = 1;\nconsole.log(a);\n";
        assert_eq!(respace(input), "let a = 1;\n\nconsole.log(a);\n");
    }

    #[test]
    fn var_kinds_share_a_type() {
        let input = "var a = 1;\nlet b = 2;\nconst c = 3;\n";
        assert_eq!(respace(input), input);
    }

    #[test]
    fn margin_around_multiline_statement() {
        let input = "let a = 1;\nlet b = {\n\tx: 1\n};\nlet c = 2;\n";
        assert_eq!(
            respace(input),
            "let a = 1;\n\nlet b = {\n\tx: 1\n};\n\nlet c = 2;\n"
        );
    }

    #[test]
    fn no_blank_at_block_edges() {
        let input = "function f() {\n\n\tlet a = 1;\n\tlet b = 2;\n\n}\n";
        assert_eq!(
            respace(input),
            "function f() {\n\tlet a = 1;\n\tlet b = 2;\n}\n"
        );
    }

    #[test]
    fn imports_grouped_without_margin() {
        let input = "import a from 'a';\n\nimport b from 'b';\n\nlet c = 1;\n";
        assert_eq!(
            respace(input),
            "import a from 'a';\nimport b from 'b';\n\nlet c = 1;\n"
        );
    }

    #[test]
    fn leading_comment_makes_unit_multiline() {
        // `// hi` + statement spans two lines, so margins fire on both sides
        // even though the neighbours share the statement type.
        let input = "let a = 1;\n// hi\nlet b = 2;\nlet c = 3;\n";
        assert_eq!(
            respace(input),
            "let a = 1;\n\n// hi\nlet b = 2;\n\nlet c = 3;\n"
        );
    }

    #[test]
    fn trailing_comment_stays_with_statement() {
        let input = "let a = 1; // one\nlet b = 2;\n";
        assert_eq!(respace(input), input);
    }

    #[test]
    fn blank_between_leading_comment_and_statement_collapsed() {
        let input = "// hi\n\nlet a = 1;\n";
        assert_eq!(respace(input), "// hi\nlet a = 1;\n");
    }

    #[test]
    fn switch_cases_always_margined_consequent_never() {
        let input = "switch (a) {\n\tcase 1:\n\t\tfoo();\n\n\t\tbar();\n\tcase 2:\n\t\tbaz();\n\n\tdefault:\n\t\tqux();\n}\n";
        assert_eq!(
            respace(input),
            "switch (a) {\n\tcase 1:\n\t\tfoo();\n\t\tbar();\n\n\tcase 2:\n\t\tbaz();\n\n\tdefault:\n\t\tqux();\n}\n"
        );
    }

    #[test]
    fn class_members_margin_by_type_and_multiline() {
        let input = "class A {\n\ta = 1;\n\tb = 2;\n\tfoo() {\n\t\treturn 1;\n\t}\n\tbar() {\n\t\treturn 2;\n\t}\n}\n";
        assert_eq!(
            respace(input),
            "class A {\n\ta = 1;\n\tb = 2;\n\n\tfoo() {\n\t\treturn 1;\n\t}\n\n\tbar() {\n\t\treturn 2;\n\t}\n}\n"
        );
    }

    #[test]
    fn parse_failure_returns_input() {
        let input = "let let let;\n\n\nnope(";
        assert_eq!(respace(input), input);
    }

    #[test]
    fn single_line_blocks_untouched() {
        let input = "const f = () => ({ a: 1 });\n\nconst g = () => 1;\n";
        assert_eq!(
            respace(input),
            "const f = () => ({ a: 1 });\nconst g = () => 1;\n"
        );
    }

    #[test]
    fn dangling_comment_before_close_brace() {
        let input = "function f() {\n\tlet a = 1;\n\t// done\n}\n";
        assert_eq!(
            respace(input),
            "function f() {\n\tlet a = 1;\n\n\t// done\n}\n"
        );
    }

    #[test]
    fn idempotent() {
        let input = "import a from 'a';\nlet b = 1;\nfunction f() {\n\tif (b) {\n\t\tf();\n\t}\n\treturn b;\n}\n";
        let once = respace(input);
        assert_eq!(respace(&once), once);
    }

    #[test]
    fn blank_lines_in_template_literals_untouched() {
        // The template literal's interior blank lines are statement content
        // and stay verbatim; the multiline statement gets a margin after it.
        let input = "var root = $.template(`<div>\n\n\n</div>`);\nvar a = 1;\n";
        assert_eq!(
            respace(input),
            "var root = $.template(`<div>\n\n\n</div>`);\n\nvar a = 1;\n"
        );
    }
}
