//! The options of Prettier 3 and prettier-plugin-svelte 4 that change a Svelte file's output,
//! under their Prettier names and with their Prettier defaults.
//!
//! Prettier's own plumbing (`parser`,
//! `plugins`, `filepath`, `cursorOffset`), the other languages' options (`vueIndentScriptAndStyle`,
//! the Pug plugin's `pugTabWidth`) and `svelte5CompilerPath` are not options here.

use serde::{Deserialize, Deserializer};

/// The names [`Options`] takes, so that a host can tell an option the formatter prints from one it
/// does not know.
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
    "objectWrap",
    "bracketSameLine",
    "arrowParens",
    "htmlWhitespaceSensitivity",
    "endOfLine",
    "embeddedLanguageFormatting",
    "singleAttributePerLine",
    "proseWrap",
    "requirePragma",
    "insertPragma",
    "checkIgnorePragma",
    "rangeStart",
    "rangeEnd",
    "experimentalTernaries",
    "experimentalOperatorPosition",
    "svelteSortOrder",
    "svelteAllowShorthand",
    "svelteIndentScriptAndStyle",
];

#[derive(Clone, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields, default)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "each is a Prettier option of its own, under its Prettier name"
)]
pub struct Options {
    #[serde(deserialize_with = "whole")]
    pub print_width: usize,
    #[serde(deserialize_with = "whole")]
    pub tab_width: usize,
    pub use_tabs: bool,
    pub semi: bool,
    pub single_quote: bool,
    pub jsx_single_quote: bool,
    pub quote_props: QuoteProps,
    pub trailing_comma: TrailingComma,
    pub bracket_spacing: bool,
    pub object_wrap: ObjectWrap,
    pub bracket_same_line: bool,
    pub arrow_parens: ArrowParens,
    #[serde(rename = "htmlWhitespaceSensitivity")]
    pub markup_whitespace_sensitivity: WhitespaceSensitivity,
    pub end_of_line: EndOfLine,
    pub embedded_language_formatting: EmbeddedLanguageFormatting,
    pub single_attribute_per_line: bool,
    /// For Markdown in a `markdown` template literal.
    pub prose_wrap: ProseWrap,
    pub require_pragma: bool,
    pub insert_pragma: bool,
    pub check_ignore_pragma: bool,
    #[serde(deserialize_with = "whole")]
    pub range_start: usize,
    /// `None` is Prettier's `Infinity`, the end of the file.
    #[serde(deserialize_with = "whole_or_null")]
    pub range_end: Option<usize>,
    pub experimental_ternaries: bool,
    pub experimental_operator_position: OperatorPosition,
    pub svelte_sort_order: SortOrder,
    pub svelte_allow_shorthand: bool,
    pub svelte_indent_script_and_style: bool,
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
            object_wrap: ObjectWrap::Preserve,
            bracket_same_line: false,
            arrow_parens: ArrowParens::Always,
            markup_whitespace_sensitivity: WhitespaceSensitivity::Display,
            end_of_line: EndOfLine::Lf,
            embedded_language_formatting: EmbeddedLanguageFormatting::Auto,
            single_attribute_per_line: false,
            prose_wrap: ProseWrap::Preserve,
            require_pragma: false,
            insert_pragma: false,
            check_ignore_pragma: false,
            range_start: 0,
            range_end: None,
            experimental_ternaries: false,
            experimental_operator_position: OperatorPosition::End,
            svelte_sort_order: SortOrder::default(),
            svelte_allow_shorthand: true,
            svelte_indent_script_and_style: true,
        }
    }
}

/// A JSON number that is a whole, non-negative value: to Prettier `80.0` is `80`.
fn whole<'de, D: Deserializer<'de>>(deserializer: D) -> Result<usize, D::Error> {
    let value = f64::deserialize(deserializer)?;
    if value >= 0.0 && value.fract() == 0.0 && value <= u32::MAX.into() {
        #[expect(
            clippy::cast_possible_truncation,
            clippy::cast_sign_loss,
            reason = "checked to be a whole number in u32's range"
        )]
        Ok(value as usize)
    } else {
        Err(serde::de::Error::custom(format!(
            "{value} is not a whole number"
        )))
    }
}

