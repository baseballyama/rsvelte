//! Store subscriptions: upstream's synthetic `store_sub` bindings, one per `$name` that reads the
//! store `name`.

use oxc_ast::ast::Ident;
use oxc_semantic::ReferenceId;

use super::validation::unbound;
use super::{CompileInput, Diagnostic, Resolution, Span};

/// The `$name`s no binding declares, each with its references, in upstream's order: the module
/// script's, the instance script's, then the template's, each in document order.
pub(super) struct Names<'r> {
    names: Vec<(&'r str, Vec<ReferenceId>)>,
}

impl<'r> Names<'r> {
    pub(super) fn new(input: &CompileInput<'_>, res: &'r Resolution) -> Self {
        let javascript = input.component.javascript;
        let program = |p| javascript.get_program(p).span;
        let module = input.component.module.map(program);
        let instance = input.component.instance.map(program);
        let order = |r: ReferenceId| {
            let start = res.reference_span(r).start;
            let inside =
                |s: Option<oxc_span::Span>| s.is_some_and(|s| s.start <= start && start < s.end);
            let section = if inside(module) {
                0
            } else if inside(instance) {
                1
            } else {
                2
            };
            (section, start)
        };
        let dollar = |name: &str| {
            name.starts_with('$') && !matches!(name, "$$props" | "$$restProps" | "$$slots")
        };
        let mut names: Vec<_> = unbound(res, dollar)
            .filter(|(_, references)| !references.is_empty())
            .map(|(name, mut references)| {
                references.sort_unstable_by_key(|&r| order(r));
                (name, references)
            })
            .collect();
        names.sort_unstable_by_key(|(_, references)| order(references[0]));
        Self { names }
    }

    /// The store subscriptions, in upstream's order.
    pub(super) fn subscriptions(&self, res: &Resolution) -> Vec<String> {
        (self.names.iter())
            .filter(|(name, _)| res.is_store_subscription(name))
            .map(|&(name, _)| name.to_owned())
            .collect()
    }

    /// Upstream's errors for a `$name` as it declares the subscriptions.
    ///
    /// # Errors
    ///
    /// `global_reference_invalid` for `$`, a `$$name` or an undeclared lowercase store;
    /// `store_invalid_scoped_subscription` for a store a nested scope declares; and
    /// `store_invalid_subscription` for a subscription in the module script.
    pub(super) fn check(
        &self,
        input: &CompileInput<'_>,
        res: &Resolution,
    ) -> Result<(), Diagnostic> {
        let scoping = res.scoping();
        let span = |r: ReferenceId| {
            let span = res.reference_span(r);
            Span::new(span.start, span.end)
        };
        let module =
            (input.component.module).map(|p| input.component.javascript.get_program(p).span);
        for (name, references) in &self.names {
            let name = *name;
            if name == "$" || name.starts_with("$$") {
                return global_reference_invalid(name, span(references[0]));
            }
            if !res.is_store_subscription(name) {
                continue;
            }
            let store = Ident::from(&name[1..]);
            let top = [scoping.root_scope_id(), res.instance_scope()];
            let scoped = references.iter().find(|&&r| {
                scoping
                    .find_binding(res.reference_scope(r), store)
                    .is_some_and(|s| !top.contains(&scoping.symbol_scope_id(s)))
            });
            if let Some(&r) = scoped {
                return super::special::invalid(
                    "store_invalid_scoped_subscription",
                    "Cannot subscribe to stores that are not declared at the top level of the component",
                    span(r),
                );
            }
            let declared = scoping.find_binding(res.instance_scope(), store).is_some();
            if !declared && name[1..].starts_with(|c: char| c.is_ascii_lowercase()) {
                return global_reference_invalid(name, span(references[0]));
            }
            let in_module = references.iter().find(|&&r| {
                let start = res.reference_span(r).start;
                module.is_some_and(|m| m.start < start && start < m.end)
            });
            if let Some(&r) = in_module {
                return super::special::invalid(
                    "store_invalid_subscription",
                    "Cannot reference store value inside `<script module>`",
                    span(r),
                );
            }
        }
        Ok(())
    }
}

fn global_reference_invalid(name: &str, span: Span) -> Result<(), Diagnostic> {
    super::special::invalid(
        "global_reference_invalid",
        &format!(
            "`{name}` is an illegal variable name. To reference a global variable called `{name}`, use `globalThis.{name}`"
        ),
        span,
    )
}
