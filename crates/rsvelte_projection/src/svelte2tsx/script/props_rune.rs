//! `$props()` rune extraction and the `$$ComponentProps` typedef rewrite.

use oxc_ast::ast as oxc;
use oxc_span::GetSpan;

use super::ast_utils::{binding_pattern_simple_name, property_key_to_string};
use super::classify_kit_route_file;
use super::hoistable_types::walk_back_through_trivia;

use super::super::magic_string::MagicString;
use super::ExportedNames;

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("script source offsets are represented as u32")
}

/// Position info for $`props()` typedef generation, collected during OXC walk.
#[derive(Debug, Clone)]
pub(super) struct PropsRuneInfo {
    /// Position of the `let` keyword (relative to `raw_content`)
    let_pos: u32,
    /// Position of the `{` in the destructuring pattern (relative to `raw_content`)
    destructure_start: u32,
    /// End position of the destructuring pattern (relative to `raw_content`)
    destructure_end: u32,
    /// End position of the `$props()` call (relative to `raw_content`), including semicolon if present
    props_call_end: u32,
    /// Whether the declarator has a TS type annotation
    flags: PropsRuneFlags,
    /// End of the type annotation (relative to `raw_content`)
    type_annotation_end: Option<u32>,
    /// Text of the type annotation
    pub(super) type_text: Option<String>,
    /// Whether there's a `JSDoc` `@type` comment before the `let`
    jsdoc_type: Option<String>,
    /// Start position of the `JSDoc` comment (relative to `raw_content`)
    jsdoc_start: Option<u32>,
    /// End position of the `JSDoc` comment (relative to `raw_content`)
    jsdoc_end: Option<u32>,
    /// Position of the `:` before the type annotation (relative to `raw_content`)
    colon_pos: Option<u32>,
    /// Prop type entries: (name, optional, `inferred_type`)
    prop_types: Vec<(String, bool, String)>,
    /// Names of $`bindable()` props
    bindable_names: Vec<String>,
    /// Start of the type argument (relative to `raw_content`), for `$props<TypeArg>()`
    type_arg_start: Option<u32>,
    /// End of the type argument (relative to `raw_content`), for `$props<TypeArg>()`
    type_arg_end: Option<u32>,
    /// Text of the type argument
    pub(super) type_arg_text: Option<String>,
}

#[derive(Debug, Clone, Copy, Default)]
struct PropsRuneFlags(u8);

impl PropsRuneFlags {
    const TYPE_ANNOTATION: u8 = 1;
    const HOISTABLE_TYPE: u8 = 1 << 1;
    const NAMED_TYPE_REFERENCE: u8 = 1 << 2;
    const HAS_REST: u8 = 1 << 3;
    const HAS_UNKNOWN_PROPS: u8 = 1 << 4;
    const HAS_TYPE_ARG: u8 = 1 << 5;
    const TYPE_ARG_NAMED_REF: u8 = 1 << 6;
    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }
    const fn mark_if(&mut self, flag: u8, enabled: bool) {
        if enabled {
            self.0 |= flag;
        }
    }
}

impl PropsRuneInfo {
    pub(super) const fn has_type_annotation(&self) -> bool {
        self.flags.contains(PropsRuneFlags::TYPE_ANNOTATION)
    }
    pub(super) const fn has_type_arg(&self) -> bool {
        self.flags.contains(PropsRuneFlags::HAS_TYPE_ARG)
    }
    pub(super) const fn type_arg_is_named_ref(&self) -> bool {
        self.flags.contains(PropsRuneFlags::TYPE_ARG_NAMED_REF)
    }
    pub(super) const fn is_named_type_reference(&self) -> bool {
        self.flags.contains(PropsRuneFlags::NAMED_TYPE_REFERENCE)
    }
}

