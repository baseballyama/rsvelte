/// `isOn`: `on` followed by a character that is not a lower-case letter.
pub(super) fn is_on(key: &str) -> bool {
    let b = key.as_bytes();
    b.len() > 2 && b.starts_with(b"on") && !b[2].is_ascii_lowercase()
}

/// `isReservedProperty`.
pub(super) fn is_reserved(key: &str) -> bool {
    matches!(
        key,
        "" | "key"
            | "ref"
            | "ref_for"
            | "ref_key"
            | "onVnodeBeforeMount"
            | "onVnodeMounted"
            | "onVnodeBeforeUpdate"
            | "onVnodeUpdated"
            | "onVnodeBeforeUnmount"
            | "onVnodeUnmounted"
    )
}

/// compiler-dom `isKeyboardEvent`.
pub(super) fn is_keyboard_event(key: &str) -> bool {
    matches!(key, "onkeyup" | "onkeydown" | "onkeypress")
}

/// compiler-dom `resolveModifiers` for a static event name: the key modifiers, the others, and
/// the event options.
pub(super) fn resolve_modifiers<'m>(
    key: &str,
    modifiers: &[&'m str],
) -> (Vec<&'m str>, Vec<&'m str>, Vec<&'m str>) {
    let (mut keys, mut non_keys, mut options) = (Vec::new(), Vec::new(), Vec::new());
    for &m in modifiers {
        match m {
            "passive" | "once" | "capture" => options.push(m),
            "left" | "right" if is_keyboard_event(&key.to_ascii_lowercase()) => keys.push(m),
            "left" | "right" | "stop" | "prevent" | "self" | "ctrl" | "shift" | "alt" | "meta"
            | "exact" | "middle" => non_keys.push(m),
            _ => keys.push(m),
        }
    }
    (keys, non_keys, options)
}
