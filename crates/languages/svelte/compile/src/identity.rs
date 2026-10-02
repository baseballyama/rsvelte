use rsvelte_svelte::semantic::input::ComponentInput;

#[derive(Debug)]
pub struct OutputIdentity {
    pub name: String,
    pub stylesheet_hash: Option<String>,
}

impl OutputIdentity {
    #[must_use]
    pub fn build(input: &ComponentInput<'_>) -> Self {
        Self {
            name: component_name(input.filename),
            stylesheet_hash: input
                .style
                .map(|_| format!("svelte-{}", hash(input.filename))),
        }
    }
}

/// Upstream `get_component_name` followed by `scope.generate`'s sanitising.
#[must_use]
fn component_name(filename: &str) -> String {
    let mut parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.pop().unwrap_or("");
    let last_dir = parts.last().copied();
    let mut name = basename.replacen(".svelte", "", 1);
    if name == "index"
        && let Some(dir) = last_dir
        && !dir.is_empty()
        && dir != "src"
    {
        dir.clone_into(&mut name);
    }
    let mut chars = name.chars();
    let upper: String = chars
        .next()
        .map_or_else(String::new, |c| c.to_uppercase().chain(chars).collect());
    sanitize_identifier(&upper)
}

/// `[^a-zA-Z0-9_$]` → `_`, and a leading digit → `_` (upstream `scope.generate`).
#[must_use]
pub(crate) fn sanitize_identifier(name: &str) -> String {
    let mut out: String = name
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                c
            } else {
                '_'
            }
        })
        .collect();
    if out.starts_with(|c: char| c.is_ascii_digit()) {
        out.replace_range(0..1, "_");
    }
    out
}

/// Upstream `hash` (utils.js): djb2 over UTF-16 code units, right to left, base 36.
#[must_use]
fn hash(s: &str) -> String {
    let units: Vec<u16> = s
        .encode_utf16()
        .filter(|&u| u != u16::from(b'\r'))
        .collect();
    let mut h: i32 = 5381;
    for &u in units.iter().rev() {
        h = (h.wrapping_shl(5).wrapping_sub(h)) ^ i32::from(u);
    }
    to_base36(h.cast_unsigned())
}

fn to_base36(mut v: u32) -> String {
    const DIGITS: &[u8; 36] = b"0123456789abcdefghijklmnopqrstuvwxyz";
    if v == 0 {
        return "0".into();
    }
    let mut buffer = Vec::new();
    while v > 0 {
        buffer.push(DIGITS[(v % 36) as usize]);
        v /= 36;
    }
    buffer.reverse();
    String::from_utf8(buffer).expect("ASCII digits")
}
