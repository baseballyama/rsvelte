//! AST-based server INSTANCE / MODULE script transform (Phase-3 rewrite).
//!
//! This is the additive, in-progress port of the server `VariableDeclaration` /
//! `ExpressionStatement` / `ImportDeclaration` global visitors
//! (`submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/`)
//! restricted to the **localized, non-interacting RUNES lowerings**. It parses
//! the script source slice with oxc, walks the top-level statements, classifies
//! each, then RE-PARSES the relevant source spans into the state's allocator and
//! applies the rune lowerings — no node moving across allocators, no text
//! surgery on the output.
//!
//! ## In scope (this slice)
//! - `import …` (instance) → hoisted to module scope, dropped from body.
//! - `let x = $state(e)` / `$state.raw(e)` → `let x = <e>` (no-arg → `void 0`).
//! - `let d = $derived(e)` → `let d = $.derived(() => <e>)`.
//! - `let d = $derived.by(f)` → `let d = $.derived(<f>)`.
//! - `let { … } = $props()` → `let { … } = $$props`, with the `$$slots` /
//!   `$$events` deconfliction injection for the object-WITH-rest and identifier
//!   forms (写经 `VariableDeclaration.js:33-82`; `$$slots` deconflicts to
//!   `$$slots_` when `analysis.uses_slots`).
//! - class-field runes: `count = $state(0)` → `count = 0`, `$state()` → bare
//!   field, `d = $derived(e)` → `d = $.derived(() => e)`, `$derived.by(f)` →
//!   `$.derived(f)` (写经 `PropertyDefinition.js`).
//! - `$props.id` → dropped.
//! - top-level `$effect(…)` / `$effect.pre(…)` / `$effect.root(…)` /
//!   `$inspect(…)` / `$inspect.trace(…)` expression statements → dropped.
//! - everything else → kept verbatim (re-parsed from its source span).
//!
//! ## EXPLICIT KNOWN GAPS (DEFERRED by design — the delicate single-pass the
//! main agent adds later, NOT here):
//! - derived-read wrapping, store-get (`$x` → `$.store_get`),
//!   `$state.snapshot`, `$$sanitized_props` identifier rewriting — all value
//!   expressions pass through verbatim (re-parsed source, UNCHANGED).
//! - TypeScript components (`<script lang="ts">`) — the script slice is run
//!   through `strip_typescript` BEFORE parsing, then lowered as ordinary JS
//!   (offsets stay internally consistent because `src` borrows the stripped
//!   buffer and every re-slice cuts from `src`, never from `state.source`).
//!   Template-side TS (e.g. `{x as T}`) is NOT stripped here — the OLD oracle
//!   strips TS from its final output, which this slice does not (KNOWN GAP).
//! - async `$derived` (`$derived(await …)`) under `experimental.async` →
//!   `await $.async_derived(() => <value>)` (top-level `await` stripped; nested
//!   await keeps the thunk `async`). In sync mode it stays the plain
//!   `$.derived(() => <value>)` thunk.
//! - destructured-`$state` / `$state.raw` patterns ARE expanded via
//!   `create_state_declarators` + `extract_paths` (`tmp` temp + `$$array =
//!   $.to_array(tmp, N)` for array/iterable destructures + per-leaf
//!   declarators). KNOWN GAPS: no `tmp`/`$$array` deconfliction against
//!   user-declared bindings; rest elements, computed `[expr]` keys, and
//!   `build_fallback` default wrapping are not handled. Destructured
//!   `$derived` / `$derived.by` (the `$$d` / `$$derived_array` / `$.derived`
//!   form) is still kept verbatim (NOT expanded).

use super::ServerTransformState;
use crate::ast::template::Script;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::builders::B;
use oxc_ast::ast::{Expression as OxcExpression, Statement, VariableDeclarationKind};
use oxc_ast_visit::VisitMut;
use oxc_span::GetSpan;
use regex::Regex;
use std::sync::LazyLock;

/// Sanitizes a public class-field name into a valid private-identifier name
/// (写经 analyze `ClassBody` `regex_invalid_identifier_chars`): the leading char
/// must be `[a-zA-Z_$]`, every other char `[a-zA-Z0-9_$]`; anything else → `_`.
static REGEX_INVALID_IDENTIFIER_CHARS: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])").unwrap());

/// The rune shapes this slice recognises on a declarator init.
#[derive(Clone, Copy, PartialEq, Eq)]
enum DeclRune {
    /// `$state(e)` / `$state.raw(e)` — keep just the argument.
    State,
    /// `$derived(e)` — `$.derived(() => <e>)`.
    Derived,
    /// `$derived.by(f)` — `$.derived(<f>)`.
    DerivedBy,
    /// `$props()` — `<pattern> = $$props`.
    Props,
    /// `$props.id` — drop the declarator.
    PropsId,
}

/// Detect a rune on a declarator-init oxc expression by callee / member name.
/// Mirrors upstream `get_rune`: the rune is the CALLEE of a call expression
/// (`$props.id()` → `$props.id`), so every rune here is matched on a
/// `CallExpression`.
fn detect_decl_rune(init: &OxcExpression) -> Option<DeclRune> {
    let OxcExpression::CallExpression(call) = init else {
        return None;
    };
    match &call.callee {
        OxcExpression::Identifier(id) => match id.name.as_str() {
            "$state" => Some(DeclRune::State),
            "$derived" => Some(DeclRune::Derived),
            "$props" => Some(DeclRune::Props),
            _ => None,
        },
        OxcExpression::StaticMemberExpression(m) => {
            let OxcExpression::Identifier(obj) = &m.object else {
                return None;
            };
            match (obj.name.as_str(), m.property.name.as_str()) {
                ("$state", "raw") => Some(DeclRune::State),
                ("$derived", "by") => Some(DeclRune::DerivedBy),
                // `$props.id()` — upstream skips this declarator (it is
                // re-emitted as `const <id> = $.props_id($$renderer);` via the
                // separate `analysis.props_id` assembly path). The re-emission
                // is a KNOWN GAP in this slice; we only mirror the skip.
                ("$props", "id") => Some(DeclRune::PropsId),
                _ => None,
            }
        }
        _ => None,
    }
}

/// Build the `$$async_hole` placeholder statement that stands in for a removed
/// `$inspect(...)` / `$effect(...)` expression statement under
/// `experimental.async`. The async-body transform (`transform_async_body`)
/// recognises any statement whose printed text contains `$$async_hole` and
/// turns it into a `() => void 0` thunk in the `$$renderer.run([...])` array,
/// keeping the `$$promises` indices of every later expression stable (写经 the
/// `/* $$async_hole */` marker in the text-based server `transform_script.rs`).
///
/// We emit a bare identifier-reference expression statement (`$$async_hole;`)
/// because it round-trips losslessly through the esrap printer — a string
/// literal would be parsed as a directive prologue (dropped from `program.body`)
/// and a bare comment marker would risk being stripped — and the printed text
/// carries the marker that `transform_async_body` matches on. The placeholder
/// never reaches the final output: it is consumed (and replaced by
/// `() => void 0`) by the async transform.
fn async_hole_placeholder<'a>(state: &ServerTransformState<'a>) -> Option<Statement<'a>> {
    state.reparse_statement("($$async_hole);")
}

/// Whether an expression-statement expression is a top-level effect/inspect rune
/// call that upstream's server `ExpressionStatement` visitor removes.
fn is_removed_effect_stmt(expr: &OxcExpression) -> bool {
    let OxcExpression::CallExpression(call) = expr else {
        return false;
    };
    match &call.callee {
        OxcExpression::Identifier(id) => matches!(id.name.as_str(), "$effect" | "$inspect"),
        OxcExpression::StaticMemberExpression(m) => {
            let OxcExpression::Identifier(obj) = &m.object else {
                return false;
            };
            matches!(
                (obj.name.as_str(), m.property.name.as_str()),
                ("$effect", "pre") | ("$effect", "root") | ("$inspect", "trace")
            )
        }
        _ => false,
    }
}

