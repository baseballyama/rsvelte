//! AST-based `$inspect.trace(...)` lowering for module scripts
//! (`.svelte.js` / `.svelte.ts`).
//!
//! Mirrors the pair of upstream visitors that answer for the rune: phase 2's
//! `CallExpression` records `scope.tracing` (the label thunk), and the client
//! `BlockStatement` visitor turns the enclosing function body into
//!
//! ```text
//! { return $.trace(<label thunk>, () => { …rest of the body… }); }
//! ```
//!
//! Module scripts had no equivalent at all, so `$inspect.trace(…)` survived
//! into the output and threw `ReferenceError: $inspect is not defined` when the
//! module ran; the non-dev removal was a `memmem` scan that also deleted the
//! same bytes out of a string literal.
//!
//! The default label carries `locate_node(fn)`, a position in the source the
//! user wrote, so this pass runs before any other module rewrite moves the
//! enclosing function.

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};
use std::cell::RefCell;

use super::ast_rewrite::{self, Edit};

thread_local! {
    static INSPECT_TRACE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Cheap byte probe gating entry into the pass.
pub(super) fn source_has_inspect_trace(s: &str) -> bool {
    memchr::memmem::find(s.as_bytes(), b"$inspect.trace").is_some()
}

/// Lower (dev) or remove (non-dev) every `$inspect.trace(…)` in a module
/// script. Returns `None` when nothing matched, so the caller keeps its
/// existing `String`.
pub(super) fn transform_module_inspect_trace(
    source: &str,
    dev: bool,
    is_ts: bool,
    filename: Option<&str>,
) -> Option<String> {
    if !source_has_inspect_trace(source) {
        return None;
    }
    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    ast_rewrite::rewrite_batched(
        &INSPECT_TRACE_ALLOC,
        source,
        source_type,
        ParseOptions::default(),
        |program, src| {
            let mut collector = TraceCollector {
                source: src,
                filename,
                dev,
                parent_label: None,
                edits: Vec::new(),
            };
            collector.visit_program(program);
            collector.edits
        },
    )
}

struct TraceCollector<'src> {
    source: &'src str,
    filename: Option<&'src str>,
    dev: bool,
    /// The label the *immediate* parent of a function gives it, mirroring
    /// `get_function_label`'s `nodes.at(-2)` lookup. Taken by the function it
    /// was set for, so it never leaks into a nested one.
    parent_label: Option<String>,
    edits: Vec<Edit>,
}

