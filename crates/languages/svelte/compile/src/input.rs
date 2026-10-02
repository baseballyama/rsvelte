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
