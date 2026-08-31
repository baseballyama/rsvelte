//! A property of the generated program, asserted rather than compared.
//!
//! Every gate in this repository compares rsvelte's output to official's on some
//! population, so a defect is only ever found where someone collected an input
//! that reaches it. `two-ports-inventory.md` row 21 is a class that defeats
//! that: a rewrite pass that matches a binding by NAME claims an identifier
//! resolving to a shadow. The observable end state needs no oracle — the
//! generated program hands a signal helper something the same program declared
//! as an ordinary value.
//!
//! Off unless `RSVELTE_ASSERT_SIGNAL_DISCIPLINE` is set. A violation is printed,
//! never panicked: release builds are `panic = "abort"`, which would turn a
//! corpus sweep into a bisect.

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{Semantic, SemanticBuilder};
use oxc_span::SourceType;
use oxc_syntax::symbol::SymbolId;
use rustc_hash::FxHashSet;

/// The runtime calls whose first argument must be a signal.
const SIGNAL_SINKS: [&str; 6] = [
    "$.set",
    "$.get",
    "$.mutate",
    "$.update",
    "$.update_pre",
    "$.increment",
];

/// Is `RSVELTE_ASSERT_SIGNAL_DISCIPLINE` set?
fn enabled() -> bool {
    static ON: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *ON.get_or_init(|| std::env::var_os("RSVELTE_ASSERT_SIGNAL_DISCIPLINE").is_some())
}

/// Marker the harness requires before it may read a clean run as clean.
///
/// A binary with the check not compiled in emits nothing, which is
/// indistinguishable from a tree that satisfies the property. Printed from
/// inside the walk, so it also proves the walk was reached.
fn announce_armed() {
    static ANNOUNCED: std::sync::Once = std::sync::Once::new();
    ANNOUNCED.call_once(|| eprintln!("RSVELTE_SIGNAL_DISCIPLINE_ARMED"));
}

/// Report every signal write in `code` whose target the same program declares as
/// an ordinary value.
pub(super) fn check(code: &str, component: &str) {
    if !enabled() {
        return;
    }
    for violation in violations(code) {
        announce_armed();
        eprintln!("RSVELTE_SIGNAL_DISCIPLINE {component} {violation}");
    }
    announce_armed();
}

fn violations(code: &str) -> Vec<String> {
    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, SourceType::mjs()).parse();
    if !parsed.diagnostics.is_empty() {
        // Unparseable output is a different property, with a gate of its own.
        return Vec::new();
    }
    let built = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&parsed.program);
    let facts = Facts::collect(&parsed.program);
    let mut visitor = SinkVisitor {
        semantic: &built.semantic,
        facts,
        out: Vec::new(),
    };
    visitor.visit_program(&parsed.program);
    visitor.out
}

/// What the program itself says about each symbol it declares.
#[derive(Default)]
struct Facts {
    /// Declared as an ordinary value: no signal can have reached it.
    plain: FxHashSet<SymbolId>,
    /// Initialised from `$.prop(…)` / `$.rest_props(…)`, so calling it writes a prop.
    prop_accessor: FxHashSet<SymbolId>,
}

impl Facts {
    fn collect(program: &Program<'_>) -> Self {
        let mut facts = Facts::default();
        let mut collector = Collector {
            facts: &mut facts,
            runtime_callbacks: FxHashSet::default(),
        };
        collector.visit_program(program);
        facts
    }
}

struct Collector<'f> {
    facts: &'f mut Facts,
    /// Start offsets of the functions passed directly to a runtime helper. Such
    /// a parameter receives whatever the runtime passes — an each-block item and
    /// index are both signals — so its provenance is not in this program.
    /// Nesting cannot answer this: `$.set(x, xs.reduce((acc) => …))` puts a user
    /// callback inside a runtime call's argument, and `acc` is not a signal.
    runtime_callbacks: FxHashSet<u32>,
}

impl Collector<'_> {
    fn note_params(&mut self, span: oxc_span::Span, params: &FormalParameters<'_>) {
        if self.runtime_callbacks.contains(&span.start) {
            return;
        }
        for param in &params.items {
            if let BindingPattern::BindingIdentifier(id) = &param.pattern
                && let Some(symbol_id) = id.symbol_id.get()
            {
                self.facts.plain.insert(symbol_id);
            }
        }
    }
}

