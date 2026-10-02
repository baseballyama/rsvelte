use super::{Piece, is_load_error_element};

pub(super) fn capture_event<'a>(events: &mut Vec<&'a str>, tag: &str, name: &'a str) {
    if matches!(name, "onload" | "onerror") && is_load_error_element(tag) && !events.contains(&name)
    {
        events.push(name);
    }
}

pub(super) fn push_captured_events(template: &mut Vec<Piece>, events: &[&str]) {
    for e in events {
        template.push(Piece::Text(format!(" {e}=\"this.__e=event\"")));
    }
}
