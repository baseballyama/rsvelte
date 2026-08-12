//! Plain attributes (`name`, `name="v"`, `name={expr}`, shorthand `{name}`).
//! Mirrors `htmlxtojsx_v2/nodes/Attribute.ts`.

use std::borrow::Cow;

use super::svg::is_svg_attribute;
use crate::ast::template::{AttributeNode, AttributeValue, AttributeValuePart};
use crate::svelte2tsx::svelte2tsx::slice_src;
use crate::svelte2tsx::template::ctx::ElementOpenerCommentIndex;
use crate::svelte2tsx::template::segs::{Seg, segs_push_fmt, segs_push_lit, segs_push_src};
use crate::svelte2tsx::template::utils::expr::{get_expression_range, get_expression_text};

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("template source offsets are represented as u32")
}

/// Format a regular attribute: `name="value"` → `"name":value,`.
///
/// Shorthand attributes like `{propB}` (where name equals expression text)
/// produce `propB,` instead of `"propB":propB,`.
///
/// Wrapping rules (mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute`):
/// - `is_element` && name starts with `data-` (but NOT `data-sveltekit-`):
///   `...__sveltets_2_empty({ "data-foo": value })` — boolean/no-value → `__sveltets_2_any()`.
/// - `!is_element` && name starts with `--`:
///   `...__sveltets_2_cssProp({ "--x": value })` — boolean/no-value → `""`.
pub fn format_attribute_node(node: &AttributeNode, source: &str, is_element: bool) -> String {
    let name = &node.name;

    // Determine wrapping: data-* on elements, --* on components.
    let is_data_attr =
        is_element && name.starts_with("data-") && !name.starts_with("data-sveltekit-");
    let is_css_prop = !is_element && name.starts_with("--");

    /// Wrap the inner `"name":value` (without trailing comma) in the
    /// appropriate helper and re-attach the comma.
    fn wrap(inner: &str, is_data: bool, is_css: bool) -> String {
        if is_data {
            format!("...__sveltets_2_empty({{{inner}}}),")
        } else if is_css {
            format!("...__sveltets_2_cssProp({{{inner}}}),")
        } else {
            format!("{inner},")
        }
    }

    let value = match &node.value {
        AttributeValue::True(_) => {
            // Boolean attribute: `disabled` → `"disabled":true,`
            // For data-* on elements the boolean value is still `true` — official
            // wraps it as `...__sveltets_2_empty({ "data-foo": true })`. (The
            // `__sveltets_2_any()` fallback in upstream `Attribute.ts` only applies
            // when the attribute has no value at all, which never happens for a
            // boolean attribute.)
            // For --* on components: boolean means no value → ""
            if is_data_attr {
                format!("...__sveltets_2_empty({{\"{name}\":true}}),")
            } else if is_css_prop {
                format!("...__sveltets_2_cssProp({{\"{name}\":\"\"}}),")
            } else {
                format!("\"{name}\":true,")
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
                format!("{name},")
            } else {
                let inner = format!("\"{name}\":{expr_text}");
                wrap(&inner, is_data_attr, is_css_prop)
            }
        }
        AttributeValue::Sequence(parts) => {
            // Special case: if the sequence is a single expression like `e="{b}"`,
            // output `"e":b,` (just the expression value) instead of `"e":\`${b}\`,`
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
            {
                let expr_text = get_expression_text(&expr.expression, source);
                let inner = format!("\"{name}\":{expr_text}");
                return wrap(&inner, is_data_attr, is_css_prop);
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
                return wrap(&format!("\"{name}\":\"\""), is_data_attr, is_css_prop);
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
                        value_parts.push(format!("${{{expr_text}}}"));
                    }
                }
            }
            let inner = format!("\"{}\":`{}`", name, value_parts.join(""));
            wrap(&inner, is_data_attr, is_css_prop)
        }
    };
    value
}

