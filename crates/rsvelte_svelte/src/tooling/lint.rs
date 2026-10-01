//! eslint-plugin-svelte's rules and the JavaScript rules that see a component's template reads.
//!
//! Early rules read the surface tree, late rules the HIR; both read the one parse and the one name
//! resolution the compiler uses.

use rsvelte_javascript::lint::JavaScriptFacts;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::diagnostics::rules::{Findings, Rule};
use rsvelte_markup::button_type::{Allowed, Problem, check_static};

use crate::compilation::compiler_syntax_tree::{AttributeValue, CompilerSyntaxTree};
use crate::semantic::resolve::Resolution;
use crate::syntax::syntax_tree::Component;

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
        rsvelte_javascript::lint::no_unused_variables(
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
/// is Svelte's is which attribute is the `type` and that findings sit on the whole attribute. The
/// parser rejects directives and spreads, so upstream's `bind:type` and spread branches have no
/// input to decide.
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
                .filter(|a| a.name.text(source_text) == "type")
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
                None if types.is_empty() => (Some(Problem::Missing), el.start_tag),
                None => continue,
            };
            if let Some(p) = problem {
                out.push(Diagnostic::error(self.identifier(), p.message(), span));
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use rsvelte_kernel::source::positions::LineIndex;

    fn lint(source_text: &str) -> String {
        let c = crate::syntax::parse::parse(source_text).expect("parses");
        let res =
            crate::semantic::resolve::resolve(&c.javascript, c.program, &c.template_expressions);
        let compiler_syntax_tree = crate::compilation::compiler_syntax_tree::lower(&c, source_text);
        let parents = c.javascript.parents();
        let early = super::SyntaxTreeContext {
            c: &c,
            source_text,
            javascript: rsvelte_javascript::lint::JavaScriptFacts {
                syntax_tree: &c.javascript,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let late = super::CompilerSyntaxTreeContext {
            compiler_syntax_tree: &compiler_syntax_tree,
            res: &res,
            source_text,
        };
        let findings = super::lint(&early, &late);
        let rules: Vec<&str> = super::rule_identifiers().collect();
        rsvelte_kernel::diagnostics::rules::render_json(
            &LineIndex::new(source_text),
            &rules,
            &findings,
        )
    }

    fn unused(source_text: &str) -> Vec<String> {
        let got = lint(source_text);
        got.lines()
            .filter_map(|l| l.trim().strip_prefix("\"message\": \""))
            .map(|m| m.trim_end_matches("\",").to_owned())
            .collect()
    }

    // Expected values from the oracle (ESLint with svelte-eslint-parser and typescript-eslint's
    // parser, `no-unused-variables` alone) on these inputs.
    #[test]
    fn a_name_used_only_in_types_is_used() {
        let typescript = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>\n");
        assert!(
            unused(&typescript(
                "import type { A } from \"./a\";\nlet x: A = 1;\nconsole.log(x);"
            ))
            .is_empty()
        );
        assert!(
            unused(&typescript(
                "import { B } from \"./b\";\
                 \nlet y = $state<Map<string, B>>(new Map());\nconsole.log(y);"
            ))
            .is_empty()
        );
        assert_eq!(
            unused(&typescript("import { C } from \"./c\";")),
            ["'C' is defined but never used."]
        );
        assert_eq!(
            unused(&typescript(
                "import { D } from \"./d\";\ntype P = { D: string };\
                 \nlet p: P = { D: \"\" };\nconsole.log(p);"
            )),
            ["'D' is defined but never used."]
        );
        assert_eq!(
            unused(&typescript(
                "import { F } from \"./f\";\nlet v: X.F;\nconsole.log(v);"
            )),
            ["'F' is defined but never used."]
        );
    }

    // Expected value from the oracle (tools/fixtures svelte.lint on this input).
    #[test]
    fn exported_declarations_are_not_unused() {
        let got = lint(
            "<script>\n\texport const e = 1;\n\texport function k() {}\n\tlet u = 1;\n</script>",
        );
        let want = "\"findings\": [\
                    \n\t\t{\
                    \n\t\t\t\"rule\": \"no-unused-vars\",\
                    \n\t\t\t\"message\": \"'u' is assigned a value but never used.\",\
                    \n\t\t\t\"start\": {\n\t\t\t\t\"line\": 4,\n\t\t\t\t\"column\": 6\n\t\t\t},\
                    \n\t\t\t\"end\": {\n\t\t\t\t\"line\": 4,\n\t\t\t\t\"column\": 7\n\t\t\t}\
                    \n\t\t}\
                    \n\t]\n}\n";
        assert!(got.ends_with(want), "{got}");
    }
}
