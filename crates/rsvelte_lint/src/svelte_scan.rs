//! Small source-scan helpers shared by the cross-cutting (template + script)
//! legacy meta-rules (`experimental-require-slot-types`,
//! `experimental-require-strict-events`, `require-event-dispatcher-types`).
//!
//! These rules each need facts that straddle the template and the `<script>`
//! ESTree (e.g. "is the script TS *and* does it declare a `$$Slots` interface"),
//! which neither the per-node template [`Rule`](crate::rule::Rule) nor the
//! [`ScriptRule`](crate::script::ScriptRule) trait can see together. A focused
//! source scan over the `<script>` region keeps them simple and dependency-free.

/// Byte range `[start, end)` of each `<script …>…</script>` element's inner
/// content, paired with the element's start-tag byte range `[tag_start, tag_gt)`
/// (the `<` … `>` of the opening tag).
pub(crate) struct ScriptBlock {
    /// Byte offset of the opening `<`.
    pub tag_start: usize,
    /// Byte offset just past the opening tag's `>`.
    pub content_start: usize,
    /// Byte offset of the closing `</script>`'s `<` (or EOF).
    pub content_end: usize,
    /// The opening tag's attribute text (between `<script` and `>`).
    pub open_tag_attrs: String,
}

/// Find every `<script …>` block in `source`.
pub(crate) fn script_blocks(source: &str) -> Vec<ScriptBlock> {
    let bytes = source.as_bytes();
    let mut out = Vec::new();
    let mut i = 0;
    while i + 7 <= bytes.len() {
        if &bytes[i..i + 7] != b"<script" {
            i += 1;
            continue;
        }
        let after = bytes.get(i + 7).copied();
        if !matches!(after, Some(c) if c.is_ascii_whitespace() || c == b'>' || c == b'/') {
            i += 7;
            continue;
        }
        // Opening tag up to `>`, tracking quotes.
        let mut j = i + 7;
        let mut quote: Option<u8> = None;
        let mut gt = None;
        while j < bytes.len() {
            let c = bytes[j];
            match quote {
                Some(q) => {
                    if c == q {
                        quote = None;
                    }
                }
                None => {
                    if c == b'"' || c == b'\'' {
                        quote = Some(c);
                    } else if c == b'>' {
                        gt = Some(j);
                        break;
                    }
                }
            }
            j += 1;
        }
        let Some(gt) = gt else { break };
        let content_start = gt + 1;
        let content_end = source[content_start..]
            .find("</script>")
            .map(|rel| content_start + rel)
            .unwrap_or(source.len());
        out.push(ScriptBlock {
            tag_start: i,
            content_start,
            content_end,
            open_tag_attrs: source[i + 7..gt].to_string(),
        });
        i = content_end;
    }
    out
}

/// The `lang` attribute value of an opening-tag attribute string, lowercased.
pub(crate) fn attr_value(open_tag_attrs: &str, name: &str) -> Option<String> {
    let bytes = open_tag_attrs.as_bytes();
    let nb = name.as_bytes();
    let mut i = 0;
    while i + nb.len() <= bytes.len() {
        if &bytes[i..i + nb.len()] == nb {
            let before_ok = i == 0 || bytes[i - 1].is_ascii_whitespace();
            let mut k = i + nb.len();
            while k < bytes.len() && bytes[k].is_ascii_whitespace() {
                k += 1;
            }
            if before_ok && k < bytes.len() && bytes[k] == b'=' {
                k += 1;
                while k < bytes.len() && bytes[k].is_ascii_whitespace() {
                    k += 1;
                }
                if k >= bytes.len() {
                    return Some(String::new());
                }
                let q = bytes[k];
                if q == b'"' || q == b'\'' {
                    let start = k + 1;
                    let mut e = start;
                    while e < bytes.len() && bytes[e] != q {
                        e += 1;
                    }
                    return Some(open_tag_attrs[start..e].to_string());
                }
                let start = k;
                let mut e = start;
                while e < bytes.len() && !bytes[e].is_ascii_whitespace() {
                    e += 1;
                }
                return Some(open_tag_attrs[start..e].to_string());
            }
        }
        i += 1;
    }
    None
}

