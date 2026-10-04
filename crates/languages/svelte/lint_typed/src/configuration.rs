use rsvelte_kernel::diagnostics::diagnostic::Severity;

#[derive(Clone, Copy, Debug)]
pub struct Configuration {
    pub no_unnecessary_condition: Option<Severity>,
}

impl Default for Configuration {
    fn default() -> Self {
        Self {
            no_unnecessary_condition: Some(Severity::Error),
        }
    }
}
