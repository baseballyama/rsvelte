use std::borrow::Cow;

static ENTITIES: [(&str, u32); 2231] = include!("vendor/entities.rs");
const WINDOWS_1252: [u32; 32] = [
    8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144,
    8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376,
];
const MAX_NAME_BYTES: usize = 32;

#[must_use]
pub fn decode_text(text: &str) -> Cow<'_, str> {
    decode(text, false)
}

#[must_use]
pub fn decode_attribute(text: &str) -> Cow<'_, str> {
    decode(text, true)
}

fn decode(text: &str, attribute: bool) -> Cow<'_, str> {
    let mut remaining = text;
    let mut copied = 0;
    let mut output = None;
    while let Some(offset) = remaining.find('&') {
        let start = text.len() - remaining.len() + offset;
        let candidate = &text[start + 1..];
        if let Some((length, code)) = reference(candidate, attribute)
            && code != 0
        {
            let output = output.get_or_insert_with(|| String::with_capacity(text.len()));
            output.push_str(&text[copied..start]);
            output.push(char::from_u32(validate(code, attribute)).expect("valid scalar"));
            copied = start + 1 + length;
            remaining = &text[copied..];
        } else {
            remaining = candidate;
        }
    }
    output.map_or(Cow::Borrowed(text), |mut output| {
        output.push_str(&text[copied..]);
        Cow::Owned(output)
    })
}

fn reference(text: &str, attribute: bool) -> Option<(usize, u32)> {
    if let Some(number) = text.strip_prefix('#') {
        let (digits, radix) = number
            .strip_prefix(['x', 'X'])
            .map_or((number, 10), |digits| (digits, 16));
        let mut length = 0;
        let mut code = 0_u32;
        for byte in digits.bytes() {
            let Some(digit) = char::from(byte).to_digit(radix) else {
                break;
            };
            code = code.saturating_mul(radix).saturating_add(digit);
            length += 1;
        }
        return (length > 0).then(|| {
            let prefix = text.len() - digits.len();
            let semicolon = usize::from(digits[length..].starts_with(';'));
            (prefix + length + semicolon, code)
        });
    }
    let length = text
        .bytes()
        .take(MAX_NAME_BYTES)
        .take_while(|byte| byte.is_ascii_alphanumeric() || *byte == b';')
        .count();
    for length in (1..=length).rev() {
        let name = &text[..length];
        if let Ok(index) = ENTITIES.binary_search_by(|&(candidate, _)| candidate.cmp(name)) {
            let code = ENTITIES[index].1;
            let next = text.as_bytes().get(length);
            if attribute
                && !name.ends_with(';')
                && next
                    .is_some_and(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'='))
            {
                continue;
            }
            return Some((length, code));
        }
    }
    None
}

const fn validate(code: u32, attribute: bool) -> u32 {
    match code {
        10 if !attribute => 32,
        0..=127 | 160..=55_295 | 57_344..=196_607 | 917_504..=917_631 | 917_760..=917_999 => code,
        128..=159 => WINDOWS_1252[(code - 128) as usize],
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn named_references_follow_the_longest_match_and_attribute_boundary() {
        assert_eq!(
            decode_text("&notit; &amp_ &amp= &lbrace; &fjlig;"),
            "¬it; &_ &= { f"
        );
        assert_eq!(
            decode_attribute("&notit; &amp_ &amp= &lbrace;"),
            "&notit; &amp_ &amp= {"
        );
        assert_eq!(decode_attribute("&amp-é &copy!"), "&-é ©!");
        assert!(
            ENTITIES
                .iter()
                .all(|(name, _)| name.len() <= MAX_NAME_BYTES)
        );
        for (name, code) in &ENTITIES {
            assert_eq!(
                decode_text(&format!("&{name}")),
                char::from_u32(validate(*code, false))
                    .expect("valid entity scalar")
                    .to_string()
            );
        }
    }

    #[test]
    fn numeric_references_preserve_zero_and_validate_other_codes() {
        assert_eq!(
            decode_text("&#0; &#10; &#x80 &#xD800; &#x30000; &#xE0100;"),
            "&#0;   € \0 \0 \u{e0100}"
        );
        assert_eq!(
            decode_attribute("&#10; &#x0; &#999999999999999999999;"),
            "\n &#x0; \0"
        );
        assert_eq!(decode_text("&#x; &#; &#65suffix"), "&#x; &#; Asuffix");
    }

    #[test]
    fn unchanged_text_stays_borrowed() {
        for text in ["plain text", "&unknown;", "&#0;", "&"] {
            assert!(matches!(decode_text(text), Cow::Borrowed(_)));
        }
        assert_eq!(
            decode_text("&unknown; &lt; &unknown; &#0; &gt;"),
            "&unknown; < &unknown; &#0; >"
        );
    }
}