impl<'ast> Visit<'ast> for Collector<'_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        if runtime_helper(call).is_some() {
            for argument in &call.arguments {
                match argument {
                    Argument::FunctionExpression(func) => {
                        self.runtime_callbacks.insert(func.span.start);
                    }
                    Argument::ArrowFunctionExpression(func) => {
                        self.runtime_callbacks.insert(func.span.start);
                    }
                    _ => {}
                }
            }
        }
        walk::walk_call_expression(self, call);
    }

    fn visit_function(&mut self, func: &Function<'ast>, flags: oxc_semantic::ScopeFlags) {
        self.note_params(func.span, &func.params);
        walk::walk_function(self, func, flags);
    }

    fn visit_arrow_function_expression(&mut self, func: &ArrowFunctionExpression<'ast>) {
        self.note_params(func.span, &func.params);
        walk::walk_arrow_function_expression(self, func);
    }

    fn visit_variable_declaration(&mut self, decl: &VariableDeclaration<'ast>) {
        walk::walk_variable_declaration(self, decl);
        for declarator in &decl.declarations {
            let BindingPattern::BindingIdentifier(id) = &declarator.id else {
                continue;
            };
            let Some(symbol_id) = id.symbol_id.get() else {
                continue;
            };
            match declarator.init.as_ref().map(initialiser_kind) {
                Some(Initialiser::PropAccessor) => {
                    self.facts.prop_accessor.insert(symbol_id);
                }
                // Upstream itself emits `const st = 1` beside a `$.set(st, …)` in
                // the accessor generated for `export const st = $state(1)`: dead
                // code in a setter a `const` export can never call. So a `const`
                // cannot be judged here without contradicting the oracle.
                Some(Initialiser::Literal) if decl.kind != VariableDeclarationKind::Const => {
                    self.facts.plain.insert(symbol_id);
                }
                _ => {}
            }
        }
    }
}

enum Initialiser {
    Literal,
    PropAccessor,
    Unknown,
}

fn initialiser_kind(expression: &Expression<'_>) -> Initialiser {
    match expression {
        Expression::CallExpression(call) => match runtime_helper(call) {
            Some("prop" | "rest_props") => Initialiser::PropAccessor,
            _ => Initialiser::Unknown,
        },
        Expression::ObjectExpression(object) if object.properties.is_empty() => {
            Initialiser::Literal
        }
        Expression::ArrayExpression(array) if array.elements.is_empty() => Initialiser::Literal,
        other if other.is_literal() => Initialiser::Literal,
        _ => Initialiser::Unknown,
    }
}

/// The `x` of a `$.x(…)` call.
fn runtime_helper<'a>(call: &'a CallExpression<'_>) -> Option<&'a str> {
    let Expression::StaticMemberExpression(member) = &call.callee else {
        return None;
    };
    let Expression::Identifier(root) = &member.object else {
        return None;
    };
    (root.name == "$").then(|| member.property.name.as_str())
}

struct SinkVisitor<'sem> {
    semantic: &'sem Semantic<'sem>,
    facts: Facts,
    out: Vec<String>,
}

impl SinkVisitor<'_> {
    fn symbol_of(&self, id: &IdentifierReference<'_>) -> Option<SymbolId> {
        let reference_id = id.reference_id.get()?;
        self.semantic
            .scoping()
            .get_reference(reference_id)
            .symbol_id()
    }
}

