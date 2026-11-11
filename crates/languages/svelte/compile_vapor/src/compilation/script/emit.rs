//! The `<script setup>` program: Vue imports, the options and props macros, the helpers, then the
//! script's statements, copied and rewritten by [`ScriptRewrite`].

mod custom_element;
mod props;
mod rewrite;
mod rune_values;
use props::prop_declarations;
pub(crate) use props::prop_member;
pub(crate) use rewrite::ScriptRewrite;
pub(crate) use rune_values::{rune_value, tracked};

use oxc_ast::ast::{
    Declaration, Program, Statement,
};
use oxc_span::SPAN;
use rsvelte_typescript_compile::build::Builder;

use super::{BindingKind, Plan, Resolution};
use crate::compilation::{import, statements};
use crate::helpers::{self, Helper};

/// What decides the imports and helpers of the program.
struct Uses {
    state: bool,
    raw: bool,
    derived: bool,
    bindable: bool,
    prop_cells: bool,
}

impl Uses {
    fn new(res: &Resolution, plan: &Plan) -> Self {
        let mut uses = Self {
            state: plan.core_values.contains("$state"),
            raw: plan.core_values.contains("$state.raw"),
            derived: plan.core_values.contains("$derived")
                || plan.core_values.contains("$derived.by"),
            bindable: false,
            prop_cells: false,
        };
        for symbol in res.scoping().symbol_ids() {
            match res.binding(symbol).kind {
                BindingKind::State => uses.state = true,
                BindingKind::RawState => uses.raw = true,
                BindingKind::Derived | BindingKind::DerivedBy => uses.derived = true,
                BindingKind::BindableProperty => uses.bindable = true,
                _ => {}
            }
            uses.prop_cells |= super::prop_cell(res, symbol);
        }
        uses
    }
}

/// The `vue` imports the program's helpers read.
fn imports<'t>(
    b: &Builder<'t>,
    plan: &Plan,
    helpers: &[Helper],
    uses: &Uses,
    server: bool,
) -> Option<Statement<'t>> {
    let state_helpers = uses.state || uses.bindable;
    let mut specs: Vec<(&str, String)> = Vec::new();
    for (used, imported, local) in [
        (uses.state && server, "shallowRef", "$$ref"),
        (
            (state_helpers && !server) || uses.derived,
            "customRef",
            "$$createState",
        ),
        (uses.raw || uses.prop_cells, "shallowRef", "$$shallowRef"),
        (uses.derived || uses.prop_cells, "computed", "$$createDerived"),
        (
            plan.auxiliary.contains_key("$host") && !server && plan.custom_element.is_none(),
            "useHost",
            "$$useHost",
        ),
        (plan.props_id.is_some(), "useId", "$$props_id"),
        (plan.rest.is_some(), "useAttrs", "$$useAttrs"),
    ] {
        if used {
            specs.push((imported, local.to_owned()));
        }
    }
    let mut prefixed = |names: &[&'static str]| {
        for &name in names {
            specs.push((name, format!("$${name}")));
        }
    };
    if uses.derived
        || uses.prop_cells
        || !plan.auxiliary.is_empty()
        || helpers.contains(&Helper::Lifecycle)
        || helpers.contains(&Helper::CustomElementData)
        || helpers.contains(&Helper::Await)
        || !plan.lifecycle.is_empty()
        || !plan.attachments.is_empty()
        || helpers.contains(&Helper::Group)
    {
        prefixed(&[
            "watchEffect",
            "watchPostEffect",
            "effectScope",
            "ReactiveEffect",
        ]);
    }
    if helpers.contains(&Helper::Await) && !uses.raw {
        specs.push(("shallowRef", "$$shallowRef".to_owned()));
    }
    let scope_imports = helpers.contains(&Helper::Lifecycle)
        || helpers.contains(&Helper::Group)
        || !plan.attachments.is_empty()
        || plan.auxiliary.contains_key("$effect")
        || plan.auxiliary.contains_key("$effect.pre");
    if scope_imports {
        specs.push(("watch", "$$watch".to_owned()));
        specs.push(("onScopeDispose", "$$onScopeDispose".to_owned()));
    }
    if !plan.lifecycle.is_empty() {
        specs.push(("onMounted", "$$onMounted".to_owned()));
        if !scope_imports {
            specs.push(("onScopeDispose", "$$onScopeDispose".to_owned()));
        }
        specs.push(("nextTick", "$$nextTick".to_owned()));
    }
    (!specs.is_empty()).then(|| {
        import(
            b,
            specs.iter().map(|(imported, local)| (*imported, local.as_str())),
            "vue",
        )
    })
}

