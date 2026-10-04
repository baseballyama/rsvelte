//! eslint-plugin-svelte's rules and the JavaScript rules that see a component's template reads.
//!
//! Early rules read the surface tree, late rules the HIR; both read the one parse and the one name
//! resolution the compiler uses.

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_lint::rules::{Findings, Rule};
use rsvelte_markup::button_type::{Allowed, Problem, check_static};
use rsvelte_svelte::compilation::compiler_syntax_tree::{AttributeValue, CompilerSyntaxTree};
use rsvelte_svelte::semantic::resolve::Resolution;
use rsvelte_svelte::syntax::syntax_tree::Component;
use rsvelte_typescript_lint::JavaScriptFacts;

/// What early rules read: the surface tree as written, and the JavaScript facts over it.
#[derive(Debug)]
pub struct SyntaxTreeContext<'a> {
    pub c: &'a Component,
    pub source_text: &'a str,
    pub javascript: JavaScriptFacts<'a>,
}

/// What late rules read: the HIR and name resolution.
#[derive(Debug)]
pub struct CompilerSyntaxTreeContext<'a> {
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub res: &'a Resolution,
    pub source_text: &'a str,
}

type EarlyRule = dyn for<'a> Rule<SyntaxTreeContext<'a>>;
type LateRule = dyn for<'a> Rule<CompilerSyntaxTreeContext<'a>>;

static EARLY: &[&EarlyRule] = &[&NoUnusedVariables];
static LATE: &[&LateRule] = &[&ButtonHasType];

/// The enabled rules, in the order the oracle configuration lists them: every early rule comes
/// before every late one, so running the layers in that order keeps ties in configuration order.
#[must_use]
pub fn lint(
    early: &SyntaxTreeContext<'_>,
    late: &CompilerSyntaxTreeContext<'_>,
) -> Vec<Diagnostic> {
    let mut f = Findings::new();
    f.run::<SyntaxTreeContext<'_>>(EARLY, early)
        .run::<CompilerSyntaxTreeContext<'_>>(LATE, late);
    f.finish()
}

/// The identifiers of the rules [`lint`] runs, in the order it runs them.
pub fn rule_identifiers() -> impl Iterator<Item = &'static str> {
    EARLY
        .iter()
        .map(|r| r.identifier())
        .chain(LATE.iter().map(|r| r.identifier()))
}

#[derive(Debug)]
pub struct NoUnusedVariables;

impl<'a> Rule<SyntaxTreeContext<'a>> for NoUnusedVariables {
    fn identifier(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, context: &SyntaxTreeContext<'a>, out: &mut Vec<Diagnostic>) {
        rsvelte_typescript_lint::no_unused_variables(
            &context.javascript,
            self.identifier(),
            |_| true,
            out,
        );
    }
}

/// With the default options, so the `forbiddenTypeAttribute` message cannot fire.
///
/// The judgement is [`rsvelte_markup::button_type`]'s, shared with `vue/html-button-has-type`; what
/// is Svelte's is which attribute is the `type` and that findings sit on the whole attribute.
#[derive(Debug)]
pub struct ButtonHasType;

impl<'a> Rule<CompilerSyntaxTreeContext<'a>> for ButtonHasType {
    fn identifier(&self) -> &'static str {
        "svelte/button-has-type"
    }

    fn check(&self, context: &CompilerSyntaxTreeContext<'a>, out: &mut Vec<Diagnostic>) {
        let (compiler_syntax_tree, source_text) =
            (context.compiler_syntax_tree, context.source_text);
        for (_, el) in compiler_syntax_tree.elements() {
            if el.name.text(source_text) != "button" {
                continue;
            }
            let types: Vec<_> = compiler_syntax_tree
                .attributes(el.attributes)
                .iter()
                .filter(|a| {
                    !matches!(a.value, AttributeValue::Class(_))
                        && a.name.text(source_text) == "type"
                })
                .collect();
            // A shorthand `{type}` is its own node kind upstream: `findAttribute` skips it, and
            // finding one afterwards satisfies the rule.
            let (problem, span) = match types
                .iter()
                .find(|a| !matches!(a.value, AttributeValue::Shorthand(_)))
            {
                Some(a) => {
                    let problem = match &a.value {
                        AttributeValue::Boolean => Some(Problem::Empty),
                        AttributeValue::Interpolated(p) if p.is_empty() => Some(Problem::Empty),
                        AttributeValue::Static(v) => check_static(v, Allowed::default()),
                        _ => None,
                    };
                    (problem, a.span)
                }
                // Upstream: a spread may set the type.
                None if types.is_empty()
                    && !compiler_syntax_tree
                        .attributes(el.attributes)
                        .iter()
                        .any(|a| matches!(a.value, AttributeValue::Spread(_))) =>
                {
                    (Some(Problem::Missing), el.start_tag)
                }
                None => continue,
            };
            if let Some(p) = problem {
                out.push(Diagnostic::error(self.identifier(), p.message(), span));
            }
        }
    }
}
