//! ESTree `loc` values for sources containing a line break other than `\n`.
//!
//! Upstream hands acorn a precomputed `startLocation` only while the template
//! breaks lines on `\n` alone (`has_lf_line_breaks_only` in `phases/1-parse/acorn.js`).
//! Otherwise acorn counts lines itself, and it also breaks on a bare `\r`,
//! ` ` and ` `. The rest of the parser builds `loc` from a `\n`-only
//! line table, so this pass re-derives every JavaScript `loc` point the way acorn
//! would have, on the public JSON after its offsets are UTF-16.

use serde_json::Value;

/// Whether acorn's line numbering can differ from a `\n`-only locator.
pub fn has_non_lf_line_breaks(source: &str) -> bool {
    let bytes = source.as_bytes();
    bytes.iter().enumerate().any(|(i, &b)| {
        (b == b'\r' && bytes.get(i + 1) != Some(&b'\n'))
            || (b == 0xE2
                && bytes.get(i + 1) == Some(&0x80)
                && matches!(bytes.get(i + 2), Some(0xA8 | 0xA9)))
    })
}

/// Rewrite the `loc` points of a public (UTF-16 offset) parse result.
pub fn apply_acorn_line_terminators(value: &mut Value, source: &str) {
    if !has_non_lf_line_breaks(source) {
        return;
    }
    let lines = AcornLines::new(source);
    let Value::Object(root) = value else {
        return;
    };

    let mut script_ranges = Vec::new();
    for key in ["instance", "module"] {
        let Some(Value::Object(script)) = root.get_mut(key) else {
            continue;
        };
        let Some(Value::Object(content)) = script.get_mut("content") else {
            continue;
        };
        let Some(start) = number(content.get("start")) else {
            continue;
        };
        let end = number(content.get("end")).unwrap_or(start);
        script_ranges.push((start, end));
        // The `Program` itself is positioned with the `\n` locator upstream.
        let ctx = lines.script_context(start);
        for (field, child) in content.iter_mut() {
            if field != "loc" {
                rewrite_subtree(child, &lines, &ctx);
            }
        }
    }

    let mut template_roots = Vec::new();
    for (key, child) in root.iter_mut() {
        match key.as_str() {
            "instance" | "module" | "comments" | "_comments" => {}
            _ => find_template_roots(child, &lines, &mut template_roots),
        }
    }

    for key in ["comments", "_comments"] {
        let Some(Value::Array(comments)) = root.get_mut(key) else {
            continue;
        };
        for comment in comments {
            let Some(start) = number(comment.get("start")) else {
                continue;
            };
            let ctx = if script_ranges.iter().any(|&(s, e)| s <= start && start <= e) {
                lines.script_context(script_start_for(&script_ranges, start))
            } else {
                let parse_start = template_roots
                    .iter()
                    .filter(|&&(s, e)| s <= start && start <= e)
                    .map(|&(s, _)| s)
                    .max()
                    .unwrap_or(start);
                lines.template_context(parse_start)
            };
            rewrite_loc(comment, &lines, &ctx);
        }
    }
}

fn script_start_for(ranges: &[(u32, u32)], pos: u32) -> u32 {
    ranges
        .iter()
        .find(|&&(s, e)| s <= pos && pos <= e)
        .map_or(pos, |&(s, _)| s)
}

fn number(value: Option<&Value>) -> Option<u32> {
    value.and_then(Value::as_u64).map(|n| n as u32)
}

fn has_loc(value: &Value) -> bool {
    matches!(value, Value::Object(map) if matches!(map.get("loc"), Some(Value::Object(_))))
}

/// Each JavaScript subtree reached from the Svelte layer was one acorn parse
/// starting at (or before) its first node; sibling nodes in one array, like
/// snippet parameters, share a parse.
fn find_template_roots(value: &mut Value, lines: &AcornLines, roots: &mut Vec<(u32, u32)>) {
    match value {
        Value::Array(items) if !items.is_empty() && items.iter().all(has_loc) => {
            let start = items.iter().filter_map(parse_start).min();
            let end = items.iter().filter_map(|v| number(v.get("end"))).max();
            if let (Some(start), Some(end)) = (start, end) {
                roots.push((start, end));
                let ctx = lines.template_context(start);
                for item in items {
                    rewrite_subtree(item, lines, &ctx);
                }
            }
        }
        Value::Array(items) => {
            for item in items {
                find_template_roots(item, lines, roots);
            }
        }
        Value::Object(_) if has_loc(value) => {
            if let (Some(start), Some(end)) = (parse_start(value), number(value.get("end"))) {
                roots.push((start, end));
                let ctx = lines.template_context(start);
                rewrite_subtree(value, lines, &ctx);
            }
        }
        Value::Object(map) => {
            for child in map.values_mut() {
                find_template_roots(child, lines, roots);
            }
        }
        _ => {}
    }
}

