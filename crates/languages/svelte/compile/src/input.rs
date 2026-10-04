use rsvelte_svelte::semantic::input::ComponentInput;

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

pub(crate) fn static_string<'a>(
    input: &CompileInput<'a>,
    value: &'a rsvelte_svelte::compilation::compiler_syntax_tree::AttributeValue,
) -> Option<&'a str> {
    use rsvelte_svelte::compilation::compiler_syntax_tree::AttributeValue;
    match value {
        AttributeValue::Static(value) => Some(value),
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression)
            if matches!(
                input.component.javascript.kind(*expression),
                rsvelte_typescript::Kind::String
            ) =>
        {
            Some(
                input
                    .component
                    .javascript
                    .str_value(*expression, input.component.source_text),
            )
        }
        _ => None,
    }
}