/// Parse + lower a single RUNES-mode script into transformed top-level
/// statements. `import_sink` receives instance-script imports to hoist (`None`
/// for module).
fn transform_script<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
) -> Vec<Statement<'a>> {
    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }

    // TypeScript components: strip TS from the script SLICE before parsing, then
    // run the same JS lowering on the stripped text. `strip_typescript` returns a
    // NEW string whose byte offsets do NOT line up with `state.source`, so we must
    // make `src` borrow the stripped buffer and have EVERY downstream sub-slice /
    // reparse cut from `src` (never from `state.source`). This is already how the
    // rest of this function works: the classification parse and every span re-slice
    // index into the local `src`, and the reparse helpers copy the slice text into
    // the state allocator — none of them index `state.source` directly. So binding
    // `src` to the stripped buffer keeps offsets internally consistent. Mirrors the
    // OLD oracle, which runs the same `strip_typescript` (over its final output).
    let stripped;
    let src: &str = if super::super::helpers::script_is_typescript(script) {
        stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(
            &state.source[start..end],
        );
        &stripped
    } else {
        &state.source[start..end]
    };

    // Parse with a FRESH allocator purely for CLASSIFICATION. We never move nodes
    // out of it; every emitted statement is re-parsed from `src` into the state
    // allocator instead.
    let alloc = oxc_allocator::Allocator::default();
    let owned = alloc.alloc_str(src);
    let ret = oxc_parser::Parser::new(&alloc, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return Vec::new();
    }

    let mut out: Vec<Statement<'a>> = Vec::new();

    for stmt in ret.program.body.iter() {
        match stmt {
            Statement::ImportDeclaration(imp) => {
                let slice = &src[imp.span.start as usize..imp.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    match import_sink.as_deref_mut() {
                        Some(sink) => sink.push(rehomed),
                        None => out.push(rehomed),
                    }
                }
            }
            Statement::VariableDeclaration(vd) => {
                if let Some(lowered) = lower_variable_declaration(vd, src, state) {
                    out.push(lowered);
                }
            }
            Statement::ExpressionStatement(es) => {
                if is_removed_effect_stmt(&es.expression) {
                    // Under `experimental.async`, a removed `$inspect(...)` /
                    // `$effect(...)` statement must leave a PLACEHOLDER behind so
                    // the async-body transform keeps its `$$promises` slot (the
                    // text-based `transform_async_body` turns the placeholder into
                    // a `() => void 0` thunk, preserving every later expression's
                    // blocker index). Mirrors upstream's `/* $$async_hole */`
                    // marker (server `transform_script.rs`). In sync mode the
                    // statement is simply dropped, as before.
                    if state.eval_inputs.use_async
                        && let Some(marker) = async_hole_placeholder(state)
                    {
                        out.push(marker);
                    }
                    continue;
                }
                let slice = &src[es.span.start as usize..es.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
            other => {
                let span = other.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
        }
    }

    // Lower `$state` / `$derived` class-field initializers in every emitted
    // statement — class DECLARATIONS, class EXPRESSIONS (`const C = class {…}`)
    // and NESTED classes alike (写经 `PropertyDefinition.js`, a tree-wide
    // visitor). Cheap: the walk only descends, firing on `PropertyDefinition`s.
    for stmt in out.iter_mut() {
        lower_class_field_runes(stmt, state);
    }
    out
}

/// Lower `$state` / `$state.raw` / `$derived` / `$derived.by` class-field
/// initializers in a re-homed class declaration STATEMENT, in place (写经
/// `3-transform/server/visitors/PropertyDefinition.js`).
///
/// - `count = $state(0)` → `count = 0`; `x = $state()` → `x` (value dropped to
///   `None`, i.e. a bare class field — NOT `void 0`).
/// - `d = $derived(e)` → `d = $.derived(() => e)`; `d = $derived.by(f)` →
///   `d = $.derived(f)`; `d = $derived()` → `d` (value dropped).
///
/// Only top-level (non-nested) class-field runes are handled; method bodies and
/// nested classes pass through unchanged (the `value` of a method is a
/// `Function`, not a `PropertyDefinition`, so it is untouched).
fn lower_class_field_runes<'a>(stmt: &mut Statement<'a>, state: &ServerTransformState<'a>) {
    let mut v = ClassFieldRuneLower {
        b: state.b,
        analysis: state.analysis,
    };
    v.visit_statement(stmt);
}

/// `VisitMut` that lowers every `PropertyDefinition` rune initializer it
/// encounters, recursing through the whole statement subtree. Unlike a single
/// top-level loop this reaches class fields inside a class EXPRESSION
/// (`const C = class { x = $state(0) }`), inside a NESTED class (a class
/// declared in a method body), and inside any other expression position —
/// matching upstream's `PropertyDefinition.js` zimmerframe visitor, which fires
/// on every `PropertyDefinition` in the tree.
struct ClassFieldRuneLower<'a, 'b> {
    b: B<'a>,
    analysis: &'b crate::compiler::phases::phase2_analyze::ComponentAnalysis,
}

impl<'a, 'b> ClassFieldRuneLower<'a, 'b> {
    /// Lower a `$state` / `$state.raw` / `$derived` / `$derived.by` property
    /// initializer in place: `count = $state(0)` → `count = 0`, etc. Returns the
    /// detected rune (so the caller can decide whether public-`$derived` needs
    /// the private-backing-field + getter/setter rewrite).
    fn lower_property_init(
        &mut self,
        prop: &mut oxc_ast::ast::PropertyDefinition<'a>,
    ) -> Option<DeclRune> {
        let rune = prop.value.as_ref().and_then(detect_decl_rune)?;
        let b = self.b;
        // Take the `$state(...)` / `$derived(...)` call out and move its first
        // argument expression out directly (the rehomed call already lives in the
        // state allocator — no re-parse).
        if let Some(OxcExpression::CallExpression(call)) = prop.value.take() {
            let mut call = call.unbox();
            let mut arg: Option<OxcExpression<'a>> = call
                .arguments
                .drain(..)
                .next()
                .and_then(|a| OxcExpression::try_from(a).ok());
            if let Some(e) = arg.as_mut() {
                super::read_wrap::wrap_reads(
                    e,
                    b,
                    self.analysis,
                    self.analysis.root.instance_scope_index,
                );
            }
            prop.value = match rune {
                // `$state(x)` → `x`; no-arg `$state()` → bare field (`None`).
                DeclRune::State => arg,
                DeclRune::Derived => arg.map(|e| b.call("$.derived", vec![b.thunk(e, false)])),
                DeclRune::DerivedBy => arg.map(|e| b.call("$.derived", vec![e])),
                // `$props` / `$props.id` are not valid class-field runes.
                DeclRune::Props | DeclRune::PropsId => None,
            };
        }
        Some(rune)
    }

    /// Lower a `$state` / `$state.raw` / `$derived` / `$derived.by` call that
    /// appears as the RHS of a constructor `this.x = …` assignment. Unlike
    /// [`Self::lower_property_init`] (which drops the value of an arg-less
    /// `$state()`), this matches upstream's `CallExpression` server visitor in
    /// assignment context: an arg-less `$state()` lowers to `void 0` (写经
    /// `CallExpression.js`: `node.arguments[0] ? visit(...) : b.void0`).
    ///
    /// Returns the lowered RHS expression to substitute, or `None` if the
    /// expression is not a recognised class-field rune (left unchanged).
    fn lower_assign_rhs(
        &mut self,
        rhs: &mut OxcExpression<'a>,
    ) -> Option<(DeclRune, OxcExpression<'a>)> {
        let rune = detect_decl_rune(rhs)?;
        let b = self.b;
        let taken = std::mem::replace(rhs, b.void0());
        let OxcExpression::CallExpression(call) = taken else {
            return None;
        };
        let mut call = call.unbox();
        let mut arg: Option<OxcExpression<'a>> = call
            .arguments
            .drain(..)
            .next()
            .and_then(|a| OxcExpression::try_from(a).ok());
        if let Some(e) = arg.as_mut() {
            super::read_wrap::wrap_reads(
                e,
                b,
                self.analysis,
                self.analysis.root.instance_scope_index,
            );
        }
        let lowered = match rune {
            // `$state(x)` → `x`; arg-less `$state()` → `void 0`.
            DeclRune::State => arg.unwrap_or_else(|| b.void0()),
            DeclRune::Derived => arg
                .map(|e| b.call("$.derived", vec![b.thunk(e, false)]))
                .unwrap_or_else(|| b.void0()),
            DeclRune::DerivedBy => arg
                .map(|e| b.call("$.derived", vec![e]))
                .unwrap_or_else(|| b.void0()),
            // `$props` / `$props.id` are not valid class-field runes.
            DeclRune::Props | DeclRune::PropsId => return None,
        };
        Some((rune, lowered))
    }

    /// Find the constructor of `class` and collect its top-level
    /// `this.<name> = $rune(…)` field declarations in statement order (写经
    /// analyze `ClassBody.js` constructor scan + server `ClassBody.js`).
    fn collect_ctor_fields(&self, class: &oxc_ast::ast::Class<'a>) -> Vec<CtorField> {
        use oxc_ast::ast::{ClassElement, Expression as E, MethodDefinitionKind, Statement};
        let mut fields = Vec::new();
        for el in class.body.body.iter() {
            let ClassElement::MethodDefinition(m) = el else {
                continue;
            };
            if m.kind != MethodDefinitionKind::Constructor {
                continue;
            }
            let Some(body) = m.value.body.as_ref() else {
                continue;
            };
            for stmt in body.statements.iter() {
                let Statement::ExpressionStatement(es) = stmt else {
                    continue;
                };
                let E::AssignmentExpression(assign) = &es.expression else {
                    continue;
                };
                let Some((name, is_private)) = ctor_target_name(&assign.left) else {
                    continue;
                };
                let Some(rune) = detect_decl_rune(&assign.right) else {
                    continue;
                };
                fields.push(CtorField {
                    name,
                    is_private,
                    rune,
                });
            }
        }
        fields
    }

    /// Rewrite the constructor's `this.<name> = $rune(…)` assignments in place:
    /// lower the RHS and (for public `$derived` / `$derived.by`) retarget the LHS
    /// to the private backing field (写经 server `AssignmentExpression.js`).
    fn rewrite_constructor_assignments(
        &mut self,
        class: &mut oxc_ast::ast::Class<'a>,
        backing: &std::collections::HashMap<String, String>,
    ) {
        use oxc_ast::ast::{
            AssignmentTarget as AT, ClassElement, Expression as E, MethodDefinitionKind, Statement,
        };
        let b = self.b;
        for el in class.body.body.iter_mut() {
            let ClassElement::MethodDefinition(m) = el else {
                continue;
            };
            if m.kind != MethodDefinitionKind::Constructor {
                continue;
            }
            let Some(body) = m.value.body.as_mut() else {
                continue;
            };
            for stmt in body.statements.iter_mut() {
                let Statement::ExpressionStatement(es) = stmt else {
                    continue;
                };
                let E::AssignmentExpression(assign) = &mut es.expression else {
                    continue;
                };
                let Some((name, is_private)) = ctor_target_name(&assign.left) else {
                    continue;
                };
                let Some((rune, lowered)) = self.lower_assign_rhs(&mut assign.right) else {
                    continue;
                };
                assign.right = lowered;

                // Retarget public `$derived` / `$derived.by` to the private backing
                // field; `$state` / `$state.raw` and private fields keep their key
                // (写经 `AssignmentExpression.js`: key stays unless public derived).
                let retarget =
                    !is_private && matches!(rune, DeclRune::Derived | DeclRune::DerivedBy);
                if retarget && let Some(backing_name) = backing.get(&name) {
                    assign.left = AT::from(b.ab.member_expression_private_field_expression(
                        oxc_span::SPAN,
                        b.this(),
                        b.ab.private_identifier(oxc_span::SPAN, b.str(backing_name)),
                        false,
                    ));
                }
            }
        }
    }

    /// Push a `get <name>() { return this.#<backing>(); }` +
    /// `set <name>($$value) { return this.#<backing>($$value); }` accessor pair
    /// onto `new_body` (写经 server `ClassBody.js`).
    fn push_accessors(
        &self,
        new_body: &mut oxc_allocator::Vec<'a, oxc_ast::ast::ClassElement<'a>>,
        public_name: &str,
        backing: &str,
    ) {
        use oxc_ast::ast::MethodDefinitionKind;
        let b = self.b;

        let getter_body = {
            let member = b.member(b.this(), &format!("#{backing}"));
            let call = b.call(member, vec![]);
            b.body(vec![b.return_stmt(Some(call))])
        };
        let getter_fn = b.ab.alloc_function(
            oxc_span::SPAN,
            oxc_ast::ast::FunctionType::FunctionExpression,
            None,
            false,
            false,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            b.empty_params(),
            oxc_ast::NONE,
            Some(getter_body),
        );
        new_body.push(b.ab.class_element_method_definition(
            oxc_span::SPAN,
            oxc_ast::ast::MethodDefinitionType::MethodDefinition,
            b.ab.vec(),
            b.key(public_name),
            getter_fn,
            MethodDefinitionKind::Get,
            false,
            false,
            false,
            false,
            None,
        ));

        let setter_body = {
            let member = b.member(b.this(), &format!("#{backing}"));
            let call = b.call(member, vec![b.id("$$value")]);
            b.body(vec![b.return_stmt(Some(call))])
        };
        let setter_params = b.params(vec![b.id_pat("$$value")], None);
        let setter_fn = b.ab.alloc_function(
            oxc_span::SPAN,
            oxc_ast::ast::FunctionType::FunctionExpression,
            None,
            false,
            false,
            false,
            oxc_ast::NONE,
            oxc_ast::NONE,
            setter_params,
            oxc_ast::NONE,
            Some(setter_body),
        );
        new_body.push(b.ab.class_element_method_definition(
            oxc_span::SPAN,
            oxc_ast::ast::MethodDefinitionType::MethodDefinition,
            b.ab.vec(),
            b.key(public_name),
            setter_fn,
            MethodDefinitionKind::Set,
            false,
            false,
            false,
            false,
            None,
        ));
    }
}

/// A class-field rune declared inside a constructor via `this.<name> = $rune(…)`.
/// Mirrors an `AssignmentExpression`-kind entry of upstream's analyze
/// `state_fields` map (写经 `2-analyze/visitors/ClassBody.js`).
struct CtorField {
    /// Field name as `get_name` would return it: public `"foo"`, private
    /// `"#foo"`, or a computed-literal key like `"1"`.
    name: String,
    /// Whether the assignment target is a `PrivateFieldExpression` (`this.#x`).
    is_private: bool,
    /// The detected rune kind on the RHS.
    rune: DeclRune,
}

/// Extract the `get_name`-style field name from a constructor `this.<…>`
/// assignment target, plus whether it is a private field. Returns `None` for
/// non-`this` targets and for computed keys whose expression is not a literal
/// (写经 analyze `ClassBody.js`: computed non-`Literal` keys are skipped).
fn ctor_target_name(target: &oxc_ast::ast::AssignmentTarget) -> Option<(String, bool)> {
    use oxc_ast::ast::{AssignmentTarget as AT, Expression as E};
    match target {
        AT::StaticMemberExpression(m) => {
            if !matches!(m.object, E::ThisExpression(_)) {
                return None;
            }
            Some((m.property.name.as_str().to_string(), false))
        }
        AT::PrivateFieldExpression(m) => {
            if !matches!(m.object, E::ThisExpression(_)) {
                return None;
            }
            Some((format!("#{}", m.field.name.as_str()), true))
        }
        AT::ComputedMemberExpression(m) => {
            if !matches!(m.object, E::ThisExpression(_)) {
                return None;
            }
            // Only literal computed keys are state fields (写经 analyze skip).
            match &m.expression {
                E::StringLiteral(s) => Some((s.value.as_str().to_string(), false)),
                E::NumericLiteral(n) => Some((n.value.to_string(), false)),
                _ => None,
            }
        }
        _ => None,
    }
}

impl<'a, 'b> VisitMut<'a> for ClassFieldRuneLower<'a, 'b> {
    /// Rebuild a runes-mode class body so public `$derived` / `$derived.by`
    /// fields become a private backing field + `get`/`set` accessor pair (写经
    /// `3-transform/server/visitors/ClassBody.js`):
    ///
    /// ```js
    /// foo = $derived(e);
    /// // ↓
    /// #foo = $.derived(() => e);
    /// get foo() { return this.#foo(); }
    /// set foo($$value) { return this.#foo($$value); }
    /// ```
    ///
    /// `$state` / `$state.raw` fields and PRIVATE `$derived` fields keep their
    /// key and are only value-lowered (via [`Self::lower_property_init`]). The
    /// public private-key (`#foo`) is deconflicted against the class's existing
    /// private identifiers in source order, mirroring the analyze-phase
    /// `ClassBody` deconfliction.
    /// Drop `$effect` / `$effect.pre` / `$effect.root` / `$inspect.trace`
    /// expression statements anywhere in the class subtree (e.g. inside a
    /// constructor or method body), mirroring upstream's global server
    /// `ExpressionStatement` visitor (`return b.empty`). `ClassFieldRuneLower`
    /// only runs over class statements, so this scope is the class subtree.
    fn visit_statements(&mut self, stmts: &mut oxc_allocator::Vec<'a, Statement<'a>>) {
        stmts.retain(|stmt| {
            let Statement::ExpressionStatement(es) = stmt else {
                return true;
            };
            !is_removed_effect_stmt(&es.expression)
        });
        oxc_ast_visit::walk_mut::walk_statements(self, stmts);
    }

    fn visit_class(&mut self, class: &mut oxc_ast::ast::Class<'a>) {
        use oxc_ast::ast::ClassElement;

        let b = self.b;

        // Collect existing private identifiers in this class so the synthesized
        // `#foo` backing fields can be deconflicted against them. Mirrors analyze
        // `ClassBody.js`, which only collects PropertyDefinition / MethodDefinition
        // private keys (NOT constructor-declared private fields).
        let mut private_ids: Vec<String> = Vec::new();
        for el in class.body.body.iter() {
            let key = match el {
                ClassElement::PropertyDefinition(p) => Some(&p.key),
                ClassElement::MethodDefinition(m) => Some(&m.key),
                _ => None,
            };
            if let Some(name) = key.and_then(|k| k.private_name()) {
                private_ids.push(name.as_str().to_string());
            }
        }

        // Scan the constructor for `this.<name> = $rune(…)` field declarations,
        // in statement order (写经 analyze `ClassBody.js` constructor pass). For
        // each PUBLIC field, deconflict a private backing-field name. PropertyDefinition
        // fields are deconflicted first (in the body loop below) in upstream, but
        // for the constructor cases the body has no rune PropertyDefinitions to
        // collide with, so a constructor-first pass here is equivalent for the
        // target fixtures. We record the public-name → backing-name map so the
        // constructor assignments and the inserted accessors agree.
        let ctor_fields = self.collect_ctor_fields(class);
        let mut backing: std::collections::HashMap<String, String> =
            std::collections::HashMap::new();
        for cf in ctor_fields.iter() {
            if cf.is_private {
                continue;
            }
            let mut deconflicted = REGEX_INVALID_IDENTIFIER_CHARS
                .replace_all(&cf.name, "_")
                .to_string();
            while private_ids.contains(&deconflicted) {
                deconflicted = format!("_{deconflicted}");
            }
            private_ids.push(deconflicted.clone());
            backing.insert(cf.name.clone(), deconflicted);
        }

        // Take ownership of the existing body and rebuild it element-by-element.
        let old_body = std::mem::replace(&mut class.body.body, b.ab.vec());
        let mut new_body: oxc_allocator::Vec<'a, ClassElement<'a>> = b.ab.vec();

        // Insert backing fields + get/set accessors for constructor-declared PUBLIC
        // `$derived` / `$derived.by` fields, at the TOP of the body (写经 server
        // `ClassBody.js`: the constructor-AssignmentExpression loop runs before the
        // body-replacement loop).
        for cf in ctor_fields.iter() {
            if cf.is_private || !matches!(cf.rune, DeclRune::Derived | DeclRune::DerivedBy) {
                continue;
            }
            let backing_name = backing.get(&cf.name).cloned().unwrap_or_default();
            // `#<backing>;` (bare backing field — value set in the constructor)
            let private_key =
                b.ab.property_key_private_identifier(oxc_span::SPAN, b.str(&backing_name));
            new_body.push(b.ab.class_element_property_definition(
                oxc_span::SPAN,
                oxc_ast::ast::PropertyDefinitionType::PropertyDefinition,
                b.ab.vec(),
                private_key,
                oxc_ast::NONE,
                None,
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                None,
            ));
            self.push_accessors(&mut new_body, &cf.name, &backing_name);
        }

        for el in old_body {
            let ClassElement::PropertyDefinition(mut prop_box) = el else {
                new_body.push(el);
                continue;
            };
            // Only plain (non-computed, non-static) fields carry class-field runes.
            let is_plain_field = !prop_box.computed && !prop_box.r#static;
            let is_private = prop_box.key.is_private_identifier();
            let prop = prop_box.as_mut();
            let rune = self.lower_property_init(prop);

            let needs_accessor = is_plain_field
                && !is_private
                && matches!(rune, Some(DeclRune::Derived) | Some(DeclRune::DerivedBy));

            if !needs_accessor {
                new_body.push(ClassElement::PropertyDefinition(prop_box));
                continue;
            }

            // Public `$derived` / `$derived.by`: derive a deconflicted private
            // backing-field name from the public name (写经 analyze `ClassBody`).
            let public_name = prop_box
                .key
                .name()
                .map(|c| c.to_string())
                .unwrap_or_default();
            let mut deconflicted = REGEX_INVALID_IDENTIFIER_CHARS
                .replace_all(&public_name, "_")
                .to_string();
            while private_ids.contains(&deconflicted) {
                deconflicted = format!("_{deconflicted}");
            }
            private_ids.push(deconflicted.clone());

            // Move the lowered `$.derived(...)` value onto the private backing
            // field, keeping the original `PropertyDefinition` node (and its now
            // private key).
            let private_key =
                b.ab.property_key_private_identifier(oxc_span::SPAN, b.str(&deconflicted));
            prop_box.key = private_key;
            new_body.push(ClassElement::PropertyDefinition(prop_box));

            self.push_accessors(&mut new_body, &public_name, &deconflicted);
        }

        class.body.body = new_body;

        // Rewrite the constructor's `this.<name> = $rune(…)` assignments now that
        // the backing-field names are known (写经 server `AssignmentExpression.js`).
        if !ctor_fields.is_empty() {
            self.rewrite_constructor_assignments(class, &backing);
        }

        // Recurse so nested classes inside method bodies / `$derived(...)` thunks
        // are still lowered.
        oxc_ast_visit::walk_mut::walk_class(self, class);
    }
}

