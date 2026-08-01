use rsvelte_core::ast::template::Attribute;

use crate::error::FormatError;
use crate::options::FormatOptions;

use super::directive::{
    format_expression_at, format_expression_at_extra, render_directive_value,
    render_directive_value_narrow, render_modifiers, render_spread,
};
use super::value::{render_attribute_node, render_attribute_value_for_directive};
use crate::width::{VisualWidth, tab_width};

// ─── attribute rendering ────────────────────────────────────────────────

pub(super) fn render_attribute(
    attr: &Attribute,
    source: &str,
    options: &FormatOptions,
    attr_depth: usize,
    narrow_value: bool,
) -> Result<String, FormatError> {
    let tw = tab_width(options);
    match attr {
        Attribute::Attribute(node) => {
            render_attribute_node(node, source, options, attr_depth, narrow_value)
        }
        Attribute::SpreadAttribute(spread) => render_spread(spread, source, options, attr_depth),
        Attribute::AttachTag(attach) => {
            let mut inner = format_expression_at(source, &attach.expression, options, attr_depth)?
                .unwrap_or_default();
            const ATTACH_PREFIX: &str = "{@attach ";
            if narrow_value
                && !inner.contains('\n')
                && attr_depth * options.js.indent_width.value() as usize
                    + ATTACH_PREFIX.len()
                    + inner.visual_width(tw)
                    + 1
                    > options.js.line_width.value() as usize
            {
                inner = format_expression_at_extra(
                    source,
                    &attach.expression,
                    options,
                    attr_depth,
                    ATTACH_PREFIX.len() + 1,
                )?
                .unwrap_or(inner);
            }
            Ok(format!("{{@attach {inner}}}"))
        }
        Attribute::BindDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            // A Svelte 5 function binding `bind:value={get, set}` (a top-level
            // sequence expression) renders without outer parens and breaks its
            // braces onto their own lines when the members don't fit (#795b).
            let lead_cols = attr_depth * options.js.indent_width.value() as usize
                + format!("bind:{}{modifiers}=", d.name).visual_width(tw);
            if let Some(value) = crate::expression::format_function_binding(
                source,
                &d.expression,
                d.end,
                options,
                attr_depth,
                lead_cols,
            )? {
                return Ok(format!("bind:{}{modifiers}={value}", d.name));
            }
            let inner = render_directive_value(source, &d.expression, d.end, options, attr_depth)?;
            // `bind:value={value}` → `bind:value` only when shorthand is allowed
            // (`svelteAllowShorthand`, default true).
            if options.allow_shorthand && inner == d.name.as_str() && modifiers.is_empty() {
                Ok(format!("bind:{}", d.name))
            } else {
                Ok(format!("bind:{}{modifiers}={{{inner}}}", d.name))
            }
        }
        Attribute::ClassDirective(d) => {
            // Columns before the value's `{`: `class:` + name + `=` (the `{` is
            // counted separately). Narrowing by this prefix once the open tag has
            // wrapped makes a long value break where prettier-plugin-svelte does
            // (#795) — matching `style:` / `on:` / `use:` etc.
            let prefix = "class:".visual_width(tw) + d.name.as_str().visual_width(tw) + 1;
            let inner = render_directive_value_narrow(
                source,
                &d.expression,
                d.end,
                options,
                attr_depth,
                narrow_value,
                prefix,
            )?;
            // `class:active={active}` → `class:active` only when shorthand is
            // allowed (`svelteAllowShorthand`, default true).
            if options.allow_shorthand && inner == d.name.as_str() {
                Ok(format!("class:{}", d.name))
            } else {
                Ok(format!("class:{}={{{inner}}}", d.name))
            }
        }
        Attribute::OnDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            if let Some(expr) = &d.expression {
                // prefix = "on:" + name + modifiers + "=" (the `{` is counted separately)
                let prefix = 3 + d.name.as_str().visual_width(tw) + modifiers.visual_width(tw) + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("on:{}{modifiers}={{{inner}}}", d.name))
            } else {
                Ok(format!("on:{}{modifiers}", d.name))
            }
        }
        Attribute::TransitionDirective(d) => {
            let pfx_kw = if d.intro && d.outro {
                "transition"
            } else if d.intro {
                "in"
            } else {
                "out"
            };
            let modifiers = render_modifiers(&d.modifiers);
            if let Some(expr) = &d.expression {
                let prefix = pfx_kw.visual_width(tw)
                    + 1
                    + d.name.as_str().visual_width(tw)
                    + modifiers.visual_width(tw)
                    + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("{pfx_kw}:{}{modifiers}={{{inner}}}", d.name))
            } else {
                Ok(format!("{pfx_kw}:{}{modifiers}", d.name))
            }
        }
        Attribute::AnimateDirective(d) => {
            if let Some(expr) = &d.expression {
                // "animate:" + name + "="
                let prefix = 8 + d.name.as_str().visual_width(tw) + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("animate:{}={{{inner}}}", d.name))
            } else {
                Ok(format!("animate:{}", d.name))
            }
        }
        Attribute::UseDirective(d) => {
            if let Some(expr) = &d.expression {
                // "use:" + name + "="
                let prefix = 4 + d.name.as_str().visual_width(tw) + 1;
                let inner = render_directive_value_narrow(
                    source,
                    expr,
                    d.end,
                    options,
                    attr_depth,
                    narrow_value,
                    prefix,
                )?;
                Ok(format!("use:{}={{{inner}}}", d.name))
            } else {
                Ok(format!("use:{}", d.name))
            }
        }
        Attribute::StyleDirective(d) => {
            let modifiers = render_modifiers(&d.modifiers);
            // Columns before the value's `{`: `style:` + name + modifiers + `=`.
            let prefix = "style:".visual_width(tw)
                + d.name.as_str().visual_width(tw)
                + modifiers.visual_width(tw)
                + 1;
            let value = render_attribute_value_for_directive(
                &d.value,
                source,
                options,
                attr_depth,
                narrow_value,
                prefix,
            )?;
            // Shorthand: `style:color={color}` → `style:color` when the
            // expression is a simple identifier matching the directive name,
            // mirroring prettier-plugin-svelte's shorthand collapsing — gated on
            // `svelteAllowShorthand` (default true). With shorthand disabled the
            // full `style:color={color}` form is emitted, reconstructing the
            // implicit `{name}` value for a source-bare `style:color`.
            let shorthand_value = format!("{{{}}}", d.name);
            if options.allow_shorthand
                && (value.is_empty() || (modifiers.is_empty() && value == shorthand_value))
            {
                Ok(format!("style:{}{modifiers}", d.name))
            } else {
                let value = if value.is_empty() {
                    &shorthand_value
                } else {
                    &value
                };
                Ok(format!("style:{}{modifiers}={value}", d.name))
            }
        }
        Attribute::LetDirective(d) => {
            // `let:item` (shorthand) or `let:item={pattern}` with a
            // destructuring pattern as the value.
            if let Some(expr) = &d.expression {
                let (Some(s), Some(e)) = (expr.start(), expr.end()) else {
                    return Ok(format!("let:{}", d.name));
                };
                let raw = source.get(s as usize..e as usize).unwrap_or("").trim();
                if raw.is_empty() || raw == d.name.as_str() {
                    Ok(format!("let:{}", d.name))
                } else {
                    let pattern = crate::expression::format_pattern_source(raw, options)?;
                    Ok(format!("let:{}={{{pattern}}}", d.name))
                }
            } else {
                Ok(format!("let:{}", d.name))
            }
        }
    }
}

/// `extra_lead` that narrows an expression to `inline_len - 1` columns — the
/// minimal width that forces OXC to break it at its top-level operator while
/// leaving inner content the widest budget.
pub(super) fn minimal_break_extra(base_width: usize, inline_len: usize) -> usize {
    base_width.saturating_sub(inline_len) + 1
}
