//! Raw-source scanners for tag positions that the AST does not record.

use crate::ast::template::Attribute;
use crate::svelte2tsx::template::attributes::attribute_end;

/// Find the end of the opening tag (position after the closing `>`).
///
/// Scans from the last retained attribute (or the tag name when there are no
/// attributes) for the first `>` that is not inside a string or expression.
/// Returns the position after the `>`.
pub(crate) fn find_opening_tag_end(
    source: &str,
    element_start: u32,
    element_end: u32,
    tag_name: &str,
    attributes: &[Attribute],
) -> u32 {
    let bytes = source.as_bytes();
    let tag_name_end = element_start.saturating_add(1 + tag_name.len() as u32);
    let scan_start = attributes.last().map_or(tag_name_end, attribute_end);
    let scan_start = if scan_start >= tag_name_end && scan_start <= element_end {
        scan_start
    } else {
        element_start
    };
    let start = scan_start as usize;
    let end = element_end as usize;
    let mut i = start;
    let mut in_string = None::<u8>; // tracks quote char
    let mut brace_depth = 0u32;

    while i < end {
        let ch = bytes[i];

        match in_string {
            Some(quote) => {
                if ch == quote && (i == 0 || bytes[i - 1] != b'\\') {
                    in_string = None;
                }
            }
            None => {
                // Inside an expression value (`{ … }`), skip JS comments so a
                // quote within them (`// don't` / `/* don't */`) doesn't start a
                // fake string and throw off the brace tracking — which would make
                // this return the wrong `>` and overwrite past the tag.
                if brace_depth > 0 && ch == b'/' && i + 1 < end {
                    if bytes[i + 1] == b'/' {
                        while i < end && bytes[i] != b'\n' {
                            i += 1;
                        }
                        continue;
                    } else if bytes[i + 1] == b'*' {
                        i += 2;
                        while i + 1 < end && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                            i += 1;
                        }
                        i += 2; // skip the closing `*/`
                        continue;
                    }
                }
                if ch == b'"' || ch == b'\'' || ch == b'`' {
                    in_string = Some(ch);
                } else if ch == b'{' {
                    brace_depth += 1;
                } else if ch == b'}' {
                    brace_depth = brace_depth.saturating_sub(1);
                } else if ch == b'>' && brace_depth == 0 {
                    return (i + 1) as u32;
                }
            }
        }
        i += 1;
    }

    // Fallback: return element end
    element_end
}

/// Find the start of the closing tag.
///
/// Scans backwards from `end` looking for `</`.
/// True when the `</…>` at `closing_tag_start` is the closing tag for an
/// element named `name` (case-insensitive). Used to distinguish a real closing
/// tag from a child's closing tag wrongly matched on an auto-closed element.
pub(crate) fn closing_tag_name_matches(source: &str, closing_tag_start: u32, name: &str) -> bool {
    let rest = &source[closing_tag_start as usize..];
    let Some(after) = rest.strip_prefix("</") else {
        return false;
    };
    // Read the tag-name characters following `</`.
    let tag: String = after
        .chars()
        .take_while(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == ':' || *c == '.')
        .collect();
    tag.eq_ignore_ascii_case(name)
}

pub(crate) fn find_closing_tag_start(source: &str, end: u32) -> u32 {
    let bytes = source.as_bytes();
    let end = end as usize;

    // Check if this is a self-closing tag (ends with `/>`)
    if end >= 2 && bytes[end - 2] == b'/' && bytes[end - 1] == b'>' {
        return end as u32; // Return end to signal self-closing
    }

    // Scan backwards for `</`
    let mut i = end;
    while i >= 2 {
        i -= 1;
        if bytes[i] == b'<' && i + 1 < end && bytes[i + 1] == b'/' {
            return i as u32;
        }
    }

    end as u32
}

#[cfg(test)]
mod tests {
    use super::find_opening_tag_end;
    use crate::ast::template::TemplateNode;
    use crate::compiler::phases::phase1_parse::{self, ParseOptions};

