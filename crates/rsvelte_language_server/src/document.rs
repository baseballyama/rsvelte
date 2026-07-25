//! The in-memory mirror of the client's open documents.

use std::collections::HashMap;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::sync::Arc;

use lsp_types::{Position, Range, TextDocumentContentChangeEvent, Uri};

use crate::text::LineIndex;

pub struct Document {
    pub uri: Uri,
    pub language_id: String,
    pub version: i32,
    /// Shared so dispatching an analysis costs a refcount rather than a copy of
    /// the file. `Arc::make_mut` keeps editing in place for as long as no
    /// worker holds the other end.
    text: Arc<String>,
    index: LineIndex,
    hash: u64,
}

impl Document {
    pub fn new(uri: Uri, language_id: String, version: i32, text: String) -> Self {
        let index = LineIndex::new(&text);
        let hash = hash_of(&text);
        Self {
            uri,
            language_id,
            version,
            text: Arc::new(text),
            index,
            hash,
        }
    }

    pub fn text(&self) -> &str {
        &self.text
    }

    /// The contents, ready to hand to another thread.
    pub fn shared_text(&self) -> Arc<String> {
        Arc::clone(&self.text)
    }

    /// A hash of the current contents, so a consumer can skip re-analysing a
    /// document whose text did not actually change.
    pub fn content_hash(&self) -> u64 {
        self.hash
    }

    pub fn position_at(&self, offset: usize) -> Position {
        self.index.position(&self.text, offset)
    }

    pub fn offset_at(&self, position: Position) -> usize {
        self.index.offset(&self.text, position)
    }

    /// The range covering the whole document.
    pub fn full_range(&self) -> Range {
        Range::new(Position::new(0, 0), self.position_at(self.text.len()))
    }

    /// Apply the changes of one `textDocument/didChange`. Each change is
    /// relative to the document as left by the previous one, so the line index
    /// is rebuilt between them.
    pub fn apply(&mut self, version: i32, changes: &[TextDocumentContentChangeEvent]) {
        self.version = version;
        for change in changes {
            let text = Arc::make_mut(&mut self.text);
            match change.range {
                Some(range) => {
                    let start = self.index.offset(text, range.start);
                    let end = self.index.offset(text, range.end).max(start);
                    text.replace_range(start..end, &change.text);
                }
                None => text.clone_from(&change.text),
            }
            self.index = LineIndex::new(&self.text);
        }
        self.hash = hash_of(&self.text);
    }
}

#[derive(Default)]
pub struct DocumentStore {
    docs: HashMap<String, Document>,
}

impl DocumentStore {
    pub fn open(&mut self, uri: Uri, language_id: String, version: i32, text: String) {
        let key = uri.as_str().to_string();
        self.docs
            .insert(key, Document::new(uri, language_id, version, text));
    }

    pub fn close(&mut self, uri: &Uri) -> Option<Document> {
        self.docs.remove(uri.as_str())
    }

    pub fn get(&self, uri: &Uri) -> Option<&Document> {
        self.get_by_key(uri.as_str())
    }

    /// Look a document up by the raw URI string used as the store's key.
    pub fn get_by_key(&self, key: &str) -> Option<&Document> {
        self.docs.get(key)
    }

    pub fn get_mut(&mut self, uri: &Uri) -> Option<&mut Document> {
        self.docs.get_mut(uri.as_str())
    }

    pub fn iter(&self) -> impl Iterator<Item = &Document> {
        self.docs.values()
    }
}

fn hash_of(text: &str) -> u64 {
    let mut hasher = DefaultHasher::new();
    text.hash(&mut hasher);
    hasher.finish()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::str::FromStr;

    fn doc(text: &str) -> Document {
        Document::new(
            Uri::from_str("file:///App.svelte").unwrap(),
            "svelte".to_string(),
            1,
            text.to_string(),
        )
    }

    fn change(range: Option<Range>, text: &str) -> TextDocumentContentChangeEvent {
        TextDocumentContentChangeEvent {
            range,
            range_length: None,
            text: text.to_string(),
        }
    }

    #[test]
    fn incremental_insert() {
        let mut d = doc("<p>hi</p>\n");
        d.apply(
            2,
            &[change(
                Some(Range::new(Position::new(0, 5), Position::new(0, 5))),
                "!",
            )],
        );
        assert_eq!(d.text(), "<p>hi!</p>\n");
        assert_eq!(d.version, 2);
    }

    #[test]
    fn incremental_replace_across_lines() {
        let mut d = doc("one\ntwo\nthree\n");
        d.apply(
            2,
            &[change(
                Some(Range::new(Position::new(0, 1), Position::new(2, 2))),
                "X",
            )],
        );
        assert_eq!(d.text(), "oXree\n");
    }

    #[test]
    fn incremental_edit_after_astral_text() {
        // The edit is expressed in UTF-16 units, so a naive byte offset would
        // land inside the emoji.
        let mut d = doc("<p>💡ab</p>");
        d.apply(
            2,
            &[change(
                Some(Range::new(Position::new(0, 6), Position::new(0, 7))),
                "Z",
            )],
        );
        assert_eq!(d.text(), "<p>💡aZ</p>");
    }

    #[test]
    fn several_changes_apply_in_order() {
        let mut d = doc("abc");
        d.apply(
            2,
            &[
                change(
                    Some(Range::new(Position::new(0, 0), Position::new(0, 1))),
                    "é",
                ),
                change(
                    Some(Range::new(Position::new(0, 1), Position::new(0, 2))),
                    "💡",
                ),
            ],
        );
        assert_eq!(d.text(), "é💡c");
    }

    #[test]
    fn full_replacement() {
        let mut d = doc("abc");
        d.apply(2, &[change(None, "xyz")]);
        assert_eq!(d.text(), "xyz");
    }

    #[test]
    fn hash_tracks_content() {
        let mut d = doc("abc");
        let before = d.content_hash();
        d.apply(2, &[change(None, "abc")]);
        assert_eq!(d.content_hash(), before);
        d.apply(3, &[change(None, "abd")]);
        assert_ne!(d.content_hash(), before);
    }

    #[test]
    fn full_range_ends_at_the_last_character() {
        let d = doc("💡\nab");
        assert_eq!(
            d.full_range(),
            Range::new(Position::new(0, 0), Position::new(1, 2))
        );
    }
}
