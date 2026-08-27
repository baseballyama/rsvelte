//! Carry a standalone comment at the end of `<script module>` to the generated
//! component function's parameter list.
//!
//! Upstream prints the synthetic module Program and the component with one
//! esrap comment cursor. A located body inside the module can revive that
//! cursor, leaving an EOF comment pending until the component body is opened;
//! by then the generated parameters have already been printed, so the comment
//! becomes trailing trivia on the final parameter. rsvelte transforms the
//! module as an isolated text chunk, so reproduce that cross-chunk cursor
//! result explicitly.

use crate::compiler::phases::phase3_transform::js_ast::codegen::SourceMapping;

use super::js_scan;

pub(crate) fn rehome(
    code: String,
    module_source: &str,
    component_name: &str,
    mappings: &mut [SourceMapping],
) -> String {
    let Some(comment) = standalone_tail_comment(module_source) else {
        return code;
    };
    let needle = format!("function {component_name}(");
    let Some(signature) = code.find(&needle) else {
        return code;
    };
    let open = signature + needle.len() - 1;
    let Some(relative_close) = code[open + 1..].find(')') else {
        return code;
    };
    let close = open + 1 + relative_close;
    let params = code[open + 1..close].trim();
    if params.is_empty() || code[open + 1..close].contains(comment) {
        return code;
    }

    let signature_line = code[..open].bytes().filter(|&byte| byte == b'\n').count() as u32;
    let line_start = code[..open].rfind('\n').map_or(0, |at| at + 1);
    let open_col = utf16_len(&code[line_start..open]);
    let close_col = utf16_len(&code[line_start..close]);
    let mut out = code;

    if comment.starts_with("//") {
        let replacement = format!("\n\t{params}, {comment}\n");
        out.replace_range(open + 1..close, &replacement);
        for mapping in mappings {
            if mapping.gen_line > signature_line {
                mapping.gen_line += 2;
            } else if mapping.gen_line == signature_line && mapping.gen_col > open_col {
                if mapping.gen_col < close_col {
                    mapping.gen_line += 1;
                    mapping.gen_col = 1 + mapping.gen_col - open_col - 1;
                } else {
                    mapping.gen_line += 2;
                    mapping.gen_col -= close_col;
                }
            }
        }
    } else {
        let insertion = format!(" {comment}");
        out.insert_str(close, &insertion);
        let added = utf16_len(&insertion);
        for mapping in mappings {
            if mapping.gen_line == signature_line && mapping.gen_col >= close_col {
                mapping.gen_col += added;
            }
        }
    }
    out
}

fn standalone_tail_comment(source: &str) -> Option<&str> {
    let ranges = js_scan::comment_ranges(source.as_bytes());
    let &(start, end) = ranges.last()?;
    if !source[end..].trim().is_empty() {
        return None;
    }
    let line_start = source[..start].rfind('\n').map_or(0, |at| at + 1);
    if !source[line_start..start].trim().is_empty() {
        return None;
    }
    // A comment-only module has no later located component-script body to
    // revive the cursor from, and upstream drops it.
    let prefix = &source[..start];
    let has_code =
        js_scan::code_bytes(prefix.as_bytes()).any(|(_, byte)| !byte.is_ascii_whitespace());
    has_code.then(|| source[start..end].trim())
}

fn utf16_len(text: &str) -> u32 {
    text.encode_utf16().count() as u32
}

#[cfg(test)]
mod tests {
    use super::rehome;

    #[test]
    fn block_comment_moves_to_the_final_parameter() {
        let code = "export default function App($$anchor, $$props) {\n\treturn 1;\n}".to_string();
        let out = rehome(code, "export const x = 1;\n/* c */\n", "App", &mut []);
        assert!(out.contains("App($$anchor, $$props /* c */)"), "{out}");
    }

    #[test]
    fn line_comment_makes_the_parameter_list_multiline() {
        let code = "export default function App($$anchor) {\n\treturn 1;\n}".to_string();
        let out = rehome(code, "export const x = 1;\n// c\n", "App", &mut []);
        assert!(out.contains("App(\n\t$$anchor, // c\n)"), "{out}");
    }

    #[test]
    fn inline_and_comment_only_tails_stay_untouched() {
        let code = "export default function App($$anchor) {}".to_string();
        assert_eq!(
            rehome(code.clone(), "export const x = 1; // c", "App", &mut []),
            code
        );
        assert_eq!(rehome(code.clone(), "// c\n", "App", &mut []), code);
    }
}
