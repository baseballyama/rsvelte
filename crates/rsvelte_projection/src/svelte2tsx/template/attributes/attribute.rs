//! Plain attributes (`name`, `name="v"`, `name={expr}`, shorthand `{name}`).
//! Mirrors `htmlxtojsx_v2/nodes/Attribute.ts`.

use super::svg::is_svg_attribute;
use crate::ast::template::{AttributeNode, AttributeValue, AttributeValuePart};
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::ctx::ELEMENT_OPENER_COMMENTS;
use crate::svelte2tsx::template::segs::{Seg, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

/// Format a regular attribute: `name="value"` → `"name":\`value\`,`
///
/// Shorthand attributes like `{propB}` (where name equals expression text)
/// produce `propB,` instead of `"propB":propB,`.
///
/// Wrapping rules (mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute`):
/// - `is_element` && name starts with `data-` (but NOT `data-sveltekit-`):
///   `...__sveltets_2_empty({ "data-foo": value })` — boolean/no-value → `__sveltets_2_any()`.
/// - `!is_element` && name starts with `--`:
///   `...__sveltets_2_cssProp({ "--x": value })` — boolean/no-value → `""`.
pub(crate) fn format_attribute_node(
    node: &AttributeNode,
    source: &str,
    is_element: bool,
) -> Option<String> {
    let name = &node.name;

    // Determine wrapping: data-* on elements, --* on components.
    let is_data_attr =
        is_element && name.starts_with("data-") && !name.starts_with("data-sveltekit-");
    let is_css_prop = !is_element && name.starts_with("--");

    /// Wrap the inner `"name":value` (without trailing comma) in the
    /// appropriate helper and re-attach the comma.
    fn wrap(inner: &str, is_data: bool, is_css: bool) -> String {
        if is_data {
            format!("...__sveltets_2_empty({{{}}}),", inner)
        } else if is_css {
            format!("...__sveltets_2_cssProp({{{}}}),", inner)
        } else {
            format!("{},", inner)
        }
    }

    match &node.value {
        AttributeValue::True(_) => {
            // Boolean attribute: `disabled` → `"disabled":true,`
            // For data-* on elements the boolean value is still `true` — official
            // wraps it as `...__sveltets_2_empty({ "data-foo": true })`. (The
            // `__sveltets_2_any()` fallback in upstream `Attribute.ts` only applies
            // when the attribute has no value at all, which never happens for a
            // boolean attribute.)
            // For --* on components: boolean means no value → ""
            if is_data_attr {
                Some(format!("...__sveltets_2_empty({{\"{}\":true}}),", name))
            } else if is_css_prop {
                Some(format!("...__sveltets_2_cssProp({{\"{}\":\"\"}}),", name))
            } else {
                Some(format!("\"{}\":true,", name))
            }
        }
        AttributeValue::Expression(expr) => {
            // Expression value: `name={expr}` → `"name":expr,`
            let expr_text = get_expression_text(&expr.expression, source);
            // Shorthand iff the source was written `{name}`. The parser sets the
            // value ExpressionTag's start to `node.start + 1` (right after `{`)
            // for shorthand; an explicit `name={expr}` puts it past `name=`.
            // Mirrors official's `AttributeShorthand` type check — explicit
            // `name={name}` must stay `"name":name`, not collapse to `name`.
            // Shorthand names are plain identifiers so they cannot start with
            // `data-` or `--`; skip wrapping for them.
            if expr.start == node.start + 1 {
                Some(format!("{},", name))
            } else {
                let inner = format!("\"{}\":{}", name, expr_text);
                Some(wrap(&inner, is_data_attr, is_css_prop))
            }
        }
        AttributeValue::Sequence(parts) => {
            // Special case: if the sequence is a single expression like `e="{b}"`,
            // output `"e":b,` (just the expression value) instead of `"e":\`${b}\`,`
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
            {
                let expr_text = get_expression_text(&expr.expression, source);
                let inner = format!("\"{}\":{}", name, expr_text);
                return Some(wrap(&inner, is_data_attr, is_css_prop));
            }

            // Pure-static empty value (`class=""`): emit the quoted empty
            // string, matching official (not an empty template literal).
            let has_expr = parts
                .iter()
                .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
            let text_is_empty = parts.iter().all(|p| match p {
                AttributeValuePart::Text(t) => t.raw.is_empty(),
                AttributeValuePart::ExpressionTag(_) => false,
            });
            if !has_expr && text_is_empty {
                return Some(wrap(
                    &format!("\"{}\":\"\"", name),
                    is_data_attr,
                    is_css_prop,
                ));
            }

            // Text or mixed content: `name="text {expr} text"` → `"name":\`text ${expr} text\`,`
            let mut value_parts = Vec::new();
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Escape backslash first (so a Windows path like
                        // `C:\new\test` doesn't turn `\n` / `\t` into control
                        // characters inside the template literal), then backtick
                        // and `$`. H-091.
                        let escaped = text
                            .raw
                            .replace('\\', "\\\\")
                            .replace('`', "\\`")
                            .replace('$', "\\$");
                        value_parts.push(escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let expr_text = get_expression_text(&expr.expression, source);
                        value_parts.push(format!("${{{}}}", expr_text));
                    }
                }
            }
            let inner = format!("\"{}\":`{}`", name, value_parts.join(""));
            Some(wrap(&inner, is_data_attr, is_css_prop))
        }
    }
}

