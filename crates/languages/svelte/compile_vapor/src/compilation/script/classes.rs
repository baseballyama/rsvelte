use rsvelte_typescript::syntax_tree::Class;

use super::emit::ScriptRewrite;
use super::{
    FxHashMap, Kind, NodeIdentifier, SourceLocation, SyntaxTree, Verbatim, copy, rune_call,
};

impl ScriptRewrite<'_> {
    #[expect(
        clippy::too_many_arguments,
        reason = "constructor fields share the class's storage and name allocation"
    )]
    fn prepare_constructor(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        class: NodeIdentifier,
        occupied: &mut super::FxHashSet<String>,
        next: &mut usize,
        output: &mut Vec<NodeIdentifier>,
        private_fields: &mut FxHashMap<String, bool>,
    ) -> super::FxHashSet<String> {
        let mut names = super::FxHashSet::default();
        let Some(fields) = self.constructors.classes.get(&class) else {
            return names;
        };
        for field in fields {
            let name = from.name(field.property);
            let plain = self.server && matches!(field.rune, "$state" | "$state.raw");
            if name.starts_with('#') {
                private_fields.insert(name.to_owned(), !plain);
                self.constructor_storage
                    .insert(field.assignment, name.to_owned());
            } else if !plain {
                names.insert(name.to_owned());
                let hidden = fresh(occupied, next);
                self.constructor_storage
                    .insert(field.assignment, hidden.clone());
                let key = to.identifier(&hidden);
                output.push(to.class(
                    Class::Field {
                        key,
                        value: None,
                        computed: false,
                        is_static: false,
                    },
                    SourceLocation::SYNTHETIC,
                ));
                accessors(
                    from,
                    to,
                    field.property,
                    key,
                    false,
                    from.source_location(field.assignment),
                    output,
                );
            }
        }
        names
    }

    pub(super) fn constructor_assignment(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> NodeIdentifier {
        let Kind::Assign(operator, target, initializer) = from.kind(identifier) else {
            unreachable!()
        };
        let (rune, argument) = rune_call(from, initializer).expect("a checked constructor rune");
        let plain = self.server && matches!(rune, "$state" | "$state.raw");
        let target = if plain {
            copy(from, to, &mut Verbatim, target)
        } else {
            let key = to.identifier(
                self.constructor_storage
                    .get(&identifier)
                    .expect("the class allocated constructor storage"),
            );
            let this = to.this(SourceLocation::SYNTHETIC);
            to.member(this, key, false, false, from.source_location(target))
        };
        let value = if plain {
            match argument {
                Some(argument) => copy(from, to, self, argument),
                None => to.identifier("undefined"),
            }
        } else {
            super::emit::rune_value(from, to, self, rune, argument, self.tracking)
                .expect("a checked value rune produces a value")
        };
        to.assign(operator, target, value, from.source_location(identifier))
    }

    pub(super) fn class(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> NodeIdentifier {
        let Kind::Class(Class::Definition {
            name,
            superclass,
            members,
            declaration,
        }) = from.kind(identifier)
        else {
            unreachable!()
        };
        let (mut private_fields, mut occupied) = context(from, members, self.server);
        let mut output = Vec::new();
        let mut next = 0;
        let constructor_fields = self.prepare_constructor(
            from,
            to,
            identifier,
            &mut occupied,
            &mut next,
            &mut output,
            &mut private_fields,
        );
        self.private_fields.push(private_fields);
        let name = name.map(|name| copy(from, to, self, name));
        let superclass = superclass.map(|superclass| copy(from, to, self, superclass));
        for &member in members {
            if matches!(from.kind(member), Kind::Class(Class::Field { key, value: None, .. })
                if constructor_fields.contains(from.name(key)) && !from.name(key).starts_with('#'))
            {
                continue;
            }
            let Kind::Class(Class::Field {
                key,
                value: Some(value),
                computed: false,
                is_static,
            }) = from.kind(member)
            else {
                output.push(copy(from, to, self, member));
                continue;
            };
            let Some((rune, argument)) =
                rune_call(from, value).filter(|(name, _)| super::runes::value(name))
            else {
                output.push(copy(from, to, self, member));
                continue;
            };
            let plain = self.server && matches!(rune, "$state" | "$state.raw");
            let value = if plain {
                match argument {
                    Some(argument) => copy(from, to, self, argument),
                    None => to.identifier("undefined"),
                }
            } else {
                copy(from, to, self, value)
            };
            if plain
                || (matches!(from.kind(key), Kind::Identifier(_))
                    && from.name(key).starts_with('#'))
            {
                let key = copy(from, to, &mut Verbatim, key);
                output.push(field(
                    to,
                    key,
                    value,
                    is_static,
                    from.source_location(member),
                ));
                continue;
            }
            let hidden = fresh(&mut occupied, &mut next);
            let hidden = to.identifier(&hidden);
            output.push(field(
                to,
                hidden,
                value,
                is_static,
                SourceLocation::SYNTHETIC,
            ));
            accessors(
                from,
                to,
                key,
                hidden,
                is_static,
                from.source_location(member),
                &mut output,
            );
        }
        self.private_fields.pop();
        to.class(
            Class::Definition {
                name,
                superclass,
                members: &output,
                declaration,
            },
            from.source_location(identifier),
        )
    }
}

fn context(
    from: &SyntaxTree,
    members: &[NodeIdentifier],
    server: bool,
) -> (FxHashMap<String, bool>, super::FxHashSet<String>) {
    let mut private_fields = FxHashMap::default();
    let mut occupied = super::FxHashSet::default();
    for &member in members {
        let key = match from.kind(member) {
            Kind::Class(Class::Field { key, value, .. }) => {
                if matches!(from.kind(key), Kind::Identifier(_)) && from.name(key).starts_with('#')
                {
                    let reactive =
                        value
                            .and_then(|value| rune_call(from, value))
                            .is_some_and(|(name, _)| {
                                super::runes::value(name)
                                    && !(server && matches!(name, "$state" | "$state.raw"))
                            });
                    private_fields.insert(from.name(key).to_owned(), reactive);
                }
                key
            }
            Kind::Class(Class::Method { key, .. }) => key,
            _ => continue,
        };
        if matches!(from.kind(key), Kind::Identifier(_)) {
            occupied.insert(from.name(key).to_owned());
        }
    }
    (private_fields, occupied)
}

fn accessors(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    key: NodeIdentifier,
    hidden: NodeIdentifier,
    is_static: bool,
    span: SourceLocation,
    output: &mut Vec<NodeIdentifier>,
) {
    for setter in [false, true] {
        let this = to.this(SourceLocation::SYNTHETIC);
        let cell = to.member(this, hidden, false, false, SourceLocation::SYNTHETIC);
        let value = to.dot(cell, "value");
        let mut parameters = Vec::new();
        let statement = if setter {
            let parameter = to.identifier("$$value");
            parameters.push(parameter);
            let assign = to.assign(
                rsvelte_typescript::operators::AssignmentOperator::Assign,
                value,
                parameter,
                SourceLocation::SYNTHETIC,
            );
            to.expression_statement(assign)
        } else {
            to.return_(Some(value), SourceLocation::SYNTHETIC)
        };
        let body = to.block(&[statement], SourceLocation::SYNTHETIC);
        let function = to.function(
            false,
            None,
            &parameters,
            body,
            false,
            SourceLocation::SYNTHETIC,
        );
        let key = copy(from, to, &mut Verbatim, key);
        output.push(to.class(
            Class::Method {
                key,
                function,
                computed: false,
                is_static,
                getter: !setter,
                setter,
            },
            span,
        ));
    }
}

fn field(
    to: &mut SyntaxTree,
    key: NodeIdentifier,
    value: NodeIdentifier,
    is_static: bool,
    span: SourceLocation,
) -> NodeIdentifier {
    to.class(
        Class::Field {
            key,
            value: Some(value),
            computed: false,
            is_static,
        },
        span,
    )
}

fn fresh(occupied: &mut super::FxHashSet<String>, next: &mut usize) -> String {
    loop {
        let name = format!("#$$v_state_{next}");
        *next += 1;
        if occupied.insert(name.clone()) {
            return name;
        }
    }
}
