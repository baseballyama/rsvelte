//! Dev-mode `obj.prop = value` → `$.assign(obj, 'prop', '=', value, 'file:line:col')`.
//!
//! Upstream builds this in `visitors/AssignmentExpression.js` for a member
//! assignment whose *value* is used, so that a proxy coerced away by the
//! assignment can still be warned about (`(object.items ??= []).push(x)`).
//! rsvelte emits it from the template visitors, but the script paths reach the
//! same assignments through a text pipeline, so they get it here — over the
//! settled script, alongside the other dev tail collectors.
//!
//! The location argument is why this is more than another leaf collector: it is
//! a position in the *original* `.svelte` source, which the settled text no
//! longer carries. It is recovered by matching the assignment's root name,
//! member names and operator against the source, consuming same-shaped sites in
//! order.

use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_semantic::SemanticBuilder;
use oxc_span::GetSpan;
use rustc_hash::{FxHashMap, FxHashSet};

use super::ast_rewrite::Edit;
use super::visitors::shared::utils::{is_global_constant, is_known_defined_global_call};
use crate::compiler::phases::phase2_analyze::scope::{Binding, BindingKind};

/// Cheap byte probe: no `=` means no assignment to instrument.
pub(super) fn source_has_assignment(source: &str) -> bool {
    memchr::memchr(b'=', source.as_bytes()).is_some()
}

/// The operators upstream calls non-coercive — the ones that can store the
/// right-hand value as-is (`is_non_coercive_operator`).
fn non_coercive(operator: AssignmentOperator) -> Option<&'static str> {
    match operator {
        AssignmentOperator::Assign => Some("="),
        AssignmentOperator::LogicalOr => Some("||="),
        AssignmentOperator::LogicalAnd => Some("&&="),
        AssignmentOperator::LogicalNullish => Some("??="),
        _ => None,
    }
}

/// Dotted name of an identifier / non-computed member chain, or `None`.
fn oxc_keypath(expr: &Expression<'_>) -> Option<String> {
    match expr.without_parentheses() {
        Expression::Identifier(id) => Some(id.name.to_string()),
        Expression::StaticMemberExpression(m) => {
            Some(format!("{}.{}", oxc_keypath(&m.object)?, m.property.name))
        }
        _ => None,
    }
}

/// `scope.evaluate(right).is_primitive`, approximated by shape exactly as the
/// template path's `is_known_primitive_json` does — the two must agree or the
/// same source would be wrapped on one path and not the other.
pub(super) fn is_known_primitive(
    expr: &Expression<'_>,
    initial: &InitialResolver<'_>,
    depth: u8,
) -> bool {
    match expr.without_parentheses() {
        Expression::StringLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::TemplateLiteral(_)
        | Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_) => true,
        Expression::Identifier(id) => {
            id.name == "undefined" || initial.name_is_primitive(&id.name, depth)
        }
        // A call to one of the `globals` upstream knows yields NUMBER/STRING,
        // and a function value is not UNKNOWN either.
        Expression::CallExpression(call) => oxc_keypath(&call.callee).is_some_and(|k| {
            // This pass runs over the settled script, after the dev equality
            // rewrite has turned `a === b` into `$.strict_equals(a, b)`. Upstream
            // evaluates the ORIGINAL right-hand side, where it is still a
            // `BinaryExpression` and therefore primitive, so without looking
            // through the lowering the same source is wrapped here and not there
            // — the `$.track_reactivity_loss` lookthrough below exists for the
            // same reason.
            matches!(k.as_str(), "$.strict_equals" | "$.equals")
                || is_known_defined_global_call(
                    &k,
                    call.arguments.iter().any(oxc_ast::ast::Argument::is_spread),
                )
        }),
        Expression::StaticMemberExpression(_) => {
            oxc_keypath(expr.without_parentheses()).is_some_and(|k| is_global_constant(&k))
        }
        Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_) => true,
        // No `SequenceExpression` arm: upstream's `scope.evaluate` is a case per
        // node type (`scope.js:269-562`) and a sequence is not among them, so
        // `o.a = (1, 2)` is UNKNOWN there and keeps the wrap.
        // `Evaluation` unions the branch value sets, so a branching expression
        // is primitive exactly when every branch it can yield is.
        Expression::ConditionalExpression(cond) => {
            is_known_primitive(&cond.consequent, initial, depth)
                && is_known_primitive(&cond.alternate, initial, depth)
        }
        Expression::LogicalExpression(logical) => {
            is_known_primitive(&logical.left, initial, depth)
                && is_known_primitive(&logical.right, initial, depth)
        }
        _ => false,
    }
}

