//! The component as svelte-check reads it: svelte2tsx parses each script with TypeScript's
//! error-tolerant parser, and the checker reads its output as TypeScript for a TypeScript
//! component, else as JavaScript with JSX, so every script projects and only the markup can fail.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::{Resolved, resolve_alone};
use rsvelte_svelte_syntax::syntax_tree::{Component, Script};
use rsvelte_svelte_syntax::{Parsed, ParsedAsChecked};

/// The parse of a component that svelte2tsx's read matches.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Parse {
    /// [`Parsed`]: the compiler reads every script.
    Compiler,
    /// [`ParsedAsChecked`]: the compiler rejects a script.
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
/// The markup's syntax error, which svelte2tsx throws.
pub fn read<'a>(context: &'a DocumentContext<'_>) -> Result<Read<'a>, &'a Diagnostic> {
    let checked = || context.get::<ParsedAsChecked>().as_ref();
    let (component, parse) = first_read(context.get::<Parsed>().as_ref(), checked)?;
    Ok(Read { component, parse })
}

/// [`read`] outside the artifact database.
///
/// # Errors
///
/// As [`read`].
pub fn read_alone(source_text: &str) -> Result<Component, Diagnostic> {
    let checked = || rsvelte_svelte_syntax::parse::parse_as_checked(source_text);
    first_read(rsvelte_svelte_syntax::parse::parse(source_text), checked)
        .map(|(component, _)| component)
}

/// The compiler's parse, else the checker's.
fn first_read<C, E>(
    compiler: Result<C, E>,
    checked: impl FnOnce() -> Result<C, E>,
) -> Result<(C, Parse), E> {
    compiler
        .map(|component| (component, Parse::Compiler))
        .or_else(|_| checked().map(|component| (component, Parse::Checked)))
}

/// The `<` of `script`'s end tag when TypeScript reads past the script into the code svelte2tsx
/// adds after it, which svelte2tsx maps to the tag: past a hole, where no statement ends.
#[must_use]
pub fn cut_short_at(script: &Script) -> Option<Span> {
    let end = script.content.end_offset;
    (!script.holes.is_empty()).then_some(Span::new(end, end + 1))
}

impl<'a> Read<'a> {
    /// Whether a script has a syntax error, after which TypeScript can report into svelte2tsx's
    /// own code, whose findings svelte-check drops as they have no source.
    #[must_use]
    pub const fn has_script_errors(&self) -> bool {
        !self.component.script_typescript_errors.is_empty()
    }

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
    /// `None` when the markup does not parse.
    type Output = Option<Resolution>;

    const NAME: &'static str = "svelte.typescript_projection.resolve_as_checked";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context.get::<ParsedAsChecked>().as_ref().ok()?;
        Some(resolve_alone(component, context.source_text()))
    }
}