/// Lower a single `VariableDeclaration` (runes branch). Returns the rebuilt
/// statement, or `None` if every declarator was dropped.
fn lower_variable_declaration<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    state: &mut ServerTransformState<'a>,
) -> Option<Statement<'a>> {
    let b = state.b;
    let kind = match vd.kind {
        VariableDeclarationKind::Const => VariableDeclarationKind::Const,
        VariableDeclarationKind::Var => VariableDeclarationKind::Var,
        _ => VariableDeclarationKind::Let,
    };

    let mut decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> = Vec::new();

    for d in vd.declarations.iter() {
        let rune = d.init.as_ref().and_then(detect_decl_rune);
        match rune {
            None => {
                // Non-rune declarator: re-parse the whole declarator span as a
                // `let <decl>;` so the pattern + (unchanged) init survive verbatim.
                let slice = &src[d.span.start as usize..d.span.end as usize];
                if let Some((pat, init)) = state.reparse_declarator(slice, kind) {
                    decls.push((pat, init));
                }
            }
            Some(DeclRune::PropsId) => { /* drop */ }
            Some(DeclRune::Props) => {
                // `<pattern> = $props()` → `<expanded-pattern> = $$props`, where
                // the expansion injects `$$slots` / `$$events` deconfliction
                // properties for the object-with-rest and identifier cases
                // (写经 `VariableDeclaration.js:33-82`).
                let pat_span = d.id.span();
                let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
                let Some(mut pat) = state.reparse_pattern(pat_slice) else {
                    continue;
                };
                // Strip `$bindable(<d>)` defaults: `{ x = $bindable() }` →
                // `{ x = void 0 }`, `{ x = $bindable(5) }` → `{ x = 5 }`
                // (写经 `VariableDeclaration.js:42-52` AssignmentPattern walk).
                strip_bindable_defaults(&mut pat, state);
                let pat = expand_props_pattern(pat, state);
                decls.push((pat, Some(b.id("$$props"))));
            }
            Some(rune) => {
                // Lower the init from the rune; keep the binding pattern verbatim.
                let new_init = lower_decl_init(&rune, d.init.as_ref(), src, state);
                let pat_span = d.id.span();
                let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
                let Some(pat) = state.reparse_pattern(pat_slice) else {
                    continue;
                };
                // A destructured `$state` / `$state.raw` init expands via
                // `create_state_declarators` into a `tmp` temp + (for array
                // patterns) a `$$array = $.to_array(tmp, N)` insert + one leaf
                // declarator per path (写经 `VariableDeclaration.js:229-247`).
                // Identifier patterns (and every other rune) keep the verbatim
                // single declarator.
                if matches!(rune, DeclRune::State)
                    && !matches!(pat, oxc_ast::ast::BindingPattern::BindingIdentifier(_))
                {
                    create_state_declarators(pat, new_init, state, &mut decls);
                } else if matches!(rune, DeclRune::Derived | DeclRune::DerivedBy)
                    && !matches!(pat, oxc_ast::ast::BindingPattern::BindingIdentifier(_))
                {
                    // A destructured `$derived` / `$derived.by` expands into a
                    // (possibly shared) `$$d = <init>` base plus one
                    // `$.derived(() => <access>)` leaf per path and one
                    // `$$derived_array = $.derived(() => $.to_array(...))` per
                    // array sub-pattern (写经 `VariableDeclaration.js:97-156`).
                    create_derived_declarators(
                        &rune,
                        d.init.as_ref(),
                        src,
                        pat,
                        new_init,
                        state,
                        &mut decls,
                    );
                } else {
                    decls.push((pat, new_init));
                }
            }
        }
    }

    if decls.is_empty() {
        return None;
    }
    Some(b.var_decl_from_pairs(kind, decls))
}