/// Structured-bake variant of [`format_attribute_node`]. Wraps every
/// expression site in `Seg::Src` so the resulting MagicString chunks
/// retain per-character source-map fidelity.
/// HTML attributes whose `svelte/elements` type is `number | undefined | null`
/// (no `string`). A static string value (`tabindex="-1"`) must be lowered to a
/// bare number to type-check. List mirrors svelte2tsx's `numberOnlyAttributes`
/// (`htmlxtojsx_v2/nodes/Attribute.ts`), itself derived from `elements.d.ts`.
pub(crate) fn is_number_only_attribute(name: &str) -> bool {
    match name.len() {
        3 => name.eq_ignore_ascii_case("low"),
        4 => {
            name.eq_ignore_ascii_case("span")
                || name.eq_ignore_ascii_case("high")
                || name.eq_ignore_ascii_case("size")
                || name.eq_ignore_ascii_case("cols")
                || name.eq_ignore_ascii_case("rows")
        }
        5 => name.eq_ignore_ascii_case("start"),
        6 => name.eq_ignore_ascii_case("volume") || name.eq_ignore_ascii_case("border"),
        7 => {
            name.eq_ignore_ascii_case("results")
                || name.eq_ignore_ascii_case("optimum")
                || name.eq_ignore_ascii_case("colspan")
                || name.eq_ignore_ascii_case("rowspan")
        }
        8 => name.eq_ignore_ascii_case("tabindex"),
        9 => name.eq_ignore_ascii_case("maxlength") || name.eq_ignore_ascii_case("minlength"),
        10 => name.eq_ignore_ascii_case("aria-level"),
        11 => name.eq_ignore_ascii_case("marginwidth") || name.eq_ignore_ascii_case("currenttime"),
        12 => {
            name.eq_ignore_ascii_case("aria-colspan")
                || name.eq_ignore_ascii_case("aria-rowspan")
                || name.eq_ignore_ascii_case("aria-setsize")
                || name.eq_ignore_ascii_case("marginheight")
        }
        13 => {
            name.eq_ignore_ascii_case("aria-colcount")
                || name.eq_ignore_ascii_case("aria-colindex")
                || name.eq_ignore_ascii_case("aria-posinset")
                || name.eq_ignore_ascii_case("aria-rowcount")
                || name.eq_ignore_ascii_case("aria-rowindex")
                || name.eq_ignore_ascii_case("aria-valuemax")
                || name.eq_ignore_ascii_case("aria-valuemin")
                || name.eq_ignore_ascii_case("aria-valuenow")
        }
        19 => name.eq_ignore_ascii_case("defaultplaybackrate"),
        _ => false,
    }
}

