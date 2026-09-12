//! Port of `InlayHintProvider`'s generated-code filters
//! (`language-server/src/plugins/typescript/features/InlayHintProvider.ts:66-89`).
//!
//! Upstream answers five of them from the shadow's TypeScript AST. oxc parses the
//! same shadow, but its node set is not TypeScript's, so the two traversals
//! (`features/utils.ts:187-228`) are reproduced against a pre-order record rather
//! than ported call for call.

use oxc_allocator::Allocator;
use oxc_ast::ast::{Argument, Expression, Statement, VariableDeclarator};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType, Span};

/// What a filter needs from one node, alongside its span and parent.
#[derive(Debug, Clone)]
enum Kind {
    /// `ts.isCallOrNewExpression`, with the callee text span and the `getStart()`
    /// of each argument (`InlayHintProvider.ts:204-206`).
    Call {
        callee: Span,
        callee_is_identifier: bool,
        argument_starts: Vec<u32>,
        /// `getTypeAnnotationPosition(arguments[0])` when that argument is an arrow.
        first_argument_arrow_params_end: Option<u32>,
    },
    New {
        argument_starts: Vec<u32>,
    },
    /// TS's `VariableDeclaration`; oxc's statement of that name is TS's
    /// `VariableStatement`, so the binding node is the declarator.
    Declarator {
        name: Span,
    },
    Arrow {
        is_async: bool,
        params_end: u32,
    },
    /// `ts.isBlock` — a `BlockStatement` or a function body. `Program` is a
    /// `SourceFile` upstream and deliberately not one of these.
    Block,
    Other,
}

#[derive(Debug)]
struct Entry {
    span: Span,
    parent: Option<usize>,
    kind: Kind,
}

/// A pre-order record of the shadow's AST.
#[derive(Debug, Default)]
pub struct ShadowNodes {
    entries: Vec<Entry>,
    stack: Vec<usize>,
}

impl ShadowNodes {
    /// `None` when the shadow does not parse; upstream's `SourceFile` is
    /// best-effort where oxc is not, so a filter with no tree must not run.
    #[must_use]
    pub fn parse(text: &str) -> Option<Self> {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, text, SourceType::tsx()).parse();
        if ret.panicked {
            return None;
        }
        let mut nodes = Self::default();
        nodes.visit_program(&ret.program);
        Some(nodes)
    }

    fn push(&mut self, span: Span, kind: Kind) -> usize {
        let index = self.entries.len();
        self.entries.push(Entry {
            span,
            parent: self.stack.last().copied(),
            kind,
        });
        self.stack.push(index);
        index
    }

    fn pop(&mut self) {
        self.stack.pop();
    }

    /// `child.getStart() <= start && child.getEnd() >= end` for the zero-length
    /// spans every rule passes (`features/utils.ts:197`). A node ending at the
    /// offset and the next node starting at it therefore both contain it.
    fn contains(&self, index: usize, offset: u32) -> bool {
        let span = self.entries[index].span;
        span.start <= offset && span.end >= offset
    }

    fn is_descendant_of(&self, mut index: usize, ancestor: usize) -> bool {
        while let Some(parent) = self.entries[index].parent {
            if parent == ancestor {
                return true;
            }
            index = parent;
        }
        false
    }

    /// `findContainingNode` — the recursion descends only into children that
    /// themselves contain the span, so the answer is the first match in
    /// pre-order among containing nodes, which is the OUTERMOST one.
    fn find_containing(
        &self,
        offset: u32,
        within: Option<usize>,
        matches: impl Fn(&Kind) -> bool,
    ) -> Option<usize> {
        (0..self.entries.len()).find(|&index| {
            within.is_none_or(|root| self.is_descendant_of(index, root))
                && self.contains(index, offset)
                && matches(&self.entries[index].kind)
        })
    }

    /// `findClosestContainingNode` — re-enters the match it just found until
    /// none is left, so its answer is always inside `find_containing`'s. The
    /// shorter spelling, "the containing match with the greatest start", can
    /// leave that subtree when two containing matches are siblings, which for a
    /// zero-length offset needs their spans to touch. No such input was found:
    /// the two agree on all 912 (offset, predicate) pairs of the adjacency
    /// corpus below, because JavaScript puts a separator between siblings. This
    /// form is kept because upstream's algorithm is the specification, not
    /// because a divergence was demonstrated.
    fn find_closest_containing(
        &self,
        offset: u32,
        matches: impl Fn(&Kind) -> bool + Copy,
    ) -> Option<usize> {
        let mut closest = self.find_containing(offset, None, matches)?;
        while let Some(inner) = self.find_containing(offset, Some(closest), matches) {
            closest = inner;
        }
        Some(closest)
    }
}

