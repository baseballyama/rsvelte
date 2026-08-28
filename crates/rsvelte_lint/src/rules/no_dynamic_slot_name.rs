//! `svelte/no-dynamic-slot-name` — a `<slot name=…>` must have a static name.
//!
//! Port of the (upstream-deprecated) eslint-plugin-svelte rule: a `name`
//! attribute with a mustache value is "cannot be dynamic"; a valueless `name`
//! attribute is "requires a value".
//!
//! The autofix replaces a mustache whose expression folds to a constant string
//! with that string: the sole value of the attribute becomes a quoted
//! `name="…"`, and one mustache among several becomes bare text. An identifier
//! is resolved to its `const` initializer first, which is why the fix needs the
//! script's declarations and the report does not.

use rsvelte_core::ast::template::{Attribute, AttributeValue, AttributeValuePart, SlotElement};
use serde_json::Value;

use crate::context::LintContext;
use crate::diagnostic::{Fix, TextEdit};
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::rules::js_static::{ScriptVars, get_string_if_constant};
use crate::script::node_type;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-dynamic-slot-name",
    category: RuleCategory::Correctness,
    fixable: Fixable::Code,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow a dynamic `<slot name>` value",
    options_schema: None,
};

const DYNAMIC: &str = "`<slot>` name cannot be dynamic.";
const REQUIRE_VALUE: &str = "`<slot>` name requires a value.";

/// Bound on `findRootExpression`'s recursion, which upstream guards with a
/// visited set rather than a depth limit.
const MAX_ALIAS_HOPS: usize = 16;

#[derive(Default)]
pub struct NoDynamicSlotName;

impl Rule for NoDynamicSlotName {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_slot(&self, ctx: &mut LintContext, el: &SlotElement) {
        for attr in &el.attributes {
            let Attribute::Attribute(node) = attr else {
                continue;
            };
            // Upstream selects on `key.name='name'`, which is case-sensitive.
            if node.name.as_str() != "name" {
                continue;
            }
            // `<slot {name} />` is a `SvelteShorthandAttribute` upstream, which
            // the `SvelteAttribute` selector never matches.
            if ctx.source().as_bytes().get(node.start as usize) == Some(&b'{') {
                continue;
            }
            match &node.value {
                // `<slot name />` — boolean attribute, no value.
                AttributeValue::True(_) => {
                    // Upstream reports the whole `SvelteAttribute`.
                    ctx.report(node.start, node.end, REQUIRE_VALUE);
                }
                // `<slot name={expr} />` — single mustache.
                AttributeValue::Expression(tag) => {
                    let fix = static_text(ctx, tag.expression.as_json()).and_then(|text| {
                        whole_value_range(ctx.source(), node.start, node.end, node.name.len())
                            .map(|(s, e)| quoted_fix(s, e, &text))
                    });
                    match fix {
                        Some(fix) => ctx.report_with_fix(tag.start, tag.end, DYNAMIC, fix),
                        None => ctx.report(tag.start, tag.end, DYNAMIC),
                    }
                }
                AttributeValue::Sequence(parts) => {
                    // `name=""` is an empty `value` array upstream; rsvelte keeps
                    // a zero-length text part for it.
                    let empty = parts.iter().all(|part| match part {
                        AttributeValuePart::Text(text) => text.raw.is_empty(),
                        AttributeValuePart::ExpressionTag(_) => false,
                    });
                    if empty {
                        ctx.report(node.start, node.end, REQUIRE_VALUE);
                    }
                    // Upstream keys the fix shape on `node.value.length === 1`:
                    // the lone value is replaced *with its quotes*, any other is
                    // replaced in place as bare text.
                    let sole = parts.len() == 1;
                    for part in parts {
                        if let AttributeValuePart::ExpressionTag(tag) = part {
                            let fix = static_text(ctx, tag.expression.as_json()).and_then(|text| {
                                if sole {
                                    whole_value_range(
                                        ctx.source(),
                                        node.start,
                                        node.end,
                                        node.name.len(),
                                    )
                                    .map(|(s, e)| quoted_fix(s, e, &text))
                                } else {
                                    Some(Fix {
                                        message: DYNAMIC.into(),
                                        edits: vec![TextEdit {
                                            start: tag.start,
                                            end: tag.end,
                                            new_text: text,
                                        }],
                                    })
                                }
                            });
                            match fix {
                                Some(fix) => ctx.report_with_fix(tag.start, tag.end, DYNAMIC, fix),
                                None => ctx.report(tag.start, tag.end, DYNAMIC),
                            }
                        }
                    }
                }
            }
        }
    }
}

fn quoted_fix(start: u32, end: u32, text: &str) -> Fix {
    Fix {
        message: DYNAMIC.into(),
        edits: vec![TextEdit {
            start,
            end,
            new_text: format!("\"{text}\""),
        }],
    }
}

/// The attribute's value together with its quotes, i.e. everything after the
/// `=` — upstream's `getAttributeValueQuoteAndRange`, whose range covers the
/// quotes when there are any and the bare value when there are not.
fn whole_value_range(
    source: &str,
    attr_start: u32,
    attr_end: u32,
    name_len: usize,
) -> Option<(u32, u32)> {
    let after_name = attr_start as usize + name_len;
    let rest = source.get(after_name..attr_end as usize)?;
    let eq = rest.find('=')?;
    let value_start = rest[eq + 1..]
        .char_indices()
        .find(|(_, c)| !c.is_whitespace())
        .map(|(i, _)| after_name + eq + 1 + i)?;
    Some((u32::try_from(value_start).ok()?, attr_end))
}

/// Upstream's `getStaticText`: resolve an identifier to the initializer it is
/// bound to, then fold that expression to a constant string.
fn static_text(ctx: &LintContext, expr: &Value) -> Option<String> {
    if node_type(expr) == Some("Identifier") {
        // Only a `<slot name={…}>` reaches this — a shape the Svelte compiler
        // itself now rejects — so resolving the name against a fresh parse is
        // bounded to files that are already broken.
        let alloc = rsvelte_core::Allocator::default();
        let root = rsvelte_core::parse(ctx.source(), &alloc, rsvelte_core::ParseOptions::default())
            .ok()?;
        let json = rsvelte_core::ast::arena::with_serialize_arena(&root.arena, || {
            serde_json::to_value(&root).unwrap_or(Value::Null)
        });
        let vars = ScriptVars::from_root_json(&json);
        // `findRootExpression` recurses through `const a = b`, and stops at any
        // binding that is not a literal `const` with an initializer.
        let mut node = expr.clone();
        for _ in 0..MAX_ALIAS_HOPS {
            let Some(name) = node.get("name").and_then(Value::as_str) else {
                break;
            };
            let Some(init) = vars.const_decl_init(name) else {
                break;
            };
            node = init.clone();
            if node_type(&node) != Some("Identifier") {
                break;
            }
        }
        return get_string_if_constant(&node);
    }
    get_string_if_constant(expr)
}
