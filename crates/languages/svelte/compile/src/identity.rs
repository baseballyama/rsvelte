use std::borrow::Cow;

use rsvelte_svelte::compilation::compiler_syntax_tree::{ElementKind, MetadataTag};
use rsvelte_svelte::semantic::input::ComponentInput;

#[derive(Debug)]
pub struct OutputIdentity {
    pub name: String,
    pub stylesheet_hash: Option<String>,
    pub head_hash: Option<String>,
}

impl OutputIdentity {
    /// # Errors
    /// The configured hash function failed or returned an invalid CSS identifier.
    pub fn build_with_configuration(
        input: &ComponentInput<'_>,
        configuration: &crate::Configuration,
    ) -> Result<Self, rsvelte_kernel::computation::functions::CallError> {
        let mut identity = Self::build(input);
        if let (Some(style), Some(function)) = (input.style, &configuration.css_hash) {
            let hash = function.call(crate::CssHashInput {
                name: &identity.name,
                filename: input.filename,
                css: style.content.text(input.source_text),
            })?;
            if !valid_css_identifier(&hash) {
                return Err(rsvelte_kernel::computation::functions::CallError(
                    "CSS hash must be a nonempty ASCII CSS identifier".into(),
                ));
            }
            identity.stylesheet_hash = Some(hash);
        }
        Ok(identity)
    }

    #[must_use]
    pub fn build(input: &ComponentInput<'_>) -> Self {
        Self {
            name: component_name(input.filename),
            head_hash: input
                .compiler_syntax_tree
                .elements()
                .any(|(_, element)| element.kind == ElementKind::Metadata(Some(MetadataTag::Head)))
                .then(|| hash(input.filename)),
            stylesheet_hash: input
                .style
                .map(|_| format!("svelte-{}", hash(input.filename))),
        }
    }
}

fn valid_css_identifier(value: &str) -> bool {
    let mut bytes = value.bytes();
    match bytes.next() {
        Some(b'-') => {
            if !bytes
                .next()
                .is_some_and(|byte| byte.is_ascii_alphabetic() || byte == b'_' || byte == b'-')
            {
                return false;
            }
        }
        Some(byte) if byte.is_ascii_alphabetic() || byte == b'_' => {}
        _ => return false,
    }
    bytes.all(|byte| byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'-')
}

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
#[must_use]
fn component_name(filename: &str) -> String {
    let mut parts = filename.rsplit(['/', '\\']);
    let basename = parts.next().unwrap_or("");
    let last_dir = parts.next();
    let mut name = basename
        .strip_suffix(".svelte")
        .filter(|stem| !stem.contains(".svelte"))
        .map_or_else(
            || {
                if basename.contains(".svelte") {
                    Cow::Owned(basename.replacen(".svelte", "", 1))
                } else {
                    Cow::Borrowed(basename)
                }
            },
            Cow::Borrowed,
        );
    if name == "index"
        && let Some(dir) = last_dir
        && !dir.is_empty()
        && dir != "src"
    {
        name = Cow::Borrowed(dir);
    }
    let mut chars = name.chars();
    let Some(first) = chars.next() else {
        return String::new();
    };
    sanitize_chars(first.to_uppercase().chain(chars), name.len())
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`).
#[must_use]
pub(crate) fn sanitize_identifier(name: &str) -> String {
    sanitize_chars(name.chars(), name.len())
}

fn sanitize_chars(chars: impl Iterator<Item = char>, capacity: usize) -> String {
    let mut out = String::with_capacity(capacity);
    out.extend(chars.map(|c| {
        if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
            c
        } else {
            '_'
        }
    }));
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}

/// Upstream `hash` (utils.js): djb2 over UTF-16 code units, right to left, base 36.
#[must_use]
fn hash(s: &str) -> String {
    let mut h: i32 = 5381;
    for character in s.chars().rev().filter(|&character| character != '\r') {
        let mut units = [0; 2];
        for &unit in character.encode_utf16(&mut units).iter().rev() {
            h = (h.wrapping_shl(5).wrapping_sub(h)) ^ i32::from(unit);
        }
    }
    to_base36(h.cast_unsigned())
}

fn to_base36(mut v: u32) -> String {
    const U32_BASE36_DIGITS: usize = 7;
    const DIGITS: &[u8; 36] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if v == 0 {
        return "0".into();
    }
    let mut buffer = [0; U32_BASE36_DIGITS];
    let mut start = buffer.len();
    while v > 0 {
        start -= 1;
        buffer[start] = DIGITS[(v % 36) as usize];
        v /= 36;
    }
    std::str::from_utf8(&buffer[start..])
        .expect("ASCII digits")
        .to_owned()
}

#[cfg(test)]
mod tests {
    #[test]
    fn component_names_keep_filename_rules() {
        for (filename, expected) in [
            ("input.svelte", "Input"),
            ("button-group/index.svelte", "Button_group"),
            ("src/index.svelte", "Index"),
            (r"C:\ui\index.svelte", "Ui"),
            ("foo.sveltebar.svelte", "Foobar_svelte"),
            ("1-test.svelte", "__test"),
            ("ß.svelte", "SS"),
            ("no-extension", "No_extension"),
        ] {
            assert_eq!(super::component_name(filename), expected);
        }
    }
}