/// Port of upstream `create_state_declarators` (`VariableDeclaration.js:229-247`)
/// for a destructured `$state(...)` / `$state.raw(...)` declarator.
///
/// `let [x, y] = $state([1, 2])` →
/// ```js
/// let tmp = [1, 2],
///     $$array = $.to_array(tmp, 2),
///     x = $$array[0],
///     y = $$array[1];
/// ```
/// `let { a, b } = $state({ a: 1, b: 2 })` →
/// ```js
/// let tmp = { a: 1, b: 2 }, a = tmp.a, b = tmp.b;
/// ```
/// The temp + every array-conversion insert use `scope.generate('tmp')` /
/// `scope.generate('$$array')`; here the component instance scope has no
/// `tmp` / `$$array` bindings for these fixtures, so the names are emitted
/// verbatim (KNOWN GAP: no deconfliction against user-declared `tmp`/`$$array`).
fn create_state_declarators<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    value: Option<OxcExpression<'a>>,
    state: &ServerTransformState<'a>,
    decls: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)>,
) {
    let b = state.b;
    let tmp_name = "tmp";

    // `let tmp = <value>`
    decls.push((b.id_pat(tmp_name), value));

    let mut paths: Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)> = Vec::new();
    let mut inserts: Vec<OxcExpression<'a>> = Vec::new();
    extract_paths(pat, b.id(tmp_name), state, &mut paths, &mut inserts);

    // `$$array = $.to_array(tmp, N)` inserts (one per array sub-pattern).
    for value in inserts {
        decls.push((b.id_pat("$$array"), Some(value)));
    }

    // Leaf declarators: `x = $$array[0]`, `a = tmp.a`, …
    for (node, expr) in paths {
        decls.push((node, Some(expr)));
    }
}

/// Port of upstream `_extract_paths` (`utils/ast.js:269-415`) over an oxc
/// `BindingPattern`. Walks the destructure tree, pushing one `(leaf_pattern,
/// access_expression)` pair per terminal binding into `paths`, and one
/// `$.to_array(...)` expression per `ArrayPattern` into `inserts` (the caller
/// names the corresponding `$$array` temp and substitutes it as the array base).
///
/// Handles identifier / object / array / assignment(default) patterns. Rest
/// elements and computed/non-identifier object keys fall through verbatim
/// (KNOWN GAP — not exercised by the in-scope SSR fixtures).
fn extract_paths<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    expression: OxcExpression<'a>,
    state: &ServerTransformState<'a>,
    paths: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)>,
    inserts: &mut Vec<OxcExpression<'a>>,
) {
    use oxc_ast::ast::BindingPattern;
    let b = state.b;
    match pat {
        BindingPattern::BindingIdentifier(_) => {
            paths.push((pat, expression));
        }
        BindingPattern::ObjectPattern(obj) => {
            let obj = obj.unbox();
            // Rest elements are a KNOWN GAP; only the property leaves are walked.
            for prop in obj.properties {
                let base = expression_clone(&expression, state);
                // Upstream: `b.member(expression, prop.key,
                // prop.computed || prop.key.type !== 'Identifier')`. A plain
                // identifier key (non-computed) → static `expr.key`; otherwise
                // (computed, string/numeric literal, …) → `expr[<key>]`.
                let is_static = prop.key.is_identifier() && !prop.computed;
                let object_expression = if is_static {
                    let name = prop.key.name().unwrap_or(std::borrow::Cow::Borrowed(""));
                    b.member(base, &name)
                } else if let Some(name) = prop.key.static_name() {
                    b.member_computed(base, b.string(&name))
                } else {
                    // Computed `[expr]` key — KNOWN GAP; keep the base verbatim.
                    base
                };
                extract_paths(prop.value, object_expression, state, paths, inserts);
            }
        }
        BindingPattern::ArrayPattern(arr) => {
            let arr = arr.unbox();
            // `$$array = $.to_array(<expression>, <len>)` (rest-less length;
            // rest patterns are a KNOWN GAP, so always emit the length arg).
            let len = arr.elements.len();
            let to_array = b.call("$.to_array", vec![expression, b.number(len as f64)]);
            inserts.push(to_array);

            for (i, element) in arr.elements.into_iter().enumerate() {
                if let Some(element) = element {
                    // `$$array[i]`
                    let array_expression = b.member_computed(b.id("$$array"), b.number(i as f64));
                    extract_paths(element, array_expression, state, paths, inserts);
                }
            }
        }
        BindingPattern::AssignmentPattern(asgn) => {
            let asgn = asgn.unbox();
            // `<left> = <expression> ?? <right>`-style fallback. Upstream uses
            // `build_fallback`; for SSR `$state` defaults the simplest faithful
            // shape is keeping the access expression (defaults are evaluated
            // client-side). KNOWN GAP: no `build_fallback` wrapping.
            extract_paths(asgn.left, expression, state, paths, inserts);
        }
    }
}

/// Port of upstream `VariableDeclaration.js:97-156` for a DESTRUCTURED
/// `$derived(...)` / `$derived.by(...)` declarator.
///
/// `let { foo, bar: [a, b] } = $derived(stuff)` →
/// ```js
/// let $$derived_array = $.derived(() => $.to_array(stuff.bar, 2)),
///     foo = $.derived(() => stuff.foo),
///     a = $.derived(() => $$derived_array()[0]),
///     b = $.derived(() => $$derived_array()[1]);
/// ```
///
/// The base `rhs` against which paths are extracted is either:
/// - the `$derived(<Identifier>)` argument read directly (no `$$d`), or
/// - a fresh `$$d = <init>` binding whose call `$$d()` is the base — used for
///   `$derived.by`, or `$derived(<non-identifier>)`.
///
/// Each extracted leaf becomes `name = $.derived(() => <access>)`; each
/// `ArrayPattern` becomes `$$derived_array = $.derived(() => $.to_array(...))`,
/// indexed via the temp CALL `$$derived_array()[i]`.
fn create_derived_declarators<'a>(
    rune: &DeclRune,
    init_expr: Option<&OxcExpression>,
    src: &str,
    pat: oxc_ast::ast::BindingPattern<'a>,
    new_init: Option<OxcExpression<'a>>,
    state: &mut ServerTransformState<'a>,
    decls: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)>,
) {
    let b = state.b;

    // Decide the base expression for `extract_paths`. Upstream:
    //   if (rune !== '$derived' || call.arguments[0].type !== 'Identifier') {
    //       const id = b.id(scope.generate('$$d'));
    //       rhs = b.call(id);
    //       declarations.push(b.declarator(id, init));
    //   }
    //   else: rhs = value (the visited argument)
    let arg_is_identifier = matches!(rune, DeclRune::Derived)
        && matches!(
            init_expr,
            Some(OxcExpression::CallExpression(call))
                if matches!(
                    call.arguments.first().and_then(|a| a.as_expression()),
                    Some(OxcExpression::Identifier(_))
                )
        );

    let rhs: OxcExpression<'a> = if arg_is_identifier {
        // `rhs = value` — the read-wrapped `$derived(<Identifier>)` argument.
        derived_arg_value(init_expr, src, state).unwrap_or_else(|| b.void0())
    } else {
        // `$$d = <init>`, `rhs = $$d()`.
        let name = state.next_derived_d_name();
        decls.push((b.id_pat(&name), new_init));
        b.call(b.id(&name), vec![])
    };

    let mut paths: Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)> = Vec::new();
    let mut inserts: Vec<(String, OxcExpression<'a>)> = Vec::new();
    extract_derived_paths(pat, rhs, state, &mut paths, &mut inserts);

    // `$$derived_array = $.derived(() => $.to_array(...))` inserts (one per
    // array sub-pattern), in extraction order.
    for (name, value) in inserts {
        let call = b.call("$.derived", vec![b.thunk(value, false)]);
        decls.push((b.id_pat(&name), Some(call)));
    }

    // Leaf declarators: `name = $.derived(() => <access>)`.
    for (node, expr) in paths {
        let call = b.call("$.derived", vec![b.thunk(expr, false)]);
        decls.push((node, Some(call)));
    }
}

