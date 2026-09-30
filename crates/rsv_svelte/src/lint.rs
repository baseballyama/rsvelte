//! eslint-plugin-svelte's rules and the JavaScript rules that see a component's template reads.
//!
//! Early rules read the surface tree, late rules the HIR; both read the one parse and the one name
//! resolution the compiler uses.

use rsv_js::lint::JsFacts;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::lint::{Findings, Rule};

use crate::ast::Component;
use crate::hir::{AttrValue, Hir};
use crate::resolve::Resolution;

/// What early rules read: the surface tree as written, and the JavaScript facts over it.
#[derive(Debug)]
pub struct AstCx<'a> {
    pub c: &'a Component,
    pub src: &'a str,
    pub js: JsFacts<'a>,
}

/// What late rules read: the HIR and name resolution.
#[derive(Debug)]
pub struct HirCx<'a> {
    pub hir: &'a Hir,
    pub res: &'a Resolution,
    pub src: &'a str,
}

type EarlyRule = dyn for<'a> Rule<AstCx<'a>>;
type LateRule = dyn for<'a> Rule<HirCx<'a>>;

static EARLY: &[&EarlyRule] = &[&NoUnusedVars];
static LATE: &[&LateRule] = &[&ButtonHasType];

/// The enabled rules, in the order the oracle configuration lists them: every early rule comes
/// before every late one, so running the layers in that order keeps ties in configuration order.
#[must_use]
pub fn lint(early: &AstCx<'_>, late: &HirCx<'_>) -> Vec<Diagnostic> {
    let mut f = Findings::new();
    f.run::<AstCx<'_>>(EARLY, early)
        .run::<HirCx<'_>>(LATE, late);
    f.finish()
}

/// The ids of the rules [`lint`] runs, in the order it runs them.
pub fn rule_ids() -> impl Iterator<Item = &'static str> {
    EARLY
        .iter()
        .map(|r| r.id())
        .chain(LATE.iter().map(|r| r.id()))
}

#[derive(Debug)]
pub struct NoUnusedVars;

impl<'a> Rule<AstCx<'a>> for NoUnusedVars {
    fn id(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, cx: &AstCx<'a>, out: &mut Vec<Diagnostic>) {
        rsv_js::lint::no_unused_vars(&cx.js, self.id(), |_| true, out);
    }
}

/// With the default options (`button`, `submit` and `reset` all allowed).
///
/// So the `forbiddenTypeAttribute` message cannot fire. The parser rejects directives and spreads,
/// so upstream's `bind:type` and spread branches have no input to decide yet.
#[derive(Debug)]
pub struct ButtonHasType;

impl<'a> Rule<HirCx<'a>> for ButtonHasType {
    fn id(&self) -> &'static str {
        "svelte/button-has-type"
    }

    fn check(&self, cx: &HirCx<'a>, out: &mut Vec<Diagnostic>) {
        let (hir, src) = (cx.hir, cx.src);
        for (_, el) in hir.elements() {
            if el.name.text(src) != "button" {
                continue;
            }
            let attrs = hir.attrs(el.attrs);
            let named_type = |a: &&crate::hir::Attribute| a.name.text(src) == "type";
            // A shorthand `{type}` is its own node kind upstream; `findAttribute` skips it.
            if let Some(a) = attrs
                .iter()
                .filter(named_type)
                .find(|a| !matches!(a.value, AttrValue::Shorthand(_)))
            {
                match &a.value {
                    AttrValue::Boolean => {
                        out.push(Diagnostic::error(self.id(), EMPTY, a.span));
                    }
                    AttrValue::Static(v) if v.is_empty() => {
                        out.push(Diagnostic::error(self.id(), EMPTY, a.span));
                    }
                    AttrValue::Interpolated(p) if p.is_empty() => {
                        out.push(Diagnostic::error(self.id(), EMPTY, a.span));
                    }
                    AttrValue::Static(v) if !matches!(&**v, "button" | "submit" | "reset") => {
                        out.push(Diagnostic::error(
                            self.id(),
                            format!("{v} is an invalid value for button type attribute."),
                            a.span,
                        ));
                    }
                    _ => {}
                }
                continue;
            }
            if attrs
                .iter()
                .filter(named_type)
                .any(|a| matches!(a.value, AttrValue::Shorthand(_)))
            {
                continue;
            }
            out.push(Diagnostic::error(
                self.id(),
                "Missing an explicit type attribute for button.",
                el.start_tag,
            ));
        }
    }
}

const EMPTY: &str = "A value must be set for button type attribute.";

#[cfg(test)]
mod tests {
    use rsv_kernel::source::LineIndex;

    fn lint(src: &str) -> String {
        let c = crate::parse::parse(src).expect("parses");
        let res = crate::resolve::resolve(&c.js, c.program, &c.template_exprs);
        let hir = crate::hir::lower(&c, src);
        let parents = c.js.parents();
        let early = super::AstCx {
            c: &c,
            src,
            js: rsv_js::lint::JsFacts {
                ast: &c.js,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let late = super::HirCx {
            hir: &hir,
            res: &res,
            src,
        };
        let findings = super::lint(&early, &late);
        let rules: Vec<&str> = super::rule_ids().collect();
        rsv_kernel::lint::render_json(src, &LineIndex::new(src), &rules, &findings)
    }

    fn unused(src: &str) -> Vec<String> {
        let got = lint(src);
        got.lines()
            .filter_map(|l| l.trim().strip_prefix("\"message\": \""))
            .map(|m| m.trim_end_matches("\",").to_owned())
            .collect()
    }

    // Expected values from the oracle (ESLint with svelte-eslint-parser and typescript-eslint's
    // parser, `no-unused-vars` alone) on these inputs.
    #[test]
    fn a_name_used_only_in_types_is_used() {
        let ts = |body: &str| format!("<script lang=\"ts\">\n{body}\n</script>\n");
        assert!(
            unused(&ts(
                "import type { A } from \"./a\";\nlet x: A = 1;\nconsole.log(x);"
            ))
            .is_empty()
        );
        assert!(
            unused(&ts("import { B } from \"./b\";\
                 \nlet y = $state<Map<string, B>>(new Map());\nconsole.log(y);"))
            .is_empty()
        );
        assert_eq!(
            unused(&ts("import { C } from \"./c\";")),
            ["'C' is defined but never used."]
        );
        assert_eq!(
            unused(&ts("import { D } from \"./d\";\ntype P = { D: string };\
                 \nlet p: P = { D: \"\" };\nconsole.log(p);")),
            ["'D' is defined but never used."]
        );
        assert_eq!(
            unused(&ts(
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
