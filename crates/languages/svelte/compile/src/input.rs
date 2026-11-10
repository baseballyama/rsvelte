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

pub(crate) fn static_string<'a>(
    input: &CompileInput<'a>,
    value: &'a rsvelte_svelte_semantic::compiler_syntax_tree::AttributeValue,
) -> Option<&'a str> {
    use rsvelte_svelte_semantic::compiler_syntax_tree::AttributeValue;
    match value {
        AttributeValue::Static(value) => Some(value),
        AttributeValue::Expression { expression, .. } | AttributeValue::Shorthand(expression) => {
            match input.component.javascript.get_expression(*expression) {
                oxc_ast::ast::Expression::StringLiteral(literal) => literal.value.as_str(),
                _ => None,
            }
        }
        _ => None,
    }
}
