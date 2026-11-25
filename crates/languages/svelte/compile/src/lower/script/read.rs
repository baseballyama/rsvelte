//! How the client reads a name the template declares.

/// How a name the template declares is read on the client.
#[derive(Clone, Debug)]
pub(in crate::lower) enum Read {
    Plain,
    /// `$.get(object).name`: a name a destructured `{@const}` declares in `object`.
    Field(Box<str>),
    /// `$.get(name)`
    Get,
    /// `name()`
    Call,
}

impl Read {
    pub(in crate::lower) const fn get_if(through_get: bool) -> Self {
        if through_get { Self::Get } else { Self::Plain }
    }
}
