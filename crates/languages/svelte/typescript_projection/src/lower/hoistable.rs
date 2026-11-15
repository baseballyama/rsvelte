//! svelte2tsx's `HoistableInterfaces`: the instance's types that move before the render function,
//! where a module can export them, when the type of `$props()` depends on no instance value.

use oxc_ast::ast::{
    BindingPattern, Declaration, ImportDeclarationSpecifier, Program, Statement,
    TSInterfaceDeclaration, TSSignature, TSType, TSTypeName, TSTypeQuery, TSTypeQueryExprName,
    TSTypeReference,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;

use super::{Span, span};

/// What moves before the render function, in svelte2tsx's order.
pub(super) enum Hoisted {
    /// A whole statement, with its `export`.
    Statement(Span),
    /// The annotation of `$props()`, which svelte2tsx names `$$ComponentProps`.
    ComponentProps(Span),
}

#[derive(Default)]
struct Dependencies<'a> {
    types: Vec<&'a str>,
    values: Vec<&'a str>,
}

struct Declared<'a> {
    name: &'a str,
    dependencies: Dependencies<'a>,
    statement: Span,
}

#[derive(Default)]
struct Analysis<'a> {
    module_types: Vec<&'a str>,
    disallowed_types: Vec<&'a str>,
    disallowed_values: Vec<&'a str>,
    declared: Vec<Declared<'a>>,
}

/// The types to hoist, or none when svelte2tsx hoists nothing. `props` is the annotation of the
/// instance's `$props()` and `stores` the stores the component subscribes to.
pub(super) fn hoisted<'a>(
    module: Option<&'a Program<'a>>,
    instance: &'a Program<'a>,
    props: Option<&'a TSType<'a>>,
    stores: &[&'a str],
) -> Vec<Hoisted> {
    let mut analysis = Analysis::default();
    for statement in module.iter().flat_map(|program| &program.body) {
        analysis.module_statement(statement);
    }
    for statement in &instance.body {
        analysis.instance_statement(statement);
    }
    analysis.disallowed_values.extend_from_slice(stores);
    let Some(props) = props else {
        return Vec::new();
    };
    let (props_hoistable, hoistable, component_props) = match props {
        TSType::TSTypeReference(reference) => {
            let Some(name) = root(&reference.type_name) else {
                return Vec::new();
            };
            let Some(position) = analysis.declared.iter().position(|d| d.name == name) else {
                return Vec::new();
            };
            let hoistable = analysis.hoistable();
            (hoistable.contains(&position), hoistable, None)
        }
        annotation => {
            let mut dependencies = Dependencies::default();
            collect(annotation, &[], None, &mut dependencies);
            let hoistable = analysis.hoistable();
            let all = dependencies
                .types
                .iter()
                .chain(&dependencies.values)
                .all(|d| !analysis.disallowed_types.contains(d) && analysis.allowed(d));
            (all, hoistable, Some(span(annotation.span())))
        }
    };
    if !props_hoistable {
        return Vec::new();
    }
    let mut found: Vec<Hoisted> = hoistable
        .into_iter()
        .map(|index| Hoisted::Statement(analysis.declared[index].statement))
        .collect();
    found.extend(component_props.map(Hoisted::ComponentProps));
    found
}

impl<'a> Analysis<'a> {
    fn module_statement(&mut self, statement: &'a Statement<'a>) {
        if let Statement::ImportDeclaration(import) = statement {
            for specifier in import.specifiers.iter().flatten() {
                if import.import_kind.is_type() || is_type_specifier(specifier) {
                    self.module_types.push(specifier.local().name.as_str());
                }
            }
            return;
        }
        if let Some(name) = declaration(statement).and_then(type_name) {
            self.module_types.push(name);
        }
    }

