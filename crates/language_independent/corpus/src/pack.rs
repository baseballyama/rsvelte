//! Many files in one text file, in the format of `tools/oracle/pack.ts`.
//!
//! A header line, then each entry as `=== <body length in bytes> <path>[\t<attribute>]...\n`,
//! the body and a newline, sorted by path and attributes in byte order.

use std::fmt::Write as _;
use std::ops::Range;
use std::path::Path;

const HEADER: &str = "# rsvelte pack 1\n";
const MARK: &str = "=== ";

/// A pack read into one buffer; entries are ranges into it, so reading copies nothing.
#[derive(Debug)]
pub struct Pack {
    text: String,
    entries: Vec<Spans>,
}

/// Where one entry's parts are in [`Pack::text`]; `u32` keeps an entry at 24 bytes.
#[derive(Debug, Clone)]
struct Spans {
    path: Range<u32>,
    attributes: Range<u32>,
    body: Range<u32>,
}

/// One entry of a [`Pack`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Entry<'a> {
    pub path: &'a str,
    /// The attributes joined by tabs; empty when there are none.
    pub attributes: &'a str,
    pub body: &'a str,
}

impl Pack {
    /// An empty pack, for a file that does not exist.
    #[must_use]
    pub const fn empty() -> Self {
        Self {
            text: String::new(),
            entries: Vec::new(),
        }
    }

    /// Reads `file`; a missing file is an empty pack.
    ///
    /// # Errors
    ///
    /// The file cannot be read or is not a pack.
    pub fn read(file: &Path) -> Result<Self, String> {
        match std::fs::read_to_string(file) {
            Ok(text) => Self::parse(text).map_err(|e| format!("{}: {e}", file.display())),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Self::empty()),
            Err(e) => Err(format!("{}: {e}", file.display())),
        }
    }

    /// # Errors
    ///
    /// `text` is not a pack, its entries are not sorted, or it is larger than 4 GiB.
    ///
    /// # Panics
    ///
    /// Never: every offset is below the length checked first.
    pub fn parse(text: String) -> Result<Self, String> {
        if u32::try_from(text.len()).is_err() {
            return Err("a pack is limited to 4 GiB".to_owned());
        }
        if !text.starts_with(HEADER) {
            return Err("not a pack".to_owned());
        }
        let mut entries = Vec::new();
        let mut at = HEADER.len();
        let bytes = text.as_bytes();
        while at < text.len() {
            let fail = |why: &str| format!("byte {at}: {why}");
            let eol = text[at..]
                .find('\n')
                .map(|i| at + i)
                .ok_or_else(|| fail("header without a newline"))?;
            let header = text[at..eol]
                .strip_prefix(MARK)
                .ok_or_else(|| fail("expected an entry header"))?;
            let (length, key) = header
                .split_once(' ')
                .ok_or_else(|| fail("header without a path"))?;
            let length: usize = length
                .parse()
                .map_err(|e| fail(&format!("bad body length: {e}")))?;
            let key_start = eol - key.len();
            let path_end = key.find('\t').map_or(eol, |i| key_start + i);
            let body = eol + 1..eol + 1 + length;
            if bytes.get(body.end) != Some(&b'\n') || !text.is_char_boundary(body.end) {
                return Err(fail("body does not end where its length says"));
            }
            let span = |r: Range<usize>| {
                u32::try_from(r.start).expect("checked above")
                    ..u32::try_from(r.end).expect("checked above")
            };
            entries.push(Spans {
                path: span(key_start..path_end),
                attributes: span((path_end + 1).min(eol)..eol),
                body: span(body.clone()),
            });
            at = body.end + 1;
        }
        let pack = Self { text, entries };
        if let Some([_, second]) = pack
            .entries
            .windows(2)
            .find(|w| pack.key(&w[0]) >= pack.key(&w[1]))
        {
            return Err(format!(
                "entries out of order at {:?}",
                pack.entry(second).path
            ));
        }
        Ok(pack)
    }

    fn key(&self, s: &Spans) -> (&str, &str) {
        let e = self.entry(s);
        (e.path, e.attributes)
    }

    fn entry(&self, s: &Spans) -> Entry<'_> {
        let part = |r: &Range<u32>| &self.text[r.start as usize..r.end as usize];
        Entry {
            path: part(&s.path),
            attributes: part(&s.attributes),
            body: part(&s.body),
        }
    }

    pub fn entries(&self) -> impl ExactSizeIterator<Item = Entry<'_>> {
        self.entries.iter().map(|s| self.entry(s))
    }

    /// The entries of `path`, in attribute order.
    pub fn find(&self, path: &str) -> impl Iterator<Item = Entry<'_>> {
        let start = self.entries.partition_point(|s| self.entry(s).path < path);
        self.entries[start..]
            .iter()
            .map(|s| self.entry(s))
            .take_while(move |e| e.path == path)
    }

    #[must_use]
    pub const fn len(&self) -> usize {
        self.entries.len()
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

/// The pack text of `entries`, sorted as [`Pack::parse`] requires.
///
/// # Panics
///
/// If a path or an attribute is empty or holds a tab or a newline, or two entries have the same
/// path and attributes.
#[must_use]
pub fn format<'a>(entries: impl IntoIterator<Item = Entry<'a>>) -> String {
    let mut entries: Vec<Entry<'a>> = entries.into_iter().collect();
    entries.sort_unstable_by(|a, b| (a.path, a.attributes).cmp(&(b.path, b.attributes)));
    let mut out = String::with_capacity(
        HEADER.len() + entries.iter().map(|e| e.body.len() + 64).sum::<usize>(),
    );
    out.push_str(HEADER);
    for (i, e) in entries.iter().enumerate() {
        let fields = std::iter::once(e.path).chain(
            e.attributes
                .split('\t')
                .filter(|_| !e.attributes.is_empty()),
        );
        for field in fields {
            assert!(
                !field.is_empty() && !field.contains(['\t', '\n']),
                "pack field {field:?}"
            );
        }
        assert!(
            i == 0 || (entries[i - 1].path, entries[i - 1].attributes) != (e.path, e.attributes),
            "pack entry {} {} twice",
            e.path,
            e.attributes
        );
        write!(out, "{MARK}{} {}", e.body.len(), e.path).expect("writing to a String succeeds");
        if !e.attributes.is_empty() {
            out.push('\t');
            out.push_str(e.attributes);
        }
        out.push('\n');
        out.push_str(e.body);
        out.push('\n');
    }
    out
}

/// Writes `text` to `file` unless it already holds it; an empty pack removes the file.
///
/// # Errors
///
/// The file cannot be written or removed.
pub fn write(file: &Path, text: &str) -> Result<(), String> {
    let at = |e: std::io::Error| format!("{}: {e}", file.display());
    if text == HEADER {
        return match std::fs::remove_file(file) {
            Err(e) if e.kind() != std::io::ErrorKind::NotFound => Err(at(e)),
            _ => Ok(()),
        };
    }
    if std::fs::read(file).is_ok_and(|old| old == text.as_bytes()) {
        return Ok(());
    }
    if let Some(dir) = file.parent() {
        std::fs::create_dir_all(dir).map_err(at)?;
    }
    std::fs::write(file, text).map_err(at)
}

#[cfg(test)]
mod tests;
