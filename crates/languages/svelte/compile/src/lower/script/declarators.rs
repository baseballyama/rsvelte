use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::ast::{BindingPattern, Expression, VariableDeclaration, VariableDeclarator};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::SymbolId;

use super::super::derived::{Created, callback, keeps_callee};
use super::super::javascript::without_typescript;
use super::super::names::Names;
use super::super::paths::{Destructure, Paths};
use super::{ScriptRewrite, Target, should_proxy_read};
use crate::lower::builder::Runtime;

/// Lowers a `$state`, `$state.raw`, `$derived` or `$derived.by` declarator at any depth in
/// place; `false` when `d` is none of them.
pub(super) fn lower_value_declarator<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    d: &mut VariableDeclarator<'o>,
) -> bool {
    let Some(init) = &d.init else {
        return false;
    };
    // Upstream erases types before it reads a rune: `$derived(x) as T` is `$derived(x)`.
    let Some((rune, argument)) = rw.res.rune(init.get_inner_expression()) else {
        return false;
    };
    // Upstream's server declares these as their argument, which is what the server reads anyway;
    // its `$state.snapshot` (an alias, not a copy) and `$effect.pending` (`undefined`, not `0`)
    // there are bugs this port does not repeat.
    if rw.target == Target::Server
        && matches!(rune, "$state.eager" | "$host")
        && d.id.is_binding_identifier()
    {
        let mut value = rune_argument(rw, d);
        rw.visit_expression(&mut value);
        d.init = Some(value);
        return true;
    }
    if !matches!(rune, "$state" | "$state.raw" | "$derived" | "$derived.by") {
        return false;
    }
    // What the value is decided on is the argument as written, before the rewrite reads it.
    let argument = argument.map(Expression::get_inner_expression);
    let proxy = rune == "$state" && argument.is_some_and(|a| should_proxy_read(rw.res, a));
    let keeps = rune == "$derived"
        && keeps_callee(rw.res, argument, Created::Script(super::super::span_of(d)));
    let mut value = rune_argument(rw, d);
    rw.visit_expression(&mut value);
    walk_mut::walk_binding_pattern(rw, &mut d.id);
    let signal = (d.id.get_binding_identifier())
        .and_then(|identifier| identifier.symbol_id.get())
        .is_some_and(|symbol| rw.res.is_state_source(symbol));
    let lowering = Lowering {
        proxy,
        signal,
        keeps,
    };
    d.init = Some(rune_value(rw, rune, Some(value), lowering));
    true
}

/// A declaration in a script's function that destructures a `$state` or `$derived`, split as at
/// the top level; `false` when it destructures none.
pub(super) fn lower_destructured_declaration<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    it: &mut VariableDeclaration<'o>,
) -> bool {
    let destructured = |d: &VariableDeclarator<'_>| {
        if d.id.is_binding_identifier() {
            return None;
        }
        let init = d.init.as_ref()?;
        match rw.res.rune(init.get_inner_expression())? {
            ("$derived" | "$derived.by", _) => Some(false),
            ("$state" | "$state.raw", _) => Some(true),
            _ => None,
        }
    };
    let Some(names) = rw.names else {
        return false;
    };
    if !it.declarations.iter().any(|d| destructured(d).is_some()) {
        return false;
    }
    let b = rw.b;
    let declarations = it.declarations.take_in(b);
    let mut out = Vec::with_capacity(declarations.len());
    for mut d in declarations {
        match destructured(&d) {
            Some(true) => lower_destructured_state(rw, &d, &mut out, names),
            Some(false) => lower_destructured_derived(rw, &d, &mut out, names),
            None => {
                rw.visit_variable_declarator(&mut d);
                out.push(d);
            }
        }
    }
    it.declarations = oxc_allocator::Vec::from_iter_in(out, b);
    true
}