/// Structured-bake variant of [`format_attribute_node`]. Wraps every
/// expression site in `Seg::Src` so the resulting `MagicString` chunks
/// retain per-character source-map fidelity.
/// HTML attributes whose `svelte/elements` type is `number | undefined | null`
/// (no `string`). A static string value (`tabindex="-1"`) must be lowered to a
/// bare number to type-check. List mirrors svelte2tsx's `numberOnlyAttributes`
/// (`htmlxtojsx_v2/nodes/Attribute.ts`), itself derived from `elements.d.ts`.
pub const fn is_number_only_attribute(name: &str) -> bool {
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
pub fn is_js_numeric(data: &str) -> bool {
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
/// `preserve_case` (the `foreign` namespace) suppresses the fold entirely.
pub fn transform_attribute_case<'a>(
    name: &'a str,
    tag: &str,
    is_element: bool,
    preserve_case: bool,
) -> Cow<'a, str> {
    let is_custom_element = tag.contains('-');
    if !preserve_case
        && is_element
        && !is_svg_attribute(name)
        && !is_custom_element
        && !name.starts_with("on")
    {
        let needs_lowercase = name.chars().any(|c| {
            let mut lowercase = c.to_lowercase();
            lowercase.next() != Some(c) || lowercase.next().is_some()
        });
        if needs_lowercase {
            Cow::Owned(name.to_lowercase())
        } else {
            Cow::Borrowed(name)
        }
    } else {
        Cow::Borrowed(name)
    }
}

/// Build the leading-comment prefix segs for an attribute starting at
/// `attr_start`: any comments immediately before it (only whitespace between)
/// become `[\n]?<comment-source>…\n` (mirrors official getLeadingComment +
/// getLeadingCommentTransformation). Empty when there are none.
pub fn leading_attr_comment_segs(
    attr_start: u32,
    source: &str,
    comments: &ElementOpenerCommentIndex,
) -> Vec<Seg> {
    if comments.is_empty() {
        return Vec::new();
    }
    let candidates = comments.ending_at_or_before(attr_start);
    let mut from = candidates.len();
    let mut search_end = attr_start;
    for &(comment_start, comment_end) in candidates.iter().rev() {
        #[cfg(test)]
        comments.record_range_visits(1);
        if source
            .get(comment_end as usize..search_end as usize)
            .is_some_and(|between| between.chars().all(char::is_whitespace))
        {
            from -= 1;
            search_end = comment_start;
        } else {
            break;
        }
    }
    let leading = &candidates[from..];
    if leading.is_empty() {
        return Vec::new();
    }
    let mut out = Vec::new();
    for &(cs, ce) in leading {
        let region = slice_src(source, cs.saturating_sub(100) as usize, cs as usize);
        if region.trim_end_matches([' ', '\t']).ends_with('\n') {
            segs_push_lit(&mut out, "\n");
        }
        segs_push_src(&mut out, cs, ce);
    }
    segs_push_lit(&mut out, "\n");
    out
}

/// Source ranges of the comments that sit between `attr_end` and the `>` of the
/// enclosing opening tag, with only whitespace (and an optional self-closing
/// `/`) around them. Mirrors official `handleTrailingEndComment`; the caller is
/// responsible for only asking about the element's *last* attribute.
fn trailing_attr_comments<'a>(
    attr_end: u32,
    source: &str,
    comments: &'a ElementOpenerCommentIndex,
) -> &'a [(u32, u32)] {
    let Some(rel) = source.get(attr_end as usize..).and_then(|s| s.find('>')) else {
        return &[];
    };
    let tag_end = attr_end + source_offset(rel);
    let candidates = comments.starting_at_or_after(attr_end);
    let mut count = 0;
    let mut search_start = attr_end;
    for &(comment_start, comment_end) in candidates {
        #[cfg(test)]
        comments.record_range_visits(1);
        if comment_end > tag_end {
            break;
        }
        if !slice_src(source, search_start as usize, comment_start as usize)
            .chars()
            .all(char::is_whitespace)
        {
            break;
        }
        count += 1;
        search_start = comment_end;
    }
    if count == 0 {
        return &[];
    }
    // Anything other than whitespace and an optional `/` up to `>` means the
    // comments are not the last thing in the opener — bail like official.
    let rest = slice_src(source, search_start as usize, tag_end as usize);
    if !rest.chars().all(|ch| ch.is_whitespace() || ch == '/') || rest.matches('/').count() > 1 {
        return &[];
    }
    &candidates[..count]
}

