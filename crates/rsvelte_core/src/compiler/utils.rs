//! General utilities for the Svelte compiler.
//!
//! Corresponds to Svelte's `utils.js`.

/// Can `c` start a JavaScript identifier?
///
/// The official parser asks acorn's `isIdentifierStart(code, true)`, i.e. the
/// `ID_Start` set plus `$` and `_`. Anything narrower (ASCII) or wider (every
/// byte `>= 0x80`) answers a different question; scanners that need the ASCII
/// subset say so in their name.
#[inline]
pub fn is_js_ident_start(c: char) -> bool {
    oxc_syntax::identifier::is_identifier_start(c)
}

/// Can `c` continue a JavaScript identifier?
///
/// Mirrors acorn's `isIdentifierChar(code, true)`: `ID_Continue` plus `$`, and
/// the zero-width joiners.
#[inline]
pub fn is_js_ident_continue(c: char) -> bool {
    oxc_syntax::identifier::is_identifier_part(c)
}

/// Slice a fixed-size look-back window ending at `end`, clamped to a UTF-8
/// char boundary so it can never panic.
///
/// Returns `source[lo..end]`, where `lo` is the first char boundary at or after
/// `end.saturating_sub(window)`. A plain `&source[end - window..end]` panics
/// with a non-char-boundary slice error when a multibyte character straddles
/// `end - window` — which a `.svelte` source can contain anywhere. Callers use
/// these windows to feed ASCII-only scans (e.g. a regex for `{:then`), so a
/// shorter window on multibyte input is equivalent: the ASCII pattern can't
/// span a multibyte byte. `end` must already be a char boundary (callers pass
/// AST token positions); it is clamped to `source.len()` defensively.
pub fn char_boundary_lookback(source: &str, end: usize, window: usize) -> &str {
    let end = end.min(source.len());
    let lo = (end.saturating_sub(window)..end)
        .find(|&i| source.is_char_boundary(i))
        .unwrap_or(end);
    &source[lo..end]
}

/// The character that starts at byte offset `at`, or `None` past the end.
///
/// Replaces `source.as_bytes()[at] as char`, which Latin-1-decodes a single byte
/// of a UTF-8 sequence: `名`'s lead byte reads as `å` and `א`'s as `×`, so an
/// `is_alphanumeric` / `is_whitespace` predicate answers about a character that is
/// not in the source. `at` must be a char boundary; a `find()` match offset always is.
pub fn char_at(source: &str, at: usize) -> Option<char> {
    source.get(at..).and_then(|rest| rest.chars().next())
}

/// The character that ends at byte offset `end`, or `None` at the start of `source`.
///
/// Replaces `source.as_bytes()[end - 1] as char`, which reads a *continuation*
/// byte of the preceding character: `名` (`E5 90 8D`) reads as `U+008D`, a control
/// that no identifier predicate accepts, so a letter is mistaken for a word boundary.
pub fn char_before(source: &str, end: usize) -> Option<char> {
    source.get(..end).and_then(|head| head.chars().next_back())
}

/// Byte offset one *character* past `at`, for resuming a scan after a rejected
/// `find()` match.
///
/// The idiom this replaces is `search_from = abs_pos + 1`, which is a character
/// step written against a byte index. It is correct only while the needle's first
/// character occupies one byte — a property of the *needle*, not of the cursor, so
/// interpolating an identifier at position 0 (`format!("{var}++")` rather than
/// `format!(".#{var}")`) silently turns the next `&text[search_from..]` into a
/// mid-character slice, which panics. `at` must be a char boundary; a `find()`
/// match offset always is.
pub fn next_char_boundary(source: &str, at: usize) -> usize {
    source[at..]
        .chars()
        .next()
        .map_or(at + 1, |c| at + c.len_utf8())
}

/// Is the byte at `i` escaped by the backslash run that precedes it?
///
/// The one-byte lookback `bytes[i - 1] != b'\\'` answers a different question: in
/// `'\\'` the closing quote follows a *complete* `\\` escape and is not escaped at
/// all, so a scanner using that test never closes the string. A byte is escaped
/// only when the run of backslashes immediately before it has odd length.
#[inline]
pub fn is_escaped(bytes: &[u8], i: usize) -> bool {
    let mut n = 0;
    while n < i && bytes[i - 1 - n] == b'\\' {
        n += 1;
    }
    n % 2 == 1
}

