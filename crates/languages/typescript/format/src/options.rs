//! The options of Prettier 3 that change a TypeScript or JavaScript file's output, under their
//! Prettier names and with their Prettier defaults, and the oxc formatter options they become.

use oxc_formatter::{
    ArrowParentheses, AttributePosition, BracketSameLine, BracketSpacing, Expand, JsFormatOptions,
    OperatorPosition as OxcOperatorPosition, QuoteProperties, QuoteStyle, Semicolons,
    TrailingCommas,
};
use oxc_formatter_core::{IndentStyle, IndentWidth, LineEnding, LineWidth};
use serde::Deserialize;

/// The line width oxc's formatter prints for Prettier's `printWidth`, if it takes that width.
#[must_use]
pub fn line_width(print_width: usize) -> Option<LineWidth> {
    u16::try_from(print_width)
        .ok()
        .and_then(|width| LineWidth::try_from(width).ok())
}

/// The indent width oxc's formatter prints for Prettier's `tabWidth`, if it takes that width.
#[must_use]
pub fn indent_width(tab_width: usize) -> Option<IndentWidth> {
    u8::try_from(tab_width)
        .ok()
        .and_then(|width| IndentWidth::try_from(width).ok())
}

/// The names [`Options`] takes, so that a host can pass these and only these from a Prettier
/// configuration.
pub const NAMES: &[&str] = &[
    "printWidth",
    "tabWidth",
    "useTabs",
    "semi",
    "singleQuote",
    "jsxSingleQuote",
    "quoteProps",
    "trailingComma",
    "bracketSpacing",
    "bracketSameLine",
    "arrowParens",
    "endOfLine",
    "objectWrap",
    "singleAttributePerLine",
    "embeddedLanguageFormatting",
    "experimentalTernaries",
    "experimentalOperatorPosition",
    "requirePragma",
    "insertPragma",
    "checkIgnorePragma",
];

#[derive(Clone, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields, default)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "each is a Prettier option of its own, under its Prettier name"
)]
pub struct Options {
    pub print_width: u16,
    pub tab_width: u8,
    pub use_tabs: bool,
    pub semi: bool,
    pub single_quote: bool,
    pub jsx_single_quote: bool,
    pub quote_props: QuoteProps,
    pub trailing_comma: TrailingComma,
    pub bracket_spacing: bool,
    pub bracket_same_line: bool,
    pub arrow_parens: ArrowParens,
    pub end_of_line: EndOfLine,
    pub object_wrap: ObjectWrap,
    pub single_attribute_per_line: bool,
    pub embedded_language_formatting: EmbeddedLanguageFormatting,
    pub experimental_ternaries: bool,
    pub experimental_operator_position: OperatorPosition,
    pub require_pragma: bool,
    pub insert_pragma: bool,
    pub check_ignore_pragma: bool,
}

impl Default for Options {
    fn default() -> Self {
        Self {
            print_width: 80,
            tab_width: 2,
            use_tabs: false,
            semi: true,
            single_quote: false,
            jsx_single_quote: false,
            quote_props: QuoteProps::AsNeeded,
            trailing_comma: TrailingComma::All,
            bracket_spacing: true,
            bracket_same_line: false,
            arrow_parens: ArrowParens::Always,
            end_of_line: EndOfLine::Lf,
            object_wrap: ObjectWrap::Preserve,
            single_attribute_per_line: false,
            embedded_language_formatting: EmbeddedLanguageFormatting::Auto,
            experimental_ternaries: false,
            experimental_operator_position: OperatorPosition::End,
            require_pragma: false,
            insert_pragma: false,
            check_ignore_pragma: false,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum QuoteProps {
    AsNeeded,
    Consistent,
    Preserve,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TrailingComma {
    All,
    Es5,
    None,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ArrowParens {
    Always,
    Avoid,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EndOfLine {
    Lf,
    Crlf,
    Cr,
    Auto,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ObjectWrap {
    Preserve,
    Collapse,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EmbeddedLanguageFormatting {
    Auto,
    Off,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OperatorPosition {
    Start,
    End,
}

impl Options {
    /// The oxc formatter options these become.
    ///
    /// # Errors
    ///
    /// The name of the first option whose value the formatter cannot print.
    pub fn formatter(&self) -> Result<JsFormatOptions, &'static str> {
        // Each refused value would be printed as if it were the default, silently.
        let unported = [
            ("endOfLine", self.end_of_line == EndOfLine::Auto),
            (
                "embeddedLanguageFormatting",
                self.embedded_language_formatting == EmbeddedLanguageFormatting::Off,
            ),
            ("requirePragma", self.require_pragma),
            ("insertPragma", self.insert_pragma),
            ("checkIgnorePragma", self.check_ignore_pragma),
        ];
        if let Some((name, _)) = unported.into_iter().find(|&(_, refused)| refused) {
            return Err(name);
        }
        let line_width = line_width(usize::from(self.print_width)).ok_or("printWidth")?;
        let indent_width = indent_width(usize::from(self.tab_width)).ok_or("tabWidth")?;
        Ok(JsFormatOptions {
            indent_style: if self.use_tabs {
                IndentStyle::Tab
            } else {
                IndentStyle::Space
            },
            indent_width,
            line_width,
            line_ending: match self.end_of_line {
                EndOfLine::Crlf => LineEnding::Crlf,
                EndOfLine::Cr => LineEnding::Cr,
                EndOfLine::Lf | EndOfLine::Auto => LineEnding::Lf,
            },
            ..self.style()
        })
    }

    /// The oxc formatter options these become apart from the indentation, the width and the line
    /// ending, which a host that embeds JavaScript sets itself.
    #[must_use]
    pub fn style(&self) -> JsFormatOptions {
        JsFormatOptions {
            quote_style: quote(self.single_quote),
            jsx_quote_style: quote(self.jsx_single_quote),
            quote_properties: match self.quote_props {
                QuoteProps::AsNeeded => QuoteProperties::AsNeeded,
                QuoteProps::Consistent => QuoteProperties::Consistent,
                QuoteProps::Preserve => QuoteProperties::Preserve,
            },
            trailing_commas: match self.trailing_comma {
                TrailingComma::All => TrailingCommas::All,
                TrailingComma::Es5 => TrailingCommas::Es5,
                TrailingComma::None => TrailingCommas::None,
            },
            semicolons: if self.semi {
                Semicolons::Always
            } else {
                Semicolons::AsNeeded
            },
            arrow_parentheses: match self.arrow_parens {
                ArrowParens::Always => ArrowParentheses::Always,
                ArrowParens::Avoid => ArrowParentheses::AsNeeded,
            },
            bracket_spacing: BracketSpacing::from(self.bracket_spacing),
            bracket_same_line: BracketSameLine::from(self.bracket_same_line),
            attribute_position: if self.single_attribute_per_line {
                AttributePosition::Multiline
            } else {
                AttributePosition::Auto
            },
            expand: match self.object_wrap {
                ObjectWrap::Preserve => Expand::Auto,
                ObjectWrap::Collapse => Expand::Never,
            },
            operator_position: match self.experimental_operator_position {
                OperatorPosition::Start => OxcOperatorPosition::Start,
                OperatorPosition::End => OxcOperatorPosition::End,
            },
            experimental_ternaries: self.experimental_ternaries,
            ..JsFormatOptions::default()
        }
    }
}

const fn quote(single: bool) -> QuoteStyle {
    if single {
        QuoteStyle::Single
    } else {
        QuoteStyle::Double
    }
}

#[cfg(test)]
mod tests;
