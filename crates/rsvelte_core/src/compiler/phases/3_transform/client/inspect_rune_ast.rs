//! AST-based dev-mode `$inspect` lowering for module scripts
//! (`.svelte.js` / `.svelte.ts`).
//!
//! Mirrors `transform_inspect_rune` in the official compiler's
//! `visitors/CallExpression.js`:
//!
//! ```text
//! $inspect(a, b)          -> $.inspect(() => [a, b], (...$$args) => console.log(...$$args), true)
//! $inspect(a).with(cb)    -> $.inspect(() => [a], (...$$args) => cb(...$$args))
//! ```
//!
//! The component instance script gets this from the state-transform visitor;
//! module scripts had no equivalent, so the rune survived into the output and
//! threw `ReferenceError: $inspect is not defined` when the module ran.
//!
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_span::GetSpan;

use super::ast_rewrite::Edit;

/// Cheap byte probe gating entry into the AST pass.
pub(super) fn source_has_inspect_rune(s: &str) -> bool {
    memchr::memmem::find(s.as_bytes(), b"$inspect").is_some()
}

/// An inspector that is not already a plain reference has to be parenthesised
/// before it can be invoked — `((t, v) => …)(...$$args)`.
pub(super) fn needs_parens(expr: &Expression<'_>) -> bool {
    !matches!(
        expr,
        Expression::Identifier(_)
            | Expression::StaticMemberExpression(_)
            | Expression::ComputedMemberExpression(_)
            | Expression::ParenthesizedExpression(_)
    )
}

pub(super) fn collect_inspect_rune_edits(program: &Program<'_>, source: &str) -> Vec<Edit> {
    let mut collector = InspectCollector {
        source,
        replacements: Vec::new(),
    };
    collector.visit_program(program);
    collector.replacements
}

struct InspectCollector<'src> {
    source: &'src str,
    replacements: Vec<Edit>,
}

impl<'src> InspectCollector<'src> {
    fn text(&self, span: oxc_span::Span) -> &'src str {
        self.source[span.start as usize..span.end as usize].trim()
    }

    /// `() => [arg, arg, …]` built from a `$inspect(...)` call's arguments.
    /// Slices each argument's own span so a `...spread` survives — narrowing to
    /// `as_expression()` would drop it from the array.
    fn args_thunk(&self, call: &CallExpression<'_>) -> String {
        let args = call
            .arguments
            .iter()
            .map(|a| self.text(a.span()))
            .collect::<Vec<_>>()
            .join(", ");
        format!("() => [{args}]")
    }
}

impl<'a, 'src> Visit<'a> for InspectCollector<'src> {
    fn visit_call_expression(&mut self, expr: &CallExpression<'a>) {
        // `$inspect(args).with(cb)` — match the outer call first so the inner
        // `$inspect(args)` is not rewritten separately.
        if expr.arguments.len() == 1
            && let Expression::StaticMemberExpression(member) = &expr.callee
            && member.property.name == "with"
            && let Expression::CallExpression(inner) = &member.object
            && let Expression::Identifier(callee) = &inner.callee
            && callee.name == "$inspect"
            && let Some(cb) = expr.arguments[0].as_expression()
        {
            let cb_text = self.text(cb.span());
            let inspector = if needs_parens(cb) {
                format!("({cb_text})")
            } else {
                cb_text.to_string()
            };
            self.replacements.push((
                expr.span.start,
                expr.span.end,
                format!(
                    "$.inspect({}, (...$$args) => {}(...$$args))",
                    self.args_thunk(inner),
                    inspector
                ),
            ));
            return;
        }

        if let Expression::Identifier(callee) = &expr.callee
            && callee.name == "$inspect"
        {
            self.replacements.push((
                expr.span.start,
                expr.span.end,
                format!(
                    "$.inspect({}, (...$$args) => console.log(...$$args), true)",
                    self.args_thunk(expr)
                ),
            ));
            return;
        }

        walk::walk_call_expression(self, expr);
    }
}

