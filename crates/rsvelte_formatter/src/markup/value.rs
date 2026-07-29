use rsvelte_core::ast::template::{
    AttributeNode, AttributeValue, AttributeValuePart, ExpressionTag,
};

use crate::error::FormatError;
use crate::expression::format_attribute_value_expression;
use crate::options::FormatOptions;

use super::util::visual_width;
use super::value_sequence::render_attribute_value_sequence;

/// Return the source text of an `ExpressionTag`'s inner expression, without
/// the surrounding `{`/`}`.
///
/// A regular `name={expr}` attribute's `ExpressionTag` spans the braces, so we
/// strip one byte from each end. But the attribute shorthand `{name}` is
/// parsed (matching upstream `start: id.start, end: id.end`) so its
/// `ExpressionTag` spans only the identifier — there are no braces to strip.
/// Blindly slicing `start+1..end-1` there dropped the first and last character
/// of the identifier, silently rewriting `{width}` to `width={idt}` (#679). So
/// only peel braces when they're actually present at the span boundaries.
pub(super) fn expression_tag_inner<'a>(tag: &ExpressionTag, source: &'a str) -> &'a str {
    let (start, end) = (tag.start as usize, tag.end as usize);
    let bytes = source.as_bytes();
    if bytes.get(start) == Some(&b'{') && end > start + 1 && bytes.get(end - 1) == Some(&b'}') {
        source.get(start + 1..end - 1).unwrap_or("")
    } else {
        source.get(start..end).unwrap_or("")
    }
}

/// Whether an expression value is "shallow" — it wraps by breaking at its own
/// top-level operators (a ternary / binary / logical / member chain) rather than
/// by opening a nested block body. Block-bodied values (arrow handlers, object /
/// array literals, function expressions) keep their continuation lines at the
/// attribute indent with full width, so they must NOT be narrowed by the
/// `name={` prefix (that over-wraps the body). Detected syntactically: no arrow
/// and no leading object/array/function token.
pub(super) fn is_shallow_value(src: &str) -> bool {
    if has_top_level_arrow(src) {
        return false;
    }
    let t = src.trim_start();
    // A leading `(` is a parenthesized operand of a shallow expression
    // (`(a ?? b) === c`), not a block body — only arrows open a body, and those
    // are already excluded by the `=>` check above.
    !(t.starts_with('{') || t.starts_with('[') || t.starts_with("function"))
}

fn has_top_level_arrow(src: &str) -> bool {
    let bytes = src.as_bytes();
    let mut depth = 0usize;
    let mut quote: Option<u8> = None;
    let mut escaped = false;
    let mut index = 0usize;
    while index < bytes.len() {
        let byte = bytes[index];
        if let Some(delimiter) = quote {
            if escaped {
                escaped = false;
            } else if byte == b'\\' {
                escaped = true;
            } else if byte == delimiter {
                quote = None;
            }
            index += 1;
            continue;
        }
        match byte {
            b'\'' | b'"' | b'`' => quote = Some(byte),
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth = depth.saturating_sub(1),
            b'=' if depth == 0 && bytes.get(index + 1) == Some(&b'>') => return true,
            _ => {}
        }
        index += 1;
    }
    false
}