/// Build the trailing-comment suffix segs for the last attribute of an element
/// opener: each comment becomes `[\n| ]<comment-source>`, closed by a final
/// `\n` (mirrors official `getTrailingCommentTransformation`). Empty when there
/// are none.
pub fn trailing_attr_comment_segs(
    attr_end: u32,
    source: &str,
    comments: &ElementOpenerCommentIndex,
) -> Vec<Seg> {
    let trailing = trailing_attr_comments(attr_end, source, comments);
    if trailing.is_empty() {
        return Vec::new();
    }
    let mut out = Vec::new();
    for &(cs, ce) in trailing {
        let region = slice_src(source, cs.saturating_sub(100) as usize, cs as usize);
        if region.trim_end_matches([' ', '\t']).ends_with('\n') {
            segs_push_lit(&mut out, "\n");
        } else {
            segs_push_lit(&mut out, " ");
        }
        segs_push_src(&mut out, cs, ce);
    }
    segs_push_lit(&mut out, "\n");
    out
}

/// String variant of [`trailing_attr_comment_segs`] for the component props path.
pub fn trailing_attr_comment_text(
    attr_end: u32,
    source: &str,
    comments: &ElementOpenerCommentIndex,
) -> String {
    let trailing = trailing_attr_comments(attr_end, source, comments);
    if trailing.is_empty() {
        return String::new();
    }
    let mut out = String::new();
    for &(cs, ce) in trailing {
        let region = slice_src(source, cs.saturating_sub(100) as usize, cs as usize);
        out.push(if region.trim_end_matches([' ', '\t']).ends_with('\n') {
            '\n'
        } else {
            ' '
        });
        out.push_str(slice_src(source, cs as usize, ce as usize));
    }
    out.push('\n');
    out
}

#[inline]
fn append_segments(dst: &mut Vec<Seg>, src: Vec<Seg>) {
    for seg in src {
        match seg {
            Seg::Lit(text) => {
                if let Some(Seg::Lit(last)) = dst.last_mut() {
                    last.push_str(&text);
                } else if !text.is_empty() {
                    dst.push(Seg::Lit(text));
                }
            }
            Seg::Src(start, end) => segs_push_src(dst, start, end),
        }
    }
}

#[inline]
fn append_wrapped_attribute(
    out: &mut Vec<Seg>,
    leading: Vec<Seg>,
    is_data_attr: bool,
    is_css_prop: bool,
    append_inner: impl FnOnce(&mut Vec<Seg>),
) {
    if is_data_attr {
        segs_push_lit(out, "...__sveltets_2_empty({");
    } else if is_css_prop {
        segs_push_lit(out, "...__sveltets_2_cssProp({");
    }
    append_segments(out, leading);
    append_inner(out);
    segs_push_lit(
        out,
        if is_data_attr || is_css_prop {
            "}),"
        } else {
            ","
        },
    );
}

