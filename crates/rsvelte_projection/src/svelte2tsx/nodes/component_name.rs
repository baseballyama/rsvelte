//! Derive the exported component name from the filename — port of
//! `classNameFromFilename` in `svelte2tsx/addComponentExport.ts` and of the
//! `scule` casing helpers it relies on.

/// Derive a safe component name from the filename.
///
/// Converts "App.svelte" -> "App", "my-component.svelte" -> "`MyComponent`",
/// handles path separators and special characters.
///
/// Port of `classNameFromFilename` from
/// `submodules/language-tools/packages/svelte2tsx/src/svelte2tsx/addComponentExport.ts`.
///
/// Algorithm:
/// 1. Take the final path segment (after the last `/`), then everything before the
///    first `.` — this is `withoutExtensions`.
/// 2. Keep only `[A-Za-z_\d-]` characters — `withoutInvalidCharacters`.
/// 3. Find the index of the first ASCII letter (`firstValidCharIdx`).
/// 4. `withoutLeadingInvalidCharacters = withoutInvalidCharacters.substr(firstValidCharIdx)`.
///    JS `substr(-1)` (when no letter is found, idx = -1) returns the **last character**
///    of the string.
/// 5. Apply scule's `pascalCase` semantics.
/// 6. If no letter was found (`firstValidCharIdx == -1`), prepend `"A"`.
pub fn derive_component_name(filename: &str) -> String {
    let basename = filename.rsplit('/').next().unwrap_or(filename);
    let basename = basename.rsplit('\\').next().unwrap_or(basename);
    let without_extensions = basename.split('.').next().unwrap_or("");
    let bytes = without_extensions.as_bytes();

    let Some(first_letter) = bytes.iter().position(u8::is_ascii_alphabetic) else {
        let mut result = String::with_capacity(2);
        result.push('A');
        if let Some(last) = bytes
            .iter()
            .rfind(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'-'))
            .filter(|byte| byte.is_ascii_digit())
        {
            result.push(char::from(*last));
        }
        return result;
    };

    let mut result = String::with_capacity(bytes.len() - first_letter);
    let mut uppercase_next = true;
    for &byte in &bytes[first_letter..] {
        match byte {
            b'_' | b'-' => uppercase_next = true,
            byte if byte.is_ascii_alphanumeric() => {
                result.push(char::from(if uppercase_next {
                    byte.to_ascii_uppercase()
                } else {
                    byte
                }));
                uppercase_next = false;
            }
            _ => {}
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn split_by_case_reference(s: &str) -> Vec<String> {
        let mut parts = Vec::new();
        let mut buffer = String::new();
        let mut previous_splitter = None;
        let mut previous_upper = None;

        for ch in s.chars() {
            if matches!(ch, '-' | '_' | '/' | '.') {
                parts.push(buffer.clone());
                buffer.clear();
                previous_upper = None;
                previous_splitter = Some(true);
                continue;
            }

            let is_upper = if ch.is_ascii_digit() {
                None
            } else {
                Some(ch.is_uppercase())
            };
            if previous_splitter == Some(false) {
                if previous_upper == Some(false) && is_upper == Some(true) {
                    parts.push(buffer.clone());
                    buffer.clear();
                } else if previous_upper == Some(true)
                    && is_upper == Some(false)
                    && buffer.len() > 1
                {
                    let last = buffer.pop().unwrap();
                    parts.push(buffer.clone());
                    buffer.clear();
                    buffer.push(last);
                }
            }

            buffer.push(ch);
            previous_upper = is_upper;
            previous_splitter = Some(false);
        }
        parts.push(buffer);
        parts
    }

    fn pascal_case_reference(s: &str) -> String {
        let mut result = String::new();
        for part in split_by_case_reference(s) {
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.extend(first.to_uppercase());
                result.extend(chars);
            }
        }
        result
    }

    fn derive_component_name_reference(filename: &str) -> String {
        let basename = filename.rsplit('/').next().unwrap_or(filename);
        let basename = basename.rsplit('\\').next().unwrap_or(basename);
        let without_extensions = basename.split('.').next().unwrap_or("");
        let without_invalid: String = without_extensions
            .chars()
            .filter(|c| c.is_ascii_alphanumeric() || matches!(c, '_' | '-'))
            .collect();
        let first_letter = without_invalid.find(|ch: char| ch.is_ascii_alphabetic());
        let without_leading = first_letter.map_or_else(
            || {
                without_invalid
                    .get(without_invalid.len().saturating_sub(1)..)
                    .unwrap_or("")
            },
            |index| &without_invalid[index..],
        );
        let in_pascal_case = pascal_case_reference(without_leading);
        if first_letter.is_none() {
            format!("A{in_pascal_case}")
        } else {
            in_pascal_case
        }
    }

    #[test]
    fn test_derive_component_name() {
        // Ground-truth cases verified against the official svelte2tsx classNameFromFilename.
        assert_eq!(derive_component_name("App.svelte"), "App");
        assert_eq!(derive_component_name("my-component.svelte"), "MyComponent");
        assert_eq!(derive_component_name("my_component.svelte"), "MyComponent");
        assert_eq!(derive_component_name("path/to/Input.svelte"), "Input");
        assert_eq!(derive_component_name("123.svelte"), "A3");
        assert_eq!(derive_component_name("1.svelte"), "A1");
        assert_eq!(derive_component_name("foo.bar.svelte"), "Foo");
        assert_eq!(derive_component_name("ABCWidget.svelte"), "ABCWidget");
        assert_eq!(derive_component_name("XMLHttp.svelte"), "XMLHttp");
        assert_eq!(derive_component_name("a1b2.svelte"), "A1b2");
        assert_eq!(derive_component_name("_x.svelte"), "X");
        assert_eq!(derive_component_name("two words.svelte"), "Twowords");
        assert_eq!(derive_component_name(".svelte"), "A");
    }

    #[test]
    fn component_name_matches_reference_exhaustively() {
        const PIECES: [&str; 9] = ["a", "B", "0", "_", "-", " ", "$", "é", "中"];

        fn assert_matches(name: &mut String, remaining: usize) {
            let filename = format!("prefix/{name}.suffix.svelte");
            assert_eq!(
                derive_component_name(&filename),
                derive_component_name_reference(&filename),
                "{filename}"
            );
            if remaining == 0 {
                return;
            }
            for piece in PIECES {
                let length = name.len();
                name.push_str(piece);
                assert_matches(name, remaining - 1);
                name.truncate(length);
            }
        }

        assert_matches(&mut String::new(), 5);
    }
}