/// `is_expression_async` (`utils/ast.js`): an `await` the expression itself
/// performs, not one inside a function it merely contains.
fn is_expression_async(expr: &Expression<'_>) -> bool {
    let mut scan = AsyncScan { found: false };
    scan.visit_expression(expr);
    scan.found
}

struct AsyncScan {
    found: bool,
}

impl<'a> Visit<'a> for AsyncScan {
    fn visit_await_expression(&mut self, _: &AwaitExpression<'a>) {
        self.found = true;
    }
    fn visit_function(&mut self, _: &Function<'a>, _: oxc_syntax::scope::ScopeFlags) {}
    fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {}
    fn visit_class(&mut self, _: &Class<'a>) {}
}

/// The value `arrow` (`utils/builders.js`) hoists out of a lazy getter, turning
/// `async () => await x()` back into `() => x()`. Upstream decides on the
/// unvisited right-hand side, so the `$.track_reactivity_loss` wrapper this pass
/// already sees around the `await` has to be looked through.
fn hoistable_await_argument<'a, 'b>(expr: &'b Expression<'a>) -> Option<&'b Expression<'a>> {
    let argument = match expr.without_parentheses() {
        Expression::AwaitExpression(await_expr) => &await_expr.argument,
        Expression::CallExpression(call) if call.arguments.is_empty() => {
            let Expression::AwaitExpression(await_expr) = call.callee.without_parentheses() else {
                return None;
            };
            let Expression::CallExpression(wrap) = await_expr.argument.without_parentheses() else {
                return None;
            };
            let Expression::StaticMemberExpression(member) = &wrap.callee else {
                return None;
            };
            if member.property.name != "track_reactivity_loss"
                || !matches!(&member.object, Expression::Identifier(id) if id.name == "$")
            {
                return None;
            }
            wrap.arguments.first()?.as_expression()?
        }
        _ => return None,
    };
    (!is_expression_async(argument)).then_some(argument)
}

/// One element of a member chain, as both sides can compare it: a written name,
/// or a computed access whose expression only has to be a computed access on
/// the other side too.
#[derive(PartialEq, Debug)]
enum PathElement {
    Name(String),
    Computed,
}

/// Everything the rewrite reads off an assignment's target, in one place: the
/// site key and the spans, so the claim on the way down and the edit on the way
/// back up cannot disagree about which site an assignment owns.
struct AssignTarget {
    root: String,
    path: Vec<PathElement>,
    operator: &'static str,
    root_span: u32,
    object_span: oxc_span::Span,
    property: String,
}

fn assign_target(assign: &AssignmentExpression<'_>, source: &str) -> Option<AssignTarget> {
    let operator = non_coercive(assign.operator)?;
    let mut path = Vec::new();
    let (root, root_span, object_span, property) = match &assign.left {
        AssignmentTarget::StaticMemberExpression(member) => {
            let (root, root_span) = member_root(&member.object, &mut path)?;
            path.push(PathElement::Name(member.property.name.to_string()));
            (
                root,
                root_span,
                member.object.span(),
                format!("'{}'", member.property.name),
            )
        }
        AssignmentTarget::ComputedMemberExpression(member) => {
            let (root, root_span) = member_root(&member.object, &mut path)?;
            path.push(PathElement::Computed);
            let expr_span = member.expression.span();
            (
                root,
                root_span,
                member.object.span(),
                source[expr_span.start as usize..expr_span.end as usize].to_string(),
            )
        }
        _ => return None,
    };
    Some(AssignTarget {
        root,
        path,
        operator,
        root_span,
        object_span,
        property,
    })
}

/// The root identifier of a member chain, pushing each element it walks past
/// onto `path` in source order. `None` when the root is not a plain identifier.
fn member_root(expr: &Expression<'_>, path: &mut Vec<PathElement>) -> Option<(String, u32)> {
    match expr {
        Expression::Identifier(id) => Some((id.name.to_string(), id.span.start)),
        Expression::StaticMemberExpression(member) => {
            let root = member_root(&member.object, path)?;
            path.push(PathElement::Name(member.property.name.to_string()));
            Some(root)
        }
        Expression::ComputedMemberExpression(member) => {
            let root = member_root(&member.object, path)?;
            path.push(PathElement::Computed);
            Some(root)
        }
        _ => None,
    }
}

/// Spans of the identifier references in `program` that resolve to a declaration
/// inside it. Upstream stops at `if (!binding) return null`, so a member chain
/// rooted at a global is never instrumented.
fn resolved_reference_spans(program: &Program<'_>) -> FxHashSet<u32> {
    let semantic = super::super::profile::semantic_build(
        super::super::profile::SEM_ASSIGN_DEV,
        program.source_text.len(),
        || SemanticBuilder::new().build(program),
    )
    .semantic;
    let scoping = semantic.scoping();
    let mut resolved = FxHashSet::default();
    let mut collector = ResolvedRefs {
        scoping,
        spans: &mut resolved,
    };
    collector.visit_program(program);
    resolved
}

struct ResolvedRefs<'a> {
    scoping: &'a oxc_semantic::Scoping,
    spans: &'a mut FxHashSet<u32>,
}

impl<'ast> Visit<'ast> for ResolvedRefs<'_> {
    fn visit_identifier_reference(&mut self, ident: &IdentifierReference<'ast>) {
        if let Some(reference_id) = ident.reference_id.get()
            && self
                .scoping
                .get_reference(reference_id)
                .symbol_id()
                .is_some()
        {
            self.spans.insert(ident.span.start);
        }
        walk::walk_identifier_reference(self, ident);
    }
}