/// Render an attribute whose value is a single `{expr}` mustache (whether the
/// source wrote it bare `attr={expr}` or quoted `attr="{expr}"` — prettier
/// renders both unquoted). Applies the `name={name}` → `{name}` shorthand.
fn render_single_expression_value(
    node: &AttributeNode,
    inner_src: &str,
    _source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
) -> Result<String, FormatError> {
    if inner_src.is_empty() {
        return Ok(format!("{}={{}}", node.name));
    }
    // Tailwind class sort for a `class={expr}` (or configured attribute) mustache:
    // reorder every class literal in the expression before formatting. Unlike the
    // static path, this is not function-gated — mirrors oxfmt's `transformSvelte`.
    let sorted_expr = if options.class_sorter.is_some()
        && options
            .class_attributes
            .iter()
            .any(|a| a == node.name.as_str())
    {
        crate::tailwind_sort::sort_class_expression(inner_src, options)
    } else {
        None
    };
    let inner_src = sorted_expr.as_deref().unwrap_or(inner_src);
    // When the open tag wraps, attribute values are narrowed so OXC breaks them
    // at the right column.  Two cases:
    //
    // SHALLOW value (a function call / ternary / binary / logical chain — anything
    // that does NOT start with `{`/`[`/`function`/`=>`):
    //   First format at indent-only width (no extra_lead) to get a reference result.
    //   - If single-line: check whether the full attribute line (`indent + name={ +
    //     value + }`) overflows; if so, re-format with `prefix` as `extra_lead` to
    //     force a break at the right point.
    //   - If multi-line AND the first line ends with `{` or `[` (an expanded
    //     call-argument block): the continuation lines do NOT carry the `name={`
    //     prefix, so return the wider-width result as-is — narrowing by `prefix`
    //     would over-constrain inner expressions (e.g. `styles.fn({ prop: clsx(a,
    //     b) })` would wrongly break `clsx(a, b)` even though it fits).
    //   - If multi-line AND the first line does NOT end with `{`/`[` (a ternary,
    //     binary, or member chain that wraps at an operator): re-format with
    //     `prefix` as `extra_lead` so the break point matches prettier's output
    //     (the operator-break lands at the narrower column).
    //
    // NOT-SHALLOW value (an arrow handler / object / array literal):
    //   Format at indent-only width first.  If the result is still single-line but
    //   the full line overflows:
    //   - ARROW (`=>` present): re-format with `prefix - indent_width` as extra_lead
    //     so the arrow body gets exactly one indent level of room.
    //   - BLOCK-BODY (starts with `{` / `[` / `function`): re-format at
    //     `narrowed = inline_len - 1` (one character narrower than the inline form)
    //     to force the outer block to expand.  This is the minimal narrowing that
    //     triggers expansion: OXC only wraps when the content exceeds the width, so
    //     exactly `inline_len - 1` forces the outer `{…}` to split while giving the
    //     inner content the widest possible budget (maximizing the chance that
    //     nested calls like `styles.fn({ prop: clsx(a, b) })` stay on one line).
    //     Using `prefix - indent_width` as extra_lead would over-narrow the budget
    //     and wrongly break inner expressions for deep objects like
    //     `classes={{ input: styles.fn({ prop: clsx(a, b) }) }}`.
    let prefix = visual_width(node.name.as_str()) + 2;
    let indent_width = options.js.indent_width.value() as usize;
    let formatted = format_attribute_value_expression(inner_src, options, attr_depth, 0)?;
    let formatted = if narrow_value {
        let indent_cols = attr_depth * indent_width;
        let line_width = options.js.line_width.value() as usize;
        if !formatted.contains('\n') {
            // Single-line: check if the full rendered line `indent + name={value}`
            // overflows. `prefix` (`name.len() + 2`) already covers `name={`
            // INCLUDING the opening `{`, so only the closing `}` adds one more
            // column beyond the value — counting `{` again here would over-report
            // the width by one and wrongly break a value that fills exactly to the
            // print width (an 80-column `disabledDates={[…]}` line).
            if indent_cols + prefix + visual_width(&formatted) + 1 > line_width {
                if is_shallow_value(inner_src) {
                    // For a shallow expression (call / ternary / binary / logical chain),
                    // first try re-formatting with `extra_lead = prefix`.  If that
                    // produces a single-line result (i.e., the expression still fits
                    // within the narrowed width), keep it — the oracle allows the
                    // attribute line to overflow slightly in that case.
                    // If the `prefix`-narrowed result is MULTI-LINE (the top-level call
                    // was forced to break), check whether widening to `single_line_len`
                    // would keep the inner arguments on one line: using
                    // `narrowed = single_line_len` is the minimum that forces the break
                    // while giving arguments the widest possible budget.
                    // Example: `cn(value !== framework && "text-transparent")` (44 chars)
                    // at attr_depth=15 (base_width=50): `prefix=7` gives narrowed=43 and
                    // over-breaks the `&&` argument (arg=44 > 43).  Widening to
                    // narrowed=44 (= single_line_len) keeps the argument on one line
                    // (arg=44 ≤ 44).
                    let prefix_result =
                        format_attribute_value_expression(inner_src, options, attr_depth, prefix)?;
                    if prefix_result.contains('\n') {
                        let has_chain_break = prefix_result.lines().skip(1).any(|line| {
                            let line = line.trim_start();
                            line.starts_with('.') || line.starts_with("?.")
                        });
                        if has_chain_break {
                            let prefix_first =
                                prefix_result.lines().next().unwrap_or("").trim_end();
                            let prefix_total =
                                indent_cols + prefix + visual_width(prefix_first) + 1;
                            if prefix_total <= line_width {
                                return Ok(format!("{}={{{prefix_result}}}", node.name));
                            }
                            let overflow = prefix_total - line_width;
                            let tighter = format_attribute_value_expression(
                                inner_src,
                                options,
                                attr_depth,
                                prefix + overflow + 1,
                            )?;
                            return Ok(format!("{}={{{tighter}}}", node.name));
                        }
                        // The `prefix` narrowing forced a break. Try widening to
                        // `single_line_len` to give inner content more room.
                        let base_width = line_width.saturating_sub(indent_cols);
                        let single_line_len = visual_width(&formatted);
                        let extra_lead = base_width.saturating_sub(single_line_len);
                        if extra_lead < prefix {
                            // Widening would give more room — try the wider result.
                            let wider = format_attribute_value_expression(
                                inner_src, options, attr_depth, extra_lead,
                            )?;
                            // Only use the wider result if it is still multi-line
                            // (ensures the break happened — single-line would mean we
                            // accidentally collapsed and we should keep the prefix result).
                            if wider.contains('\n') {
                                wider
                            } else {
                                prefix_result
                            }
                        } else {
                            prefix_result
                        }
                    } else {
                        prefix_result
                    }
                } else if has_top_level_arrow(inner_src) {
                    // Arrow function: narrow so the arrow body breaks when the
                    // attribute line overflows.
                    //
                    // Oracle rule: a 1-char overflow (total line = line_width + 1) is
                    // tolerated — oracle keeps the value single-line.  Only when the
                    // overflow is >= 2 chars do we apply a tighter narrowing.
                    //
                    // Default narrowing: `arrow_extra = prefix - indent_width`
                    // (one level of indented room for the arrow body).
                    //
                    // Tight narrowing (overflow >= 2): use `base_width - inline_len + 1`.
                    // This is the minimum extra_lead that forces OXC to break the
                    // top-level arrow (since narrowed = inline_len - 1 < inline_len),
                    // while giving the continuation body the widest possible budget
                    // (narrowed = inline_len - 1, far more room than prefix-based
                    // narrowing).  Do NOT take max with `prefix - indent_width` because
                    // that over-narrows the body when `prefix` is large (e.g. a
                    // 15-char attribute name like `onValueChange`).
                    let base_width = line_width.saturating_sub(indent_cols);
                    let inline_len = visual_width(&formatted);
                    let inline_total = indent_cols + prefix + 1 + inline_len + 1;
                    let arrow_extra = if inline_total > line_width + 1 {
                        // Overflow >= 2: use tight narrowing to force the arrow break
                        // while giving the body maximum room.
                        base_width.saturating_sub(inline_len) + 1
                    } else {
                        // Overflow == 1: oracle allows it to stay single-line.
                        prefix.saturating_sub(indent_width)
                    };
                    format_attribute_value_expression(inner_src, options, attr_depth, arrow_extra)?
                } else {
                    // Block-body (object / array / function): force expansion by
                    // formatting at exactly one char narrower than the inline form.
                    // The `format_attribute_value_expression` API uses extra_lead,
                    // so convert: narrowed = full_width − indent_cols − extra_lead,
                    // meaning extra_lead = full_width − indent_cols − (inline_len − 1).
                    let inline_len = visual_width(&formatted);
                    // full_width − indent_cols is the budget without extra_lead
                    let base_width = line_width.saturating_sub(indent_cols);
                    // extra_lead that yields narrowed = inline_len − 1
                    let extra_lead = base_width.saturating_sub(inline_len.saturating_sub(1));
                    format_attribute_value_expression(inner_src, options, attr_depth, extra_lead)?
                }
            } else {
                formatted
            }
        } else if is_shallow_value(inner_src) {
            // Multi-line shallow: check the first line to decide whether to
            // re-format with extra_lead.
            let first_line = formatted.lines().next().unwrap_or("").trim_end();
            let first_line_total = indent_cols + prefix + visual_width(first_line) + 1;
            if first_line_total > line_width {
                let overflow = first_line_total - line_width;
                let tighter = format_attribute_value_expression(
                    inner_src,
                    options,
                    attr_depth,
                    prefix + overflow + 1,
                )?;
                if tighter.lines().next().unwrap_or("").trim_end() != first_line {
                    return Ok(format!("{}={{{tighter}}}", node.name));
                }
            }
            // If the first line ends with `{` or `[`, an inner block/array is
            // being expanded — the continuation lines are inside that block and
            // do NOT start at the attribute column with the `name={` prefix.
            // Keep the wider-width result to avoid over-constraining inner exprs.
            if first_line.ends_with('{') || first_line.ends_with('[') || first_line.ends_with('(') {
                formatted
            } else {
                // The `name={` prefix only narrows the FIRST line; continuation
                // lines sit at the attribute indent (already measured). Adopt the
                // prefix-narrowed result only when it changes the first line, else
                // keep the indent-only one so nested interiors aren't over-broken.
                let prefixed =
                    format_attribute_value_expression(inner_src, options, attr_depth, prefix)?;
                let prefixed_first = prefixed.lines().next().unwrap_or("").trim_end();
                if prefixed_first == first_line {
                    formatted
                } else {
                    prefixed
                }
            }
        } else {
            formatted
        }
    } else {
        formatted
    };
    // Svelte attribute shorthand: `name={name}` → `{name}`.
    // Only apply shorthand when the attribute name is a valid JS identifier
    // (starts with a letter, `_`, or `$`; remainder is alphanumeric / `_` / `$`).
    // Names like `0` or `my-attr` are not valid identifiers and must keep the
    // full `name={expr}` form to avoid producing invalid Svelte syntax.
    let name = node.name.as_str();
    let is_valid_js_identifier = name
        .chars()
        .next()
        .is_some_and(|c| c.is_alphabetic() || c == '_' || c == '$')
        && name
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '$');
    // `name={name}` → `{name}` only when shorthand is allowed
    // (`svelteAllowShorthand`, default true).
    if options.allow_shorthand && is_valid_js_identifier && formatted == name {
        Ok(format!("{{{formatted}}}"))
    } else {
        Ok(format!("{}={{{formatted}}}", name))
    }
}

