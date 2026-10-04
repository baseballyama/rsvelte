//! The setup-scope helpers the translated template calls: Svelte's runtime behaviour where Vue's
//! differs, written as JavaScript and copied into the component's tree.
//!
//! Helpers adapt Svelte semantics to the Vue runtime without reparsing generated output.

use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_typescript::copy::{Rewrite, copy};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Helper {
    /// The client's `{#each}` conversion (`each`: `is_array(c) ? c : c == null ? [] :
    /// array_from(c)`).
    Each,
    /// The server's `{#each}` conversion (`ensure_array_like`), as an array or string Vue's
    /// `renderList` walks by index.
    EachServer,
    /// `set_attribute` (client): `null` and `undefined` remove, anything else is set as text.
    Attribute,
    /// `attr` (server): the same, through `String`.
    AttributeServer,
    /// `attr(name, value, true)` (server): `''` is a present boolean attribute.
    BooleanServer,
    SpecialAttribute,
    CustomElementData,
    /// `stringify` (server), for an expression inside an attribute value.
    Stringify,
    /// `text.nodeValue = value` (client) for an expression Svelte sets once.
    NodeValue,
    /// npm `clsx` (its `for…in` as an own-then-prototype walk of enumerable string keys) and
    /// Svelte's `clsx` wrapper around it.
    Clsx,
    /// `clsx` followed by `to_class`: the class name, or `null` to remove the attribute.
    Class,
    /// `to_class` with `class:` directives.
    ToClass,
    /// `set_class` (client) with `class:` directives: the class name recomputed when the value
    /// changes, the directives toggled when only they do.
    SetClass,
    /// `set_attributes` (client) for an element with a spread attribute.
    Attributes,
    /// `attributes` (server) for an element with a spread attribute, as the props Vue's server
    /// renderer prints the same markup from.
    Spread,
    /// A `TypeError` naming what the runtime meets that the translation does not cover.
    Fail,
    /// `set_value` (client), with its last-value cache on the element.
    Value,
    /// Runs a binding's first-mount step once per element.
    Once,
    /// `bind_select_value`'s effect (client): `select_option`, then the browser's choice for
    /// `undefined` on mount.
    Select,
    /// `bind_select_value`'s `change` listener (client): the value of the chosen option.
    Option,
    ScopedClass,
    Style,
    RawMarkup,
    Lifecycle,
    Await,
    NumberBinding,
    Group,
    PropertyBinding,
    MediaBinding,
    ResizeBinding,
    WindowScroll,
    FormReset,
    ClassSpread,
    ComponentProps,
    Transition,
    Animate,
    Boundary,
    Async,
    Pending,
}

impl Helper {
    const fn source(self) -> &'static str {
        match self {
            Self::Pending => {
                "const $$effect_pending = () => $$v_inject(Symbol.for('rsvelte.async.boundary'), \
                 null)?.count.value ?? 0;"
            }
            Self::Async => include_str!("helpers/async.js"),
            Self::Boundary => include_str!("helpers/boundary.js"),
            Self::Animate => include_str!("helpers/animation.js"),
            Self::Transition => include_str!("helpers/transitions.js"),
            Self::ComponentProps => include_str!("helpers/component_props.js"),
            Self::ClassSpread => {
                "const $$class_spread = (properties, directives) => ({ ...properties, class: \
                 $$to_class($$sclsx(properties.class), directives) });"
            }
            Self::FormReset => include_str!("helpers/form_reset.js"),
            Self::WindowScroll => include_str!("helpers/window_scroll.js"),
            Self::ResizeBinding => include_str!("helpers/resize_binding.js"),
            Self::MediaBinding => include_str!("helpers/media_binding.js"),
            Self::PropertyBinding => include_str!("helpers/property_binding.js"),
            Self::Group => include_str!("helpers/group.js"),
            Self::NumberBinding => include_str!("helpers/number_binding.js"),
            Self::Await => include_str!("helpers/await.js"),
            Self::Lifecycle => include_str!("helpers/lifecycle.js"),
            Self::RawMarkup => RAW_MARKUP,
            Self::Style => include_str!("helpers/style.js"),
            Self::ScopedClass => SCOPED_CLASS,
            Self::Each => "const $$each = (c) => c == null ? [] : Array.from(c);",
            Self::EachServer => {
                "const $$each = (c) => !c ? [] : c.length === undefined ? Array.from(c) : \
                 Array.isArray(c) ? c : Array.prototype.slice.call(c);"
            }
            Self::Attribute => "const $$attr = (v) => v == null ? null : `${v}`;",
            Self::AttributeServer => "const $$attr = (v) => v == null ? null : String(v);",
            Self::BooleanServer => "const $$bool = (v) => v === '' || Boolean(v);",
            Self::SpecialAttribute => include_str!("helpers/special_attributes.js"),
            Self::CustomElementData => include_str!("helpers/custom_element_data.js"),
            Self::Stringify => {
                "const $$stringify = (v) => typeof v === 'string' ? v : v == null ? '' : v + '';"
            }
            Self::NodeValue => "const $$node = (v) => v === null ? '' : `${v}`;",
            Self::Clsx => {
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
                 const $$sclsx = (v) => typeof v === 'object' ? $$clsx(v) : v ?? '';"
            }
            Self::Class => {
                "const $$class = (v) => {\n\
                   const c = '' + (typeof v === 'object' ? (v ? $$clsx(v) : '') : v ?? '');\n\
                   return c === '' ? null : c;\n\
                 };"
            }
            Self::ToClass => TO_CLASS,
            Self::SetClass => SET_CLASS,
            Self::Fail => {
                // The parser this is built with has no `throw`: defining a property on an object
                // that cannot be extended throws a `TypeError` naming the property.
                "const $$fail = (message) => Object.defineProperty(Object.preventExtensions({}), \
                 'vuelte: ' + message, { value: 0 });"
            }
            Self::Attributes => ATTRIBUTES,
            Self::Spread => SPREAD,
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
            Self::Select => include_str!("helpers/select.js"),
            Self::Option => include_str!("helpers/option.js"),
        }
    }
}

