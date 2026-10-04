mod custom_element;
mod props;
mod rune_values;
use props::prop_declarations;
pub use props::prop_member;
pub(crate) use rune_values::{rune_value, tracked};

use super::declarations::declarator;
use super::{
    BindingKind, Component, Helper, Kind, NodeIdentifier, Plan, Resolution, Rewrite,
    SourceLocation, SyntaxTree, Verbatim, copy, flag, helpers, rune_call,
};

/// The `<script setup>` program: Vue imports, the options and props macros, the helpers, then
/// the script's statements.
#[expect(
    clippy::too_many_lines,
    reason = "the program in output order, one statement kind at a time"
)]
pub fn emit(
    c: &Component,
    resolution: &Resolution,
    plan: &Plan,
    helpers: &[Helper],
    to: &mut SyntaxTree,
    server: bool,
    source_text: &str,
) -> NodeIdentifier {
    let javascript = &c.javascript;
    let statements: &[NodeIdentifier] = match javascript.kind(c.program) {
        Kind::Program(body) => body,
        _ => unreachable!("a script parses to a program"),
    };
    let mut runes = (
        plan.core_values.contains("$state"),
        plan.core_values.contains("$state.raw"),
        plan.core_values.contains("$derived") || plan.core_values.contains("$derived.by"),
    );
    for binding in &resolution.bindings {
        match binding.kind {
            BindingKind::State => runes.0 = true,
            BindingKind::RawState => runes.1 = true,
            BindingKind::Derived | BindingKind::DerivedBy => runes.2 = true,
            _ => {}
        }
    }
    let bindable = resolution
        .bindings
        .iter()
        .any(|binding| binding.kind == BindingKind::BindableProperty);
    let state_helpers = runes.0 || bindable;
    let prop_cells = resolution
        .bindings
        .iter_enumerated()
        .any(|(binding, _)| super::prop_cell(resolution, javascript, binding));
    let mut body = Vec::new();
    let mut specs = Vec::new();
    for (used, imported, local) in [
        (runes.0 && server, "shallowRef", "$$ref"),
        (
            (state_helpers && !server) || runes.2,
            "customRef",
            "$$createState",
        ),
        (runes.1 || prop_cells, "shallowRef", "$$shallowRef"),
        (runes.2 || prop_cells, "computed", "$$createDerived"),
    ] {
        if used {
            let i = to.identifier(imported);
            let l = to.identifier(local);
            specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
        }
    }
    if plan.auxiliary.contains_key("$host") && !server && plan.custom_element.is_none() {
        let imported = to.identifier("useHost");
        let local = to.identifier("$$useHost");
        specs.push(to.import_named(imported, local, false, SourceLocation::SYNTHETIC));
    }
    if plan.props_id.is_some() {
        let imported = to.identifier("useId");
        let local = to.identifier("$$props_id");
        specs.push(to.import_named(imported, local, false, SourceLocation::SYNTHETIC));
    }
    if plan.rest.is_some() {
        let i = to.identifier("useAttrs");
        let l = to.identifier("$$useAttrs");
        specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
    }
    if runes.2
        || prop_cells
        || !plan.auxiliary.is_empty()
        || helpers.contains(&Helper::Lifecycle)
        || helpers.contains(&Helper::CustomElementData)
        || helpers.contains(&Helper::Await)
        || !plan.lifecycle.is_empty()
        || !plan.attachments.is_empty()
        || helpers.contains(&Helper::Group)
    {
        for imported in [
            "watchEffect",
            "watchPostEffect",
            "effectScope",
            "ReactiveEffect",
        ] {
            let name = to.identifier(imported);
            let local = to.identifier(&format!("$${imported}"));
            specs.push(to.import_named(name, local, false, SourceLocation::SYNTHETIC));
        }
    }
    if helpers.contains(&Helper::Await) && !runes.1 {
        let name = to.identifier("shallowRef");
        let local = to.identifier("$$shallowRef");
        specs.push(to.import_named(name, local, false, SourceLocation::SYNTHETIC));
    }
    let scope_imports = helpers.contains(&Helper::Lifecycle)
        || helpers.contains(&Helper::Group)
        || !plan.attachments.is_empty()
        || plan.auxiliary.contains_key("$effect")
        || plan.auxiliary.contains_key("$effect.pre");
    if scope_imports {
        for imported in ["watch", "onScopeDispose"] {
            let name = to.identifier(imported);
            let local = to.identifier(&format!("$${imported}"));
            specs.push(to.import_named(name, local, false, SourceLocation::SYNTHETIC));
        }
    }
    if !plan.lifecycle.is_empty() {
        for imported in ["onMounted", "onScopeDispose", "nextTick"] {
            if imported == "onScopeDispose" && scope_imports {
                continue;
            }
            let name = to.identifier(imported);
            let local = to.identifier(&format!("$${imported}"));
            specs.push(to.import_named(name, local, false, SourceLocation::SYNTHETIC));
        }
    }
    if !specs.is_empty() {
        let source = to.write_string("vue");
        body.push(to.import(&specs, source, false, SourceLocation::SYNTHETIC));
    }
    let key = to.identifier("inheritAttrs");
    let value = to.write_boolean(false, SourceLocation::SYNTHETIC);
    let option = to.property(key, value, 0, SourceLocation::SYNTHETIC);
    let options = to.object(&[option], SourceLocation::SYNTHETIC);
    let callee = to.identifier("defineOptions");
    let call = to.call0(callee, &[options]);
    body.push(to.expression_statement(call));
    if let Some(props) = &plan.props {
        let mut entries: Vec<NodeIdentifier> = props
            .iter()
            .map(|(name, default)| {
                let fields: Vec<NodeIdentifier> = default
                    .iter()
                    .map(|&d| {
                        let k = to.identifier("default");
                        let v = copy(javascript, to, &mut Verbatim, d);
                        to.property(k, v, 0, SourceLocation::SYNTHETIC)
                    })
                    .collect();
                let k = to.identifier(name);
                let v = to.object(&fields, SourceLocation::SYNTHETIC);
                to.property(k, v, 0, SourceLocation::SYNTHETIC)
            })
            .collect();
        if bindable {
            let key = to.identifier("__rsvelte_bindings");
            let value = to.object(&[], SourceLocation::SYNTHETIC);
            entries.push(to.property(key, value, 0, SourceLocation::SYNTHETIC));
        }
        let declaration = to.object(&entries, SourceLocation::SYNTHETIC);
        let callee = to.identifier("defineProps");
        let call = to.call0(callee, &[declaration]);
        let name = to.identifier("$$props");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    if plan.auxiliary.contains_key("$host") && !server {
        let callee = to.identifier(if plan.custom_element.is_some() {
            "$$custom_element_host"
        } else {
            "$$useHost"
        });
        let value = to.call0(callee, &[]);
        let name = to.identifier("$$host_value");
        body.push(to.let_(flag::CONST, name, Some(value)));
        let value = to.arrow(&[], name, true, false, SourceLocation::SYNTHETIC);
        let name = to.identifier("$$host");
        body.push(to.let_(flag::CONST, name, Some(value)));
    }
    let mut rewriter = ScriptRewrite::new(resolution, plan, server);
    if prop_cells {
        body.extend(helpers::source_declarations(include_str!("props.js"), to));
        prop_declarations(javascript, resolution, to, server, &mut body, &mut rewriter);
    }
    if plan.rest.is_some() {
        let callee = to.identifier("$$useAttrs");
        let call = to.call0(callee, &[]);
        body.extend(helpers::source_declarations(include_str!("rest.js"), to));
        let wrap = to.identifier("$$rest_props");
        let call = to.call0(wrap, &[call]);
        let name = to.identifier("$$attrs");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    body.extend(helpers::declarations(helpers, to));
    if plan.async_values && server {
        body.extend(helpers::source_declarations(
            "const $$async_derived = async (getter) => ({ value: await getter() });",
            to,
        ));
    }
    if plan.core_patterns {
        body.extend(helpers::source_declarations(
            include_str!("patterns.js"),
            to,
        ));
    }
    if state_helpers && !server {
        body.extend(helpers::source_declarations(include_str!("state.js"), to));
    }
    if runes.2 {
        body.extend(helpers::source_declarations(include_str!("derived.js"), to));
        let make = to.identifier("$$make_derived");
        let server = to.write_boolean(server, SourceLocation::SYNTHETIC);
        let value = to.call0(make, &[server]);
        let name = to.identifier("$$computed");
        body.push(to.let_(flag::CONST, name, Some(value)));
    }
    if prop_cells
        || !plan.auxiliary.is_empty()
        || !plan.lifecycle.is_empty()
        || !plan.attachments.is_empty()
        || helpers.contains(&Helper::Lifecycle)
        || helpers.contains(&Helper::ResizeBinding)
        || helpers.contains(&Helper::CustomElementData)
        || helpers.contains(&Helper::WindowScroll)
    {
        body.extend(helpers::source_declarations(super::runes::SOURCE, to));
    }
    if !plan.lifecycle.is_empty() {
        body.extend(helpers::source_declarations(
            include_str!("lifecycle.js"),
            to,
        ));
        for &(imported, local) in &plan.lifecycle {
            let name = to.ident(javascript.name(local), javascript.source_location(local));
            let value = if imported == "onDestroy" && server {
                let callback = to.identifier("$$callback");
                let callbacks = to.identifier("$$destroy");
                let push = to.dot(callbacks, "push");
                let call = to.call0(push, &[callback]);
                to.arrow(&[callback], call, true, false, SourceLocation::SYNTHETIC)
            } else {
                to.identifier(match imported {
                    "onMount" => {
                        if server {
                            "$$on_mount_server"
                        } else {
                            "$$on_mount"
                        }
                    }
                    "onDestroy" => "$$onScopeDispose",
                    "tick" => "$$nextTick",
                    "untrack" => "$$untrack",
                    _ => unreachable!(),
                })
            };
            body.push(to.let_(flag::CONST, name, Some(value)));
        }
    }
    if !plan.attachments.is_empty() {
        body.extend(helpers::source_declarations(
            include_str!("attachments.js"),
            to,
        ));
        for &(imported, local) in &plan.attachments {
            let name = to.ident(javascript.name(local), javascript.source_location(local));
            let value = to.identifier(match imported {
                "createAttachmentKey" => "$$create_attachment_key",
                "fromAction" => "$$from_action",
                _ => unreachable!(),
            });
            body.push(to.let_(flag::CONST, name, Some(value)));
        }
    }
    for &s in statements {
        let s = match javascript.kind(s) {
            Kind::ExportNamed(declaration) => declaration,
            _ => s,
        };
        match javascript.kind(s) {
            Kind::Import {
                source, type_only, ..
            } => {
                if !type_only
                    && !matches!(
                        javascript.str_value(source, source_text),
                        "svelte" | "svelte/attachments"
                    )
                {
                    body.push(copy(javascript, to, &mut Verbatim, s));
                }
            }
            Kind::VariableDeclaration { kind, declarations } => {
                for &d in declarations {
                    if let Some(statement) = declarator(javascript, kind, d, &mut rewriter, to) {
                        body.push(statement);
                    }
                }
            }
            _ => body.push(copy(javascript, to, &mut rewriter, s)),
        }
    }
    if !server && !plan.exposed.is_empty() {
        body.push(super::exports::expose(
            javascript,
            to,
            resolution,
            &plan.exposed,
        ));
    }
    if !server && plan.custom_element.is_some() {
        body.push(custom_element::bindings(
            javascript, resolution, to, &rewriter,
        ));
    }
    to.program(&body, SourceLocation::SYNTHETIC)
}

/// Script references: `x.value` for `$state` and `$derived`, `$$props.<key>` for props.
pub(super) struct ScriptRewrite<'a> {
    resolution: &'a Resolution,
    module_exports: &'a super::FxHashMap<super::BindingIdentifier, String>,
    pub(super) constructors: &'a super::constructors::Plan,
    pub(super) constructor_storage: super::FxHashMap<NodeIdentifier, String>,
    pub(super) server: bool,
    pub(super) tracking: bool,
    pub(super) private_fields: Vec<super::FxHashMap<String, bool>>,
}

impl ScriptRewrite<'_> {
    fn reference(
        &self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let (b, _) = self.resolution.binding(identifier)?;
        if self.resolution.sem.bindings[b].node == identifier {
            return None;
        }
        self.binding_value(from, to, b, identifier)
    }

    fn binding_value(
        &self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        b: super::BindingIdentifier,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let info = &self.resolution.bindings[b];
        match info.kind {
            BindingKind::State
            | BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::DerivedBy
            | BindingKind::BindableProperty => {
                let x = match self.storage_name(identifier) {
                    Some(name) => to.identifier(name),
                    None => to.ident(from.name(identifier), from.source_location(identifier)),
                };
                Some(to.dot(x, "value"))
            }
            BindingKind::Property if super::prop_cell(self.resolution, from, b) => {
                let name = to.ident(from.name(identifier), from.source_location(identifier));
                Some(to.dot(name, "value"))
            }
            BindingKind::Property | BindingKind::RestProperty => {
                if info.kind == BindingKind::RestProperty {
                    return Some(to.identifier("$$attrs"));
                }
                let key = from.name(info.prop_key?);
                let props = to.identifier("$$props");
                Some(to.dot(props, key))
            }
            _ => None,
        }
    }
}

