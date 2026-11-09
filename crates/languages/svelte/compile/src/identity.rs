use rsvelte_svelte::compilation::compiler_syntax_tree::{ElementKind, MetadataTag};
use rsvelte_svelte::semantic::input::ComponentInput;
use rsvelte_svelte::syntax::names::component_name;
pub(crate) use rsvelte_svelte::syntax::names::sanitize_identifier;

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
    ) -> Result<Self, rsvelte_plugin_interface::CallError> {
        let mut identity = Self::build(input);
        if let (Some(style), Some(function)) = (input.style, &configuration.css_hash) {
            let hash = function.call(crate::CssHashInput {
                name: &identity.name,
                filename: input.filename,
                css: style.content.text(input.source_text),
            })?;
            if !is_valid_class_name(&hash) {
                return Err(rsvelte_plugin_interface::CallError(
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

fn is_valid_class_name(value: &str) -> bool {
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