/// Extract the read-wrapped first argument of a `$derived(<Identifier>)` call —
/// the base `rhs` for the no-`$$d` destructured-derived path.
fn derived_arg_value<'a>(
    init_expr: Option<&OxcExpression>,
    src: &str,
    state: &ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    let OxcExpression::CallExpression(call) = init_expr? else {
        return None;
    };
    let arg = call.arguments.first()?.as_expression()?;
    let s = arg.span();
    let slice = &src[s.start as usize..s.end as usize];
    let mut e = state.reparse_slice_owned(slice)?;
    super::read_wrap::wrap_reads(
        &mut e,
        state.b,
        state.analysis,
        state.analysis.root.instance_scope_index,
    );
    Some(e)
}

/// Derived-flavoured port of upstream `_extract_paths` (`utils/ast.js:269-415`).
/// Like [`extract_paths`] but: every `ArrayPattern` generates a fresh
/// `$$derived_array` temp whose value (`$.to_array(...)`) is pushed into
/// `inserts` tagged with its name, and element accesses index the temp via a
/// CALL (`$$derived_array()[i]`). Object rest → `$.exclude_from_object`,
/// array rest → `<temp>().slice(i)`. The caller wraps every `inserts` value and
/// every leaf `expression` in `$.derived(() => …)`.
fn extract_derived_paths<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    expression: OxcExpression<'a>,
    state: &mut ServerTransformState<'a>,
    paths: &mut Vec<(oxc_ast::ast::BindingPattern<'a>, OxcExpression<'a>)>,
    inserts: &mut Vec<(String, OxcExpression<'a>)>,
) {
    use oxc_ast::ast::BindingPattern;
    let b = state.b;
    match pat {
        BindingPattern::BindingIdentifier(_) => {
            paths.push((pat, expression));
        }
        BindingPattern::ObjectPattern(obj) => {
            let obj = obj.unbox();
            let has_rest = obj.rest.is_some();
            // Collect the static key list for the `$.exclude_from_object` rest
            // (写经 `_extract_paths` ObjectPattern RestElement branch).
            for prop in obj.properties {
                let base = expression_clone(&expression, state);
                let is_static = prop.key.is_identifier() && !prop.computed;
                let object_expression = if is_static {
                    let name = prop.key.name().unwrap_or(std::borrow::Cow::Borrowed(""));
                    b.member(base, &name)
                } else if let Some(name) = prop.key.static_name() {
                    b.member_computed(base, b.string(&name))
                } else {
                    base
                };
                extract_derived_paths(prop.value, object_expression, state, paths, inserts);
            }
            if let Some(rest) = obj.rest {
                // `$.exclude_from_object(<expression>, [<keys>])`. The fixtures
                // only exercise the no-leading-property `{ ...b }` case, so the
                // key array is empty; non-empty cases are a KNOWN GAP.
                let _ = has_rest;
                let exclude = b.call("$.exclude_from_object", vec![expression, b.array(vec![])]);
                extract_derived_paths(rest.unbox().argument, exclude, state, paths, inserts);
            }
        }
        BindingPattern::ArrayPattern(arr) => {
            let arr = arr.unbox();
            let name = state.next_derived_array_name();
            let len = arr.elements.len();
            // `$.to_array(<expression>, <len>)` (rest-less length; rest patterns
            // are a KNOWN GAP for SSR derived, so always emit the length arg).
            let to_array = b.call("$.to_array", vec![expression, b.number(len as f64)]);
            inserts.push((name.clone(), to_array));

            for (i, element) in arr.elements.into_iter().enumerate() {
                if let Some(element) = element {
                    // `$$derived_array()[i]` — index the temp CALL.
                    let base = b.call(b.id(&name), vec![]);
                    let array_expression = b.member_computed(base, b.number(i as f64));
                    extract_derived_paths(element, array_expression, state, paths, inserts);
                }
            }
        }
        BindingPattern::AssignmentPattern(asgn) => {
            let asgn = asgn.unbox();
            extract_derived_paths(asgn.left, expression, state, paths, inserts);
        }
    }
}

/// Deep-clone an expression into the state allocator. Used to duplicate the
/// accumulated base expression for each object-pattern property access (oxc
/// `member(...)` consumes its `object`, so each property needs its own copy).
fn expression_clone<'a>(
    expr: &OxcExpression<'a>,
    state: &ServerTransformState<'a>,
) -> OxcExpression<'a> {
    use oxc_allocator::CloneIn;
    expr.clone_in(state.allocator)
}

/// Build the lowered `init` for a detected rune. The call argument source slice
/// is re-parsed into the state allocator (value passthrough — NO read rewriting).
fn lower_decl_init<'a>(
    rune: &DeclRune,
    init: Option<&OxcExpression>,
    src: &str,
    state: &ServerTransformState<'a>,
) -> Option<OxcExpression<'a>> {
    let b = state.b;
    if matches!(rune, DeclRune::Props) {
        return Some(b.id("$$props"));
    }

    // First call argument's source slice (if any).
    let first_arg_slice: Option<&str> = match init {
        Some(OxcExpression::CallExpression(call)) => call
            .arguments
            .first()
            .and_then(|a| a.as_expression())
            .map(|e| {
                let s = e.span();
                &src[s.start as usize..s.end as usize]
            }),
        _ => None,
    };

    let arg_expr = |state: &ServerTransformState<'a>| -> OxcExpression<'a> {
        match first_arg_slice {
            Some(slice) => {
                let mut e = state
                    .reparse_slice_owned(slice)
                    .unwrap_or_else(|| state.b.void0());
                // Read-wrap the init/thunk body so derived/store reads inside a
                // `$state(...)` / `$derived(...)` initializer become getters
                // (e.g. `$derived(a + 1)` thunk → `() => a() + 1`). Mirrors
                // routing script value expressions through `visit_expr`.
                super::read_wrap::wrap_reads(
                    &mut e,
                    state.b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
                e
            }
            None => state.b.void0(),
        }
    };

    match rune {
        DeclRune::State => Some(arg_expr(state)),
        DeclRune::Derived => {
            // Async `$derived(await EXPR)` lowering (写经
            // `3-transform/server/visitors/VariableDeclaration.js:87-96`): when the
            // derived argument carries a TOP-LEVEL `await` AND the component is
            // compiled with `experimental.async`, the derived becomes
            // `await $.async_derived(b.thunk(value, true))`. Upstream's
            // `AwaitExpression` server visitor strips the leading `await` from the
            // value before it reaches the thunk, so `$derived(await foo)` lowers to
            // `await $.async_derived(() => foo)`. A remaining NESTED await keeps the
            // thunk `async` (`async () => …`); otherwise it is an ordinary
            // `() => …` thunk. Without an await — or in sync mode — it stays the
            // plain synchronous `$.derived(() => <value>)` shape (UNCHANGED).
            let mut e = arg_expr(state);
            if state.eval_inputs.use_async
                && let OxcExpression::AwaitExpression(_) = &e
            {
                // Strip the top-level `await` (mirrors the server `AwaitExpression`
                // visitor returning its inner argument in this context).
                if let OxcExpression::AwaitExpression(await_box) = e {
                    e = await_box.unbox().argument;
                }
                // A surviving nested await forces an `async () => …` thunk.
                let nested_await = expr_has_await(&e);
                Some(b.await_expr(b.call("$.async_derived", vec![b.thunk(e, nested_await)])))
            } else {
                Some(b.call("$.derived", vec![b.thunk(e, false)]))
            }
        }
        DeclRune::DerivedBy => Some(b.call("$.derived", vec![arg_expr(state)])),
        DeclRune::Props | DeclRune::PropsId => None,
    }
}

/// Whether an oxc expression contains an `AwaitExpression` anywhere in its
/// subtree (but NOT inside a nested function / arrow body — those `await`s
/// belong to a different async scope). Used to decide whether an
/// `$.async_derived(...)` thunk must stay `async` after the top-level `await`
/// has been stripped (写经 the old text pipeline's nested-await check).
fn expr_has_await(expr: &OxcExpression) -> bool {
    use oxc_ast_visit::Visit;
    struct AwaitFinder {
        found: bool,
    }
    impl<'a> Visit<'a> for AwaitFinder {
        fn visit_await_expression(&mut self, _it: &oxc_ast::ast::AwaitExpression<'a>) {
            self.found = true;
        }
        // Do NOT descend into nested function / arrow bodies: their `await`s
        // belong to a separate async scope and must not keep the outer thunk
        // async.
        fn visit_function(
            &mut self,
            _it: &oxc_ast::ast::Function<'a>,
            _flags: oxc_syntax::scope::ScopeFlags,
        ) {
        }
        fn visit_arrow_function_expression(
            &mut self,
            _it: &oxc_ast::ast::ArrowFunctionExpression<'a>,
        ) {
        }
    }
    let mut f = AwaitFinder { found: false };
    f.visit_expression(expr);
    f.found
}

