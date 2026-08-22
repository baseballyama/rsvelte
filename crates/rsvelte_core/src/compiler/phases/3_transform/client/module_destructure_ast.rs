//! Destructured rune declarators in a module script (`<script module>` /
//! `.svelte.(js|ts)`).
//!
//! Upstream's `VariableDeclaration` visitor expands `let { a } = $state(1)` into
//! `let tmp = 1, a = $.proxy(tmp.a)` for every entry point alike, but the module
//! pipeline only ever rewrote the *call* — leaving `let { a } = $.state(1)`,
//! which destructures the signal object instead of its value. This pass runs the
//! same `extract_paths` expansion the instance script already gets, ahead of the
//! `$state*` / `$derived` call lowering so those find nothing left to rewrite.
//!
//! A `$derived(await …)` declarator is left alone: `module_derived_ast` owns the
//! async form.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::destructure_transforms::{
    ArrayHelperRead, extract_destructure_paths_named, unthunk_string,
};
use super::expression_utils::{contains_direct_await_in_expression, wrap_state_vars_in_expr};
use super::rune_transforms::wrap_state_value;
use super::{DERIVED_TMP_COUNTER, STATE_TMP_COUNTER};
use crate::compiler::phases::phase3_transform::shared::ast_rewrite::{self, Edit};

thread_local! {
    static MODULE_DESTRUCTURE_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Rune {
    State,
    StateRaw,
    /// Server only: upstream's server visitor has no skip arm for it, so the
    /// declarator falls through to `create_state_declarators` like `$state`.
    StateSnapshot,
    Derived,
    DerivedBy,
}

pub(super) struct ModuleDestructureConfig<'a> {
    pub state_vars: &'a [String],
    pub non_reactive_vars: &'a [String],
    pub proxy_vars: &'a [String],
    pub dev: bool,
    pub server: bool,
    /// Skip `$derived` / `$derived.by`. The server pre-pass runs before its own
    /// `$state*` call stripping, while the `$derived` lowering it shares with
    /// the client runs later with the real reactive-variable lists.
    pub state_only: bool,
}

pub(super) fn transform_module_rune_destructuring_ast(
    source: &str,
    is_ts: bool,
    config: &ModuleDestructureConfig<'_>,
) -> Option<String> {
    if memchr::memmem::find(source.as_bytes(), b"$state").is_none()
        && memchr::memmem::find(source.as_bytes(), b"$derived").is_none()
    {
        return None;
    }

    // The generated names restart per module script, and the component transform
    // this may be nested in must not see them move.
    let saved = (
        STATE_TMP_COUNTER.with(std::cell::Cell::get),
        DERIVED_TMP_COUNTER.with(std::cell::Cell::get),
        super::SCRIPT_ARRAY_COUNTER.with(std::cell::Cell::get),
    );
    STATE_TMP_COUNTER.with(|c| c.set(0));
    DERIVED_TMP_COUNTER.with(|c| c.set(0));
    super::SCRIPT_ARRAY_COUNTER.with(|c| c.set(0));

    let result = ast_rewrite::rewrite_once(
        &MODULE_DESTRUCTURE_ALLOC,
        source,
        if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        },
        ParseOptions::default(),
        false,
        |program| {
            let mut collector = Collector {
                source,
                config,
                edits: Vec::new(),
            };
            collector.visit_program(program);
            collector.edits
        },
    );

    STATE_TMP_COUNTER.with(|c| c.set(saved.0));
    DERIVED_TMP_COUNTER.with(|c| c.set(saved.1));
    super::SCRIPT_ARRAY_COUNTER.with(|c| c.set(saved.2));
    result
}

struct Collector<'a> {
    source: &'a str,
    config: &'a ModuleDestructureConfig<'a>,
    edits: Vec<Edit>,
}