impl<'a> Visit<'a> for ShadowNodes {
    fn visit_expression(&mut self, it: &Expression<'a>) {
        let kind = match it {
            Expression::CallExpression(call) => Kind::Call {
                callee: call.callee.span(),
                callee_is_identifier: matches!(call.callee, Expression::Identifier(_)),
                argument_starts: call.arguments.iter().map(|a| a.span().start).collect(),
                first_argument_arrow_params_end: call.arguments.first().and_then(|a| match a {
                    Argument::ArrowFunctionExpression(arrow) => Some(arrow.params.span.end),
                    _ => None,
                }),
            },
            Expression::NewExpression(new) => Kind::New {
                argument_starts: new.arguments.iter().map(|a| a.span().start).collect(),
            },
            Expression::ArrowFunctionExpression(arrow) => Kind::Arrow {
                is_async: arrow.r#async,
                params_end: arrow.params.span.end,
            },
            _ => Kind::Other,
        };
        self.push(it.span(), kind);
        walk::walk_expression(self, it);
        self.pop();
    }

    fn visit_statement(&mut self, it: &Statement<'a>) {
        let kind = if matches!(it, Statement::BlockStatement(_)) {
            Kind::Block
        } else {
            Kind::Other
        };
        self.push(it.span(), kind);
        walk::walk_statement(self, it);
        self.pop();
    }

    fn visit_function_body(&mut self, it: &oxc_ast::ast::FunctionBody<'a>) {
        self.push(it.span, Kind::Block);
        walk::walk_function_body(self, it);
        self.pop();
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        self.push(it.span, Kind::Declarator { name: it.id.span() });
        walk::walk_variable_declarator(self, it);
        self.pop();
    }
}

/// `ts.InlayHintKind`. tsgo sends the LSP numbering, where 1 is Type and 2 is
/// Parameter (`InlayHintKind` in the LSP spec).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HintKind {
    Type,
    Parameter,
    Other,
}

impl HintKind {
    #[must_use]
    pub const fn from_lsp(value: Option<i64>) -> Self {
        match value {
            Some(1) => Self::Type,
            Some(2) => Self::Parameter,
            _ => Self::Other,
        }
    }
}

impl ShadowNodes {
    /// `isSvelte2tsxFunctionHints` (`InlayHintProvider.ts:195-228`), less its
    /// first arm: that one reads `displayParts[].file` off the TypeScript API's
    /// `ts.InlayHint`, which the LSP shape tsgo sends does not carry, so a hint
    /// whose label part points into a svelte2tsx shim is not recognised here.
    #[must_use]
    pub fn is_svelte2tsx_function_hints(&self, text: &str, kind: HintKind, offset: u32) -> bool {
        if kind != HintKind::Parameter {
            return false;
        }
        let Some(index) = self.find_containing(offset, None, |kind| match kind {
            Kind::Call {
                argument_starts, ..
            }
            | Kind::New { argument_starts } => argument_starts.contains(&offset),
            _ => false,
        }) else {
            return false;
        };
        let Kind::Call { callee, .. } = &self.entries[index].kind else {
            // A `new` expression reaches upstream's callee test too, but its
            // callee span is not recorded, so treat it as not generated.
            return false;
        };
        let Some(callee_text) = text.get(callee.start as usize..callee.end as usize) else {
            return false;
        };
        callee_text.contains(".$on")
            || callee_text.contains(".createElement")
            || callee_text.contains("__sveltets_")
            || callee_text.starts_with("$$_")
    }

