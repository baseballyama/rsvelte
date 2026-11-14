//! A document: the text every task of a run reads, and the one place its size is checked.

use std::path::PathBuf;

use crate::source::positions::MAXIMUM_SOURCE_LENGTH;

/// Built only by [`Document::new`], which checks the size limit.
#[non_exhaustive]
#[derive(Debug)]
pub struct Document {
    /// Path as the user knows it; also the `filename` that output may depend on.
    pub path: String,
    pub text: String,
    /// The file the host read the text from; `None` when the document has a name only, such as a
    /// corpus unit or an editor buffer, so no task looks for files next to it.
    pub file: Option<PathBuf>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum DocumentError {
    /// Byte length; positions are `u32` (see `MAXIMUM_SOURCE_LENGTH`).
    TooLarge(usize),
}

impl Document {
    /// # Errors
    ///
    /// [`DocumentError::TooLarge`] if `text` is `MAXIMUM_SOURCE_LENGTH` bytes or longer.
    pub fn new(path: String, text: String) -> Result<Self, DocumentError> {
        if text.len() >= MAXIMUM_SOURCE_LENGTH as usize {
            return Err(DocumentError::TooLarge(text.len()));
        }
        Ok(Self {
            path,
            text,
            file: None,
        })
    }

    /// The document as read from `file`.
    #[must_use]
    pub fn read_from(mut self, file: PathBuf) -> Self {
        self.file = Some(file);
        self
    }
}
