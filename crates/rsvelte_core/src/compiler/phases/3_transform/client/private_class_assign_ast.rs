//! AST-based rewrite of private-field assignments + updates in
//! class method bodies (with `this.` prefix and proxy detection
//! for `$state` fields).
//!
//! Replaces the assignment / update branches in
//! `class_transforms.rs::transform_class_methods` (lines 1169+).
//!
//! Differs from `private_field_assign_ast` (PR #207, non-this
//! constructor variant) in two ways:
//!
//! 1. `$state` fields get a `, true` flag when the RHS expression
//!    needs proxy wrapping (per `expression_needs_proxy`). Other
//!    rune types and the non-this variant don't apply this.
//! 2. Update expressions (`q++`, `--q`) are also rewritten to
//!    `$.update(q)` / `$.update_pre(q[, -1])`.
//!
//! Mappings (preserved exactly). Whether the `, true` proxy flag is
//! emitted follows upstream `AssignmentExpression.js`:
//! `needs_proxy = field is $state && is_non_coercive_operator(op) &&
//! should_proxy(value)`. Only `=` and the *logical* compounds
//! (`||= &&= ??=`) are non-coercive; arithmetic / bitwise / shift
//! compounds are coercive and never proxy.
//!
//! | Source        | Replacement (proxy-needing $state)         | Replacement (otherwise)             |
//! |---------------|--------------------------------------------|-------------------------------------|
//! | `q = expr`    | `$.set(q, expr, true)`                     | `$.set(q, expr)`                    |
//! | `q += expr`   | `$.set(q, $.get(q) + expr)`                | `$.set(q, $.get(q) + expr)`         |
//! | (incl. coercive `-= *= /= %= **= &= |= ^= <<= >>= >>>=` — never proxy)                             |
//! | `q ??= expr`  | `$.set(q, $.get(q) ?? expr, true)`         | `$.set(q, $.get(q) ?? expr)`        |
//! | (incl. logical `||= &&=`; the built value is a LogicalExpression → always proxies for `$state`)   |
//! | `q++`         | `$.update(q)`                              | `$.update(q)`                       |
//! | `q--`         | `$.update(q, -1)`                          | `$.update(q, -1)`                   |
//! | `++q`         | `$.update_pre(q)`                          | `$.update_pre(q)`                   |
//! | `--q`         | `$.update_pre(q, -1)`                      | `$.update_pre(q, -1)`               |
//!
//! Where `q` matches one of the qualified names. `state_qualified`
//! holds the `$state`-rune-type qualifieds (proxy-aware); other
//! qualifieds (`$state.raw`, `$state.frozen`, `$derived`,
//! `$derived.by`) go in `other_qualified`.

use std::cell::RefCell;
// mold principle P6: trusted-input compiler hot path uses FxHash, never SipHash.
use rustc_hash::{FxHashMap as HashMap, FxHashSet as HashSet};

use oxc_allocator::{Allocator, CloneIn};
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::GetSpan;
use oxc_span::SourceType;
use oxc_syntax::operator::{AssignmentOperator, UnaryOperator, UpdateOperator};

use super::ast_rewrite::{self, Edit};

/// Scope-less mirror of the official compiler's `should_proxy(node, null)`
/// (`client/utils.js`): the set of expression shapes that never need a
/// reactive proxy wrapper. Used both directly on an assignment RHS and to
/// pre-compute the proxy-ability of every local binding's initializer.
fn should_proxy_no_trace(expr: &Expression<'_>) -> bool {
    match expr {
        Expression::BooleanLiteral(_)
        | Expression::NullLiteral(_)
        | Expression::NumericLiteral(_)
        | Expression::BigIntLiteral(_)
        | Expression::RegExpLiteral(_)
        | Expression::StringLiteral(_)
        | Expression::TemplateLiteral(_)
        | Expression::ArrowFunctionExpression(_)
        | Expression::FunctionExpression(_)
        | Expression::UnaryExpression(_)
        | Expression::BinaryExpression(_) => false,
        Expression::TSAsExpression(e) => should_proxy_no_trace(&e.expression),
        Expression::TSSatisfiesExpression(e) => should_proxy_no_trace(&e.expression),
        Expression::TSNonNullExpression(e) => should_proxy_no_trace(&e.expression),
        Expression::TSTypeAssertion(e) => should_proxy_no_trace(&e.expression),
        Expression::TSInstantiationExpression(e) => should_proxy_no_trace(&e.expression),
        Expression::ParenthesizedExpression(e) => should_proxy_no_trace(&e.expression),
        Expression::Identifier(ident) => ident.name != "undefined",
        // CallExpression, MemberExpression, ObjectExpression, ArrayExpression,
        // NewExpression, SequenceExpression, … all fall through to `true` in the
        // official `should_proxy`.
        _ => true,
    }
}