impl<'ast> Visit<'ast> for SinkVisitor<'_> {
    fn visit_call_expression(&mut self, call: &CallExpression<'ast>) {
        walk::walk_call_expression(self, call);

        if let Some(helper) = runtime_helper(call) {
            let sink = format!("$.{helper}");
            if !SIGNAL_SINKS.contains(&sink.as_str()) {
                return;
            }
            let Some(Argument::Identifier(first)) = call.arguments.first() else {
                return;
            };
            if self
                .symbol_of(first)
                .is_some_and(|symbol| self.facts.plain.contains(&symbol))
            {
                self.out.push(format!(
                    "{sink}({}) — declared as a plain value",
                    first.name
                ));
            }
            return;
        }

        // A prop write is `name(name().x = v, true)`, so the callee has to be a
        // `$.prop` accessor. Anything else the program declares is a shadow the
        // lowering claimed.
        let Expression::Identifier(callee) = &call.callee else {
            return;
        };
        if call.arguments.len() != 2
            || !matches!(
                call.arguments[0],
                Argument::AssignmentExpression(_) | Argument::UpdateExpression(_)
            )
            || !matches!(&call.arguments[1], Argument::BooleanLiteral(flag) if flag.value)
        {
            return;
        }
        let Some(symbol) = self.symbol_of(callee) else {
            return;
        };
        if !self.facts.prop_accessor.contains(&symbol) {
            self.out.push(format!(
                "{}(… , true) — not declared as a prop accessor",
                callee.name
            ));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The shape `two-ports-inventory.md` row 21 found, at both sinks: a write
    /// lowering claimed an identifier that resolves to a shadow in its own input.
    #[test]
    fn reports_a_write_to_something_the_program_declares_plain() {
        assert_eq!(
            violations("function f() { let n = 5; $.set(n, 6); return n; }"),
            vec!["$.set(n) — declared as a plain value".to_string()]
        );
        assert_eq!(
            violations("for (const p of xs) { p(p().a = 1, true); }"),
            vec!["p(… , true) — not declared as a prop accessor".to_string()]
        );
        assert_eq!(
            violations("xs.reduce((acc, x) => { $.mutate(acc, $.get(acc).n += 1); });"),
            vec![
                "$.get(acc) — declared as a plain value".to_string(),
                "$.mutate(acc) — declared as a plain value".to_string(),
            ]
        );
    }

    /// The control: the same programs with the target genuinely lowered are
    /// clean, so the check answers the declaration rather than the call.
    #[test]
    fn a_lowered_target_is_clean() {
        assert!(violations("function f() { let n = $.state(5); $.set(n, 6); }").is_empty());
        assert!(violations("let p = $.prop($$props, 'p', 3); p(p().a = 1, true);").is_empty());
    }

    /// Provenance this program does not carry is skipped, not judged: a
    /// declarator with no initialiser is assigned one later, an import comes
    /// from another module, and a parameter of a runtime callback receives
    /// whatever the runtime passes — an each-block item and index are signals.
    #[test]
    fn unknown_provenance_is_not_a_violation() {
        for code in [
            "function f() { let n; n = $.state(1); $.set(n, 6); }",
            "import { n } from 'x'; $.set(n, 6);",
            "function f() { let [n] = xs; $.set(n, 6); }",
            "$.each(node, 0, () => xs, $.index, ($$anchor, item, $$index) => { $.get(item); });",
            // A user callback in a runtime call's ARGUMENT is not a runtime
            // callback, and nesting alone cannot tell the two apart.
            "$.set(s, xs.reduce((acc, x) => acc));",
            "function f($$index) { let i = $$index; return $.get(i); }",
            "const st = 1; var e = { set st(v) { $.set(st, v); } };",
        ] {
            assert!(violations(code).is_empty(), "{code}");
        }
    }

    /// A user callback nested inside a runtime one is user code again, which is
    /// exactly where row 21's defect lives.
    #[test]
    fn a_user_callback_inside_a_runtime_callback_is_still_judged() {
        assert_eq!(
            violations("$.template_effect(() => { xs.forEach((c) => { $.set(c, 1); }); });"),
            vec!["$.set(c) — declared as a plain value".to_string()]
        );
        assert_eq!(
            violations("$.set(s, xs.reduce((acc, x) => { $.mutate(acc, $.get(acc).n += 1); }));"),
            vec![
                "$.get(acc) — declared as a plain value".to_string(),
                "$.mutate(acc) — declared as a plain value".to_string(),
            ]
        );
    }

    /// A shadow makes the two `n`s different symbols, so the outer plain
    /// declaration must not condemn the inner signal's write.
    #[test]
    fn the_check_is_per_symbol_not_per_name() {
        assert!(
            violations("let n = 5; function f() { let n = $.state(1); $.set(n, 2); }").is_empty()
        );
    }
}