/// Apply $$`ComponentProps` typedef transformations based on collected $`props()` info.
///
/// For JS files without type annotation:
///   `let { a, b } = $props()` →
///   `let/** @typedef {{ a: any, b: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { a, b } = $props()`
///
/// For JS files with `JSDoc` @type annotation:
///   `/** @type {SomeType} */\nlet { a, b } = $props()` →
///   `/** @typedef {SomeType}  $$ComponentProps *//** @type {$$ComponentProps} */\nlet { a, b } = $props()`
///
/// For TS files with type annotation:
///   `let { a, b }: SomeType = $props()` →
///   creates `type $$ComponentProps = SomeType;` before `function $$render()`
///   and replaces `: SomeType` with `:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/`
pub(super) fn apply_props_typedef(
    info: &PropsRuneInfo,
    offset: u32,
    str: &mut MagicString<'_>,
    exported_names: &mut ExportedNames,
    raw_content: &str,
    is_ts: bool,
    basename: &str,
) {
    if info.flags.contains(PropsRuneFlags::HAS_TYPE_ARG)
        && !info.flags.contains(PropsRuneFlags::TYPE_ANNOTATION)
    {
        // TS type-argument form: `let { ... } = $props<TypeArg>()`
        // Mirrors upstream ExportedNames.ts handle$propsRune "Easy mode":
        //   `if (node.initializer.typeArguments?.length > 0 || node.type)`
        if info.flags.contains(PropsRuneFlags::TYPE_ARG_NAMED_REF) {
            // `$props<Props>()` → use Props directly, no $$ComponentProps needed.
            // props_type_text is already set by detect_props_rune_oxc.
            // No source manipulation needed.
        } else {
            // `$props<{ data: T; flag?: boolean }>()` → synthesize $$ComponentProps.
            // Mirror upstream's move-to-scriptStart mechanism:
            //   1. prepend_right(arg_start, ";type $$ComponentProps = ") — travels with chunk
            //   2. append_left(arg_end, ";") — travels with chunk
            //   3. move_range(arg_start, arg_end, scriptStart) — done in svelte2tsx.rs
            //   4. append_right(arg_end, "/*...$$ComponentProps...*/") — stays at original position
            // The move_range + append_right means the inline type is hoisted outside $$render
            // and the call site gets `$props</*Ωignore_startΩ*/ $$ComponentProps /*Ωignore_endΩ*/>()`.
            if let (Some(arg_start), Some(arg_end)) = (info.type_arg_start, info.type_arg_end) {
                let abs_start = arg_start + offset;
                let abs_end = arg_end + offset;
                // Prepend `;type $$ComponentProps = ` before the inline type (travels with move)
                str.prepend_right(abs_start, "\ntype $$ComponentProps = ");
                // Append `;` after the inline type (travels with move)
                str.append_left(abs_end, ";");
                // After the move, place $$ComponentProps reference at the original location.
                // This must be done BEFORE the move_range call in svelte2tsx.rs (or at any time,
                // since append_right inserts into the intro of the chunk at abs_end, which is NOT
                // the moved chunk but the chunk that starts right after abs_end).
                str.append_right(
                    abs_end,
                    "/*\u{03A9}ignore_start\u{03A9}*/ $$ComponentProps /*\u{03A9}ignore_end\u{03A9}*/",
                );
                // Signal svelte2tsx.rs to call move_range(abs_start, abs_end, scriptStart)
                exported_names.props_type_arg_hoist = Some((abs_start, abs_end));
                exported_names.set_props_type_arg_hoist_ts(true);
            }
            exported_names.set_has_component_props_typedef(true);
        }
        return;
    }

    if info
        .flags
        .contains(PropsRuneFlags::TYPE_ANNOTATION | PropsRuneFlags::HOISTABLE_TYPE)
        && !info.flags.contains(PropsRuneFlags::NAMED_TYPE_REFERENCE)
    {
        // TS case with inline object type: `: { a: number, b: string }`
        // Create $$ComponentProps alias and replace everything from `:` to end of type
        // Result: `:/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/`
        if let (Some(colon), Some(ta_end)) = (info.colon_pos, info.type_annotation_end) {
            let abs_colon = colon + offset;
            let abs_end = ta_end + offset;
            // Overwrite from the character after `:` to the end of the type
            str.overwrite(
                abs_colon + 1,
                abs_end,
                "/*\u{03A9}ignore_start\u{03A9}*/$$ComponentProps/*\u{03A9}ignore_end\u{03A9}*/",
            );
        }
        exported_names.set_has_component_props_typedef(true);
        // Track the position right BEFORE the leading whitespace of the
        // `let { ... } = $props()` declaration so the caller can insert
        // `;type $$ComponentProps = ...;` there when the type cannot be
        // hoisted out of $$render (e.g. when it references `typeof <runtime-var>`
        // or a generic). This matches the JS reference's
        // `move(generic_arg.pos, generic_arg.end, node.parent.pos)` — TypeScript's
        // `pos` lands right after the previous statement's trailing trivia.
        let raw_bytes = raw_content.as_bytes();
        let mut p = info.let_pos as usize;
        while p > 0 {
            let prev = raw_bytes[p - 1];
            if prev == b' ' || prev == b'\t' || prev == b'\n' || prev == b'\r' {
                p -= 1;
            } else {
                break;
            }
            // Rest element ({ ...rest }) is intentionally not added as a prop
        }
        exported_names.props_let_abs_pos = Some(source_offset(p) + offset);
    } else if info.flags.contains(PropsRuneFlags::TYPE_ANNOTATION)
        && !info
            .flags
            .contains(PropsRuneFlags::HOISTABLE_TYPE | PropsRuneFlags::NAMED_TYPE_REFERENCE)
    {
        // TS case with non-TSTypeReference annotation (e.g. `SvelteHTMLElements["div"]`,
        // union types, intersection types, etc.).
        // Mirrors the official `!ts.isTypeReferenceNode(generic_arg)` branch:
        // create a `$$ComponentProps` alias and replace the annotation with
        // `/*Ωignore_startΩ*/$$ComponentProps/*Ωignore_endΩ*/`.
        // The type alias is placed BEFORE `$$render` (same mechanism as the hoistable
        // TSTypeLiteral case) via `props_let_abs_pos` + `props_type_text`.
        if let (Some(colon), Some(ta_end)) = (info.colon_pos, info.type_annotation_end) {
            let abs_colon = colon + offset;
            let abs_end = ta_end + offset;
            str.overwrite(
                abs_colon + 1,
                abs_end,
                "/*\u{03A9}ignore_start\u{03A9}*/$$ComponentProps/*\u{03A9}ignore_end\u{03A9}*/",
            );
        }
        exported_names.set_has_component_props_typedef(true);
        // props_type_text is the original type text (set by detect_props_rune_oxc).
        // svelte2tsx.rs uses it in `ts_component_props_before_render` to emit
        // `;type $$ComponentProps = <type_text>;` before `function $$render`.
        // Leave type_already_inserted = false so it goes BEFORE render.
        let raw_bytes = raw_content.as_bytes();
        let mut p = info.let_pos as usize;
        while p > 0 {
            let prev = raw_bytes[p - 1];
            if prev == b' ' || prev == b'\t' || prev == b'\n' || prev == b'\r' {
                p -= 1;
            } else {
                break;
            }
        }
        exported_names.props_let_abs_pos = Some(source_offset(p) + offset);
    } else if info
        .flags
        .contains(PropsRuneFlags::TYPE_ANNOTATION | PropsRuneFlags::NAMED_TYPE_REFERENCE)
    {
        // TS case with simple named type reference: `: Props` or `: Props<T>`
        // Keep the type annotation as-is, use it directly in props_type_text
        // (props_type_text is already set by detect_props_rune_oxc)
        // Don't create $$ComponentProps
    } else if !is_ts && let Some(ref jsdoc_type) = info.jsdoc_type {
        // JS case with JSDoc @type. Upstream reaches its whole JSDoc scan under
        // `if (!this.isTsFile)` (`ExportedNames.ts:242`), so a `lang="ts"` script
        // whose `$props()` carries a `/** @type {…} */` derives `$$ComponentProps`
        // from the destructuring instead of honouring the comment.
        // Check if the type is an inline object type `{{ ... }}` or a named reference `{SomeType}`
        let inner = jsdoc_type
            .strip_prefix('{')
            .and_then(|s| s.strip_suffix('}'))
            .unwrap_or("");
        let is_inline_object_type = inner.starts_with('{');

        if is_inline_object_type {
            // Inline object type: transform `/** @type {{ a: number }} */` to
            // `/** @typedef {{ a: number }}  $$ComponentProps *//** @type {$$ComponentProps} */`.
            //
            // Mirrors the official JS two-step:
            //   1. overwrite `@type` → `@typedef`
            //   2. overwrite `*/` at end → ` $$ComponentProps */` + `/** @type {$$ComponentProps} */`
            //
            // The original comment typically has a space before `*/` (e.g. `}} */`).
            // After step 2, that space is preserved and the new ` $$ComponentProps */`
            // contributes another space → two spaces between `}}` and `$$ComponentProps`.
            // We replicate by finding the `*/` position in the original and capturing
            // the trailing whitespace between the type text and `*/`.
            if let (Some(jsdoc_start), Some(jsdoc_end)) = (info.jsdoc_start, info.jsdoc_end) {
                let orig_comment = &raw_content[jsdoc_start as usize..jsdoc_end as usize];
                // Locate `@type` and `*/` positions within the original comment text
                let typedef = if let (Some(at_type_rel), Some(star_slash_rel)) =
                    (orig_comment.find("@type"), orig_comment.rfind("*/"))
                {
                    // Everything from `/**` up to (but not including) `@type`
                    let prefix = &orig_comment[..at_type_rel];
                    // The type content including surrounding whitespace up to `*/`
                    // e.g. for `/** @type {{ a: string }} */`: after-@typedef text
                    let after_typedef_kw = &orig_comment[at_type_rel + 5..star_slash_rel];
                    // after_typedef_kw is like ` {{ a: string }} ` (includes surrounding spaces)
                    // Produce: `/** @typedef{{ a: string }} $$ComponentProps *//** @type {$$ComponentProps} */`
                    // The official replaces `*/` with ` $$ComponentProps */`, so the space before `*/`
                    // in the original is preserved plus one new space → two spaces for the typical case.
                    format!(
                        "{prefix}@typedef{after_typedef_kw} $$ComponentProps *//** @type {{$$ComponentProps}} */"
                    )
                } else {
                    // Fallback: generate from extracted type (may lose trailing space)
                    format!(
                        "/** @typedef {jsdoc_type} $$ComponentProps *//** @type {{$$ComponentProps}} */"
                    )
                };
                let abs_start = jsdoc_start + offset;
                let abs_end = jsdoc_end + offset;
                str.overwrite(abs_start, abs_end, &typedef);
            }
            exported_names.set_has_component_props_typedef(true);
        } else {
            // Named type reference: keep `/** @type {SomeType} */` as-is
            // Use the type name directly in create_props_str
        }
        exported_names.props_jsdoc_type = Some(jsdoc_type.clone());
    } else if info.prop_types.is_empty()
        && !info
            .flags
            .contains(PropsRuneFlags::HAS_REST | PropsRuneFlags::HAS_UNKNOWN_PROPS)
    {
        // No named props, no rest element, no non-identifier keys:
        // whole-object identifier (`let props = $props()`) or empty ObjectPattern (`let {} = $props()`).
        //
        // Official sets `this.$props.type = '$$ComponentProps'` (TS) or
        // `this.$props.comment = '/** @type {$$ComponentProps} */'` (JS) unconditionally,
        // without emitting any type alias — the identifier `$$ComponentProps` is left
        // unresolved but that's intentional (mirrors official behavior exactly).
        // Reference: ExportedNames.ts handle$propsRune lines 376-401.
        if is_ts {
            // TS: props_type_text = "$$ComponentProps" → create_props_str returns `{} as any as $$ComponentProps`
            // has_component_props_typedef stays false (no alias emitted)
            exported_names.props_type_text = Some("$$ComponentProps".to_string());
        } else {
            // JS: has_component_props_typedef = true → create_props_str returns `/** @type {$$ComponentProps} */({})`
            // No source changes needed, no typedef inserted
            exported_names.set_has_component_props_typedef(true);
        }
    } else if !info.prop_types.is_empty()
        || info
            .flags
            .contains(PropsRuneFlags::HAS_REST | PropsRuneFlags::HAS_UNKNOWN_PROPS)
    {
        // Auto-generate typedef from destructured props.
        //
        // For SvelteKit `+page.svelte` / `+layout.svelte` route files, override
        // the inferred `any` for the well-known prop names `data`, `form`,
        // `params` with `import('./$types.js').*` references — matches the JS
        // reference's `isKitRouteFile` branch in `ExportedNames.handle$propsRune`.
        let kit_layout = classify_kit_route_file(basename);
        // Build type entries for each named prop.
        //
        // For SvelteKit route files, the official code only includes the well-known
        // kit props (`data`, `form`, `params`) and silently skips any other names
        // (their types are not inferred). After the loop, layout files get
        // `children: import('svelte').Snippet` appended unconditionally.
        // For non-kit files, all named props are included with inferred types.
        // Mirrors official ExportedNames.ts lines 296-366.
        let mut type_entries: Vec<String> = info
            .prop_types
            .iter()
            .filter_map(|(name, optional, inferred_type)| {
                if let Some(is_layout) = kit_layout {
                    // Kit route file: only include special props
                    let kit_type = match name.as_str() {
                        "data" => Some(
                            if is_layout {
                                "import('./$types.js').LayoutData"
                            } else {
                                "import('./$types.js').PageData"
                            }
                            .to_string(),
                        ),
                        "form" if !is_layout => {
                            Some("import('./$types.js').ActionData".to_string())
                        }
                        "params" => Some(
                            if is_layout {
                                "import('./$types.js').LayoutProps['params']"
                            } else {
                                "import('./$types.js').PageProps['params']"
                            }
                            .to_string(),
                        ),
                        _ => return None, // skip non-kit props; they're not inferred for kit files
                    };
                    Some(format!("{}: {}", name, kit_type.unwrap()))
                } else {
                    // Non-kit file: include all props with inferred types
                    let resolved = inferred_type.as_str();
                    if *optional {
                        Some(format!("{name}?: {resolved}"))
                    } else {
                        Some(format!("{name}: {resolved}"))
                    }
                }
            })
            .collect();

        // For SvelteKit layout files, always append `children: import('svelte').Snippet`.
        // Mirrors official ExportedNames.ts line 364-366:
        //   `if (isKitLayoutFile) { props.push('children: import(\'svelte\').Snippet'); }`
        if kit_layout == Some(true) {
            type_entries.push("children: import('svelte').Snippet".to_string());
        }

        // `with_unknown` mirrors official's `withUnknown`: true when there's a rest
        // element OR non-identifier property keys (e.g. 'kebab-case': x).
        let with_unknown = info
            .flags
            .contains(PropsRuneFlags::HAS_REST | PropsRuneFlags::HAS_UNKNOWN_PROPS);

        // Build the type body string, mirroring official lines 368-377:
        //   if props.length > 0:
        //     `{ p1: T1, p2?: T2 }` + (withUnknown ? ' & Record<string, any>' : '')
        //   else if withUnknown (rest only or unknown-prop only):
        //     `Record<string, any>`
        //   else (no props, no unknown):
        //     `Record<string, never>`
        let type_body = if !type_entries.is_empty() && with_unknown {
            // Named props AND (rest element or unknown props): `{ ... } & Record<string, any>`
            format!("{{ {} }} & Record<string, any>", type_entries.join(", "))
        } else if !type_entries.is_empty() {
            format!("{{ {} }}", type_entries.join(", "))
        } else if with_unknown {
            // Only rest/unknown, no named props
            "Record<string, any>".to_string()
        } else {
            "Record<string, never>".to_string()
        };

        // Only synthesise the `$$ComponentProps` alias + `: $$ComponentProps`
        // annotation when there is something to type — i.e. at least one inferred
        // prop OR a rest/unknown widening. Mirrors upstream ExportedNames.ts
        // `if (props.length > 0 || withUnknown)` (line 384): when the inference
        // yields `Record<string, never>` (e.g. a SvelteKit route file whose only
        // props are non-kit names, or `let { x = $bindable() } = $props()` on a
        // `+page.svelte`), upstream emits NOTHING — no alias, no annotation —
        // leaving `$props()` untyped. The `$bindable()` ignore markers below are
        // emitted regardless.
        let emit_props_typedef = !type_entries.is_empty() || with_unknown;
        if !emit_props_typedef {
            // Inference collapsed to `Record<string, never>`, so no alias /
            // annotation is emitted — but upstream still sets
            // `this.$props.type = '$$ComponentProps'` (ExportedNames.ts line 383,
            // outside the `props.length > 0 || withUnknown` guard), so the
            // component's return type is `{} as any as $$ComponentProps`
            // (TS) / `/** @type {$$ComponentProps} */({})` (JS) — identical to
            // the whole-object/untyped `$props()` case handled above.
            if is_ts {
                exported_names.props_type_text = Some("$$ComponentProps".to_string());
            } else {
                exported_names.set_has_component_props_typedef(true);
            }
        } else if is_ts {
            // TS case: The type declaration `/*Ωignore_startΩ*/;type $$ComponentProps = { ... };/*Ωignore_endΩ*/`
            // will be inserted by svelte2tsx.rs as part of the $$render function body.
            // Here we only add `: $$ComponentProps` after the destructuring pattern `}`.

            // Insert `: $$ComponentProps` after the destructuring pattern `}`
            let abs_pattern_end = info.destructure_end + offset;
            str.append_left(abs_pattern_end, ": $$ComponentProps");

            exported_names.set_has_component_props_typedef(true);
            // Store the type text as props_type_text so it's used in `create_props_str`
            exported_names.props_type_text = Some(type_body);
            // Mark that this is a best-effort type that needs to go inside $$render
            exported_names.set_type_already_inserted(true);
            // Track the let position so the caller (`svelte2tsx::svelte2tsx`)
            // can insert the synthesised `;type $$ComponentProps = ...;` right
            // before the `let { ... } = $props()` statement instead of at the
            // very start of `$$render` — matches the JS reference's
            // `preprendStr(node.parent.pos + astOffset, ...)`. `node.parent.pos`
            // spans the declaration's *leading trivia*, so the insertion lands
            // BEFORE any `//` / `/* */` comments that precede the `let` — walk
            // back through them too, otherwise the typedef gets appended onto a
            // preceding `// …` line and is swallowed by that line comment.
            let raw_bytes = raw_content.as_bytes();
            let p = walk_back_through_trivia(raw_bytes, info.let_pos as usize);
            exported_names.props_let_abs_pos = Some(source_offset(p) + offset);
        } else {
            // JS case: Insert JSDoc typedef between `let` and `{`
            let typedef_text = format!(
                "/** @typedef {{{type_body}}} $$ComponentProps *//** @type {{$$ComponentProps}} */"
            );

            let abs_let = info.let_pos + offset;
            let abs_destruct = info.destructure_start + offset;
            // Insert right after the declaration keyword. The keyword is usually
            // `let` (3 chars) but may be `const` (5) — count the leading
            // identifier characters at `let_pos` instead of assuming `let`.
            let raw_bytes = raw_content.as_bytes();
            let mut kw_len = 0usize;
            let start = info.let_pos as usize;
            while start + kw_len < raw_bytes.len()
                && raw_bytes[start + kw_len].is_ascii_alphabetic()
            {
                kw_len += 1;
            }
            let insert_pos = abs_let + source_offset(kw_len); // after the keyword (let/const/var)
            let typedef_with_space = format!("{typedef_text} ");
            str.overwrite(insert_pos, abs_destruct, &typedef_with_space);
            exported_names.set_has_component_props_typedef(true);
        }
    }

    // Append $bindable() ignore markers after $props() call
    if !info.bindable_names.is_empty() {
        let abs_end = info.props_call_end + offset;
        let bindable_refs: Vec<&str> = info
            .bindable_names
            .iter()
            .map(std::string::String::as_str)
            .collect();
        let marker = format!(
            "/*\u{03A9}ignore_start\u{03A9}*/;{};/*\u{03A9}ignore_end\u{03A9}*/",
            bindable_refs.join(";")
        );
        str.append_left(abs_end, &marker);
    }
}

