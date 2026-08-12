//! Document URI → filesystem path.

use std::path::PathBuf;

/// Return the filesystem path denoted by a document URI.
///
/// Non-`file:` URIs use the URI itself as the filename for extension-based
/// formatter and linter dispatch.
#[must_use]
pub fn uri_to_path(uri: &str) -> PathBuf {
    let Some(rest) = uri.strip_prefix("file://") else {
        return PathBuf::from(uri);
    };
    // Skip the authority component (`file://host/path`); the usual
    // `file:///path` has an empty one.
    let Some(slash) = rest.find('/') else {
        return PathBuf::from(uri);
    };
    let path = &rest[slash..];
    let path = path.find(['?', '#']).map_or(path, |cut| &path[..cut]);
    let decoded = percent_decode(path);
    // `file:///C:/dir/a.svelte` → `C:\dir\a.svelte`.
    if cfg!(windows) && has_drive_letter(&decoded) {
        return PathBuf::from(&decoded[1..]);
    }
    PathBuf::from(decoded)
}

fn has_drive_letter(path: &str) -> bool {
    let b = path.as_bytes();
    b.len() >= 3 && b[0] == b'/' && b[1].is_ascii_alphabetic() && (b[2] == b':' || b[2] == b'|')
}

fn percent_decode(s: &str) -> String {
    let bytes = s.as_bytes();
    if !bytes.contains(&b'%') {
        return s.to_string();
    }
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%'
            && i + 2 < bytes.len()
            && let (Some(hi), Some(lo)) = (hex(bytes[i + 1]), hex(bytes[i + 2]))
        {
            out.push(hi * 16 + lo);
            i += 3;
            continue;
        }
        out.push(bytes[i]);
        i += 1;
    }
    String::from_utf8_lossy(&out).into_owned()
}

const fn hex(b: u8) -> Option<u8> {
    match b {
        b'0'..=b'9' => Some(b - b'0'),
        b'a'..=b'f' => Some(b - b'a' + 10),
        b'A'..=b'F' => Some(b - b'A' + 10),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn plain_file_uri() {
        assert_eq!(
            uri_to_path("file:///home/u/App.svelte"),
            PathBuf::from("/home/u/App.svelte")
        );
    }

    #[test]
    fn percent_escapes_are_decoded() {
        assert_eq!(
            uri_to_path("file:///home/u/my%20app/%E3%81%82.svelte"),
            PathBuf::from("/home/u/my app/あ.svelte")
        );
    }

    #[test]
    fn query_and_fragment_are_dropped() {
        assert_eq!(
            uri_to_path("file:///a/b.svelte?v=1#top"),
            PathBuf::from("/a/b.svelte")
        );
    }

    #[test]
    fn non_file_uris_are_passed_through() {
        assert_eq!(
            uri_to_path("untitled:Untitled-1"),
            PathBuf::from("untitled:Untitled-1")
        );
    }

    #[test]
    fn a_trailing_percent_is_left_alone() {
        assert_eq!(uri_to_path("file:///a/b%"), PathBuf::from("/a/b%"));
    }
}