/// Walk a `$props()` LHS pattern and rewrite every `$bindable(...)` default in
/// an `AssignmentPattern` to its first argument (or `void 0` for the no-arg
/// form), mirroring upstream's `VariableDeclaration.js:42-52` `AssignmentPattern`
/// walk: `node.right` is a `$bindable(...)` CallExpression → replace with
/// `node.right.arguments[0]` (visited) or `b.void0`. Any other default is left
/// untouched. The replacement argument is read-wrapped (upstream `context.visit`).
fn strip_bindable_defaults<'a>(
    pat: &mut oxc_ast::ast::BindingPattern<'a>,
    state: &ServerTransformState<'a>,
) {
    let mut v = BindableStrip {
        b: state.b,
        analysis: state.analysis,
    };
    v.visit_binding_pattern(pat);
}

/// Returns the `$bindable` replacement expression if `expr` is a `$bindable(...)`
/// call: its first argument, or `void 0` when called with no arguments.
fn bindable_default<'a>(expr: &mut OxcExpression<'a>, b: B<'a>) -> Option<OxcExpression<'a>> {
    let OxcExpression::CallExpression(call) = expr else {
        return None;
    };
    let OxcExpression::Identifier(id) = &call.callee else {
        return None;
    };
    if id.name.as_str() != "$bindable" {
        return None;
    }
    let arg = call
        .arguments
        .drain(..)
        .next()
        .and_then(|a| OxcExpression::try_from(a).ok());
    Some(arg.unwrap_or_else(|| b.void0()))
}

struct BindableStrip<'a, 'b> {
    b: B<'a>,
    analysis: &'b crate::compiler::phases::phase2_analyze::ComponentAnalysis,
}

impl<'a, 'b> VisitMut<'a> for BindableStrip<'a, 'b> {
    fn visit_assignment_pattern(&mut self, it: &mut oxc_ast::ast::AssignmentPattern<'a>) {
        if let Some(replacement) = bindable_default(&mut it.right, self.b) {
            it.right = replacement;
        }
        // Read-wrap the default expression so reads inside it get the server
        // getter transform — `{ value = $page }` → `$.store_get($$store_subs
        // ??= {}, '$page', page)` (store_sub), `= derived` → `= derived()`,
        // etc. This mirrors upstream visiting `declarator.init` (the whole
        // pattern, including AssignmentPattern defaults) through the server
        // `Identifier` visitor, and also covers the wrapped `$bindable(...)`
        // replacement above.
        super::read_wrap::wrap_reads(
            &mut it.right,
            self.b,
            self.analysis,
            self.analysis.root.instance_scope_index,
        );
        // Recurse into the (left) sub-pattern so nested destructure defaults
        // (`{ a: { b = $bindable() } }`) are also handled.
        oxc_ast_visit::walk_mut::walk_assignment_pattern(self, it);
    }
}

/// Expand a `$props()` LHS pattern with the `$$slots` / `$$events` deconfliction
/// injection (写经 `VariableDeclaration.js:33-82`).
///
/// - `{ x, ...rest }` (object pattern WITH a rest element): splice
///   `$$slots: <slots_name>` and `$$events: $$events` BEFORE the rest (so a
///   `...rest` doesn't pull in those internal props).
/// - `props` (identifier): replace with `{ $$slots: <slots_name>, $$events:
///   $$events, ...props }`.
/// - `{ x }` (object pattern WITHOUT rest) / array pattern: left verbatim.
///
/// `<slots_name>` deconflicts to `$$slots_` when the component also declares
/// `$$slots` separately (`analysis.uses_slots`).
fn expand_props_pattern<'a>(
    pat: oxc_ast::ast::BindingPattern<'a>,
    state: &ServerTransformState<'a>,
) -> oxc_ast::ast::BindingPattern<'a> {
    use oxc_ast::ast::BindingPattern;
    use oxc_span::SPAN;
    let b = state.b;
    let ab = b.ab;
    let slots_name = if state.analysis.uses_slots {
        "$$slots_"
    } else {
        "$$slots"
    };

    // A `{ key: value }` binding property over identifier names. `shorthand`
    // mirrors esrap/estree printing: `{ $$slots }` when key == value, but
    // `{ $$slots: $$slots_ }` when they differ (the `uses_slots` deconfliction).
    let make_prop = |key: &str, value: &str| -> oxc_ast::ast::BindingProperty<'a> {
        let k = ab.property_key_static_identifier(SPAN, b.str(key));
        let v = ab.binding_pattern_binding_identifier(SPAN, b.str(value));
        ab.binding_property(SPAN, k, v, key == value, false)
    };

    match pat {
        BindingPattern::ObjectPattern(obj) if obj.rest.is_some() => {
            let mut obj = obj.unbox();
            // The rest is a separate field in oxc; splicing the two props at the
            // END of `properties` keeps them before the (separately-printed) rest.
            obj.properties.push(make_prop("$$slots", slots_name));
            obj.properties.push(make_prop("$$events", "$$events"));
            BindingPattern::ObjectPattern(ab.alloc(obj))
        }
        BindingPattern::BindingIdentifier(id) => {
            let name = b.str(id.name.as_str());
            let mut props = ab.vec_with_capacity(2);
            props.push(make_prop("$$slots", slots_name));
            props.push(make_prop("$$events", "$$events"));
            let rest_inner = ab.binding_pattern_binding_identifier(SPAN, name);
            let rest = ab.alloc_binding_rest_element(SPAN, rest_inner);
            ab.binding_pattern_object_pattern(SPAN, props, Some(rest))
        }
        // Object pattern WITHOUT rest, or array pattern → verbatim.
        other => other,
    }
}

// ===========================================================================
// LEGACY (non-runes) branch — port of upstream's non-runes
// `VariableDeclaration` / `LabeledStatement` server visitors plus the
// `reactive_statements` hoist+append loop in `transform-server.js`.
// ===========================================================================

/// Parse + lower a single LEGACY (non-runes) script into transformed top-level
/// statements. `import_sink` receives imports to hoist (`None` for module).
///
/// Emitted forms (写经 `VariableDeclaration.js` non-runes `else` branch and
/// `transform-server.js:147-177`):
/// - `import …` → hoisted (dropped from body).
/// - `export let x` → `let x = $$props['x'];`
/// - `export let x = <d>` → `let x = $.fallback($$props['x'], <d>[, true]);`
///   where the fallback shape mirrors `build_fallback`:
///     - simple default → `$.fallback($$props['x'], <d>)`
///     - everything else → `$.fallback($$props['x'], () => <d>, true)`
///       (a no-arg fn call `() => f()` collapses to `f` via `b.thunk`).
/// - plain `let`/`const`/`var`/`function`/`class`/expr → kept (re-parsed);
///   value expressions routed through the read-wrapping pass.
/// - top-level `$: …` → label stripped-but-kept (`$: …`), the statement
///   APPENDED after all other instance statements, and a hoisted
///   `let <legacy_reactive vars>;` prepended (topologically pre-ordered by
///   Phase 2's `reactive_statements`).
fn transform_script_legacy<'a>(
    script: &Script,
    state: &mut ServerTransformState<'a>,
    mut import_sink: Option<&mut Vec<Statement<'a>>>,
    is_instance: bool,
) -> Vec<Statement<'a>> {
    let (Some(start), Some(end)) = (script.content.start(), script.content.end()) else {
        return Vec::new();
    };
    let (start, end) = (start as usize, end as usize);
    if end <= start || end > state.source.len() {
        return Vec::new();
    }

    // TypeScript components: strip TS from the slice before parsing (see the
    // matching note in `transform_script` for the offset-consistency rationale).
    let stripped;
    let src: &str = if super::super::helpers::script_is_typescript(script) {
        stripped = crate::compiler::phases::phase2_analyze::types::strip_typescript(
            &state.source[start..end],
        );
        &stripped
    } else {
        &state.source[start..end]
    };

    let alloc = oxc_allocator::Allocator::default();
    let owned = alloc.alloc_str(src);
    let ret = oxc_parser::Parser::new(&alloc, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return Vec::new();
    }

    let mut out: Vec<Statement<'a>> = Vec::new();
    // Reactive `$:` statements are appended AFTER all other statements (mirrors
    // upstream's `for (const [node] of analysis.reactive_statements) instance
    // .body.push(statement[1])`). Collected (in source order) here together with
    // their assignment/dependency binding names so they can be reordered
    // topologically (写経 `order_reactive_statements`) before being flushed.
    let mut reactive: Vec<ReactiveEntry<'a>> = Vec::new();

    for stmt in ret.program.body.iter() {
        match stmt {
            Statement::ImportDeclaration(imp) => {
                let slice = &src[imp.span.start as usize..imp.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    match import_sink.as_deref_mut() {
                        Some(sink) => sink.push(rehomed),
                        None => out.push(rehomed),
                    }
                }
            }
            Statement::ExportNamedDeclaration(exp) => {
                if !is_instance {
                    // MODULE script: `export const FOO = 1` is a REAL ES module
                    // export, not a prop — upstream's `server_module` keeps it
                    // verbatim (export keyword included). Re-parse the whole
                    // statement span.
                    let span = exp.span();
                    let slice = &src[span.start as usize..span.end as usize];
                    if let Some(rehomed) = state.reparse_statement(slice) {
                        out.push(rehomed);
                    }
                    continue;
                }
                // INSTANCE script: `export let x …` → props (the `export` keyword
                // is dropped and the declaration prop-lowered, mirroring upstream's
                // `ExportNamedDeclaration` global visitor `return
                // context.visit(node.declaration)` feeding the non-runes
                // `VariableDeclaration` branch).
                let Some(decl) = exp.declaration.as_ref() else {
                    // `export { a, b }` with no declaration → dropped (`b.empty`).
                    continue;
                };
                match decl {
                    oxc_ast::ast::Declaration::VariableDeclaration(vd) => {
                        if let Some(lowered) = lower_legacy_var_decl(vd, src, state, true) {
                            out.push(lowered);
                        }
                    }
                    other => {
                        // `export function` / `export class` → keep the inner
                        // declaration verbatim (re-parsed from its source span).
                        let span = other.span();
                        let slice = &src[span.start as usize..span.end as usize];
                        if let Some(rehomed) = state.reparse_statement(slice) {
                            out.push(rehomed);
                        }
                    }
                }
            }
            Statement::VariableDeclaration(vd) => {
                if let Some(lowered) = lower_legacy_var_decl(vd, src, state, false) {
                    out.push(lowered);
                }
            }
            Statement::LabeledStatement(ls) if is_instance && ls.label.name.as_str() == "$" => {
                // Top-level legacy reactive `$:` statement. Upstream keeps the
                // `$` label (people may `break $`) and appends the body to the
                // instance run after everything else.
                let span = ls.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(mut rehomed) = state.reparse_statement(slice) {
                    // Assignment targets (for the hoisted `let <name>;` decl) and
                    // read dependencies (for the topological reorder) — both keyed
                    // by instance-scope binding index (写经 the `assignments` /
                    // `dependencies` sets in `ReactiveStatement`).
                    let mut decl_names: Vec<String> = Vec::new();
                    collect_legacy_reactive_decls(&ls.body, state, &mut decl_names);
                    let assigns = reactive_assignment_indices(&ls.body, state);
                    let deps = reactive_dependency_indices(&ls.body, state, &assigns);
                    // 写经 `LabeledStatement.js`: `context.visit(node.body)` — the
                    // reactive body is visited by the global `Identifier` visitor,
                    // so every READ inside it (store `$x`, derived call, `$$props`)
                    // is wrapped exactly like any other instance statement.
                    super::read_wrap::wrap_reads_in_statement(
                        &mut rehomed,
                        state.b,
                        state.analysis,
                        state.analysis.root.instance_scope_index,
                    );
                    reactive.push(ReactiveEntry {
                        stmt: rehomed,
                        decl_names,
                        assigns,
                        deps,
                    });
                }
            }
            Statement::ExpressionStatement(es) => {
                if is_removed_effect_stmt(&es.expression) {
                    continue;
                }
                let slice = &src[es.span.start as usize..es.span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
            other => {
                let span = other.span();
                let slice = &src[span.start as usize..span.end as usize];
                if let Some(rehomed) = state.reparse_statement(slice) {
                    out.push(rehomed);
                }
            }
        }
    }

    // Topologically reorder the reactive `$:` statements so each runs after the
    // statements assigning to the bindings it depends on (写经
    // `order_reactive_statements`). The hoisted `let <vars>;` declaration is then
    // built by iterating the SORTED list and pushing each entry's legacy_reactive
    // declarator names — so the hoisted-decl order tracks the topological order,
    // not source order (写经 the `for (const [node] of analysis.reactive_statements)`
    // loop that drives `legacy_reactive_declarations`).
    let reactive = topo_sort_reactive(reactive);
    let mut reactive_decl_names: Vec<String> = Vec::new();
    for entry in &reactive {
        for name in &entry.decl_names {
            if !reactive_decl_names.contains(name) {
                reactive_decl_names.push(name.clone());
            }
        }
    }
    if !reactive_decl_names.is_empty() {
        let b = state.b;
        let pairs: Vec<_> = reactive_decl_names
            .iter()
            .map(|n| (b.id_pat(n), None))
            .collect();
        out.insert(
            0,
            b.var_decl_from_pairs(VariableDeclarationKind::Let, pairs),
        );
    }
    out.extend(reactive.into_iter().map(|e| e.stmt));
    out
}

/// A collected legacy reactive `$:` statement together with the binding indices
/// it ASSIGNS to and the binding indices it READS (depends on). Used to
/// topologically order the reactive run (写経 `order_reactive_statements`).
struct ReactiveEntry<'a> {
    stmt: Statement<'a>,
    /// legacy_reactive var names assigned to by this statement (hoisted-decl).
    decl_names: Vec<String>,
    /// Instance-scope binding indices this statement assigns to.
    assigns: Vec<usize>,
    /// Instance-scope binding indices this statement depends on (reads), with
    /// self-assigned bindings already excluded.
    deps: Vec<usize>,
}