/// Scope-aware mirror of the official `should_proxy(value, scope)`: like
/// [`should_proxy_no_trace`] but, for an identifier RHS, traces the binding's
/// initializer (`should_proxy(binding.initial, null)`) when the binding is not
/// reassigned. Falls back to `true` (proxy) when the binding is unknown or
/// reassigned, matching upstream's behaviour for params / reassigned vars.
fn should_proxy_with_bindings(
    expr: &Expression<'_>,
    var_proxy: &HashMap<String, bool>,
    reassigned: &HashSet<String>,
) -> bool {
    match expr {
        Expression::TSAsExpression(e) => {
            should_proxy_with_bindings(&e.expression, var_proxy, reassigned)
        }
        Expression::TSSatisfiesExpression(e) => {
            should_proxy_with_bindings(&e.expression, var_proxy, reassigned)
        }
        Expression::TSNonNullExpression(e) => {
            should_proxy_with_bindings(&e.expression, var_proxy, reassigned)
        }
        Expression::TSTypeAssertion(e) => {
            should_proxy_with_bindings(&e.expression, var_proxy, reassigned)
        }
        Expression::TSInstantiationExpression(e) => {
            should_proxy_with_bindings(&e.expression, var_proxy, reassigned)
        }
        Expression::ParenthesizedExpression(e) => {
            should_proxy_with_bindings(&e.expression, var_proxy, reassigned)
        }
        Expression::Identifier(ident) => {
            if ident.name == "undefined" {
                return false;
            }
            if !reassigned.contains(ident.name.as_str())
                && let Some(&proxyable) = var_proxy.get(ident.name.as_str())
            {
                return proxyable;
            }
            true
        }
        other => should_proxy_no_trace(other),
    }
}

/// Pre-walk that records, for the whole program, each local binding's
/// initializer proxy-ability and the set of identifiers ever reassigned —
/// the inputs [`should_proxy_with_bindings`] needs to mirror upstream's
/// `scope.get(name)` lookup.
#[derive(Default)]
struct BindingInfoCollector {
    var_proxy: HashMap<String, bool>,
    reassigned: HashSet<String>,
}

impl<'ast> Visit<'ast> for BindingInfoCollector {
    fn visit_variable_declarator(&mut self, decl: &VariableDeclarator<'ast>) {
        walk::walk_variable_declarator(self, decl);
        if let BindingPattern::BindingIdentifier(id) = &decl.id
            && let Some(init) = &decl.init
        {
            self.var_proxy
                .insert(id.name.to_string(), should_proxy_no_trace(init));
        }
    }

    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left {
            self.reassigned.insert(id.name.to_string());
        }
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument {
            self.reassigned.insert(id.name.to_string());
        }
    }
}

