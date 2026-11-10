//! The JavaScript and TypeScript in a component, formatted by `oxc_formatter` from its source text,
//! as the plugin has Prettier format each part from its text.

use oxc_allocator::ArenaVec;
use oxc_formatter::{
    ExpressionLayout, ExpressionRoot, JsEmbeddedIn, JsFormatOptions, JsRoot, ProgramLayout,
    ProgramSemicolons, QuoteStyle,
};
use oxc_formatter_core::{
    CoreFormatOptions, FormatContext, FormatElement, FormatElements, FormatSession, FormatState,
    Formatter, normalize_newlines,
};
use oxc_span::SourceType;
use rsvelte_document_printer::LayoutInstructionIdentifier;
use rsvelte_kernel::source::positions::Span;

use super::{Printer, R, Unsupported};

/// What every embedded part shares: the session that owns their arena and group identifiers, and
/// the layouts built so far, which the document refers to by index.
pub(super) struct Embedder<'x> {
    pub(super) session: FormatSession<'x>,
    pub(super) layouts: Vec<&'x [FormatElement<'x>]>,
    /// The plugin parses with TypeScript when any `<script>` says `lang="ts"`.
    pub(super) typescript: bool,
    pub(super) core: CoreFormatOptions,
    pub(super) options: JsFormatOptions,
}

/// oxc's context for the parts this crate writes itself: only the options.
pub(super) struct Context {
    pub(super) options: CoreFormatOptions,
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

/// The plugin's adjustments to a part: `forceSingleQuote` inside a quoted attribute,
/// `forceSingleLine` in a block's head, and `removeParentheses` around a `bind:` sequence.
#[derive(Clone, Copy, Default)]
pub(super) struct Adjust {
    pub(super) single_quote: bool,
    pub(super) single_line: bool,
    pub(super) remove_parentheses: bool,
}

/// How a part is parsed and printed.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Part {
    /// A template expression, which the plugin parses as `(…\n)`.
    Expression,
    /// A `<script>`'s statements.
    Script,
    /// A statement in the template (`{let a = 1}`).
    Statement,
}

impl<'x> Printer<'_, '_, 'x> {
    /// The source in `span` formatted as `part`, as the plugin's `embed` adjusts it.
    pub(super) fn embed(
        &mut self,
        span: Span,
        part: Part,
        adjust: Adjust,
    ) -> R<LayoutInstructionIdentifier> {
        let text = normalize_newlines(span.text(self.source_text), ['\r']);
        let ir = self.format_javascript(&text, span, part, adjust.single_quote)?;
        // oxc's `remove_soft_lines` is Prettier's `removeLines`.
        let mut ir = if adjust.single_line {
            let context = Context {
                options: self.embedder.core,
            };
            let mut state = FormatState::new_with_session(context, self.embedder.session.clone());
            let mut f = Formatter::new(&mut state);
            f.remove_soft_lines(|f| f.write_elements(ir));
            f.into_vec()
        } else {
            ir
        };
        if adjust.remove_parentheses {
            remove_parentheses(&mut ir);
        }
        Ok(self.keep(ir))
    }

    /// Writes `ir` into the document.
    pub(super) fn keep(
        &mut self,
        ir: ArenaVec<'x, FormatElement<'x>>,
    ) -> LayoutInstructionIdentifier {
        let breaks = ir.iter().any(FormatElements::will_break);
        let index = self.embedder.layouts.len() as u32;
        self.embedder.layouts.push(ir.into_arena_slice());
        self.d().embedded(index, breaks)
    }

