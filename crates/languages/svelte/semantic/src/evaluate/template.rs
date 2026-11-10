use oxc_ast::ast::TemplateElement;

/// The cooked text of a template literal's quasi; `None` when it holds a lone surrogate, which is
/// no Rust string.
pub(super) fn cooked(quasi: &TemplateElement<'_>) -> Option<String> {
    let cooked = quasi.value.cooked?;
    cooked.as_str().map(str::to_owned)
}