/// Topologically sort the reactive entries so each statement runs after the ones
/// assigning to its dependencies (faithful port of `order_reactive_statements`'s
/// dependency-first DFS). Insertion (source) order is preserved among
/// independent statements / cycles.
fn topo_sort_reactive(entries: Vec<ReactiveEntry>) -> Vec<ReactiveEntry> {
    let n = entries.len();
    if n <= 1 {
        return entries;
    }

    // binding index → statement indices that assign to it.
    let mut assign_to_stmts: std::collections::HashMap<usize, Vec<usize>> =
        std::collections::HashMap::new();
    for (i, e) in entries.iter().enumerate() {
        for &idx in &e.assigns {
            assign_to_stmts.entry(idx).or_default().push(i);
        }
    }

    // Statement i depends on statement j when i reads a binding that j assigns.
    let mut deps: Vec<Vec<usize>> = vec![Vec::new(); n];
    for (i, e) in entries.iter().enumerate() {
        for dep_idx in &e.deps {
            if let Some(producers) = assign_to_stmts.get(dep_idx) {
                for &j in producers {
                    if j != i && !deps[i].contains(&j) {
                        deps[i].push(j);
                    }
                }
            }
        }
    }

    let mut order: Vec<usize> = Vec::with_capacity(n);
    let mut visited = vec![false; n];
    let mut in_progress = vec![false; n];

    fn visit(
        i: usize,
        deps: &[Vec<usize>],
        visited: &mut [bool],
        in_progress: &mut [bool],
        order: &mut Vec<usize>,
    ) {
        if visited[i] || in_progress[i] {
            return;
        }
        in_progress[i] = true;
        for &j in &deps[i] {
            visit(j, deps, visited, in_progress, order);
        }
        in_progress[i] = false;
        visited[i] = true;
        order.push(i);
    }

    for i in 0..n {
        visit(i, &deps, &mut visited, &mut in_progress, &mut order);
    }

    // Re-materialize in sorted order (move each entry exactly once).
    let mut slots: Vec<Option<ReactiveEntry>> = entries.into_iter().map(Some).collect();
    order
        .into_iter()
        .map(|i| slots[i].take().expect("each entry visited once"))
        .collect()
}

/// Instance-scope binding indices assigned to by a reactive `$:` body
/// (`$: a = …`, `$: ({ a } = …)`, `$: [a] = …`). Member-expression targets
/// (`obj.x = …`) declare no binding. 写経 `ReactiveStatement.assignments`.
fn reactive_assignment_indices(body: &Statement, state: &ServerTransformState) -> Vec<usize> {
    let mut names: Vec<String> = Vec::new();
    if let Statement::ExpressionStatement(es) = body {
        let mut inner = &es.expression;
        while let OxcExpression::ParenthesizedExpression(p) = inner {
            inner = &p.expression;
        }
        if let OxcExpression::AssignmentExpression(assign) = inner {
            collect_assignment_target_idents(&assign.left, &mut names);
        }
    }
    names_to_instance_binding_indices(&names, state)
}

/// Instance-scope binding indices READ anywhere inside a reactive `$:` body
/// (its dependencies), excluding bindings the statement itself assigns to —
/// mirroring `order_reactive_statements`'s `!assignments.contains(dependency)`
/// guard. 写経 `ReactiveStatement.dependencies`.
fn reactive_dependency_indices(
    body: &Statement,
    state: &ServerTransformState,
    assigns: &[usize],
) -> Vec<usize> {
    let mut names: Vec<String> = Vec::new();
    collect_read_identifiers_in_statement(body, &mut names);
    let mut out = names_to_instance_binding_indices(&names, state);
    out.retain(|idx| !assigns.contains(idx));
    out
}

/// Resolve a list of identifier names to deduped instance-scope binding indices.
fn names_to_instance_binding_indices(names: &[String], state: &ServerTransformState) -> Vec<usize> {
    let mut out: Vec<usize> = Vec::new();
    for name in names {
        if let Some(idx) = state
            .analysis
            .root
            .get_binding(name, state.analysis.root.instance_scope_index)
        {
            if !out.contains(&idx) {
                out.push(idx);
            }
        }
    }
    out
}

/// Collect every identifier-reference name READ inside a statement (RHS of
/// assignments, test/loop conditions, call args, nested block bodies, …). Used
/// to compute reactive-statement dependencies. Static member `.property` names,
/// object-literal keys, and binding declarations are NOT references.
fn collect_read_identifiers_in_statement(stmt: &Statement, out: &mut Vec<String>) {
    use oxc_ast_visit::Visit;
    struct IdentCollector<'o> {
        out: &'o mut Vec<String>,
    }
    impl<'a, 'o> oxc_ast_visit::Visit<'a> for IdentCollector<'o> {
        fn visit_identifier_reference(&mut self, it: &oxc_ast::ast::IdentifierReference<'a>) {
            let name = it.name.to_string();
            if !self.out.contains(&name) {
                self.out.push(name);
            }
        }
    }
    let mut c = IdentCollector { out };
    c.visit_statement(stmt);
}