impl<'a> ScriptRewrite<'a> {
    pub(super) fn storage_name(&self, identifier: NodeIdentifier) -> Option<&str> {
        self.module_exports
            .get(&self.resolution.sem.binding_of(identifier)?)
            .map(String::as_str)
    }

    fn new(resolution: &'a Resolution, plan: &'a Plan, server: bool) -> Self {
        Self {
            resolution,
            module_exports: &plan.module_exports,
            server,
            private_fields: Vec::new(),
            constructors: &plan.constructors,
            constructor_storage: super::FxHashMap::default(),
            tracking: plan.auxiliary.contains_key("$effect.tracking") && !server,
        }
    }
}

pub(crate) fn module(
    from: &SyntaxTree,
    program: NodeIdentifier,
    resolution: &Resolution,
    plan: &Plan,
    to: &mut SyntaxTree,
    server: bool,
) -> NodeIdentifier {
    super::module::emit(
        from,
        to,
        &mut ScriptRewrite::new(resolution, plan, server),
        program,
    )
}

impl Rewrite for ScriptRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::VariableDeclaration { .. } => {
                Some(super::declarations::statement(from, to, self, identifier))
            }
            Kind::Assign(..) if self.constructors.assignments.contains(&identifier) => {
                Some(self.constructor_assignment(from, to, identifier))
            }
            Kind::Class(rsvelte_typescript::syntax_tree::Class::Definition { .. }) => {
                Some(self.class(from, to, identifier))
            }
            Kind::Member {
                object,
                property,
                computed: false,
                optional,
            } if from.name(property).starts_with('#')
                && self
                    .private_fields
                    .iter()
                    .rev()
                    .find_map(|fields| fields.get(from.name(property)))
                    .copied()
                    == Some(true) =>
            {
                let object = copy(from, to, self, object);
                let property = copy(from, to, &mut Verbatim, property);
                let field = to.member(
                    object,
                    property,
                    false,
                    optional,
                    from.source_location(identifier),
                );
                Some(to.dot(field, "value"))
            }
            Kind::Call { arguments, .. } => {
                if let Some(value) = super::runes::inline(from, to, self, identifier) {
                    return Some(value);
                }
                if super::runes::inspect_call(from, identifier) {
                    return Some(to.identifier("undefined"));
                }
                let (name, argument) = rune_call(from, identifier)?;
                if name == "$props.id" {
                    let callee = to.identifier("$$props_id");
                    return Some(to.call0(callee, &[]));
                }
                if super::runes::value(name) {
                    let tracking = self.tracking;
                    return rune_value(from, to, self, name, argument, tracking);
                }
                if self.server && name == "$host" {
                    return Some(to.identifier("undefined"));
                }
                if self.server && name == "$effect.tracking" {
                    return Some(to.write_boolean(false, SourceLocation::SYNTHETIC));
                }
                if self.server && name == "$effect.pending" {
                    return Some(to.write_number(0.0, SourceLocation::SYNTHETIC));
                }
                if self.server && name == "$effect.root" {
                    let body = to.block(&[], SourceLocation::SYNTHETIC);
                    return Some(to.arrow(&[], body, false, false, SourceLocation::SYNTHETIC));
                }
                if name == "$inspect.trace"
                    || self.server && matches!(name, "$effect" | "$effect.pre")
                {
                    return Some(to.identifier("undefined"));
                }
                let name = super::runes::local(name)?;
                let callee = to.identifier(name);
                let arguments: Vec<_> =
                    arguments.iter().map(|&a| copy(from, to, self, a)).collect();
                Some(to.call0(callee, &arguments))
            }
            Kind::Identifier(_) => self.reference(from, to, identifier),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let (target, default) = match from.kind(value) {
                    Kind::AssignPattern(t, d) => (t, Some(d)),
                    _ => (value, None),
                };
                if !matches!(from.kind(target), Kind::Identifier(_)) {
                    return None;
                }
                let v = self.reference(from, to, target)?;
                let v = default.map_or(v, |d| {
                    let d = copy(from, to, self, d);
                    to.assign_pat(v, d, from.source_location(value))
                });
                let k = to.ident(from.name(key), from.source_location(key));
                Some(to.property(k, v, 0, from.source_location(identifier)))
            }
            _ => None,
        }
    }
}