// ---------------------------------------------------------------------------
// `$inspect.trace(...)`
// ---------------------------------------------------------------------------

/// Cheap byte probe for the trace rune.
pub(super) fn source_has_inspect_trace(s: &str) -> bool {
    memchr::memmem::find(s.as_bytes(), b"$inspect.trace").is_some()
}

/// The `tracing` thunk upstream stores on the scope in phase 2
/// (`2-analyze/visitors/CallExpression.js`) for each `$inspect.trace(...)`, in
/// source order: `() => <arg>` when the rune was given one, otherwise
/// `() => '<label> (<file>:<line>:<col>)'`.
///
/// It is built from the module source as the user wrote it, not from the
/// partially-rewritten text the edit pass runs on, because the position is a
/// property of the source and phase 3's earlier passes move it.
pub(super) fn collect_trace_thunks(original: &str, is_ts: bool, filename: &str) -> Vec<String> {
    if !source_has_inspect_trace(original) {
        return Vec::new();
    }
    let source_type = if is_ts {
        oxc_span::SourceType::ts().with_module(true)
    } else {
        oxc_span::SourceType::mjs()
    };
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, original, source_type).parse();
    if !ret.diagnostics.is_empty() {
        return Vec::new();
    }
    let mut collector = TraceLabelCollector {
        source: original,
        filename,
        pending: None,
        out: Vec::new(),
    };
    collector.visit_program(&ret.program);
    collector.out
}

/// One `$inspect.trace(...)`-leading function body found in the text an edit
/// pass is rewriting.
struct TraceSite {
    /// The whole `$inspect.trace(…);` expression statement.
    statement: oxc_span::Span,
    /// One past the body's closing `}`.
    body_end: u32,
    is_async: bool,
}

/// Rewrite each `$inspect.trace(...)`-leading function body into upstream's
/// `{ return $.trace(<tracing>, () => { …rest… }); }` (写经 client
/// `BlockStatement.js`). `thunks` comes from [`collect_trace_thunks`] over the
/// original source and is paired by walk order, so the pass emits nothing
/// unless both walks agree on how many sites there are.
///
/// The edits are deliberately NARROW — the trace statement itself, plus a
/// zero-width insertion before the body's `}` — rather than one replacement of
/// the whole body. A body-wide edit would contain every other collector's edit
/// inside it, and `splice`'s innermost-first rule would defer it to a later
/// iteration, where the site count no longer matches the thunk list.
pub(super) fn collect_inspect_trace_edits(
    program: &Program<'_>,
    _source: &str,
    thunks: &[String],
) -> Vec<Edit> {
    if thunks.is_empty() {
        return Vec::new();
    }
    let mut collector = TraceSiteCollector { out: Vec::new() };
    collector.visit_program(program);
    if collector.out.len() != thunks.len() {
        return Vec::new();
    }
    let mut edits = Vec::with_capacity(collector.out.len() * 2);
    for (site, thunk) in collector.out.iter().zip(thunks) {
        let (awaited, asy) = if site.is_async {
            ("await ", "async ")
        } else {
            ("", "")
        };
        edits.push((
            site.statement.start,
            site.statement.end,
            format!("return {awaited}$.trace({thunk}, {asy}() => {{"),
        ));
        edits.push((site.body_end - 1, site.body_end - 1, "});".to_string()));
    }
    edits
}

/// `$inspect.trace(<args>)` as the first statement of `body`.
fn leading_trace_call<'a>(
    body: &'a FunctionBody<'a>,
) -> Option<(&'a Statement<'a>, &'a CallExpression<'a>)> {
    let stmt = body.statements.first()?;
    let Statement::ExpressionStatement(es) = stmt else {
        return None;
    };
    let Expression::CallExpression(call) = &es.expression else {
        return None;
    };
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    let Expression::Identifier(obj) = &member.object else {
        return None;
    };
    if obj.name != "$inspect" || member.property.name != "trace" {
        return None;
    }
    Some((stmt, call))
}

