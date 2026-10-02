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
) -> NodeIdentifier {
    let javascript = &c.javascript;
    let statements: &[NodeIdentifier] = match javascript.kind(c.program) {
        Kind::Program(body) => body,
        _ => unreachable!("a script parses to a program"),
    };
    let mut runes = (false, false, false);
    for &s in statements {
        if let Kind::VariableDeclaration { declarations, .. } = javascript.kind(s) {
            for &d in declarations {
                if let Kind::Declarator {
                    initializer: Some(i),
                    ..
                } = javascript.kind(d)
                {
                    match rune_call(javascript, i).map(|(r, _)| r) {
                        Some("$state") => runes.0 = true,
                        Some("$state.raw") => runes.1 = true,
                        Some("$derived" | "$derived.by") => runes.2 = true,
                        _ => {}
                    }
                }
            }
        }
    }
    let mut body = Vec::new();
    let mut specs = Vec::new();
    for (used, imported, local) in [
        (runes.0, "ref", "$$ref"),
        (runes.1, "shallowRef", "$$shallowRef"),
        (runes.2, "computed", "$$computed"),
    ] {
        if used {
            let i = to.identifier(imported);
            let l = to.identifier(local);
            specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
        }
    }
    if plan.rest.is_some() {
        let i = to.identifier("useAttrs");
        let l = to.identifier("$$useAttrs");
        specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
    }
    if let Some(local) = plan.on_mount {
        let i = to.identifier("onMounted");
        let l = to.ident(javascript.name(local), javascript.source_location(local));
        specs.push(to.import_named(i, l, false, SourceLocation::SYNTHETIC));
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
        let entries: Vec<NodeIdentifier> = props
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
        let declaration = to.object(&entries, SourceLocation::SYNTHETIC);
        let callee = to.identifier("defineProps");
        let call = to.call0(callee, &[declaration]);
        let name = to.identifier("$$props");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    if plan.rest.is_some() {
        let callee = to.identifier("$$useAttrs");
        let call = to.call0(callee, &[]);
        let name = to.identifier("$$attrs");
        body.push(to.let_(flag::CONST, name, Some(call)));
    }
    body.extend(helpers::declarations(helpers, to));
    let mut rewriter = ScriptRewrite { resolution };
    for &s in statements {
        match javascript.kind(s) {
            Kind::Import { .. } => {}
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
    to.program(&body, SourceLocation::SYNTHETIC)
}

/// One declarator as its own statement: a rune as Vue's reactivity, `$props()` as nothing (its
/// keys are in `defineProps`), anything else copied.
pub(super) fn declarator(
    javascript: &SyntaxTree,
    kind: u8,
    d: NodeIdentifier,
    rewriter: &mut ScriptRewrite<'_>,
    to: &mut SyntaxTree,
) -> Option<NodeIdentifier> {
    let Kind::Declarator {
        identifier,
        initializer,
    } = javascript.kind(d)
    else {
        unreachable!("a declarator")
    };
    let rune = initializer.and_then(|i| rune_call(javascript, i));
    let Some((rune, arg)) = rune else {
        let target = copy(javascript, to, rewriter, identifier);
        let value = initializer.map(|i| copy(javascript, to, rewriter, i));
        let declaration = to.declarator(target, value, javascript.source_location(d));
        return Some(to.var_declaration(kind, &[declaration], javascript.source_location(d)));
    };
    let value = match rune {
        "$props" => return None,
        "$state" | "$state.raw" => {
            let local = if rune == "$state" {
                "$$ref"
            } else {
                "$$shallowRef"
            };
            let callee = to.identifier(local);
            let arguments: Vec<NodeIdentifier> = arg
                .iter()
                .map(|&a| copy(javascript, to, rewriter, a))
                .collect();
            to.call0(callee, &arguments)
        }
        "$derived" => {
            let a = copy(javascript, to, rewriter, arg?);
            let f = to.arrow(&[], a, true, false, SourceLocation::SYNTHETIC);
            let callee = to.identifier("$$computed");
            to.call0(callee, &[f])
        }
        "$derived.by" => {
            let a = copy(javascript, to, rewriter, arg?);
            let callee = to.identifier("$$computed");
            to.call0(callee, &[a])
        }
        _ => unreachable!("checked by plan"),
    };
    let name = to.ident(
        javascript.name(identifier),
        javascript.source_location(identifier),
    );
    Some(to.let_(flag::CONST, name, Some(value)))
}

/// Script references: `x.value` for `$state` and `$derived`, `$$props.<key>` for props.
pub(super) struct ScriptRewrite<'a> {
    resolution: &'a Resolution,
}

impl ScriptRewrite<'_> {
    fn reference(
        &self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        let (b, info) = self.resolution.binding(identifier)?;
        if self.resolution.sem.bindings[b].node == identifier {
            return None;
        }
        match info.kind {
            BindingKind::State
            | BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::DerivedBy => {
                let x = to.ident(from.name(identifier), from.source_location(identifier));
                Some(to.dot(x, "value"))
            }
            BindingKind::Property => prop_member(self.resolution, from, to, identifier),
            _ => None,
        }
    }
}

impl Rewrite for ScriptRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
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

/// `$$props.<key>` for a reference to a prop, `$$attrs` for the rest; `None` for anything else.
pub fn prop_member(
    resolution: &Resolution,
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    identifier: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let (b, info) = resolution.binding(identifier)?;
    if resolution.sem.bindings[b].node == identifier {
        return None;
    }
    if info.kind == BindingKind::RestProperty {
        return Some(to.ident("$$attrs", from.source_location(identifier)));
    }
    if info.kind != BindingKind::Property {
        return None;
    }
    let key = from.name(info.prop_key?);
    let object = to.identifier("$$props");
    let property = to.ident(key, SourceLocation::SYNTHETIC);
    Some(to.member(
        object,
        property,
        false,
        false,
        from.source_location(identifier),
    ))
}