/// The program's head: imports, the options and props macros, and the helpers its statements
/// call.
fn head<'t>(
    rw: &mut ScriptRewrite<'_, 't>,
    plan: &Plan,
    helpers: &[Helper],
    body: &mut Vec<Statement<'t>>,
) {
    let (b, res, server) = (rw.b, rw.res, rw.server);
    let uses = Uses::new(res, plan);
    body.extend(imports(b, plan, helpers, &uses, server));
    let options = b.object([b.init("inheritAttrs", b.boolean(false))]);
    body.push(b.stmt(b.call(b.id("defineOptions"), [options])));
    if let Some(props) = &plan.props {
        let mut entries: Vec<_> = props
            .iter()
            .map(|(name, symbol, literal)| {
                let default = literal
                    .then(|| res.binding(*symbol).initial)
                    .flatten()
                    .map(|d| b.init("default", rw.verbatim(d)));
                b.init(name, b.object(default))
            })
            .collect();
        if uses.bindable {
            entries.push(b.init("__rsvelte_bindings", b.object([])));
        }
        let call = b.call(b.id("defineProps"), [b.object(entries)]);
        body.push(b.const_("$$props", call));
    }
    if plan.auxiliary.contains_key("$host") && !server {
        let host = if plan.custom_element.is_some() {
            "$$custom_element_host"
        } else {
            "$$useHost"
        };
        body.push(b.const_("$$host_value", b.call(b.id(host), [])));
        body.push(b.const_("$$host", b.arrow(b.params([]), b.id("$$host_value"))));
    }
    if uses.prop_cells {
        body.extend(statements(b, include_str!("props.js")));
        prop_declarations(rw, body);
    }
    if plan.rest.is_some() {
        body.extend(statements(b, include_str!("rest.js")));
        let attrs = b.call(b.id("$$rest_props"), [b.call(b.id("$$useAttrs"), [])]);
        body.push(b.const_("$$attrs", attrs));
    }
    body.extend(helpers::declarations(helpers, b));
    if plan.async_values && server {
        body.extend(statements(
            b,
            "const $$async_derived = async (getter) => ({ value: await getter() });",
        ));
    }
    if plan.core_patterns {
        body.extend(statements(b, include_str!("patterns.js")));
    }
    if (uses.state || uses.bindable) && !server {
        body.extend(statements(b, include_str!("state.js")));
    }
    if uses.derived {
        body.extend(statements(b, include_str!("derived.js")));
        let make = b.call(b.id("$$make_derived"), [b.boolean(server)]);
        body.push(b.const_("$$computed", make));
    }
    if uses.prop_cells
        || !plan.auxiliary.is_empty()
        || !plan.lifecycle.is_empty()
        || !plan.attachments.is_empty()
        || helpers.contains(&Helper::Lifecycle)
        || helpers.contains(&Helper::ResizeBinding)
        || helpers.contains(&Helper::CustomElementData)
        || helpers.contains(&Helper::WindowScroll)
    {
        body.extend(statements(b, super::runes::SOURCE));
    }
    imported_names(rw, plan, body);
}

/// The local names of the Svelte imports, bound to what implements them.
fn imported_names<'t>(rw: &ScriptRewrite<'_, 't>, plan: &Plan, body: &mut Vec<Statement<'t>>) {
    let (b, res, server) = (rw.b, rw.res, rw.server);
    let local = |symbol| res.scoping().symbol_name(symbol);
    if !plan.lifecycle.is_empty() {
        body.extend(statements(b, include_str!("lifecycle.js")));
        for &(imported, symbol) in &plan.lifecycle {
            let value = if imported == "onDestroy" && server {
                let push = b.member(b.id("$$destroy"), "push");
                b.arrow(b.params(["$$callback"]), b.call(push, [b.id("$$callback")]))
            } else {
                b.id(match imported {
                    "onMount" if server => "$$on_mount_server",
                    "onMount" => "$$on_mount",
                    "onDestroy" => "$$onScopeDispose",
                    "tick" => "$$nextTick",
                    "untrack" => "$$untrack",
                    _ => unreachable!("a checked Svelte import"),
                })
            };
            body.push(b.const_(local(symbol), value));
        }
    }
    if !plan.attachments.is_empty() {
        body.extend(statements(b, include_str!("attachments.js")));
        for &(imported, symbol) in &plan.attachments {
            let value = b.id(match imported {
                "createAttachmentKey" => "$$create_attachment_key",
                "fromAction" => "$$from_action",
                _ => unreachable!("a checked Svelte import"),
            });
            body.push(b.const_(local(symbol), value));
        }
    }
}

