//! Restrictions acorn applies to a script that OXC does not.
//!
//! Two families. Every component script is an ES module and therefore strict,
//! and acorn applies the strict-mode early errors uniformly while OXC has no
//! such pass. And acorn implements a narrower grammar: `using` declarations,
//! the import phases and the deprecated `assert` clause are all syntax OXC
//! parses and acorn rejects. acorn is single-pass and non-recovering, so it
//! throws on the first violation it reaches and never sees any that follow —
//! callers take the earliest by position.

use oxc_ast::ast::{
    AssignmentTarget, BindingPattern, Class, Expression, FormalParameters, Function,
    ObjectPropertyKind, PropertyKey, SimpleAssignmentTarget, Statement, StringLiteral,
    TemplateLiteral,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rustc_hash::FxHashSet;

/// Words that cannot name a binding or be referenced in strict mode.
const RESERVED: &[&str] = &[
    "let",
    "yield",
    "static",
    "implements",
    "interface",
    "package",
    "private",
    "protected",
    "public",
];

/// The earliest strict-mode violation in `program`, as `(offset, message)`.
pub fn find_violation(
    program: &oxc_ast::ast::Program<'_>,
    source: &str,
    is_typescript: bool,
) -> Option<(u32, String)> {
    let mut scan = Scan {
        source,
        is_typescript,
        hits: Vec::new(),
    };
    scan.visit_program(program);
    scan.hits.into_iter().min_by_key(|(at, _)| *at)
}

struct Scan<'s> {
    source: &'s str,
    /// acorn-typescript keeps the deprecated `assert` clause, so that one
    /// restriction is JS-only.
    is_typescript: bool,
    hits: Vec<(u32, String)>,
}

impl Scan<'_> {
    fn hit(&mut self, at: u32, message: impl Into<String>) {
        self.hits.push((at, message.into()));
    }

    /// `assert { … }`, the withdrawn spelling of an import-attributes clause.
    fn check_with_clause(&mut self, clause: Option<&oxc_ast::ast::WithClause<'_>>) {
        let Some(clause) = clause else { return };
        if self.is_typescript || clause.keyword != oxc_ast::ast::WithClauseKeyword::Assert {
            return;
        }
        // The clause span starts at `{`; acorn stops at the keyword, and only
        // whitespace separates the two.
        let before = self.source[..clause.span.start as usize].trim_end();
        if let Some(prefix) = before.strip_suffix("assert") {
            self.hit(prefix.len() as u32, "Unexpected token");
        }
    }

    /// A binding or reference named `name` at `at`, checked against the names
    /// strict mode forbids.
    fn check_name(&mut self, name: &str, at: u32, binding: bool) {
        if name == "eval" || name == "arguments" {
            if binding {
                self.hit(at, format!("Binding {name} in strict mode"));
            }
            return;
        }
        if RESERVED.contains(&name) {
            self.hit(at, format!("The keyword '{name}' is reserved"));
        }
    }

    /// Collect every identifier a parameter list binds, in source order, and
    /// report the second occurrence of a repeated name.
    fn check_param_clash(&mut self, params: &FormalParameters<'_>) {
        let mut names: Vec<(String, u32)> = Vec::new();
        for item in &params.items {
            collect_pattern_names(&item.pattern, &mut names);
        }
        if let Some(rest) = &params.rest {
            collect_pattern_names(&rest.rest.argument, &mut names);
        }
        names.sort_by_key(|(_, at)| *at);
        let mut seen: FxHashSet<&str> = FxHashSet::default();
        for (name, at) in &names {
            if !seen.insert(name.as_str()) {
                self.hit(*at, "Argument name clash");
                break;
            }
        }
    }

    /// A `function` declaration used as a statement body — legal only under
    /// Annex B, which strict mode switches off.
    fn check_body_is_function(&mut self, stmt: &Statement<'_>) {
        if let Statement::FunctionDeclaration(f) = stmt {
            self.hit(f.span.start, "Unexpected token");
        }
    }
}

