//! A document with layouts oxc's formatters built for the languages embedded in it, printed by
//! oxc's printer.

use oxc_allocator::{Allocator, ArenaVec};
use oxc_formatter_core::{
    CoreFormatOptions, Document, FormatContext, FormatElement, FormatSession, FormatState,
    Formatter, InputKind, LineEnding, LineMode, PrintError, PrintWidth, PrinterOptions,
    SessionServices, TailwindSorter,
};
use rsvelte_kernel::diagnostics::Unsupported;

use crate::{LayoutInstructionIdentifier, LayoutInstructions};

#[cfg(test)]
mod tests;

/// What every embedded layout shares: the session that owns their arena and group identifiers,
/// and the layouts kept so far, which the document refers to by index.
pub struct Embedding<'x> {
    session: FormatSession<'x>,
    layouts: Vec<&'x [FormatElement<'x>]>,
    options: CoreFormatOptions,
}

impl std::fmt::Debug for Embedding<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Embedding")
            .field("layouts", &self.layouts.len())
            .finish_non_exhaustive()
    }
}

/// oxc's context for the elements a document writes itself: only the options.
struct Context {
    options: CoreFormatOptions,
}

impl FormatContext for Context {
    type Options = CoreFormatOptions;

    fn options(&self) -> &CoreFormatOptions {
        &self.options
    }

    fn source_code(&self) -> &'static str {
        ""
    }
}

impl<'x> Embedding<'x> {
    #[must_use]
    pub fn new(allocator: &'x Allocator, options: CoreFormatOptions) -> Self {
        Self::with_tailwind_sorter(allocator, options, None)
    }

    /// An embedding whose layouts' Tailwind CSS classes `sorter` sorts when the document prints.
    #[must_use]
    pub fn with_tailwind_sorter(
        allocator: &'x Allocator,
        options: CoreFormatOptions,
        sorter: Option<TailwindSorter>,
    ) -> Self {
        let services = SessionServices {
            tailwind_sorter: sorter,
            ..SessionServices::default()
        };
        Self {
            session: FormatSession::with_services(allocator, InputKind::PhysicalFile, services),
            layouts: Vec::new(),
            options,
        }
    }

    /// The session an embedded language's formatter builds its layout in.
    #[must_use]
    pub const fn session(&self) -> &FormatSession<'x> {
        &self.session
    }

    #[must_use]
    pub const fn options(&self) -> CoreFormatOptions {
        self.options
    }

    /// `layout` without its soft line breaks: Prettier's `removeLines`.
    #[must_use]
    pub fn remove_soft_lines(
        &self,
        layout: ArenaVec<'x, FormatElement<'x>>,
    ) -> ArenaVec<'x, FormatElement<'x>> {
        let context = Context {
            options: self.options,
        };
        let mut state = FormatState::new_with_session(context, self.session.clone());
        let mut f = Formatter::new(&mut state);
        f.remove_soft_lines(|f| f.write_elements(layout));
        f.into_vec()
    }

    /// Writes `layout` into `docs`, without the hard lines that end it, as Prettier strips an
    /// embedded part's trailing hard lines: the document puts its own line after the part.
    pub fn keep(
        &mut self,
        docs: &mut LayoutInstructions,
        mut layout: ArenaVec<'x, FormatElement<'x>>,
    ) -> LayoutInstructionIdentifier {
        strip_trailing_hard_lines(&mut layout);
        let index = self.layouts.len() as u32;
        self.layouts.push(layout.into_arena_slice());
        docs.embedded(index)
    }

    /// Prints the document `root` of `docs` with every `\n` as a line feed. `source_len` is the
    /// length of the text it formats, which sizes the output.
    ///
    /// # Errors
    ///
    /// [`Unsupported`] when oxc's printer rejects the document.
    pub fn print(
        self,
        docs: &LayoutInstructions,
        root: LayoutInstructionIdentifier,
        source_len: usize,
    ) -> Result<String, Unsupported> {
        let options = self.options;
        let context = Context { options };
        let classes = self.session.clone();
        let mut state = FormatState::new_with_session(context, self.session);
        let mut formatter = Formatter::new(&mut state);
        docs.lower(root, &self.layouts, &mut formatter);
        let elements = formatter.into_vec();
        let print = PrinterOptions::default()
            .with_print_width(PrintWidth::new(u32::from(options.line_width.value())))
            .with_indent_style(options.indent_style)
            .with_indent_width(options.indent_width)
            .with_line_ending(LineEnding::Lf);
        Ok(
            Document::new(elements, classes.take_sorted_tailwind_classes())
                .print(source_len, print)
                .map_err(|PrintError::InvalidDocument(_)| {
                    Unsupported::nowhere("a document oxc's printer rejects")
                })?
                .into_code(),
        )
    }
}

/// Removes the hard lines at the end of `layout`, also inside the tags that close it.
fn strip_trailing_hard_lines(layout: &mut ArenaVec<'_, FormatElement<'_>>) {
    let mut end = layout.len();
    while let Some(at) = end.checked_sub(1) {
        match &layout[at] {
            FormatElement::Tag(tag) if tag.is_end() => {}
            FormatElement::Line(
                LineMode::Hard
                | LineMode::HardWithoutExpand
                | LineMode::Empty
                | LineMode::ExactLineBreaks(_)
                | LineMode::Literal,
            ) => {
                layout.remove(at);
            }
            _ => return,
        }
        end = at;
    }
}