/// The `<script setup>` program's statements.
pub(crate) fn emit<'t>(
    rw: &mut ScriptRewrite<'_, 't>,
    instance: Option<&Program<'_>>,
    plan: &Plan,
    helpers: &[Helper],
) -> Vec<Statement<'t>> {
    let mut body = Vec::new();
    head(rw, plan, helpers, &mut body);
    for s in instance.iter().flat_map(|p| &p.body) {
        let s = match s {
            Statement::ExportDeclaration(e) => match &e.declaration {
                Declaration::VariableDeclaration(d) => {
                    top_level(rw, d, &mut body);
                    continue;
                }
                d => rw.declaration(d),
            },
            Statement::ImportDeclaration(i) => {
                if i.import_kind.is_value()
                    && !matches!(
                        i.source.value.as_str(),
                        Some("svelte" | "svelte/attachments")
                    )
                {
                    body.push(rw.verbatim_statement(s));
                }
                continue;
            }
            Statement::VariableDeclaration(d) => {
                top_level(rw, d, &mut body);
                continue;
            }
            s => rw.statement(s),
        };
        body.extend(s);
    }
    if !rw.server && !plan.exposed.is_empty() {
        body.push(super::exports::expose(rw.b, rw.res, &plan.exposed));
    }
    if !rw.server && plan.custom_element.is_some() {
        body.push(custom_element::bindings(rw));
    }
    body
}

/// Each declarator of a top-level declaration as its own statement.
fn top_level<'t>(
    rw: &mut ScriptRewrite<'_, 't>,
    d: &oxc_ast::ast::VariableDeclaration<'_>,
    body: &mut Vec<Statement<'t>>,
) {
    for declarator in &d.declarations {
        body.extend(super::declarations::declarator(rw, d.kind, declarator));
    }
}

/// The module script's program: an exported `$state` is stored under a name of its own, and
/// exported as a snapshot of that name's value.
pub(crate) fn module<'t>(rw: &mut ScriptRewrite<'_, 't>, program: &Program<'_>) -> Vec<Statement<'t>> {
    let b = rw.b;
    let mut output = Vec::new();
    for statement in &program.body {
        let Statement::ExportDeclaration(e) = statement else {
            output.extend(rw.statement(statement));
            continue;
        };
        let Declaration::VariableDeclaration(d) = &e.declaration else {
            output.extend(rw.statement(statement));
            continue;
        };
        for declarator in &d.declarations {
            let lowered = super::declarations::declarator(rw, d.kind, declarator)
                .expect("a module export has a declaration");
            let storage = declarator
                .id
                .get_binding_identifier()
                .and_then(|id| rw.storage_name(id.symbol_id.get()?));
            if let Some(storage) = storage {
                let name = declarator
                    .id
                    .get_binding_identifier()
                    .expect("checked")
                    .name
                    .as_str();
                output.push(lowered);
                let value = b.member(b.id(storage), "value");
                let declaration = b.declaration(
                    d.kind,
                    [b.declarator(b.binding(name), Some(value))],
                );
                output.push(export(b, declaration));
            } else {
                output.push(export(b, lowered));
            }
        }
    }
    output
}

/// `export <declaration>`.
fn export<'t>(b: &Builder<'t>, declaration: Statement<'t>) -> Statement<'t> {
    let Statement::VariableDeclaration(d) = declaration else {
        unreachable!("an exported declaration")
    };
    Statement::new_export_declaration(SPAN, Declaration::VariableDeclaration(d), b)
}
