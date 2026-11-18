use super::{Template, is_load_error_element};

pub(super) fn capture_event<'a>(events: &mut Vec<&'a str>, tag: &str, name: &'a str) {
    if matches!(name, "onload" | "onerror") && is_load_error_element(tag) && !events.contains(&name)
    {
        events.push(name);
    }
}

/// Both load events, which a spread or an action may add listeners for.
pub(super) fn capture_load_events(events: &mut Vec<&str>, tag: &str) {
    capture_event(events, tag, "onload");
    capture_event(events, tag, "onerror");
}

pub(super) fn push_captured_events(template: &mut Template<'_, '_>, events: &[&str]) {
    for e in events {
        template.text_fmt(format_args!(" {e}=\"this.__e=event\""));
    }
}
