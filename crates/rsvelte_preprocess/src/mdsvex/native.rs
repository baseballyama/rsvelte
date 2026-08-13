//! Native building blocks for the mdsvex transform.
//!
//! The full mdsvex pipeline also accepts arbitrary JavaScript unified plugins,
//! which remain on the official-package fallback path. This module contains
//! only deterministic standard-transform pieces that can be differentially
//! verified against mdsvex fixtures.

use comrak::{Options, markdown_to_html};
use serde_json::Value;

/// The deterministic result of the standard MDsveX Markdown and frontmatter
/// stages.
#[derive(Debug, PartialEq)]
pub struct StandardResult {
    /// Svelte source emitted by the standard transform.
    pub code: String,
    /// The parsed YAML frontmatter, when present.
    pub data: Option<Value>,
}

/// Render the standard Markdown and YAML-frontmatter portion of MDsveX.
///
/// This deliberately excludes option callbacks, layouts and Prism highlighting:
/// callers with those options must use the official-package fallback until their
/// native equivalents are complete.
#[must_use]
pub fn render_standard(source: &str) -> StandardResult {
    let (frontmatter, markdown) = split_frontmatter(source);
    let data: Option<Value> = frontmatter.and_then(|yaml| serde_yaml::from_str(yaml).ok());
    let mut code = render_markdown(markdown);

    if let Some(metadata) = &data
        && let Some(object) = metadata.as_object()
    {
        let serialized = serde_json::to_string(metadata)
            .expect("serde_json::Value always serializes")
            .replace("<script", "<\"+\"script")
            .replace("</script", "<\"+\"/script")
            .replace("<style", "<\"+\"style")
            .replace("</style", "<\"+\"/style");
        let bindings = object
            .keys()
            .map(|key| {
                if key.contains('-') {
                    format!("'{key}': {}", key.replace('-', "_"))
                } else {
                    key.to_owned()
                }
            })
            .collect::<Vec<_>>()
            .join(", ");
        code = format!(
            "<script context=\"module\">\n\texport const metadata = {serialized};\n\tconst {{ {bindings} }} = metadata;\n</script>\n{code}"
        );
    }

    StandardResult { code, data }
}

/// Render the CommonMark/GFM portion of mdsvex's standard pipeline.
///
/// Callers must run the mdsvex-specific Svelte, frontmatter, highlighting and
/// layout stages around this renderer before exposing it as an mdsvex result.
#[must_use]
pub fn render_markdown(source: &str) -> String {
    let (preamble, source) = split_leading_script(source);
    let mut options = Options::default();
    options.parse.smart = true;
    options.render.r#unsafe = true;
    options.extension.strikethrough = true;
    options.extension.table = true;
    options.extension.autolink = true;
    options.extension.tasklist = true;
    let html = format!(
        "\n{}",
        restore_svelte_urls(escape_code(markdown_to_html(source, &options)))
    );
    preamble.map_or(html.clone(), |script| format!("{script}\n\n{html}"))
}

fn escape_code(mut html: String) -> String {
    let mut cursor = 0;
    while let Some(relative_open) = html[cursor..].find("<code") {
        let open = cursor + relative_open;
        let Some(relative_body) = html[open..].find('>') else {
            break;
        };
        let body = open + relative_body + 1;
        let Some(relative_close) = html[body..].find("</code>") else {
            break;
        };
        let close = body + relative_close;
        let escaped = html[body..close]
            .replace("&amp;", "&")
            .replace('{', "&#123;")
            .replace('}', "&#125;");
        html.replace_range(body..close, &escaped);
        cursor = body + escaped.len() + "</code>".len();
    }
    html
}

fn restore_svelte_urls(mut html: String) -> String {
    let mut cursor = 0;
    while let Some(relative_open) = html[cursor..].find('<') {
        let open = cursor + relative_open;
        let Some(relative_end) = html[open..].find('>') else {
            break;
        };
        let end = open + relative_end + 1;
        if html[open..end].starts_with("<a ") || html[open..end].starts_with("<img ") {
            let restored = html[open..end].replace("%7B", "{").replace("%7D", "}");
            html.replace_range(open..end, &restored);
            cursor = open + restored.len();
        } else {
            cursor = end;
        }
    }
    html
}

fn split_frontmatter(source: &str) -> (Option<&str>, &str) {
    let Some(rest) = source.strip_prefix("---\n") else {
        return (None, source);
    };
    let Some(end) = rest.find("\n---\n") else {
        return (None, source);
    };
    let yaml = &rest[..end];
    let markdown = &rest[end + "\n---\n".len()..];
    (Some(yaml), markdown)
}

fn split_leading_script(source: &str) -> (Option<&str>, &str) {
    if !source.starts_with("<script") {
        return (None, source);
    }
    let Some(end) = source.find("</script>") else {
        return (None, source);
    };
    let end = end + "</script>".len();
    (Some(&source[..end]), source[end..].trim_start_matches('\n'))
}
