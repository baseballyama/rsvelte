//! `<script generics="…">` parsing and the type-text analysis that decides
//! whether the synthesised `$$ComponentProps` alias can be hoisted above
//! `function $$render()`. Mirrors `svelte2tsx/nodes/Generics.ts`.

use super::super::utils::lexical::is_ascii_ident_byte;

/// Return true if `type_text` mentions any of `names` as a whole identifier
/// (i.e. surrounded by non-identifier characters on both sides).
///
/// Used to detect when a `$$ComponentProps` body references a type/interface
/// or value declared at the top level of the instance script — in which case
/// the synthesised `;type $$ComponentProps = ...;` cannot be hoisted above
/// `function $$render()`.
pub fn type_text_references_any(
    type_text: &str,
    names: &std::collections::HashSet<String>,
) -> bool {
    if names.is_empty() {
        return false;
    }
    let bytes = type_text.as_bytes();
    for name in names {
        if name.is_empty() {
            continue;
        }
        let nbytes = name.as_bytes();
        let mut i = 0usize;
        while i + nbytes.len() <= bytes.len() {
            if &bytes[i..i + nbytes.len()] == nbytes {
                let before_ok = i == 0 || !is_ascii_ident_byte(bytes[i - 1]);
                let after_idx = i + nbytes.len();
                let after_ok = after_idx == bytes.len() || !is_ascii_ident_byte(bytes[after_idx]);
                if before_ok && after_ok {
                    return true;
                }
            }
            i += 1;
        }
    }
    false
}

/// Return true if `type_text` contains a `typeof X` value-query whose root
/// identifier `X` is a value **declared in the instance script** (and not an
/// import).
///
/// This mirrors upstream's `HoistableInterfaces` hoistability test for the
/// synthesised `$$ComponentProps` alias: a `typeof X` adds `X` to the props
/// interface's `value_deps`, and the alias can only be hoisted above
/// `function $$render()` when every value dep is an *allowed reference*
/// (`isAllowedReference`) — i.e. NOT a locally-declared instance value. A
/// `typeof` of an **imported** binding (e.g. `ComponentProps<typeof Button>`
/// where `Button` is `import`ed) stays hoistable, because the import lives at
/// module scope above `$$render`. The previous heuristic forced *every*
/// `typeof` inside `$$render`, which wrongly nested the alias for the very
/// common imported-component case.
pub fn type_text_typeof_references_local_value(
    type_text: &str,
    instance_value_names: &std::collections::HashSet<String>,
    instance_import_names: &std::collections::HashSet<String>,
    module_import_names: &std::collections::HashSet<String>,
    module_value_names: &std::collections::HashSet<String>,
) -> bool {
    let bytes = type_text.as_bytes();
    let kw = b"typeof";
    let mut i = 0usize;
    while i + kw.len() <= bytes.len() {
        if &bytes[i..i + kw.len()] == kw {
            let before_ok = i == 0 || !is_ascii_ident_byte(bytes[i - 1]);
            let mut j = i + kw.len();
            // `typeof` must be followed by whitespace (a value query), not be a
            // prefix of a longer identifier like `typeofX`.
            let has_ws = j < bytes.len() && bytes[j].is_ascii_whitespace();
            if before_ok && has_ws {
                while j < bytes.len() && bytes[j].is_ascii_whitespace() {
                    j += 1;
                }
                // Capture the root identifier (stop at `.` / non-ident), e.g.
                // `foo.bar.baz` -> `foo`.
                let start = j;
                while j < bytes.len() && is_ascii_ident_byte(bytes[j]) {
                    j += 1;
                }
                if j > start {
                    let root = &type_text[start..j];
                    // A `$name` query auto-subscribes, and upstream feeds every
                    // accessed store into `disallowed_values` regardless of how
                    // `name` is bound — so the import exception does not apply.
                    if let Some(base) = root.strip_prefix('$').filter(|b| !b.starts_with('$')) {
                        if !base.is_empty()
                            && (instance_value_names.contains(base)
                                || instance_import_names.contains(base)
                                || module_import_names.contains(base)
                                || module_value_names.contains(base))
                        {
                            return true;
                        }
                    } else {
                        let is_import = instance_import_names.contains(root)
                            || module_import_names.contains(root);
                        if !is_import && instance_value_names.contains(root) {
                            return true;
                        }
                    }
                }
                i = j;
                continue;
            }
        }
        i += 1;
    }
    false
}

/// The parsed `generics="…"` attribute: upstream's `Generics` lists.
///
/// `definitions` are `param.getText()` and `references` are
/// `param.name.getText()` over the type parameters of
/// `` `<${raw}>() => {}` ``, so no bracket kind is special-cased — a comma
/// inside an object type, tuple, parameter list or string literal belongs to
/// the parameter it sits in.
#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct ParsedGenerics {
    pub definitions: Vec<String>,
    pub references: Vec<String>,
}

