use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::Visit;
use oxc_ast_visit::walk;
use oxc_parser::ParseOptions;
use oxc_span::{GetSpan, SourceType};

use super::ast_rewrite::{self, Edit};
use super::async_derived_dev::{
    AsyncDerivedLocations, destructured_label, dev_args, first_bound_name,
};
use super::destructure_transforms::unthunk_string;
use super::expression_utils::{
    contains_direct_await_in_expression, strip_top_level_await_from_expr,
    wrap_await_with_save_in_async_derived, wrap_state_vars_in_expr,
};
use super::rune_transforms::process_derived_destructuring_pattern;
use super::{ARRAY_LOOKUP_COUNTER, SCRIPT_ARRAY_COUNTER};

thread_local! {
    static MODULE_DERIVED_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

pub(super) fn transform_module_derived_destructuring_ast(
    source: &str,
    is_ts: bool,
    state_vars: &[String],
    non_reactive_vars: &[String],
    proxy_vars: &[String],
    dev: bool,
    locations: Option<&AsyncDerivedLocations>,
) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"$derived")?;

    let saved_array_counter = SCRIPT_ARRAY_COUNTER.with(|counter| {
        let saved = counter.get();
        counter.set(0);
        saved
    });
    let saved_lookup_counter = ARRAY_LOOKUP_COUNTER.with(|counter| {
        let saved = counter.get();
        counter.set(0);
        saved
    });
    let result = ast_rewrite::rewrite_once(
        &MODULE_DERIVED_ALLOC,
        source,
        if is_ts {
            SourceType::ts().with_module(true)
        } else {
            SourceType::mjs()
        },
        ParseOptions::default(),
        false,
        |program| {
            let mut collector = ModuleDerivedCollector {
                source,
                state_vars,
                non_reactive_vars,
                proxy_vars,
                dev,
                locations,
                next_temp: 0,
                edits: Vec::new(),
            };
            collector.visit_program(program);
            collector.edits
        },
    );
    SCRIPT_ARRAY_COUNTER.with(|counter| counter.set(saved_array_counter));
    ARRAY_LOOKUP_COUNTER.with(|counter| counter.set(saved_lookup_counter));
    result
}

struct ModuleDerivedCollector<'a> {
    source: &'a str,
    state_vars: &'a [String],
    non_reactive_vars: &'a [String],
    proxy_vars: &'a [String],
    dev: bool,
    locations: Option<&'a AsyncDerivedLocations>,
    next_temp: usize,
    edits: Vec<Edit>,
}

impl<'a> ModuleDerivedCollector<'a> {
    fn replacement(&mut self, declarator: &VariableDeclarator<'_>) -> Option<Edit> {
        let init = declarator.init.as_ref()?;
        let Expression::CallExpression(call) = init else {
            return None;
        };
        let Expression::Identifier(callee) = &call.callee else {
            return None;
        };
        if callee.name != "$derived" || call.arguments.len() != 1 {
            return None;
        }
        if !matches!(
            declarator.id,
            BindingPattern::ObjectPattern(_) | BindingPattern::ArrayPattern(_)
        ) {
            return None;
        }

        let arg_span = call.arguments[0].span();
        let arg = self
            .source
            .get(arg_span.start as usize..arg_span.end as usize)?
            .trim();
        if !contains_direct_await_in_expression(arg) {
            return None;
        }
        let pattern_span = declarator.id.span();
        let pattern = self
            .source
            .get(pattern_span.start as usize..pattern_span.end as usize)?
            .trim();
        let wrapped = wrap_state_vars_in_expr(
            arg,
            self.state_vars,
            self.non_reactive_vars,
            self.proxy_vars,
        );
        let saved = wrap_await_with_save_in_async_derived(wrapped.trim());
        let inner = strip_top_level_await_from_expr(&saved);
        let nested = contains_direct_await_in_expression(&inner);
        let d_name = if self.next_temp == 0 {
            "$$d".to_string()
        } else {
            format!("$$d_{}", self.next_temp)
        };
        self.next_temp += 1;
        let label = destructured_label(matches!(declarator.id, BindingPattern::ArrayPattern(_)));
        let lookup = first_bound_name(&declarator.id).unwrap_or_default();
        let tail = dev_args(self.locations, label, &lookup);
        let mut declarations = Vec::new();
        if nested {
            if saved.trim().starts_with('{') {
                declarations.push(format!(
                    "{d_name} = await $.async_derived(async () => ({saved}){tail})"
                ));
            } else {
                declarations.push(format!(
                    "{d_name} = await $.async_derived(async () => {saved}{tail})"
                ));
            }
        } else if inner.trim().starts_with('{') {
            declarations.push(format!(
                "{d_name} = await $.async_derived(() => ({inner}){tail})"
            ));
        } else {
            declarations.push(format!(
                "{d_name} = await $.async_derived({}{tail})",
                unthunk_string(&inner)
            ));
        }
        let mut array_counter = 0;
        process_derived_destructuring_pattern(
            pattern,
            &format!("$.get({d_name})"),
            &format!("$.get({d_name})"),
            &mut declarations,
            &mut array_counter,
            self.dev.then_some(label),
        )?;
        if self.dev {
            for declaration in declarations.iter_mut().skip(1) {
                let Some((name, init)) = declaration.split_once(" = ") else {
                    continue;
                };
                if !name.starts_with("$$array") && init.starts_with("$.derived(") {
                    *declaration = format!("{name} = $.tag({init}, '{name}')");
                }
            }
        }
        Some((
            pattern_span.start,
            call.span.end,
            declarations.join(",\n\t"),
        ))
    }
}

impl<'a> Visit<'a> for ModuleDerivedCollector<'_> {
    fn visit_variable_declarator(&mut self, declarator: &VariableDeclarator<'a>) {
        walk::walk_variable_declarator(self, declarator);
        if let Some(edit) = self.replacement(declarator) {
            self.edits.push(edit);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lowers_async_object_pattern() {
        let out = transform_module_derived_destructuring_ast(
            "const { a, b } = $derived(await p);",
            false,
            &[],
            &[],
            &[],
            false,
            None,
        )
        .unwrap();
        assert_eq!(
            out,
            "const $$d = await $.async_derived(() => p),\n\ta = $.derived(() => $.get($$d).a),\n\tb = $.derived(() => $.get($$d).b);"
        );
    }

    #[test]
    fn lowers_async_array_pattern_with_local_temp_names() {
        let out = transform_module_derived_destructuring_ast(
            "const [a, b] = $derived(await p);",
            false,
            &[],
            &[],
            &[],
            true,
            None,
        )
        .unwrap();
        assert!(out.contains("$$array = $.tag("));
        assert!(!out.contains("$$array_1"));
    }
}
