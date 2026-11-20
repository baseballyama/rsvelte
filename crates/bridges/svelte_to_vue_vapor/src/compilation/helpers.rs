//! The setup-scope helpers the translated template calls: Svelte's runtime behaviour where Vue's
//! differs, written as JavaScript and parsed into the component's tree.

use oxc_ast::ast::Statement;
use rsvelte_typescript_compile::build::Builder;

use crate::compilation::prelude;

/// Declares `Helper` and, for the tests, `Helper::ALL` from one list, so neither can miss a
/// variant.
macro_rules! helpers {
    ($($(#[$doc:meta])* $variant:ident,)*) => {
        #[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
        pub(crate) enum Helper {
            $($(#[$doc])* $variant,)*
        }

        impl Helper {
            #[cfg(test)]
            pub(crate) const ALL: &[Self] = &[$(Self::$variant,)*];
        }
    };
}

helpers! {
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
            Self::RawMarkup => include_str!("helpers/raw_markup.js"),
            Self::Style => include_str!("helpers/style.js"),
            Self::ScopedClass => include_str!("helpers/scoped_class.js"),
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
            Self::Clsx => include_str!("helpers/clsx.js"),
            Self::Class => include_str!("helpers/class.js"),
            Self::ToClass => include_str!("helpers/to_class.js"),
            Self::SetClass => include_str!("helpers/set_class.js"),
            // Not `throw`: the snapshots and behaviour tests compare this `TypeError` and text.
            Self::Fail => {
                "const $$fail = (message) => Object.defineProperty(Object.preventExtensions({}), \
                 'vuelte: ' + message, { value: 0 });"
            }
            Self::Attributes => include_str!("helpers/attributes.js"),
            Self::Spread => include_str!("helpers/spread.js"),
            Self::Value => include_str!("helpers/value.js"),
            Self::Once => include_str!("helpers/once.js"),
            Self::Select => include_str!("helpers/select.js"),
            Self::Option => include_str!("helpers/option.js"),
        }
    }
}

/// The helpers `h` calls.
#[must_use]
pub(crate) const fn requires(h: Helper) -> &'static [Helper] {
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

/// Markers for the declarations of `helpers`, in the order given.
pub(crate) fn declarations<'t>(helpers: &[Helper], b: &Builder<'t>) -> Vec<Statement<'t>> {
    let mut out = Vec::new();
    for &h in helpers {
        if h == Helper::Spread {
            out.push(boolean_names("$$booleans", b));
        }
        out.push(prelude::marker(b, h.source()));
    }
    out
}

/// `const name = [...]`: the names of the DOM's boolean attributes.
pub(crate) fn boolean_names<'t>(name: &str, b: &Builder<'t>) -> Statement<'t> {
    let values = rsvelte_svelte_compile::lower::DOM_BOOLEAN_ATTRIBUTES
        .iter()
        .map(|name| b.string(name));
    b.const_(name, b.array(values))
}
