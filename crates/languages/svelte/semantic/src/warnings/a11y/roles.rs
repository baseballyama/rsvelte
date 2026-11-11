//! The `role` attribute: its tokens, the element's implicit role, and the checks of each token.

use std::borrow::Cow;

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Attribute;

use super::{Attributes, Element, Interactivity, Static, static_value, tables, values};

/// A role as `check_element` compares it: a known role, or the attribute's whole value.
pub(super) struct Role<'a>(Cow<'a, str>);

impl<'a> Role<'a> {
    /// `get_effective_role`: the first known, non-abstract token, else the value as written.
    pub(super) fn effective(value: &Cow<'a, str>) -> Self {
        let known = role_tokens(value)
            .into_iter()
            .find(|role| tables::ARIA_ROLES.contains(&role.as_str()) && !is_abstract(role));
        Self(known.map_or_else(|| value.clone(), Cow::Owned))
    }

    pub(super) fn name(&self) -> &str {
        &self.0
    }

    pub(super) fn is_presentation(&self) -> bool {
        tables::PRESENTATION_ROLES.contains(&self.name())
    }

    pub(super) fn is_interactive(&self) -> bool {
        tables::INTERACTIVE_ROLES.contains(&self.name())
    }

    pub(super) fn is_non_interactive(&self) -> bool {
        tables::NON_INTERACTIVE_ROLES.contains(&self.name())
    }

    pub(super) fn is_abstract(&self) -> bool {
        is_abstract(self.name())
    }
}

fn is_abstract(role: &str) -> bool {
    tables::ABSTRACT_ROLES.contains(&role)
}

/// `get_role_tokens`: ASCII-lowercased, split at runs of ASCII whitespace, empty ends kept.
pub(super) fn role_tokens(value: &str) -> Vec<String> {
    values::split_runs(value, |c| matches!(c, ' ' | '\t' | '\n' | '\r' | '\u{c}'))
        .map(str::to_ascii_lowercase)
        .collect()
}

