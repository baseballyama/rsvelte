use rsvelte_svelte_semantic::input::ComponentInput;

#[derive(Clone, Copy, Debug)]
pub struct CompileInput<'a> {
    pub component: ComponentInput<'a>,
    pub preserve_whitespace: bool,
}

impl<'a> From<ComponentInput<'a>> for CompileInput<'a> {
    fn from(component: ComponentInput<'a>) -> Self {
        Self {
            component,
            preserve_whitespace: false,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Target {
    Client,
    Server,
}

impl Target {
    /// The module the output imports Svelte's runtime from, as `$`.
    pub(crate) const fn runtime(self) -> &'static str {
        match self {
            Self::Client => "svelte/internal/client",
            Self::Server => "svelte/internal/server",
        }
    }

    /// The measured phase that lowers to this target.
    pub(crate) const fn lower_phase(self) -> &'static str {
        match self {
            Self::Client => "svelte.lower.client",
            Self::Server => "svelte.lower.server",
        }
    }
}

pub(crate) fn static_string<'a>(
    input: &CompileInput<'a>,
    value: &'a rsvelte_svelte_semantic::compiler_syntax_tree::AttributeValue,
) -> Option<&'a str> {
    use rsvelte_svelte_semantic::compiler_syntax_tree::AttributeValue;
    match value {
        AttributeValue::Static(value) => Some(value),
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression) => {
            match input
                .component
                .javascript
                .get_expression(*expression)
                .get_inner_expression()
            {
                oxc_ast::ast::Expression::StringLiteral(literal) => literal.value.as_str(),
                _ => None,
            }
        }
        _ => None,
    }
}
