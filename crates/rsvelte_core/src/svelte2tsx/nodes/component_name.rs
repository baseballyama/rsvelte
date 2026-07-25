//! Derive the exported component name from the filename — port of
//! `classNameFromFilename` in `svelte2tsx/addComponentExport.ts` and of the
//! `scule` casing helpers it relies on.

/// Derive a safe component name from the filename.
///
/// Converts "App.svelte" -> "App", "my-component.svelte" -> "My_component",
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
/// 5. `inPascalCase = scule_pascal_case(withoutLeadingInvalidCharacters)`.
/// 6. If no letter was found (`firstValidCharIdx == -1`), prepend `"A"`.
pub(crate) fn derive_component_name(filename: &str) -> String {
    // Step 1: basename up to first dot  (mirrors `path.parse(filename).name?.split('.')[0]`)
    let basename = filename.rsplit('/').next().unwrap_or(filename);
    let basename = basename.rsplit('\\').next().unwrap_or(basename);
    let without_extensions = basename.split('.').next().unwrap_or("");

    // Step 2: keep only [A-Za-z_\d-]
    let without_invalid: String = without_extensions
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '_' || *c == '-')
        .collect();

    // Step 3: find first ASCII letter
    let first_valid_char_idx: Option<usize> = without_invalid
        .chars()
        .position(|c| c.is_ascii_alphabetic());

    // Step 4: JS substr(firstValidCharIdx)
    //   - When idx == -1 (no letter), JS substr(-1) returns the LAST character.
    //   - When idx >= 0, take from that index onward.
    let without_leading: &str = match first_valid_char_idx {
        Some(idx) => {
            // idx is a char-position; since all chars are ASCII, byte == char index.
            &without_invalid[idx..]
        }
        None => {
            // No ASCII letter: mimic JS substr(-1) → last character of the string.
            // If the string is empty, this yields "" (empty slice).
            if without_invalid.is_empty() {
                ""
            } else {
                let last_char_byte = without_invalid
                    .char_indices()
                    .last()
                    .map(|(i, _)| i)
                    .unwrap_or(0);
                &without_invalid[last_char_byte..]
            }
        }
    };

    // Step 5: apply scule pascalCase
    let in_pascal_case = scule_pascal_case(without_leading);

    // Step 6: prepend "A" when no letter was present
    if first_valid_char_idx.is_none() {
        format!("A{}", in_pascal_case)
    } else {
        in_pascal_case
    }
}

/// Port of scule's `pascalCase` (no-normalize variant used by svelte2tsx).
///
/// `pascalCase(str) = splitByCase(str).map(upperFirst).join("")`
///
/// Reference: `node_modules/scule/dist/index.mjs` (used by svelte2tsx).
fn scule_pascal_case(s: &str) -> String {
    split_by_case(s)
        .into_iter()
        .map(|part| upper_first(&part))
        .collect()
}

/// Uppercase only the first character of a string (scule `upperFirst`).
fn upper_first(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => {
            let mut result = String::with_capacity(s.len());
            for c in first.to_uppercase() {
                result.push(c);
            }
            result.extend(chars);
            result
        }
    }
}

/// Port of scule's `splitByCase` with default splitters `["-", "_", "/", "."]`.
///
/// Three-state `isUppercase`:
///   - digit  → `None`      (never triggers a split)
///   - upper  → `Some(true)`
///   - lower  → `Some(false)`
///
/// Splits occur:
///   - On a splitter character (push current buffer, reset).
///   - On a lower→UPPER transition (camelCase boundary).
///   - On a UPPER→lower transition when buffer length > 1 (e.g. "ABCWidget" → ["ABC","Widget"]).
///
/// `previousSplitter` starts as `None` (not-false), so the transition checks are
/// skipped for the very first character.
fn split_by_case(s: &str) -> Vec<String> {
    const SPLITTERS: [char; 4] = ['-', '_', '/', '.'];

    let mut parts: Vec<String> = Vec::new();
    let mut buff = String::new();
    // Three-state: None = unset (first char), Some(true) = was splitter, Some(false) = not splitter
    let mut previous_splitter: Option<bool> = None;
    let mut previous_upper: Option<bool> = None; // None = digit/unset, Some(true/false)

    for ch in s.chars() {
        let is_splitter = SPLITTERS.contains(&ch);

        if is_splitter {
            parts.push(buff.clone());
            buff.clear();
            previous_upper = None;
            previous_splitter = Some(true);
            continue;
        }

        // isUppercase: digit → None, else compare with lowercase
        let is_upper: Option<bool> = if ch.is_ascii_digit() {
            None
        } else if ch.is_uppercase() {
            Some(true)
        } else {
            Some(false)
        };

        // Transition checks only when previousSplitter === false (not a splitter and not unset)
        if previous_splitter == Some(false) {
            // lower → UPPER: start a new part
            if previous_upper == Some(false) && is_upper == Some(true) {
                parts.push(buff.clone());
                buff.clear();
                buff.push(ch);
                previous_upper = is_upper;
                previous_splitter = Some(false);
                continue;
            }
            // UPPER → lower when buff.len() > 1: split off all-but-last char of buffer
            if previous_upper == Some(true) && is_upper == Some(false) && buff.len() > 1 {
                let last_char = buff.chars().last().unwrap();
                let split_point = buff.len() - last_char.len_utf8();
                parts.push(buff[..split_point].to_string());
                buff = format!("{}{}", last_char, ch);
                previous_upper = is_upper;
                previous_splitter = Some(false);
                continue;
            }
        }

        buff.push(ch);
        previous_upper = is_upper;
        previous_splitter = Some(false);
    }

    parts.push(buff);
    parts
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_by_case_basics() {
        assert_eq!(split_by_case("my-component"), vec!["my", "component"]);
        // "ABCWidget": UPPER→lower fires on 'i' after buff="ABCW" → ["ABC","Widget"]
        assert_eq!(split_by_case("ABCWidget"), vec!["ABC", "Widget"]);
        // "XMLHttp": UPPER→lower fires on 't' after buff="XMLH" → ["XML","Http"]
        assert_eq!(split_by_case("XMLHttp"), vec!["XML", "Http"]);
        assert_eq!(split_by_case("a1b2"), vec!["a1b2"]);
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
}
