//! A document with layouts oxc's formatters built for the languages embedded in it, printed by
//! oxc's printer.

use oxc_allocator::{Allocator, ArenaVec};
use oxc_formatter_core::{
    CoreFormatOptions, Document, FormatContext, FormatElement, FormatElements, FormatSession,
    FormatState, Formatter, InputKind, LineEnding, PrintError, PrintWidth, PrinterOptions,
};

use crate::{LayoutInstructionIdentifier, LayoutInstructions, Unlowered};

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

/// Why a document did not print.
#[derive(Debug, PartialEq, Eq)]
pub enum Unprinted {
    /// It holds a layout only this crate's printer prints: a flat-only one.
    FlatOnly,
    /// oxc's printer rejected the elements.
    Rejected,
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
        Self {
            session: FormatSession::new(allocator, InputKind::PhysicalFile),
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

    /// Writes `layout` into `docs`.
    pub fn keep(
        &mut self,
        docs: &mut LayoutInstructions,
        layout: ArenaVec<'x, FormatElement<'x>>,
    ) -> LayoutInstructionIdentifier {
        let breaks = layout.iter().any(FormatElements::will_break);
        let index = self.layouts.len() as u32;
        self.layouts.push(layout.into_arena_slice());
        docs.embedded(index, breaks)
    }

    /// Prints the document `root` of `docs` with every `\n` as a line feed. `source_len` is the
    /// length of the text it formats, which sizes the output.
    ///
    /// # Errors
    ///
    /// [`Unprinted`] when the document holds a flat-only layout or oxc's printer rejects it.
    pub fn print(
        self,
        docs: &LayoutInstructions,
        root: LayoutInstructionIdentifier,
        source_len: usize,
    ) -> Result<String, Unprinted> {
        let options = self.options;
        let context = Context { options };
        let mut state = FormatState::new_with_session(context, self.session);
        let mut formatter = Formatter::new(&mut state);
        docs.lower(root, &self.layouts, &mut formatter)
            .map_err(|Unlowered| Unprinted::FlatOnly)?;
        let elements = formatter.into_vec();
        let print = PrinterOptions::default()
            .with_print_width(PrintWidth::new(u32::from(options.line_width.value())))
            .with_indent_style(options.indent_style)
            .with_indent_width(options.indent_width)
            .with_line_ending(LineEnding::Lf);
        Ok(Document::new(elements, Vec::new())
            .print(source_len, print)
            .map_err(|PrintError::InvalidDocument(_)| Unprinted::Rejected)?
            .into_code())
    }
}
