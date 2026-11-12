use oxc_ast::ast::Expression;

#[must_use]
pub fn cannot_be_set_statically(name: &str) -> bool {
    matches!(
        name,
        "autofocus" | "muted" | "defaultValue" | "defaultChecked"
    )
}

#[must_use]
pub const fn needs_clsx(e: &Expression<'_>) -> bool {
    !matches!(
        e,
        Expression::StringLiteral(_)
            | Expression::NumericLiteral(_)
            | Expression::BooleanLiteral(_)
            | Expression::NullLiteral(_)
            | Expression::TemplateLiteral(_)
            | Expression::BinaryExpression(_)
    )
}

/// Svelte's `validate_tag` for a custom element's name: the error code it raises, if any. An
/// empty name passes.
#[must_use]
pub fn custom_element_tag(tag: &str) -> Option<&'static str> {
    if !tag.is_empty()
        && (!tag.contains('-')
            || !tag.starts_with(|c: char| c.is_ascii_lowercase())
            || !tag.chars().all(is_tag_character))
    {
        return Some("svelte_options_invalid_tagname");
    }
    matches!(
        tag,
        "annotation-xml"
            | "color-profile"
            | "font-face"
            | "font-face-src"
            | "font-face-uri"
            | "font-face-format"
            | "font-face-name"
            | "missing-glyph"
    )
    .then_some("svelte_options_reserved_tagname")
}

const fn is_tag_character(c: char) -> bool {
    matches!(
        c,
        'a'..='z'
            | '0'..='9'
            | '_'
            | '.'
            | '-'
            | '\u{b7}'
            | '\u{c0}'..='\u{d6}'
            | '\u{d8}'..='\u{f6}'
            | '\u{f8}'..='\u{37d}'
            | '\u{37f}'..='\u{1fff}'
            | '\u{200c}'..='\u{200d}'
            | '\u{203f}'..='\u{2040}'
            | '\u{2070}'..='\u{218f}'
            | '\u{2c00}'..='\u{2fef}'
            | '\u{3001}'..='\u{d7ff}'
            | '\u{f900}'..='\u{fdcf}'
            | '\u{fdf0}'..='\u{fffd}'
            | '\u{10000}'..='\u{effff}'
    )
}