/// [`is_escaped`] over a `char` slice, for scanners that index characters.
#[inline]
pub fn is_escaped_char(chars: &[char], i: usize) -> bool {
    let mut n = 0;
    while n < i && chars[i - 1 - n] == '\\' {
        n += 1;
    }
    n % 2 == 1
}

/// List of Element events that will be delegated.
///
/// Corresponds to `DELEGATED_EVENTS` in utils.js.
const DELEGATED_EVENTS: &[&str] = &[
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart",
];

/// Returns `true` if `event_name` is a delegated event.
///
/// Corresponds to `can_delegate_event` in utils.js.
pub fn can_delegate_event(event_name: &str) -> bool {
    DELEGATED_EVENTS.contains(&event_name)
}

/// Properties that cannot be set statically through the template string.
/// These need JavaScript handling to work properly.
///
/// Corresponds to `NON_STATIC_PROPERTIES` in utils.js.
const NON_STATIC_PROPERTIES: &[&str] = &["autofocus", "muted", "defaultValue", "defaultChecked"];

/// Returns `true` if the given attribute cannot be set through the template
/// string, i.e. needs some kind of JavaScript handling to work.
///
/// Corresponds to `cannot_be_set_statically` in utils.js.
pub fn cannot_be_set_statically(name: &str) -> bool {
    NON_STATIC_PROPERTIES.contains(&name)
}

/// Check if an event name is a capture event.
///
/// Corresponds to `is_capture_event` in utils.js.
pub fn is_capture_event(name: &str) -> bool {
    name.ends_with("capture") && name != "gotpointercapture" && name != "lostpointercapture"
}

/// Check if an event should be passive by default.
///
/// Corresponds to `is_passive_event` in utils.js.
pub fn is_passive_event(name: &str) -> bool {
    matches!(name, "touchstart" | "touchmove")
}

/// Check if a name is a boolean attribute.
///
/// Corresponds to `is_boolean_attribute` in utils.js.
pub fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "allowfullscreen"
            | "async"
            | "autofocus"
            | "autoplay"
            | "checked"
            | "controls"
            | "default"
            | "disabled"
            | "formnovalidate"
            | "indeterminate"
            | "inert"
            | "ismap"
            | "loop"
            | "multiple"
            | "muted"
            | "nomodule"
            | "novalidate"
            | "open"
            | "playsinline"
            | "readonly"
            | "required"
            | "reversed"
            | "seamless"
            | "selected"
            | "webkitdirectory"
            | "defer"
            | "disablepictureinpicture"
            | "disableremoteplayback"
    )
}

/// Check if a name is a void element (self-closing).
pub fn is_void_element(name: &str) -> bool {
    matches!(
        name,
        "area"
            | "base"
            | "br"
            | "col"
            | "command"
            | "embed"
            | "hr"
            | "img"
            | "input"
            | "keygen"
            | "link"
            | "meta"
            | "param"
            | "source"
            | "track"
            | "wbr"
    )
}

/// Check if a binding is to a content-editable property.
pub fn is_content_editable_binding(name: &str) -> bool {
    matches!(name, "textContent" | "innerHTML" | "innerText")
}

/// Extract the basename (last component) from a file path.
///
/// Like node's `basename`, but doesn't use it to ensure the compiler is usable
/// in a browser environment.
///
/// Corresponds to `get_basename` in mapped_code.js.
pub fn get_basename(filename: &str) -> String {
    filename
        .split(['/', '\\'])
        .next_back()
        .unwrap_or("")
        .to_string()
}

/// Get a location function for finding line/column from character offset.
///
/// This creates a closure that can efficiently look up locations in the source.
pub fn get_locator(
    source: &str,
) -> std::sync::Arc<dyn Fn(usize) -> crate::compiler::preprocess::types::Location + Send + Sync> {
    // Pre-compute line start positions
    let mut line_starts = vec![0];
    for (i, ch) in source.char_indices() {
        if ch == '\n' {
            line_starts.push(i + 1);
        }
    }

    let source_len = source.len();
    std::sync::Arc::new(move |index| {
        let index = index.min(source_len);

        // Binary search for the line
        let line = match line_starts.binary_search(&index) {
            Ok(exact) => exact,
            Err(insert_pos) => insert_pos.saturating_sub(1),
        };

        let column = index - line_starts.get(line).copied().unwrap_or(0);

        crate::compiler::preprocess::types::Location { line, column }
    })
}

#[cfg(test)]
mod ident_classifier_tests {
    use super::{is_js_ident_continue, is_js_ident_start};