/// A concise arrow (`() => expr`) has no block to lead, so it can never carry
/// the rune — upstream rejects the placement.
fn arrow_block_body<'a>(arrow: &'a ArrowFunctionExpression<'a>) -> Option<&'a FunctionBody<'a>> {
    match &arrow.body {
        ArrowFunctionBody::FunctionBody(body) => Some(body),
        _ => None,
    }
}

struct TraceSiteCollector {
    out: Vec<TraceSite>,
}

impl TraceSiteCollector {
    fn record(&mut self, body: Option<&FunctionBody<'_>>, is_async: bool) {
        let Some(body) = body else { return };
        let Some((stmt, _)) = leading_trace_call(body) else {
            return;
        };
        self.out.push(TraceSite {
            statement: stmt.span(),
            body_end: body.span.end,
            is_async,
        });
    }
}

impl<'a> Visit<'a> for TraceSiteCollector {
    fn visit_function(&mut self, func: &Function<'a>, flags: oxc_syntax::scope::ScopeFlags) {
        self.record(func.body.as_deref(), func.r#async);
        walk::walk_function(self, func, flags);
    }

    fn visit_arrow_function_expression(&mut self, arrow: &ArrowFunctionExpression<'a>) {
        self.record(arrow_block_body(arrow), arrow.r#async);
        walk::walk_arrow_function_expression(self, arrow);
    }
}

struct TraceLabelCollector<'src> {
    source: &'src str,
    filename: &'src str,
    /// The name the *parent* node lends an anonymous function, set only when
    /// that parent's relevant child IS the function (写经 `get_function_label`,
    /// which looks at the immediate parent and nothing further out).
    pending: Option<String>,
    out: Vec<String>,
}

impl<'src> TraceLabelCollector<'src> {
    fn record(&mut self, body: Option<&FunctionBody<'_>>, fn_start: u32, own_name: Option<String>) {
        let label = own_name.or_else(|| self.pending.clone());
        self.pending = None;
        let Some(body) = body else { return };
        let Some((_, call)) = leading_trace_call(body) else {
            return;
        };
        // An explicit argument replaces the whole generated label.
        if let Some(arg) = call.arguments.first().and_then(|a| a.as_expression()) {
            let span = arg.span();
            self.out.push(format!(
                "() => {}",
                &self.source[span.start as usize..span.end as usize]
            ));
            return;
        }
        let (line, column) = self.locate(fn_start);
        self.out.push(format!(
            "() => '{}'",
            escape_single_quoted(&format!(
                "{} ({}:{}:{})",
                label.as_deref().unwrap_or("trace"),
                self.filename,
                line,
                column
            ))
        ));
    }

    /// 1-based line, 0-based column in characters — `locate_node`'s convention.
    fn locate(&self, offset: u32) -> (usize, usize) {
        let before = &self.source[..offset as usize];
        let line = before.matches('\n').count() + 1;
        let line_start = before.rfind('\n').map(|p| p + 1).unwrap_or(0);
        (line, before[line_start..].chars().count())
    }

    fn lend(&mut self, name: String) {
        self.pending = Some(name);
    }
}

/// esrap prints a string literal from its `raw`, so the label has to arrive
/// spelled the way upstream's builder would print it.
pub(super) fn escape_single_quoted(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '\\' => out.push_str("\\\\"),
            '\'' => out.push_str("\\'"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            _ => out.push(c),
        }
    }
    out
}

/// oxc keeps `ParenthesizedExpression` nodes that acorn — and so upstream's
/// `get_function_label` — never sees, and an IIFE's callee is always wrapped.
pub(super) fn unparen<'a>(mut expr: &'a Expression<'a>) -> &'a Expression<'a> {
    while let Expression::ParenthesizedExpression(inner) = expr {
        expr = &inner.expression;
    }
    expr
}

fn is_function_expression(expr: &Expression<'_>) -> bool {
    matches!(
        unparen(expr),
        Expression::FunctionExpression(_) | Expression::ArrowFunctionExpression(_)
    )
}