impl<'src> TraceCollector<'src> {
    fn text(&self, span: oxc_span::Span) -> &'src str {
        &self.source[span.start as usize..span.end as usize]
    }

    /// `locate_node(fn)`: 1-based line, 0-based column of the function's start.
    fn locate(&self, at: u32) -> (usize, usize) {
        let before = &self.source[..at as usize];
        let line = before.matches('\n').count() + 1;
        let col = before[before.rfind('\n').map_or(0, |p| p + 1)..]
            .chars()
            .count();
        (line, col)
    }

    /// The `$inspect.trace(…)` call when it leads `body`, as upstream requires
    /// (`parent` an `ExpressionStatement`, `grand_parent` the function's own
    /// `BlockStatement`, and `grand_parent.body[0] === parent`).
    fn leading_trace_call<'a>(body: &'a FunctionBody<'a>) -> Option<&'a CallExpression<'a>> {
        let Statement::ExpressionStatement(stmt) = body.statements.first()? else {
            return None;
        };
        let Expression::CallExpression(call) = &stmt.expression else {
            return None;
        };
        let Expression::StaticMemberExpression(member) = &call.callee else {
            return None;
        };
        let Expression::Identifier(object) = &member.object else {
            return None;
        };
        (object.name == "$inspect" && member.property.name == "trace").then_some(call)
    }

    /// Record the body rewrite for a function whose first statement is the
    /// rune. `own_label` is the function's own name, which outranks the one its
    /// parent supplies.
    fn rewrite_body(
        &mut self,
        body: &FunctionBody<'_>,
        is_async: bool,
        own_label: Option<&str>,
        fn_start: u32,
    ) {
        let Some(call) = Self::leading_trace_call(body) else {
            return;
        };
        let stmt_span = body.statements[0].span();

        if !self.dev {
            // Upstream returns `b.empty` for the statement; nothing else moves.
            self.edits
                .push((stmt_span.start, stmt_span.end, String::new()));
            return;
        }

        let label_thunk = match call.arguments.first().and_then(|a| a.as_expression()) {
            Some(arg) => format!("() => {}", self.text(arg.span()).trim()),
            None => {
                let label = own_label
                    .map(str::to_string)
                    .or_else(|| self.parent_label.clone())
                    .unwrap_or_else(|| "trace".to_string());
                match self.filename {
                    // `locate_node` runs the path through `sanitize_location`.
                    Some(filename) => {
                        let (line, col) = self.locate(fn_start);
                        let filename = filename.replace('/', "/\u{200b}");
                        // esrap prints a string literal from its `raw`, and an
                        // IIFE's label is its whole source text — newlines and all.
                        let label = super::inspect_rune_ast::escape_single_quoted(&label);
                        format!("() => '{label} ({filename}:{line}:{col})'")
                    }
                    None => format!(
                        "() => '{}'",
                        super::inspect_rune_ast::escape_single_quoted(&label)
                    ),
                }
            }
        };

        // `body.span.end` is the byte after the closing `}`.
        let rest = self.source[stmt_span.end as usize..body.span.end as usize - 1].trim();
        let (awaited, asyncness) = if is_async {
            ("await ", "async ")
        } else {
            ("", "")
        };
        let traced = if rest.is_empty() {
            String::new()
        } else {
            format!(" {rest} ")
        };
        self.edits.push((
            body.span.start,
            body.span.end,
            format!("{{ return {awaited}$.trace({label_thunk}, {asyncness}() => {{{traced}}}); }}"),
        ));
    }
}

impl<'a, 'src> Visit<'a> for TraceCollector<'src> {
    fn visit_statement(&mut self, it: &Statement<'a>) {
        self.parent_label = None;
        walk::walk_statement(self, it);
    }

