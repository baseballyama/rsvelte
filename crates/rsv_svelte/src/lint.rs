//! eslint-plugin-svelte's rules and the JavaScript rules that see a component's template reads.
//! Every rule reads the one parse and the one scope analysis the compiler uses.

use crate::ast::{AttrValue, Component, Part, TNode, decode_text};
use rsv_js::lint::JsFacts;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::lint::Rule;

pub struct LintCx<'a> {
    pub c: &'a Component,
    pub src: &'a str,
    pub js: JsFacts<'a>,
}

/// The enabled rules, in the order the oracle configuration lists them.
pub fn rules<'a>() -> [&'a dyn Rule<LintCx<'a>>; 2] {
    [&NoUnusedVars, &ButtonHasType]
}

pub struct NoUnusedVars;

impl<'a> Rule<LintCx<'a>> for NoUnusedVars {
    fn id(&self) -> &'static str {
        "no-unused-vars"
    }

    fn check(&self, cx: &LintCx<'a>, out: &mut Vec<Diagnostic>) {
        rsv_js::lint::no_unused_vars(&cx.js, self.id(), out);
    }
}

/// With the default options (`button`, `submit` and `reset` all allowed), so the
/// `forbiddenTypeAttribute` message cannot fire. The parser rejects directives and spreads, so
/// upstream's `bind:type` and spread branches have no input to decide yet.
pub struct ButtonHasType;

impl<'a> Rule<LintCx<'a>> for ButtonHasType {
    fn id(&self) -> &'static str {
        "svelte/button-has-type"
    }

    fn check(&self, cx: &LintCx<'a>, out: &mut Vec<Diagnostic>) {
        let (c, src) = (cx.c, cx.src);
        for node in &c.nodes {
            let TNode::Element {
                name,
                attrs,
                start_tag,
                ..
            } = node
            else {
                continue;
            };
            if name.text(src) != "button" {
                continue;
            }
            let attrs = c.attrs(*attrs);
            // A shorthand `{type}` is its own node kind upstream; `findAttribute` skips it.
            let is_shorthand = |a: &crate::ast::Attr| src.as_bytes()[a.span.lo as usize] == b'{';
            if let Some(a) = attrs
                .iter()
                .find(|a| !is_shorthand(a) && a.name.text(src) == "type")
            {
                let parts = match a.value {
                    AttrValue::True => &[][..],
                    AttrValue::Parts(r) => c.parts(r),
                };
                if parts
                    .iter()
                    .all(|p| matches!(p, Part::Text(s) if s.is_empty()))
                {
                    out.push(Diagnostic::error(
                        self.id(),
                        "A value must be set for button type attribute.",
                        a.span,
                    ));
                    continue;
                }
                let mut value = String::new();
                for p in parts {
                    match p {
                        Part::Text(s) => value.push_str(&decode_text(s.text(src))),
                        Part::Expr { .. } => break,
                    }
                }
                let is_static = parts.iter().all(|p| matches!(p, Part::Text(_)));
                if is_static && !matches!(value.as_str(), "button" | "submit" | "reset") {
                    out.push(Diagnostic::error(
                        self.id(),
                        format!("{value} is an invalid value for button type attribute."),
                        a.span,
                    ));
                }
                continue;
            }
            if attrs
                .iter()
                .any(|a| is_shorthand(a) && a.name.text(src) == "type")
            {
                continue;
            }
            out.push(Diagnostic::error(
                self.id(),
                "Missing an explicit type attribute for button.",
                *start_tag,
            ));
        }
    }
}

#[cfg(test)]
mod tests {
    use rsv_kernel::source::LineIndex;

    fn lint(src: &str) -> String {
        let c = crate::parse::parse(src).expect("parses");
        let res = crate::resolve::resolve(&c.js, c.program, &c.template_exprs);
        let parents = c.js.parents();
        let cx = super::LintCx {
            c: &c,
            src,
            js: rsv_js::lint::JsFacts {
                ast: &c.js,
                sem: &res.sem,
                parents: &parents,
            },
        };
        let findings = rsv_kernel::lint::run(&super::rules(), &cx);
        rsv_kernel::lint::render_json(src, &LineIndex::new(src), &findings)
    }

    // Expected value from the oracle (tools/fixtures svelte.lint on this input).
    #[test]
    fn exported_declarations_are_not_unused() {
        let got = lint(
            "<script>\n\texport const e = 1;\n\texport function k() {}\n\tlet u = 1;\n</script>",
        );
        let want = "[\n\t{\n\t\t\"rule\": \"no-unused-vars\",\n\t\t\"message\": \"'u' is assigned a value but never used.\",\n\t\t\"start\": {\n\t\t\t\"line\": 4,\n\t\t\t\"column\": 6\n\t\t},\n\t\t\"end\": {\n\t\t\t\"line\": 4,\n\t\t\t\"column\": 7\n\t\t}\n\t}\n]\n";
        assert_eq!(got, want);
    }
}