impl<'a, 'src> Visit<'a> for TraceLabelCollector<'src> {
    fn visit_function(&mut self, func: &Function<'a>, flags: oxc_syntax::scope::ScopeFlags) {
        let own = func.id.as_ref().map(|id| id.name.to_string());
        self.record(func.body.as_deref(), func.span.start, own);
        walk::walk_function(self, func, flags);
    }

    fn visit_arrow_function_expression(&mut self, arrow: &ArrowFunctionExpression<'a>) {
        self.record(arrow_block_body(arrow), arrow.span.start, None);
        walk::walk_arrow_function_expression(self, arrow);
    }

    fn visit_variable_declarator(&mut self, decl: &VariableDeclarator<'a>) {
        if let Some(init) = &decl.init
            && is_function_expression(init)
            && let Some(id) = decl.id.get_binding_identifier()
        {
            self.lend(id.name.to_string());
        }
        walk::walk_variable_declarator(self, decl);
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'a>) {
        if !prop.computed
            && is_function_expression(&prop.value)
            && let Some(name) = prop.key.static_name()
        {
            self.lend(name.to_string());
        }
        walk::walk_object_property(self, prop);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        let lends = is_function_expression(&call.callee)
            || call
                .arguments
                .iter()
                .any(|a| a.as_expression().is_some_and(is_function_expression));
        if lends {
            let span = unparen(&call.callee).span();
            self.lend(format!(
                "{}(...)",
                &self.source[span.start as usize..span.end as usize]
            ));
        }
        walk::walk_call_expression(self, call);
    }
}

#[cfg(test)]
mod tests {
    use super::super::module_dev_tail_ast::transform_module_dev_tail_ast;

    /// Through the production entry point, so the gate is exercised too.
    fn lower(source: &str) -> Option<String> {
        transform_module_dev_tail_ast(source, true, false, true, None, &[])
    }

    #[test]
    fn lowers_the_bare_rune() {
        assert_eq!(
            lower("$inspect(a);").unwrap(),
            "$.inspect(() => [a], (...$$args) => console.log(...$$args), true);"
        );
    }

    #[test]
    fn lowers_multiple_arguments() {
        assert_eq!(
            lower("$inspect(a, b);").unwrap(),
            "$.inspect(() => [a, b], (...$$args) => console.log(...$$args), true);"
        );
    }

    #[test]
    fn keeps_a_spread_argument() {
        assert_eq!(
            lower("$inspect(a, ...b, 3);").unwrap(),
            "$.inspect(() => [a, ...b, 3], (...$$args) => console.log(...$$args), true);"
        );
    }

    #[test]
    fn with_a_named_inspector_is_called_directly() {
        assert_eq!(
            lower("$inspect(a).with(fn);").unwrap(),
            "$.inspect(() => [a], (...$$args) => fn(...$$args));"
        );
        assert_eq!(
            lower("$inspect(a).with(obj.fn);").unwrap(),
            "$.inspect(() => [a], (...$$args) => obj.fn(...$$args));"
        );
    }

    #[test]
    fn with_an_inline_inspector_is_parenthesised() {
        assert_eq!(
            lower("$inspect(a).with((t, v) => log(t, v));").unwrap(),
            "$.inspect(() => [a], (...$$args) => ((t, v) => log(t, v))(...$$args));"
        );
    }

    #[test]
    fn does_not_touch_a_rune_shaped_string() {
        assert!(lower(r#"let s = "$inspect(a)";"#).is_none());
    }

    #[test]
    fn the_generated_default_inspector_is_not_re_wrapped() {
        // The console collector runs in the same batch; its skip for
        // `console.log(...$$args)` has to hold for what this pass just emitted.
        let out = lower("$inspect(a);\nconsole.log(b);").unwrap();
        assert!(
            out.contains("(...$$args) => console.log(...$$args), true)"),
            "default inspector was rewritten: {out}"
        );
        assert!(
            out.contains(r#"console.log(...$.log_if_contains_state('log', b));"#),
            "the user's own console call should still be wrapped: {out}"
        );
    }
}