/// Check if a variable declarator's init is a `$props()` call.
pub(super) fn is_props_call_oxc(declarator: &oxc::VariableDeclarator) -> bool {
    if let Some(ref init) = declarator.init
        && let oxc::Expression::CallExpression(call) = init
        && let oxc::Expression::Identifier(ref callee) = call.callee
    {
        return callee.name == "$props";
    }
    false
}

/// Detect `$props()` usage in a variable declarator and extract prop names.
pub(super) fn detect_props_rune_oxc(
    declarator: &oxc::VariableDeclarator,
    exported_names: &mut ExportedNames,
    raw_content: &str,
) {
    if is_props_call_oxc(declarator) {
        exported_names.set_has_props_rune(true);
        exported_names.set_uses_runes(true);

        // Extract type from the $props() call, checking type arguments first
        // (mirrors upstream's `generic_arg = node.initializer.typeArguments?.[0] || node.type`).
        // 1. Check type arguments: `let { ... } = $props<Props>()`
        // 2. Fall back to type annotation: `let { ... }: Props = $props()`
        let mut found_type = false;
        if let Some(ref init) = declarator.init
            && let oxc::Expression::CallExpression(call) = init
            && let Some(ref type_args) = call.type_arguments
            && let Some(first_param) = type_args.params.first()
        {
            let start = first_param.span().start as usize;
            let end = first_param.span().end as usize;
            if start < end && end <= raw_content.len() {
                let type_text = &raw_content[start..end];
                // For plain named type references, use directly.
                // For complex types (inline object, union, etc.), the type is
                // MOVED to scriptStart via props_type_arg_hoist — do NOT set
                // props_type_text here, otherwise ts_component_props_before_render
                // would emit a duplicate `type $$ComponentProps = ...;`.
                if matches!(first_param, oxc::TSType::TSTypeReference(_)) {
                    exported_names.props_type_text = Some(type_text.to_string());
                }
                // Non-named type arg: props_type_text stays None;
                // create_props_str uses props_type_arg_hoist_ts flag instead.
                found_type = true;
            }
        }
        if !found_type {
            // Extract type annotation if present (e.g., `: Props` in `let {...}: Props = $props()`)
            if let Some(ref ta) = declarator.type_annotation {
                let ts_type = &ta.type_annotation;
                let start = ts_type.span().start as usize;
                let end = ts_type.span().end as usize;
                if start < end && end <= raw_content.len() {
                    let type_text = &raw_content[start..end];
                    exported_names.props_type_text = Some(type_text.to_string());
                }
            }
        }

        extract_props_from_binding_pattern_runes(&declarator.id, exported_names, raw_content);
    }
}