    fn instance_statement(&mut self, statement: &'a Statement<'a>) {
        if let Statement::ImportDeclaration(import) = statement {
            if import.import_kind.is_type() {
                for specifier in import.specifiers.iter().flatten() {
                    self.module_types.push(specifier.local().name.as_str());
                }
            }
            return;
        }
        let Some(declaration) = declaration(statement) else {
            return;
        };
        match declaration {
            Declaration::TSInterfaceDeclaration(interface) => {
                let name = interface.id.name.as_str();
                let dependencies = interface_dependencies(interface);
                self.declare(name, dependencies, statement);
            }
            Declaration::TSTypeAliasDeclaration(alias) => {
                let name = alias.id.name.as_str();
                let generics = parameters(alias.type_parameters.as_deref());
                let mut dependencies = Dependencies::default();
                collect(
                    &alias.type_annotation,
                    &generics,
                    Some(name),
                    &mut dependencies,
                );
                self.declare(name, dependencies, statement);
            }
            Declaration::VariableDeclaration(variable) => {
                for declarator in &variable.declarations {
                    bound(&declarator.id, &mut self.disallowed_values);
                }
            }
            Declaration::FunctionDeclaration(function) => {
                if let Some(id) = &function.id {
                    self.disallowed_values.push(id.name.as_str());
                }
            }
            Declaration::ClassDeclaration(class) => {
                if let Some(id) = &class.id {
                    self.disallowed_values.push(id.name.as_str());
                }
            }
            Declaration::TSEnumDeclaration(enumeration) => {
                self.disallowed_values.push(enumeration.id.name.as_str());
            }
            Declaration::TSNamespaceDeclaration(namespace) => {
                let name = namespace.id.name.as_str();
                self.disallowed_types.push(name);
                self.disallowed_values.push(name);
            }
            _ => {}
        }
    }

    fn declare(
        &mut self,
        name: &'a str,
        dependencies: Dependencies<'a>,
        statement: &Statement<'_>,
    ) {
        if self.module_types.contains(&name) {
            // A module type of the same name shadows it.
            self.disallowed_types.push(name);
            return;
        }
        let statement = span(statement.span());
        // A second declaration replaces the first in its place, as a `Map`'s `set` does.
        match self.declared.iter_mut().find(|d| d.name == name) {
            Some(declared) => {
                declared.dependencies = dependencies;
                declared.statement = statement;
            }
            None => self.declared.push(Declared {
                name,
                dependencies,
                statement,
            }),
        }
    }

    fn allowed(&self, reference: &str) -> bool {
        !(self.disallowed_values.contains(&reference)
            || matches!(reference, "$$props" | "$$restProps" | "$$slots")
            || reference.strip_prefix('$').is_some_and(|store| {
                !store.starts_with('$') && self.disallowed_values.contains(&store)
            }))
    }

    /// `determineHoistableInterfaces`: each declaration whose dependencies hoist, in the order
    /// it becomes hoistable.
    fn hoistable(&mut self) -> Vec<usize> {
        let mut hoistable: Vec<usize> = Vec::new();
        let mut progress = true;
        while progress {
            progress = false;
            for index in 0..self.declared.len() {
                if hoistable.contains(&index) {
                    continue;
                }
                let declared = &self.declared[index];
                let mut can_hoist = true;
                let mut disallow = false;
                for dependency in &declared.dependencies.types {
                    if self.disallowed_types.contains(dependency) {
                        disallow = true;
                        can_hoist = false;
                        break;
                    }
                    if let Some(position) = self.declared.iter().position(|d| d.name == *dependency)
                        && !hoistable.contains(&position)
                    {
                        can_hoist = false;
                    }
                }
                if !disallow
                    && declared
                        .dependencies
                        .values
                        .iter()
                        .any(|value| !self.allowed(value))
                {
                    disallow = true;
                    can_hoist = false;
                }
                if disallow {
                    self.disallowed_types.push(declared.name);
                }
                if can_hoist {
                    hoistable.push(index);
                    progress = true;
                }
            }
        }
        hoistable
    }
}

fn declaration<'a>(statement: &'a Statement<'a>) -> Option<&'a Declaration<'a>> {
    match statement {
        Statement::ExportDeclaration(export) => Some(&export.declaration),
        statement => statement.as_declaration(),
    }
}

fn type_name<'a>(declaration: &'a Declaration<'a>) -> Option<&'a str> {
    match declaration {
        Declaration::TSTypeAliasDeclaration(alias) => Some(alias.id.name.as_str()),
        Declaration::TSInterfaceDeclaration(interface) => Some(interface.id.name.as_str()),
        Declaration::TSEnumDeclaration(enumeration) => Some(enumeration.id.name.as_str()),
        Declaration::TSNamespaceDeclaration(namespace) => Some(namespace.id.name.as_str()),
        _ => None,
    }
}

