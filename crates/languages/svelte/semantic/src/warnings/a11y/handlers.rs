//! The checks of an element's event handlers and of its role as a whole.

use super::roles::{Role, implicit_role};
use super::values::{list, number};
use super::{Element, Interactivity, Static, tables};

impl Element<'_, '_> {
    /// The checks of the element's handlers and its role as a whole.
    pub(super) fn handlers(&mut self) {
        let a = &self.attributes;
        let role = a.get("role");
        let static_role = a.text("role").map(|v| Role::effective(&v));
        let presentation = static_role.as_ref().is_some_and(Role::is_presentation);
        let hidden = self.hidden_from_screen_reader();
        let interactive = self.interactive();
        let non_interactive = self.interactivity == Interactivity::NonInteractive;
        let span = self.span;
        let name = self.name;
        if a.handles("click")
            && !self.dynamic
            && !hidden
            && (role.is_none() || (static_role.is_some() && !presentation))
            && !interactive
            && !a.spread
            && !(a.handles("keydown") || a.handles("keyup") || a.handles("keypress"))
        {
            let message = format!(
                "Visible, non-interactive element `<{name}>` with a click event must be \
                    accompanied by a keyboard event handler. Consider whether an interactive \
                    element such as `<button type=\"button\">` or `<a>` might be more appropriate"
            );
            self.warn("a11y_click_events_have_key_events", &message, span);
        }
        let a = &self.attributes;
        let interactive_role = static_role.as_ref().is_some_and(Role::is_interactive);
        if !self.dynamic && !interactive && !interactive_role && a.has("tabindex") {
            let value = a.text("tabindex");
            if value.is_none_or(|v| number(&v) >= 0.0) {
                self.warn(
                    "a11y_no_noninteractive_tabindex",
                    "noninteractive element cannot have nonnegative tabIndex value",
                    span,
                );
            }
        }
        self.supported_props(role.is_some(), static_role.as_ref());
        let a = &self.attributes;
        let non_interactive_role = static_role.as_ref().is_some_and(Role::is_non_interactive);
        let handles = |list: &[&str]| a.handlers.iter().any(|h| list.contains(h));
        if !a.spread
            && !a.contenteditable_attribute
            && !hidden
            && !presentation
            && ((!interactive && non_interactive_role) || (non_interactive && role.is_none()))
            && handles(tables::RECOMMENDED_INTERACTIVE_HANDLERS)
        {
            let message = format!(
                "Non-interactive element `<{name}>` should not be assigned mouse or keyboard event \
                    listeners"
            );
            self.warn(
                "a11y_no_noninteractive_element_interactions",
                &message,
                span,
            );
        }
        let a = &self.attributes;
        let abstract_role = static_role.as_ref().is_some_and(Role::is_abstract);
        if !a.spread
            && (role.is_none() || static_role.is_some())
            && !hidden
            && !presentation
            && !interactive
            && !interactive_role
            && !non_interactive
            && !non_interactive_role
            && !abstract_role
        {
            let interactive_handlers: Vec<&str> = a
                .handlers
                .iter()
                .copied()
                .filter(|h| tables::INTERACTIVE_HANDLERS.contains(h))
                .collect();
            if !interactive_handlers.is_empty() {
                let message = format!(
                    "`<{name}>` with a {} handler must have an ARIA role",
                    list(&interactive_handlers, "or")
                );
                self.warn("a11y_no_static_element_interactions", &message, span);
            }
        }
        let a = &self.attributes;
        let mouse = [
            ("mouseover", "focus", "focusin"),
            ("mouseout", "blur", "focusout"),
        ];
        for (event, key, bubbling) in mouse {
            if !a.spread && a.handles(event) && !a.handles(key) && !a.handles(bubbling) {
                let message = format!("'{event}' event must be accompanied by '{key}' event");
                self.out.push(super::super::warning(
                    "a11y_mouse_events_have_key_events",
                    &message,
                    span,
                ));
            }
        }
    }

    /// `role-supports-aria-props`: the element's ARIA attributes its role does not support.
    fn supported_props(&mut self, has_role: bool, static_role: Option<&Role<'_>>) {
        let implicit;
        let role = if has_role {
            match static_role {
                Some(role) => role.name(),
                None => return,
            }
        } else {
            implicit = implicit_role(self.name, &self.attributes);
            match implicit {
                Some(role) => role,
                None => return,
            }
        };
        let Some(&(_, props, _)) = tables::ROLES.iter().find(|(r, ..)| *r == role) else {
            return;
        };
        let attributes = self.attributes.list.clone();
        for attribute in attributes {
            let name = attribute.name.text(self.source);
            let unsupported =
                tables::PROPERTIES.iter().any(|(p, ..)| *p == name) && !props.contains(&name);
            if !unsupported {
                continue;
            }
            let message = if has_role {
                format!("The attribute '{name}' is not supported by the role '{role}'")
            } else {
                format!(
                    "The attribute '{name}' is not supported by the role '{role}'. This role is \
                        implicit on the element `<{}>`",
                    self.name
                )
            };
            let code = if has_role {
                "a11y_role_supports_aria_props"
            } else {
                "a11y_role_supports_aria_props_implicit"
            };
            self.warn(code, &message, attribute.span);
        }
    }

    /// `is_hidden_from_screen_reader`.
    pub(super) fn hidden_from_screen_reader(&self) -> bool {
        let a = &self.attributes;
        if self.name == "input" && a.text("type").as_deref() == Some("hidden") {
            return true;
        }
        a.has("aria-hidden")
            && match a.value("aria-hidden") {
                Static::Unknown | Static::Bare => true,
                Static::Text(text) => text == "true",
            }
    }
}
