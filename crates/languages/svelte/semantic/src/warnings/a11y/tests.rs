use crate::warnings::tests::messages;

fn pair(code: &str, message: &str) -> (String, String) {
    (code.to_owned(), message.to_owned())
}

#[test]
fn a_div_with_a_click_handler_needs_a_key_handler_and_a_role() {
    assert_eq!(
        messages("<div onclick={() => {}} onmouseover={() => {}}></div>"),
        [
            pair(
                "a11y_click_events_have_key_events",
                "Visible, non-interactive element `<div>` with a click event must be accompanied \
                    by a keyboard event handler. Consider whether an interactive element such as \
                    `<button type=\"button\">` or `<a>` might be more appropriate"
            ),
            pair(
                "a11y_no_static_element_interactions",
                "`<div>` with a click or mouseover handler must have an ARIA role"
            ),
            pair(
                "a11y_mouse_events_have_key_events",
                "'mouseover' event must be accompanied by 'focus' event"
            ),
        ]
    );
}

#[test]
fn a_link_needs_a_label_and_somewhere_to_go() {
    assert_eq!(
        messages("<a href=\"#\"></a><button aria-hidden=\"\"></button>"),
        [
            pair(
                "a11y_consider_explicit_label",
                "Buttons and links should either contain text or have an `aria-label`, \
                    `aria-labelledby` or `title` attribute"
            ),
            pair(
                "a11y_invalid_attribute",
                "'#' is not a valid href attribute"
            ),
            pair(
                "a11y_incorrect_aria_attribute_type_boolean",
                "The value of 'aria-hidden' must be either 'true' or 'false'. It cannot be empty"
            ),
            pair(
                "a11y_consider_explicit_label",
                "Buttons and links should either contain text or have an `aria-label`, \
                    `aria-labelledby` or `title` attribute"
            ),
        ]
    );
}

#[test]
fn a_role_is_checked_token_by_token() {
    assert_eq!(
        messages(
            "<ul><li><figure role=\"figure\"><img alt=\"\" /></figure></li></ul><div \
                role=\"buton\"></div><article role=\"button\"></article>"
        ),
        [
            pair("a11y_no_redundant_roles", "Redundant role 'figure'"),
            pair(
                "a11y_unknown_role",
                "Unknown role 'buton'. Did you mean 'button'?"
            ),
            pair(
                "a11y_no_noninteractive_element_to_interactive_role",
                "Non-interactive element `<article>` cannot have interactive role 'button'"
            ),
        ]
    );
}