/// Upstream's destructured `$state` or `$state.raw`: the value in a `temporary`, each array the
/// pattern holds in a derived on the client, then each name, a state where it is reassigned.
pub(super) fn lower_destructured_state<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    d: &VariableDeclarator<'_>,
    out: &mut Vec<VariableDeclarator<'o>>,
    names: &Names,
) {
    let b = rw.b;
    let init = d.init.as_ref().expect("a rune initialises the declarator");
    let Some((rune, argument)) = rw.res.rune(init.get_inner_expression()) else {
        unreachable!("the caller found the rune")
    };
    let temporary = names.generate("tmp");
    let value = argument.map_or_else(
        || b.void0(),
        |argument| rw.expression(argument.get_inner_expression()),
    );
    out.push(b.declarator(b.binding(&temporary), Some(value)));
    let client = rw.target == Target::Client;
    let mut paths = Vec::new();
    {
        let hooks = Hooks {
            rw: &mut *rw,
            names,
            array: "$$array",
            out: &mut *out,
            rest: None,
            derived: client,
        };
        let mut walker = Paths {
            b,
            res: hooks.rw.res,
            hooks,
        };
        walker.extract(&d.id, b.id(&temporary), false, &mut paths);
    }
    for path in paths {
        let binding = path.binding.clone_in_with_semantic_ids(b.allocator());
        let signal = (binding.symbol_id.get()).is_some_and(|symbol| rw.res.is_state_source(symbol));
        // Upstream proxies each path, as none is a value `should_proxy` keeps.
        let lowering = Lowering {
            proxy: rune == "$state",
            signal,
            keeps: false,
        };
        let value = if client {
            rune_value(rw, rune, Some(path.value), lowering)
        } else {
            path.value
        };
        let pattern = BindingPattern::BindingIdentifier(oxc_allocator::Box::new_in(binding, b));
        out.push(b.declarator(pattern, Some(value)));
    }
}

/// The rune call's argument, taken from `d`, or `undefined`; upstream erases its types too, so
/// `$derived(x as T)` may keep `x`.
fn rune_argument<'o>(rw: &ScriptRewrite<'_, 'o>, d: &mut VariableDeclarator<'o>) -> Expression<'o> {
    let b = rw.b;
    let Some(Expression::CallExpression(mut call)) = d.init.take().map(without_typescript) else {
        unreachable!("a rune is a call")
    };
    call.arguments.first_mut().map_or_else(
        || b.void0(),
        |argument| without_typescript(argument.take_in(b).into_expression()),
    )
}

/// How a declaration lowers its state or derived rune.
#[derive(Clone, Copy)]
pub(super) struct Lowering {
    /// `$state` makes a deep proxy of its value.
    pub proxy: bool,
    /// The client keeps the state in a signal, not as its plain value.
    pub signal: bool,
    /// `$derived(f())` may pass `f` itself.
    pub keeps: bool,
}

/// Upstream's value of `$state`, `$state.raw`, `$derived` or `$derived.by` where it declares a
/// variable or a class field; `value` is the argument, already rewritten.
pub(super) fn rune_value<'o>(
    rw: &ScriptRewrite<'_, 'o>,
    rune: &str,
    value: Option<Expression<'o>>,
    lowering: Lowering,
) -> Expression<'o> {
    let b = rw.b;
    match rune {
        "$state" | "$state.raw" if rw.target == Target::Client => {
            let value = if lowering.proxy {
                value.map(|v| b.runtime("proxy", [v]))
            } else {
                value
            };
            match value {
                Some(value) if !lowering.signal => value,
                value => b.runtime("state", value),
            }
        }
        "$state" | "$state.raw" => value.unwrap_or_else(|| b.void0()),
        "$derived" => {
            let value = value.expect("validation keeps a derived's argument");
            let callback = b.arrow(b.parameters([]), value);
            let callback = if lowering.keeps {
                super::super::builder::unthunk(callback)
            } else {
                callback
            };
            b.runtime("derived", [callback])
        }
        _ => b.runtime("derived", value),
    }
}