fn parse_start(node: &Value) -> Option<u32> {
    let start = number(node.get("start"))?;
    let leading = node
        .get("leadingComments")
        .and_then(Value::as_array)
        .and_then(|comments| comments.iter().filter_map(|c| number(c.get("start"))).min());
    Some(leading.map_or(start, |l| l.min(start)))
}

fn rewrite_subtree(value: &mut Value, lines: &AcornLines, ctx: &Context) {
    match value {
        Value::Object(map) => {
            for (key, child) in map.iter_mut() {
                if key == "loc" {
                    rewrite_point_pair(child, lines, ctx);
                } else {
                    rewrite_subtree(child, lines, ctx);
                }
            }
        }
        Value::Array(items) => {
            for item in items {
                rewrite_subtree(item, lines, ctx);
            }
        }
        _ => {}
    }
}

fn rewrite_loc(node: &mut Value, lines: &AcornLines, ctx: &Context) {
    if let Some(loc) = node.get_mut("loc") {
        rewrite_point_pair(loc, lines, ctx);
    }
}

fn rewrite_point_pair(loc: &mut Value, lines: &AcornLines, ctx: &Context) {
    let Value::Object(loc) = loc else {
        return;
    };
    // `character` marks a point upstream took from its `\n` locator, not from acorn.
    if loc.values().any(|point| point.get("character").is_some()) {
        return;
    }
    for key in ["start", "end"] {
        let Some(Value::Object(point)) = loc.get_mut(key) else {
            continue;
        };
        let (Some(line), Some(column)) = (number(point.get("line")), number(point.get("column")))
        else {
            continue;
        };
        // Recover the offset from the point itself, not from the node's
        // `start`/`end`, which upstream sometimes widens without touching `loc`.
        let Some(offset) = lines.lf_offset(line, column) else {
            continue;
        };
        let (line, column) = lines.acorn_position(offset, ctx);
        point.insert("line".to_string(), Value::from(line));
        point.insert("column".to_string(), Value::from(column));
    }
}

/// Where one acorn parse started and how it numbered the lines before that.
struct Context {
    start: u32,
    line_start: u32,
    base_line: u32,
}

struct AcornLines {
    /// UTF-16 offset of each `\n`-line start (the upstream locator's lines).
    lf_starts: Vec<u32>,
    /// `(start, end)` of every ECMAScript line terminator, `\r\n` counted once.
    breaks: Vec<(u32, u32)>,
}

impl AcornLines {
    fn new(source: &str) -> Self {
        let units: Vec<u16> = source.encode_utf16().collect();
        let mut lf_starts = vec![0];
        let mut breaks = Vec::new();
        let mut i = 0;
        while i < units.len() {
            let pos = i as u32;
            match units[i] {
                0x0D if units.get(i + 1) == Some(&0x0A) => {
                    breaks.push((pos, pos + 2));
                    lf_starts.push(pos + 2);
                    i += 2;
                    continue;
                }
                0x0A => {
                    breaks.push((pos, pos + 1));
                    lf_starts.push(pos + 1);
                }
                0x0D | 0x2028 | 0x2029 => breaks.push((pos, pos + 1)),
                _ => {}
            }
            i += 1;
        }
        Self { lf_starts, breaks }
    }

    fn lf_offset(&self, line: u32, column: u32) -> Option<u32> {
        let start = *self.lf_starts.get((line as usize).checked_sub(1)?)?;
        Some(start + column)
    }

    fn last_lf_line_start(&self, pos: u32) -> u32 {
        let idx = self.lf_starts.partition_point(|&s| s <= pos);
        // `lastIndexOf("\n", pos - 1) + 1`: a line starting exactly at `pos`
        // begins at a `\n` before `pos`, so it still counts.
        self.lf_starts[idx.saturating_sub(1)]
    }