    #[test]
    fn js_ident_classifiers_follow_the_official_rule() {
        for c in ['a', 'Z', '_', '$', '名', 'é', 'ש', '々'] {
            assert!(is_js_ident_start(c), "{c:?} starts an identifier");
            assert!(is_js_ident_continue(c), "{c:?} continues an identifier");
        }
        // Digits continue but do not start.
        assert!(!is_js_ident_start('7'));
        assert!(is_js_ident_continue('7'));

        // Neither an ASCII-only test nor an "every byte >= 0x80" test gets these
        // right: they are non-ASCII and not identifier characters.
        for c in [
            '\u{00a0}',
            '\u{3000}',
            '\u{3001}',
            '\u{2014}',
            '\u{1f600}',
            '×',
        ] {
            assert!(!is_js_ident_start(c), "{c:?} cannot start an identifier");
            assert!(!is_js_ident_continue(c), "{c:?} cannot continue one");
        }
    }
}

#[cfg(test)]
mod char_step_tests {
    use super::{is_escaped, is_escaped_char, next_char_boundary};

    /// Discriminating: the whole point of the helper is that the step is the
    /// character's width, not 1.
    #[test]
    fn steps_over_a_whole_multibyte_character() {
        assert_eq!(next_char_boundary("\u{540d}\u{524d}", 0), 3);
        assert_eq!(next_char_boundary("x\u{3005}", 1), 4);
    }

    /// Control: one-byte characters step by one, so every already-safe caller
    /// keeps byte-identical behaviour.
    #[test]
    fn steps_by_one_over_ascii() {
        assert_eq!(next_char_boundary(".#field", 0), 1);
        assert_eq!(next_char_boundary("(ident", 0), 1);
    }

    /// The cursor must still terminate at the end of input.
    #[test]
    fn steps_past_the_end_without_panicking() {
        assert_eq!(next_char_boundary("ab", 2), 3);
    }

    /// Exhaustive over the axis the one-byte lookback gets wrong: the length of
    /// the backslash run before the quote, for every quote character.
    #[test]
    fn a_quote_is_escaped_exactly_when_the_backslash_run_is_odd() {
        for quote in ['\'', '"', '`'] {
            for run in 0..=4usize {
                let text = format!("x{}{quote}", "\\".repeat(run));
                let i = text.len() - 1;
                let chars: Vec<char> = text.chars().collect();
                let expected = run % 2 == 1;
                assert_eq!(
                    is_escaped(text.as_bytes(), i),
                    expected,
                    "bytes: {run} backslashes before {quote}"
                );
                assert_eq!(
                    is_escaped_char(&chars, chars.len() - 1),
                    expected,
                    "chars: {run} backslashes before {quote}"
                );
            }
        }
    }

    /// Discriminating case: the one-byte lookback and the run-parity test agree
    /// on `\'` and disagree on `\\'`, so a scanner that only ever sees the first
    /// shape reads as covered while carrying the defect.
    #[test]
    fn the_run_parity_test_differs_from_a_one_byte_lookback() {
        let one_escape = br"a\'";
        let complete_escape = br"a\\'";
        assert!(is_escaped(one_escape, one_escape.len() - 1));
        assert!(!is_escaped(complete_escape, complete_escape.len() - 1));
        assert_eq!(
            complete_escape[complete_escape.len() - 2],
            b'\\',
            "the byte before the quote is a backslash in both shapes"
        );
    }

    /// A backslash run that starts at offset 0 must not read past the slice.
    #[test]
    fn a_run_at_the_start_of_the_slice_terminates() {
        assert!(!is_escaped(b"'", 0));
        assert!(is_escaped(br"\'", 1));
        assert!(!is_escaped(br"\\'", 2));
        assert!(!is_escaped_char(&['\''], 0));
        assert!(is_escaped_char(&['\\', '\''], 1));
        assert!(!is_escaped_char(&['\\', '\\', '\''], 2));
    }

    /// The byte and char forms must answer identically on multibyte input, where
    /// the two index spaces diverge.
    #[test]
    fn the_byte_and_char_forms_agree_across_a_multibyte_character() {
        let text = "\u{540d}\\\\'";
        let chars: Vec<char> = text.chars().collect();
        assert!(!is_escaped(text.as_bytes(), text.len() - 1));
        assert!(!is_escaped_char(&chars, chars.len() - 1));
        let odd = "\u{540d}\\'";
        let odd_chars: Vec<char> = odd.chars().collect();
        assert!(is_escaped(odd.as_bytes(), odd.len() - 1));
        assert!(is_escaped_char(&odd_chars, odd_chars.len() - 1));
    }
}