// Svelte's loops as recursion: the parser this is built with has no loops.
const TO_CLASS: &str = "const $$ws = [32, 9, 10, 13, 12, 160, 11, 65279]\n\
       .map((c) => String.fromCharCode(c));\n\
     const $$remove_class = (name, key, a) => {\n\
       const at = name.indexOf(key, a);\n\
       if (at < 0) return name;\n\
       const b = at + key.length;\n\
       if ((at === 0 || $$ws.includes(name[at - 1]))\n\
         && (b === name.length || $$ws.includes(name[b]))) {\n\
         const head = at === 0 ? '' : name.substring(0, at);\n\
         return $$remove_class(head + name.substring(b + 1), key, at);\n\
       }\n\
       return $$remove_class(name, key, b);\n\
     };\n\
     const $$to_class = (value, directives) => {\n\
       let name = value == null ? '' : '' + value;\n\
       if (directives) {\n\
         Object.keys(directives).forEach((key) => {\n\
           if (directives[key]) name = name ? name + ' ' + key : key;\n\
           else if (name.length) name = $$remove_class(name, key, 0);\n\
         });\n\
       }\n\
       return name === '' ? null : name;\n\
     };";

const SET_CLASS: &str = "const $$set_class = (el, value, next) => {\n\
       const prev = el.$$class;\n\
       if (prev !== value || prev === undefined) {\n\
         const name = $$to_class(value, next);\n\
         if (name == null) el.removeAttribute('class');\n\
         else el.setAttribute('class', name);\n\
         el.$$class = value;\n\
       } else if (el.$$classes !== next) {\n\
         const before = el.$$classes;\n\
         Object.keys(next).forEach((key) => {\n\
           const present = !!next[key];\n\
           if (before == null || present !== !!before[key]) {\n\
             el.classList.toggle(key, present);\n\
           }\n\
         });\n\
       }\n\
       el.$$classes = next;\n\
     };";