    /// `isGeneratedVariableTypeHint` (`:230-257`).
    ///
    /// Upstream tests `isInGeneratedCode(text, declaration.pos)`, where TS's
    /// `pos` is the end of the PREVIOUS token and so includes the declarator's
    /// leading trivia; oxc's `Span::start` is the `getStart()` equivalent. The
    /// two disagree only when an ignore marker sits between the `const`/`,` and
    /// the binding name, which svelte2tsx does not emit — it wraps whole
    /// statements — so the declarator's own start is used.
    #[must_use]
    pub fn is_generated_variable_type_hint(
        &self,
        text: &str,
        kind: HintKind,
        offset: u32,
        in_generated_code: impl Fn(&str, usize, usize) -> bool,
    ) -> bool {
        if kind != HintKind::Type {
            return false;
        }
        if starts_with_ignored_position(text, offset as usize) {
            return true;
        }
        let Some(index) =
            self.find_closest_containing(offset, |kind| matches!(kind, Kind::Declarator { .. }))
        else {
            return false;
        };
        let Kind::Declarator { name } = &self.entries[index].kind else {
            return false;
        };
        let start = self.entries[index].span.start as usize;
        in_generated_code(text, start, start)
            || text
                .get(name.start as usize..name.end as usize)
                .is_some_and(|name| name.starts_with("$$"))
    }

    /// `isGeneratedAsyncFunctionReturnType` (`:259-280`): an `async` arrow whose
    /// GRANDPARENT is a block, at its own close-paren offset.
    #[must_use]
    pub fn is_generated_async_function_return_type(&self, kind: HintKind, offset: u32) -> bool {
        if kind != HintKind::Type {
            return false;
        }
        let Some(index) =
            self.find_containing(offset, None, |kind| matches!(kind, Kind::Arrow { .. }))
        else {
            return false;
        };
        let Kind::Arrow {
            is_async,
            params_end,
        } = &self.entries[index].kind
        else {
            return false;
        };
        if !*is_async || *params_end != offset {
            return false;
        }
        self.grandparent_is_block(index)
    }

    /// `isGeneratedFunctionReturnType` (`:282-306`): the `__sveltets_2_invalidate`
    /// wrapper a legacy `$: a = …` lowers to.
    #[must_use]
    pub fn is_generated_function_return_type(
        &self,
        text: &str,
        kind: HintKind,
        offset: u32,
    ) -> bool {
        if kind != HintKind::Type {
            return false;
        }
        let Some(index) = self.find_containing(offset, None, |kind| {
            matches!(
                kind,
                Kind::Call {
                    callee_is_identifier: true,
                    ..
                }
            )
        }) else {
            return false;
        };
        let Kind::Call {
            callee,
            first_argument_arrow_params_end,
            ..
        } = &self.entries[index].kind
        else {
            return false;
        };
        text.get(callee.start as usize..callee.end as usize) == Some("__sveltets_2_invalidate")
            && *first_argument_arrow_params_end == Some(offset)
    }

    fn grandparent_is_block(&self, index: usize) -> bool {
        self.entries[index]
            .parent
            .and_then(|parent| self.entries[parent].parent)
            .is_some_and(|grandparent| matches!(self.entries[grandparent].kind, Kind::Block))
    }
}

