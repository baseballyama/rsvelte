//! An attribute as the property svelte2tsx writes for it.

use oxc_span::GetSpan;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Attribute, AttributeKind, AttributeValue, Part};

use super::{Builder, Node, NodeIdentifier, SourceExpression};

/// svelte2tsx's `numberOnlyAttributes`: an element's static value for one of these is a number.
const NUMBER_ONLY: &[&str] = &[
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
];

/// The names in svelte2tsx's `svgAttributes` that have an uppercase letter, which it keeps as
/// they are. Sorted for the binary search.
const SVG_CAMEL_CASE: &[&str] = &[
    "allowReorder",
    "attributeName",
    "attributeType",
    "autoReverse",
    "baseFrequency",
    "baseProfile",
    "calcMode",
    "clipPathUnits",
    "contentScriptType",
    "contentStyleType",
    "diffuseConstant",
    "edgeMode",
    "externalResourcesRequired",
    "filterRes",
    "filterUnits",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "kernelMatrix",
    "kernelUnitLength",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "limitingConeAngle",
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "maskContentUnits",
    "maskUnits",
    "numOctaves",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "refX",
    "refY",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "specularConstant",
    "specularExponent",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stitchTiles",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textLength",
    "viewBox",
    "viewTarget",
    "xChannelSelector",
    "yChannelSelector",
    "zoomAndPan",
];

/// Whether svelte2tsx lowercases the name of an element's attribute to match its intrinsic
/// element types: a name with an uppercase letter that is neither an svg one nor an event's.
fn lowercased(name: &str, custom_element: bool) -> bool {
    !custom_element
        && name.chars().any(char::is_uppercase)
        && !name.starts_with("on")
        && SVG_CAMEL_CASE.binary_search(&name).is_err()
}

fn is_number_only(name: &str) -> bool {
    NUMBER_ONLY.iter().any(|n| n.eq_ignore_ascii_case(name))
}

/// JavaScript's `!isNaN(text)`, except for blank text, which svelte2tsx would print as nothing.
fn is_number(text: &str) -> bool {
    let text = text.trim_matches(is_ecmascript_whitespace);
    if text.is_empty() {
        return false;
    }
    let radix = |prefix: [&str; 2], digit: fn(&u8) -> bool| {
        prefix
            .iter()
            .find_map(|p| text.strip_prefix(p))
            .is_some_and(|digits| !digits.is_empty() && digits.as_bytes().iter().all(digit))
    };
    if radix(["0x", "0X"], u8::is_ascii_hexdigit)
        || radix(["0o", "0O"], |b| (b'0'..=b'7').contains(b))
        || radix(["0b", "0B"], |b| matches!(b, b'0' | b'1'))
    {
        return true;
    }
    let unsigned = text.strip_prefix(['+', '-']).unwrap_or(text);
    if unsigned == "Infinity" {
        return true;
    }
    let (mantissa, exponent) = unsigned
        .split_once(['e', 'E'])
        .map_or((unsigned, None), |(m, e)| (m, Some(e)));
    let (whole, fraction) = mantissa.split_once('.').unwrap_or((mantissa, ""));
    let digits = |s: &str| s.bytes().all(|b| b.is_ascii_digit());
    let mantissa = (!whole.is_empty() || !fraction.is_empty()) && digits(whole) && digits(fraction);
    let exponent = exponent.is_none_or(|e| {
        let e = e.strip_prefix(['+', '-']).unwrap_or(e);
        !e.is_empty() && digits(e)
    });
    mantissa && exponent
}

impl Builder<'_> {
    pub(super) fn attribute(
        &mut self,
        attribute: &Attribute,
        intrinsic: bool,
        custom_element: bool,
    ) -> NodeIdentifier {
        let parts = match attribute.value {
            AttributeValue::True => &[][..],
            AttributeValue::Parts(range) => self.component.parts(range),
        };
        let value = match (attribute.value, parts) {
            (AttributeValue::True, _) => self.tree.push(Node::Boolean),
            (_, &[Part::Text(text)])
                if intrinsic
                    && attribute.kind == AttributeKind::Attribute
                    && is_number_only(attribute.name.text(self.source))
                    && is_number(text.text(self.source)) =>
            {
                self.tree.push(Node::Source(SourceExpression {
                    span: text,
                    end: text.end_offset,
                }))
            }
            (_, [Part::Expression { expression, span }]) => {
                self.property_value(*expression, Some(span.end_offset - 1))
            }
            _ => {
                let template = parts
                    .iter()
                    .any(|part| matches!(part, Part::Expression { .. }));
                let start = self.scratch.len();
                self.scratch.reserve(parts.len());
                for part in parts {
                    let value = match *part {
                        Part::Text(span) => self.tree.push(Node::Text(span)),
                        Part::Expression { expression, span } => {
                            self.expression_source(expression, Some(span.end_offset - 1))
                        }
                    };
                    self.scratch.push(value);
                }
                let parts = self.finish_list(start);
                self.tree.push(Node::String { parts, template })
            }
        };
        let node = match attribute.kind {
            AttributeKind::Spread => {
                let value_start = parts.iter().find_map(|part| match *part {
                    Part::Expression { expression, .. } => {
                        Some(self.expression(expression).span().start)
                    }
                    Part::Text(_) => None,
                });
                let dots = Span::new(
                    attribute.span.start_offset + 1,
                    value_start.unwrap_or(attribute.span.start_offset + 1),
                );
                Node::Spread { value, dots }
            }
            AttributeKind::Attach => Node::ComputedProperty {
                key: self.attachment_key(),
                value,
            },
            _ if attribute.shorthand => Node::Shorthand(value),
            _ => Node::Property {
                name: attribute.name,
                lowercase: intrinsic
                    && lowercased(attribute.name.text(self.source), custom_element),
                value,
                end: (!matches!(attribute.value, AttributeValue::True))
                    .then_some(attribute.name.end_offset),
            },
        };
        self.tree.push(node)
    }
}

#[cfg(test)]
mod tests;
