//! Native building blocks for the mdsvex transform.
//!
//! The full mdsvex pipeline also accepts arbitrary JavaScript unified plugins,
//! which remain on the official-package fallback path. This module contains
//! only deterministic standard-transform pieces that can be differentially
//! verified against mdsvex fixtures.

use comrak::{Options, markdown_to_html};

/// Render the CommonMark/GFM portion of mdsvex's standard pipeline.
///
/// Callers must run the mdsvex-specific Svelte, frontmatter, highlighting and
/// layout stages around this renderer before exposing it as an mdsvex result.
#[must_use]
pub fn render_markdown(source: &str) -> String {
    let mut options = Options::default();
    options.parse.smart = true;
    options.render.r#unsafe = true;
    options.extension.strikethrough = true;
    options.extension.table = true;
    options.extension.autolink = true;
    options.extension.tasklist = true;
    format!("\n{}", escape_code(markdown_to_html(source, &options)))
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