/// Upstream's `Identifier` arm of `scope.evaluate` resolves the name through
/// `binding.initial` when the binding is neither a prop nor ever updated
/// (`scope.js:303`); `updated` is a getter over `mutated || reassigned`
/// (`scope.js:174`), which phase 2 keeps as two fields.
///
/// Both halves have to come from phase 2's view of the ORIGINAL script. The
/// guard, because the settled text has turned every write into a call
/// (`$.set` / `$.update` / `$.update_pre`) and oxc therefore scores the name's
/// only occurrence a read. The value, because `binding.initial` carries a
/// payload for a literal alone — `initial_span` is the original node's range.
pub(super) struct InitialResolver<'a> {
    pub bindings: &'a [Binding],
    pub source: &'a str,
}

/// Cycle guard: `const a = b; const b = a;` is not a scope any compiler accepts,
/// but a bound recursion costs nothing and a chain this deep is not real code.
pub(super) const MAX_INITIAL_DEPTH: u8 = 10;

impl InitialResolver<'_> {
    /// Name lookup where no scope chain survives — the settled fragment this
    /// port runs over has none, and a chain's inner hops have none either.
    /// Upstream asks `scope.get(name)`, so a shadowed name would resolve to a
    /// different declaration than the first match: refuse rather than guess,
    /// which leaves the wrap in place and is the direction that only costs
    /// output equality.
    pub(super) fn name_is_primitive(&self, name: &str, depth: u8) -> bool {
        let mut found = self.bindings.iter().filter(|binding| binding.name == name);
        let Some(binding) = found.next() else {
            return false;
        };
        found.next().is_none() && self.binding_is_primitive(binding, depth)
    }

    pub(super) fn binding_is_primitive(&self, binding: &Binding, depth: u8) -> bool {
        let Some(depth) = depth.checked_sub(1) else {
            return false;
        };
        if binding.reassigned
            || binding.mutated
            || matches!(
                binding.kind,
                BindingKind::Prop | BindingKind::BindableProp | BindingKind::RestProp
            )
        {
            return false;
        }
        let Some(text) = binding
            .initial_span
            .and_then(|(s, e)| self.source.get(s as usize..e as usize))
        else {
            return false;
        };
        let allocator = oxc_allocator::Allocator::default();
        let wrapped = format!("({text});");
        let parsed = oxc_parser::Parser::new(
            &allocator,
            &wrapped,
            oxc_span::SourceType::ts().with_module(true),
        )
        .parse();
        if parsed.panicked || !parsed.diagnostics.is_empty() {
            return false;
        }
        let Some(Statement::ExpressionStatement(stmt)) = parsed.program.body.first() else {
            return false;
        };
        is_known_primitive(&stmt.expression, self, depth)
    }
}