/// Check if an expression is a `$bindable()` call, optionally returning the inner argument text.
/// Also handles `$bindable(x) as Type` (`TSAsExpression` wrapping $bindable).
fn is_bindable_call(expr: &oxc::Expression, raw_content: &str) -> (bool, Option<String>) {
    // Unwrap TSAsExpression if present: `$bindable(0) as number`
    let inner = match expr {
        oxc::Expression::TSAsExpression(ts_as) => &ts_as.expression,
        other => other,
    };
    if let oxc::Expression::CallExpression(call) = inner
        && let oxc::Expression::Identifier(ref callee) = call.callee
        && callee.name == "$bindable"
    {
        // Get the first argument if any (for type inference)
        let arg_text = call.arguments.first().map(|arg| {
            let start = arg.span().start as usize;
            let end = arg.span().end as usize;
            raw_content[start..end].to_string()
        });
        return (true, arg_text);
    }
    (false, None)
}

/// Infer a type string from a default value expression for `JSDoc` $$`ComponentProps` typedef.
fn infer_type_from_default(expr: &oxc::Expression, raw_content: &str) -> String {
    match expr {
        oxc::Expression::BooleanLiteral(_) => "boolean".to_string(),
        oxc::Expression::NumericLiteral(_) => "number".to_string(),
        oxc::Expression::StringLiteral(_) => "string".to_string(),
        oxc::Expression::ArrayExpression(_) => "any[]".to_string(),
        oxc::Expression::ObjectExpression(_) => "Record<string, any>".to_string(),
        // Upstream tests `ts.isArrowFunction` and nothing else, so a `function`
        // expression — named or not — falls through to `any` there.
        oxc::Expression::ArrowFunctionExpression(_) => "Function".to_string(),
        oxc::Expression::Identifier(id) => {
            if id.name == "undefined" {
                "any".to_string()
            } else {
                format!("typeof {}", id.name)
            }
        }
        oxc::Expression::CallExpression(call) => {
            // Check for $bindable() - extract inner type
            if let oxc::Expression::Identifier(ref callee) = call.callee
                && callee.name == "$bindable"
            {
                if let Some(first_arg) = call.arguments.first() {
                    if let oxc::Argument::SpreadElement(_) = first_arg {
                        return "any".to_string();
                    }
                    return infer_type_from_default(first_arg.to_expression(), raw_content);
                }
                return "any".to_string();
            }
            "any".to_string()
        }
        oxc::Expression::TSAsExpression(ts_as) => {
            // `value as Type` → use the asserted type text from source
            let start = ts_as.type_annotation.span().start as usize;
            let end = ts_as.type_annotation.span().end as usize;
            if start < end && end <= raw_content.len() {
                raw_content[start..end].to_string()
            } else {
                "any".to_string()
            }
        }
        _ => "any".to_string(),
    }
}

