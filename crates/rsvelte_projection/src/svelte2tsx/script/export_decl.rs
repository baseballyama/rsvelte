//! `export` declaration handling for both instance and module scripts.

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;
use std::borrow::Cow;

use std::collections::HashMap;

use super::ast_utils::{
    ExportBindingOptions, binding_pattern_simple_name, extract_names_from_binding_pattern_full,
    module_export_name_to_string,
};
use super::classify_kit_route_file;
use super::exported_names::PossibleExport;
use super::props_rune::{extract_props_from_binding_pattern_runes, is_props_call_oxc};

use super::super::magic_string::MagicString;
use super::ExportedNames;

/// Handle an `ExportNamedDeclaration` from the OXC AST.
///
/// Covers:
/// - `export let count = 0;` (prop in instance, non-prop in module)
/// - `export const MAX = 10;` (non-prop)
/// - `export function fn() {}` (non-prop)
/// - `export class Foo {}` (non-prop)
/// - `export { a, b as c };` (exports with specifiers)
/// - `export { a } from './mod';` (re-export; the module specifier is ignored)
///
/// The `export` keyword is removed from the source via `MagicString`, and the
/// exported names are recorded in `exported_names`.
///
/// `is_instance` controls whether `export let` is treated as a prop.
///
/// `offset` is the `content_offset` that maps OXC positions (relative to script
/// content) back to the original source.
pub(super) fn handle_export_named_decl(
    export_span: oxc_span::Span,
    export_declaration: Option<&oxc::Declaration>,
    export_specifiers: &[oxc::ExportSpecifier],
    offset: u32,
    str: &mut MagicString<'_>,
    exported_names: &mut ExportedNames,
    is_instance: bool,
    possible_exports: &HashMap<String, PossibleExport>,
    raw_content: &str,
    is_ts: bool,
    basename: &str,
    emit_jsdoc: bool,
) {
    let node_start = export_span.start + offset;
    let mut cached_leading_doc = None;

    // Case 1: export with declaration (export let/const/function/class ...)
    if let Some(decl) = export_declaration {
        let decl_start = decl.span().start + offset;

        // For instance scripts: remove the 'export ' keyword (replace with space).
        // For module scripts: keep the 'export' keyword (it's a real module export).
        //
        // Upstream only ever removes it from the three node kinds its walk has a
        // handler for — `handleVariableStatement`, plus `handleExportFunctionOrClass`
        // for a function and a class. Every other exported declaration
        // (`export type` / `export interface` / `export namespace` / `export enum` /
        // `export import x =`) keeps its `export` keyword, so mirror the allow-list
        // rather than enumerating exceptions: a kind nobody thought of must default
        // to "left alone", which is what upstream does.
        let strips_export_keyword = matches!(
            decl,
            oxc::Declaration::VariableDeclaration(_)
                | oxc::Declaration::FunctionDeclaration(_)
                | oxc::Declaration::ClassDeclaration(_)
        );
        if is_instance && strips_export_keyword && decl_start > node_start {
            str.overwrite(node_start, decl_start, " ");
        }

        match decl {
            oxc::Declaration::VariableDeclaration(var_decl) => {
                let kind = var_decl.kind;
                // Only `let` is a reactive prop; `var`/`const` are exports.
                let is_let = matches!(kind, oxc::VariableDeclarationKind::Let);
                let is_prop = is_instance && is_let;
                let num_declarators = var_decl.declarations.len();
                for (decl_idx, declarator) in var_decl.declarations.iter().enumerate() {
                    if is_props_call_oxc(declarator) {
                        extract_props_from_binding_pattern_runes(
                            &declarator.id,
                            exported_names,
                            "",
                        );
                    } else {
                        let has_default = declarator.init.is_some();
                        // Capture type annotation text for exported variables
                        let type_annotation_text =
                            declarator.type_annotation.as_ref().and_then(|ta| {
                                let ts_type = &ta.type_annotation;
                                let start = ts_type.span().start as usize;
                                let end = ts_type.span().end as usize;
                                if start < end && end <= raw_content.len() {
                                    Some(raw_content[start..end].to_string())
                                } else {
                                    None
                                }
                            });
                        extract_names_from_binding_pattern_full(
                            &declarator.id,
                            exported_names,
                            if has_default {
                                ExportBindingOptions::new().with_default()
                            } else {
                                ExportBindingOptions::new()
                            }
                            .with_prop_if(is_prop)
                            .with_let_if(is_let)
                            // Official `handleExportedVariableDeclarationList`:
                            // `required = !node.initializer`, independent of
                            // `let`/`const`/`var`.
                            .with_required_if(!has_default),
                        );
                        // Update the type annotation on the exported name
                        if let Some(ref ta_text) = type_annotation_text
                            && let Some(name) = binding_pattern_simple_name(&declarator.id)
                            && let Some(info) = exported_names.get_mut(name)
                        {
                            info.type_annotation = Some(ta_text.clone());
                        }

                        // Preserve a leading JSDoc `/** @type {…} */` on the
                        // export so it round-trips into the legacy props return
                        // (`props: { /** @type {boolean} */ visible: visible }`),
                        // mirroring official's `value.doc`.
                        // Official `getDoc` reads the DECLARATOR's own leading
                        // trivia first and only falls back to the statement's,
                        // so `export let /* c */ g = 8, h = 9` gives the comment
                        // to `g` alone. TypeScript starts that trivia at the
                        // previous token, so the floor keeps the walk from
                        // crossing `let` (`export /* x */ let a` carries nothing).
                        let doc_floor = if decl_idx == 0 {
                            var_decl.span.start as usize + kind.as_str().len()
                        } else {
                            var_decl.declarations[decl_idx - 1].span().end as usize
                        };
                        let leading_doc = leading_doc_after(
                            raw_content,
                            doc_floor,
                            declarator.id.span().start as usize,
                        )
                        .or_else(|| {
                            cached_leading_doc
                                .get_or_insert_with(|| {
                                    leading_jsdoc_comment(raw_content, export_span.start as usize)
                                })
                                .clone()
                        });
                        if let Some(name) = binding_pattern_simple_name(&declarator.id)
                            && let Some(doc) = leading_doc
                        {
                            exported_names.set_doc(name, doc.to_string());
                        }
                        // For multi-declarator let exports (export let a, b, c;),
                        // replace the comma between declarators with `;let `.
                        // This splits them into separate `let` statements,
                        // matching JS svelte2tsx behavior.
                        // Only split `let` declarations, not `const`.
                        // NOTE: This must happen BEFORE the __sveltets_2_any injection
                        // to avoid MagicString conflicts at the same position.
                        if is_instance
                            && is_let
                            && num_declarators > 1
                            && decl_idx < num_declarators - 1
                        {
                            let decl_end_rel = declarator.span.end;
                            // Find the comma after the declarator end and overwrite just it
                            // This preserves any comments/whitespace between declarators
                            let comma_pos = raw_content[decl_end_rel as usize..].find(',').map_or(
                                decl_end_rel,
                                |p| {
                                    decl_end_rel
                                        + u32::try_from(p).expect("declaration offset fits in u32")
                                },
                            );
                            str.overwrite(comma_pos + offset, comma_pos + 1 + offset, ";let ");
                        }

                        // For exported prop variables, inject __sveltets_2_any when:
                        // 1. No initializer: `export let a;`
                        // 2. Has a type annotation: `export let a: Type = value;`
                        // 3. Initializer is a boolean literal: `export let a = true;`
                        //    (prevents TS from narrowing to `true`/`false` literal type)
                        let has_type_annotation = declarator.type_annotation.is_some();
                        let has_boolean_init = declarator
                            .init
                            .as_ref()
                            .is_some_and(|init| matches!(init, oxc::Expression::BooleanLiteral(_)));
                        // A JSDoc `/** @type {T} */` on the export is a type too,
                        // so a `/** @type {number} */ export let x = 1` widens via
                        // `x = __sveltets_2_any(x)` even with an initializer.
                        let has_jsdoc_type = cached_leading_doc
                            .get_or_insert_with(|| {
                                leading_jsdoc_comment(raw_content, export_span.start as usize)
                            })
                            .as_deref()
                            .is_some_and(|doc| doc.contains("@type"));
                        let do_widen = is_prop
                            && (!has_default
                                || has_type_annotation
                                || has_boolean_init
                                || has_jsdoc_type);

                        // SvelteKit `+page.svelte` / `+layout.svelte`: the
                        // `import('./$types.js').*` annotation for well-known prop
                        // names / `export const snapshot`. Computed before the
                        // widener so the two combine into ONE ignore block in the
                        // right order (`: KitType; x = any(x);`), not separate
                        // out-of-order blocks. Mirrors `emitKitType`.
                        // `ts.getJSDocType` counts here too, so an explicitly
                        // typed prop keeps the author's type.
                        let kit_type: Option<&str> = if is_instance
                            && !has_type_annotation
                            && !has_jsdoc_type
                        {
                            binding_pattern_simple_name(&declarator.id).and_then(|name| {
                                classify_kit_route_file(basename).and_then(|layout| {
                                    if is_let {
                                        match (name, layout) {
                                            ("data", true) => {
                                                Some("import('./$types.js').LayoutData")
                                            }
                                            ("data", false) => {
                                                Some("import('./$types.js').PageData")
                                            }
                                            ("form", false) => {
                                                Some("import('./$types.js').ActionData")
                                            }
                                            ("params", true) => {
                                                Some("import('./$types.js').LayoutProps['params']")
                                            }
                                            ("params", false) => {
                                                Some("import('./$types.js').PageProps['params']")
                                            }
                                            _ => None,
                                        }
                                    } else {
                                        match name {
                                            "snapshot" => Some("import('./$types.js').Snapshot"),
                                            _ => None,
                                        }
                                    }
                                })
                            })
                        } else {
                            None
                        };

                        if let Some(name) = binding_pattern_simple_name(&declarator.id) {
                            let use_jsdoc = emit_jsdoc && !is_ts;
                            let (id_start, id_end) = match &declarator.id {
                                oxc::BindingPattern::BindingIdentifier(id) => {
                                    (id.span.start + offset, id.span.end + offset)
                                }
                                _ => (declarator.span.end + offset, declarator.span.end + offset),
                            };
                            let widen_pos = declarator.span.end + offset;
                            if do_widen
                                && let Some(kit) = kit_type
                                && !use_jsdoc
                            {
                                // Combined: type annotation + widener, one block.
                                str.append_left_fmt(
                                    id_end,
                                    format_args!(
                                        "/*\u{03A9}ignore_start\u{03A9}*/: {kit};{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
                                    ),
                                );
                            } else {
                                if do_widen {
                                    str.append_left_fmt(
                                        widen_pos,
                                        format_args!(
                                            "/*\u{03A9}ignore_start\u{03A9}*/;{name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
                                        ),
                                    );
                                }
                                if let Some(kit) = kit_type {
                                    if use_jsdoc {
                                        str.append_left_fmt(
                                            id_start,
                                            format_args!("/** @type {{{kit}}} */ "),
                                        );
                                    } else {
                                        str.append_left_fmt(
                                            id_end,
                                            format_args!(
                                                "/*\u{03A9}ignore_start\u{03A9}*/: {kit}/*\u{03A9}ignore_end\u{03A9}*/"
                                            ),
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
            oxc::Declaration::FunctionDeclaration(func) => {
                if let Some(ref id) = func.id {
                    let name = id.name.to_string();
                    exported_names.add_full(
                        name.clone(),
                        name,
                        None,
                        super::exported_names::ExportFlags::default(),
                    );
                }
            }
            oxc::Declaration::ClassDeclaration(class) => {
                if let Some(ref id) = class.id {
                    let name = id.name.to_string();
                    exported_names.add_full(
                        name.clone(),
                        name,
                        None,
                        super::exported_names::ExportFlags::default(),
                    );
                }
            }
            _ => {}
        }
    }

    // Case 2: an export clause with no declaration. Official
    // `handleExportDeclaration` keys off `ts.isNamedExports(exportClause)` alone
    // and never looks at `moduleSpecifier`, so a re-export (`export { a } from
    // './mod'`) is stripped too — left in place it would put an `export … from`
    // inside `$$render()`, which is not valid TSX (TS1233).
    if export_declaration.is_none() {
        let node_end = export_span.end + offset;
        str.overwrite(node_start, node_end, "");
        for spec in export_specifiers {
            let local = module_export_name_to_string(&spec.local);
            let exported = module_export_name_to_string(&spec.exported);
            // Upstream fills `possibleExports` during ONE in-order walk, so an
            // `export { x as y }` written ABOVE `let x` finds nothing and the
            // entry is a value export rather than a prop (`ExportedNames.ts:634`).
            // rsvelte collects them in a pre-pass, which is order-blind.
            let possible = possible_exports
                .get(&local)
                .filter(|p| p.decl_end <= export_span.start);
            let is_let = possible.is_some_and(PossibleExport::is_let);
            let has_init = possible.is_none_or(PossibleExport::has_init);
            let type_ann = possible.and_then(|p| p.type_annotation_text.clone());
            // Mirror official `addExport`: `doc: this.getDoc(target) ||
            // existingDeclaration?.doc`. For a RENAMED export (`export { x as y }`,
            // `target = y`), `getDoc` reads the leading comment on the
            // `export { … }` statement itself first, then falls back to the
            // `let x` declaration's leading doc. A plain (non-renamed)
            // `export { x }` passes `target = undefined`, so `getDoc` is skipped
            // and only the declaration's doc applies.
            let renamed = local != exported;

            // Collision: `export let local; … export { local as exported }`.
            // The binding was already registered as a prop by Case 1 (keyed by
            // `local`). Official overwrites that same (local-keyed) entry in
            // place — see `rename_export_let_in_place`. The doc comes ONLY from
            // the `export { … }` statement's leading comment (an `export let` is
            // not a possible-export, so its declaration doc does not carry over),
            // and `propTypeAssert` is NOT re-run, so no extra widening here.
            if renamed && exported_names.has(&local) {
                let merged_doc = cached_leading_doc
                    .get_or_insert_with(|| {
                        leading_jsdoc_comment(raw_content, export_span.start as usize)
                    })
                    .as_deref()
                    .map(str::to_string);
                exported_names.rename_export_let_in_place(&local, exported.clone(), merged_doc);
                continue;
            }

            let doc = if renamed {
                cached_leading_doc
                    .get_or_insert_with(|| {
                        leading_jsdoc_comment(raw_content, export_span.start as usize)
                    })
                    .as_deref()
                    .map(str::to_string)
                    .or_else(|| possible.and_then(|p| p.doc.clone()))
            } else {
                possible.and_then(|p| p.doc.clone())
            };
            let is_prop = is_instance && is_let;
            exported_names.add_full(
                exported.clone(),
                local.clone(),
                type_ann,
                super::exported_names::ExportFlags::default()
                    .with_default_if(has_init)
                    .with_prop_if(is_prop)
                    .with_let_if(is_let)
                    // Official `addExport` passes `required = false` for the
                    // named export itself, then preserves `required` from a
                    // matching possible export. Thus `let x: T; export
                    // { x as y }` stays required, while the collision path
                    // above for `export let x: T; export { x as y }` is
                    // optional (exported declarations are not possible
                    // exports).
                    .with_required_if(possible.is_some_and(|p| !p.has_init()))
                    .with_named_export_if(true),
            );
            // The JSDoc lives on the `let x` declaration (or, for a renamed
            // export, on the `export { … }` statement); carry it onto the
            // export so it round-trips into the legacy props return.
            if let Some(doc) = doc {
                exported_names.set_doc(&exported, doc);
            }
            // Inject __sveltets_2_any for exported variables. Mirrors official
            // `propTypeAssertToUserDefined` (called from `addExport` when the
            // re-exported local is a `let`): widen when the declaration has
            //   1. no initializer (`export { x }` where `x` has no default), OR
            //   2. a type — a TS annotation (`let x: T = …`) OR a JSDoc
            //      `/** @type {T} */` (the doc lives on the `let x` declaration), OR
            //   3. a boolean-literal initializer (`let x = false`), which TS would
            //      otherwise narrow to the `false`/`true` literal type.
            // Cases 2 and 3 cover renamed legacy props like
            // `let className = ""; export { className as class }` with a JSDoc
            // `@type` (e.g. sveltestrap) that previously lost the widen.
            if is_instance && is_let {
                let has_ta = possible.is_some_and(PossibleExport::has_type_annotation);
                let has_jsdoc_type = possible
                    .and_then(|p| p.doc.as_deref())
                    .is_some_and(|d| d.contains("@type"));
                let has_bool_init = possible.is_some_and(PossibleExport::has_boolean_init);
                if (!has_init || has_ta || has_jsdoc_type || has_bool_init)
                    && let Some(pe) = possible
                {
                    let inject = format!(
                        "/*\u{03A9}ignore_start\u{03A9}*/;{local} = __sveltets_2_any({local});/*\u{03A9}ignore_end\u{03A9}*/"
                    );
                    str.append_left(pe.decl_end + offset, &inject);
                }
            }
        }
    }
}

/// `leading_jsdoc_comment` bounded below by `floor`, the end of the previous
/// token — where TypeScript's `node.pos` starts a node's leading trivia.
pub(super) fn leading_doc_after(source: &str, floor: usize, before: usize) -> Option<Cow<'_, str>> {
    if floor >= before || before > source.len() {
        return None;
    }
    let sub = &source[floor..before];
    leading_jsdoc_comment(sub, sub.len())
}

/// Return the leading `/** … */` `JSDoc` comment immediately before `before`
/// (skipping whitespace), or None. Mirrors official `getLastLeadingDoc`.
pub(super) fn leading_jsdoc_comment(source: &str, before: usize) -> Option<Cow<'_, str>> {
    let bytes = source.as_bytes();
    let before = before.min(bytes.len());
    // Mirror official `getLastLeadingDoc`: walk the leading trivia and return the
    // LAST block comment (`MultiLineCommentTrivia`) — i.e. the one closest to the
    // declaration. Whitespace AND intervening single-line `// …` comments are
    // skipped (they're filtered out by `c.kind === MultiLineCommentTrivia`), so a
    // `/** … */` separated from the export by a `// @ts-expect-error` line still
    // attaches. Stop at the first non-trivia content (the previous token).
    let mut p = before;
    loop {
        // Skip whitespace immediately before `p`.
        while p > 0 && bytes[p - 1].is_ascii_whitespace() {
            p -= 1;
        }
        if p == 0 {
            return None;
        }
        // A block comment terminator `*/` right here? `p` is a valid char
        // boundary (stepped back only over ASCII whitespace / to a `\n`+1 line
        // start), but the two bytes ending at `p` may land inside a multi-byte
        // char (e.g. a `─` in a preceding comment), so test with `ends_with`.
        if source[..p].ends_with("*/") {
            // Official `getDoc` captures ANY leading block comment (not just
            // `/**` JSDoc), so a plain `/* … */` before an export is preserved.
            let open = source[..p].rfind("/*")?;
            // Ensure the `/*` is the opener for THIS `*/` (no intervening `*/`).
            if source[open..p - 2].contains("*/") {
                return None;
            }
            // `getLastLeadingDoc` strips `@typedef` tags with `tag.pos`, which is
            // SourceFile-absolute, indexed into a `node.getFullText()` slice —
            // so the removal is offset by `node.pos` and only lands where that is
            // zero, i.e. where this comment is the script's first token.
            let comment = &source[open..p];
            return Some(if only_trivia_before(source, open) {
                strip_typedef_tags(comment)
            } else {
                Cow::Borrowed(comment)
            });
        }
        // Otherwise, if the trivia line ending at `p` is a single-line `// …`
        // comment, skip the whole line and keep looking for an earlier block
        // comment. A non-comment line (real code / previous token) stops the walk.
        let line_start = source[..p].rfind('\n').map_or(0, |i| i + 1);
        if source[line_start..p].trim_start().starts_with("//") {
            p = line_start;
            continue;
        }
        return None;
    }
}

/// Whether everything before `end` is whitespace or a complete comment — the
/// condition under which TypeScript's `node.pos` is 0 for the statement the
/// comment leads.
fn only_trivia_before(source: &str, end: usize) -> bool {
    let bytes = source.as_bytes();
    let mut i = 0;
    while i < end {
        match bytes[i] {
            b' ' | b'\t' | b'\r' | b'\n' => i += 1,
            b'/' if i + 1 < end && bytes[i + 1] == b'/' => {
                while i < end && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            b'/' if i + 1 < end && bytes[i + 1] == b'*' => match source[i + 2..end].find("*/") {
                Some(offset) => i += 2 + offset + 2,
                None => return false,
            },
            _ => return false,
        }
    }
    true
}

/// Position of every JSDoc tag opener (`@`) in `comment`: after the `/**`
/// opener or after a line's optional `*` prefix, whitespace skipped.
fn jsdoc_tag_starts(comment: &str) -> Vec<usize> {
    let bytes = comment.as_bytes();
    let mut starts = Vec::new();
    let mut i = 3; // past `/**`
    let mut at_line_start = true;
    while i < bytes.len() {
        if at_line_start {
            let mut j = i;
            while j < bytes.len() && matches!(bytes[j], b' ' | b'\t') {
                j += 1;
            }
            if j < bytes.len() && bytes[j] == b'*' && !comment[j..].starts_with("*/") {
                j += 1;
                while j < bytes.len() && matches!(bytes[j], b' ' | b'\t') {
                    j += 1;
                }
            }
            if j < bytes.len() && bytes[j] == b'@' {
                starts.push(j);
            }
            i = j.max(i);
            at_line_start = false;
            continue;
        }
        if bytes[i] == b'\n' {
            at_line_start = true;
        }
        i += 1;
    }
    starts
}

/// Skip whitespace and any `*` line prefix from `i`.
fn skip_jsdoc_trivia(bytes: &[u8], mut i: usize) -> usize {
    loop {
        let before = i;
        while i < bytes.len() && bytes[i].is_ascii_whitespace() {
            i += 1;
        }
        if i < bytes.len() && bytes[i] == b'*' && i + 1 < bytes.len() && bytes[i + 1] != b'/' {
            i += 1;
        }
        if i == before {
            return i;
        }
    }
}

/// `getLastLeadingDoc` removes every `@typedef` tag's own text from the comment
/// before returning it (`tsAst.ts:153-160`), so the tag never reaches a prop's
/// emitted JSDoc. A tag's span stops at its name unless text follows it, in
/// which case TypeScript's JSDoc comment runs on to the next tag or to the
/// terminator — measured against `ts.getAllJSDocTagsOfKind`, which spells the
/// two cases differently for `@typedef {X} T` and `@typedef {X} T<Id=(n)>`.
fn strip_typedef_tags(comment: &str) -> Cow<'_, str> {
    if !comment.starts_with("/**") {
        return Cow::Borrowed(comment);
    }
    let starts = jsdoc_tag_starts(comment);
    if starts.is_empty() {
        return Cow::Borrowed(comment);
    }
    let bytes = comment.as_bytes();
    let terminator = comment.rfind("*/").unwrap_or(comment.len());
    let mut cuts: Vec<(usize, usize)> = Vec::new();
    for (index, &start) in starts.iter().enumerate() {
        let rest = &comment[start..];
        if !rest.starts_with("@typedef")
            || rest[8..]
                .chars()
                .next()
                .is_some_and(|ch| ch.is_ascii_alphanumeric() || ch == '_' || ch == '$')
        {
            continue;
        }
        let mut i = skip_jsdoc_trivia(bytes, start + 8);
        if i < bytes.len() && bytes[i] == b'{' {
            let mut depth = 0usize;
            while i < bytes.len() {
                match bytes[i] {
                    b'{' => depth += 1,
                    b'}' => {
                        depth -= 1;
                        if depth == 0 {
                            i += 1;
                            break;
                        }
                    }
                    _ => {}
                }
                i += 1;
            }
        }
        i = skip_jsdoc_trivia(bytes, i);
        while i < bytes.len()
            && (bytes[i].is_ascii_alphanumeric() || matches!(bytes[i], b'_' | b'$' | b'.'))
        {
            i += 1;
        }
        let boundary = starts.get(index + 1).copied().unwrap_or(terminator);
        let end = if comment[i..boundary]
            .bytes()
            .any(|byte| !byte.is_ascii_whitespace() && byte != b'*')
        {
            boundary
        } else {
            i
        };
        cuts.push((start, end));
    }
    if cuts.is_empty() {
        return Cow::Borrowed(comment);
    }
    let mut out = String::with_capacity(comment.len());
    let mut cursor = 0;
    for (start, end) in cuts {
        out.push_str(&comment[cursor..start]);
        cursor = end;
    }
    out.push_str(&comment[cursor..]);
    Cow::Owned(out)
}

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;

    fn props_of(script: &str) -> String {
        let code = run_svelte2tsx(&format!("<script>\n{script}\n</script>\n<p>x</p>\n")).code;
        let start = code.find("return { props: ").expect("props") + "return { props: ".len();
        let rest = &code[start..];
        rest[..rest.find(", exports:").expect("exports")].to_string()
    }

    #[test]
    fn typedef_is_stripped_only_where_upstreams_offset_is_zero() {
        // `getLastLeadingDoc` slices an absolute `tag.pos` out of a
        // `node.getFullText()` string, so the removal lands only when the
        // statement starts at 0 — i.e. when nothing precedes this comment.
        let doc = "/**\n * @typedef {import('./X.svelte').T} T\n * @slot {{ a: 1 }}\n */";
        assert_eq!(
            props_of(&format!("{doc}\nexport let a = 1;")),
            "{\n/**\n * \n * @slot {{ a: 1 }}\n */a: a}"
        );
        // With a statement ahead of it the shifted slice runs past the comment,
        // upstream's `replace` finds nothing, and the tag survives on both sides.
        let pad = "const pad = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';";
        assert_eq!(
            props_of(&format!("{pad}\n{doc}\nexport let a = 1;")),
            format!("{{\n{doc}a: a}}")
        );
    }

    /// The one row of `getLastLeadingDoc`'s offset bug rsvelte does NOT
    /// reproduce: a shift that lands inside the comment makes upstream delete
    /// the wrong text. Here official emits
    /// `/**\n * @typedef {import('./X.sv{ a: 1 }}\n */`; rsvelte keeps the
    /// comment whole. Filed as
    /// `upstream_issues/svelte2tsx-getlastleadingdoc-mixes-absolute-and-relative-offsets.md`;
    /// 0 of the corpus's 172 `@typedef`-carrying components reach it.
    #[test]
    fn a_shift_that_lands_inside_the_comment_is_a_known_divergence() {
        let doc = "/**\n * @typedef {import('./X.svelte').T} T\n * @slot {{ a: 1 }}\n */";
        assert_eq!(
            props_of(&format!("let z = 1;\n{doc}\nexport let a = z;")),
            format!("{{\n{doc}a: a}}")
        );
    }

    // Expected values are `ts.getAllJSDocTagsOfKind`'s own answers, read off the
    // official compiler's props block for each shape.
    #[test]
    fn strip_typedef_tags_matches_the_typescript_tag_spans() {
        let cases: [(&str, &str); 7] = [
            (
                "/**\n   * @typedef {import('./X.svelte').T<Id>} T<Id=(string)>\n   */",
                "/**\n   * */",
            ),
            (
                "/**\n   * @generics {A} A\n   * @typedef {import('./X.svelte').T<Id>} T<Id=(string)>\n   * @slot {{ a: 1 }}\n   */",
                "/**\n   * @generics {A} A\n   * @slot {{ a: 1 }}\n   */",
            ),
            (
                "/**\n   * @generics {A} A\n   * @typedef {import('./X.svelte').T<Id>} T<Id=(string)>\n   */",
                "/**\n   * @generics {A} A\n   * */",
            ),
            (
                "/**\n   * @typedef {import('./X.svelte').A} A\n   * @typedef {import('./X.svelte').B} B\n   * @slot {{ a: 1 }}\n   */",
                "/**\n   * \n   * \n   * @slot {{ a: 1 }}\n   */",
            ),
            (
                "/**\n   * @typedef {{\n   *   a: string\n   * }} T\n   * @slot {{ a: 1 }}\n   */",
                "/**\n   * \n   * @slot {{ a: 1 }}\n   */",
            ),
            ("/** @typedef {import('./X.svelte').T} T */", "/**  */"),
            // Not a JSDoc comment, so TypeScript parses no tags in it.
            (
                "/*\n   * @typedef {import('./X.svelte').T} T\n   * @slot {{ a: 1 }}\n   */",
                "/*\n   * @typedef {import('./X.svelte').T} T\n   * @slot {{ a: 1 }}\n   */",
            ),
        ];
        for (input, expected) in cases {
            assert_eq!(
                super::strip_typedef_tags(input),
                expected,
                "input: {input:?}"
            );
        }
    }

    #[test]
    fn test_export_let_simple() {
        let source = "<script>\nexport let count = 0;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("count"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["count"]);

        let info = result.exported_names.get("count").unwrap();
        assert!(info.is_prop());
        assert!(info.has_default());
    }

    #[test]
    fn test_export_let_no_default() {
        let source = "<script>\nexport let name;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("name"));
        let info = result.exported_names.get("name").unwrap();
        assert!(info.is_prop());
        assert!(!info.has_default());
    }

    #[test]
    fn test_export_let_multiple() {
        let source =
            "<script>\nexport let a = 1;\nexport let b;\nexport let c = \"hello\";\n</script>";
        let result = run_svelte2tsx(source);

        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b", "c"]);
        assert!(result.exported_names.get("a").unwrap().has_default());
        assert!(!result.exported_names.get("b").unwrap().has_default());
        assert!(result.exported_names.get("c").unwrap().has_default());
    }

    #[test]
    fn test_export_const() {
        let source = "<script>\nexport const MAX = 100;\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("MAX"));
        assert!(!result.exported_names.get("MAX").unwrap().is_prop());
    }

    #[test]
    fn test_export_function() {
        let source = "<script>\nexport function greet() { return \"hello\"; }\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("greet"));
        assert!(!result.exported_names.get("greet").unwrap().is_prop());
    }

    #[test]
    fn shared_export_doc_reaches_every_declarator() {
        let source = concat!(
            "<script>\n",
            "/** @type {number} */\n",
            "// @ts-expect-error\n",
            "export let first = 1, second = 2;\n",
            "</script>",
        );
        let result = run_svelte2tsx(source);

        for name in ["first", "second"] {
            assert_eq!(
                result.exported_names.get(name).unwrap().doc.as_deref(),
                Some("/** @type {number} */")
            );
        }
    }

    #[test]
    fn shared_export_doc_reaches_every_renamed_specifier() {
        let source = concat!(
            "<script>\n",
            "let first = 1, second = 2;\n",
            "/** named exports */\n",
            "// bridge\n",
            "export { first as one, second as two };\n",
            "</script>",
        );
        let result = run_svelte2tsx(source);

        for name in ["one", "two"] {
            assert_eq!(
                result.exported_names.get(name).unwrap().doc.as_deref(),
                Some("/** named exports */")
            );
        }
    }
}
