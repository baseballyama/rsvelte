use rsvelte_svelte::compilation::compiler_syntax_tree::Snippet;

use crate::lower::client::{
    BindingIdentifier, ClientCompilationContext, Kind, NodeIdentifier, Read, SourceLocation, flag,
};

pub(super) struct Parameters {
    pub(super) arguments: Vec<NodeIdentifier>,
    pub(super) declarations: Vec<NodeIdentifier>,
    pub(super) saved_reads: Vec<(BindingIdentifier, Option<Read>)>,
}

struct Path {
    name: NodeIdentifier,
    value: NodeIdentifier,
    default: bool,
}

impl ClientCompilationContext<'_> {
    pub(in crate::lower::client::boundary) fn snippet_parameters(
        &mut self,
        snippet: &Snippet,
    ) -> Parameters {
        let parameters = self
            .compiler_syntax_tree
            .javascript_list(snippet.parameters);
        let mut arguments = Vec::with_capacity(parameters.len() + 1);
        arguments.push(self.out.identifier("$$anchor"));
        let mut result = Parameters {
            arguments,
            declarations: Vec::new(),
            saved_reads: Vec::with_capacity(parameters.len()),
        };
        for &parameter in parameters {
            self.parameter_reads(parameter, false, &mut result.saved_reads);
        }
        for (index, &parameter) in parameters.iter().enumerate() {
            if self.javascript.is_identifier(parameter) {
                let name = self.out.identifier(self.javascript.name(parameter));
                let namespace = self.out.identifier("$");
                let noop = self.out.dot(namespace, "noop");
                result
                    .arguments
                    .push(self.out.assign_pat(name, noop, SourceLocation::SYNTHETIC));
                continue;
            }
            let alias = self.out.identifier(&format!("$$arg{index}"));
            result.arguments.push(alias);
            let value = self.out.call(alias, &[], true, SourceLocation::SYNTHETIC);
            let mut paths = Vec::new();
            self.parameter_paths(
                parameter,
                value,
                false,
                &mut result.declarations,
                &mut paths,
            );
            for path in paths {
                let mut value = self.thunk(path.value);
                if path.default {
                    value = self.out.runtime("$", "derived_safe_equal", &[value]);
                }
                let name = self.out.identifier(self.javascript.name(path.name));
                result
                    .declarations
                    .push(self.out.let_(flag::LET, name, Some(value)));
            }
        }
        result
    }

    fn parameter_reads(
        &mut self,
        parameter: NodeIdentifier,
        default: bool,
        saved: &mut Vec<(BindingIdentifier, Option<Read>)>,
    ) {
        match self.javascript.kind(parameter) {
            Kind::Identifier(_) => {
                let (binding, _) = self.res.binding(parameter).expect("a parameter binding");
                self.scope = self.res.sem.bindings[binding].scope;
                saved.push((
                    binding,
                    self.reads
                        .insert(binding, if default { Read::Get } else { Read::Call }),
                ));
            }
            Kind::ObjectPattern(properties) => {
                for &property in properties {
                    let (Kind::Property { value, .. } | Kind::Rest(value)) =
                        self.javascript.kind(property)
                    else {
                        unreachable!("pattern properties")
                    };
                    self.parameter_reads(value, default, saved);
                }
            }
            Kind::ArrayPattern(elements) => {
                for &element in elements {
                    if !element.is_none() && !matches!(self.javascript.kind(element), Kind::Hole) {
                        self.parameter_reads(element, default, saved);
                    }
                }
            }
            Kind::AssignPattern(left, _) => self.parameter_reads(left, true, saved),
            Kind::Rest(argument) => self.parameter_reads(argument, default, saved),
            _ => unreachable!("a parameter pattern"),
        }
    }

    fn parameter_paths(
        &mut self,
        pattern: NodeIdentifier,
        value: NodeIdentifier,
        default: bool,
        inserts: &mut Vec<NodeIdentifier>,
        paths: &mut Vec<Path>,
    ) {
        match self.javascript.kind(pattern) {
            Kind::Identifier(_) => paths.push(Path {
                name: pattern,
                value,
                default,
            }),
            Kind::ObjectPattern(properties) => {
                let mut excluded = Vec::new();
                if properties
                    .iter()
                    .any(|&property| matches!(self.javascript.kind(property), Kind::Rest(_)))
                {
                    for &property in properties {
                        if let Kind::Property { key, computed, .. } = self.javascript.kind(property)
                        {
                            let key = if !computed && self.javascript.is_identifier(key) {
                                self.out.write_string(self.javascript.name(key))
                            } else if matches!(
                                self.javascript.kind(key),
                                Kind::String | Kind::Number(_)
                            ) {
                                let key = self
                                    .res
                                    .evaluate(self.javascript, self.source_text, key)
                                    .value
                                    .to_javascript_string();
                                self.out.write_string(&key)
                            } else {
                                let key = self.expression(key);
                                let string = self.out.identifier("String");
                                self.out.call0(string, &[key])
                            };
                            excluded.push(key);
                        }
                    }
                }
                for &property in properties {
                    match self.javascript.kind(property) {
                        Kind::Property {
                            key,
                            value: pattern,
                            computed,
                            ..
                        } => {
                            let computed = computed || !self.javascript.is_identifier(key);
                            let key = if computed {
                                self.expression(key)
                            } else {
                                self.out.identifier(self.javascript.name(key))
                            };
                            let value = self.out.grouped(value);
                            let value = self.out.member(
                                value,
                                key,
                                computed,
                                false,
                                SourceLocation::SYNTHETIC,
                            );
                            self.parameter_paths(pattern, value, default, inserts, paths);
                        }
                        Kind::Rest(pattern) => {
                            let excluded = self.out.array(&excluded, SourceLocation::SYNTHETIC);
                            let value =
                                self.out
                                    .runtime("$", "exclude_from_object", &[value, excluded]);
                            self.parameter_paths(pattern, value, default, inserts, paths);
                        }
                        _ => unreachable!("pattern properties"),
                    }
                }
            }
            Kind::ArrayPattern(elements) => {
                self.array_parameter(elements, value, default, inserts, paths);
            }
            Kind::AssignPattern(pattern, fallback) => {
                let simple =
                    crate::lower::javascript::is_simple_expression(self.javascript, fallback);
                let fallback = self.expression(fallback);
                let fallback = if simple {
                    fallback
                } else {
                    self.thunk(fallback)
                };
                let mut arguments = vec![value, fallback];
                if !simple {
                    arguments.push(self.tru());
                }
                let value = self.out.runtime("$", "fallback", &arguments);
                self.parameter_paths(pattern, value, true, inserts, paths);
            }
            _ => unreachable!("a parameter pattern"),
        }
    }

    fn array_parameter(
        &mut self,
        elements: &[NodeIdentifier],
        value: NodeIdentifier,
        default: bool,
        inserts: &mut Vec<NodeIdentifier>,
        paths: &mut Vec<Path>,
    ) {
        let mut arguments = vec![value];
        if !elements.last().is_some_and(|&element| {
            !element.is_none() && matches!(self.javascript.kind(element), Kind::Rest(_))
        }) {
            arguments.push(
                self.write_number(u32::try_from(elements.len()).expect("a file has u32 positions")),
            );
        }
        let value = self.out.runtime("$", "to_array", &arguments);
        let thunk = self.thunk(value);
        let derived = self.out.runtime("$", "derived", &[thunk]);
        let name = self.names.generate("$$array");
        let identifier = self.out.identifier(&name);
        inserts.push(self.out.let_(flag::VAR, identifier, Some(derived)));
        for (index, &element) in elements.iter().enumerate() {
            if element.is_none() || matches!(self.javascript.kind(element), Kind::Hole) {
                continue;
            }
            let identifier = self.out.identifier(&name);
            let array = self.out.runtime("$", "get", &[identifier]);
            let index = self.write_number(u32::try_from(index).expect("a file has u32 positions"));
            let (pattern, value) = if let Kind::Rest(pattern) = self.javascript.kind(element) {
                let slice = self.out.dot(array, "slice");
                (pattern, self.out.call0(slice, &[index]))
            } else {
                (
                    element,
                    self.out
                        .member(array, index, true, false, SourceLocation::SYNTHETIC),
                )
            };
            self.parameter_paths(pattern, value, default, inserts, paths);
        }
    }
}
