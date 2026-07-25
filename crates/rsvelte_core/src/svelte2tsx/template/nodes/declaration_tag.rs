//! `{@let …}` tags. Mirrors `htmlxtojsx_v2/nodes/DeclarationTag.ts`.

use crate::svelte2tsx::magic_string::MagicString;

use crate::svelte2tsx::template::utils::expr::get_expression_range;

/// Handle a declaration tag: `{let x = expr}` / `{const x = expr}`
/// (Svelte 5.56.0 #18282).
///
/// In TSX output the declaration is emitted as a regular `let` / `const`
/// statement, mirroring `{@const}` handling. The leading `{` becomes the
/// declaration kind keyword and a trailing space, and the closing `}` becomes
/// `;` so the resulting code is parseable TS at the spot where the user wrote
/// the tag.
pub(crate) fn handle_declaration_tag(
    tag: &crate::ast::template::DeclarationTag,
    _source: &str,
    str: &mut MagicString,
) {
    if tag.start >= tag.end {
        return;
    }
    if let Some((decl_start, decl_end)) = get_expression_range(&tag.declaration) {
        // Overwrite the opening `{` (and any whitespace before the kind
        // keyword) with no leading prefix — the source already contains the
        // `let ` / `const ` keyword. Just drop the `{`.
        if tag.start < decl_start {
            str.overwrite(tag.start, decl_start, "");
        }
        // Overwrite closing `}` with `;`.
        if decl_end < tag.end {
            str.overwrite(decl_end, tag.end, ";");
        }
    } else {
        str.overwrite(tag.start, tag.end, " ");
    }
}