    fn opening_tag_end(source: &str) -> u32 {
        let ast = phase1_parse::parse_script_ts(
            source,
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .expect("source should parse");
        let node = ast.fragment.nodes.first().expect("element");

        macro_rules! find_for {
            ($element:expr) => {
                find_opening_tag_end(
                    source,
                    $element.start,
                    $element.end,
                    $element.name.as_str(),
                    &$element.attributes,
                )
            };
        }

        match node {
            TemplateNode::RegularElement(element) => find_for!(element),
            TemplateNode::Component(element) => find_for!(element),
            TemplateNode::TitleElement(element) => find_for!(element),
            TemplateNode::SlotElement(element) => find_for!(element),
            TemplateNode::SvelteBody(element)
            | TemplateNode::SvelteDocument(element)
            | TemplateNode::SvelteFragment(element)
            | TemplateNode::SvelteBoundary(element)
            | TemplateNode::SvelteHead(element)
            | TemplateNode::SvelteSelf(element)
            | TemplateNode::SvelteWindow(element) => find_for!(element),
            TemplateNode::SvelteComponent(element) => find_for!(element),
            TemplateNode::SvelteElement(element) => find_for!(element),
            other => panic!("expected element, got {other:?}"),
        }
    }

    fn expected_opening_tag_end(source: &str) -> u32 {
        let before_close = source.rfind("</").unwrap_or(source.len());
        (source[..before_close].rfind('>').expect("opening tag") + 1) as u32
    }

    fn assert_opening_tag_end(source: &str) {
        assert_eq!(
            opening_tag_end(source),
            expected_opening_tag_end(source),
            "{source}"
        );
    }

    #[test]
    fn starts_after_every_retained_attribute_kind() {
        for source in [
            "<div></div>",
            "<div disabled></div>",
            r#"<div title="a > b"></div>"#,
            "<div title='a > b'></div>",
            r#"<div title="before {a > b} after"></div>"#,
            "<div data={a > b}></div>",
            "<div data={{ nested: a > b }}></div>",
            r#"<div data={'a \\\\' > b ? a : b}></div>"#,
            "<div data={`value ${a > b}`}></div>",
            "<div data={a /* > } ' */ > b}></div>",
            "<div data={/}/.test(value) && a > b}></div>",
            "<div {...(a > b ? left : right)}></div>",
            "<div {@attach node => node.value > 0}></div>",
            "<input bind:value={a > b ? a : b}>",
            "<div on:click={() => a > b}></div>",
            "<div class:active={a > b}></div>",
            "<div style:color={a > b ? 'red' : 'blue'}></div>",
            "<div transition:fade={{ duration: a > b ? a : b }}></div>",
            "<div animate:flip={{ duration: a > b ? a : b }}></div>",
            "<div use:action={a > b ? left : right}></div>",
            "<Component let:item={a > b ? a : b}></Component>",
            "<Component prop={a > b ? a : b} />",
            r#"<div title="日本語 > 終"></div>"#,
        ] {
            assert_opening_tag_end(source);
        }
    }

    #[test]
    fn skips_comments_before_the_last_attribute_and_scans_trailing_comments() {
        for source in [
            r#"<div first /* > " ' { } */ second></div>"#,
            "<div first // > \" ' { }\n second></div>",
            "<div first /* trailing comment */ ></div>",
            "<div first // trailing comment\n></div>",
        ] {
            assert_opening_tag_end(source);
        }
    }

    #[test]
    fn filtered_this_attribute_remains_in_the_scanned_suffix() {
        for source in [
            "<svelte:component this={Components[a > b ? 0 : 1]}></svelte:component>",
            "<svelte:component foo this={Components[a > b ? 0 : 1]}></svelte:component>",
            "<svelte:component this={Components[a > b ? 0 : 1]} foo></svelte:component>",
            r#"<svelte:element this="section"></svelte:element>"#,
            "<svelte:element foo this={a > b ? 'section' : 'div'}></svelte:element>",
            "<svelte:element this={a > b ? 'section' : 'div'} foo></svelte:element>",
        ] {
            assert_opening_tag_end(source);
        }
    }

    #[test]
    fn supports_each_element_handler_shape() {
        for source in [
            r#"<div data-value=">"></div>"#,
            r#"<Component data-value=">"></Component>"#,
            r#"<title data-value=">"></title>"#,
            r#"<slot data-value=">"></slot>"#,
            r#"<svelte:body data-value=">"></svelte:body>"#,
            r#"<svelte:self data-value=">"></svelte:self>"#,
            r#"<svelte:component this={Component} data-value=">"></svelte:component>"#,
            r#"<svelte:element this="div" data-value=">"></svelte:element>"#,
        ] {
            assert_opening_tag_end(source);
        }
    }

    #[test]
    fn malformed_openers_are_rejected_before_the_source_scan() {
        for source in [
            r#"<div title="unterminated"#,
            "<div data={unterminated",
            "<div disabled",
        ] {
            assert!(
                phase1_parse::parse_script_ts(
                    source,
                    ParseOptions {
                        modern: true,
                        ..Default::default()
                    },
                )
                .is_err(),
                "{source}"
            );
        }
    }
}
