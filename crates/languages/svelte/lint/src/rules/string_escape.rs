//! Escapes in the raw text of a string or template literal.

/// Whether `raw` has an escape whose value differs from the escaped character (`\n`, `\u…`, a
/// trailing `\`), so writing the value as markup text would change it. `\\`, `\'`, `\"`, `` \` ``
/// and `\$` do not count.
pub(super) fn has_useful_escape(raw: &str) -> bool {
    let mut chars = raw.chars();
    while let Some(c) = chars.next() {
        if c == '\\' {
            match chars.next() {
                None => return true,
                Some(escaped) if "nrvtbfux".contains(escaped) => return true,
                Some(_) => {}
            }
        }
    }
    false
}

#[cfg(test)]
mod tests;