/// Structured-bake variant of [`format_attribute_node`]. Wraps every
/// expression site in `Seg::Src` so the resulting `MagicString` chunks
/// retain per-character source-map fidelity.
///
/// Applies the same wrapping rules as `format_attribute_node`:
/// - `is_element` && `data-*` (not `data-sveltekit-*`) → `__sveltets_2_empty({…})`
/// - `!is_element` && `--*` → `__sveltets_2_cssProp({…})`
///
/// (Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute`.)
pub fn append_attribute_node_segments(
    out: &mut Vec<Seg>,
    node: &AttributeNode,
    source: &str,
    comments: &ElementOpenerCommentIndex,
    is_element: bool,
    tag: &str,
    leading_comment: &str,
    preserve_case: bool,
) {
    let leading = leading_attr_comment_segs(node.start, source, comments);
    let is_data_attr =
        is_element && node.name.starts_with("data-") && !node.name.starts_with("data-sveltekit-");
    let is_css_prop = !is_element && node.name.starts_with("--");
    // Element attribute names are lowercased to match intrinsic typings
    // (`defaultValue` → `defaultvalue`); component/slot names are preserved.
    let name_owned = transform_attribute_case(&node.name, tag, is_element, preserve_case);
    let name = name_owned.as_ref();

    match &node.value {
        AttributeValue::True(_) => {
            // Boolean / valueless attribute.
            // data-* on elements: the boolean value is `true` (official wraps it
            //   as `...__sveltets_2_empty({ "data-foo": true })`; the
            //   `__sveltets_2_any()` fallback only applies to a genuinely
            //   value-less attribute, which a boolean attribute is not).
            // --* on components: no-value → ""
            // Others: true
            append_segments(out, leading);
            if is_data_attr {
                segs_push_fmt(
                    out,
                    format_args!("...__sveltets_2_empty({{{leading_comment}\"{name}\":true}}),"),
                );
            } else if is_css_prop {
                segs_push_fmt(
                    out,
                    format_args!("...__sveltets_2_cssProp({{\"{name}\":\"\"}}),"),
                );
            } else {
                segs_push_fmt(out, format_args!("\"{name}\":true,"));
            }
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
                    append_segments(out, leading);
                    segs_push_src(out, s, e);
                    segs_push_lit(out, ",");
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
                        (s, source_offset(close))
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
                            (source_offset(ps - 1), source_offset(close))
                        } else {
                            (s, e)
                        }
                    } else {
                        (s, e)
                    };
                    append_wrapped_attribute(out, leading, is_data_attr, is_css_prop, |out| {
                        segs_push_fmt(out, format_args!("\"{name}\":"));
                        segs_push_src(out, s, e);
                    });
                }
            } else if is_shorthand {
                append_segments(out, leading);
                segs_push_fmt(out, format_args!("{name},"));
            } else {
                append_wrapped_attribute(out, leading, is_data_attr, is_css_prop, |out| {
                    segs_push_fmt(out, format_args!("\"{name}\":{expr_text}"));
                });
            }
        }
        AttributeValue::Sequence(parts) => {
            // Single-expression sequence stays as a bare expression — same
            // shape as the `Expression` arm.
            if parts.len() == 1
                && let AttributeValuePart::ExpressionTag(expr) = &parts[0]
            {
                let range = get_expression_range(&expr.expression);
                append_wrapped_attribute(out, leading, is_data_attr, is_css_prop, |out| {
                    segs_push_fmt(out, format_args!("\"{name}\":"));
                    if let Some((s, e)) = range {
                        segs_push_src(out, s, e);
                    } else {
                        segs_push_lit(out, get_expression_text(&expr.expression, source));
                    }
                });
                return;
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
                append_segments(out, leading);
                segs_push_fmt(out, format_args!("\"{name}\":"));
                segs_push_src(out, text.start, text.end);
                segs_push_lit(out, ",");
                return;
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
                append_wrapped_attribute(out, leading, is_data_attr, is_css_prop, |out| {
                    segs_push_fmt(out, format_args!("\"{name}\":\"\""));
                });
                return;
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
                let quote = if has_backtick {
                    match text
                        .start
                        .checked_sub(1)
                        .map(|i| source.as_bytes()[i as usize])
                    {
                        Some(b'\'') => '\'',
                        _ => '"',
                    }
                } else {
                    '`'
                };
                let needs_escape = data.contains('\\') || (has_backtick && data.contains('\n'));
                append_wrapped_attribute(out, leading, is_data_attr, is_css_prop, |out| {
                    segs_push_fmt(out, format_args!("\"{name}\":{quote}"));
                    if needs_escape {
                        let json =
                            serde_json::to_string(data).unwrap_or_else(|_| format!("\"{data}\""));
                        segs_push_lit(out, &json[1..json.len() - 1]);
                    } else {
                        segs_push_src(out, text.start, text.end);
                    }
                    segs_push_fmt(out, format_args!("{quote}"));
                });
                return;
            }

            // Mixed text + expression sequence → template literal. Each
            // `${EXPR}` slot still preserves the expression chunk.
            append_wrapped_attribute(out, leading, is_data_attr, is_css_prop, |out| {
                segs_push_fmt(out, format_args!("\"{name}\":`"));
                for part in parts {
                    match part {
                        AttributeValuePart::Text(text) => {
                            // Official slices the raw source verbatim into the
                            // template literal (Attribute.ts), so a backslash stays
                            // single (`back\slash`); only the template-literal
                            // delimiters (`` ` `` / `${`) need escaping.
                            let escaped = text.raw.replace('`', "\\`").replace("${", "\\${");
                            segs_push_lit(out, &escaped);
                        }
                        AttributeValuePart::ExpressionTag(expr) => {
                            let range = get_expression_range(&expr.expression);
                            segs_push_lit(out, "${");
                            if let Some((s, e)) = range {
                                segs_push_src(out, s, e);
                            } else {
                                segs_push_lit(out, get_expression_text(&expr.expression, source));
                            }
                            segs_push_lit(out, "}");
                        }
                    }
                }
                segs_push_lit(out, "`");
            });
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};
    use crate::svelte2tsx::template::segs::segs_to_string;
    use std::fmt::Write as _;

    fn compile_template(src: &str) -> String {
        svelte2tsx(src, Svelte2TsxOptions::default()).unwrap().code
    }

    fn source_range(source: &str, needle: &str) -> (u32, u32) {
        let start = source.find(needle).unwrap() as u32;
        (start, start + needle.len() as u32)
    }

    fn leading_comment_oracle(attr_start: u32, source: &str, ranges: &[(u32, u32)]) -> String {
        let mut leading = Vec::new();
        let mut search_end = attr_start;
        loop {
            let candidate = ranges
                .iter()
                .copied()
                .filter(|&(_, end)| {
                    end <= search_end
                        && source
                            .get(end as usize..search_end as usize)
                            .is_some_and(|between| between.chars().all(char::is_whitespace))
                })
                .max_by_key(|&(_, end)| end);
            let Some((start, end)) = candidate else {
                break;
            };
            leading.push((start, end));
            search_end = start;
        }
        leading.reverse();

        let mut out = String::new();
        for (start, end) in leading {
            let context = slice_src(source, start.saturating_sub(100) as usize, start as usize);
            if context.trim_end_matches([' ', '\t']).ends_with('\n') {
                out.push('\n');
            }
            out.push_str(slice_src(source, start as usize, end as usize));
        }
        if !out.is_empty() {
            out.push('\n');
        }
        out
    }

    #[test]
    fn chained_leading_comments_keep_exact_source_order_and_newlines() {
        let source = "<div\n/* first */\n// second\nfoo>";
        let ranges = vec![
            source_range(source, "// second"),
            source_range(source, "/* first */"),
        ];
        let attr_start = source.find("foo").unwrap() as u32;
        let comments = ElementOpenerCommentIndex::new(ranges);

        let actual = segs_to_string(
            &leading_attr_comment_segs(attr_start, source, &comments),
            source,
        );

        assert_eq!(actual, "\n/* first */\n// second\n");
    }

    #[test]
    fn trailing_self_closing_comments_keep_exact_spacing() {
        let source = "<div foo /* first */\n/* second */ />";
        let ranges = vec![
            source_range(source, "/* second */"),
            source_range(source, "/* first */"),
        ];
        let attr_end = source.find("foo").unwrap() as u32 + "foo".len() as u32;
        let comments = ElementOpenerCommentIndex::new(ranges);

        let actual = trailing_attr_comment_text(attr_end, source, &comments);

        assert_eq!(actual, " /* first */\n/* second */\n");
    }

    #[test]
    fn comment_between_attributes_attaches_only_to_the_following_attribute() {
        let source = "<div first /* between */ second>";
        let comment = source_range(source, "/* between */");
        let first_start = source.find("first").unwrap() as u32;
        let second_start = source.find("second").unwrap() as u32;
        let comments = ElementOpenerCommentIndex::new([comment]);

        let first = segs_to_string(
            &leading_attr_comment_segs(first_start, source, &comments),
            source,
        );
        let second = segs_to_string(
            &leading_attr_comment_segs(second_start, source, &comments),
            source,
        );

        assert_eq!(first, "");
        assert_eq!(second, "/* between */\n");
    }

    #[test]
    fn indexed_leading_queries_match_linear_oracle_with_linear_range_visits() {
        const ATTRIBUTE_COUNT: usize = 1_024;
        let mut source = String::from("<div");
        let mut ranges = Vec::with_capacity(ATTRIBUTE_COUNT);
        let mut attr_starts = Vec::with_capacity(ATTRIBUTE_COUNT);
        for index in 0..ATTRIBUTE_COUNT {
            source.push('\n');
            let comment_start = source.len() as u32;
            write!(source, "/* c{index} */").unwrap();
            let comment_end = source.len() as u32;
            ranges.push((comment_start, comment_end));
            source.push(' ');
            attr_starts.push(source.len() as u32);
            write!(source, "attr{index}").unwrap();
        }
        source.push('>');

        ranges.reverse();
        let comments = ElementOpenerCommentIndex::new(ranges.iter().copied());
        comments.reset_range_visits();

        for attr_start in attr_starts {
            let actual = segs_to_string(
                &leading_attr_comment_segs(attr_start, &source, &comments),
                &source,
            );
            let expected = leading_comment_oracle(attr_start, &source, &ranges);
            assert_eq!(actual, expected);
        }

        let visits = comments.range_visits();
        assert!(
            visits <= ATTRIBUTE_COUNT * 2,
            "binary-bounded queries should inspect only adjacent ranges: {visits} visits"
        );
    }

    // Tests for data-* and --* attribute wrapping rules.
    // Mirrors `htmlxtojsx_v2/nodes/Attribute.ts` `addAttribute` / `addProp`.

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
    fn transform_attribute_case_borrows_unchanged_names() {
        let lowercase = transform_attribute_case("class", "div", true, false);
        assert!(matches!(lowercase, Cow::Borrowed("class")));
        assert!(matches!(
            transform_attribute_case("viewBox", "svg", true, false),
            Cow::Borrowed("viewBox")
        ));
        assert!(matches!(
            transform_attribute_case("defaultValue", "my-input", true, false),
            Cow::Borrowed("defaultValue")
        ));
        assert!(matches!(
            transform_attribute_case("onClick", "button", true, false),
            Cow::Borrowed("onClick")
        ));
        assert!(matches!(
            transform_attribute_case("defaultValue", "Component", false, false),
            Cow::Borrowed("defaultValue")
        ));
    }

    #[test]
    fn transform_attribute_case_allocates_only_for_changed_names() {
        assert_eq!(
            transform_attribute_case("defaultValue", "input", true, false),
            Cow::Owned::<str>("defaultvalue".to_string())
        );
        assert_eq!(
            transform_attribute_case("İD", "div", true, false),
            Cow::Owned::<str>("i\u{307}d".to_string())
        );
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

    #[test]
    fn dense_attribute_sink_preserves_order_and_wrappers() {
        let src = "<script>let value = 1;</script>\
                   <div disabled title=\"plain\" count={value} \
                   mixed=\"pre {value} post\" data-id=\"7\" {value}></div>";
        let out = compile_template(src);

        assert!(
            out.contains(
                "{        \"disabled\":true,\"title\":`plain`,\"count\":value,\
                 \"mixed\":`pre ${value} post`,\
                 ...__sveltets_2_empty({\"data-id\":`7`}),value,}"
            ),
            "dense attribute lowering changed:\n{out}"
        );
    }
}