/// `startsWithIgnoredPosition` (`features/utils.ts:111-113`).
#[must_use]
pub fn starts_with_ignored_position(text: &str, offset: usize) -> bool {
    text[offset.min(text.len())..].starts_with(crate::tsgo_overlay::IGNORE_POSITION)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse_nodes(src: &str) -> ShadowNodes {
        ShadowNodes::parse(src).expect("shadow parses")
    }

    /// Sources in which two sibling nodes of a matched kind come as close as
    /// JavaScript's grammar allows. Used to measure whether the faithful
    /// traversal and the "greatest start" shortcut can disagree at all.
    const ADJACENCY_CORPUS: &[&str] = &[
        "[f(1),g(2)];",
        "const a=1,b=2;",
        "f(1);g(2);",
        "(f(1),g(2));",
        "f(1)+g(2);",
        "x=[f(1)][g(2)];",
        "f(a=>a)(b=>b);",
        "const a=()=>1,b=()=>2;",
        "o={a:f(1),b:g(2)};",
        "f(g(1),h(2));",
        "`${f(1)}${g(2)}`;",
        "if(f(1))g(2);",
        "for(f(1);g(2););",
        "new C(1),new D(2);",
        "const {a}=f(1),[b]=g(2);",
        "outer(inner(1));",
        "a(b(c(1)));",
        "async()=>{const q=async()=>1;};",
    ];

    /// The reduction this port nearly shipped — "the containing match with the
    /// greatest start" — which is what `findClosestContainingNode` looks like if
    /// you read it as picking the innermost containing node rather than
    /// re-entering the match it just found.
    fn greatest_start(
        nodes: &ShadowNodes,
        offset: u32,
        matches: impl Fn(&Kind) -> bool,
    ) -> Option<usize> {
        (0..nodes.entries.len())
            .filter(|&index| nodes.contains(index, offset) && matches(&nodes.entries[index].kind))
            .max_by_key(|&index| nodes.entries[index].span.start)
    }

    /// The invariant the faithful traversal has and the shortcut does not:
    /// `findClosestContainingNode` only ever searches INSIDE the node
    /// `findContainingNode` returned, so its answer is that node or a descendant
    /// of it. "Greatest start" can leave that subtree whenever two containing
    /// matches are siblings — which for a zero-length offset needs their spans to
    /// touch.
    #[test]
    fn the_closest_containing_node_is_always_inside_the_outermost_one() {
        let mut checked = 0_usize;
        for src in ADJACENCY_CORPUS {
            let nodes = parse_nodes(src);
            for offset in 0..=u32::try_from(src.len()).expect("fits") {
                let is_call = |kind: &Kind| matches!(kind, Kind::Call { .. });
                let Some(outermost) = nodes.find_containing(offset, None, is_call) else {
                    continue;
                };
                let closest = nodes
                    .find_closest_containing(offset, is_call)
                    .expect("the outermost matched");
                assert!(
                    closest == outermost || nodes.is_descendant_of(closest, outermost),
                    "{src} @{offset}: closest escaped the outermost match's subtree"
                );
                checked += 1;
            }
        }
        println!("the invariant held at {checked} matched offsets");
        assert!(
            checked > 100,
            "the corpus reached only {checked} matched offsets"
        );
    }

    /// MEASUREMENT, not an assertion of equivalence: over the corpus above, the
    /// faithful traversal and the shortcut are asked the same question at every
    /// offset. A separator token sits between any two sibling expressions in
    /// JavaScript, so their spans do not touch and the two agree everywhere here.
    /// The port keeps the faithful form because upstream's algorithm is the
    /// specification — not because a divergence was demonstrated.
    #[test]
    fn the_shortcut_and_the_faithful_traversal_are_measured_against_each_other() {
        let (mut compared, mut disagreements) = (0_usize, Vec::new());
        for src in ADJACENCY_CORPUS {
            let nodes = parse_nodes(src);
            for offset in 0..=u32::try_from(src.len()).expect("fits") {
                for (name, matches) in [
                    (
                        "call",
                        &(|kind: &Kind| matches!(kind, Kind::Call { .. }))
                            as &dyn Fn(&Kind) -> bool,
                    ),
                    ("declarator", &|kind: &Kind| {
                        matches!(kind, Kind::Declarator { .. })
                    }),
                    ("arrow", &|kind: &Kind| matches!(kind, Kind::Arrow { .. })),
                ] {
                    let faithful = nodes.find_closest_containing(offset, matches);
                    let shortcut = greatest_start(&nodes, offset, matches);
                    compared += 1;
                    if faithful != shortcut {
                        disagreements.push(format!("{src} @{offset} [{name}]"));
                    }
                }
            }
        }
        println!(
            "compared {compared} (offset, predicate) pairs; {} disagreement(s)",
            disagreements.len()
        );
        for row in disagreements.iter().take(10) {
            println!("  {row}");
        }
        assert!(compared > 600, "only {compared} pairs compared");
    }

    #[test]
    fn find_closest_containing_descends_through_nested_matches() {
        let src = "outer(inner(1));";
        let at = u32::try_from(src.find('1').expect("literal")).expect("fits");
        let nodes = parse_nodes(src);
        let span_of = |index: usize| {
            let span = nodes.entries[index].span;
            &src[span.start as usize..span.end as usize]
        };
        let outermost = nodes
            .find_containing(at, None, |kind| matches!(kind, Kind::Call { .. }))
            .expect("outer");
        let closest = nodes
            .find_closest_containing(at, |kind| matches!(kind, Kind::Call { .. }))
            .expect("inner");
        assert_eq!(span_of(outermost), "outer(inner(1))");
        assert_eq!(span_of(closest), "inner(1)");
    }

    /// The grandparent test is what separates a generated `async () => {}`
    /// statement inside a function body from one at the top level: upstream's
    /// `SourceFile` is not a `ts.isBlock`, so a top-level arrow does not qualify.
    #[test]
    fn the_async_arrow_filter_reads_the_grandparent_and_a_program_is_not_a_block() {
        let cells: &[(&str, bool)] = &[
            ("function f() { async () => { 1; }; }", true),
            ("async () => { 1; };", false),
            ("function f() { () => { 1; }; }", false),
            ("function f() { const a = async () => { 1; }; }", false),
        ];
        let mut rows = Vec::new();
        for (src, expected) in cells {
            let nodes = parse_nodes(src);
            let at = u32::try_from(src.find("=>").expect("arrow") - 1).expect("fits");
            let got = nodes.is_generated_async_function_return_type(HintKind::Type, at);
            rows.push(format!("{src:<40} expected {expected:<5} got {got}"));
            assert_eq!(got, *expected, "{src}");
        }
        for row in &rows {
            println!("{row}");
        }
    }

    #[test]
    fn the_invalidate_filter_needs_the_callee_name_and_the_arrow_close_paren() {
        let src = "__sveltets_2_invalidate(() => a);";
        let nodes = parse_nodes(src);
        let close = u32::try_from(src.find("=>").expect("arrow") - 1).expect("fits");
        assert!(nodes.is_generated_function_return_type(src, HintKind::Type, close));
        assert!(
            !nodes.is_generated_function_return_type(src, HintKind::Parameter, close),
            "a parameter-kind hint is not this filter's business"
        );

        let other = "other_call(() => a);";
        let nodes = parse_nodes(other);
        let close = u32::try_from(other.find("=>").expect("arrow") - 1).expect("fits");
        assert!(
            !nodes.is_generated_function_return_type(other, HintKind::Type, close),
            "the callee name is the whole test"
        );
    }

    #[test]
    fn the_variable_type_filter_reads_the_binding_name_and_the_ignore_markers() {
        let never = |_: &str, _: usize, _: usize| false;
        let always = |_: &str, _: usize, _: usize| true;

        let src = "const $$_pmoC = 1;";
        let at = u32::try_from(src.find("$$_").expect("name")).expect("fits");
        assert!(
            parse_nodes(src).is_generated_variable_type_hint(src, HintKind::Type, at, never),
            "a `$$`-prefixed binding is generated even where no marker is in play"
        );

        let plain = "const value = 1;";
        let at = u32::try_from(plain.find("value").expect("name")).expect("fits");
        assert!(
            !parse_nodes(plain).is_generated_variable_type_hint(plain, HintKind::Type, at, never),
            "a user binding outside any ignore region is not"
        );
        assert!(
            parse_nodes(plain).is_generated_variable_type_hint(plain, HintKind::Type, at, always),
            "and the same binding inside one is"
        );

        // The `startsWithIgnoredPosition` arm answers before any tree lookup.
        let marked = format!("{}const value = 1;", crate::tsgo_overlay::IGNORE_POSITION);
        let at = u32::try_from(
            marked
                .find(crate::tsgo_overlay::IGNORE_POSITION)
                .expect("marker"),
        )
        .expect("fits");
        assert!(
            parse_nodes(&marked).is_generated_variable_type_hint(
                &marked,
                HintKind::Type,
                at,
                never
            ),
            "a hint at an ignore-position marker is dropped without consulting the tree"
        );
    }

    #[test]
    fn the_function_hints_filter_matches_on_the_callee_text_at_an_argument_start() {
        let cells: &[(&str, bool)] = &[
            ("__sveltets_2_ensureComponent(x);", true),
            ("$$_tnenopmoC(x);", true),
            ("svelteHTML.createElement(x);", true),
            ("component.$on(x);", true),
            ("ordinary(x);", false),
        ];
        for (src, expected) in cells {
            let at = u32::try_from(src.rfind('x').expect("argument")).expect("fits");
            let got = parse_nodes(src).is_svelte2tsx_function_hints(src, HintKind::Parameter, at);
            assert_eq!(got, *expected, "{src}");
            assert!(
                !parse_nodes(src).is_svelte2tsx_function_hints(src, HintKind::Type, at),
                "a type-kind hint is not this filter's business: {src}"
            );
        }
    }

    #[test]
    fn a_shadow_that_does_not_parse_yields_no_tree_rather_than_an_empty_one() {
        assert!(
            ShadowNodes::parse("function (").is_none(),
            "upstream's SourceFile is best-effort where oxc is not, so a filter with no tree must not run"
        );
    }
}