/// Mirror JS `!isNaN(Number(s))` for the number-conversion check: an attribute
/// value coerces to a number. Covers the realistic forms (`-1`, `2`, `1e3`,
/// `0x1f`) and the JS quirk that an all-whitespace value is `0` (not NaN).
pub(crate) fn is_js_numeric(data: &str) -> bool {
    let t = data.trim();
    if t.is_empty() {
        return true; // JS: Number("") === 0
    }
    let lower = t.to_ascii_lowercase();
    // `0x` / `0o` / `0b` integer literals coerce via Number().
    if let Some(rest) = lower.strip_prefix("0x") {
        return !rest.is_empty() && rest.bytes().all(|b| b.is_ascii_hexdigit());
    }
    if let Some(rest) = lower.strip_prefix("0o") {
        return !rest.is_empty() && rest.bytes().all(|b| (b'0'..=b'7').contains(&b));
    }
    if let Some(rest) = lower.strip_prefix("0b") {
        return !rest.is_empty() && rest.bytes().all(|b| matches!(b, b'0' | b'1'));
    }
    // Rust's f64 parser also accepts `inf`/`nan`, which JS `Number` treats as
    // NaN (only `Infinity` coerces). Disambiguate those keyword spellings.
    if matches!(
        lower.as_str(),
        "inf" | "+inf" | "-inf" | "infinity" | "+infinity" | "-infinity" | "nan"
    ) {
        return lower.contains("infinity");
    }
    t.parse::<f64>().is_ok()
}

/// Lowercase an element attribute name so it matches the intrinsic-elements
/// typings, mirroring official `transformAttributeCase`. Preserves the name for
/// SVG attributes, custom elements (tag contains `-`), and svelte-5 `on*` event
/// attributes; non-element (component/slot) attributes are never transformed.
pub(crate) fn transform_attribute_case(name: &str, tag: &str, is_element: bool) -> String {
    let is_custom_element = tag.contains('-');
    if is_element && !is_svg_attribute(name) && !is_custom_element && !name.starts_with("on") {
        name.to_lowercase()
    } else {
        name.to_string()
    }
}

/// Build the leading-comment prefix segs for an attribute starting at
/// `attr_start`: any comments immediately before it (only whitespace between)
/// become `[\n]?<comment-source>…\n` (mirrors official getLeadingComment +
/// getLeadingCommentTransformation). Empty when there are none.
pub(crate) fn leading_attr_comment_segs(attr_start: u32, source: &str) -> Vec<Seg> {
    ELEMENT_OPENER_COMMENTS.with(|c| {
        let comments = c.borrow();
        if comments.is_empty() {
            return Vec::new();
        }
        let mut leading: Vec<(u32, u32)> = Vec::new();
        let mut search_end = attr_start;
        loop {
            let cand = comments
                .iter()
                .copied()
                .filter(|&(_, e)| {
                    e <= search_end
                        && source
                            .get(e as usize..search_end as usize)
                            .is_some_and(|s| s.chars().all(|ch| ch.is_whitespace()))
                })
                .max_by_key(|&(_, e)| e);
            match cand {
                Some((cs, ce)) => {
                    leading.push((cs, ce));
                    search_end = cs;
                }
                None => break,
            }
        }
        if leading.is_empty() {
            return Vec::new();
        }
        leading.reverse();
        let mut out = Vec::new();
        for (cs, ce) in &leading {
            let region = slice_src(source, cs.saturating_sub(100) as usize, *cs as usize);
            if region.trim_end_matches([' ', '\t']).ends_with('\n') {
                segs_push_lit(&mut out, "\n");
            }
            segs_push_src(&mut out, *cs, *ce);
        }
        segs_push_lit(&mut out, "\n");
        out
    })
}

/// Source ranges of the comments that sit between `attr_end` and the `>` of the
/// enclosing opening tag, with only whitespace (and an optional self-closing
/// `/`) around them. Mirrors official `handleTrailingEndComment`; the caller is
/// responsible for only asking about the element's *last* attribute.
fn trailing_attr_comments(attr_end: u32, source: &str) -> Vec<(u32, u32)> {
    let Some(rel) = source.get(attr_end as usize..).and_then(|s| s.find('>')) else {
        return Vec::new();
    };
    let tag_end = attr_end + rel as u32;
    ELEMENT_OPENER_COMMENTS.with(|c| {
        let mut comments: Vec<(u32, u32)> = c.borrow().clone();
        comments.sort_by_key(|&(s, _)| s);
        let mut trailing: Vec<(u32, u32)> = Vec::new();
        let mut search_start = attr_end;
        for (cs, ce) in comments {
            if cs < search_start {
                continue;
            }
            if ce > tag_end {
                break;
            }
            if !slice_src(source, search_start as usize, cs as usize)
                .chars()
                .all(char::is_whitespace)
            {
                break;
            }
            trailing.push((cs, ce));
            search_start = ce;
        }
        if trailing.is_empty() {
            return Vec::new();
        }
        // Anything other than whitespace and an optional `/` up to `>` means the
        // comments are not the last thing in the opener — bail like official.
        let rest = slice_src(source, search_start as usize, tag_end as usize);
        if !rest.chars().all(|ch| ch.is_whitespace() || ch == '/') || rest.matches('/').count() > 1
        {
            return Vec::new();
        }
        trailing
    })
}