/// Upstream's destructured `$derived`: one derived of the whole value, unless it is a name
/// `$derived` reads, then a derived of each array the pattern holds, then one of each name.
pub(super) fn lower_destructured_derived<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    d: &VariableDeclarator<'_>,
    out: &mut Vec<VariableDeclarator<'o>>,
    names: &Names,
) {
    let b = rw.b;
    let init = d.init.as_ref().expect("a rune initialises the declarator");
    let Some((rune, argument)) = rw.res.rune(init.get_inner_expression()) else {
        unreachable!("the caller found the rune")
    };
    let argument = argument
        .expect("validation keeps a destructured derived's argument")
        .get_inner_expression();
    let mut rest = None;
    let value = if rune == "$derived"
        && let Expression::Identifier(identifier) = argument
    {
        rest = rw.res.symbol(identifier);
        rw.expression(argument)
    } else {
        let name = names.generate("$$d");
        let value = rw.expression(argument);
        let value = if rune == "$derived" {
            let created = Created::Script(super::super::span_of(d));
            callback(b, rw.res, Some(argument), value, created)
        } else {
            value
        };
        out.push(b.declarator(b.binding(&name), Some(b.runtime("derived", [value]))));
        read_derived(rw, &name)
    };
    let array = match rw.target {
        Target::Client => "$$array",
        Target::Server => "$$derived_array",
    };
    let mut paths = Vec::new();
    let mut walker = Paths {
        b,
        res: rw.res,
        hooks: Hooks {
            rw,
            names,
            array,
            out,
            rest,
            derived: true,
        },
    };
    walker.extract(&d.id, value, false, &mut paths);
    for path in paths {
        let binding = path.binding.clone_in_with_semantic_ids(b.allocator());
        let pattern = BindingPattern::BindingIdentifier(oxc_allocator::Box::new_in(binding, b));
        out.push(b.declarator(pattern, Some(b.runtime("derived", [b.thunk(path.value)]))));
    }
}

/// A destructured derived keeps each array in a derived of its own.
struct Hooks<'w, 'r, 'o> {
    rw: &'w mut ScriptRewrite<'r, 'o>,
    names: &'w Names,
    array: &'static str,
    out: &'w mut Vec<VariableDeclarator<'o>>,
    /// The name `$derived` reads when it is the value destructured.
    rest: Option<SymbolId>,
    /// Each array is a derived; the server's destructured state keeps plain values.
    derived: bool,
}

impl<'a, 'o> Destructure<'a, 'o> for Hooks<'_, '_, 'o> {
    fn rewrite(&mut self, e: &'a Expression<'a>) -> Expression<'o> {
        self.rw.expression(e)
    }

    fn reads_props(&self, object: &Expression<'o>, key: &str) -> bool {
        let rw = &self.rw;
        rw.target == Target::Client
            && rw.rest_reads.is_some()
            && matches!(object, Expression::Identifier(_))
            && self
                .rest
                .is_some_and(|symbol| super::super::rest_reads::reads_props(rw.res, symbol, key))
    }

    fn array(&mut self, value: Expression<'o>) -> Expression<'o> {
        let b = self.rw.b;
        let name = self.names.generate(self.array);
        if !self.derived {
            self.out.push(b.declarator(b.binding(&name), Some(value)));
            return b.id(&name);
        }
        let derived = b.runtime("derived", [b.arrow(b.parameters([]), value)]);
        self.out.push(b.declarator(b.binding(&name), Some(derived)));
        read_derived(self.rw, &name)
    }
}

/// How the script reads a derived this lowering declares.
fn read_derived<'o>(rw: &ScriptRewrite<'_, 'o>, name: &str) -> Expression<'o> {
    let b = rw.b;
    match rw.target {
        Target::Client => b.runtime("get", [b.id(name)]),
        Target::Server => b.call(b.id(name), []),
    }
}