/// Extract prop names from a destructuring pattern used with `$props()`.
///
/// Handles `ObjectPattern`: `{ a, b = 1, ...rest }`
/// Also detects $`bindable()` and infers types for `JSDoc` $$`ComponentProps` typedef.
pub(super) fn extract_props_from_binding_pattern_runes(
    pattern: &oxc::BindingPattern,
    exported_names: &mut ExportedNames,
    raw_content: &str,
) {
    if let oxc::BindingPattern::ObjectPattern(obj_pat) = pattern {
        for prop in &obj_pat.properties {
            let key_name = property_key_to_string(&prop.key);
            let (local_name, has_default, is_bindable) =
                if let oxc::BindingPattern::AssignmentPattern(assign) = &prop.value {
                    // { a = 1 } or { a = $bindable() }
                    let name = binding_pattern_simple_name(&assign.left);
                    let (bindable, _) = is_bindable_call(&assign.right, raw_content);
                    (name, true, bindable)
                } else {
                    let name = binding_pattern_simple_name(&prop.value);
                    (name, false, false)
                };

            if let Some(ref key) = key_name {
                // Under `version: '4'` a $props() destructure is not runes mode
                // upstream, so its names never become exports and must not leak
                // into the legacy props / class-getter output.
                if exported_names.is_svelte5_plus() {
                    let local = local_name.unwrap_or(key).to_owned();
                    exported_names.add(key.clone(), local, has_default, None, true);
                }
                if is_bindable {
                    exported_names.bindable_props.push(key.clone());
                }
            }
        }
    }
}