/// `get_implicit_role`.
pub(super) fn implicit_role(name: &str, attributes: &Attributes<'_>) -> Option<&'static str> {
    let lookup = |table: &[(&str, &'static str)], key: &str| {
        table.iter().find(|(k, _)| *k == key).map(|(_, role)| *role)
    };
    match name {
        "menuitem" => {
            let kind = attributes.text("type").filter(|t| !t.is_empty())?;
            lookup(tables::MENUITEM_TYPE_TO_IMPLICIT_ROLE, &kind)
        }
        "input" => {
            let kind = attributes.text("type").filter(|t| !t.is_empty())?;
            if attributes.has("list") && tables::COMBOBOX_IF_LIST.contains(&kind.as_ref()) {
                return Some("combobox");
            }
            lookup(tables::INPUT_TYPE_TO_IMPLICIT_ROLE, &kind)
        }
        _ => lookup(tables::IMPLICIT_SEMANTICS, name),
    }
}

/// `is_semantic_role_element`. A schema attribute without a value never matches, as upstream
/// compares it with `undefined`.
fn is_semantic_role_element(role: &str, name: &str, attributes: &Attributes<'_>) -> bool {
    tables::SEMANTIC_ROLE_ELEMENTS
        .iter()
        .any(|((tag, required), roles)| {
            *tag == name
                && required.iter().all(|(attribute, value)| {
                    value.is_some_and(|v| attributes.text(attribute).as_deref() == Some(v))
                })
                && roles.contains(&role)
        })
}

impl Element<'_, '_> {
    /// The checks of a `role` attribute, token by token.
    pub(super) fn role_attribute(&mut self, attribute: &Attribute) {
        let element = self.name;
        let span = attribute.span;
        if tables::INVISIBLE_ELEMENTS.contains(&element) {
            let message = format!("`<{element}>` should not have role attribute");
            self.warn("a11y_misplaced_role", &message, span);
        }
        let Static::Text(value) = static_value(self.component, self.source, attribute) else {
            return;
        };
        for role in role_tokens(&value) {
            self.role_token(&role, span);
        }
    }

    fn role_token(&mut self, role: &str, span: Span) {
        let element = self.name;
        if !role.is_empty() && is_abstract(role) {
            let message = format!("Abstract role '{role}' is forbidden");
            self.warn("a11y_no_abstract_role", &message, span);
        } else if !role.is_empty() && !tables::ARIA_ROLES.contains(&role) {
            let message = super::super::fuzzymatch::fuzzymatch(role, tables::ARIA_ROLES)
                .map_or_else(
                    || format!("Unknown role '{role}'"),
                    |suggestion| format!("Unknown role '{role}'. Did you mean '{suggestion}'?"),
                );
            self.warn("a11y_unknown_role", &message, span);
        }
        let a = &self.attributes;
        let a_without_href = matches!(element, "a" | "area") && !a.has("href");
        if implicit_role(element, a) == Some(role)
            && !matches!(element, "ul" | "ol" | "li" | "menu")
            && !a_without_href
        {
            self.redundant(role, span);
        }
        if !self.parent.is(&["section", "article"])
            && tables::NESTED_IMPLICIT_SEMANTICS
                .iter()
                .any(|(tag, nested)| *tag == element && *nested == role)
        {
            self.redundant(role, span);
        }
        let a = &self.attributes;
        if !self.dynamic
            && !is_semantic_role_element(role, element, a)
            && let Some((_, _, required)) = tables::ROLES.iter().find(|(r, ..)| *r == role)
            && !a.spread
            && required
                .iter()
                .any(|prop| !a.list.iter().any(|x| x.name.text(self.source) == *prop))
        {
            let props: Vec<String> = required.iter().map(|p| format!("\"{p}\"")).collect();
            let props: Vec<&str> = props.iter().map(String::as_str).collect();
            let message = format!(
                "Elements with the ARIA role \"{role}\" must have the following attributes \
                    defined: {}",
                values::list(&props, "and")
            );
            self.warn("a11y_role_has_required_aria_props", &message, span);
        }
        let a = &self.attributes;
        let presentation = tables::PRESENTATION_ROLES.contains(&role);
        let interactive_role = tables::INTERACTIVE_ROLES.contains(&role);
        let non_interactive_role = tables::NON_INTERACTIVE_ROLES.contains(&role);
        let disabled = a.truthy("disabled") || a.is_true("aria-disabled");
        let tabindex = a.has("tabindex");
        if !a.spread
            && !disabled
            && !self.hidden_from_screen_reader()
            && !presentation
            && interactive_role
            && self.interactivity == Interactivity::Static
            && !tabindex
            && a.handlers
                .iter()
                .any(|h| tables::INTERACTIVE_HANDLERS.contains(h))
        {
            let message =
                format!("Elements with the '{role}' interactive role must have a tabindex value");
            self.warn("a11y_interactive_supports_focus", &message, self.span);
        }
        let a = &self.attributes;
        if !a.spread
            && self.interactivity == Interactivity::Interactive
            && (non_interactive_role || presentation)
        {
            let message = format!("`<{element}>` cannot have role '{role}'");
            self.warn(
                "a11y_no_interactive_element_to_noninteractive_role",
                &message,
                self.span,
            );
        }
        let a = &self.attributes;
        let excepted = tables::NON_INTERACTIVE_ELEMENT_TO_INTERACTIVE_ROLE_EXCEPTIONS
            .iter()
            .any(|(tag, roles)| *tag == element && roles.contains(&role));
        if !a.spread
            && self.interactivity == Interactivity::NonInteractive
            && interactive_role
            && !excepted
        {
            let message = format!(
                "Non-interactive element `<{element}>` cannot have interactive role '{role}'"
            );
            self.warn(
                "a11y_no_noninteractive_element_to_interactive_role",
                &message,
                self.span,
            );
        }
    }

    fn redundant(&mut self, role: &str, span: Span) {
        let message = format!("Redundant role '{role}'");
        self.warn("a11y_no_redundant_roles", &message, span);
    }
}