// `set_attributes` on an HTML element that is not an `<input>`, `<textarea>`, `<select>` or
// `<option>` (the translation refuses a spread there), without a CSS hash or directives. A
// delegated handler is called from a listener on the element, as the translation maps an event
// attribute to `@event`; an attachment, which Svelte runs as an effect, throws.
const ATTRIBUTES: &str = "const $$setters_cache = new Map();\n\
     const $$collect_setters = (proto, setters) => {\n\
       if (proto === Element.prototype) return setters;\n\
       const descriptors = Object.getOwnPropertyDescriptors(proto);\n\
       Object.keys(descriptors).forEach((key) => {\n\
         if (descriptors[key].set && key !== 'innerHTML' && key !== 'textContent'\n\
           && key !== 'innerText') setters.add(key);\n\
       });\n\
       return $$collect_setters(Object.getPrototypeOf(proto), setters);\n\
     };\n\
     const $$setters = (el) => {\n\
       const id = el.getAttribute('is') || el.nodeName;\n\
       let setters = $$setters_cache.get(id);\n\
       if (setters) return setters;\n\
       $$setters_cache.set(id, (setters = new Set()));\n\
       return $$collect_setters(el, setters);\n\
     };\n\
     const $$uninitialized = Symbol();\n\
     const $$set_attribute = (el, name, value) => {\n\
       const cache = el.$$attributes;\n\
       if (cache[name] === (cache[name] = value)) return;\n\
       if (value == null) el.removeAttribute(name);\n\
       else if (typeof value !== 'string' && $$setters(el).has(name)) el[name] = value;\n\
       else el.setAttribute(name, value);\n\
     };\n\
     const $$aliases = { formnovalidate: 'formNoValidate', ismap: 'isMap', nomodule: 'noModule',\n\
       playsinline: 'playsInline', readonly: 'readOnly', defaultvalue: 'defaultValue',\n\
       defaultchecked: 'defaultChecked', srcobject: 'srcObject', novalidate: 'noValidate',\n\
       allowfullscreen: 'allowFullscreen', disablepictureinpicture: 'disablePictureInPicture',\n\
       disableremoteplayback: 'disableRemotePlayback' };\n\
     const $$delegated = ['beforeinput', 'click', 'change', 'dblclick', 'contextmenu', 'focusin',\n\
       'focusout', 'input', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseout',\n\
       'mouseover',\n\
       'mouseup', 'pointerdown', 'pointermove', 'pointerout', 'pointerover', 'pointerup',\n\
       'touchend', 'touchmove', 'touchstart'];\n\
     const $$set_event = (el, current, key, value, prev_value) => {\n\
       let name = key.slice(2);\n\
       const delegated = $$delegated.includes(name);\n\
       const capture = name.endsWith('capture') && name !== 'gotpointercapture'\n\
         && name !== 'lostpointercapture';\n\
       if (capture) name = name.slice(0, -7);\n\
       const opts = capture ? { capture: true } : {};\n\
       if (!delegated && prev_value) {\n\
         if (value != null) return;\n\
         el.removeEventListener(name, current['$$' + key], opts);\n\
         current['$$' + key] = null;\n\
       }\n\
       if (delegated) {\n\
         el['__' + name] = value;\n\
         if (el['$$delegate_' + name]) return;\n\
         el['$$delegate_' + name] = true;\n\
         el.addEventListener(name, (evt) => {\n\
           const handler = el['__' + name];\n\
           if (handler != null && (!el.disabled || evt.target === el)) {\n\
             if (Array.isArray(handler)) handler[0].apply(el, [evt, ...handler.slice(1)]);\n\
             else handler.call(el, evt);\n\
           }\n\
         }, { passive: name === 'touchstart' || name === 'touchmove' });\n\
       } else if (value != null) {\n\
         const handle = function (evt) {\n\
           if (!evt.cancelBubble) current[key].call(this, evt);\n\
         };\n\
         current['$$' + key] = handle;\n\
         if (name.startsWith('pointer') || name.startsWith('touch') || name === 'wheel') {\n\
           queueMicrotask(() => el.addEventListener(name, handle, opts));\n\
         } else {\n\
           el.addEventListener(name, handle, opts);\n\
         }\n\
       }\n\
     };\n\
     const $$set_key = (el, cache, prev, current, setters, key, value) => {\n\
       const custom = el.nodeName.includes('-');\n\
       if (key === 'class') {\n\
         if (el.$$class !== value || el.$$class === undefined) {\n\
           const name = $$to_class(value);\n\
           if (name == null) el.removeAttribute('class');\n\
           else el.setAttribute('class', name);\n\
           el.$$class = value;\n\
         }\n\
         current[key] = value;\n\
         return;\n\
       }\n\
       if (key === 'style') {\n\
         if (el.$$style !== value) {\n\
           if (value == null) el.removeAttribute('style');\n\
           else el.style.cssText = String(value);\n\
           el.$$style = value;\n\
         }\n\
         current[key] = value;\n\
         return;\n\
       }\n\
       const prev_value = current[key];\n\
       if (value === prev_value && !(value === undefined && el.hasAttribute(key))) return;\n\
       current[key] = value;\n\
       const prefix = key[0] + key[1];\n\
       if (prefix === '$$') return;\n\
       if (prefix === 'on') {\n\
         $$set_event(el, current, key, value, prev_value);\n\
       } else if (key === 'autofocus') {\n\
         if (value) {\n\
           const body = document.body;\n\
           el.autofocus = true;\n\
           queueMicrotask(() => {\n\
             if (document.activeElement === body) el.focus();\n\
           });\n\
         }\n\
       } else if (!custom && (key === '__value' || (key === 'value' && value != null))) {\n\
         el.value = el.__value = value;\n\
       } else {\n\
         const lower = key.toLowerCase();\n\
         const name = el.namespaceURI === 'http://www.w3.org/1999/xhtml' ? ($$aliases[lower] ?? \
         lower) : key;\n\
         const is_default = name === 'defaultValue' || name === 'defaultChecked';\n\
         if (value == null && !custom && !is_default) {\n\
           cache[key] = null;\n\
           if (name === 'value') {\n\
             const previous = el.defaultValue;\n\
             el.removeAttribute(name);\n\
             el.defaultValue = previous;\n\
             el.value = el.__value = prev === undefined ? previous : null;\n\
           } else if (name === 'checked') {\n\
             const previous = el.defaultChecked;\n\
             el.removeAttribute(name);\n\
             el.defaultChecked = previous;\n\
             el.checked = prev === undefined ? previous : false;\n\
           } else {\n\
             el.removeAttribute(key);\n\
           }\n\
         } else if (is_default || ((custom || typeof value !== 'string') && setters.has(name))) {\n\
           el[name] = value;\n\
           if (name in cache) cache[name] = $$uninitialized;\n\
         } else if (typeof value !== 'function') {\n\
           $$set_attribute(el, name, value);\n\
         }\n\
       }\n\
     };\n\
     const $$attributes = (el, next) => {\n\
       el.$$attributes ??= {};\n\
       const prev = el.$$prev;\n\
       const current = prev || {};\n\
       if (prev) {\n\
         Object.keys(prev).forEach((key) => {\n\
           if (!(key in next) && key[0] + key[1] !== '$$') next[key] = null;\n\
         });\n\
       }\n\
       if (next.class) next.class = $$sclsx(next.class);\n\
       const setters = $$setters(el);\n\
       Object.keys(next).forEach((key) =>\n\
         $$set_key(el, el.$$attributes, prev, current, setters, key, next[key]));\n\
       $$spread_attachments(el, next);\n\
       el.$$prev = current;\n\
     };";