/// Collect detailed position info from a $`props()` variable declaration for typedef generation.
pub(super) fn collect_props_rune_info(
    var_decl: &oxc::VariableDeclaration,
    declarator: &oxc::VariableDeclarator,
    raw_content: &str,
    program: &oxc::Program,
    stmt_index: usize,
) -> Option<PropsRuneInfo> {
    if !is_props_call_oxc(declarator) {
        return None;
    }

    let let_pos = var_decl.span.start;
    let destructure_start = declarator.id.span().start;
    let destructure_end = declarator.id.span().end;
    let props_call_end = declarator.init.as_ref().map_or(0, |e| e.span().end);

    // Detect type annotation
    // Also detect if the type is "hoistable" (inline object type vs named type reference)
    let TypeAnnotationInfo {
        has_type_annotation,
        type_annotation_end,
        type_text,
        is_hoistable_type,
        is_named_type_reference,
        colon_pos,
    } = type_annotation_info(declarator, raw_content);

    // Detect JSDoc @type comment before the let statement
    let (jsdoc_type, jsdoc_start, jsdoc_end) = detect_jsdoc_type_before(
        raw_content,
        var_decl.span.start as usize,
        program,
        stmt_index,
    );

    let BindingPropsInfo {
        has_rest,
        has_unknown_props,
        prop_types,
        bindable_names,
    } = binding_props_info(&declarator.id, raw_content);

    // Detect type arguments on the $props() call: `$props<TypeArg>()`
    let (has_type_arg, type_arg_start, type_arg_end, type_arg_text, type_arg_is_named_ref) =
        if let Some(ref init) = declarator.init
            && let oxc::Expression::CallExpression(call) = init
            && let Some(ref type_args) = call.type_arguments
            && let Some(first_param) = type_args.params.first()
        {
            let start = first_param.span().start;
            let end = first_param.span().end;
            let text =
                if (start as usize) < raw_content.len() && (end as usize) <= raw_content.len() {
                    Some(raw_content[start as usize..end as usize].to_string())
                } else {
                    None
                };
            let is_named_ref = matches!(first_param, oxc::TSType::TSTypeReference(_));
            (true, Some(start), Some(end), text, is_named_ref)
        } else {
            (false, None, None, None, false)
        };

    let mut flags = PropsRuneFlags::default();
    flags.mark_if(PropsRuneFlags::TYPE_ANNOTATION, has_type_annotation);
    flags.mark_if(PropsRuneFlags::HOISTABLE_TYPE, is_hoistable_type);
    flags.mark_if(
        PropsRuneFlags::NAMED_TYPE_REFERENCE,
        is_named_type_reference,
    );
    flags.mark_if(PropsRuneFlags::HAS_REST, has_rest);
    flags.mark_if(PropsRuneFlags::HAS_UNKNOWN_PROPS, has_unknown_props);
    flags.mark_if(PropsRuneFlags::HAS_TYPE_ARG, has_type_arg);
    flags.mark_if(PropsRuneFlags::TYPE_ARG_NAMED_REF, type_arg_is_named_ref);

    Some(PropsRuneInfo {
        let_pos,
        destructure_start,
        destructure_end,
        props_call_end,
        flags,
        type_annotation_end,
        type_text,
        jsdoc_type,
        jsdoc_start,
        jsdoc_end,
        colon_pos,
        prop_types,
        bindable_names,
        type_arg_start,
        type_arg_end,
        type_arg_text,
    })
}

struct BindingPropsInfo {
    has_rest: bool,
    has_unknown_props: bool,
    prop_types: Vec<(String, bool, String)>,
    bindable_names: Vec<String>,
}

fn binding_props_info(pattern: &oxc::BindingPattern, source: &str) -> BindingPropsInfo {
    let oxc::BindingPattern::ObjectPattern(object) = pattern else {
        return BindingPropsInfo {
            has_rest: false,
            has_unknown_props: false,
            prop_types: Vec::new(),
            bindable_names: Vec::new(),
        };
    };
    let mut info = BindingPropsInfo {
        has_rest: object.rest.is_some(),
        has_unknown_props: false,
        prop_types: Vec::new(),
        bindable_names: Vec::new(),
    };
    for property in &object.properties {
        collect_binding_property(property, source, &mut info);
    }
    info
}

fn collect_binding_property(
    property: &oxc::BindingProperty,
    source: &str,
    info: &mut BindingPropsInfo,
) {
    if !matches!(&property.key, oxc::PropertyKey::StaticIdentifier(_)) {
        info.has_unknown_props = true;
        return;
    }
    let Some(key) = property_key_to_string(&property.key) else {
        return;
    };
    match &property.value {
        oxc::BindingPattern::AssignmentPattern(assignment) => {
            let Some(local_name) = binding_pattern_simple_name(&assignment.left) else {
                info.has_unknown_props = true;
                return;
            };
            let inferred = infer_type_from_default(&assignment.right, source);
            let (bindable, _) = is_bindable_call(&assignment.right, source);
            info.prop_types.push((key, true, inferred));
            if bindable {
                info.bindable_names.push(local_name.to_owned());
            }
        }
        oxc::BindingPattern::BindingIdentifier(_) => {
            info.prop_types.push((key, false, "any".to_string()));
        }
        _ => info.has_unknown_props = true,
    }
}

