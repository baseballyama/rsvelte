use oxc_ast::ast::{BindingPattern, IdentifierReference, Statement};
use oxc_ast_visit::Visit;
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::resolve::Resolution;
use rustc_hash::FxHashSet;

use crate::lower::builder::Runtime;
use crate::lower::client::snippets::Hooks;
use crate::lower::client::{ClientCompilationContext, R, Read, unsupported};
use crate::lower::paths::{Paths, bound_names};
use crate::lower::span_of;

/// The names a destructuring context binds, and whether a default value applies to each.
pub(super) fn names(pattern: &BindingPattern<'_>) -> Vec<(SymbolId, bool)> {
    let mut names = Vec::new();
    bound_names(pattern, false, &mut |binding, default| {
        names.push((binding.symbol_id.get().expect("a bound name"), default));
    });
    names
}

/// Whether a default value or a computed key reads a name the pattern binds there or later,
/// which upstream reads before it gives that name its thunk.
fn reads_later_name(res: &Resolution, pattern: &BindingPattern<'_>) -> bool {
    struct Reads<'r> {
        res: &'r Resolution,
        bound: FxHashSet<SymbolId>,
        from: u32,
        found: bool,
    }
    impl<'a> Visit<'a> for Reads<'_> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
            self.found |= self.res.symbol(it).is_some_and(|symbol| {
                self.bound.contains(&symbol)
                    && self.res.scoping().symbol_span(symbol).start >= self.from
            });
        }
    }
    fn walk(pattern: &BindingPattern<'_>, reads: &mut Reads<'_>) {
        match pattern {
            BindingPattern::BindingIdentifier(_) => {}
            BindingPattern::AssignmentPattern(assignment) => {
                reads.from = assignment.span.start;
                reads.visit_expression(&assignment.right);
                walk(&assignment.left, reads);
            }
            BindingPattern::ObjectPattern(object) => {
                for property in &object.properties {
                    if let Some(key) = property.key.as_expression() {
                        reads.from = property.span.start;
                        reads.visit_expression(key);
                    }
                    walk(&property.value, reads);
                }
                if let Some(rest) = &object.rest {
                    walk(&rest.argument, reads);
                }
            }
            BindingPattern::ArrayPattern(array) => {
                for element in array.elements.iter().flatten() {
                    walk(element, reads);
                }
                if let Some(rest) = &array.rest {
                    walk(&rest.argument, reads);
                }
            }
        }
    }
    let mut reads = Reads {
        res,
        bound: names(pattern)
            .into_iter()
            .map(|(symbol, _)| symbol)
            .collect(),
        from: 0,
        found: false,
    };
    walk(pattern, &mut reads);
    reads.found
}

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn check_destructured(&self, pattern: &BindingPattern<'_>) -> R<()> {
        if reads_later_name(self.res, pattern) {
            return unsupported(
                "a destructuring `{#each}` default that reads a name bound there or later",
                span_of(pattern),
            );
        }
        Ok(())
    }

    /// Upstream reads each name through a thunk, or a derived when a default applies, and keeps
    /// an array the pattern destructures in a derived.
    pub(super) fn destructure(
        &mut self,
        pattern: &'o BindingPattern<'o>,
        reactive: bool,
        declarations: &mut Vec<Statement<'o>>,
    ) {
        let b = self.b;
        for (symbol, default) in names(pattern) {
            self.reads
                .insert(symbol, if default { Read::Get } else { Read::Call });
        }
        let item = b.id("$$item");
        let item = if reactive {
            b.runtime("get", [item])
        } else {
            item
        };
        let mut paths = Vec::new();
        let mut walker = Paths {
            b,
            res: self.res,
            hooks: Hooks {
                cx: self,
                declarations,
            },
        };
        walker.extract(pattern, item, false, &mut paths);
        for path in paths {
            let mut value = b.thunk(path.value);
            if path.default {
                value = b.runtime("derived_safe_equal", [value]);
            }
            declarations.push(b.let_(&path.binding.name, Some(value)));
        }
    }
}