pub(super) fn render_attribute_node(
    node: &AttributeNode,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
) -> Result<String, FormatError> {
    match &node.value {
        AttributeValue::True(_) => Ok(node.name.to_string()),
        AttributeValue::Expression(tag) => {
            let inner_src = expression_tag_inner(tag, source).trim();
            render_single_expression_value(
                node,
                inner_src,
                source,
                options,
                attr_depth,
                narrow_value,
            )
        }
        // prettier-plugin-svelte strips the quotes around a value that is a
        // single mustache and nothing else: `attr="{expr}"` → `attr={expr}`
        // (which then shorthands to `{attr}` when the expression is exactly the
        // attribute name). A value with surrounding text (`"a {x}"`) or multiple
        // interpolations (`"{a}{b}"`) keeps its quotes — handled below.
        AttributeValue::Sequence(parts)
            if matches!(parts.as_slice(), [AttributeValuePart::ExpressionTag(_)]) =>
        {
            // The guard already established the single-`ExpressionTag` shape;
            // re-bind through the same slice pattern so the two stay in sync.
            let [AttributeValuePart::ExpressionTag(tag)] = parts.as_slice() else {
                unreachable!()
            };
            let inner_src = expression_tag_inner(tag, source).trim();
            render_single_expression_value(
                node,
                inner_src,
                source,
                options,
                attr_depth,
                narrow_value,
            )
        }
        AttributeValue::Sequence(parts) => {
            // Tailwind class sort: a fully static value (no `{expr}`) of a
            // configured class attribute is reordered before printing. Values
            // with interpolation are left to the normal path — their class list
            // isn't statically known.
            if let Some(sorter) = &options.class_sorter
                && options
                    .class_attributes
                    .iter()
                    .any(|a| a == node.name.as_str())
                && let Some(raw) = static_attribute_text(parts)
            {
                return Ok(format!("{}=\"{}\"", node.name, sorter(&raw)));
            }

            // Columns before the value body on the first line: `name="`.
            let name_prefix = visual_width(node.name.as_str()) + 2;
            let body = render_attribute_value_sequence(
                parts,
                source,
                options,
                attr_depth,
                name_prefix,
                narrow_value,
                true,
            )?;
            Ok(format!("{}=\"{}\"", node.name, body))
        }
    }
}

