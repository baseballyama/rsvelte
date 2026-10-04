use super::{Kind, NodeIdentifier, Plan, R, SyntaxTree, span, unsupported};

pub(super) fn collect(
    tree: &SyntaxTree,
    source: &str,
    specifiers: &[NodeIdentifier],
    plan: &mut Plan,
) -> R<()> {
    let target = match source {
        "svelte" => &mut plan.lifecycle,
        "svelte/attachments" => &mut plan.attachments,
        _ => return Ok(()),
    };
    for &specifier in specifiers {
        let Kind::ImportNamed { imported, local } = tree.kind(specifier) else {
            return Err(unsupported(
                "a default or namespace import from Svelte",
                span(tree, specifier),
            ));
        };
        let name = match (source, tree.name(imported)) {
            ("svelte", "onMount") => "onMount",
            ("svelte", "onDestroy") => "onDestroy",
            ("svelte", "tick") => "tick",
            ("svelte", "untrack") => "untrack",
            ("svelte/attachments", "createAttachmentKey") => "createAttachmentKey",
            ("svelte/attachments", "fromAction") => "fromAction",
            _ => {
                return Err(unsupported(
                    "this import from Svelte",
                    span(tree, specifier),
                ));
            }
        };
        target.push((name, local));
    }
    Ok(())
}