impl Collector<'_> {
    fn text(&self, span: oxc_span::Span) -> &str {
        self.source[span.start as usize..span.end as usize].trim()
    }

    fn declaration_edit(&mut self, decl: &VariableDeclaration<'_>) -> Option<Edit> {
        let mut rendered: Vec<Vec<String>> = Vec::new();
        let mut matched = false;
        for declarator in &decl.declarations {
            match self.expand(declarator) {
                Some(parts) => {
                    matched = true;
                    rendered.push(parts);
                }
                None => rendered.push(vec![self.text(declarator.span()).to_string()]),
            }
        }
        if !matched {
            return None;
        }

        // The module body is re-printed by esrap, which re-decides where a
        // declarator list breaks — so the splice only has to be one legal list.
        let parts: Vec<String> = rendered.into_iter().flatten().collect();
        let start = decl.declarations.first()?.span().start;
        let end = decl.declarations.last()?.span().end;
        Some((start, end, parts.join(", ")))
    }

    /// The `name = init` declarator strings a destructured rune expands into, or
    /// `None` when this declarator is not one.
    fn expand(&self, declarator: &VariableDeclarator<'_>) -> Option<Vec<String>> {
        let is_array_pattern = match &declarator.id {
            BindingPattern::ObjectPattern(_) => false,
            BindingPattern::ArrayPattern(_) => true,
            _ => return None,
        };
        let Some(Expression::CallExpression(call)) = &declarator.init else {
            return None;
        };
        let rune = rune_of(call)?;
        if rune == Rune::StateSnapshot && !self.config.server {
            return None;
        }
        if call.arguments.len() > 1 {
            return None;
        }
        let arg = call
            .arguments
            .first()
            .and_then(|a| a.as_expression())
            .map(|a| self.text(a.span()));

        let pattern = self.text(declarator.id.span());
        let dev = self.config.dev;
        let mut paths = Vec::new();
        let mut inserts = Vec::new();
        let mut parts = Vec::new();

        match rune {
            Rune::State | Rune::StateRaw | Rune::StateSnapshot => {
                let is_raw = rune == Rune::StateRaw;
                let server = self.config.server;
                let tmp = next_state_tmp();
                parts.push(format!("{tmp} = {}", arg.unwrap_or("void 0")));
                // The server holds no signals, so its array helper is a plain
                // `$.to_array(...)` read by value rather than a `$.derived`.
                let array_read = if server {
                    ArrayHelperRead::Value
                } else {
                    ArrayHelperRead::Signal
                };
                extract_destructure_paths_named(
                    pattern,
                    &tmp,
                    array_read,
                    "$$array",
                    &mut paths,
                    &mut inserts,
                );
                let label = pattern_label("$state", is_array_pattern);
                for (name, value) in inserts {
                    let init = if server {
                        value
                    } else {
                        tag(
                            format!("$.derived(() => {value})"),
                            dev.then_some(label.as_str()),
                        )
                    };
                    parts.push(format!("{name} = {init}"));
                }
                for (name, access) in paths {
                    let init = if server {
                        access
                    } else {
                        let skip = self.config.non_reactive_vars.contains(&name);
                        state_leaf(&access, is_raw, skip, dev.then_some(name.as_str()))
                    };
                    parts.push(format!("{name} = {init}"));
                }
            }
            Rune::Derived | Rune::DerivedBy => {
                if self.config.state_only {
                    return None;
                }
                let arg = arg?;
                if contains_direct_await_in_expression(arg) {
                    return None;
                }
                let wrapped = wrap_state_vars_in_expr(
                    arg,
                    self.config.state_vars,
                    self.config.non_reactive_vars,
                    self.config.proxy_vars,
                );
                // `$derived(<identifier>)` reads its members straight off the
                // binding — only a computed value needs a `$$d` of its own.
                let bare_identifier = rune == Rune::Derived
                    && matches!(
                        call.arguments.first().and_then(|a| a.as_expression()),
                        Some(Expression::Identifier(_))
                    );
                let base = if bare_identifier {
                    wrapped.trim().to_string()
                } else {
                    let d = next_derived_tmp();
                    let init = if rune == Rune::Derived {
                        unthunk_string(&wrapped)
                    } else {
                        wrapped.trim().to_string()
                    };
                    parts.push(format!("{d} = $.derived({init})"));
                    format!("$.get({d})")
                };
                extract_destructure_paths_named(
                    pattern,
                    &base,
                    ArrayHelperRead::Signal,
                    if self.config.server {
                        "$$derived_array"
                    } else {
                        "$$array"
                    },
                    &mut paths,
                    &mut inserts,
                );
                let label = pattern_label("$derived", is_array_pattern);
                for (name, value) in inserts {
                    let init = tag(
                        format!("$.derived(() => {value})"),
                        (dev && !self.config.server).then_some(label.as_str()),
                    );
                    parts.push(format!("{name} = {init}"));
                }
                for (name, access) in paths {
                    let init = format!("$.derived(() => {access})");
                    parts.push(format!(
                        "{name} = {}",
                        tag(init, (dev && !self.config.server).then_some(name.as_str()))
                    ));
                }
            }
        }

        (!parts.is_empty()).then_some(parts)
    }
}