// `attributes` with `attr` for an HTML element that is not an `<input>` or `<textarea>`, as Vue
// props: a `^` key is printed as an attribute under its own name whatever Vue reserves it for,
// `true` as a present boolean attribute. The HTML parser keeps the first of two attributes of one
// name. Vue prints `itemscope` and `scoped` as boolean attributes, which Svelte does not.
// `events`: the load and error events Svelte's server marks on an element that fires them.
const SPREAD: &str = "     const $$invalid_name = (name) => name === '' || \
       Array.from(name).some((ch) => {\n\
       const c = ch.codePointAt(0);\n\
       return ch.trim() === '' || [\"'\", '\"', '>', '/', '='].includes(ch)\n\
         || (c >= 64976 && c <= 65007) || (c & 65534) === 65534;\n\
     });\n\
     const $$spread_key = (out, key, value, preserve, html) => {\n\
       if (typeof value === 'function') return;\n\
       if (key[0] === '$' && key[1] === '$') return;\n\
       if ($$invalid_name(key)) return;\n\
       const lower = key.toLowerCase();\n\
       const name = preserve ? key : lower;\n\
       if (lower.length > 2 && lower.startsWith('on')) return;\n\
       const boolean = html && ((name === 'hidden' && value !== 'until-found')\n\
         || $$booleans.includes(name));\n\
       if (value == null || (boolean && !value && value !== '')) return;\n\
       if ('^' + name in out) return;\n\
       if (boolean) {\n\
         out['^' + name] = true;\n\
         return;\n\
       }\n\
       const replaced = name === 'translate'\n\
         && (value === true ? 'yes' : value === false ? 'no' : '');\n\
       const text = String(replaced || value);\n\
       if ((name === 'itemscope' || name === 'scoped') && text !== '') {\n\
         $$fail('Vue renders `' + name + '` as a boolean attribute');\n\
       }\n\
       out['^' + name] = text;\n\
     };\n\
     const $$spread = (attrs, events, preserve = false, html = true) => {\n\
       if (attrs.class) attrs.class = $$sclsx(attrs.class);\n\
       const out = {};\n\
       Object.keys(attrs).forEach((key) => $$spread_key(out, key, attrs[key], preserve, html));\n\
       if (events) events.forEach((e) => { out['^' + e] = 'this.__e=event'; });\n\
       return out;\n\
     };";

