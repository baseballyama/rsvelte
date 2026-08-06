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
use oxc_span::GetSpan;
use rustc_hash::FxHashSet;

use super::ast_rewrite::Edit;

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

/// `scope.evaluate(right).is_primitive`, approximated by shape exactly as the
/// template path's `is_known_primitive_json` does — the two must agree or the
/// same source would be wrapped on one path and not the other.
fn is_known_primitive(expr: &Expression<'_>) -> bool {
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
        Expression::Identifier(id) => id.name == "undefined",
        // `Evaluation` unions the branch value sets, so a branching expression
        // is primitive exactly when every branch it can yield is.
        Expression::ConditionalExpression(cond) => {
            is_known_primitive(&cond.consequent) && is_known_primitive(&cond.alternate)
        }
        Expression::LogicalExpression(logical) => {
            is_known_primitive(&logical.left) && is_known_primitive(&logical.right)
        }
        Expression::SequenceExpression(seq) => {
            seq.expressions.last().is_some_and(is_known_primitive)
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

/// The root identifier of a member chain, pushing each element it walks past
/// onto `path` in source order. `None` when the root is not a plain identifier.
fn member_root(expr: &Expression<'_>, path: &mut Vec<PathElement>) -> Option<String> {
    match expr {
        Expression::Identifier(id) => Some(id.name.to_string()),
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

/// Collect the `$.assign` rewrites for one settled script.
pub(super) fn collect_assign_edits(
    program: &Program<'_>,
    source: &str,
    original: &str,
    filename: &str,
) -> Vec<Edit> {
    let mut collector = AssignCollector {
        source,
        sites: AssignSites::collect(original),
        filename: filename.replace('/', "/\u{200b}"),
        statement_expressions: FxHashSet::default(),
        concise_arrow_bodies: FxHashSet::default(),
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
        walk::walk_assignment_expression(self, assign);

        let Some(operator) = non_coercive(assign.operator) else {
            return;
        };
        let mut path = Vec::new();
        let slice = |span: oxc_span::Span| &self.source[span.start as usize..span.end as usize];
        let (root, object_span, property) = match &assign.left {
            AssignmentTarget::StaticMemberExpression(member) => {
                let Some(root) = member_root(&member.object, &mut path) else {
                    return;
                };
                path.push(PathElement::Name(member.property.name.to_string()));
                (
                    root,
                    member.object.span(),
                    format!("'{}'", member.property.name),
                )
            }
            AssignmentTarget::ComputedMemberExpression(member) => {
                let Some(root) = member_root(&member.object, &mut path) else {
                    return;
                };
                path.push(PathElement::Computed);
                (
                    root,
                    member.object.span(),
                    slice(member.expression.span()).to_string(),
                )
            }
            _ => return,
        };
        // Consumed before the decision below, not after: two identical member
        // chains in one script are told apart only by which site is still
        // unused, so a site the decision rejects still has to be spent.
        let Some((line, column)) = self.sites.take(&root, &path, operator) else {
            return;
        };
        if is_known_primitive(&assign.right)
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
        let value = match (needs_lazy_getter, needs_async) {
            (false, _) => right.to_string(),
            (true, false) => format!("() => {right}"),
            (true, true) => match hoisted {
                Some(argument) => format!("() => {}", slice(argument.span())),
                None => format!("async () => {right}"),
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
    operator: String,
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
            let root = source[start..i].to_string();
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
                root,
                path,
                operator: operator.to_string(),
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
            .map(|s| (s.root.as_str(), s.path.len(), s.operator.as_str()))
            .collect();
        assert_eq!(shapes, vec![("key", 1, "="), ("obj", 1, "??=")]);
        assert_eq!(sites.sites[1].path[0], PathElement::Computed);
    }
}
