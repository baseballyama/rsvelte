//! The setup-scope helpers the translated template calls: Svelte's runtime behaviour where Vue's
//! differs, written as JavaScript and copied into the component's tree.
//!
//! Each is the Svelte 5.57 runtime function it names, reduced to the case the translation reaches
//! (an HTML element, no CSS hash, no class or style directives).

use rsv_js::copy::{Rewrite, copy};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::source::{Loc, Span};

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Helper {
    /// The client's `{#each}` conversion (`each`: `is_array(c) ? c : c == null ? [] :
    /// array_from(c)`).
    Each,
    /// The server's `{#each}` conversion (`ensure_array_like`), as an array or string Vue's
    /// `renderList` walks by index.
    EachServer,
    /// `set_attribute` (client): `null` and `undefined` remove, anything else is set as text.
    Attr,
    /// `attr` (server): the same, through `String`.
    AttrServer,
    /// `attr(name, value, true)` (server): `''` is a present boolean attribute.
    BoolServer,
    /// `stringify` (server), for an expression inside an attribute value.
    Stringify,
    /// `text.nodeValue = value` (client) for an expression Svelte sets once.
    NodeValue,
    /// `clsx` followed by `to_class`: the class name, or `null` to remove the attribute.
    Class,
    /// `set_value` (client), with its last-value cache on the element.
    Value,
    /// Runs a binding's first-mount step once per element.
    Once,
    /// `bind_select_value`'s effect (client): `select_option`, then the browser's choice for
    /// `undefined` on mount.
    Select,
    /// `bind_select_value`'s `change` listener (client): the value of the chosen option.
    Option,
}

impl Helper {
    const fn source(self) -> &'static str {
        match self {
            Self::Each => {
                "const $$each = (c) => Array.isArray(c) ? c : c == null ? [] : Array.from(c);"
            }
            Self::EachServer => {
                "const $$each = (c) => !c ? [] : c.length === undefined ? Array.from(c) : \
                 Array.isArray(c) || typeof c === 'string' ? c : Array.prototype.slice.call(c);"
            }
            Self::Attr => "const $$attr = (v) => v == null ? null : `${v}`;",
            Self::AttrServer => "const $$attr = (v) => v == null ? null : String(v);",
            Self::BoolServer => "const $$bool = (v) => v === '' || Boolean(v);",
            Self::Stringify => {
                "const $$stringify = (v) => typeof v === 'string' ? v : v == null ? '' : v + '';"
            }
            Self::NodeValue => "const $$node = (v) => v === null ? '' : `${v}`;",
            Self::Class => {
                // npm `clsx` (its `for…in` as an own-then-prototype walk of enumerable string
                // keys), Svelte's `clsx` wrapper, then `to_class`.
                "const $$keys = (o, seen = [], out = []) => {\n\
                   if (o == null) return out;\n\
                   Object.getOwnPropertyNames(o).forEach((k) => {\n\
                     if (seen.indexOf(k) < 0) {\n\
                       seen.push(k);\n\
                       if (Object.prototype.propertyIsEnumerable.call(o, k)) out.push(k);\n\
                     }\n\
                   });\n\
                   return $$keys(Object.getPrototypeOf(o), seen, out);\n\
                 };\n\
                 const $$clsx = (mix) => {\n\
                   if (typeof mix === 'string' || typeof mix === 'number') return '' + mix;\n\
                   if (typeof mix !== 'object' || mix === null) return '';\n\
                   if (Array.isArray(mix)) {\n\
                     return Array.from({ length: mix.length }, (_, k) => mix[k])\n\
                       .filter((x) => x).map((x) => $$clsx(x)).filter((y) => y).join(' ');\n\
                   }\n\
                   return $$keys(mix).filter((k) => mix[k]).join(' ');\n\
                 };\n\
                 const $$class = (v) => {\n\
                   const c = '' + (typeof v === 'object' ? (v ? $$clsx(v) : '') : v ?? '');\n\
                   return c === '' ? null : c;\n\
                 };"
            }
            Self::Value => {
                "const $$value = (el, v) => {\n\
                   const last = el.$$value;\n\
                   el.$$value = v ?? undefined;\n\
                   if (last === el.$$value || el.value === v) return;\n\
                   el.value = v ?? '';\n\
                 };"
            }
            Self::Once => {
                "const $$once = (el, f) => {\n\
                   if (el.$$once === true) return;\n\
                   el.$$once = true;\n\
                   f();\n\
                 };"
            }
            Self::Select => {
                "const $$select = (el, value, set) => {\n\
                   const mounting = el.$$mounted !== true;\n\
                   el.$$mounted = true;\n\
                   const o = Array.prototype.find.call(\n\
                     el.options, (o) => Object.is(o.value, value));\n\
                   if (o !== undefined) o.selected = true;\n\
                   else if (!mounting || value !== undefined) el.selectedIndex = -1;\n\
                   if (mounting && value === undefined) {\n\
                     const checked = el.querySelector(':checked');\n\
                     if (checked !== null) set(checked.value);\n\
                   }\n\
                 };"
            }
            Self::Option => {
                "const $$option = (el) => {\n\
                   const o = el.querySelector(':checked')\n\
                     ?? el.querySelector('option:not([disabled])');\n\
                   return o && o.value;\n\
                 };"
            }
        }
    }
}

/// The declarations of `helpers`, in the order given, built into `to`.
///
/// # Panics
///
/// If a helper's source does not parse, which the unit tests rule out.
pub fn declarations(helpers: &[Helper], to: &mut Ast) -> Vec<NodeId> {
    let mut out = Vec::new();
    for &h in helpers {
        let src = h.source();
        let mut scratch = Ast::new();
        let range = Span::new(0, u32::try_from(src.len()).expect("a short helper"));
        let program = rsv_js::parser::parse_program(&mut scratch, src, range, false)
            .expect("helper sources parse");
        let Kind::Program(body) = scratch.kind(program) else {
            unreachable!("a program")
        };
        let mut rw = Synthetic { src };
        out.extend(body.iter().map(|&s| copy(&scratch, to, &mut rw, s)));
    }
    out
}

/// Leaves that codegen prints from their source span are rebuilt without one: the helper's
/// source is not the document's.
struct Synthetic<'a> {
    src: &'a str,
}

impl Rewrite for Synthetic<'_> {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        Some(match from.kind(id) {
            Kind::Ident(_) => to.ident(from.name(id), Loc::SYNTHETIC),
            Kind::Num(v) => to.num(v, Loc::SYNTHETIC),
            Kind::Str => to.str(from.str_value(id, self.src)),
            Kind::Template { quasis, exprs } => {
                let q: Vec<NodeId> = quasis
                    .iter()
                    .map(|&q| {
                        let Kind::TemplateElem { tail } = from.kind(q) else {
                            unreachable!("a template's quasis are elements")
                        };
                        to.template_elem(from.str_value(q, self.src), tail)
                    })
                    .collect();
                let e: Vec<NodeId> = exprs.iter().map(|&e| copy(from, to, self, e)).collect();
                to.template(&q, &e, Loc::SYNTHETIC)
            }
            _ => return None,
        })
    }
}