/// Collect the `$.assign` rewrites for one settled script.
pub(super) fn collect_assign_edits(
    program: &Program<'_>,
    source: &str,
    original: &str,
    filename: &str,
    component_bindings: &FxHashSet<&str>,
    initial: &InitialResolver<'_>,
) -> Vec<Edit> {
    let mut collector = AssignCollector {
        source,
        sites: AssignSites::collect(original),
        filename: filename.replace('/', "/\u{200b}"),
        statement_expressions: FxHashSet::default(),
        concise_arrow_bodies: FxHashSet::default(),
        // The two halves cover each other's blind spot: this fragment is the
        // instance body, so an import is declared outside it and only the
        // component's bindings know it, while a name declared inside a function
        // here is not a component binding and only the fragment resolves it.
        resolved: resolved_reference_spans(program),
        component_bindings,
        initial,
        reserved: FxHashMap::default(),
        edits: Vec::new(),
    };
    collector.visit_program(program);
    collector.edits
}

struct AssignCollector<'src> {
    source: &'src str,
    sites: AssignSites,
    filename: String,
    /// Spans of assignments that are a whole statement — upstream's
    /// `path.at(-1) !== 'ExpressionStatement'` guard.
    statement_expressions: FxHashSet<u32>,
    /// Spans of assignments that are a concise arrow body. oxc wraps one in an
    /// `ExpressionStatement` the source does not contain, so the guard above
    /// would read `(v) => (obj.x = v)` — whose value the arrow returns — as a
    /// statement.
    concise_arrow_bodies: FxHashSet<u32>,
    /// Identifier-reference spans that resolve inside this fragment.
    resolved: FxHashSet<u32>,
    /// Every name the component declares anywhere, which is what carries the
    /// hoisted imports this fragment no longer contains.
    component_bindings: &'src FxHashSet<&'src str>,
    /// Upstream's `scope.evaluate` identifier resolution, read off phase 2.
    initial: &'src InitialResolver<'src>,
    /// Assignment span start -> the site reserved for it on the way down.
    reserved: FxHashMap<u32, (usize, usize)>,
    edits: Vec<Edit>,
}