/// The raw text of a fully static attribute value (every part is literal text,
/// no `{expr}`), or `None` if it contains interpolation.
fn static_attribute_text(parts: &[AttributeValuePart]) -> Option<String> {
    let mut out = String::new();
    for part in parts {
        match part {
            AttributeValuePart::Text(t) => out.push_str(t.raw.as_ref()),
            AttributeValuePart::ExpressionTag(_) => return None,
        }
    }
    Some(out)
}

pub(super) fn render_attribute_value_for_directive(
    value: &AttributeValue,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
    prefix: usize,
) -> Result<String, FormatError> {
    match value {
        AttributeValue::True(_) => Ok(String::new()),
        AttributeValue::Expression(tag) => {
            let inner_src = expression_tag_inner(tag, source).trim();
            if inner_src.is_empty() {
                return Ok("{}".to_string());
            }
            let indent_cols = attr_depth * options.js.indent_width.value() as usize;
            let formatted = format_attribute_value_expression(inner_src, options, attr_depth, 0)?;
            // Same shallow-overflow re-narrow as a plain attribute value: when the
            // open tag wraps and a single-line value overflows once the
            // `style:name={` prefix is counted, re-format narrowed by the prefix
            // so a ternary / binary breaks at its top level.
            let line_width = options.js.line_width.value() as usize;
            let formatted = if narrow_value
                && !formatted.contains('\n')
                && indent_cols + prefix + 1 + visual_width(&formatted) + 1 > line_width
            {
                format_attribute_value_expression(inner_src, options, attr_depth, prefix + 1)?
            } else {
                formatted
            };
            Ok(format!("{{{formatted}}}"))
        }
        AttributeValue::Sequence(parts) => {
            // When the entire value is a single mustache expression with no
            // surrounding text (e.g. `style:color="{expr}"`), prettier-plugin-svelte
            // normalises to the bare-mustache form `style:color={expr}`.
            // Detect: exactly one non-empty ExpressionTag part, all Text parts empty.
            let sole_expr = parts
                .iter()
                .filter(|p| !matches!(p, AttributeValuePart::Text(t) if t.data.is_empty()))
                .collect::<Vec<_>>();
            if sole_expr.len() == 1
                && let Some(AttributeValuePart::ExpressionTag(tag)) = sole_expr.first()
            {
                let inner_src = expression_tag_inner(tag, source).trim();
                if !inner_src.is_empty() {
                    let indent_cols = attr_depth * options.js.indent_width.value() as usize;
                    let formatted =
                        format_attribute_value_expression(inner_src, options, attr_depth, 0)?;
                    let line_width = options.js.line_width.value() as usize;
                    let formatted = if narrow_value
                        && !formatted.contains('\n')
                        && indent_cols + prefix + 1 + visual_width(&formatted) + 1 > line_width
                    {
                        format_attribute_value_expression(
                            inner_src,
                            options,
                            attr_depth,
                            prefix + 1,
                        )?
                    } else {
                        formatted
                    };
                    return Ok(format!("{{{formatted}}}"));
                }
            }
            // Directive value body starts after `style:name="`: prefix + the `"`.
            // `regular_attr = false`: directive text prints as a `fill`, so it
            // stays on the legacy path (not the whole-value Doc model).
            let body = render_attribute_value_sequence(
                parts,
                source,
                options,
                attr_depth,
                prefix + 1,
                narrow_value,
                false,
            )?;
            Ok(format!("\"{body}\""))
        }
    }
}