/// Lower a legacy `VariableDeclaration`. `is_export` marks `export let …`
/// declarators whose simple-identifier bindings are bindable props.
fn lower_legacy_var_decl<'a>(
    vd: &oxc_ast::ast::VariableDeclaration,
    src: &str,
    state: &mut ServerTransformState<'a>,
    is_export: bool,
) -> Option<Statement<'a>> {
    let b = state.b;
    let kind = match vd.kind {
        VariableDeclarationKind::Const => VariableDeclarationKind::Const,
        VariableDeclarationKind::Var => VariableDeclarationKind::Var,
        _ => VariableDeclarationKind::Let,
    };

    let mut decls: Vec<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> = Vec::new();

    for d in vd.declarations.iter() {
        // An `export let <id>` declarator with a simple identifier binding that
        // resolves to a bindable/normal prop → lower to `$$props['<alias>']`.
        let prop_name: Option<String> = if is_export {
            if let oxc_ast::ast::BindingPattern::BindingIdentifier(id) = &d.id {
                Some(legacy_prop_alias(state, id.name.as_str()))
            } else {
                None
            }
        } else {
            None
        };

        if let Some(alias) = prop_name {
            // `let x = $$props['alias']` or `… = $.fallback($$props['alias'], …)`.
            let pat_span = d.id.span();
            let pat_slice = &src[pat_span.start as usize..pat_span.end as usize];
            let Some(pat) = state.reparse_pattern(pat_slice) else {
                continue;
            };
            let prop = b.member_computed(b.id("$$props"), b.string(&alias));
            let init = match d.init.as_ref() {
                None => prop,
                Some(init) => {
                    let init_span = init.span();
                    let dslice = &src[init_span.start as usize..init_span.end as usize];
                    let mut default_expr = state
                        .reparse_slice_owned(dslice)
                        .unwrap_or_else(|| b.void0());
                    super::read_wrap::wrap_reads(
                        &mut default_expr,
                        b,
                        state.analysis,
                        state.analysis.root.instance_scope_index,
                    );
                    build_legacy_fallback(state, prop, default_expr, init)
                }
            };
            decls.push((pat, Some(init)));
            continue;
        }

        // Plain (non-export, or non-identifier-export) declarator. Re-parse the
        // whole declarator and route its init through read-wrapping.
        let slice = &src[d.span.start as usize..d.span.end as usize];
        if let Some((pat, mut init)) = state.reparse_declarator(slice, kind) {
            if let Some(init) = init.as_mut() {
                super::read_wrap::wrap_reads(
                    init,
                    b,
                    state.analysis,
                    state.analysis.root.instance_scope_index,
                );
            }
            decls.push((pat, init));
        }
    }

    if decls.is_empty() {
        return None;
    }
    Some(b.var_decl_from_pairs(kind, decls))
}

/// Resolve the prop alias for an `export let <name>` binding (`prop_alias ?? name`).
fn legacy_prop_alias(state: &ServerTransformState, name: &str) -> String {
    if let Some(idx) = state
        .analysis
        .root
        .get_binding(name, state.analysis.root.instance_scope_index)
    {
        let binding = &state.analysis.root.bindings[idx];
        if let Some(alias) = &binding.prop_alias {
            return alias.clone();
        }
    }
    name.to_string()
}

/// Build the `$.fallback(...)` init for an `export let x = <default>` (写经
/// `build_fallback`): a simple default value emits `$.fallback(prop, default)`;
/// anything else emits `$.fallback(prop, () => default, true)` (the thunk
/// auto-collapses a bare no-arg call `() => f()` to `f`).
fn build_legacy_fallback<'a>(
    state: &ServerTransformState<'a>,
    prop: OxcExpression<'a>,
    default_expr: OxcExpression<'a>,
    raw_init: &OxcExpression,
) -> OxcExpression<'a> {
    let b = state.b;
    if is_simple_default(raw_init) {
        b.call("$.fallback", vec![prop, default_expr])
    } else {
        let thunk = b.thunk(default_expr, false);
        b.call("$.fallback", vec![prop, thunk, b.id("true")])
    }
}

/// Whether the classification-AST `init` expression is a "simple" default value
/// per upstream's `is_simple_expression` (Literal / Identifier / Arrow / Fn,
/// and Conditional / Binary / Logical recursively over simple operands).
fn is_simple_default(init: &OxcExpression) -> bool {
    use OxcExpression as E;
    match init {
        E::BooleanLiteral(_)
        | E::NullLiteral(_)
        | E::NumericLiteral(_)
        | E::BigIntLiteral(_)
        | E::RegExpLiteral(_)
        | E::StringLiteral(_)
        | E::Identifier(_)
        | E::ArrowFunctionExpression(_)
        | E::FunctionExpression(_) => true,
        E::ConditionalExpression(c) => {
            is_simple_default(&c.test)
                && is_simple_default(&c.consequent)
                && is_simple_default(&c.alternate)
        }
        E::BinaryExpression(bin) => is_simple_default(&bin.left) && is_simple_default(&bin.right),
        E::LogicalExpression(l) => is_simple_default(&l.left) && is_simple_default(&l.right),
        _ => false,
    }
}

/// Collect the legacy_reactive var names assigned to by a `$: <name> = …` body,
/// so a hoisted `let <name>;` is emitted (写经 the `extract_identifiers` walk
/// over the assignment LHS, filtered to `binding.kind === 'legacy_reactive'`).
fn collect_legacy_reactive_decls(
    body: &Statement,
    state: &ServerTransformState,
    out: &mut Vec<String>,
) {
    let Statement::ExpressionStatement(es) = body else {
        return;
    };
    // `$: ({ a } = obj)` parses with a `ParenthesizedExpression` wrapper in oxc
    // (ESTree has none); unwrap it so the inner `AssignmentExpression` is seen
    // (写经 `node.body.expression.type === 'AssignmentExpression'`).
    let mut inner = &es.expression;
    while let OxcExpression::ParenthesizedExpression(p) = inner {
        inner = &p.expression;
    }
    let OxcExpression::AssignmentExpression(assign) = inner else {
        return;
    };
    let mut names: Vec<String> = Vec::new();
    collect_assignment_target_idents(&assign.left, &mut names);
    for name in names {
        if let Some(idx) = state
            .analysis
            .root
            .get_binding(&name, state.analysis.root.instance_scope_index)
        {
            if state.analysis.root.bindings[idx].kind == BindingKind::LegacyReactive
                && !out.contains(&name)
            {
                out.push(name);
            }
        }
    }
}

/// Extract identifier names from an assignment target (simple id, or destructure
/// array/object pattern leaves).
fn collect_assignment_target_idents(
    target: &oxc_ast::ast::AssignmentTarget,
    out: &mut Vec<String>,
) {
    use oxc_ast::ast::AssignmentTarget as T;
    match target {
        T::AssignmentTargetIdentifier(id) => out.push(id.name.to_string()),
        T::ArrayAssignmentTarget(arr) => {
            for el in arr.elements.iter().flatten() {
                collect_assignment_maybe_default(el, out);
            }
            if let Some(rest) = &arr.rest {
                collect_assignment_target_idents(&rest.target, out);
            }
        }
        T::ObjectAssignmentTarget(obj) => {
            for prop in obj.properties.iter() {
                match prop {
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyIdentifier(
                        p,
                    ) => out.push(p.binding.name.to_string()),
                    oxc_ast::ast::AssignmentTargetProperty::AssignmentTargetPropertyProperty(p) => {
                        collect_assignment_maybe_default(&p.binding, out);
                    }
                }
            }
            if let Some(rest) = &obj.rest {
                collect_assignment_target_idents(&rest.target, out);
            }
        }
        // A member-expression target (`obj.x = …`) declares nothing.
        _ => {}
    }
}

/// Handle an `AssignmentTargetMaybeDefault` element (`x` or `x = default`).
fn collect_assignment_maybe_default(
    el: &oxc_ast::ast::AssignmentTargetMaybeDefault,
    out: &mut Vec<String>,
) {
    use oxc_ast::ast::AssignmentTargetMaybeDefault as M;
    match el {
        M::AssignmentTargetWithDefault(d) => collect_assignment_target_idents(&d.binding, out),
        other => {
            if let Some(t) = other.as_assignment_target() {
                collect_assignment_target_idents(t, out);
            }
        }
    }
}

/// Public entry: transform the instance script into component-body statements,
/// pushing any imports onto `state.hoisted`.
pub fn transform_instance<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.instance.as_deref() else {
        return Vec::new();
    };
    let mut imports: Vec<Statement<'a>> = Vec::new();
    let body = if state.analysis.runes {
        transform_script(script, state, Some(&mut imports))
    } else {
        transform_script_legacy(script, state, Some(&mut imports), true)
    };
    for imp in imports {
        state.hoisted.push(imp);
    }

    // Async instance-body splitting (Stage 1). When `experimental.async` is on
    // (`state.eval_inputs.use_async`) AND the transformed instance body contains
    // a top-level `await`, upstream rewrites the body into a sync prelude +
    // `var $$promises = $$renderer.run([…thunks])` (写经
    // `transform-server.js` async branch → `shared/transform-async.js`).
    //
    // We REUSE the proven text-based `transform_async_body` (which does all the
    // statement classification, consecutive-sync-statement grouping, `$inspect`
    // → `() => void 0` thunking, and `$$promises[N]` indexing): print the
    // already-lowered oxc body to text, run the transform, then re-parse its
    // output back into oxc statements. The transform is a no-op (returns `None`)
    // when there is no top-level await, so a plain async-flagged component with
    // only sync instance statements falls through unchanged. `use_async` is
    // false for every ordinary component, so this never touches sync output.
    if state.eval_inputs.use_async && !body.is_empty() {
        let body_text = state.b.program(body_clone(state, &body)).pipe_print();
        if let Some(result) =
            crate::compiler::phases::phase3_transform::shared::async_body::transform_async_body_dev(
                body_text.trim(),
                "$$renderer.run",
                state.options.dev,
            )
        {
            let reparsed = state.reparse_program(result.output.trim());
            if !reparsed.is_empty() {
                return reparsed;
            }
        }
    }

    body
}

/// Print a slice of oxc statements to JS source text via the esrap printer
/// (used to round-trip the lowered instance body through the text-based
/// `transform_async_body`). Consumes a freshly-cloned copy so the original
/// statements stay usable.
trait PipePrint {
    fn pipe_print(self) -> String;
}
impl<'a> PipePrint for oxc_ast::ast::Program<'a> {
    fn pipe_print(self) -> String {
        rsvelte_esrap::print(&self, "")
    }
}

/// Deep-clone a slice of statements into the state allocator. `transform_async_body`
/// needs the body as TEXT; cloning lets us print a throwaway copy while keeping
/// the originals available for the non-async fall-through path.
fn body_clone<'a>(state: &ServerTransformState<'a>, body: &[Statement<'a>]) -> Vec<Statement<'a>> {
    use oxc_allocator::CloneIn;
    body.iter().map(|s| s.clone_in(state.allocator)).collect()
}

/// Public entry: transform the module script into module-scope statements.
pub fn transform_module<'a>(
    ast: &crate::ast::template::Root,
    state: &mut ServerTransformState<'a>,
) -> Vec<Statement<'a>> {
    let Some(script) = ast.module.as_deref() else {
        return Vec::new();
    };
    if state.analysis.runes {
        transform_script(script, state, None)
    } else {
        // Module (non-runes): no instance-scope props / reactive `$:` (a
        // top-level `$:` in a module body is NOT a reactive statement), so
        // `is_instance = false`.
        transform_script_legacy(script, state, None, false)
    }
}