impl<'a> Visit<'a> for AssignCollector<'_> {
    fn visit_expression_statement(&mut self, stmt: &ExpressionStatement<'a>) {
        if let Expression::AssignmentExpression(assign) = &stmt.expression {
            self.statement_expressions.insert(assign.span.start);
        }
        walk::walk_expression_statement(self, stmt);
    }

    fn visit_arrow_function_expression(&mut self, arrow: &ArrowFunctionExpression<'a>) {
        if let Some(Expression::AssignmentExpression(assign)) = arrow.body.as_expression() {
            self.concise_arrow_bodies.insert(assign.span.start);
        }
        walk::walk_arrow_function_expression(self, arrow);
    }

    fn visit_assignment_expression(&mut self, assign: &AssignmentExpression<'a>) {
        // A `Computed` path element carries no value, so the two targets of
        // `o.p[2] = o.p[3] = s` have the same site key and only the order the
        // sites are consumed in tells them apart. The walk below is post-order,
        // which consumes the inner assignment first and hands it the outer's
        // column, so the site is claimed here in source order instead.
        if let Some(target) = assign_target(assign, self.source)
            && let Some(location) = self.sites.take(&target.root, &target.path, target.operator)
        {
            self.reserved.insert(assign.span.start, location);
        }
        walk::walk_assignment_expression(self, assign);

        let Some(target) = assign_target(assign, self.source) else {
            return;
        };
        let AssignTarget {
            root,
            operator,
            root_span,
            object_span,
            property,
            ..
        } = target;
        let slice = |span: oxc_span::Span| &self.source[span.start as usize..span.end as usize];
        // Claimed before the decision below, not after: two identical member
        // chains in one script are told apart only by which site is still
        // unused, so a site the decision rejects still has to be spent.
        let Some((line, column)) = self.reserved.remove(&assign.span.start) else {
            return;
        };
        // Upstream's `if (!binding) return null` — a chain rooted at a global
        // (`document.body.onfocus = …`) is not instrumented at all.
        if !self.resolved.contains(&root_span) && !self.component_bindings.contains(root.as_str()) {
            return;
        }
        if is_known_primitive(&assign.right, self.initial, MAX_INITIAL_DEPTH)
            || (self.statement_expressions.contains(&assign.span.start)
                && !self.concise_arrow_bodies.contains(&assign.span.start))
        {
            return;
        }

        let object = slice(object_span);
        let right = slice(assign.right.span());
        // `needs_lazy_getter`: a coercing-in-place operator must not evaluate
        // the right-hand side before the runtime decides to store it, and an
        // awaiting getter has to be awaited back through `$.assign_async`.
        let needs_lazy_getter = operator != "=";
        let needs_async = needs_lazy_getter && is_expression_async(&assign.right);
        let hoisted = needs_async
            .then(|| hoistable_await_argument(&assign.right))
            .flatten();
        // A concise arrow body may not begin with `{`, and esrap parenthesises
        // whatever it prints on that test rather than on the node's kind — so
        // `{} && 1` is wrapped whole while `cond ? {} : []` is not.
        let concise = |body: &str| {
            if body.starts_with('{') {
                format!("({body})")
            } else {
                body.to_string()
            }
        };
        let value = match (needs_lazy_getter, needs_async) {
            (false, _) => right.to_string(),
            (true, false) => format!("() => {}", concise(right)),
            (true, true) => match hoisted {
                Some(argument) => format!("() => {}", concise(slice(argument.span()))),
                None => format!("async () => {}", concise(right)),
            },
        };
        let callee = if needs_async {
            "$.assign_async"
        } else {
            "$.assign"
        };
        let call = format!(
            "{callee}({object}, {property}, '{operator}', {value}, '{}:{line}:{column}')",
            self.filename
        );
        // `build_assignment` hands the `await` it adds to `context.visit`, so the
        // `AwaitExpression` visitor instruments it in the same pass; here that
        // pass has already run over the script.
        let replacement = if needs_async {
            format!("(await $.track_reactivity_loss({call}))()")
        } else {
            call
        };
        self.edits
            .push((assign.span.start, assign.span.end, replacement));
    }
}

/// Every `root.a.b <op>` site in the original source, in source order.
struct AssignSites {
    sites: Vec<Site>,
}

