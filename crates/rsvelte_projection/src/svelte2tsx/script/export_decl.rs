//! `export` declaration handling for both instance and module scripts.

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;

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
                        let leading_doc = cached_leading_doc
                            .get_or_insert_with(|| {
                                leading_jsdoc_comment(raw_content, export_span.start as usize)
                            })
                            .as_ref();
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
                                        "/*\u{03A9}ignore_start\u{03A9}*/: {kit}; {name} = __sveltets_2_any({name});/*\u{03A9}ignore_end\u{03A9}*/"
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
            let possible = possible_exports.get(&local);
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
                    .map(str::to_string);
                exported_names.rename_export_let_in_place(&local, exported.clone(), merged_doc);
                continue;
            }

            let doc = if renamed {
                cached_leading_doc
                    .get_or_insert_with(|| {
                        leading_jsdoc_comment(raw_content, export_span.start as usize)
                    })
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

/// Return the leading `/** … */` `JSDoc` comment immediately before `before`
/// (skipping whitespace), or None. Mirrors official `getLastLeadingDoc`.
pub(super) fn leading_jsdoc_comment(source: &str, before: usize) -> Option<&str> {
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
            return Some(&source[open..p]);
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

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;

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
