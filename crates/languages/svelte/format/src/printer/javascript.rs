//! The JavaScript and TypeScript in a component, formatted by `oxc_formatter` from its source text,
//! as the plugin has Prettier format each part from its text.

use oxc_allocator::ArenaVec;
use oxc_ast::ast::Program;
use oxc_formatter::{
    ExpressionLayout, ExpressionRoot, JsEmbeddedIn, JsFormatOptions, JsRoot, ProgramLayout,
    ProgramSemicolons, QuoteStyle,
};
use oxc_formatter_core::{FormatElement, LineMode, Tag};
use oxc_span::SourceType;
use rsvelte_document_printer::{Embedding, LayoutInstructionIdentifier};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::ProgramIdentifier;

use super::{Component, Printer, R, SyntaxError, Unsupported};

/// The embedded parts and how this component's JavaScript formats.
pub(super) struct Embedder<'x> {
    pub(super) embedding: Embedding<'x>,
    /// The plugin parses with TypeScript when any `<script>` says `lang="ts"`.
    pub(super) typescript: bool,
    pub(super) options: JsFormatOptions,
    /// The source the output keeps the comments of: what oxc formatted from its text, and what
    /// is printed as it is.
    pub(super) kept: Vec<Span>,
    /// The comments the plugin leaves out of every part it prints, each with why. Deleting a
    /// comment loses the user's code, so each is refused.
    pub(super) dropped: Vec<(Span, &'static str)>,
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
        let text = span.text(self.source_text);
        let ir = self.format_javascript(text, span, part, adjust.single_quote)?;
        // Prettier's `removeLines` means flat; its expanded states that survive it are a quirk.
        let mut ir = if adjust.single_line {
            let mut ir = ir;
            break_after_line_comments(&mut ir);
            self.embedder.embedding.remove_soft_lines(ir)
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
        self.embedder.embedding.keep(self.docs, ir)
    }

    /// `text`, the code at `span`, formatted as `part`.
    pub(super) fn format_javascript(
        &mut self,
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
        }
        // Prettier reads a component's code as a module, so `await` is an operator.
        .with_module(true);
        let mut options = embedder.options.clone();
        // oxfmt formats only the scripts; the plugin formats the template's code with Prettier.
        if part != Part::Script {
            options.sort_imports = None;
            options.jsdoc = None;
        }
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
            embedder.embedding.session(),
            text,
            source_type,
            options,
            root,
            JsEmbeddedIn {
                keeps_recovered: Some(keeps_recovered),
                ..JsEmbeddedIn::default()
            },
        )
        .map_err(|_| Unsupported::at("code that oxc's formatter does not format", span))?;
        self.embedder.kept.push(span);
        Ok(ir.ir)
    }
}

impl<'x> Printer<'_, '_, 'x> {
    /// The statements of the `<script>` whose body is `span`, from the program the component's
    /// parse already holds.
    pub(super) fn format_script(
        &mut self,
        program: ProgramIdentifier,
        span: Span,
    ) -> R<ArenaVec<'x, FormatElement<'x>>> {
        let c = self.c;
        let program = c.javascript.get_program(program);
        // The errors oxc's parser recovered from, which the formatter would have read again.
        let whole = script_errors(c, span).all(|error| {
            recovered_whole(
                error.typescript_code,
                error.diagnostic.span.start_offset,
                program,
            )
        });
        let unformatted = || Unsupported::at("code that oxc's formatter does not format", span);
        if !whole {
            return Err(unformatted());
        }
        #[expect(
            clippy::map_err_ignore,
            reason = "oxc's diagnostic says what the refusal says"
        )]
        let ir = oxc_formatter::program_to_ir(
            self.embedder.embedding.session(),
            program,
            span.start_offset as usize..span.end_offset as usize,
            self.embedder.options.clone(),
            JsRoot::Program {
                semicolons: ProgramSemicolons::AsOptions,
                layout: ProgramLayout::Bare,
            },
            JsEmbeddedIn::default(),
        )
        .map_err(|_| unformatted())?;
        self.embedder.kept.push(span);
        Ok(ir.ir)
    }
}