struct Site {
    line: usize,
    column: usize,
    root: String,
    path: Vec<PathElement>,
    operator: &'static str,
    used: bool,
}

impl AssignSites {
    fn collect(source: &str) -> Self {
        let bytes = source.as_bytes();
        let mut sites = Vec::new();
        let mut i = 0;
        while i < bytes.len() {
            // ASCII-only: a non-ASCII byte can never start a name this scan
            // compares, and stepping over it byte-wise keeps every slice below
            // on a char boundary.
            let c = bytes[i];
            if !(c.is_ascii_alphabetic() || c == b'_' || c == b'$') {
                i += 1;
                continue;
            }
            if i > 0 {
                let prev = bytes[i - 1];
                if prev.is_ascii_alphanumeric() || prev == b'_' || prev == b'$' || prev == b'.' {
                    i += 1;
                    continue;
                }
            }
            let start = i;
            while i < bytes.len() {
                let c = bytes[i];
                if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                    i += 1;
                } else {
                    break;
                }
            }
            let mut path = Vec::new();
            let mut pos = i;
            let mut malformed = false;
            loop {
                match bytes.get(pos) {
                    Some(b'.') => {
                        pos += 1;
                        let name_start = pos;
                        while pos < bytes.len() {
                            let c = bytes[pos];
                            if c.is_ascii_alphanumeric() || c == b'_' || c == b'$' {
                                pos += 1;
                            } else {
                                break;
                            }
                        }
                        if pos == name_start {
                            malformed = true;
                            break;
                        }
                        path.push(PathElement::Name(source[name_start..pos].to_string()));
                    }
                    Some(b'[') => {
                        let mut depth = 0usize;
                        while pos < bytes.len() {
                            match bytes[pos] {
                                b'[' => depth += 1,
                                b']' => {
                                    depth -= 1;
                                    if depth == 0 {
                                        pos += 1;
                                        break;
                                    }
                                }
                                _ => {}
                            }
                            pos += 1;
                        }
                        if depth != 0 {
                            malformed = true;
                            break;
                        }
                        path.push(PathElement::Computed);
                    }
                    _ => break,
                }
            }
            if malformed || path.is_empty() {
                i = i.max(pos);
                continue;
            }
            let mut op_pos = pos;
            while bytes.get(op_pos).is_some_and(|b| *b == b' ' || *b == b'\t') {
                op_pos += 1;
            }
            let operator = match bytes.get(op_pos) {
                Some(b'=') if bytes.get(op_pos + 1) != Some(&b'=') => "=",
                Some(b'|') if source[op_pos..].starts_with("||=") => "||=",
                Some(b'&') if source[op_pos..].starts_with("&&=") => "&&=",
                Some(b'?') if source[op_pos..].starts_with("??=") => "??=",
                _ => {
                    i = pos;
                    continue;
                }
            };
            let (line, column) =
                crate::compiler::phases::phase3_transform::utils::locate_in_source(source, start);
            sites.push(Site {
                line,
                column,
                root: source[start..i].to_string(),
                path,
                operator,
                used: false,
            });
            i = pos;
        }
        Self { sites }
    }

    fn take(&mut self, root: &str, path: &[PathElement], operator: &str) -> Option<(usize, usize)> {
        let index = self.sites.iter().position(|site| {
            !site.used && site.root == root && site.path == path && site.operator == operator
        })?;
        self.sites[index].used = true;
        Some((self.sites[index].line, self.sites[index].column))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_scanner_records_names_and_computed_elements() {
        let sites = AssignSites::collect("key.a = 1\nobj[k] ??= 2\nplain = 3\n");
        let shapes: Vec<_> = sites
            .sites
            .iter()
            .map(|s| (s.root.as_str(), s.path.len(), s.operator))
            .collect();
        assert_eq!(shapes, vec![("key", 1, "="), ("obj", 1, "??=")]);
        assert_eq!(sites.sites[1].path[0], PathElement::Computed);
    }
}
