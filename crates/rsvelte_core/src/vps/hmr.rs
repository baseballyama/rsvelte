//! Decide whether a `.svelte` source change is a template-only edit
//! (Vite can patch the running module) or an instance/module-script
//! edit (full module reload).
//!
//! Mirrors the JS reference's
//! `apps/npm/vite-plugin-svelte/src/plugins/hot-update.js`
//! but at a coarser level: we compare the verbatim text of the
//! `<script>` and `<script context="module">` blocks. A subsequent
//! milestone may swap this for an AST-based diff that ignores
//! whitespace / comments.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum HmrChange {
    /// Both `<script>` blocks are byte-identical to the previous version.
    /// Vite can apply a module-level patch without re-running side
    /// effects.
    HotUpdate,
    /// At least one `<script>` block changed (or was added/removed) →
    /// the whole module has to re-execute, which means a full reload.
    FullReload,
    /// `prev` and `curr` are byte-identical → no change at all.
    Unchanged,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HmrDiff {
    pub change: HmrChange,
    /// True when the instance `<script>` body changed.
    pub instance_changed: bool,
    /// True when the `<script context="module">` body changed.
    pub module_changed: bool,
}

/// Diff two versions of a `.svelte` source.
///
/// The check is intentionally conservative: any whitespace-level change
/// inside a script block triggers `FullReload`. This is the same
/// trade-off the JS reference makes — it parses both versions and
/// compares the script-tag body strings.
pub fn hmr_diff(prev: &str, curr: &str) -> HmrDiff {
    if prev == curr {
        return HmrDiff {
            change: HmrChange::Unchanged,
            instance_changed: false,
            module_changed: false,
        };
    }
    let prev_module = extract_script(prev, true);
    let curr_module = extract_script(curr, true);
    let prev_instance = extract_script(prev, false);
    let curr_instance = extract_script(curr, false);

    let module_changed = prev_module != curr_module;
    let instance_changed = prev_instance != curr_instance;

    let change = if module_changed || instance_changed {
        HmrChange::FullReload
    } else {
        HmrChange::HotUpdate
    };
    HmrDiff {
        change,
        instance_changed,
        module_changed,
    }
}

/// Lexically pull out the body of `<script>` (when `module=false`) or the
/// module script — both the Svelte 5 bare `<script module>` and the legacy
/// `<script context="module">` (when `module=true`). Returns `None` when the
/// requested script tag is absent.
fn extract_script(source: &str, module: bool) -> Option<String> {
    let bytes = source.as_bytes();
    let mut i = 0;
    while let Some(open) = source[i..].find("<script") {
        let abs_open = i + open;
        let after_open = abs_open + "<script".len();
        // Find the closing `>` of the opening tag.
        let close_attrs = {
            let p = source[after_open..].find('>')?;
            after_open + p
        };
        let tag_attrs = &source[after_open..close_attrs];
        let is_module = is_module_script_attrs(tag_attrs);
        let body_start = close_attrs + 1;
        // Find the closing `</script>`.
        let body_end = match source[body_start..].find("</script>") {
            Some(p) => body_start + p,
            None => bytes.len(),
        };
        let next_i = (body_end + "</script>".len()).min(bytes.len());
        if module == is_module {
            // Found the kind we're looking for.
            return Some(source[body_start..body_end].to_string());
        }
        i = next_i;
        // Don't loop forever if we somehow stay at the same position.
        if i <= abs_open {
            break;
        }
    }
    None
}

/// Decide whether a `<script …>` opening tag's attribute text marks a module
/// script. Recognises the legacy `context="module"` forms and the Svelte 5
/// bare `module` attribute (H-094). The bare form is matched as a standalone
/// token so it isn't confused with `module` appearing inside another
/// attribute's quoted value.
fn is_module_script_attrs(tag_attrs: &str) -> bool {
    if tag_attrs.contains("context=\"module\"")
        || tag_attrs.contains("context='module'")
        || tag_attrs.contains("context=module")
    {
        return true;
    }
    let bytes = tag_attrs.as_bytes();
    let mut from = 0;
    while let Some(rel) = tag_attrs[from..].find("module") {
        let start = from + rel;
        let end = start + "module".len();
        let prev_ok = start == 0 || bytes[start - 1].is_ascii_whitespace();
        let next_ok = end >= bytes.len()
            || matches!(
                bytes[end],
                b' ' | b'\t' | b'\n' | b'\r' | b'=' | b'/' | b'>'
            );
        if prev_ok && next_ok {
            return true;
        }
        from = end;
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn unchanged_is_unchanged() {
        let s = "<script>let x = 1;</script><div>hi</div>";
        let d = hmr_diff(s, s);
        assert_eq!(d.change, HmrChange::Unchanged);
    }

    #[test]
    fn template_only_change_is_hot_update() {
        let prev = "<script>let x = 1;</script><div>old</div>";
        let curr = "<script>let x = 1;</script><div>new</div>";
        let d = hmr_diff(prev, curr);
        assert_eq!(d.change, HmrChange::HotUpdate);
        assert!(!d.instance_changed && !d.module_changed);
    }

    #[test]
    fn instance_script_change_forces_full_reload() {
        let prev = "<script>let x = 1;</script><div>{x}</div>";
        let curr = "<script>let x = 2;</script><div>{x}</div>";
        let d = hmr_diff(prev, curr);
        assert_eq!(d.change, HmrChange::FullReload);
        assert!(d.instance_changed);
        assert!(!d.module_changed);
    }

    #[test]
    fn module_script_change_forces_full_reload() {
        let prev = "<script context=\"module\">let MOD = 1;</script><div>x</div>";
        let curr = "<script context=\"module\">let MOD = 2;</script><div>x</div>";
        let d = hmr_diff(prev, curr);
        assert_eq!(d.change, HmrChange::FullReload);
        assert!(d.module_changed);
        assert!(!d.instance_changed);
    }

    #[test]
    fn distinguishes_instance_and_module_blocks() {
        let prev = "<script context=\"module\">let A = 1;</script><script>let B = 1;</script><p />";
        let curr = "<script context=\"module\">let A = 1;</script><script>let B = 2;</script><p />";
        let d = hmr_diff(prev, curr);
        assert!(d.instance_changed);
        assert!(!d.module_changed);
    }

    #[test]
    fn recognises_bare_module_attribute() {
        // H-094: Svelte 5 `<script module>` must be classified as the module
        // script, not the instance script.
        assert!(is_module_script_attrs(" module"));
        assert!(is_module_script_attrs(" lang=\"ts\" module"));
        assert!(is_module_script_attrs(" module lang=\"ts\""));
        assert!(is_module_script_attrs(" context=\"module\""));
        // Not a module script:
        assert!(!is_module_script_attrs(""));
        assert!(!is_module_script_attrs(" lang=\"ts\""));
        assert!(!is_module_script_attrs(" generics=\"T extends Module\""));
    }

    #[test]
    fn bare_module_script_separated_from_instance() {
        let src = "<script module>let A = 1;</script><script>let B = 1;</script><p />";
        assert_eq!(extract_script(src, true).as_deref(), Some("let A = 1;"));
        assert_eq!(extract_script(src, false).as_deref(), Some("let B = 1;"));
    }

    #[test]
    fn bare_module_script_change_forces_full_reload() {
        let prev = "<script module>let MOD = 1;</script><div>x</div>";
        let curr = "<script module>let MOD = 2;</script><div>x</div>";
        let d = hmr_diff(prev, curr);
        assert_eq!(d.change, HmrChange::FullReload);
        assert!(d.module_changed);
        assert!(!d.instance_changed);
    }
}