/// Build the trailing-comment suffix segs for the last attribute of an element
/// opener: each comment becomes `[\n| ]<comment-source>`, closed by a final
/// `\n` (mirrors official `getTrailingCommentTransformation`). Empty when there
/// are none.
pub(crate) fn trailing_attr_comment_segs(attr_end: u32, source: &str) -> Vec<Seg> {
    let trailing = trailing_attr_comments(attr_end, source);
    if trailing.is_empty() {
        return Vec::new();
    }
    let mut out = Vec::new();
    for (cs, ce) in &trailing {
        let region = slice_src(source, cs.saturating_sub(100) as usize, *cs as usize);
        if region.trim_end_matches([' ', '\t']).ends_with('\n') {
            segs_push_lit(&mut out, "\n");
        } else {
            segs_push_lit(&mut out, " ");
        }
        segs_push_src(&mut out, *cs, *ce);
    }
    segs_push_lit(&mut out, "\n");
    out
}

/// String variant of [`trailing_attr_comment_segs`] for the component props path.
pub(crate) fn trailing_attr_comment_text(attr_end: u32, source: &str) -> String {
    let trailing = trailing_attr_comments(attr_end, source);
    if trailing.is_empty() {
        return String::new();
    }
    let mut out = String::new();
    for (cs, ce) in &trailing {
        let region = slice_src(source, cs.saturating_sub(100) as usize, *cs as usize);
        out.push(if region.trim_end_matches([' ', '\t']).ends_with('\n') {
            '\n'
        } else {
            ' '
        });
        out.push_str(slice_src(source, *cs as usize, *ce as usize));
    }
    out.push('\n');
    out
}