fn collect_pattern_names(pattern: &BindingPattern<'_>, out: &mut Vec<(String, u32)>) {
    match pattern {
        BindingPattern::BindingIdentifier(id) => {
            out.push((id.name.to_string(), id.span.start));
        }
        BindingPattern::ObjectPattern(o) => {
            for prop in &o.properties {
                collect_pattern_names(&prop.value, out);
            }
            if let Some(rest) = &o.rest {
                collect_pattern_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(a) => {
            for el in a.elements.iter().flatten() {
                collect_pattern_names(el, out);
            }
            if let Some(rest) = &a.rest {
                collect_pattern_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(a) => collect_pattern_names(&a.left, out),
    }
}

/// The offset of the first escape strict mode forbids inside `raw`, which spans
/// the whole literal including its delimiters. Returns the offset relative to
/// `raw` and whether it is a legacy octal (`\251`) or a `\8` / `\9`.
fn find_bad_escape(raw: &str) -> Option<(usize, bool)> {
    let b = raw.as_bytes();
    let mut i = 0;
    while i + 1 < b.len() {
        if b[i] != b'\\' {
            i += 1;
            continue;
        }
        let next = b[i + 1];
        if next == b'8' || next == b'9' {
            // acorn points at the digit, not at the backslash.
            return Some((i + 1, false));
        }
        if next.is_ascii_digit() {
            // `\0` is legal on its own; `\0` followed by a digit is not.
            let is_lone_zero = next == b'0' && !b.get(i + 2).is_some_and(|c| c.is_ascii_digit());
            if !is_lone_zero {
                return Some((i, true));
            }
        }
        // Skip the escaped character so `\\251` is not read as an escape.
        i += 2;
    }
    None
}

impl<'a> Visit<'a> for Scan<'_> {
    fn visit_numeric_literal(&mut self, lit: &oxc_ast::ast::NumericLiteral<'a>) {
        let raw = self
            .source
            .get(lit.span.start as usize..lit.span.end as usize)
            .unwrap_or("");
        let b = raw.as_bytes();
        if b.first() != Some(&b'0') || b.len() < 2 {
            return;
        }
        if !b[1].is_ascii_digit() {
            return;
        }
        self.hit(lit.span.start, "Invalid number");
    }

    fn visit_string_literal(&mut self, lit: &StringLiteral<'a>) {
        let raw = self
            .source
            .get(lit.span.start as usize..lit.span.end as usize)
            .unwrap_or("");
        if let Some((rel, octal)) = find_bad_escape(raw) {
            let msg = if octal {
                "Octal literal in strict mode"
            } else {
                "Invalid escape sequence"
            };
            self.hit(lit.span.start + rel as u32, msg);
        }
    }

    fn visit_template_literal(&mut self, lit: &TemplateLiteral<'a>) {
        for quasi in &lit.quasis {
            let raw = self
                .source
                .get(quasi.span.start as usize..quasi.span.end as usize)
                .unwrap_or("");
            if let Some((rel, _)) = find_bad_escape(raw) {
                self.hit(
                    quasi.span.start + rel as u32,
                    "Bad escape sequence in untagged template literal",
                );
            }
        }
        walk::walk_template_literal(self, lit);
    }

    fn visit_tagged_template_expression(
        &mut self,
        expr: &oxc_ast::ast::TaggedTemplateExpression<'a>,
    ) {
        // A tagged template may carry any escape — its raw strings survive.
        self.visit_expression(&expr.tag);
        for e in &expr.quasi.expressions {
            self.visit_expression(e);
        }
    }

    fn visit_unary_expression(&mut self, expr: &oxc_ast::ast::UnaryExpression<'a>) {
        if expr.operator == oxc_syntax::operator::UnaryOperator::Delete {
            let mut target = &expr.argument;
            while let Expression::ParenthesizedExpression(p) = target {
                target = &p.expression;
            }
            if matches!(target, Expression::Identifier(_)) {
                self.hit(expr.span.start, "Deleting local variable in strict mode");
            }
        }
        walk::walk_unary_expression(self, expr);
    }

    fn visit_assignment_expression(&mut self, expr: &oxc_ast::ast::AssignmentExpression<'a>) {
        if let AssignmentTarget::AssignmentTargetIdentifier(id) = &expr.left {
            let name = id.name.as_str();
            if name == "eval" || name == "arguments" {
                self.hit(id.span.start, format!("Assigning to {name} in strict mode"));
            }
        }
        walk::walk_assignment_expression(self, expr);
    }

    fn visit_update_expression(&mut self, expr: &oxc_ast::ast::UpdateExpression<'a>) {
        if let SimpleAssignmentTarget::AssignmentTargetIdentifier(id) = &expr.argument {
            let name = id.name.as_str();
            if name == "eval" || name == "arguments" {
                self.hit(id.span.start, format!("Assigning to {name} in strict mode"));
            }
        }
        walk::walk_update_expression(self, expr);
    }

    fn visit_identifier_reference(&mut self, id: &oxc_ast::ast::IdentifierReference<'a>) {
        self.check_name(id.name.as_str(), id.span.start, false);
    }

    fn visit_binding_identifier(&mut self, id: &oxc_ast::ast::BindingIdentifier<'a>) {
        self.check_name(id.name.as_str(), id.span.start, true);
    }

    fn visit_formal_parameters(&mut self, params: &FormalParameters<'a>) {
        self.check_param_clash(params);
        walk::walk_formal_parameters(self, params);
    }

    fn visit_function(&mut self, func: &Function<'a>, flags: oxc_semantic::ScopeFlags) {
        if let Some(id) = &func.id {
            self.check_name(id.name.as_str(), id.span.start, true);
        }
        walk::walk_function(self, func, flags);
    }

    fn visit_class(&mut self, class: &Class<'a>) {
        if let Some(id) = &class.id {
            self.check_name(id.name.as_str(), id.span.start, true);
        }
        walk::walk_class(self, class);
    }

    fn visit_variable_declaration(&mut self, decl: &oxc_ast::ast::VariableDeclaration<'a>) {
        use oxc_ast::ast::VariableDeclarationKind as K;
        // acorn does not implement explicit resource management, so it reads
        // `using` as an identifier and stops at the name that follows it.
        if matches!(decl.kind, K::Using | K::AwaitUsing)
            && let Some(first) = decl.declarations.first()
        {
            self.hit(first.id.span().start, "Unexpected token");
        }
        walk::walk_variable_declaration(self, decl);
    }

    fn visit_import_declaration(&mut self, decl: &oxc_ast::ast::ImportDeclaration<'a>) {
        // `import defer` / `import source` are stage-3 phases acorn does not
        // know; it stops at the token after the phase keyword, which is the
        // first specifier. `assert { … }` is the deprecated spelling of `with`.
        if decl.phase.is_some()
            && let Some(first) = decl.specifiers.as_ref().and_then(|s| s.first())
        {
            self.hit(first.span().start, "Unexpected token");
        }
        self.check_with_clause(decl.with_clause.as_deref());
        walk::walk_import_declaration(self, decl);
    }

    fn visit_export_from_declaration(&mut self, decl: &oxc_ast::ast::ExportFromDeclaration<'a>) {
        self.check_with_clause(decl.with_clause.as_deref());
        walk::walk_export_from_declaration(self, decl);
    }

    fn visit_export_all_declaration(&mut self, decl: &oxc_ast::ast::ExportAllDeclaration<'a>) {
        self.check_with_clause(decl.with_clause.as_deref());
        walk::walk_export_all_declaration(self, decl);
    }

    fn visit_object_expression(&mut self, obj: &oxc_ast::ast::ObjectExpression<'a>) {
        // `__proto__: x` sets the prototype and may appear once; a shorthand,
        // a method and a computed key are ordinary properties and do not count.
        let mut seen_proto = false;
        for prop in &obj.properties {
            let ObjectPropertyKind::ObjectProperty(p) = prop else {
                continue;
            };
            // Only a plain data property sets the prototype: a shorthand, a
            // method, an accessor and a computed key are all ordinary.
            if p.computed || p.shorthand || p.method || p.kind != oxc_ast::ast::PropertyKind::Init {
                continue;
            }
            let is_proto = match &p.key {
                PropertyKey::StaticIdentifier(id) => id.name == "__proto__",
                PropertyKey::StringLiteral(s) => s.value == "__proto__",
                _ => false,
            };
            if !is_proto {
                continue;
            }
            if seen_proto {
                self.hit(p.key.span().start, "Redefinition of __proto__ property");
                break;
            }
            seen_proto = true;
        }
        walk::walk_object_expression(self, obj);
    }

    fn visit_if_statement(&mut self, stmt: &oxc_ast::ast::IfStatement<'a>) {
        self.check_body_is_function(&stmt.consequent);
        if let Some(alt) = &stmt.alternate {
            self.check_body_is_function(alt);
        }
        walk::walk_if_statement(self, stmt);
    }

    fn visit_for_statement(&mut self, stmt: &oxc_ast::ast::ForStatement<'a>) {
        self.check_body_is_function(&stmt.body);
        walk::walk_for_statement(self, stmt);
    }

    fn visit_for_in_statement(&mut self, stmt: &oxc_ast::ast::ForInStatement<'a>) {
        self.check_body_is_function(&stmt.body);
        walk::walk_for_in_statement(self, stmt);
    }

    fn visit_for_of_statement(&mut self, stmt: &oxc_ast::ast::ForOfStatement<'a>) {
        self.check_body_is_function(&stmt.body);
        walk::walk_for_of_statement(self, stmt);
    }

    fn visit_while_statement(&mut self, stmt: &oxc_ast::ast::WhileStatement<'a>) {
        self.check_body_is_function(&stmt.body);
        walk::walk_while_statement(self, stmt);
    }

    fn visit_do_while_statement(&mut self, stmt: &oxc_ast::ast::DoWhileStatement<'a>) {
        self.check_body_is_function(&stmt.body);
        walk::walk_do_while_statement(self, stmt);
    }

    fn visit_labeled_statement(&mut self, stmt: &oxc_ast::ast::LabeledStatement<'a>) {
        self.check_body_is_function(&stmt.body);
        walk::walk_labeled_statement(self, stmt);
    }
}