fn is_type_specifier(specifier: &ImportDeclarationSpecifier<'_>) -> bool {
    matches!(
        specifier,
        ImportDeclarationSpecifier::ImportSpecifier(named) if named.import_kind.is_type()
    )
}

/// The names a pattern binds.
fn bound<'a>(pattern: &'a BindingPattern<'a>, names: &mut Vec<&'a str>) {
    match pattern {
        BindingPattern::BindingIdentifier(identifier) => names.push(identifier.name.as_str()),
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                bound(&property.value, names);
            }
            if let Some(rest) = &object.rest {
                bound(&rest.argument, names);
            }
        }
        BindingPattern::ArrayPattern(array) => {
            for element in array.elements.iter().flatten() {
                bound(element, names);
            }
            if let Some(rest) = &array.rest {
                bound(&rest.argument, names);
            }
        }
        BindingPattern::AssignmentPattern(assignment) => bound(&assignment.left, names),
    }
}

fn parameters<'a>(
    declaration: Option<&'a oxc_ast::ast::TSTypeParameterDeclaration<'a>>,
) -> Vec<&'a str> {
    declaration
        .map(|d| d.params.iter().map(|p| p.name.name.as_str()).collect())
        .unwrap_or_default()
}

/// svelte2tsx reads an interface's property and index signatures and its heritage only.
fn interface_dependencies<'a>(interface: &'a TSInterfaceDeclaration<'a>) -> Dependencies<'a> {
    let name = interface.id.name.as_str();
    let generics = parameters(interface.type_parameters.as_deref());
    let mut dependencies = Dependencies::default();
    for member in &interface.body.body {
        match member {
            TSSignature::TSPropertySignature(property) => {
                if let Some(annotation) = &property.type_annotation {
                    collect(
                        &annotation.type_annotation,
                        &generics,
                        Some(name),
                        &mut dependencies,
                    );
                }
            }
            TSSignature::TSIndexSignature(index) => {
                collect(
                    &index.type_annotation.type_annotation,
                    &generics,
                    Some(name),
                    &mut dependencies,
                );
                collect(
                    &index.parameter.type_annotation.type_annotation,
                    &generics,
                    Some(name),
                    &mut dependencies,
                );
            }
            _ => {}
        }
    }
    for heritage in &interface.extends {
        if let TSTypeName::IdentifierReference(identifier) = &heritage.type_name {
            let name = identifier.name.as_str();
            if !generics.contains(&name) {
                dependencies.types.push(name);
            }
        }
        if let Some(arguments) = &heritage.type_arguments {
            for argument in &arguments.params {
                collect(argument, &generics, Some(name), &mut dependencies);
            }
        }
    }
    dependencies
}

/// `getEntityNameRoot`: `a` of `a.b.c`.
fn root<'a>(name: &TSTypeName<'a>) -> Option<&'a str> {
    match name {
        TSTypeName::IdentifierReference(identifier) => Some(identifier.name.as_str()),
        TSTypeName::QualifiedName(qualified) => root(&qualified.left),
        TSTypeName::ThisExpression(_) => None,
    }
}

/// `collectTypeDependencies`: each type a reference names and each value a `typeof` reads.
fn collect<'a>(
    node: &'a TSType<'a>,
    generics: &[&'a str],
    own: Option<&'a str>,
    dependencies: &mut Dependencies<'a>,
) {
    struct Collector<'g, 'd, 'a> {
        generics: &'g [&'a str],
        own: Option<&'a str>,
        dependencies: &'d mut Dependencies<'a>,
    }
    impl<'a> Visit<'a> for Collector<'_, '_, 'a> {
        fn visit_ts_type_reference(&mut self, it: &TSTypeReference<'a>) {
            if let Some(name) = root(&it.type_name)
                && Some(name) != self.own
                && !self.generics.contains(&name)
            {
                self.dependencies.types.push(name);
            }
            walk::walk_ts_type_reference(self, it);
        }

        fn visit_ts_type_query(&mut self, it: &TSTypeQuery<'a>) {
            let name = match &it.expr_name {
                TSTypeQueryExprName::TSImportType(_) => None,
                name => name.as_ts_type_name().and_then(root),
            };
            if let Some(name) = name {
                self.dependencies.values.push(name);
            }
            walk::walk_ts_type_query(self, it);
        }
    }
    let mut collector = Collector {
        generics,
        own,
        dependencies,
    };
    collector.visit_ts_type(node);
}
