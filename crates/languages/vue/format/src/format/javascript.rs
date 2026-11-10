//! The component's JavaScript, formatted by `oxc_formatter` from its source text in the root oxc's
//! own Vue formatter gives each part, as Prettier formats each part from its text.

use oxc_formatter::{
    ExpressionLayout, ExpressionRoot, JsEmbeddedIn, JsRoot, ProgramLayout, ProgramSemicolons,
};
use oxc_formatter_core::normalize_newlines;
use oxc_span::SourceType;
use rsvelte_typescript_tree::ParametersIdentifier;
use rsvelte_vue_syntax::syntax_tree::DirectiveName;

use super::{LayoutInstructionIdentifier, Printer, R, Span, Unsupported};

const fn expression(layout: ExpressionLayout) -> ExpressionRoot {
    ExpressionRoot {
        layout,
        tailwind_classes: false,
        ends_at_double_brace: false,
        reads_as_statements: false,
        in_parens: false,
        without_parent: false,
    }
}

impl Printer<'_, '_, '_> {
    /// The source in `span`, formatted as `root`.
    fn javascript(
        &mut self,
        span: Span,
        root: JsRoot,
        embedded_in: JsEmbeddedIn,
    ) -> R<LayoutInstructionIdentifier> {
        self.try_javascript(span, root, embedded_in)
            .ok_or_else(|| Unsupported::at("code that oxc's formatter does not format", span))
    }

    fn try_javascript(
        &mut self,
        span: Span,
        root: JsRoot,
        embedded_in: JsEmbeddedIn,
    ) -> Option<LayoutInstructionIdentifier> {
        let text = normalize_newlines(span.text(self.source_text), ['\r']);
        // Prettier reads a script without `lang="ts"` with `babel`, which reads JSX.
        let source_type = if self.c.typescript {
            SourceType::ts()
        } else {
            SourceType::mjs().with_jsx(true)
        };
        let ir = oxc_formatter::format_to_ir(
            self.embedding.session(),
            &text,
            source_type,
            self.options.clone(),
            root,
            embedded_in,
        )
        .ok()?;
        Some(self.embedding.keep(self.docs, ir.ir))
    }

    /// A `<script setup>` body, as `textToDoc` returns it (no trailing line).
    pub(super) fn script(&mut self, content: Span) -> R<LayoutInstructionIdentifier> {
        let root = JsRoot::Program {
            semicolons: ProgramSemicolons::AsOptions,
            layout: ProgramLayout::Bare,
        };
        self.javascript(content, root, JsEmbeddedIn::default())
    }

    /// The code of `{{ … }}` at `span`, trimmed as Vue compiles it.
    pub(super) fn interpolation(&mut self, span: Span) -> R<LayoutInstructionIdentifier> {
        let inner = Span::new(span.start_offset + 2, span.end_offset - 2);
        let text = inner.text(self.source_text);
        let start = inner.start_offset + (text.len() - text.trim_ascii_start().len()) as u32;
        let end = inner.end_offset - (text.len() - text.trim_ascii_end().len()) as u32;
        let root = JsRoot::Expression(ExpressionRoot {
            ends_at_double_brace: true,
            ..expression(ExpressionLayout::Bare)
        });
        let embedded_in = JsEmbeddedIn {
            in_html_attribute: false,
            inlines_code: true,
        };
        self.javascript(Span::new(start, end), root, embedded_in)
    }

    /// A directive's value at `value`, as oxc's Vue formatter reads a directive of its name.
    pub(super) fn directive_value(
        &mut self,
        name: DirectiveName,
        value: Span,
    ) -> R<LayoutInstructionIdentifier> {
        let embedded_in = JsEmbeddedIn {
            in_html_attribute: true,
            inlines_code: true,
        };
        let root = match name {
            DirectiveName::Bind => {
                JsRoot::Expression(expression(ExpressionLayout::Hug { literals: true }))
            }
            DirectiveName::On => {
                let handler = JsRoot::Expression(ExpressionRoot {
                    reads_as_statements: true,
                    // `$event => (…)`
                    in_parens: true,
                    ..expression(ExpressionLayout::Hug { literals: false })
                });
                if let Some(d) = self.try_javascript(value, handler, embedded_in) {
                    return Ok(d);
                }
                JsRoot::Program {
                    semicolons: ProgramSemicolons::MarksStatements,
                    layout: ProgramLayout::Indented,
                }
            }
            DirectiveName::If | DirectiveName::ElseIf => JsRoot::Expression(ExpressionRoot {
                in_parens: true,
                ..expression(ExpressionLayout::Hug { literals: false })
            }),
            DirectiveName::Else | DirectiveName::For | DirectiveName::Model => {
                JsRoot::Expression(expression(ExpressionLayout::Hug { literals: false }))
            }
        };
        self.javascript(value, root, embedded_in)
    }

    /// `printVueVForDirective`: the aliases as the parameters Vue splits, then the source.
    pub(super) fn v_for(
        &mut self,
        value: Span,
        parameters: ParametersIdentifier,
        source: Span,
    ) -> R<LayoutInstructionIdentifier> {
        let embedded_in = JsEmbeddedIn {
            in_html_attribute: true,
            inlines_code: true,
        };
        let parameters = self.c.javascript.get_parameters(parameters);
        let first = parameters.items.first().map(|p| p.span.start);
        let last = parameters
            .rest
            .as_ref()
            .map(|r| r.span.end)
            .or_else(|| parameters.items.last().map(|p| p.span.end));
        let (Some(first), Some(last)) = (first, last) else {
            return Err(Unsupported::at("a v-for without an alias", value));
        };
        let left = self.javascript(
            Span::new(first, last),
            JsRoot::FunctionParams {
                parens_when_many: true,
            },
            embedded_in,
        )?;
        let between = Span::new(last, source.start_offset).text(self.source_text);
        let op = if between.trim_end().ends_with("of") {
            "of"
        } else {
            "in"
        };
        let right = self.javascript(
            source,
            JsRoot::Expression(expression(ExpressionLayout::Group)),
            embedded_in,
        )?;
        let sp = self.lit(" ");
        let op = self.lit(op);
        let sp2 = self.lit(" ");
        Ok(self.cat(&[left, sp, op, sp2, right]))
    }
}
