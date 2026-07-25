//! Extract the `<!-- @component … -->` doc comment — mirrors
//! `svelte2tsx/nodes/ComponentDocumentation.ts`.

/// Extract `@component` documentation from HTML comments in the template.
///
/// Looks for comments like `<!-- @component This is documentation -->` and
/// converts them to JSDoc format: `/** This is documentation */`.
///
/// Also handles multiline comments:
/// ```html
/// <!--
///   @component
///   Multi-line documentation
/// -->
/// ```
pub(crate) fn extract_component_documentation(
    fragment: &crate::ast::template::Fragment,
) -> Option<String> {
    use crate::ast::template::TemplateNode;

    for node in &fragment.nodes {
        if let TemplateNode::Comment(comment) = node {
            let data = comment.data.as_str().trim();
            if data.starts_with("@component") {
                // Extract the documentation text after @component
                let after_tag = data.strip_prefix("@component").unwrap();

                // Official trims the whole doc *before* deciding single- vs
                // multi-line (`componentDocumentation = data.replace('@component',
                // '').trim()`, then `if (!doc.includes('\n'))`). So a comment
                // whose only newlines surround a single line of text (e.g.
                // `<!--@component\nText\n-->`) is emitted as a single-line
                // `/** Text */`. Check the trimmed content for newlines.
                // Mirror official `ComponentDocumentation`: the whole text is
                // trimmed first (`data.replace('@component','').trim()`), then
                // single- vs multi-line is decided on the trimmed content.
                let content = after_tag.trim();
                if content.is_empty() {
                    return Some("/** */".to_string());
                }

                if content.contains('\n') {
                    // Official applies `dedent-js` then maps each line to
                    // ` *${line ? ` ${line}` : ''}`. dedent-js computes the
                    // minimum indentation among lines that FOLLOW a newline and
                    // carry at least one leading whitespace char (the regex
                    // `\n[\t ]+`), i.e. it ignores the first line and ignores
                    // zero-indent lines, then strips exactly that many leading
                    // whitespace chars from each subsequent line that has them.
                    let lines: Vec<&str> = content.split('\n').collect();
                    let ws_len = |l: &str| l.len() - l.trim_start_matches([' ', '\t']).len();
                    let size = lines[1..]
                        .iter()
                        .map(|l| ws_len(l))
                        .filter(|&n| n > 0)
                        .min()
                        .unwrap_or(0);

                    let mut result = String::from("/**\n");
                    for (i, line) in lines.iter().enumerate() {
                        // First line is never dedented; subsequent lines lose
                        // exactly `size` leading whitespace chars, but only when
                        // they actually have at least that many (regex semantics).
                        let dedented: &str = if i > 0 && size > 0 && ws_len(line) >= size {
                            &line[size..]
                        } else {
                            line
                        };
                        if dedented.is_empty() {
                            result.push_str(" *\n");
                        } else {
                            result.push_str(" * ");
                            result.push_str(dedented);
                            result.push('\n');
                        }
                    }
                    result.push_str(" */");
                    return Some(result);
                } else {
                    return Some(format!("/** {} */", content));
                }
            }
        }
    }

    None
}
