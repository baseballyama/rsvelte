//! A conservative port of Tailwind's arbitrary-value data-type inference
//! (`utils/data-types.ts` / `infer-data-type.ts`). It classifies the inner text
//! of an arbitrary value (`text-[10px]` -> `10px` -> `length`) into the label
//! used by the generated `(root, data-type)` anchor table. When a value is
//! ambiguous — a `calc()`/`var()`/math expression, or anything not clearly one
//! type — it returns `None`, and the caller falls back to sibling placement, so
//! the classifier never *forces* a placement it is unsure about.

/// CSS length units (Tailwind's `LENGTH_UNITS`).
const LENGTH_UNITS: &[&str] = &[
    "cm", "mm", "Q", "in", "pc", "pt", "px", "em", "ex", "ch", "rem", "lh", "rlh", "vw", "vh",
    "vi", "vb", "vmin", "vmax", "svw", "svh", "svi", "svb", "svmin", "svmax", "lvw", "lvh", "lvi",
    "lvb", "lvmin", "lvmax", "dvw", "dvh", "dvi", "dvb", "dvmin", "dvmax", "cqw", "cqh", "cqi",
    "cqb", "cqmin", "cqmax",
];

const ANGLE_UNITS: &[&str] = &["deg", "grad", "rad", "turn"];

/// Classify the inner text of an arbitrary value. Returns one of the labels the
/// anchor table is keyed by (`color`, `length`, `percentage`, `number`,
/// `image`, `url`, `position`, `angle`, `ratio`), or `None` when unsure.
pub fn infer(inner: &str) -> Option<&'static str> {
    // Explicit data-type hint, e.g. `[length:200px]`, `[color:var(--x)]`.
    if let Some((hint, _)) = inner.split_once(':')
        && !hint.starts_with("--")
        && let t = hint.trim()
        && matches!(
            t,
            "color" | "length" | "percentage" | "number" | "image" | "url" | "position" | "angle"
        )
    {
        return Some(match t {
            "color" => "color",
            "length" => "length",
            "percentage" => "percentage",
            "number" => "number",
            "image" => "image",
            "url" => "url",
            "position" => "position",
            _ => "angle",
        });
    }

    let v = inner.trim();
    if v.is_empty() {
        return None;
    }

    // Unambiguous function/keyword forms first (these include `var(--color-*)`).
    if v.starts_with("url(") {
        return Some("url");
    }
    if is_image(v) {
        return Some("image");
    }
    if is_color(v) {
        return Some("color");
    }

    // Any remaining math / variable expression carries no reliable single type.
    if has_math_or_var(v) {
        return None;
    }

    if is_dimension(v, ANGLE_UNITS) {
        return Some("angle");
    }
    if is_ratio(v) {
        return Some("ratio");
    }
    if let Some(num) = v.strip_suffix('%')
        && is_number(num)
    {
        return Some("percentage");
    }
    if is_dimension(v, LENGTH_UNITS) {
        return Some("length");
    }
    if is_number(v) {
        return Some("number");
    }
    if matches!(v, "top" | "bottom" | "left" | "right" | "center") {
        return Some("position");
    }
    None
}

fn has_math_or_var(v: &str) -> bool {
    ["calc(", "min(", "max(", "clamp(", "var(", "mod(", "round("]
        .iter()
        .any(|f| v.contains(f))
}

fn is_image(v: &str) -> bool {
    v.ends_with(')')
        && (v.contains("gradient(")
            || v.starts_with("image(")
            || v.starts_with("image-set(")
            || v.starts_with("cross-fade(")
            || v.starts_with("element("))
}

/// A CSS color literal or keyword (hex, color function, `currentColor`,
/// `transparent`, or a `--color-*` theme reference).
pub fn is_color(v: &str) -> bool {
    v.starts_with('#')
        || v.starts_with("var(--color-")
        || matches!(v, "currentColor" | "transparent")
        || [
            "rgb(",
            "rgba(",
            "hsl(",
            "hsla(",
            "hwb(",
            "lab(",
            "lch(",
            "oklab(",
            "oklch(",
            "color(",
            "color-mix(",
        ]
        .iter()
        .any(|f| v.starts_with(f))
}

fn is_ratio(v: &str) -> bool {
    match v.split_once('/') {
        Some((a, b)) => is_positive_integer(a.trim()) && is_positive_integer(b.trim()),
        None => false,
    }
}

fn is_positive_integer(s: &str) -> bool {
    !s.is_empty() && s.bytes().all(|c| c.is_ascii_digit())
}

/// A signed integer or decimal with no unit.
fn is_number(s: &str) -> bool {
    let s = s.strip_prefix(['-', '+']).unwrap_or(s);
    if s.is_empty() {
        return false;
    }
    let mut seen_dot = false;
    let mut seen_digit = false;
    for c in s.bytes() {
        match c {
            b'0'..=b'9' => seen_digit = true,
            b'.' if !seen_dot => seen_dot = true,
            _ => return false,
        }
    }
    seen_digit
}

/// A number immediately followed by one of `units` (longest-match).
fn is_dimension(v: &str, units: &[&str]) -> bool {
    for unit in units {
        if let Some(num) = v.strip_suffix(unit)
            && is_number(num)
        {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classifies_common_values() {
        assert_eq!(infer("10px"), Some("length"));
        assert_eq!(infer("0.60rem"), Some("length"));
        assert_eq!(infer("50%"), Some("percentage"));
        assert_eq!(infer("#fff"), Some("color"));
        assert_eq!(infer("var(--color-red-500)"), Some("color"));
        assert_eq!(infer("3"), Some("number"));
        assert_eq!(infer("16/9"), Some("ratio"));
        assert_eq!(infer("45deg"), Some("angle"));
        assert_eq!(infer("linear-gradient(red,blue)"), Some("image"));
        assert_eq!(infer("url(x.png)"), Some("url"));
        assert_eq!(infer("length:200px"), Some("length"));
    }

    #[test]
    fn ambiguous_is_none() {
        assert_eq!(infer("calc(100%-4px)"), None);
        assert_eq!(infer("--rail-width"), None);
        assert_eq!(infer("repeat(2,1fr)"), None);
        assert_eq!(infer(".75fr_1fr"), None);
    }
}