struct TypeAnnotationInfo {
    has_type_annotation: bool,
    type_annotation_end: Option<u32>,
    type_text: Option<String>,
    is_hoistable_type: bool,
    is_named_type_reference: bool,
    colon_pos: Option<u32>,
}

fn type_annotation_info(declarator: &oxc::VariableDeclarator, source: &str) -> TypeAnnotationInfo {
    declarator.type_annotation.as_ref().map_or(
        TypeAnnotationInfo {
            has_type_annotation: false,
            type_annotation_end: None,
            type_text: None,
            is_hoistable_type: false,
            is_named_type_reference: false,
            colon_pos: None,
        },
        |annotation| {
            let ty = &annotation.type_annotation;
            let start = ty.span().start as usize;
            let end = ty.span().end as usize;
            let text = (start < source.len() && end <= source.len())
                .then(|| source[start..end].to_string());
            TypeAnnotationInfo {
                has_type_annotation: true,
                type_annotation_end: Some(ty.span().end),
                type_text: text,
                is_hoistable_type: matches!(ty, oxc::TSType::TSTypeLiteral(_)),
                is_named_type_reference: matches!(ty, oxc::TSType::TSTypeReference(_)),
                colon_pos: Some(annotation.span.start),
            }
        },
    )
}

/// Detect a `JSDoc` `@type` comment immediately before a given position.
///
/// Looks for patterns like `/** @type {SomeType} */` preceding a variable declaration.
fn detect_jsdoc_type_before(
    raw_content: &str,
    stmt_start: usize,
    _program: &oxc::Program,
    _stmt_index: usize,
) -> (Option<String>, Option<u32>, Option<u32>) {
    // Look backwards from stmt_start for `*/`
    let before = &raw_content[..stmt_start];
    let trimmed = before.trim_end();
    if !trimmed.ends_with("*/") {
        return (None, None, None);
    }

    // Find the start of the comment `/**`
    if let Some(comment_end) = before.rfind("*/") {
        let comment_end_pos = comment_end + 2;
        if let Some(comment_start) = before[..comment_end].rfind("/**") {
            let comment_text = &before[comment_start..comment_end_pos];
            // Check if it's a @type comment
            if let Some(type_start_offset) = comment_text.find("@type") {
                let after_at_type = &comment_text[type_start_offset + 5..];
                let trimmed_after = after_at_type.trim_start();
                if trimmed_after.starts_with('{') {
                    // Extract the type text between { and }
                    if let Some(brace_end) = find_matching_brace(trimmed_after) {
                        let type_text = &trimmed_after[..=brace_end];
                        return (
                            Some(type_text.to_string()),
                            Some(source_offset(comment_start)),
                            Some(source_offset(comment_end_pos)),
                        );
                    }
                }
            }
        }
    }

    (None, None, None)
}

