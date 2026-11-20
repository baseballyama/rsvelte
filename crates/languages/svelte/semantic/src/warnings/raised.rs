//! When the compiler raises each error, and so which one it stops at.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_syntax::syntax_tree::{Component, Script};

use super::{CompileWarnings, error};

/// When the compiler raises an error: it creates every scope before it walks any tree, and it
/// handles the module script, then the instance script, then the template.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Raised {
    pub phase: Phase,
    pub section: Section,
    /// Where the compiler's walk is when it raises the error.
    pub at: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Phase {
    Parse,
    Scopes,
    Walk,
    /// The checks of the whole component after the walks.
    Component,
    /// The compiler analyzes the style sheet after it walks every tree.
    Stylesheet,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Section {
    Module,
    Instance,
    Template,
}

impl Section {
    /// The part of `component` that holds `offset`.
    #[must_use]
    pub fn of(component: &Component, offset: u32) -> Self {
        let holds = |script: &Option<Script>| {
            script
                .as_ref()
                .is_some_and(|s| s.span.start_offset <= offset && offset < s.span.end_offset)
        };
        if holds(&component.module) {
            Self::Module
        } else if holds(&component.instance) {
            Self::Instance
        } else {
            Self::Template
        }
    }
}

impl CompileWarnings {
    /// The error the compiler stops at; an `await` is one only without `experimental.async`.
    #[must_use]
    pub fn first_error(
        &self,
        component: &Component,
        experimental_async: bool,
    ) -> Option<Diagnostic> {
        self.first_error_with(component, experimental_async, &[])
    }

    /// [`Self::first_error`] among these and the `others` that the compiler raises besides.
    #[must_use]
    pub fn first_error_with(
        &self,
        component: &Component,
        experimental_async: bool,
        others: &[(Raised, Diagnostic)],
    ) -> Option<Diagnostic> {
        let awaits = self
            .awaits
            .iter()
            .filter(|_| !experimental_async)
            .map(|&span| {
                let raised = Raised {
                    phase: Phase::Walk,
                    section: Section::of(component, span.start_offset),
                    at: span.start_offset,
                };
                (raised, Err(span))
            });
        let (_, first) = self
            .errors
            .iter()
            .chain(others)
            .map(|(raised, error)| (*raised, Ok(error)))
            .chain(awaits)
            .min_by_key(|(raised, _)| *raised)?;
        Some(first.map_or_else(
            |span| {
                error(
                    "experimental_async",
                    "Cannot use `await` in deriveds and template expressions, or at the top level \
                        of a component, unless the `experimental.async` compiler option is `true`",
                    span,
                )
            },
            Clone::clone,
        ))
    }
}
