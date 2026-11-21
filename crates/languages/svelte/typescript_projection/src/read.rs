//! The component as svelte-check reads it: svelte2tsx parses each script with TypeScript, and
//! the checker reads its output as TypeScript for a TypeScript component, else as JavaScript
//! with JSX, so a script that only the compiler rejects still projects.

use std::borrow::Borrow;

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::{Resolved, compiler_syntax_tree, resolve_component};
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_svelte_syntax::{Parsed, ParsedAsChecked};

/// The parse of a component that svelte2tsx's read matches.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Parse {
    /// [`Parsed`]: the compiler reads every script.
    Compiler,
    /// [`ParsedAsChecked`]: the checker's language reads every script, the compiler does not.
    Checked,
}

/// A component as svelte-check reads it.
#[derive(Clone, Copy, Debug)]
pub struct Read<'a> {
    pub component: &'a Component,
    parse: Parse,
}

/// The component as svelte-check reads it.
///
/// # Errors
///
/// [`Parsed`]'s error, when the checker's language does not read every script either.
pub fn read<'a>(context: &'a DocumentContext<'_>) -> Result<Read<'a>, &'a Diagnostic> {
    let checked = || context.get::<ParsedAsChecked>().as_ref();
    let (component, parse) = first_read(
        context.get::<Parsed>().as_ref().map_err(|error| &**error),
        checked,
    )?;
    Ok(Read { component, parse })
}

/// [`read`] outside the artifact database.
///
/// # Errors
///
/// As [`read`].
pub fn read_alone(source_text: &str) -> Result<Component, Diagnostic> {
    let checked = || rsvelte_svelte_syntax::parse::parse_as_checked(source_text);
    first_read(
        rsvelte_svelte_syntax::parse::parse(source_text).map_err(Diagnostic::from),
        checked,
    )
    .map(|(component, _)| component)
}

/// The compiler's parse, else the checker's when it reads every script, else the compiler's
/// error.
fn first_read<C: Borrow<Component>, E>(
    compiler: Result<C, E>,
    checked: impl FnOnce() -> Result<C, E>,
) -> Result<(C, Parse), E> {
    match compiler {
        Ok(component) => Ok((component, Parse::Compiler)),
        Err(error) => match checked() {
            Ok(component) if component.borrow().script_typescript_errors.is_empty() => {
                Ok((component, Parse::Checked))
            }
            _ => Err(error),
        },
    }
}

impl<'a> Read<'a> {
    /// The names of [`Self::component`] resolved.
    #[must_use]
    pub fn resolution(&self, context: &'a DocumentContext<'_>) -> Option<&'a Resolution> {
        match self.parse {
            Parse::Compiler => context.get::<Resolved>().as_ref(),
            Parse::Checked => context.get::<ResolvedAsChecked>().as_ref(),
        }
    }
}

/// [`Resolved`] of [`ParsedAsChecked`].
#[derive(Debug)]
pub(crate) struct ResolvedAsChecked;

impl Artifact for ResolvedAsChecked {
    /// `None` when the checker's language does not read the component.
    type Output = Option<Resolution>;

    const NAME: &'static str = "svelte.typescript_projection.resolve_as_checked";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context.get::<ParsedAsChecked>().as_ref().ok()?;
        let lowered = compiler_syntax_tree::lower(component, context.source_text());
        Some(resolve_component(component, &lowered))
    }
}