fn whole_or_null<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Option<usize>, D::Error> {
    #[derive(Deserialize)]
    struct Whole(#[serde(deserialize_with = "whole")] usize);
    Ok(Option::<Whole>::deserialize(deserializer)?.map(|Whole(n)| n))
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
pub enum ObjectWrap {
    Preserve,
    Collapse,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ArrowParens {
    Always,
    Avoid,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WhitespaceSensitivity {
    /// Prettier's `css`: as each element's CSS `display` makes its whitespace significant.
    #[serde(rename = "css")]
    Display,
    Strict,
    Ignore,
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
pub enum EmbeddedLanguageFormatting {
    Auto,
    Off,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProseWrap {
    Always,
    Never,
    Preserve,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OperatorPosition {
    Start,
    End,
}

/// The top-level parts of a component.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Part {
    Options,
    Scripts,
    Markup,
    Styles,
}

/// `svelteSortOrder`: the order of the top-level parts, or `None` to keep the source order.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(try_from = "String")]
pub struct SortOrder(pub Option<[Part; 4]>);

impl Default for SortOrder {
    fn default() -> Self {
        Self(Some([
            Part::Options,
            Part::Scripts,
            Part::Markup,
            Part::Styles,
        ]))
    }
}

impl TryFrom<String> for SortOrder {
    type Error = String;

    fn try_from(value: String) -> Result<Self, String> {
        if value == "none" {
            return Ok(Self(None));
        }
        let mut parts = [Part::Options; 4];
        let mut names = value.split('-');
        for slot in &mut parts {
            *slot = match names.next() {
                Some("options") => Part::Options,
                Some("scripts") => Part::Scripts,
                Some("markup") => Part::Markup,
                Some("styles") => Part::Styles,
                _ => return Err(format!("`{value}` is not a svelteSortOrder")),
            };
        }
        let distinct = parts
            .iter()
            .enumerate()
            .all(|(i, p)| !parts[..i].contains(p));
        if names.next().is_some() || !distinct {
            return Err(format!("`{value}` is not a svelteSortOrder"));
        }
        Ok(Self(Some(parts)))
    }
}

/// The first option whose value this port does not print yet. The pattern names every field, so
/// a new option does not compile until it is decided here.
#[must_use]
#[expect(
    clippy::unneeded_field_pattern,
    reason = "`..` would let a new option through unchecked"
)]
pub fn unported(o: &Options) -> Option<&'static str> {
    let Options {
        print_width: _,
        tab_width: _,
        use_tabs: _,
        semi,
        single_quote,
        jsx_single_quote: _,
        quote_props,
        trailing_comma,
        bracket_spacing,
        object_wrap,
        bracket_same_line: _,
        arrow_parens,
        markup_whitespace_sensitivity: _,
        end_of_line: _,
        embedded_language_formatting: _,
        single_attribute_per_line: _,
        prose_wrap: _,
        require_pragma: _,
        insert_pragma: _,
        check_ignore_pragma: _,
        range_start,
        range_end,
        experimental_ternaries,
        experimental_operator_position,
        svelte_sort_order: _,
        svelte_allow_shorthand: _,
        svelte_indent_script_and_style: _,
    } = o;
    let d = Options::default();
    [
        ("semi", *semi != d.semi),
        ("singleQuote", *single_quote != d.single_quote),
        ("quoteProps", *quote_props != d.quote_props),
        ("trailingComma", *trailing_comma != d.trailing_comma),
        ("bracketSpacing", *bracket_spacing != d.bracket_spacing),
        ("objectWrap", *object_wrap != d.object_wrap),
        ("arrowParens", *arrow_parens != d.arrow_parens),
        ("rangeStart", *range_start != d.range_start),
        ("rangeEnd", *range_end != d.range_end),
        (
            "experimentalTernaries",
            *experimental_ternaries != d.experimental_ternaries,
        ),
        (
            "experimentalOperatorPosition",
            *experimental_operator_position != d.experimental_operator_position,
        ),
    ]
    .into_iter()
    .find_map(|(name, differs)| differs.then_some(name))
}

#[cfg(test)]
mod tests;