    /// `acorn.parseExpressionAt(template, start)` without `startLocation`.
    fn template_context(&self, start: u32) -> Context {
        let line_start = self.last_lf_line_start(start);
        let before = self.breaks.partition_point(|&(_, end)| end <= line_start) as u32;
        Context {
            start,
            line_start,
            base_line: before + 1,
        }
    }

    /// `acorn.parse` over the template prefix blanked to spaces except `\n`.
    fn script_context(&self, start: u32) -> Context {
        let line_start = self.last_lf_line_start(start);
        let before = self.lf_starts.partition_point(|&s| s <= line_start) as u32 - 1;
        Context {
            start,
            line_start,
            base_line: before + 1,
        }
    }

    fn acorn_position(&self, offset: u32, ctx: &Context) -> (u32, u32) {
        let first = self.breaks.partition_point(|&(s, _)| s < ctx.start);
        let last = self.breaks.partition_point(|&(_, end)| end <= offset);
        if last <= first {
            return (ctx.base_line, offset.saturating_sub(ctx.line_start));
        }
        let crossed = (last - first) as u32;
        (ctx.base_line + crossed, offset - self.breaks[last - 1].1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::legacy::{Utf8ToUtf16, convert_positions_to_utf16, convert_to_legacy};
    use crate::compiler::phases::phase1_parse::{ParseOptions, parse};

    const SOURCE: &str = "<script>\n\tconst a = 'x\u{2028}y';\n\tconst b = 1;\n</script>\n<p>{a}{'q\u{2028}r'} {b}</p>\r{b + 1}\n";

    fn loc(node: &Value) -> [u64; 4] {
        let point = |key: &str| {
            let p = &node["loc"][key];
            (p["line"].as_u64().unwrap(), p["column"].as_u64().unwrap())
        };
        let ((a, b), (c, d)) = (point("start"), point("end"));
        [a, b, c, d]
    }

    fn check(instance_body: &Value, paragraph: &Value, tail: &Value) {
        // Expected values are the official `parse()` output for SOURCE.
        assert_eq!(
            loc(&instance_body[0]["declarations"][0]["init"]),
            [2, 11, 3, 2]
        );
        assert_eq!(loc(&instance_body[1]), [4, 1, 4, 13]);
        assert_eq!(loc(&paragraph[0]), [6, 4, 6, 5]);
        assert_eq!(loc(&paragraph[1]), [6, 7, 7, 2]);
        assert_eq!(loc(&paragraph[2]), [6, 15, 6, 16]);
        assert_eq!(loc(tail), [6, 23, 6, 28]);
        assert_eq!(loc(&tail["right"]), [6, 27, 6, 28]);
    }

    #[test]
    fn modern_locs_follow_acorn_line_terminators() {
        let ast = parse(
            SOURCE,
            &crate::Allocator::default(),
            ParseOptions::public_api(),
        )
        .unwrap();
        let mut value =
            crate::ast::arena::with_serialize_arena(&ast.arena, || serde_json::to_value(&ast))
                .unwrap();
        convert_positions_to_utf16(&mut value, &Utf8ToUtf16::new(SOURCE));
        apply_acorn_line_terminators(&mut value, SOURCE);

        let nodes = &value["fragment"]["nodes"];
        let paragraph: Vec<Value> = nodes[1]["fragment"]["nodes"]
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|n| n.get("expression").cloned())
            .collect();
        check(
            &value["instance"]["content"]["body"],
            &Value::from(paragraph),
            &nodes[3]["expression"],
        );
    }

    #[test]
    fn legacy_locs_follow_acorn_line_terminators() {
        let ast = parse(
            SOURCE,
            &crate::Allocator::default(),
            ParseOptions::public_api(),
        )
        .unwrap();
        let value = convert_to_legacy(SOURCE, ast);
        let nodes = &value["html"]["children"];
        let paragraph: Vec<Value> = nodes[1]["children"]
            .as_array()
            .unwrap()
            .iter()
            .filter_map(|n| n.get("expression").cloned())
            .collect();
        let tail = nodes
            .as_array()
            .unwrap()
            .iter()
            .find(|n| n["type"] == "MustacheTag")
            .unwrap();
        check(
            &value["instance"]["content"]["body"],
            &Value::from(paragraph),
            &tail["expression"],
        );
    }

    #[test]
    fn lf_only_sources_are_untouched() {
        assert!(!has_non_lf_line_breaks("a\r\nb\n"));
        assert!(has_non_lf_line_breaks("a\rb"));
        assert!(has_non_lf_line_breaks("a\u{2029}b"));
    }
}