/// Find the matching closing brace for `{...}`, handling nested braces.
fn find_matching_brace(text: &str) -> Option<usize> {
    let mut depth = 0;
    for (i, ch) in text.char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::super::test_support::{run_svelte2tsx, run_svelte2tsx_ts};

    #[test]
    fn test_props_rune_simple() {
        let source = "<script>\nlet { a, b } = $props();\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("a"));
        assert!(result.exported_names.has("b"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b"]);
        assert!(!result.exported_names.get("a").unwrap().has_default());
        assert!(!result.exported_names.get("b").unwrap().has_default());
    }

    #[test]
    fn test_props_rune_with_defaults() {
        let source = "<script>\nlet { count = 0, name = \"world\" } = $props();\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("count"));
        assert!(result.exported_names.has("name"));
        assert!(result.exported_names.get("count").unwrap().has_default());
        assert!(result.exported_names.get("name").unwrap().has_default());
    }

    #[test]
    fn test_props_rune_with_rest() {
        let source = "<script>\nlet { a, b, ...rest } = $props();\n</script>";
        let result = run_svelte2tsx(source);

        assert!(result.exported_names.has("a"));
        assert!(result.exported_names.has("b"));
        assert!(!result.exported_names.has("rest"));
        assert_eq!(result.exported_names.get_prop_names(), vec!["a", "b"]);
    }

    /// Case A: JS whole-object `let props = $props()` — no typedef, but props slot
    /// uses `/** @type {$$ComponentProps} */({})` (mirrors official behavior).
    /// Reference: ExportedNames.ts handle$propsRune, else-branch line 393.
    #[test]
    fn test_component_props_js_whole_object() {
        let source = "<script>\nlet props = $props();\n</script>\n<p>{props.x}</p>";
        let result = run_svelte2tsx(source);
        // No typedef should be emitted
        assert!(
            !result.code.contains("@typedef"),
            "JS whole-object: no @typedef expected, got:\n{}",
            result.code
        );
        // Props slot should use $$ComponentProps
        assert!(
            result.code.contains("/** @type {$$ComponentProps} */({})"),
            "JS whole-object: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case A-TS: TS whole-object `let props = $props()` — no typedef, but props slot
    /// uses `{} as any as $$ComponentProps` (mirrors official behavior).
    #[test]
    fn test_component_props_ts_whole_object() {
        let source = "<script lang=\"ts\">\nlet props = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // No typedef should be emitted
        assert!(
            !result.code.contains("type $$ComponentProps"),
            "TS whole-object: no type alias expected, got:\n{}",
            result.code
        );
        // Props slot should use $$ComponentProps
        assert!(
            result.code.contains("{} as any as $$ComponentProps"),
            "TS whole-object: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case B: TS with inline object type annotation — creates hoistable `$$ComponentProps` alias.
    /// `let { x }: { a: string } = $props()` →
    ///   `;type $$ComponentProps = { a: string };` (before $$render)
    ///   annotation becomes `/*Ωignore_start*/$$ComponentProps/*Ωignore_end*/`
    ///   props slot: `{} as any as $$ComponentProps`
    /// Reference: ExportedNames.ts handle$propsRune, TSTypeLiteral branch.
    #[test]
    fn test_component_props_ts_inline_object_type() {
        let source = "<script lang=\"ts\">\nlet { x }: { a: string } = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // Should emit type alias before $$render
        assert!(
            result.code.contains("type $$ComponentProps ="),
            "TS inline type: should emit $$ComponentProps alias, got:\n{}",
            result.code
        );
        // Annotation should be replaced with $$ComponentProps
        assert!(
            result.code.contains("$$ComponentProps"),
            "annotation should reference $$ComponentProps, got:\n{}",
            result.code
        );
        // Props slot should use `{} as any as $$ComponentProps`
        assert!(
            result.code.contains("{} as any as $$ComponentProps"),
            "props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case C: TS with named type reference — uses type directly, no $$ComponentProps.
    /// `let { x }: Props = $props()` → props slot: `{} as any as Props`
    /// Reference: ExportedNames.ts handle$propsRune, TSTypeReferenceNode branch.
    #[test]
    fn test_component_props_ts_named_type_ref() {
        let source = "<script lang=\"ts\">\ninterface Props { x: string }\nlet { x }: Props = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // Should NOT emit $$ComponentProps alias
        assert!(
            !result.code.contains("type $$ComponentProps"),
            "TS named ref: should NOT emit $$ComponentProps alias, got:\n{}",
            result.code
        );
        // Props slot should use Props directly
        assert!(
            result.code.contains("{} as any as Props"),
            "TS named ref: props slot should use Props, got:\n{}",
            result.code
        );
    }

    /// Case D: TS with non-TSTypeReference annotation (e.g. TSIndexedAccessType) — creates $$ComponentProps.
    /// `let { x }: SvelteHTMLElements["div"] = $props()` →
    ///   `type $$ComponentProps = SvelteHTMLElements["div"];` (before $$render)
    ///   props slot: `{} as any as $$ComponentProps`
    /// Reference: ExportedNames.ts handle$propsRune, !isTypeReferenceNode branch.
    #[test]
    fn test_component_props_ts_indexed_access_type() {
        let source = "<script lang=\"ts\">\nlet { x }: SomeType[\"key\"] = $props();\n</script>";
        let result = run_svelte2tsx_ts(source);
        // Should emit $$ComponentProps alias
        assert!(
            result.code.contains("type $$ComponentProps ="),
            "TS indexed access: should emit $$ComponentProps alias, got:\n{}",
            result.code
        );
        assert!(
            result.code.contains("{} as any as $$ComponentProps"),
            "TS indexed access: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
    }

    /// Case E: JS with inline JSDoc type `/** @type {{ a: string }} */`.
    /// The `@type` is rewritten to `@typedef` and the type is renamed to `$$ComponentProps`.
    /// Reference: ExportedNames.ts handle$propsRune, JSDoc inline object branch.
    #[test]
    fn test_component_props_js_jsdoc_inline_type() {
        let source = "<script>\n/** @type {{ adjective: string }} */\nlet { adjective } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        // Should have @typedef with $$ComponentProps
        assert!(
            result.code.contains("@typedef"),
            "JS JSDoc inline: should have @typedef, got:\n{}",
            result.code
        );
        assert!(
            result.code.contains("$$ComponentProps"),
            "JS JSDoc inline: should reference $$ComponentProps, got:\n{}",
            result.code
        );
        assert!(
            result.code.contains("/** @type {$$ComponentProps} */({})"),
            "JS JSDoc inline: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
        // The @typedef should have two spaces before $$ComponentProps (preserving original trailing space)
        assert!(
            result.code.contains("}}  $$ComponentProps"),
            "JS JSDoc inline: should have two spaces before $$ComponentProps (orig space preserved), got:\n{}",
            result.code
        );
    }

    /// Case F: JS destructure with rest element + named props.
    /// `let { a, ...rest } = $props()` →
    ///   `@typedef {{ a: any } & Record<string, any>} $$ComponentProps`
    /// Reference: ExportedNames.ts, lines 369-370.
    #[test]
    fn test_component_props_js_rest_with_named_props() {
        let source = "<script>\nlet { a, ...rest } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("{ a: any } & Record<string, any>"),
            "JS rest+named: type should include named props AND Record, got:\n{}",
            result.code
        );
    }

    /// Case G: JS destructure with only rest element.
    /// `let { ...rest } = $props()` → `@typedef {Record<string, any>} $$ComponentProps`
    #[test]
    fn test_component_props_js_rest_only() {
        let source = "<script>\nlet { ...rest } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("Record<string, any>"),
            "JS rest-only: type should be Record<string, any>, got:\n{}",
            result.code
        );
    }

    /// Case H: JS empty destructure `let {} = $props()`.
    /// No typedef, but props slot uses `/** @type {$$ComponentProps} */({})`.
    /// Reference: ExportedNames.ts, empty ObjectBindingPattern path (propsStr = Record<string,never>
    /// but $props.comment = '/** @type {$$ComponentProps} */').
    #[test]
    fn test_component_props_js_empty_destructure() {
        let source = "<script>\nlet {} = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("/** @type {$$ComponentProps} */({})"),
            "JS empty destructure: props slot should use $$ComponentProps, got:\n{}",
            result.code
        );
        // No typedef should be inserted (only the @type comment in props slot)
        assert!(
            !result.code.contains("@typedef"),
            "JS empty destructure: no @typedef expected, got:\n{}",
            result.code
        );
    }

    /// Case I: JS with non-identifier property key (string literal key).
    /// `let { 'kebab-case': x } = $props()` → `withUnknown = true` → `Record<string, any>`
    /// Reference: ExportedNames.ts withUnknown condition line 299-303.
    #[test]
    fn test_component_props_js_non_identifier_key() {
        let source = "<script>\nlet { 'kebab-case': x } = $props();\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("Record<string, any>"),
            "JS non-identifier key: should generate Record<string, any>, got:\n{}",
            result.code
        );
    }
}