impl Printer<'_, '_, '_> {
    /// A snippet's `name(…)`, which the plugin formats as `function name(…) {}` and then takes
    /// the `function ` and the body off.
    pub(super) fn snippet_signature(&mut self, head: Span) -> R<LayoutInstructionIdentifier> {
        let text = format!("function {} {{}}", head.text(self.source_text));
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

/// tsc's codes of the errors after which oxc's recovered program prints as Prettier prints the
/// code, measured on the samples in the tests: a recovered program can drop nodes or panic the
/// printer.
const RECOVERED_WHOLE: [u32; 20] = [
    1015, 1016, 1029, 1038, 1039, 1049, 1051, 1093, 1094, 1095, 1108, 1147, 1194, 1222, 1257, 1308,
    2368, 2681, 5085, 18010,
];

/// Whether oxc's `program` recovered from an error of tsc's `code` at `at` holds all of the code.
/// A function declared as a statement's body, which oxc reports without a code, stays in it.
fn recovered_whole(code: Option<u32>, at: u32, program: &Program<'_>) -> bool {
    code.map_or_else(
        || rsvelte_typescript_tree::function_as_body(program, at).is_some(),
        |code| RECOVERED_WHOLE.contains(&code),
    )
}

/// [`recovered_whole`] for oxc's `error`, which the formatter's parse reported.
fn keeps_recovered(error: &oxc_diagnostics::OxcDiagnostic, program: &Program<'_>) -> bool {
    match (error.code.scope.as_deref(), error.code.number.as_deref()) {
        (Some("TS"), number) => (number.and_then(|number| number.parse().ok()))
            .is_some_and(|code| recovered_whole(Some(code), 0, program)),
        (_, None) => (error.labels.first())
            .is_some_and(|label| recovered_whole(None, label.offset(), program)),
        _ => false,
    }
}

/// Takes `function ` off the start of a function declaration's layout and ` {}` off its end.
fn strip_function(ir: &mut ArenaVec<'_, FormatElement<'_>>) -> bool {
    let Some(end) = last_content(ir) else {
        return false;
    };
    if !(end >= 1 && is_token(&ir[end], "}") && is_token(&ir[end - 1], "{")) {
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
    if !(is_token(&ir[start], "function")
        && matches!(ir.get(start + 1), Some(FormatElement::Space)))
    {
        return false;
    }
    ir.drain(body..=end);
    ir.drain(start..start + 2);
    true
}

/// The plugin's `removeParentheses` on a sequence oxc prints in parentheses (`(a, b)`).
fn remove_parentheses(ir: &mut ArenaVec<'_, FormatElement<'_>>) {
    // The comments before the sequence print as texts and lines ahead of its `(`.
    let start = ir.iter().position(|e| match e {
        FormatElement::Tag(_)
        | FormatElement::Text { .. }
        | FormatElement::Line(_)
        | FormatElement::ExpandParent => false,
        FormatElement::Token { text } => !text.as_str().trim().is_empty(),
        _ => true,
    });
    let end = last_content(ir);
    if let (Some(start), Some(end)) = (start, end)
        && start < end
        && is_token(&ir[start], "(")
        && is_token(&ir[end], ")")
    {
        ir.remove(end);
        ir.remove(start);
    }
}

/// Makes the first soft line after a line comment a hard line, so the comment ends its own line
/// when the soft lines go: left pending, it would flush after the block, into the markup.
fn break_after_line_comments(ir: &mut ArenaVec<'_, FormatElement<'_>>) {
    if !holds_line_comment(ir) {
        return;
    }
    // Interned content is shared, so the lines inside it are rewritten on a copy written in place
    let mut flat = Vec::with_capacity(ir.len());
    flatten_interned(ir, &mut flat);
    let mut in_suffix = false;
    let mut pending = false;
    for element in &mut flat {
        match element {
            FormatElement::Tag(Tag::StartLineSuffix) => in_suffix = true,
            FormatElement::Tag(Tag::EndLineSuffix) => in_suffix = false,
            FormatElement::Text { text, .. } if in_suffix && is_line_comment(text.as_str()) => {
                pending = true;
            }
            FormatElement::Line(LineMode::Soft | LineMode::SoftOrSpace) if pending => {
                *element = FormatElement::Line(LineMode::Hard);
                pending = false;
            }
            FormatElement::Line(_) | FormatElement::LineSuffixBoundary => pending = false,
            _ => {}
        }
    }
    ir.clear();
    ir.extend(flat);
}

fn is_line_comment(text: &str) -> bool {
    text.starts_with("//")
}

fn holds_line_comment(ir: &[FormatElement<'_>]) -> bool {
    ir.iter().any(|element| match element {
        FormatElement::Text { text, .. } => is_line_comment(text.as_str()),
        FormatElement::Interned(interned) => holds_line_comment(interned),
        _ => false,
    })
}

fn flatten_interned<'a>(ir: &[FormatElement<'a>], flat: &mut Vec<FormatElement<'a>>) {
    for element in ir {
        if let FormatElement::Interned(interned) = element {
            flatten_interned(interned, flat);
        } else {
            flat.push(element.clone());
        }
    }
}

/// The plugin's `trimRight([docs], (d) => d === ';')` on a statement: drops the `;` it ends with.
pub(super) fn trim_semicolon(ir: &mut ArenaVec<'_, FormatElement<'_>>) {
    if let Some(i) = last_content(ir)
        && is_token(&ir[i], ";")
    {
        ir.remove(i);
    }
}

fn is_token(element: &FormatElement<'_>, token: &str) -> bool {
    matches!(element, FormatElement::Token { text } if text.as_str() == token)
}

/// The last element that is not a closing tag.
fn last_content(ir: &[FormatElement<'_>]) -> Option<usize> {
    ir.iter()
        .rposition(|e| !matches!(e, FormatElement::Tag(t) if t.is_end()))
}

/// The errors inside a script's `body`: the TypeScript errors oxc reported for the scripts, and the
/// ones the compiler lets pass.
pub(super) fn script_errors(c: &Component, body: Span) -> impl Iterator<Item = &SyntaxError> {
    let inside = move |error: &&SyntaxError| {
        let at = error.diagnostic.span.start_offset;
        body.start_offset <= at && at <= body.end_offset
    };
    (c.script_typescript_errors.iter())
        .chain(c.javascript.unchecked_errors())
        .filter(inside)
}

#[cfg(test)]
mod tests;