/// The helpers `h` calls.
#[must_use]
pub const fn requires(h: Helper) -> &'static [Helper] {
    match h {
        Helper::Animate => &[Helper::Transition, Helper::Lifecycle],
        Helper::Boundary
        | Helper::Transition
        | Helper::PropertyBinding
        | Helper::MediaBinding
        | Helper::ResizeBinding
        | Helper::WindowScroll
        | Helper::FormReset => &[Helper::Lifecycle],
        Helper::ClassSpread => &[Helper::Clsx, Helper::ToClass],
        Helper::Class | Helper::ScopedClass => &[Helper::Clsx],
        Helper::SetClass => &[Helper::ToClass],
        Helper::Attributes => &[
            Helper::Clsx,
            Helper::ToClass,
            Helper::Fail,
            Helper::Lifecycle,
        ],
        Helper::Spread => &[Helper::Clsx, Helper::Fail],
        _ => &[],
    }
}

/// The declarations of `helpers`, in the order given, built into `to`.
///
/// # Panics
///
/// If a helper's source does not parse, which the unit tests rule out.
pub fn declarations(helpers: &[Helper], to: &mut SyntaxTree) -> Vec<NodeIdentifier> {
    let mut out = Vec::new();
    for &h in helpers {
        if h == Helper::Spread {
            out.push(boolean_names("$$booleans", to));
        }
        out.extend(source_declarations(h.source(), to));
    }
    out
}

pub(crate) fn boolean_names(name: &str, to: &mut SyntaxTree) -> NodeIdentifier {
    let values: Vec<_> = rsvelte_svelte_compile::lower::DOM_BOOLEAN_ATTRIBUTES
        .iter()
        .map(|name| to.write_string(name))
        .collect();
    let value = to.array(&values, SourceLocation::SYNTHETIC);
    let name = to.identifier(name);
    to.let_(
        rsvelte_typescript::syntax_tree::flag::CONST,
        name,
        Some(value),
    )
}

pub(crate) fn source_declarations(source_text: &str, to: &mut SyntaxTree) -> Vec<NodeIdentifier> {
    let mut scratch = SyntaxTree::new();
    let range = Span::new(0, u32::try_from(source_text.len()).expect("a short helper"));
    let program =
        rsvelte_typescript::parser::parse_program(&mut scratch, source_text, range, false)
            .expect("helper sources parse");
    let Kind::Program(body) = scratch.kind(program) else {
        unreachable!("a program")
    };
    let mut rewriter = Synthetic { source_text };
    body.iter()
        .map(|&s| copy(&scratch, to, &mut rewriter, s))
        .collect()
}

/// Leaves that codegen prints from their source span are rebuilt without one: the helper's
/// source is not the document's.
struct Synthetic<'a> {
    source_text: &'a str,
}

impl Rewrite for Synthetic<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        Some(match from.kind(identifier) {
            Kind::Identifier(_) => to.ident(from.name(identifier), SourceLocation::SYNTHETIC),
            Kind::Number(v) => to.write_number(v, SourceLocation::SYNTHETIC),
            Kind::String => to.write_string(from.str_value(identifier, self.source_text)),
            Kind::Template {
                quasis,
                expressions,
            } => {
                let q: Vec<NodeIdentifier> = quasis
                    .iter()
                    .map(|&q| {
                        let Kind::TemplateElement { tail } = from.kind(q) else {
                            unreachable!("a template's quasis are elements")
                        };
                        to.template_element(from.str_value(q, self.source_text), tail)
                    })
                    .collect();
                let e: Vec<NodeIdentifier> = expressions
                    .iter()
                    .map(|&e| copy(from, to, self, e))
                    .collect();
                to.template(&q, &e, SourceLocation::SYNTHETIC)
            }
            _ => return None,
        })
    }
}

const RAW_MARKUP: &str = "const $$raw_markup = (value, namespace) => { const template = namespace \
    ? document.createElementNS(namespace, namespace.endsWith('svg') ? 'svg' : 'math') : \
    document.createElement('template'); template.innerHTML = value == null ? '' : value; return \
    Array.from((namespace ? template : template.content).childNodes); };";

const SCOPED_CLASS: &str = "const $$scoped_class = (value, hash) => { const name = $$sclsx(value); \
    return name == null || name === '' ? hash : name + ' ' + hash; }; const $$scoped_spread = \
    (value, hash) => ({ ...value, class: $$scoped_class(value.class, hash) });";
