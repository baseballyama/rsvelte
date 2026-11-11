use oxc_ast::AstKind;
use oxc_ast::ast::{Expression, ObjectPropertyKind, VariableDeclarationKind};
use oxc_span::SPAN;

use super::ClientCompilationContext;
use crate::lower::BindingKind;
use crate::lower::builder::Runtime;
use crate::lower::script::Export;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream's `component_returned_object`: each export read as the instance reads it, with
    /// a setter for a name the instance can write.
    pub(super) fn export_properties(&self, exports: &[Export<'_>]) -> Vec<ObjectPropertyKind<'o>> {
        let b = self.b;
        let read = self.rewriter(false);
        let mut properties = Vec::with_capacity(exports.len());
        for export in exports {
            let (name, alias) = (export.name, export.alias);
            let Some(symbol) = export.symbol else {
                properties.push(b.init(alias, b.id(name)));
                continue;
            };
            let value = read.read_symbol(symbol, name, SPAN);
            let kind = self.res.binding(symbol).kind;
            let setter = match &value {
                // Upstream declares a class as a `let`.
                None if matches!(self.res.declaration(symbol), AstKind::Class(_))
                    || matches!(
                        self.res.variable_kind(symbol),
                        Some(VariableDeclarationKind::Let | VariableDeclarationKind::Var)
                    ) =>
                {
                    Some(b.stmt(b.assign_name(name, b.id("$$value"))))
                }
                None => {
                    properties.push(b.init(alias, b.id(name)));
                    continue;
                }
                Some(_) => match kind {
                    BindingKind::Property | BindingKind::BindableProperty => {
                        Some(b.stmt(b.call(b.id(name), [b.id("$$value")])))
                    }
                    BindingKind::State | BindingKind::RawState => {
                        let value = if kind == BindingKind::State {
                            b.runtime("proxy", [b.id("$$value")])
                        } else {
                            b.id("$$value")
                        };
                        Some(b.stmt(b.runtime("set", [b.id(name), value])))
                    }
                    _ => None,
                },
            };
            let value: Expression<'o> = value.unwrap_or_else(|| b.id(name));
            properties.push(b.getter(alias, value));
            if let Some(setter) = setter {
                let parameters = b.params(["$$value"]);
                properties.push(b.accessor(
                    oxc_ast::ast::PropertyKind::Set,
                    alias,
                    parameters,
                    [setter],
                ));
            }
        }
        properties
    }
}