/// Structured-bake variant of [`format_attribute_node`]. Wraps every
/// expression site in `Seg::Src` so the resulting MagicString chunks
/// retain per-character source-map fidelity.
///
/// Applies the same wrapping rules as `format_attribute_node`:
/// - `is_element` && `data-*` (not `data-sveltekit-*`) → `__sveltets_2_empty({…})`
/// - `!is_element` && `--*` → `__sveltets_2_cssProp({…})`
///
/// (Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute`.)
pub(crate) fn format_attribute_node_segments(
    node: &AttributeNode,
    source: &str,
    is_element: bool,
    tag: &str,
    leading_comment: &str,
) -> Option<Vec<Seg>> {
    let leading = leading_attr_comment_segs(node.start, source);
    let is_data_attr =
        is_element && node.name.starts_with("data-") && !node.name.starts_with("data-sveltekit-");
    let is_css_prop = !is_element && node.name.starts_with("--");
    // Element attribute names are lowercased to match intrinsic typings
    // (`defaultValue` → `defaultvalue`); component/slot names are preserved.
    let name_owned = transform_attribute_case(&node.name, tag, is_element);
    let name = name_owned.as_str();

    // Helper: prepend/append the wrapper literals around a segment list that
    // already represents the `"name":value` content (no trailing comma).
    // Returns the final list with the trailing comma appended.
    // Leading comments go INSIDE the data-*/css-prop wrapper (right after `{`),
    // or directly before the `name:value` for a plain attribute — mirroring
    // official `getLeadingCommentTransformation` placement on the attribute.
    let wrap_segs = |mut inner: Vec<Seg>| -> Vec<Seg> {
        if is_data_attr {
            let mut out = Vec::with_capacity(inner.len() + leading.len() + 2);
            segs_push_lit(&mut out, "...__sveltets_2_empty({");
            out.extend(leading.iter().cloned());
            out.append(&mut inner);
            segs_push_lit(&mut out, "}),");
            out
        } else if is_css_prop {
            let mut out = Vec::with_capacity(inner.len() + leading.len() + 2);
            segs_push_lit(&mut out, "...__sveltets_2_cssProp({");
            out.extend(leading.iter().cloned());
            out.append(&mut inner);
            segs_push_lit(&mut out, "}),");
            out
        } else {
            let mut out = leading.clone();
            out.append(&mut inner);
            segs_push_lit(&mut out, ",");
            out
        }
    };

    let mut out: Vec<Seg> = leading.clone();

    match &node.value {
        AttributeValue::True(_) => {
            // Boolean / valueless attribute.
            // data-* on elements: the boolean value is `true` (official wraps it
            //   as `...__sveltets_2_empty({ "data-foo": true })`; the
            //   `__sveltets_2_any()` fallback only applies to a genuinely
            //   value-less attribute, which a boolean attribute is not).
            // --* on components: no-value → ""
            // Others: true
            if is_data_attr {
                segs_push_lit(
                    &mut out,
                    &format!(
                        "...__sveltets_2_empty({{{leading_comment}\"{}\":true}}),",
                        name
                    ),
                );
            } else if is_css_prop {
                segs_push_lit(
                    &mut out,
                    &format!("...__sveltets_2_cssProp({{\"{}\":\"\"}}),", name),
                );
            } else {
                segs_push_lit(&mut out, &format!("\"{}\":true,", name));
            }
            Some(out)
        }
        AttributeValue::Expression(expr) => {
            let expr_range = get_expression_range(&expr.expression);
            let expr_text = get_expression_text(&expr.expression, source);
            // Shorthand iff written `{name}`: the value ExpressionTag starts at
            // `node.start + 1` (right after `{`). Explicit `name={name}` keeps
            // the full `"name":name` form (mirrors `AttributeShorthand`).
            let is_shorthand = expr.start == node.start + 1;

            // Shorthand identifiers can't start with `data-` or `--` — no wrap.
            if let Some((s, e)) = expr_range {
                if is_shorthand {
                    segs_push_src(&mut out, s, e);
                    segs_push_lit(&mut out, ",");
                } else {
                    // Preserve a trailing TS postfix the parser narrowed out of
                    // the expression span (`attr={false as true}` → keep
                    // `false as true`, not `false`), same as expression tags.
                    let bytes = source.as_bytes();
                    let mut c = node.end as usize;
                    while c > e as usize && bytes[c - 1] != b'}' {
                        c -= 1;
                    }
                    let close = c.saturating_sub(1);
                    let tail = source.get(e as usize..close).unwrap_or("").trim_start();
                    let (s, e) = if close > e as usize
                        && (tail.starts_with("as ")
                            || tail.starts_with("satisfies ")
                            || tail.starts_with('!'))
                    {
                        (s, close as u32)
                    } else if close > e as usize && tail.starts_with(')') && {
                        let after = tail[1..].trim_start();
                        after.starts_with("as ")
                            || after.starts_with("satisfies ")
                            || after.starts_with('!')
                    } {
                        // A redundant-paren-wrapped expression carrying a TS
                        // postfix (`attr={((e) => {…}) satisfies T}`): the parser
                        // narrows the span to the inner expression, so widen back
                        // to the wrapping `(` and forward past the `) satisfies T`
                        // tail to keep the whole (balanced) cast.
                        let mut ps = s as usize;
                        while ps > 0 && bytes[ps - 1].is_ascii_whitespace() {
                            ps -= 1;
                        }
                        if ps > 0 && bytes[ps - 1] == b'(' {
                            ((ps - 1) as u32, close as u32)
                        } else {
                            (s, e)
                        }
                    } else {
                        (s, e)
                    };
                    let mut inner: Vec<Seg> = Vec::new();
                    segs_push_lit(&mut inner, &format!("\"{}\":", name));
                    segs_push_src(&mut inner, s, e);
                    return Some(wrap_segs(inner));
                }
            } else if is_shorthand {
                segs_push_lit(&mut out, &format!("{},", name));
            } else {
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":{}", name, expr_text));
                return Some(wrap_segs(inner));
            }
            Some(out)
        }
        AttributeValue::Sequence(parts) => {
            // Single-expression sequence stays as a bare expression — same
            // shape as the `Expression` arm.
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
            {
                let range = get_expression_range(&expr.expression);
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":", name));
                if let Some((s, e)) = range {
                    segs_push_src(&mut inner, s, e);
                } else {
                    segs_push_lit(&mut inner, get_expression_text(&expr.expression, source));
                }
                return Some(wrap_segs(inner));
            }

            // Numeric DOM attribute written as a string literal (`tabindex="-1"`,
            // `colspan="2"`, …). `svelte/elements` types these as `number`, so a
            // backtick string fails to type-check; emit the value as a bare
            // number instead — but only on a real element (component props keep
            // the author's string), only for the `numberOnlyAttributes` set, and
            // only when the value actually coerces to a number (#939). Mirrors
            // svelte2tsx's `needsNumberConversion` in `Attribute.ts`.
            // Note: number-only attributes (tabindex, colspan, etc.) cannot start
            // with `data-` or `--`, so no extra wrap is needed here.
            if is_element
                && parts.len() == 1
                && let AttributeValuePart::Text(text) = &parts[0]
                && is_number_only_attribute(name)
                && !text.data.trim().is_empty()
                && is_js_numeric(&text.data)
            {
                segs_push_lit(&mut out, &format!("\"{}\":", name));
                segs_push_src(&mut out, text.start, text.end);
                segs_push_lit(&mut out, ",");
                return Some(out);
            }

            // Pure-static empty value (`class=""`, `href=""`): official emits
            // the source's quoted empty string (`""`), not an empty template
            // literal (` `` `), and oxfmt preserves the difference. Emit `""`.
            let has_expr = parts
                .iter()
                .any(|p| matches!(p, AttributeValuePart::ExpressionTag(_)));
            let text_is_empty = parts.iter().all(|p| match p {
                AttributeValuePart::Text(t) => t.raw.is_empty(),
                AttributeValuePart::ExpressionTag(_) => false,
            });
            if !has_expr && text_is_empty {
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":\"\"", name));
                return Some(wrap_segs(inner));
            }

            // Single static Text value: mirror official Attribute.ts. The quote
            // is a backtick UNLESS the DECODED value contains a backtick, in which
            // case the source quote (`"`/`'`) is used. The value is the raw source
            // range unless it contains `\` (or a newline in the non-template case),
            // when it is JSON-escaped — so `title="`${x}\n`"` → `"`${x}\\n`"`.
            if !has_expr
                && parts.len() == 1
                && let AttributeValuePart::Text(text) = &parts[0]
            {
                let data = text.data.as_ref();
                let has_backtick = data.contains('`');
                let quote = if !has_backtick {
                    '`'
                } else {
                    match text
                        .start
                        .checked_sub(1)
                        .map(|i| source.as_bytes()[i as usize])
                    {
                        Some(b'\'') => '\'',
                        _ => '"',
                    }
                };
                let needs_escape = data.contains('\\') || (has_backtick && data.contains('\n'));
                let mut inner: Vec<Seg> = Vec::new();
                segs_push_lit(&mut inner, &format!("\"{}\":{}", name, quote));
                if needs_escape {
                    let json =
                        serde_json::to_string(data).unwrap_or_else(|_| format!("\"{}\"", data));
                    segs_push_lit(&mut inner, &json[1..json.len() - 1]);
                } else {
                    segs_push_src(&mut inner, text.start, text.end);
                }
                segs_push_lit(&mut inner, &quote.to_string());
                return Some(wrap_segs(inner));
            }

            // Mixed text + expression sequence → template literal. Each
            // `${EXPR}` slot still preserves the expression chunk.
            let mut inner: Vec<Seg> = Vec::new();
            segs_push_lit(&mut inner, &format!("\"{}\":`", name));
            for part in parts {
                match part {
                    AttributeValuePart::Text(text) => {
                        // Official slices the raw source verbatim into the
                        // template literal (Attribute.ts), so a backslash stays
                        // single (`back\slash`); only the template-literal
                        // delimiters (`` ` `` / `${`) need escaping.
                        let escaped = text.raw.replace('`', "\\`").replace("${", "\\${");
                        segs_push_lit(&mut inner, &escaped);
                    }
                    AttributeValuePart::ExpressionTag(expr) => {
                        let range = get_expression_range(&expr.expression);
                        segs_push_lit(&mut inner, "${");
                        if let Some((s, e)) = range {
                            segs_push_src(&mut inner, s, e);
                        } else {
                            segs_push_lit(
                                &mut inner,
                                get_expression_text(&expr.expression, source),
                            );
                        }
                        segs_push_lit(&mut inner, "}");
                    }
                }
            }
            segs_push_lit(&mut inner, "`");
            Some(wrap_segs(inner))
        }
    }
}