    fn visit_class(&mut self, it: &Class<'a>) {
        // `get_function_label` has no arm for a class member, so a method never
        // inherits the label the class's own declarator would give it.
        self.parent_label = None;
        walk::walk_class(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        if let BindingPattern::BindingIdentifier(id) = &it.id {
            self.parent_label = Some(id.name.to_string());
        }
        walk::walk_variable_declarator(self, it);
        self.parent_label = None;
    }

    fn visit_object_property(&mut self, it: &ObjectProperty<'a>) {
        if !it.computed
            && let Some(name) = it.key.static_name()
        {
            self.parent_label = Some(name.to_string());
        }
        walk::walk_object_property(self, it);
        self.parent_label = None;
    }

    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        // oxc keeps a `ParenthesizedExpression` that acorn — and so upstream's
        // `get_function_label` — never sees, and an IIFE's callee always has one.
        let callee = super::inspect_rune_ast::unparen(&it.callee);
        let label = format!("{}(...)", self.text(callee.span()));
        // An IIFE lends the label to the callee itself, not only to arguments.
        self.parent_label = matches!(
            callee,
            Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_)
        )
        .then(|| label.clone());
        self.visit_expression(&it.callee);
        for argument in &it.arguments {
            self.parent_label = Some(label.clone());
            self.visit_argument(argument);
        }
        self.parent_label = None;
    }

    fn visit_function(&mut self, it: &Function<'a>, flags: oxc_syntax::scope::ScopeFlags) {
        let label = self.parent_label.take();
        if let Some(body) = &it.body {
            let own = it.id.as_ref().map(|id| id.name.as_str());
            self.parent_label = label;
            self.rewrite_body(body, it.r#async, own, it.span.start);
            self.parent_label = None;
        }
        walk::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'a>) {
        // An expression-bodied arrow has no block for the rune to lead.
        if let ArrowFunctionBody::FunctionBody(body) = &it.body {
            self.rewrite_body(body, it.r#async, None, it.span.start);
        }
        self.parent_label = None;
        walk::walk_arrow_function_expression(self, it);
    }
}

#[cfg(test)]
mod tests {
    use super::transform_module_inspect_trace;

    fn dev(source: &str) -> Option<String> {
        transform_module_inspect_trace(source, true, false, Some("m.svelte.js"))
    }

    #[test]
    fn a_labelled_call_uses_its_own_argument() {
        let out = dev("export function go() { $inspect.trace(\"t\"); return 1; }").unwrap();
        assert!(
            out.contains("return $.trace(() => \"t\", () => { return 1; })"),
            "got: {out}"
        );
    }

    #[test]
    fn an_unlabelled_call_falls_back_to_the_function_name_and_position() {
        let out =
            dev("let base = 1;\nexport function go() { $inspect.trace(); return base; }").unwrap();
        assert!(out.contains("() => 'go (m.svelte.js:2:7)'"), "got: {out}");
    }

    /// Every label arm of `get_function_label`, and the fallback a class member
    /// gets because upstream has no arm for one.
    #[test]
    fn the_label_comes_from_the_functions_immediate_parent() {
        for (source, expected) in [
            ("export const go = () => { $inspect.trace(); };", "go ("),
            (
                "export const go = function () { $inspect.trace(); };",
                "go (",
            ),
            ("export const o = { go() { $inspect.trace(); } };", "go ("),
            (
                "export function go() { $effect(() => { $inspect.trace(); }); }",
                "$effect(...) (",
            ),
            ("export class C { go() { $inspect.trace(); } }", "trace ("),
        ] {
            let out = dev(source).unwrap();
            assert!(out.contains(expected), "{source}\ngot: {out}");
        }
    }

    /// Each call is located from its *own* function: the text predecessor took
    /// the first `$inspect.trace(` in the file and labelled both with it.
    #[test]
    fn two_traced_functions_get_two_positions() {
        let out = dev(
            "export function a() { $inspect.trace(); }\nexport function b() { $inspect.trace(); }",
        )
        .unwrap();
        assert!(out.contains("() => 'a (m.svelte.js:1:7)'"), "got: {out}");
        assert!(out.contains("() => 'b (m.svelte.js:2:7)'"), "got: {out}");
    }

    #[test]
    fn an_async_function_awaits_the_trace() {
        let out = dev("export async function go() { $inspect.trace(); return 1; }").unwrap();
        assert!(
            out.contains("return await $.trace(() => 'go (m.svelte.js:1:7)', async () => {"),
            "got: {out}"
        );
    }

    #[test]
    fn a_nested_function_is_traced_where_it_stands() {
        let out =
            dev("export function go() { function inner() { $inspect.trace(); } return inner; }")
                .unwrap();
        assert!(out.contains("() => 'inner ("), "got: {out}");
        assert!(!out.contains("$inspect.trace"), "got: {out}");
    }

    #[test]
    fn without_dev_the_statement_is_only_removed() {
        let out = transform_module_inspect_trace(
            "export function go() { $inspect.trace(); return 1; }",
            false,
            false,
            Some("m.svelte.js"),
        )
        .unwrap();
        assert!(!out.contains("$inspect"), "got: {out}");
        assert!(!out.contains("$.trace"), "got: {out}");
        assert!(out.contains("return 1;"), "got: {out}");
    }

    /// The bytes in a string literal are not the rune — the `memmem` scan this
    /// pass replaces deleted them out of one.
    #[test]
    fn rune_shaped_bytes_in_a_string_are_left_alone() {
        for is_dev in [true, false] {
            assert!(
                transform_module_inspect_trace(
                    "export const s = \"$inspect.trace()\";",
                    is_dev,
                    false,
                    Some("m.svelte.js")
                )
                .is_none(),
                "dev={is_dev}"
            );
        }
    }

    /// Upstream requires the rune to lead a *block*, so a call anywhere else is
    /// left for phase 2 to reject rather than silently rewritten here.
    #[test]
    fn a_call_that_does_not_lead_a_block_is_not_rewritten() {
        assert!(dev("export const go = () => $inspect.trace();").is_none());
        assert!(dev("export function go() { let x = 1; $inspect.trace(); }").is_none());
    }
}
