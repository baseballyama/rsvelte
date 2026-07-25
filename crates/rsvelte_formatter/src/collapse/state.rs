use super::*;

thread_local! {
    /// Set while [`reformat_pre_inner`] re-enters [`crate::format`] on a `<pre>`
    /// body. That sub-document has no `<pre>` ancestor of its own, so a pass that
    /// needs prettier's `isPreTagContent` answer reads this flag instead.
    static IN_PRE_CONTENT: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
}

pub(super) fn in_pre_content() -> bool {
    IN_PRE_CONTENT.with(std::cell::Cell::get)
}

/// Restores [`IN_PRE_CONTENT`] on drop, so an unwind out of the re-entrant
/// format cannot strand the flag set on a pooled worker thread.
struct PreContentGuard(bool);

impl Drop for PreContentGuard {
    fn drop(&mut self) {
        IN_PRE_CONTENT.set(self.0);
    }
}

/// Run `f` with [`IN_PRE_CONTENT`] set, restoring the previous value afterwards.
pub(super) fn with_pre_content<T>(f: impl FnOnce() -> T) -> T {
    let _guard = PreContentGuard(IN_PRE_CONTENT.replace(true));
    f()
}

thread_local! {
    /// Set while the final children-port pass runs. Maps each intermediate text
    /// node's start offset to its PRE-COLLAPSE source text, so `node_to_child`
    /// classifies boundary whitespace from the original rather than the
    /// intermediate output. An earlier breaking pass can turn a source space after
    /// an inline element into a newline (by hug-breaking the element); reading the
    /// leading whitespace from the intermediate would then flip the fill to its
    /// inverted (last-word-overflow-tolerant) form and mis-wrap the prose.
    static ORIG_TEXT: std::cell::RefCell<std::collections::HashMap<u32, String>> =
        std::cell::RefCell::new(std::collections::HashMap::new());
}

/// Restores [`ORIG_TEXT`] on drop so an unwind cannot strand the map on a pooled
/// worker thread.
struct OrigTextGuard(std::collections::HashMap<u32, String>);

impl Drop for OrigTextGuard {
    fn drop(&mut self) {
        ORIG_TEXT.with(|m| *m.borrow_mut() = std::mem::take(&mut self.0));
    }
}

/// Run `f` with [`ORIG_TEXT`] populated, restoring the previous map afterwards.
pub(super) fn with_orig_text<T>(
    map: std::collections::HashMap<u32, String>,
    f: impl FnOnce() -> T,
) -> T {
    let _guard = OrigTextGuard(ORIG_TEXT.with(|m| m.replace(map)));
    f()
}

/// The pre-collapse source text for the intermediate text node starting at
/// `start`, when the children-port pass has one recorded.
pub(super) fn orig_text_for(start: u32) -> Option<String> {
    ORIG_TEXT.with(|m| m.borrow().get(&start).cloned())
}

/// Pair each node in `inter` with its whitespace-original counterpart in `orig`.
/// Both node lists describe the same document differing only in whitespace
/// (collapse never changes non-whitespace content or node structure — enforced by
/// the corruption guard in `try_children_port`), so every non-text node aligns 1:1
/// in order. A whitespace-only text node may exist in one list but not the other
/// (collapse can drop or introduce a bare separator), so text nodes are matched
/// positionally where possible and left unpaired otherwise.
pub(super) fn align_orig_nodes<'a, 'c>(
    inter: &[TemplateNode<'_>],
    orig: &'a [TemplateNode<'c>],
) -> Vec<Option<&'a TemplateNode<'c>>> {
    let mut result = Vec::with_capacity(inter.len());
    let mut oi = 0usize;
    for n in inter {
        if matches!(n, TemplateNode::Text(_)) {
            // Pair with the next orig text node if the cursor is on one; a non-text
            // orig node here means the intermediate has an extra text node (collapse
            // never adds text), so leave it unmatched.
            if oi < orig.len() && matches!(orig[oi], TemplateNode::Text(_)) {
                result.push(Some(&orig[oi]));
                oi += 1;
            } else {
                result.push(None);
            }
        } else {
            // Skip any orig text nodes collapse dropped, then take the matching
            // non-text node (guaranteed present and in the same order).
            while oi < orig.len() && matches!(orig[oi], TemplateNode::Text(_)) {
                oi += 1;
            }
            result.push(orig.get(oi));
            oi += 1;
        }
    }
    result
}

/// Whether two aligned nodes are the SAME kind — same AST variant, plus same tag
/// name for elements/components. Used to reject a positional alignment that has
/// drifted (a comment, `<svelte:*>` element, or vanished whitespace-only text can
/// shift the node "column"); any signature mismatch means the two lists diverged.
pub(super) fn node_signature_matches(a: &TemplateNode, b: &TemplateNode) -> bool {
    if std::mem::discriminant(a) != std::mem::discriminant(b) {
        return false;
    }
    match (a, b) {
        (TemplateNode::RegularElement(x), TemplateNode::RegularElement(y)) => x.name == y.name,
        (TemplateNode::Component(x), TemplateNode::Component(y)) => x.name == y.name,
        _ => true,
    }
}

/// Recursively map each intermediate text node's start offset to its pre-collapse
/// source text, walking the intermediate and original trees in lockstep. If a
/// fragment's node lists diverge structurally — any non-text node fails to pair
/// with a same-signature original — the ENTIRE fragment (and its subtree) is
/// skipped, so its text falls back to the intermediate whitespace. This keeps the
/// correction to fragments whose structure provably matches; the corpus never
/// exercises the divergent path, but an unforeseen collapse edit that reshapes a
/// node list can only lose the correction, never mis-map a text node.
pub(super) fn build_orig_text_map(
    inter: &[TemplateNode],
    orig_out: &str,
    orig: &[TemplateNode],
    map: &mut std::collections::HashMap<u32, String>,
) {
    let aligned = align_orig_nodes(inter, orig);
    // A text node may legitimately have no original counterpart (a whitespace-only
    // separator collapse dropped); leave it unmapped. But every NON-text node must
    // pair with a same-signature original, or the alignment has drifted.
    let consistent = inter.iter().zip(&aligned).all(|(n, on)| {
        matches!(n, TemplateNode::Text(_)) || on.is_some_and(|o| node_signature_matches(n, o))
    });
    if !consistent {
        return;
    }
    for (n, on) in inter.iter().zip(aligned) {
        if let (TemplateNode::Text(t), Some(TemplateNode::Text(ot))) = (n, on)
            && let Some(s) = orig_out.get(ot.start as usize..ot.end as usize)
        {
            map.insert(t.start, s.to_string());
        }
        if let Some(on) = on {
            let inter_fs = child_fragments(n);
            let orig_fs = child_fragments(on);
            // A signature match guarantees the same fragment arity; a mismatch in
            // count (should not occur) simply leaves the extra fragments unmapped.
            for (f, of) in inter_fs.iter().zip(orig_fs.iter()) {
                build_orig_text_map(&f.nodes, orig_out, &of.nodes, map);
            }
        }
    }
}
