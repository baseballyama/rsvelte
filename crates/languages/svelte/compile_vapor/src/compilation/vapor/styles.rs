use super::{Builder, NodeIdentifier};

impl Builder<'_> {
    pub(super) fn stylesheet_values(&mut self) -> (NodeIdentifier, NodeIdentifier) {
        let hash = self.to.write_string(
            self.input
                .stylesheet_hash
                .as_ref()
                .expect("a stylesheet has an identity"),
        );
        let css = self.to.write_string(
            self.input
                .stylesheet
                .as_ref()
                .expect("a stylesheet is present"),
        );
        (hash, css)
    }
}