impl<'a> Visit<'a> for Collector<'_> {
    fn visit_variable_declaration(&mut self, decl: &VariableDeclaration<'a>) {
        // A matched declaration is emitted whole, so its subtree must not also
        // contribute an edit that would overlap the splice.
        if let Some(edit) = self.declaration_edit(decl) {
            self.edits.push(edit);
            return;
        }
        walk::walk_variable_declaration(self, decl);
    }
}

fn rune_of(call: &CallExpression<'_>) -> Option<Rune> {
    match &call.callee {
        Expression::Identifier(id) => match id.name.as_str() {
            "$state" => Some(Rune::State),
            "$derived" => Some(Rune::Derived),
            _ => None,
        },
        Expression::StaticMemberExpression(member) => {
            let Expression::Identifier(object) = &member.object else {
                return None;
            };
            match (object.name.as_str(), member.property.name.as_str()) {
                ("$state", "raw") => Some(Rune::StateRaw),
                ("$state", "snapshot") => Some(Rune::StateSnapshot),
                ("$derived", "by") => Some(Rune::DerivedBy),
                _ => None,
            }
        }
        _ => None,
    }
}

fn pattern_label(rune: &str, is_array_pattern: bool) -> String {
    let kind = if is_array_pattern {
        "iterable"
    } else {
        "object"
    };
    format!("[{rune} {kind}]")
}

fn tag(init: String, label: Option<&str>) -> String {
    match label {
        Some(label) => format!("$.tag({init}, '{label}')"),
        None => init,
    }
}

/// The leaf of a destructured `$state` / `$state.raw`. Upstream proxies before
/// it wraps in a source, and labels a non-source proxy through `$.tag_proxy`.
fn state_leaf(access: &str, is_raw: bool, skip: bool, name: Option<&str>) -> String {
    let value = wrap_state_value(access, is_raw, skip);
    match name {
        Some(_) if is_raw && skip => value,
        Some(name) if skip => format!("$.tag_proxy({value}, '{name}')"),
        Some(name) => format!("$.tag({value}, '{name}')"),
        None => value,
    }
}

fn next_state_tmp() -> String {
    let index = STATE_TMP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    if index == 0 {
        "tmp".to_string()
    } else {
        format!("tmp_{index}")
    }
}

fn next_derived_tmp() -> String {
    let index = DERIVED_TMP_COUNTER.with(|c| {
        let current = c.get();
        c.set(current + 1);
        current
    });
    if index == 0 {
        "$$d".to_string()
    } else {
        format!("$$d_{index}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(src: &str, dev: bool, non_reactive: &[&str]) -> String {
        let non_reactive: Vec<String> = non_reactive.iter().map(|s| (*s).to_string()).collect();
        let config = ModuleDestructureConfig {
            state_vars: &[],
            non_reactive_vars: &non_reactive,
            proxy_vars: &[],
            dev,
            server: false,
            state_only: false,
        };
        transform_module_rune_destructuring_ast(src, false, &config).unwrap()
    }

    #[test]
    fn expands_object_pattern_state() {
        assert_eq!(
            run("let { a } = $state(1);", false, &["a"]),
            "let tmp = 1, a = $.proxy(tmp.a);"
        );
    }

    #[test]
    fn reassigned_leaf_gets_a_source() {
        assert_eq!(
            run("let { a } = $state(1);", false, &[]),
            "let tmp = 1, a = $.state($.proxy(tmp.a));"
        );
    }

    #[test]
    fn raw_state_skips_the_proxy() {
        assert_eq!(
            run("let { a } = $state.raw([1]);", false, &["a"]),
            "let tmp = [1], a = tmp.a;"
        );
    }

    #[test]
    fn derived_identifier_argument_needs_no_temp() {
        assert_eq!(
            run("let { a } = $derived(o);", false, &[]),
            "let a = $.derived(() => o.a);"
        );
    }

    #[test]
    fn derived_expression_gets_a_temp() {
        assert_eq!(
            run("let { a } = $derived(o + 1);", false, &[]),
            "let $$d = $.derived(() => o + 1), a = $.derived(() => $.get($$d).a);"
        );
    }

    #[test]
    fn async_derived_is_left_to_the_async_pass() {
        assert!(
            transform_module_rune_destructuring_ast(
                "let { a } = $derived(await p);",
                false,
                &ModuleDestructureConfig {
                    state_vars: &[],
                    non_reactive_vars: &[],
                    proxy_vars: &[],
                    dev: false,
                    server: false,
                    state_only: false,
                },
            )
            .is_none()
        );
    }
}