impl ParsedGenerics {
    /// Upstream `Generics.has()` — the attribute being present is not enough;
    /// it must parse as a type parameter list.
    pub fn has(&self) -> bool {
        !self.definitions.is_empty()
    }

    /// Upstream `toDefinitionString()` without the surrounding `<`/`>`.
    pub fn definitions_str(&self) -> String {
        self.definitions.join(",")
    }

    /// Upstream `toReferencesString()` without the surrounding `<`/`>`.
    pub fn references_str(&self) -> String {
        self.references.join(",")
    }
}

/// Parse a `generics="…"` attribute value the way upstream does: wrap it in an
/// arrow function's type parameter list and read the parameters back off the
/// TypeScript AST. Mirrors `Generics.getGenericTypeParameters`.
pub fn parse_generics_attr(raw: &str) -> ParsedGenerics {
    let mut out = ParsedGenerics::default();
    if raw.is_empty() {
        return out;
    }
    let probe = format!("<{raw}>() => {{}}");
    let allocator = oxc_allocator::Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, &probe, oxc_span::SourceType::ts()).parse();
    let Some(oxc_ast::ast::Statement::ExpressionStatement(stmt)) = parsed.program.body.first()
    else {
        return out;
    };
    let oxc_ast::ast::Expression::ArrowFunctionExpression(arrow) = &stmt.expression else {
        return out;
    };
    let Some(type_parameters) = arrow.type_parameters.as_ref() else {
        return out;
    };
    for param in &type_parameters.params {
        let span = param.span;
        let (start, end) = (span.start as usize, span.end as usize);
        if start > end || end > probe.len() || !probe.is_char_boundary(start) {
            return ParsedGenerics::default();
        }
        out.definitions.push(probe[start..end].to_string());
        out.references.push(param.name.name.to_string());
    }
    out
}

/// Just the type parameter names of a `generics="…"` attribute value.
pub fn split_generic_param_names(generics: &str) -> Vec<String> {
    parse_generics_attr(generics).references
}

/// Extract the `generics` attribute value from a script tag text.
pub fn extract_generics_from_script_tag(tag_text: &str) -> Option<String> {
    if let Some(pos) = tag_text.find("generics=") {
        let after = &tag_text[pos + 9..];
        let trimmed = after.trim_start();
        if let Some(quote_char) = trimmed.chars().next() {
            if quote_char == '"' || quote_char == '\'' {
                let content = &trimmed[1..];
                if let Some(end) = content.find(quote_char) {
                    return Some(content[..end].to_string());
                }
            } else {
                // Unquoted value: take until whitespace or `>`
                let end = trimmed
                    .find(|c: char| c.is_whitespace() || c == '>')
                    .unwrap_or(trimmed.len());
                if end > 0 {
                    return Some(trimmed[..end].to_string());
                }
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use std::collections::HashSet;

    use super::*;

    fn set(names: &[&str]) -> HashSet<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn typeof_local_value_blocks_hoist_but_import_does_not() {
        // `typeof Button` where Button is imported → hoistable (false).
        let imports = set(&["Button"]);
        assert!(!type_text_typeof_references_local_value(
            "ComponentProps<typeof Button>",
            &set(&[]),
            &imports,
            &set(&[]),
            &set(&[]),
        ));
        // `typeof localVal` where localVal is an instance-script value → block (true).
        assert!(type_text_typeof_references_local_value(
            "typeof localVal",
            &set(&["localVal"]),
            &set(&[]),
            &set(&[]),
            &set(&[]),
        ));
        // No `typeof` at all → false.
        assert!(!type_text_typeof_references_local_value(
            "{ a: string; b: number }",
            &set(&["localVal"]),
            &set(&[]),
            &set(&[]),
            &set(&[]),
        ));
        // A module-scope import via `typeof` is also hoistable (false).
        assert!(!type_text_typeof_references_local_value(
            "typeof ModuleThing",
            &set(&[]),
            &set(&[]),
            &set(&["ModuleThing"]),
            &set(&[]),
        ));
    }

    #[test]
    fn typeof_store_blocks_hoist_for_every_binding_kind() {
        // `$store` auto-subscribes, so the underlying binding is disallowed
        // whether it is an instance value, an instance import or a module one.
        for (values, imports, module_imports, module_values) in [
            (set(&["store"]), set(&[]), set(&[]), set(&[])),
            (set(&[]), set(&["store"]), set(&[]), set(&[])),
            (set(&[]), set(&[]), set(&["store"]), set(&[])),
            (set(&[]), set(&[]), set(&[]), set(&["store"])),
        ] {
            assert!(type_text_typeof_references_local_value(
                "{ someProp: typeof $store }",
                &values,
                &imports,
                &module_imports,
                &module_values,
            ));
        }
        // `$$props` & friends are not store references.
        assert!(!type_text_typeof_references_local_value(
            "typeof $$props",
            &set(&["$props"]),
            &set(&[]),
            &set(&[]),
            &set(&[]),
        ));
    }
}