    /// `text`, the code at `span`, formatted as `part`.
    pub(super) fn format_javascript(
        &self,
        text: &str,
        span: Span,
        part: Part,
        single_quote: bool,
    ) -> R<ArenaVec<'x, FormatElement<'x>>> {
        let embedder = &self.embedder;
        let source_type = if part == Part::Script || embedder.typescript {
            // A script without `lang="ts"` goes to Prettier's `babel-ts`.
            SourceType::ts()
        } else {
            // Prettier's `babel` reads JSX.
            SourceType::mjs().with_jsx(true)
        };
        let mut options = embedder.options.clone();
        if single_quote {
            options.quote_style = QuoteStyle::Single;
        }
        let root = match part {
            Part::Expression => JsRoot::Expression(ExpressionRoot {
                layout: ExpressionLayout::Bare,
                tailwind_classes: false,
                ends_at_double_brace: false,
                reads_as_statements: false,
                in_parens: false,
                without_parent: true,
            }),
            Part::Script | Part::Statement => JsRoot::Program {
                semicolons: ProgramSemicolons::AsOptions,
                layout: ProgramLayout::Bare,
            },
        };
        #[expect(
            clippy::map_err_ignore,
            reason = "oxc's diagnostic points into the text it wraps, not the component"
        )]
        let ir = oxc_formatter::format_to_ir(
            &embedder.session,
            text,
            source_type,
            options,
            root,
            JsEmbeddedIn::default(),
        )
        .map_err(|_| Unsupported::at("code that oxc's formatter does not format", span))?;
        Ok(ir.ir)
    }
}

impl Printer<'_, '_, '_> {
    /// A snippet's `name(…)`, which the plugin formats as `function name(…) {}` and then takes
    /// the `function ` and the body off.
    pub(super) fn snippet_signature(&mut self, head: Span) -> R<LayoutInstructionIdentifier> {
        let text = normalize_newlines(head.text(self.source_text), ['\r']);
        let text = format!("function {text} {{}}");
        let mut ir = self.format_javascript(&text, head, Part::Statement, false)?;
        if !strip_function(&mut ir) {
            return Err(Unsupported::at(
                "a snippet head that oxc prints another way",
                head,
            ));
        }
        Ok(self.keep(ir))
    }
}

/// Takes `function ` off the start of a function declaration's layout and ` {}` off its end.
fn strip_function(ir: &mut ArenaVec<'_, FormatElement<'_>>) -> bool {
    let token = |e: &FormatElement<'_>, s: &str| matches!(e, FormatElement::Token { text } if text.as_str() == s);
    let Some(end) = ir
        .iter()
        .rposition(|e| !matches!(e, FormatElement::Tag(t) if t.is_end()))
    else {
        return false;
    };
    if !(end >= 1 && token(&ir[end], "}") && token(&ir[end - 1], "{")) {
        return false;
    }
    // oxc writes a space for the return type it does not have and one before the body.
    let body = ir[..end - 1]
        .iter()
        .rposition(|e| !matches!(e, FormatElement::Space))
        .map_or(0, |i| i + 1);
    let Some(start) = ir
        .iter()
        .position(|e| !matches!(e, FormatElement::Tag(t) if t.is_start()))
    else {
        return false;
    };
    if !(token(&ir[start], "function") && matches!(ir.get(start + 1), Some(FormatElement::Space))) {
        return false;
    }
    ir.drain(body..=end);
    ir.drain(start..start + 2);
    true
}

/// The plugin's `removeParentheses` on a sequence oxc prints in parentheses (`(a, b)`).
fn remove_parentheses(ir: &mut ArenaVec<'_, FormatElement<'_>>) {
    let token = |e: &FormatElement<'_>, s: &str| matches!(e, FormatElement::Token { text } if text.as_str() == s);
    let start = ir
        .iter()
        .position(|e| !matches!(e, FormatElement::Tag(t) if t.is_start()));
    let end = ir
        .iter()
        .rposition(|e| !matches!(e, FormatElement::Tag(t) if t.is_end()));
    if let (Some(start), Some(end)) = (start, end)
        && start < end
        && token(&ir[start], "(")
        && token(&ir[end], ")")
    {
        ir.remove(end);
        ir.remove(start);
    }
}

/// The plugin's `trimRight([docs], (d) => d === ';')` on a statement: drops the `;` it ends with.
pub(super) fn trim_semicolon(ir: &mut ArenaVec<'_, FormatElement<'_>>) {
    let last = ir
        .iter()
        .rposition(|e| !matches!(e, FormatElement::Tag(t) if t.is_end()));
    if let Some(i) = last
        && matches!(&ir[i], FormatElement::Token { text } if text.as_str() == ";")
    {
        ir.remove(i);
    }
}
