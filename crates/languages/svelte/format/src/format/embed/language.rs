//! Which printer a script or style body goes to, by the language its tag names.

use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_svelte_syntax::syntax_tree::decode_attribute;

use super::super::javascript::{Adjust, Part as JavaScriptPart};
use super::{Cow, LayoutInstructionIdentifier, Printer, R, Span, TagAttributes, Unsupported};

impl Printer<'_, '_, '_> {
    /// The plugin's `getLangAttribute`: the decoded text of `lang`, else `type`, without a
    /// `text/` prefix, with the attribute's name.
    fn language(&self, attributes: &[TagAttributes]) -> Option<(Span, Cow<'_, str>)> {
        let value = |name: &str| {
            attributes
                .iter()
                .find(|(n, _)| n.text(self.source_text) == name)
                .and_then(|&(n, v)| Some((n, decode_attribute(v?.text(self.source_text)))))
                .filter(|(_, v)| !v.is_empty())
        };
        let (at, language) = value("lang").or_else(|| value("type"))?;
        Some((
            at,
            match language {
                Cow::Borrowed(l) => Cow::Borrowed(l.strip_prefix("text/").unwrap_or(l)),
                Cow::Owned(l) => Cow::Owned(l.strip_prefix("text/").unwrap_or(&l).to_owned()),
            },
        ))
    }

    /// The plugin's `isNodeSupportedLanguage`: it keeps the body of these as it is.
    pub(super) fn unsupported(&self, attributes: &[TagAttributes]) -> bool {
        self.language(attributes).is_some_and(|(_, language)| {
            matches!(
                &*language,
                "coffee" | "coffeescript" | "styl" | "stylus" | "sass"
            )
        })
    }

    /// The plugin's `getLangAttribute` names a language other than JavaScript or TypeScript: JSON
    /// goes to Prettier's JSON printer, and any other body the plugin keeps when it does not parse.
    pub(super) fn refuse_script_language(&self, attributes: &[TagAttributes]) -> R<()> {
        let Some((at, lang)) = self.language(attributes) else {
            return Ok(());
        };
        if matches!(
            &*lang,
            "ts" | "typescript" | "js" | "javascript" | "module" | "application/javascript"
        ) {
            Ok(())
        } else {
            Err(Unsupported::at(
                "a script language other than JavaScript",
                at,
            ))
        }
    }

    /// `formatBodyContent` around the script's program.
    pub(super) fn script_body(&mut self, content: Span) -> R<LayoutInstructionIdentifier> {
        let text = content.text(self.source_text);
        if text.trim_matches(is_ecmascript_whitespace).is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let body = self.embed(content, JavaScriptPart::Script, Adjust::default())?;
        Ok(self.indented_body(body))
    }

    /// `formatBodyContent` around the style sheet at `content`.
    pub(super) fn style_body(
        &mut self,
        content: Span,
        attributes: &[TagAttributes],
    ) -> R<LayoutInstructionIdentifier> {
        // The plugin's `embedStyle`: any language but Less and SCSS, such as `postcss`, is CSS.
        let variant = match self.language(attributes).as_ref().map(|(_, l)| &**l) {
            Some("less") => oxc_formatter_css::CssVariant::Less,
            Some("scss") => oxc_formatter_css::CssVariant::Scss,
            _ => oxc_formatter_css::CssVariant::Css,
        };
        let text = content.text(self.source_text);
        // The plugin ends the sheet at the first `</style\s*>` even inside a string or a comment,
        // which leaves the rest of the sheet to the markup; this formatter does not copy that.
        if holds_closing_tag(text) {
            return Err(Unsupported::at(
                "a `</style>` inside a style sheet, which prettier-plugin-svelte cuts the sheet at",
                content,
            ));
        }
        if text.trim_matches(is_ecmascript_whitespace).is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let text = oxc_formatter_core::normalize_newlines(text, ['\r']);
        let core = &self.embedder.options;
        let options = oxc_formatter_css::CssFormatOptions {
            indent_style: core.indent_style,
            indent_width: core.indent_width,
            line_width: core.line_width,
            line_ending: core.line_ending,
            single_quote: self.options.single_quote.into(),
            variant,
            ..oxc_formatter_css::CssFormatOptions::default()
        };
        #[expect(
            clippy::map_err_ignore,
            reason = "oxc's diagnostic points into the sheet, not the component"
        )]
        let ir = oxc_formatter_css::format_to_ir(
            self.embedder.embedding.session(),
            &text,
            options,
            None,
        )
        .map_err(|_| Unsupported::at("CSS that oxc's formatter does not format", content))?;
        let body = self.keep(ir.ir);
        Ok(self.indented_body(body))
    }
}

/// Whether `text` holds what prettier-plugin-svelte's `<\/style\s*>` matches.
fn holds_closing_tag(text: &str) -> bool {
    text.match_indices("</style").any(|(at, close)| {
        text[at + close.len()..]
            .trim_start_matches(is_ecmascript_whitespace)
            .starts_with('>')
    })
}