thread_local! {
    static MODULE_PRIVATE_CLASS_ASSIGN_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// AST-based rewrite of private-field assignments + updates for
/// class method bodies. `state_qualified` lists `$state` fields
/// (proxy-aware); `other_qualified` lists other rune types
/// (no proxy logic). Returns `None` when there's nothing to
/// rewrite or the source fails to parse.
pub fn transform_private_class_assign_ast(
    source: &str,
    state_qualified: &[String],
    other_qualified: &[String],
) -> Option<String> {
    let spliced =
        || transform_private_class_assign_spliced(source, state_qualified, other_qualified);
    ast_rewrite::dual_run::resolve("private_class_assign_ast:inplace", source, spliced, || {
        transform_private_class_assign_in_place(source, state_qualified, other_qualified)
    })
}

fn transform_private_class_assign_spliced(
    source: &str,
    state_qualified: &[String],
    other_qualified: &[String],
) -> Option<String> {
    if state_qualified.is_empty() && other_qualified.is_empty() {
        return None;
    }
    if !state_qualified
        .iter()
        .chain(other_qualified.iter())
        .any(|q| memchr::memmem::find(source.as_bytes(), q.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::fixed_point(source, |src| {
        single_pass(src, state_qualified, other_qualified)
    })
}

fn single_pass(
    source: &str,
    state_qualified: &[String],
    other_qualified: &[String],
) -> Option<String> {
    MODULE_PRIVATE_CLASS_ASSIGN_ALLOC.with(|cell| {
        let allocator = std::mem::take(&mut *cell.borrow_mut());

        // Parse directly.  If that fails (e.g. the content is a block of class
        // method definitions extracted without their enclosing `class` keyword),
        // retry by wrapping in a synthetic class so OXC can recognise the
        // method signatures.  Span offsets are adjusted back to the original
        // source after collection.
        ast_rewrite::dual_run::count_parse(
            ast_rewrite::dual_run::current_or(file!()),
            source.len(),
        );
        let parser_ret = Parser::new(&allocator, source, SourceType::mjs())
            .with_options(ParseOptions {
                allow_return_outside_function: true,
                ..ParseOptions::default()
            })
            .parse();

        const CLASS_PREFIX: &str = "class _Dummy_ {\n";
        let (parse_str_owned, span_offset): (Option<String>, u32) =
            if !parser_ret.diagnostics.is_empty() {
                let wrapped = format!("{}{}\n}}", CLASS_PREFIX, source);
                (Some(wrapped), CLASS_PREFIX.len() as u32)
            } else {
                (None, 0u32)
            };

        let parse_str: &str = match &parse_str_owned {
            Some(s) => s.as_str(),
            None => source,
        };

        let program_to_visit = if parse_str_owned.is_some() {
            ast_rewrite::dual_run::count_parse(
                ast_rewrite::dual_run::current_or(file!()),
                parse_str.len(),
            );
            let ret = Parser::new(&allocator, parse_str, SourceType::mjs())
                .with_options(ParseOptions {
                    allow_return_outside_function: true,
                    ..ParseOptions::default()
                })
                .parse();
            if !ret.diagnostics.is_empty() {
                *cell.borrow_mut() = allocator;
                return None;
            }
            Some(ret)
        } else {
            None
        };

        let program_ref = match &program_to_visit {
            Some(ret) => &ret.program,
            None => &parser_ret.program,
        };

        let mut binding_info = BindingInfoCollector::default();
        binding_info.visit_program(program_ref);

        let mut collector = PrivateClassAssignCollector {
            source: parse_str,
            state_qualified,
            other_qualified,
            var_proxy: &binding_info.var_proxy,
            reassigned: &binding_info.reassigned,
            replacements: Vec::new(),
        };
        collector.visit_program(program_ref);
        let mut replacements = collector.replacements;

        // Adjust span offsets back to the original un-wrapped source.
        if span_offset > 0 {
            for (start, end, _) in &mut replacements {
                *start = start.saturating_sub(span_offset);
                *end = end.saturating_sub(span_offset);
            }
            // Drop any replacement that fell outside the original source range.
            let src_len = source.len() as u32;
            replacements.retain(|(_, e, _)| *e <= src_len);
        }

        *cell.borrow_mut() = allocator;
        ast_rewrite::splice(source, replacements, true)
    })
}

struct PrivateClassAssignCollector<'a> {
    source: &'a str,
    state_qualified: &'a [String],
    other_qualified: &'a [String],
    var_proxy: &'a HashMap<String, bool>,
    reassigned: &'a HashSet<String>,
    replacements: Vec<Edit>,
}

#[derive(Clone, Copy)]
enum Match {
    State,
    Other,
}

/// How a compound assignment operator expands into the `$.set` value,
/// mirroring upstream `build_assignment_value`.
#[derive(Clone, Copy)]
enum Compound {
    /// Plain `=` — value is the RHS verbatim.
    None,
    /// Coercive `+= -= *= /= %= **= &= |= ^= <<= >>= >>>=` — value is
    /// `$.get(q) <op> rhs` (a binary expression); never proxies.
    Arith(&'static str),
    /// Non-coercive `||= &&= ??=` — value is `$.get(q) <op> rhs` (a
    /// logical expression); proxies for `$state` fields.
    Logic(&'static str),
}

fn classify(text: &str, state_qualified: &[String], other_qualified: &[String]) -> Option<Match> {
    if state_qualified.iter().any(|q| q.as_str() == text) {
        Some(Match::State)
    } else if other_qualified.iter().any(|q| q.as_str() == text) {
        Some(Match::Other)
    } else {
        None
    }
}

impl<'a, 'ast> Visit<'ast> for PrivateClassAssignCollector<'a> {
    fn visit_assignment_expression(&mut self, expr: &AssignmentExpression<'ast>) {
        walk::walk_assignment_expression(self, expr);

        let AssignmentTarget::PrivateFieldExpression(pf) = &expr.left else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        let Some(kind) = classify(pf_text, self.state_qualified, self.other_qualified) else {
            return;
        };
        let qualified = pf_text;

        // Classify the compound operator, mirroring upstream
        // `build_assignment_value` (`utils/ast.js`): `=` uses the RHS
        // verbatim; `||= &&= ??=` expand to a *logical* expression
        // `left <op> right`; every other compound (`+= -= … & | << …`)
        // expands to a *binary* expression `left <op> right`.
        let compound = match expr.operator {
            AssignmentOperator::Assign => Compound::None,
            AssignmentOperator::Addition => Compound::Arith("+"),
            AssignmentOperator::Subtraction => Compound::Arith("-"),
            AssignmentOperator::Multiplication => Compound::Arith("*"),
            AssignmentOperator::Division => Compound::Arith("/"),
            AssignmentOperator::Remainder => Compound::Arith("%"),
            AssignmentOperator::Exponential => Compound::Arith("**"),
            AssignmentOperator::BitwiseAnd => Compound::Arith("&"),
            AssignmentOperator::BitwiseOR => Compound::Arith("|"),
            AssignmentOperator::BitwiseXOR => Compound::Arith("^"),
            AssignmentOperator::ShiftLeft => Compound::Arith("<<"),
            AssignmentOperator::ShiftRight => Compound::Arith(">>"),
            AssignmentOperator::ShiftRightZeroFill => Compound::Arith(">>>"),
            AssignmentOperator::LogicalOr => Compound::Logic("||"),
            AssignmentOperator::LogicalAnd => Compound::Logic("&&"),
            AssignmentOperator::LogicalNullish => Compound::Logic("??"),
        };

        let rhs_span = expr.right.span();
        let rhs_text = &self.source[rhs_span.start as usize..rhs_span.end as usize];

        // Proxy logic mirrors upstream `AssignmentExpression.js` private-state
        // branch: `needs_proxy = field.type === '$state' &&
        // is_non_coercive_operator(operator) && should_proxy(value, scope)`
        // where `value` is the built (and visited) assignment value.
        // The non-coercive operators are `= || && ??`. Compound arithmetic /
        // bitwise / shift ops are coercive → never proxy. For `= `, `value`
        // is the RHS, so `should_proxy` traces it. For the logical ops,
        // `value` is a `LogicalExpression` (`$.get(q) <op> rhs`), which is
        // never in `should_proxy`'s no-proxy set, so it always proxies for a
        // `$state` field.
        let needs_proxy = matches!(kind, Match::State)
            && match compound {
                Compound::None => {
                    should_proxy_with_bindings(&expr.right, self.var_proxy, self.reassigned)
                }
                Compound::Logic(_) => true,
                Compound::Arith(_) => false,
            };

        let rewrite = match compound {
            Compound::None if needs_proxy => format!("$.set({}, {}, true)", qualified, rhs_text),
            Compound::None => format!("$.set({}, {})", qualified, rhs_text),
            Compound::Arith(op) => format!(
                "$.set({}, $.get({}) {} {})",
                qualified, qualified, op, rhs_text
            ),
            Compound::Logic(op) if needs_proxy => format!(
                "$.set({}, $.get({}) {} {}, true)",
                qualified, qualified, op, rhs_text
            ),
            Compound::Logic(op) => format!(
                "$.set({}, $.get({}) {} {})",
                qualified, qualified, op, rhs_text
            ),
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }

    fn visit_update_expression(&mut self, expr: &UpdateExpression<'ast>) {
        walk::walk_update_expression(self, expr);

        let SimpleAssignmentTarget::PrivateFieldExpression(pf) = &expr.argument else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        if classify(pf_text, self.state_qualified, self.other_qualified).is_none() {
            return;
        }
        let qualified = pf_text;

        let rewrite = match (expr.operator, expr.prefix) {
            (UpdateOperator::Increment, false) => format!("$.update({})", qualified),
            (UpdateOperator::Decrement, false) => format!("$.update({}, -1)", qualified),
            (UpdateOperator::Increment, true) => format!("$.update_pre({})", qualified),
            (UpdateOperator::Decrement, true) => format!("$.update_pre({}, -1)", qualified),
        };

        self.replacements
            .push((expr.span.start, expr.span.end, rewrite));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn state_assign_with_proxy_object_literal() {
        // `{ x: 1 }` needs proxy.
        let out = transform_private_class_assign_ast(
            "this.#data = { x: 1 };",
            &ssv(&["this.#data"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#data, { x: 1 }, true);");
    }

    #[test]
    fn state_assign_without_proxy_primitive() {
        // `5` is primitive — no proxy needed.
        let out =
            transform_private_class_assign_ast("this.#count = 5;", &ssv(&["this.#count"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#count, 5);");
    }

    #[test]
    fn state_assign_with_proxy_array_literal() {
        let out = transform_private_class_assign_ast(
            "this.#list = [1, 2, 3];",
            &ssv(&["this.#list"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#list, [1, 2, 3], true);");
    }

    #[test]
    fn state_assign_with_proxy_new_expression() {
        let out =
            transform_private_class_assign_ast("this.#obj = new Foo();", &ssv(&["this.#obj"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#obj, new Foo(), true);");
    }

    #[test]
    fn derived_assign_no_proxy_even_with_object() {
        // $derived doesn't get proxy logic.
        let out =
            transform_private_class_assign_ast("this.#d = { x: 1 };", &[], &ssv(&["this.#d"]))
                .unwrap();
        assert_eq!(out, "$.set(this.#d, { x: 1 });");
    }

    #[test]
    fn compound_state_never_proxies() {
        // Compound arithmetic (`+=`) is a coercive operator, so upstream's
        // `is_non_coercive_operator(operator)` gate makes `needs_proxy` false
        // regardless of the RHS shape — no `, true` even for an object literal.
        let out = transform_private_class_assign_ast(
            "this.#data += { x: 1 };",
            &ssv(&["this.#data"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#data, $.get(this.#data) + { x: 1 });");
    }

    #[test]
    fn state_assign_identifier_traces_to_nonproxyable_initial() {
        // `fps` is bound to a BinaryExpression initializer, which is not
        // proxyable, so the assignment to a `$state` field must not proxy.
        let out = transform_private_class_assign_ast(
            "const fps = 1000 / delta;\nthis.#fps = fps;",
            &ssv(&["this.#fps"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "const fps = 1000 / delta;\n\n$.set(this.#fps, fps);");
    }

    #[test]
    fn compound_state_without_proxy_primitive() {
        let out =
            transform_private_class_assign_ast("this.#count += 3;", &ssv(&["this.#count"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) + 3);");
    }

    #[test]
    fn post_increment_state() {
        let out = transform_private_class_assign_ast("this.#count++;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update(this.#count);");
    }

    #[test]
    fn post_decrement_state() {
        let out = transform_private_class_assign_ast("this.#count--;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update(this.#count, -1);");
    }

    #[test]
    fn pre_increment_state() {
        let out = transform_private_class_assign_ast("++this.#count;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update_pre(this.#count);");
    }

    #[test]
    fn pre_decrement_state() {
        let out = transform_private_class_assign_ast("--this.#count;", &ssv(&["this.#count"]), &[])
            .unwrap();
        assert_eq!(out, "$.update_pre(this.#count, -1);");
    }

    #[test]
    fn instance_prefix_state() {
        let out = transform_private_class_assign_ast(
            "instance.#count = 5;",
            &ssv(&["instance.#count"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(instance.#count, 5);");
    }

    #[test]
    fn unknown_field_left_alone() {
        assert!(
            transform_private_class_assign_ast("this.#other = 5;", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn does_not_rewrite_inside_string_literal() {
        let src = r#"let s = "this.#count = 5";"#;
        assert!(transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).is_none());
    }

    #[test]
    fn rewrites_inside_template_expression() {
        let src = "let s = `${this.#count = 5}`;";
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).unwrap();
        assert_eq!(out, "let s = `${$.set(this.#count, 5)}`;");
    }

    #[test]
    fn multiple_fields_in_one_source() {
        let out = transform_private_class_assign_ast(
            "this.#a = 1; this.#b++;",
            &ssv(&["this.#a"]),
            &ssv(&["this.#b"]),
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#a, 1);\n$.update(this.#b);");
    }

    #[test]
    fn already_wrapped_no_op() {
        // After wrap, the AssignmentExpression is gone.
        let src = "$.set(this.#count, 5);";
        assert!(transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).is_none());
    }

    #[test]
    fn arrow_function_rhs_no_proxy() {
        // Arrow function isn't proxy-needing.
        let out = transform_private_class_assign_ast(
            "this.#cb = (x) => x + 1;",
            &ssv(&["this.#cb"]),
            &[],
        )
        .unwrap();
        assert_eq!(out, "$.set(this.#cb, (x) => x + 1);");
    }

    #[test]
    fn member_chain_lhs_left_alone() {
        // `this.#count.foo = 5` — LHS is StaticMember, not bare
        // PrivateField. Different code path.
        assert!(
            transform_private_class_assign_ast("this.#count.foo = 5;", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn empty_qualified_no_op() {
        assert!(transform_private_class_assign_ast("this.#count = 5;", &[], &[]).is_none());
    }

    #[test]
    fn parse_error_returns_none() {
        assert!(
            transform_private_class_assign_ast("this.#count = (", &ssv(&["this.#count"]), &[])
                .is_none()
        );
    }

    #[test]
    fn no_op_without_qualified_in_source() {
        assert!(
            transform_private_class_assign_ast("let x = 1;", &ssv(&["this.#count"]), &[]).is_none()
        );
    }

    #[test]
    fn nullish_assign_state_proxies() {
        // `??=` is non-coercive and the built value is a LogicalExpression,
        // so a `$state` field always proxies (`, true`). Regression test for
        // issue #1438 (`??=` was previously left un-rewritten, producing the
        // invalid `$.get(this.#promise) ??= run()`).
        let out = transform_private_class_assign_ast(
            "this.#promise ??= run();",
            &ssv(&["this.#promise"]),
            &[],
        )
        .unwrap();
        assert_eq!(
            out,
            "$.set(this.#promise, $.get(this.#promise) ?? run(), true);"
        );
    }

    #[test]
    fn logical_or_assign_state_proxies() {
        let out =
            transform_private_class_assign_ast("this.#x ||= y;", &ssv(&["this.#x"]), &[]).unwrap();
        assert_eq!(out, "$.set(this.#x, $.get(this.#x) || y, true);");
    }

    #[test]
    fn logical_and_assign_state_proxies() {
        let out =
            transform_private_class_assign_ast("this.#x &&= y;", &ssv(&["this.#x"]), &[]).unwrap();
        assert_eq!(out, "$.set(this.#x, $.get(this.#x) && y, true);");
    }

    #[test]
    fn logical_assign_other_no_proxy() {
        // `$derived`/etc. (other_qualified) never proxy — no `, true`.
        let out =
            transform_private_class_assign_ast("this.#d ??= y;", &[], &ssv(&["this.#d"])).unwrap();
        assert_eq!(out, "$.set(this.#d, $.get(this.#d) ?? y);");
    }

    #[test]
    fn bitwise_compound_state_no_proxy() {
        // Bitwise compound (`&=`) is coercive → no proxy, binary expansion.
        let out =
            transform_private_class_assign_ast("this.#count &= 3;", &ssv(&["this.#count"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) & 3);");
    }

    #[test]
    fn shift_compound_state_no_proxy() {
        let out =
            transform_private_class_assign_ast("this.#count <<= 2;", &ssv(&["this.#count"]), &[])
                .unwrap();
        assert_eq!(out, "$.set(this.#count, $.get(this.#count) << 2);");
    }

    #[test]
    fn return_at_top_level_works() {
        // Class method bodies often have bare return
        let src = "return this.#count = 5;";
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#count"]), &[]).unwrap();
        assert_eq!(out, "return $.set(this.#count, 5);");
    }

    #[test]
    fn class_method_body_with_filter_lambda() {
        // Multi-line assignment inside a class method body.
        // The source is NOT valid as a standalone module (it's a method definition),
        // so Fix #2 (class wrapper) must kick in.
        let src = "remove(item) {\n  this.#files = this.#files.filter((f) => {\n    if (f === item) return false;\n    return true;\n  });\n}";
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#files"]), &[]).unwrap();
        // Asserted on the whitespace-free form: the shape is what matters here,
        // and the printer is free to break the call across lines.
        let flat: String = out.chars().filter(|c| !c.is_whitespace()).collect();
        // The assignment should be rewritten; no stray ) should appear
        assert!(
            flat.contains("$.set(this.#files,"),
            "expected $.set rewrite, got: {}",
            out
        );
        assert!(
            !out.contains("return false);"),
            "stray ) detected in: {}",
            out
        );
    }

    #[test]
    fn multiple_method_bodies_with_filter_lambda() {
        // Multiple method definitions in a single source block, one of which
        // has a multi-line filter lambda.  The entire block fails to parse as a
        // module, so Fix #2 (class wrapper) must kick in.
        let src = concat!(
            "get files() {\n  return this.#files;\n}\n",
            "remove(item) {\n",
            "  this.#files = this.#files.filter((f) => {\n",
            "    if (f === item) return false;\n",
            "    if (f.name.startsWith(item.name + \"/\")) return false;\n",
            "    return true;\n",
            "  });\n",
            "}\n",
            "add(item) {\n  this.#files = this.#files.concat(item);\n}\n",
        );
        let out = transform_private_class_assign_ast(src, &ssv(&["this.#files"]), &[]).unwrap();
        assert!(
            out.contains("$.set(this.#files,"),
            "expected $.set rewrite, got:\n{}",
            out
        );
        assert!(
            !out.contains("return false);"),
            "stray ) detected in:\n{}",
            out
        );
    }
}

// ── in-place port ──────────────────────────────────────────────────────

thread_local! {
    static MODULE_PRIVATE_CLASS_ASSIGN_IN_PLACE_ALLOC: RefCell<Allocator> =
        RefCell::new(Allocator::default());
}

/// The compound operators as nodes: logical assignment lowers to a
/// `LogicalExpression`, every other compound to a `BinaryExpression`.
enum CompoundOp {
    Binary(oxc_syntax::operator::BinaryOperator),
    Logical(oxc_syntax::operator::LogicalOperator),
}

fn compound_op_node(op: AssignmentOperator) -> Option<CompoundOp> {
    use AssignmentOperator::*;
    use oxc_syntax::operator::{BinaryOperator as B, LogicalOperator as L};
    Some(match op {
        Addition => CompoundOp::Binary(B::Addition),
        Subtraction => CompoundOp::Binary(B::Subtraction),
        Multiplication => CompoundOp::Binary(B::Multiplication),
        Division => CompoundOp::Binary(B::Division),
        Remainder => CompoundOp::Binary(B::Remainder),
        Exponential => CompoundOp::Binary(B::Exponential),
        ShiftLeft => CompoundOp::Binary(B::ShiftLeft),
        ShiftRight => CompoundOp::Binary(B::ShiftRight),
        ShiftRightZeroFill => CompoundOp::Binary(B::ShiftRightZeroFill),
        BitwiseOR => CompoundOp::Binary(B::BitwiseOR),
        BitwiseXOR => CompoundOp::Binary(B::BitwiseXOR),
        BitwiseAnd => CompoundOp::Binary(B::BitwiseAnd),
        LogicalOr => CompoundOp::Logical(L::Or),
        LogicalAnd => CompoundOp::Logical(L::And),
        LogicalNullish => CompoundOp::Logical(L::Coalesce),
        Assign => return None,
    })
}

/// In-place equivalent of [`transform_private_class_assign_ast`]. Class method
/// bodies reach this pass without their enclosing `class`, so the driver parses
/// them inside a synthetic one and strips it back off what it prints.
pub(crate) fn transform_private_class_assign_in_place(
    source: &str,
    state_qualified: &[String],
    other_qualified: &[String],
) -> Option<String> {
    if state_qualified.is_empty() && other_qualified.is_empty() {
        return None;
    }
    if !state_qualified
        .iter()
        .chain(other_qualified.iter())
        .any(|q| memchr::memmem::find(source.as_bytes(), q.as_bytes()).is_some())
    {
        return None;
    }

    ast_rewrite::with_class_fragment_program_mut(
        &MODULE_PRIVATE_CLASS_ASSIGN_IN_PLACE_ALLOC,
        source,
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        |allocator, program, parse_str| {
            let mut binding_info = BindingInfoCollector::default();
            binding_info.visit_program(program);

            let mut rewriter = PrivateClassAssignRewriter {
                b: crate::compiler::phases::phase3_transform::builders::B::new(allocator),
                alloc: allocator,
                source: parse_str,
                state_qualified,
                other_qualified,
                var_proxy: binding_info.var_proxy,
                reassigned: binding_info.reassigned,
                changed: false,
            };
            oxc_ast_visit::VisitMut::visit_program(&mut rewriter, program);
            rewriter.changed
        },
    )
}

struct PrivateClassAssignRewriter<'a, 'b> {
    b: crate::compiler::phases::phase3_transform::builders::B<'a>,
    alloc: &'a Allocator,
    source: &'b str,
    state_qualified: &'b [String],
    other_qualified: &'b [String],
    var_proxy: HashMap<String, bool>,
    reassigned: HashSet<String>,
    changed: bool,
}

impl<'a, 'b> PrivateClassAssignRewriter<'a, 'b> {
    fn rewrite_assignment(&mut self, expr: &mut Expression<'a>) {
        let Expression::AssignmentExpression(assign) = &*expr else {
            return;
        };
        let AssignmentTarget::PrivateFieldExpression(pf) = &assign.left else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        let Some(kind) = classify(pf_text, self.state_qualified, self.other_qualified) else {
            return;
        };
        let operator = assign.operator;

        // Mirrors upstream `AssignmentExpression.js`: only `=` and the logical
        // compounds are non-coercive, and the logical ones build a
        // `LogicalExpression`, which `should_proxy` always proxies.
        let needs_proxy = matches!(kind, Match::State)
            && match operator {
                AssignmentOperator::Assign => {
                    should_proxy_with_bindings(&assign.right, &self.var_proxy, &self.reassigned)
                }
                AssignmentOperator::LogicalOr
                | AssignmentOperator::LogicalAnd
                | AssignmentOperator::LogicalNullish => true,
                _ => false,
            };

        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::AssignmentExpression(assign) = taken else {
            unreachable!("checked above")
        };
        let assign = assign.unbox();
        let AssignmentTarget::PrivateFieldExpression(pf) = assign.left else {
            unreachable!("checked above")
        };

        let value = match compound_op_node(operator) {
            None => assign.right,
            Some(CompoundOp::Binary(op)) => self.b.binary(op, self.field_read(&pf), assign.right),
            Some(CompoundOp::Logical(op)) => self.b.logical(op, self.field_read(&pf), assign.right),
        };

        let mut args = vec![Expression::PrivateFieldExpression(pf), value];
        if needs_proxy {
            args.push(self.b.bool(true));
        }
        *expr = self.b.call("$.set", args);
        self.changed = true;
    }

    fn rewrite_update(&mut self, expr: &mut Expression<'a>) {
        let Expression::UpdateExpression(update) = &*expr else {
            return;
        };
        let SimpleAssignmentTarget::PrivateFieldExpression(pf) = &update.argument else {
            return;
        };
        let pf_text = &self.source[pf.span.start as usize..pf.span.end as usize];
        if classify(pf_text, self.state_qualified, self.other_qualified).is_none() {
            return;
        }
        let callee = if update.prefix {
            "$.update_pre"
        } else {
            "$.update"
        };
        let decrement = matches!(update.operator, UpdateOperator::Decrement);

        let taken = std::mem::replace(expr, self.b.void0());
        let Expression::UpdateExpression(update) = taken else {
            unreachable!("checked above")
        };
        let SimpleAssignmentTarget::PrivateFieldExpression(pf) = update.unbox().argument else {
            unreachable!("checked above")
        };

        let mut args = vec![Expression::PrivateFieldExpression(pf)];
        if decrement {
            args.push(
                self.b
                    .unary(UnaryOperator::UnaryNegation, self.b.number(1.0)),
            );
        }
        *expr = self.b.call(callee, args);
        self.changed = true;
    }

    fn field_read(
        &self,
        pf: &oxc_allocator::Box<'a, PrivateFieldExpression<'a>>,
    ) -> Expression<'a> {
        self.b.call(
            "$.get",
            vec![Expression::PrivateFieldExpression(pf.clone_in(self.alloc))],
        )
    }
}

impl<'a, 'b> oxc_ast_visit::VisitMut<'a> for PrivateClassAssignRewriter<'a, 'b> {
    fn visit_expression(&mut self, expr: &mut Expression<'a>) {
        oxc_ast_visit::walk_mut::walk_expression(self, expr);

        match &*expr {
            Expression::AssignmentExpression(_) => self.rewrite_assignment(expr),
            Expression::UpdateExpression(_) => self.rewrite_update(expr),
            _ => {}
        }
    }
}

#[cfg(test)]
mod in_place_tests {
    use super::*;

    fn ssv(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn rewrites_a_bare_class_method_body() {
        // A method definition is not a module, so this only reaches the rewriter
        // through the synthetic-`class` wrapper — and must come back without it.
        let src = "remove(item) {\n  this.#files = this.#files.filter((f) => f !== item);\n}";
        let out =
            transform_private_class_assign_in_place(src, &ssv(&["this.#files"]), &[]).unwrap();
        assert!(
            out.contains("$.set(this.#files,"),
            "expected $.set rewrite, got: {out}"
        );
        assert!(!out.contains("_Dummy_"), "wrapper leaked into: {out}");
        assert!(
            out.starts_with("remove(item)"),
            "wrapper indent leaked into: {out}"
        );
    }

    #[test]
    fn agrees_with_the_spliced_path_on_a_class_method_body() {
        let src = concat!(
            "get files() {\n  return this.#files;\n}\n",
            "add(item) {\n  this.#files = this.#files.concat(item);\n}\n",
        );
        let state = ssv(&["this.#files"]);
        let spliced = transform_private_class_assign_ast(src, &state, &[]).unwrap();
        let in_place = transform_private_class_assign_in_place(src, &state, &[]).unwrap();
        // Reprinting is not byte-preserving — the in-place path re-emits the whole
        // fragment — so the two paths are compared the way the dual-run gate
        // compares them: through the printer.
        assert_eq!(
            ast_rewrite::dual_run::normalize(&in_place),
            ast_rewrite::dual_run::normalize(&spliced),
        );
        assert_ne!(in_place, src, "the in-place path must have rewritten");
    }
}