#[cfg(test)]
mod tests {
    // Tests for data-* and --* attribute wrapping rules.
    // Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute` / `addProp`.

    use super::is_number_only_attribute;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    fn compile_template(src: &str) -> String {
        svelte2tsx(src, Svelte2TsxOptions::default()).unwrap().code
    }

    #[test]
    fn number_only_lookup_matches_upstream_with_ascii_case_folding() {
        for name in [
            "aria-colcount",
            "aria-colindex",
            "aria-colspan",
            "aria-level",
            "aria-posinset",
            "aria-rowcount",
            "aria-rowindex",
            "aria-rowspan",
            "aria-setsize",
            "aria-valuemax",
            "aria-valuemin",
            "aria-valuenow",
            "results",
            "span",
            "marginheight",
            "marginwidth",
            "maxlength",
            "minlength",
            "currenttime",
            "defaultplaybackrate",
            "volume",
            "high",
            "low",
            "optimum",
            "start",
            "size",
            "border",
            "cols",
            "rows",
            "colspan",
            "rowspan",
            "tabindex",
        ] {
            assert!(is_number_only_attribute(name), "{name}");
            assert!(
                is_number_only_attribute(&name.to_ascii_uppercase()),
                "{name}"
            );
        }

        for name in [
            "",
            "aria-col",
            "aria-colcount-extra",
            "max-length",
            "tabindex ",
            "role",
            "spän",
        ] {
            assert!(!is_number_only_attribute(name), "{name}");
        }
    }