/// Whether an opening-tag attribute string has a (valueless or any) attribute
/// named `name` at an attribute-name boundary.
pub(crate) fn has_attr(open_tag_attrs: &str, name: &str) -> bool {
    let bytes = open_tag_attrs.as_bytes();
    let nb = name.as_bytes();
    let mut i = 0;
    while i + nb.len() <= bytes.len() {
        if &bytes[i..i + nb.len()] == nb {
            let before_ok = i == 0 || bytes[i - 1].is_ascii_whitespace();
            let after = bytes.get(i + nb.len()).copied();
            let after_ok = matches!(after, None | Some(b'='))
                || after.is_some_and(|c| c.is_ascii_whitespace());
            if before_ok && after_ok {
                return true;
            }
        }
        i += 1;
    }
    false
}

/// Whether any `<script>` block declares `lang="ts"` / `lang="typescript"`.
pub(crate) fn script_is_ts(source: &str) -> bool {
    script_blocks(source).iter().any(|b| {
        attr_value(&b.open_tag_attrs, "lang")
            .map(|l| {
                let l = l.to_ascii_lowercase();
                l == "ts" || l == "typescript"
            })
            .unwrap_or(false)
    })
}

/// Whether any `<script>` block declares a TS `interface <name>` or
/// `type <name>` at a keyword boundary within its content.
pub(crate) fn script_declares_type(source: &str, name: &str) -> bool {
    script_blocks(source)
        .iter()
        .any(|b| declares_type_in(&source[b.content_start..b.content_end], name))
}

fn declares_type_in(content: &str, name: &str) -> bool {
    for kw in ["interface", "type"] {
        let mut from = 0;
        while let Some(rel) = content[from..].find(kw) {
            let kw_start = from + rel;
            let kw_end = kw_start + kw.len();
            let before_ok = kw_start == 0 || !is_ident_byte(content.as_bytes()[kw_start - 1]);
            // Require whitespace then the name then a non-identifier boundary.
            let rest = &content[kw_end..];
            let trimmed = rest.trim_start();
            let consumed = rest.len() - trimmed.len();
            if before_ok
                && consumed > 0
                && let Some(after_name) = trimmed.strip_prefix(name)
                && after_name
                    .as_bytes()
                    .first()
                    .is_none_or(|&c| !is_ident_byte(c))
            {
                return true;
            }
            from = kw_end;
        }
    }
    false
}

fn is_ident_byte(c: u8) -> bool {
    c == b'_' || c == b'$' || c.is_ascii_alphanumeric()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detects_ts_script() {
        assert!(script_is_ts("<script lang=\"ts\">\n</script>"));
        assert!(script_is_ts("<script lang='typescript'></script>"));
        assert!(!script_is_ts("<script>\n</script>"));
        assert!(!script_is_ts("<script lang=\"js\"></script>"));
    }

    #[test]
    fn detects_type_declarations() {
        assert!(script_declares_type(
            "<script lang=\"ts\">\ninterface $$Slots { a: 1 }\n</script>",
            "$$Slots"
        ));
        assert!(script_declares_type(
            "<script lang=\"ts\">\ntype $$Slots = {}\n</script>",
            "$$Slots"
        ));
        // Not declared.
        assert!(!script_declares_type(
            "<script lang=\"ts\">\nlet x = 1;\n</script>",
            "$$Slots"
        ));
        // Substring must not match (`$$SlotsX`).
        assert!(!script_declares_type(
            "<script lang=\"ts\">\ninterface $$SlotsX {}\n</script>",
            "$$Slots"
        ));
        // Declaration in the template (outside <script>) doesn't count.
        assert!(!script_declares_type("interface $$Slots {}", "$$Slots"));
    }

    #[test]
    fn detects_script_attr() {
        let blocks = script_blocks("<script lang=\"ts\" strictEvents>\n</script>");
        assert!(has_attr(&blocks[0].open_tag_attrs, "strictEvents"));
        let blocks2 = script_blocks("<script lang=\"ts\">\n</script>");
        assert!(!has_attr(&blocks2[0].open_tag_attrs, "strictEvents"));
    }
}
