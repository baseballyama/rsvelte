use crate::compilation::input;

/// The style sheet scoped and pruned, from any frontend's [`input::CompileInput`].
#[must_use]
pub fn scoped_stylesheet(
    input: &input::CompileInput<'_>,
    an: &crate::semantic::analyze::Analysis,
) -> Option<String> {
    let (sheet, hash) = match (input.style, an.stylesheet_hash.as_deref()) {
        (None, _) => return None,
        (Some(sheet), Some(hash)) => (sheet, hash),
        (Some(_), None) => unreachable!("a component with a style has a hash"),
    };
    Some(rsvelte_stylesheet::scope::render(
        input.source_text,
        sheet,
        &an.stylesheet_used,
        hash,
    ))
}