    #[test]
    fn test_data_attr_on_element_is_wrapped_with_empty() {
        // `data-foo="foobarbaz"` on a DOM element must become
        // `...__sveltets_2_empty({"data-foo":\`foobarbaz\`})`.
        let src = "<p data-foo=\"foobarbaz\">hello</p>";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_empty({\"data-foo\":`foobarbaz`})"),
            "expected __sveltets_2_empty wrap, got:\n{out}"
        );
    }

    #[test]
    fn test_data_sveltekit_attr_not_wrapped() {
        // `data-sveltekit-*` must NOT be wrapped — it is valid in `svelte/elements`.
        let src = "<a data-sveltekit-preload-data=\"hover\">link</a>";
        let out = compile_template(src);
        assert!(
            !out.contains("__sveltets_2_empty"),
            "data-sveltekit-* should not be wrapped, got:\n{out}"
        );
        assert!(
            out.contains("\"data-sveltekit-preload-data\""),
            "data-sveltekit-preload-data should be a plain prop, got:\n{out}"
        );
    }

    #[test]
    fn test_data_attr_boolean_on_element_uses_true() {
        // Boolean `data-foo` (no value) on a DOM element → `true` (official wraps
        // it as `...__sveltets_2_empty({ "data-foo": true })`).
        let src = "<p data-foo>hello</p>";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_empty({\"data-foo\":true})"),
            "boolean data-* should use true, got:\n{out}"
        );
    }

    #[test]
    fn test_css_prop_on_component_is_wrapped_with_cssprop() {
        // `--my-var={x}` on a component must become
        // `...__sveltets_2_cssProp({"--my-var":x})`.
        let src = "<script>import Comp from \"./Comp.svelte\"; let x = 5;</script>\
                   <Comp --my-var={x} />";
        let out = compile_template(src);
        assert!(
            out.contains("...__sveltets_2_cssProp({\"--my-var\":x})"),
            "expected __sveltets_2_cssProp wrap, got:\n{out}"
        );
    }

    #[test]
    fn test_normal_attr_not_wrapped() {
        // Regular attributes (no data-* or --*) must remain unwrapped.
        let src = "<p class=\"foo\" id=\"bar\">hello</p>";
        let out = compile_template(src);
        assert!(
            !out.contains("__sveltets_2_empty"),
            "regular attrs should not be wrapped, got:\n{out}"
        );
        assert!(
            out.contains("\"class\":`foo`"),
            "class attr should be plain prop, got:\n{out}"
        );
    }
}
